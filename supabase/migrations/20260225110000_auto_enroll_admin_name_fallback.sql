-- When an admin (of another school) or a user with no profile name enrolls as student,
-- use admin row for name/email/phone so they don't show as "bailarín anónimo" / "Alumno Desconocido".
-- Keeps profiles -> student_profiles sync for discovery users; adds admin fallback when profile is empty.

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
  v_admin   public.admins%ROWTYPE;
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

  -- New enrollment: get name/email/phone from profiles first
  SELECT COALESCE(NULLIF(TRIM(CONCAT(COALESCE(pr.first_name, ''), ' ', COALESCE(pr.last_name, ''))), ''), ''),
         COALESCE(pr.email, ''),
         COALESCE(pr.phone, '')
    INTO v_name, v_email, v_phone
    FROM public.profiles pr
    WHERE pr.id = p_user_id
    LIMIT 1;

  -- If no name from profile (e.g. admin of another school, or discovery user with no name), use admin row
  IF v_name IS NULL OR trim(v_name) = '' THEN
    SELECT * INTO v_admin
    FROM public.admins
    WHERE user_id = p_user_id
    ORDER BY school_id
    LIMIT 1;
    IF FOUND THEN
      v_name := coalesce(nullif(trim(v_admin.display_name), ''), v_admin.username);
      v_email := coalesce(nullif(trim(v_email), ''), v_admin.email);
      v_phone := coalesce(nullif(trim(v_phone), ''), v_admin.phone);
    END IF;
  END IF;

  v_new_id := 'STUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  INSERT INTO public.students (id, name, email, phone, password, paid, package, balance, balance_private, active_packs, package_expires_at, school_id, user_id, created_at)
  VALUES (v_new_id, nullif(trim(v_name), ''), nullif(trim(v_email), ''), nullif(trim(v_phone), ''), NULL, false, null, 0, 0, '[]'::jsonb, null, p_school_id, p_user_id, now());

  -- Sync profiles -> student_profiles; use v_name/v_email/v_phone when profile is empty (admin or no profile row)
  INSERT INTO public.student_profiles (user_id, name, email, phone, created_at, updated_at)
  SELECT p_user_id,
    COALESCE(NULLIF(TRIM(CONCAT(COALESCE(pr.first_name, ''), ' ', COALESCE(pr.last_name, ''))), ''), v_name),
    COALESCE(NULLIF(TRIM(pr.email), ''), v_email),
    COALESCE(NULLIF(TRIM(pr.phone), ''), v_phone),
    now(),
    now()
  FROM public.profiles pr
  WHERE pr.id = p_user_id
  ON CONFLICT (user_id) DO UPDATE SET
    name = COALESCE(NULLIF(TRIM(EXCLUDED.name), ''), student_profiles.name),
    email = COALESCE(NULLIF(TRIM(EXCLUDED.email), ''), student_profiles.email),
    phone = COALESCE(NULLIF(TRIM(EXCLUDED.phone), ''), student_profiles.phone),
    updated_at = now();

  -- If user has no profiles row, insert student_profiles with computed values (e.g. admin-only user)
  INSERT INTO public.student_profiles (user_id, name, email, phone, created_at, updated_at)
  SELECT p_user_id, nullif(trim(v_name), ''), nullif(trim(v_email), ''), nullif(trim(v_phone), ''), now(), now()
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id)
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

COMMENT ON FUNCTION public.auto_enroll_student(uuid, uuid) IS 'Create enrollment for school; syncs profiles->student_profiles. Uses admin name/email/phone when profile is empty (e.g. admin enrolling at another school).';
