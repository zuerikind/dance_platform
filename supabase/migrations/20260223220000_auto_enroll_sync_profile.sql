-- When a discovery user logs into a school and gets auto-enrolled, they have a profiles row
-- (first_name, last_name, email) but no student_profiles row. The view students_with_profile
-- uses student_profiles for name/email/phone, so admin saw "Alumno Desconocido".
-- Sync profiles -> student_profiles inside auto_enroll_student when creating a new enrollment,
-- and backfill existing auto-enrolled students who have user_id but no/empty profile data.

-- 1. Update auto_enroll_student: after inserting new students row, upsert student_profiles from profiles
CREATE OR REPLACE FUNCTION public.auto_enroll_student(p_user_id uuid, p_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing public.students;
  v_new_id   text;
  v_new_row  jsonb;
  v_name    text;
  v_email   text;
  v_phone   text;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_existing
  FROM public.students
  WHERE user_id = p_user_id AND school_id = p_school_id
  LIMIT 1;

  IF FOUND THEN
    SELECT COALESCE(p.name, v_existing.name), COALESCE(p.email, v_existing.email), COALESCE(p.phone, v_existing.phone)
      INTO v_name, v_email, v_phone
      FROM public.student_profiles p
      WHERE p.user_id = p_user_id
      LIMIT 1;
    v_name := COALESCE(v_name, v_existing.name);
    v_email := COALESCE(v_email, v_existing.email);
    v_phone := COALESCE(v_phone, v_existing.phone);
    RETURN jsonb_build_object(
      'id', v_existing.id,
      'name', v_name,
      'email', v_email,
      'phone', v_phone,
      'password', v_existing.password,
      'paid', v_existing.paid,
      'package', v_existing.package,
      'balance', v_existing.balance,
      'balance_private', v_existing.balance_private,
      'active_packs', COALESCE(v_existing.active_packs, '[]'::jsonb),
      'package_expires_at', v_existing.package_expires_at,
      'school_id', v_existing.school_id,
      'user_id', v_existing.user_id,
      'created_at', v_existing.created_at
    );
  END IF;

  v_new_id := 'STUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  INSERT INTO public.students (id, name, email, phone, password, paid, package, balance, balance_private, active_packs, package_expires_at, school_id, user_id, created_at)
  VALUES (v_new_id, NULL, NULL, NULL, NULL, false, null, 0, 0, '[]'::jsonb, null, p_school_id, p_user_id, now());

  -- Sync profiles -> student_profiles so admin dashboard and view show correct name/email/phone (e.g. discovery users)
  INSERT INTO public.student_profiles (user_id, name, email, phone, created_at, updated_at)
  SELECT p_user_id,
    COALESCE(NULLIF(TRIM(CONCAT(COALESCE(pr.first_name, ''), ' ', COALESCE(pr.last_name, ''))), ''), ''),
    COALESCE(pr.email, ''),
    COALESCE(pr.phone, ''),
    now(),
    now()
  FROM public.profiles pr
  WHERE pr.id = p_user_id
  ON CONFLICT (user_id) DO UPDATE SET
    name = COALESCE(NULLIF(TRIM(EXCLUDED.name), ''), student_profiles.name),
    email = COALESCE(NULLIF(TRIM(EXCLUDED.email), ''), student_profiles.email),
    phone = COALESCE(NULLIF(TRIM(EXCLUDED.phone), ''), student_profiles.phone),
    updated_at = now();

  SELECT COALESCE(p.name, s.name), COALESCE(p.email, s.email), COALESCE(p.phone, s.phone)
    INTO v_name, v_email, v_phone
    FROM public.students s
    LEFT JOIN public.student_profiles p ON p.user_id = s.user_id
    WHERE s.id = v_new_id AND s.school_id = p_school_id
    LIMIT 1;

  SELECT jsonb_build_object(
    'id', v_new_id,
    'name', v_name,
    'email', v_email,
    'phone', v_phone,
    'password', NULL,
    'paid', false,
    'package', NULL,
    'balance', 0,
    'balance_private', 0,
    'active_packs', '[]'::jsonb,
    'package_expires_at', NULL,
    'school_id', p_school_id,
    'user_id', p_user_id,
    'created_at', now()
  ) INTO v_new_row;
  RETURN v_new_row;
END;
$$;
COMMENT ON FUNCTION public.auto_enroll_student(uuid, uuid) IS 'Create enrollment for school; syncs profiles->student_profiles so discovery users show correct name in admin.';

-- 2. Backfill: for every student with user_id set, ensure student_profiles has name/email/phone from profiles (fixes existing "Alumno Desconocido")
-- Use DISTINCT ON (user_id) so we only insert/update one row per user (same user can have multiple enrollments)
INSERT INTO public.student_profiles (user_id, name, email, phone, created_at, updated_at)
SELECT DISTINCT ON (s.user_id)
  s.user_id,
  COALESCE(NULLIF(TRIM(CONCAT(COALESCE(pr.first_name, ''), ' ', COALESCE(pr.last_name, ''))), ''), ''),
  COALESCE(pr.email, ''),
  COALESCE(pr.phone, ''),
  now(),
  now()
FROM public.students s
JOIN public.profiles pr ON pr.id = s.user_id
WHERE s.user_id IS NOT NULL
ORDER BY s.user_id
ON CONFLICT (user_id) DO UPDATE SET
  name = COALESCE(NULLIF(TRIM(EXCLUDED.name), ''), student_profiles.name),
  email = COALESCE(NULLIF(TRIM(EXCLUDED.email), ''), student_profiles.email),
  phone = COALESCE(NULLIF(TRIM(EXCLUDED.phone), ''), student_profiles.phone),
  updated_at = now();
