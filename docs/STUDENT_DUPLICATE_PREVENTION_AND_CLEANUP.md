# Student duplicate prevention and cleanup (safe execution guide)

This document reflects **constraints** for any work in this area:

1. **No unintended functionality change** — Keep all RPC **signatures** unchanged. Prefer behavior that only narrows failure modes (e.g. second signup call returns the same enrollment instead of inserting again). Happy paths for a single successful registration stay the same.
2. **Never delete `student_profiles`** (and do not delete `students` rows) in automated scripts until **human verification** confirms the row is unused and merged. **No bulk DELETE** in migrations for this issue.

## Verified: admin dashboard does not register students

In the current app, **new** `students` rows are created only from:

- [`signUpStudent`](app.js): `create_student_with_auth`, optional direct `students` insert, and dead-end `create_student_legacy` calls (RPC returns NULL for non-admin callers).
- [`loginStudent`](app.js): `auto_enroll_student` when `get_student_by_user_id` returns no row.

Admin UI uses [`saveStudentDetails`](app.js) (updates). Discovery profile “new password” fields are **Supabase Auth** password change, not creating enrollments.

[`supabase/STUDENT_IDS.md`](../supabase/STUDENT_IDS.md) still mentions admin “+ Alumno”; that flow is **not** present in the current client — treat the doc as outdated until corrected.

## Root causes (self-registration only)

| Cause | Effect |
|-------|--------|
| `create_student_with_auth` always `INSERT`s | Rare double-submit / retry can create two rows for the same `(user_id, school_id)` (no unique constraint). |
| `auto_enroll_student` orphan match uses `students.email` only | Legacy or odd rows with NULL `students.email` may not match; step 3 inserts a **blank** row (`password` NULL). |

## Phase A — Prevention only (recommended migration)

**Committed migration:** [`supabase/migrations/20260410140000_student_enrollment_idempotent_auto_enroll.sql`](../supabase/migrations/20260410140000_student_enrollment_idempotent_auto_enroll.sql) (timestamp after `20260410130000_get_student_registrations_include_attended.sql`). The appendix below should stay in sync with that file when editing.

**Properties:**

- **`create_student_with_auth`**: After upserting `student_profiles`, **if** a `students` row already exists for `(p_user_id, p_school_id)`, `SELECT` from `students_with_profile` and `RETURN to_jsonb(...)` (same shape as today). Otherwise perform the existing `INSERT`. **First successful registration unchanged**; only prevents a duplicate insert for the same pair.
- **`auto_enroll_student`**: Keep step 1 (existing linked row) and step 2a (`students.email` = auth email, `user_id IS NULL`) **identical in behavior**. Add **step 2b** only when 2a finds nothing: claim an orphan with NULL/blank `students.email` **only if** there is **exactly one** such row at the school whose `name` matches the signed-in user’s `student_profiles.name` (trim, lower) and `student_profiles.email` matches auth email. Then same `UPDATE` + profile upsert + `RETURN` as step 2a. Step 3 (blank insert) unchanged if nothing matches.
- **No `DELETE`**. **No `DROP`**. **Same function signatures** as today.

### Appendix: Phase A migration SQL (review, then apply via Supabase CLI or dashboard)

