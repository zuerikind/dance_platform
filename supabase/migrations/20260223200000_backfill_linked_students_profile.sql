-- Backfill: for students linked via profile_student_links but missing students.user_id / student_profiles,
-- set students.user_id and sync name/email/phone from profiles to student_profiles so admin dashboard shows correct data.

-- 1. Upsert student_profiles from profiles for every profile that has a profile_student_links row
INSERT INTO public.student_profiles (user_id, name, email, phone, created_at, updated_at)
SELECT DISTINCT ON (p.id)
  p.id,
  nullif(trim(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')), ''),
  p.email,
  p.phone,
  now(),
  now()
FROM public.profile_student_links psl
JOIN public.profiles p ON p.id = psl.profile_id
ON CONFLICT (user_id) DO UPDATE SET
  name = COALESCE(nullif(trim(EXCLUDED.name), ''), student_profiles.name),
  email = COALESCE(EXCLUDED.email, student_profiles.email),
  phone = COALESCE(EXCLUDED.phone, student_profiles.phone),
  updated_at = now();

-- 2. Set students.user_id for all students that have a profile_student_links but user_id is still null
UPDATE public.students s
SET user_id = psl.profile_id
FROM public.profile_student_links psl
WHERE s.id = psl.school_student_id
  AND s.school_id = psl.school_id
  AND s.user_id IS NULL;
