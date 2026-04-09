-- Migrated from docs/STUDENT_DUPLICATE_PREVENTION_AND_CLEANUP.md (Phase A appendix)
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