```sql
-- Duplicate enrollment prevention (non-breaking). No DELETE. Same RPC signatures.

CREATE OR REPLACE FUNCTION public.create_student_with_auth(
  p_user_id uuid,
  p_name text,
  p_email text,
  p_phone text,
  p_password text,
  p_school_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id text;
  new_row public.students_with_profile;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.student_profiles (user_id, name, email, phone, created_at, updated_at)
  VALUES (p_user_id, trim(p_name), nullif(trim(p_email), ''), nullif(trim(p_phone), ''), now(), now())
  ON CONFLICT (user_id) DO UPDATE SET
    name = COALESCE(nullif(trim(EXCLUDED.name), ''), student_profiles.name),
    email = COALESCE(nullif(trim(EXCLUDED.email), ''), student_profiles.email),
    phone = COALESCE(nullif(trim(EXCLUDED.phone), ''), student_profiles.phone),
    updated_at = now();

  SELECT v.* INTO new_row
  FROM public.students_with_profile v
  WHERE v.user_id = p_user_id AND v.school_id = p_school_id
  ORDER BY v.created_at ASC
  LIMIT 1;

  IF FOUND THEN
    RETURN to_jsonb(new_row);
  END IF;

  new_id := 'STUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  INSERT INTO public.students (id, name, email, phone, password, paid, package, balance, balance_private, active_packs, package_expires_at, school_id, user_id, created_at, level)
  VALUES (new_id, NULL, NULL, NULL, p_password, false, null, 0, 0, '[]'::jsonb, null, p_school_id, p_user_id, now(),
    CASE WHEN public.is_aure_school(p_school_id) THEN 'principiante' ELSE NULL END);

  SELECT v.* INTO new_row
  FROM public.students_with_profile v
  WHERE v.id = new_id AND v.school_id = p_school_id
  LIMIT 1;
  RETURN to_jsonb(new_row);
END;
$$;
COMMENT ON FUNCTION public.create_student_with_auth(uuid, text, text, text, text, uuid) IS
  'Upsert student_profiles, then return existing enrollment for (user, school) if present; else insert enrollment. Aure: default level principiante.';

CREATE OR REPLACE FUNCTION public.auto_enroll_student(p_user_id uuid, p_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing   public.students;
  v_orphan     public.students;
  v_new_id     text;
  v_name       text;
  v_email      text;
  v_phone      text;
  v_auth_email text;
  v_orphan_cnt int;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_existing
  FROM public.students
  WHERE user_id = p_user_id AND school_id = p_school_id
  LIMIT 1;

  IF FOUND THEN
    SELECT COALESCE(p.name, v_existing.name),
           COALESCE(p.email, v_existing.email),
           COALESCE(p.phone, v_existing.phone)
      INTO v_name, v_email, v_phone
      FROM public.student_profiles p
      WHERE p.user_id = p_user_id
      LIMIT 1;
    v_name  := COALESCE(v_name,  v_existing.name);
    v_email := COALESCE(v_email, v_existing.email);
    v_phone := COALESCE(v_phone, v_existing.phone);
    RETURN jsonb_build_object(
      'id',                 v_existing.id,
      'name',               v_name,
      'email',              v_email,
      'phone',              v_phone,
      'password',           v_existing.password,
      'paid',               v_existing.paid,
      'package',            v_existing.package,
      'balance',            v_existing.balance,
      'balance_private',    v_existing.balance_private,
      'active_packs',       COALESCE(v_existing.active_packs, '[]'::jsonb),
      'package_expires_at', v_existing.package_expires_at,
      'school_id',          v_existing.school_id,
      'user_id',            v_existing.user_id,
      'created_at',         v_existing.created_at
    );
  END IF;

  v_auth_email := lower(trim((SELECT email FROM auth.users WHERE id = p_user_id)));

  IF v_auth_email IS NOT NULL AND v_auth_email <> '' THEN
    SELECT * INTO v_orphan
    FROM public.students
    WHERE school_id = p_school_id
      AND user_id IS NULL
      AND lower(trim(email)) = v_auth_email
    ORDER BY created_at ASC
    LIMIT 1;

    IF FOUND THEN
      UPDATE public.students
        SET user_id = p_user_id
        WHERE id = v_orphan.id
          AND school_id = p_school_id
          AND user_id IS NULL;

      INSERT INTO public.student_profiles (user_id, name, email, phone, created_at, updated_at)
        VALUES (
          p_user_id,
          COALESCE(trim(v_orphan.name), ''),
          v_orphan.email,
          v_orphan.phone,
          now(),
          now()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          name       = COALESCE(nullif(trim(EXCLUDED.name), ''), student_profiles.name),
          email      = COALESCE(EXCLUDED.email, student_profiles.email),
          phone      = COALESCE(EXCLUDED.phone, student_profiles.phone),
          updated_at = now();

      RETURN jsonb_build_object(
        'id',                 v_orphan.id,
        'name',               v_orphan.name,
        'email',              v_orphan.email,
        'phone',              v_orphan.phone,
        'password',           v_orphan.password,
        'paid',               v_orphan.paid,
        'package',            v_orphan.package,
        'balance',            v_orphan.balance,
        'balance_private',    v_orphan.balance_private,
        'active_packs',       COALESCE(v_orphan.active_packs, '[]'::jsonb),
        'package_expires_at', v_orphan.package_expires_at,
        'school_id',          v_orphan.school_id,
        'user_id',            p_user_id,
        'created_at',         v_orphan.created_at
      );
    ELSE
      SELECT COUNT(*) INTO v_orphan_cnt
      FROM public.students s2
      INNER JOIN public.student_profiles pr ON pr.user_id = p_user_id
      WHERE s2.school_id = p_school_id
        AND s2.user_id IS NULL
        AND (s2.email IS NULL OR trim(s2.email) = '')
        AND nullif(trim(pr.name), '') IS NOT NULL
        AND lower(trim(pr.email)) = v_auth_email
        AND lower(trim(s2.name)) = lower(trim(pr.name));

      IF v_orphan_cnt = 1 THEN
        SELECT s.* INTO v_orphan
        FROM public.students s
        INNER JOIN public.student_profiles pr ON pr.user_id = p_user_id
        WHERE s.school_id = p_school_id
          AND s.user_id IS NULL
          AND (s.email IS NULL OR trim(s.email) = '')
          AND nullif(trim(pr.name), '') IS NOT NULL
          AND lower(trim(pr.email)) = v_auth_email
          AND lower(trim(s.name)) = lower(trim(pr.name))
        ORDER BY s.created_at ASC
        LIMIT 1;

        IF FOUND THEN
          UPDATE public.students
            SET user_id = p_user_id
            WHERE id = v_orphan.id
              AND school_id = p_school_id
              AND user_id IS NULL;

          INSERT INTO public.student_profiles (user_id, name, email, phone, created_at, updated_at)
            VALUES (
              p_user_id,
              COALESCE(trim(v_orphan.name), ''),
              v_orphan.email,
              v_orphan.phone,
              now(),
              now()
            )
            ON CONFLICT (user_id) DO UPDATE SET
              name       = COALESCE(nullif(trim(EXCLUDED.name), ''), student_profiles.name),
              email      = COALESCE(EXCLUDED.email, student_profiles.email),
              phone      = COALESCE(EXCLUDED.phone, student_profiles.phone),
              updated_at = now();

          RETURN jsonb_build_object(
            'id',                 v_orphan.id,
            'name',               v_orphan.name,
            'email',              v_orphan.email,
            'phone',              v_orphan.phone,
            'password',           v_orphan.password,
            'paid',               v_orphan.paid,
            'package',            v_orphan.package,
            'balance',            v_orphan.balance,
            'balance_private',    v_orphan.balance_private,
            'active_packs',       COALESCE(v_orphan.active_packs, '[]'::jsonb),
            'package_expires_at', v_orphan.package_expires_at,
            'school_id',          v_orphan.school_id,
            'user_id',            p_user_id,
            'created_at',         v_orphan.created_at
          );
        END IF;
      END IF;
    END IF;
  END IF;

  v_new_id := 'STUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  INSERT INTO public.students (
    id, name, email, phone, password, paid, package,
    balance, balance_private, active_packs, package_expires_at,
    school_id, user_id, created_at
  )
  VALUES (
    v_new_id, NULL, NULL, NULL, NULL, false, null,
    0, 0, '[]'::jsonb, null,
    p_school_id, p_user_id, now()
  );

  SELECT COALESCE(p.name,  s.name),
         COALESCE(p.email, s.email),
         COALESCE(p.phone, s.phone)
    INTO v_name, v_email, v_phone
    FROM public.students s
    LEFT JOIN public.student_profiles p ON p.user_id = s.user_id
    WHERE s.id = v_new_id AND s.school_id = p_school_id
    LIMIT 1;

  RETURN jsonb_build_object(
    'id',                 v_new_id,
    'name',               v_name,
    'email',              v_email,
    'phone',              v_phone,
    'password',           NULL,
    'paid',               false,
    'package',            NULL,
    'balance',            0,
    'balance_private',    0,
    'active_packs',       '[]'::jsonb,
    'package_expires_at', NULL,
    'school_id',          p_school_id,
    'user_id',            p_user_id,
    'created_at',         now()
  );
END;
$$;

COMMENT ON FUNCTION public.auto_enroll_student(uuid, uuid) IS
  'Enroll user at school. (1) existing linked row, (2) email-matched orphan (students.email), '
  '(2b) single orphan with blank students.email and same name as profile when profile email matches auth, '
  '(3) fresh blank row. Callable only by the signed-in user. No row deletes.';

GRANT EXECUTE ON FUNCTION public.auto_enroll_student(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.auto_enroll_student(uuid, uuid) TO authenticated;
```

