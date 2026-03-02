# Students with NULL names — Analysis and Flows

## Summary

Many rows in `students` have `name = NULL`. This comes from **two distinct cases**:

### 1. By Design (Not a Bug)

**Flow:** `create_student_with_auth` (student signup with Supabase Auth)

- Name, email, phone are stored in **`student_profiles`**, not in `students`.
- The `students` row is created with `name = NULL`, `email = NULL`, `phone = NULL`.
- The `students_with_profile` view uses `COALESCE(p.name, s.name)` so the UI shows the correct name.

**Why:** One person can be a student at multiple schools. Identity (name, email, phone) lives in `student_profiles`; `students` holds school-specific enrollment data. The app and all RPCs should read from `students_with_profile`, not from `students` directly.

**Impact:** These students are **not** nameless. The UI and dashboard show their names from the profile. Inspecting the raw `students` table is misleading.

---

### 2. Real Issue (Missing Names)

**Flow:** `auto_enroll_student` (e.g. discovery user or admin enrolls at a new school)

When a user has:

- No row in `profiles`
- And is not a school admin

then `v_name` stays empty and the function inserts `NULL` into both `students` and `student_profiles`.

**Typical scenarios:**

- User created directly in Supabase Auth (e.g. via Dashboard) with no `profiles` row.
- User created before `profiles` existed.
- OAuth or other flows that create auth users but never create `profiles`.

**Impact:** These students appear as “Alumno Desconocido” / “Unknown Student” in the app.

---

## Current Flows

| Flow | Where name lives | students.name | student_profiles.name | Shown in app |
|------|------------------|---------------|-----------------------|--------------|
| Student signup (`create_student_with_auth`) | student_profiles | NULL | Set | Correct |
| Direct insert fallback (auth RPC failed) | students | Set | — | Correct |
| Admin add (`create_student_legacy`) | students | Set | — | Correct |
| Auto-enroll (profiles + admin fallback) | students + student_profiles | Set | Set | Correct |
| Auto-enroll (no profiles, not admin) | — | NULL | NULL | “Alumno Desconocido” |

---

## Recommended Fix

**1. Handle auto-enroll edge case:** When `profiles` is empty and the user is not an admin, use a fallback instead of leaving name empty:

```sql
-- In auto_enroll_student, after admin fallback, before INSERT:
IF v_name IS NULL OR trim(v_name) = '' THEN
  -- Fallback: use auth email or placeholder
  v_name := COALESCE(
    nullif(trim((auth.jwt()->>'email')::text), ''),
    'Usuario (' || left(p_user_id::text, 8) || ')'
  );
END IF;
```

**2. One-time backfill:** Run a migration to fix existing NULL-name rows that also have empty `student_profiles`:

- For rows with `user_id` set: copy `auth.users.email` (or similar) into `student_profiles` where possible.
- For rows without `user_id`: require manual update by admins, or set a placeholder like `"Alumno (ID)"`.

---

## Verification

To confirm whether NULL names are “by design” or real problems:

```sql
-- Count auth-linked students with NULL name (by design; name in profile)
SELECT count(*) FROM students s
LEFT JOIN student_profiles p ON p.user_id = s.user_id
WHERE s.user_id IS NOT NULL AND s.name IS NULL AND COALESCE(p.name, '') != '';

-- Count students truly without a name (both NULL)
SELECT count(*) FROM students s
LEFT JOIN student_profiles p ON p.user_id = s.user_id
WHERE COALESCE(s.name, p.name, '') = '';
```
