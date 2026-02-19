-- Student profiles: one row per person (auth user). Enrollments (students) keep one row per school
-- but name/email/phone come from profile when user_id is set (Option A: view-based read path).

-- =============================================================================
-- 1. Create student_profiles table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.student_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.student_profiles IS 'One row per student (auth user). Name, email, phone stored once; enrollments reference by user_id.';

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student_profiles_select_own" ON public.student_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "student_profiles_insert_own" ON public.student_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "student_profiles_update_own" ON public.student_profiles FOR UPDATE USING (user_id = auth.uid());

-- =============================================================================
-- 2. Allow nullable name/email/phone on students for profile-linked enrollments
-- =============================================================================
ALTER TABLE public.students
  ALTER COLUMN name DROP NOT NULL,
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN phone DROP NOT NULL;

-- =============================================================================
-- 3. Backfill student_profiles from distinct user_id in students
-- =============================================================================
INSERT INTO public.student_profiles (user_id, name, email, phone, created_at, updated_at)
SELECT DISTINCT ON (s.user_id)
  s.user_id,
  s.name,
  s.email,
  s.phone,
  COALESCE(s.created_at, now()),
  now()
FROM public.students s
WHERE s.user_id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  name = COALESCE(excluded.name, student_profiles.name),
  email = COALESCE(excluded.email, student_profiles.email),
  phone = COALESCE(excluded.phone, student_profiles.phone),
  updated_at = now();

-- =============================================================================
-- 4. View: students with profile data (Option A)
-- =============================================================================
CREATE OR REPLACE VIEW public.students_with_profile AS
SELECT
  s.id,
  COALESCE(p.name, s.name) AS name,
  COALESCE(p.email, s.email) AS email,
  COALESCE(p.phone, s.phone) AS phone,
  s.password,
  s.paid,
  s.package,
  s.balance,
  s.balance_private,
  s.active_packs,
  s.package_expires_at,
  s.school_id,
  s.user_id,
  s.created_at
FROM public.students s
LEFT JOIN public.student_profiles p ON p.user_id = s.user_id;

COMMENT ON VIEW public.students_with_profile IS 'Students (enrollments) with name/email/phone from profile when user_id set, else from students row.';

-- RLS: allow same read as students (view uses underlying students RLS if we use security_invoker, or we grant select)
ALTER VIEW public.students_with_profile SET (security_invoker = true);
GRANT SELECT ON public.students_with_profile TO anon;
GRANT SELECT ON public.students_with_profile TO authenticated;

-- =============================================================================
-- 5. get_school_students: return from view (must DROP first when changing return type)
-- =============================================================================
DROP FUNCTION IF EXISTS public.get_school_students(uuid);
CREATE OR REPLACE FUNCTION public.get_school_students(p_school_id uuid)
RETURNS SETOF public.students_with_profile
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.* FROM public.students_with_profile v
  JOIN public.students s ON s.id = v.id AND s.school_id = v.school_id
  WHERE v.school_id = p_school_id
    AND (public.is_school_admin(p_school_id) OR public.is_platform_admin())
  ORDER BY v.name;
$$;
GRANT EXECUTE ON FUNCTION public.get_school_students(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_school_students(uuid) TO authenticated;

-- =============================================================================
-- 6. get_platform_all_data: students from view
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_platform_all_data()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RETURN '{}'::jsonb;
  END IF;
  RETURN (
    SELECT jsonb_build_object(
      'schools', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.schools ORDER BY name) t), '[]'::jsonb),
      'students', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.students_with_profile ORDER BY school_id, name) t), '[]'::jsonb),
      'admins', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.admins ORDER BY school_id, username) t), '[]'::jsonb),
      'classes', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.classes ORDER BY school_id, id) t), '[]'::jsonb),
      'subscriptions', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.subscriptions ORDER BY school_id, name) t), '[]'::jsonb),
      'payment_requests', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.payment_requests ORDER BY created_at DESC) t), '[]'::jsonb),
      'admin_settings', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.admin_settings) t), '[]'::jsonb),
      'platform_admins', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.platform_admins ORDER BY username) t), '[]'::jsonb)
    )
  );
END;
$$;

-- =============================================================================
-- 7. create_student_with_auth: upsert profile, insert enrollment without name/email/phone
-- =============================================================================
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

  new_id := 'STUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  INSERT INTO public.students (id, name, email, phone, password, paid, package, balance, balance_private, active_packs, package_expires_at, school_id, user_id, created_at)
  VALUES (new_id, NULL, NULL, NULL, p_password, false, null, 0, 0, '[]'::jsonb, null, p_school_id, p_user_id, now());

  SELECT v.* INTO new_row
  FROM public.students_with_profile v
  WHERE v.id = new_id AND v.school_id = p_school_id
  LIMIT 1;
  RETURN to_jsonb(new_row);
END;
$$;
COMMENT ON FUNCTION public.create_student_with_auth(uuid, text, text, text, text, uuid) IS 'Create profile (if needed) and enrollment; name/email/phone in profile only.';