If you change the appendix, copy the result into [`20260410140000_student_enrollment_idempotent_auto_enroll.sql`](../supabase/migrations/20260410140000_student_enrollment_idempotent_auto_enroll.sql) (or add a new migration) and run your usual migration flow.

### Appendix: read-only duplicate detection (`SELECT` only)

```sql
-- Same auth user, same school: more than one enrollment (should be empty after cleanup + unique index)
SELECT school_id, user_id, COUNT(*) AS n, array_agg(id ORDER BY created_at) AS student_ids
FROM public.students
WHERE user_id IS NOT NULL
GROUP BY school_id, user_id
HAVING COUNT(*) > 1;

-- Orphan rows still unlinked (review only; do not delete automatically)
SELECT s.id, s.school_id, s.name, s.email, s.user_id, s.created_at
FROM public.students s
WHERE s.user_id IS NULL
ORDER BY s.school_id, s.created_at DESC;
```

## Phase B — Observability (read-only)

Add `supabase/scripts/detect_duplicate_student_enrollments.sql` containing **only `SELECT` statements**, for example:

- Rows per `(school_id, user_id)` where `user_id IS NOT NULL` and `count(*) > 1`.
- Optional: pairs of rows with same normalized email from `student_profiles` and same `school_id` (for manual review).

