-- =============================================================================
-- Cleanup: backfill students.name, students.email, students.phone from
-- student_profiles where students.user_id is set. This makes the raw students
-- table show names in the dashboard; the app already uses students_with_profile.
-- Safe: only fills NULLs from the canonical profile; no deletes.
-- =============================================================================

UPDATE public.students s
SET
  name  = COALESCE(s.name,  p.name),
  email = COALESCE(s.email, p.email),
  phone = COALESCE(s.phone, p.phone)
FROM public.student_profiles p
WHERE p.user_id = s.user_id
  AND (s.name IS NULL OR s.email IS NULL OR s.phone IS NULL);