-- =============================================================================
-- 8. auto_enroll_student: insert enrollment only (no copy of name/email/phone)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.auto_enroll_student(p_user_id uuid, p_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing public.students;
  v_new_id   text;
  v_new_row  public.students_with_profile;
BEGIN
  SELECT * INTO v_existing
  FROM public.students
  WHERE user_id = p_user_id AND school_id = p_school_id
  LIMIT 1;

  IF FOUND THEN
    SELECT v.* INTO v_new_row FROM public.students_with_profile v WHERE v.id = v_existing.id AND v.school_id = p_school_id LIMIT 1;
    RETURN to_jsonb(v_new_row);
  END IF;

  v_new_id := 'STUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  INSERT INTO public.students (id, name, email, phone, password, paid, package, balance, balance_private, active_packs, package_expires_at, school_id, user_id, created_at)
  VALUES (v_new_id, NULL, NULL, NULL, NULL, false, null, 0, 0, '[]'::jsonb, null, p_school_id, p_user_id, now());

  SELECT v.* INTO v_new_row
  FROM public.students_with_profile v
  WHERE v.id = v_new_id AND v.school_id = p_school_id
  LIMIT 1;
  RETURN to_jsonb(v_new_row);
END;
$$;
COMMENT ON FUNCTION public.auto_enroll_student(uuid, uuid) IS 'Create enrollment for school; profile already exists. Name/email/phone from view.';

-- =============================================================================
-- 9. link_student_auth: when linking, copy current name/email/phone to profile
-- =============================================================================
CREATE OR REPLACE FUNCTION public.link_student_auth(p_student_id text, p_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated public.students;
  v_student public.students%ROWTYPE;
  v_auth_email text;
  v_row public.students_with_profile;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id AND user_id IS NULL LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  v_auth_email := lower(trim(auth.jwt()->>'email'));
  IF v_auth_email IS NULL OR v_auth_email = '' THEN
    v_auth_email := '';
  END IF;
  IF NOT (
    (v_student.email IS NOT NULL AND lower(trim(v_student.email)) = v_auth_email)
    OR public.is_school_admin(p_school_id)
    OR public.is_platform_admin()
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.student_profiles (user_id, name, email, phone, created_at, updated_at)
  VALUES (auth.uid(), COALESCE(trim(v_student.name), ''), v_student.email, v_student.phone, COALESCE(v_student.created_at, now()), now())
  ON CONFLICT (user_id) DO UPDATE SET
    name = COALESCE(nullif(trim(EXCLUDED.name), ''), student_profiles.name),
    email = COALESCE(EXCLUDED.email, student_profiles.email),
    phone = COALESCE(EXCLUDED.phone, student_profiles.phone),
    updated_at = now();

  UPDATE public.students
  SET user_id = auth.uid()
  WHERE id::text = p_student_id AND school_id = p_school_id AND user_id IS NULL
  RETURNING * INTO updated;

  SELECT v.* INTO v_row FROM public.students_with_profile v WHERE v.id = updated.id AND v.school_id = updated.school_id LIMIT 1;
  RETURN to_jsonb(v_row);
END;
$$;

-- =============================================================================
-- 10. update_student_details: update profile when user_id set, else students; always update balance etc.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_student_details(
  p_student_id text,
  p_school_id uuid,
  p_name text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_password text DEFAULT NULL,
  p_balance numeric DEFAULT NULL,
  p_package_expires_at timestamptz DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;

  SELECT user_id INTO v_user_id FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id LIMIT 1;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_user_id IS NOT NULL THEN
    UPDATE public.student_profiles
    SET
      name = COALESCE(nullif(trim(p_name), ''), name),
      email = CASE WHEN p_email IS NOT NULL THEN nullif(trim(p_email), '') ELSE email END,
      phone = COALESCE(p_phone, phone),
      updated_at = now()
    WHERE user_id = v_user_id;
  ELSE
    UPDATE public.students
    SET
      name = COALESCE(nullif(trim(p_name), ''), name),
      email = CASE WHEN p_email IS NOT NULL THEN nullif(trim(p_email), '') ELSE email END,
      phone = COALESCE(p_phone, phone)
    WHERE id::text = p_student_id AND school_id = p_school_id;
  END IF;

  UPDATE public.students
  SET
    balance = COALESCE(p_balance, balance),
    package_expires_at = COALESCE(p_package_expires_at, package_expires_at),
    password = CASE WHEN p_password IS NOT NULL AND p_password <> '' THEN p_password ELSE password END
  WHERE id::text = p_student_id AND school_id = p_school_id;
END;
$$;
COMMENT ON FUNCTION public.update_student_details(text, uuid, text, text, text, text, numeric, timestamptz) IS 'Update student: profile (name/email/phone) when user_id set, else students; always update balance/expires/password.';
GRANT EXECUTE ON FUNCTION public.update_student_details(text, uuid, text, text, text, text, numeric, timestamptz) TO authenticated;

-- =============================================================================
-- 11. get_student_by_user_id: return from view so client gets name/email/phone
-- =============================================================================
DROP FUNCTION IF EXISTS public.get_student_by_user_id(uuid, uuid);
CREATE OR REPLACE FUNCTION public.get_student_by_user_id(p_user_id uuid, p_school_id uuid)
RETURNS SETOF public.students_with_profile
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.* FROM public.students_with_profile v
  WHERE v.user_id = p_user_id AND v.school_id = p_school_id
  LIMIT 1;
$$;
COMMENT ON FUNCTION public.get_student_by_user_id(uuid, uuid) IS 'Return student enrollment (with profile) for auth user_id and school.';
GRANT EXECUTE ON FUNCTION public.get_student_by_user_id(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_student_by_user_id(uuid, uuid) TO authenticated;