**No DELETE** in this script.

## Phase C — Data merge (manual / one-off, not in blind migration)

Only after **backup** and **staging** validation:

1. For each duplicate cluster, pick a **canonical** `students.id` (document rule: e.g. row with registrations, or higher balance, or oldest — school approves).
2. `UPDATE` child tables (`class_registrations`, `payment_requests`, etc.) from duplicate id → canonical id; resolve unique conflicts manually.
3. **Do not** `DELETE FROM student_profiles` as part of merging enrollments; one profile per `auth.users` id remains the norm.
4. Only `DELETE` a redundant `students` row when FKs no longer reference it **and** operators confirm.

## Phase D — Optional unique index (after Phase C)

`CREATE UNIQUE INDEX ... ON students (school_id, user_id) WHERE user_id IS NOT NULL` **only after** duplicates are cleared, or the migration will fail.

## Code cleanup (optional, low risk)

Removing `create_student_legacy` / `link_student_auth` calls from `signUpStudent` **does not change outcomes** for students (RPC already returns NULL). Defer if you want zero client diff; the DB Phase A already addresses the main duplicate insert.

## Out of scope for automated “fix”

- Mass-deleting “empty” rows without FK and business review.
- Deleting or merging `auth.users` / `student_profiles` without explicit confirmation.
