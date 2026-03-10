-- =============================================================================
-- Aure: default new students to level 'principiante'; admin can change to avanzada.
-- Scope: Aure only. Non-Aure schools unchanged.
-- =============================================================================

-- 1) create_student_with_auth: set level = 'principiante' when school is Aure
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
COMMENT ON FUNCTION public.create_student_with_auth(uuid, text, text, text, text, uuid) IS 'Create profile (if needed) and enrollment; name/email/phone in profile only. Aure: default level principiante.';

-- 2) create_student_legacy: set level = 'principiante' when school is Aure
CREATE OR REPLACE FUNCTION public.create_student_legacy(
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
  new_row public.students;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;
  new_id := 'STUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  INSERT INTO public.students (id, name, email, phone, password, paid, package, balance, active_packs, package_expires_at, school_id, created_at, level)
  VALUES (new_id, trim(p_name), nullif(trim(p_email), ''), nullif(trim(p_phone), ''), p_password, false, null, 0, '[]'::jsonb, null, p_school_id, now(),
    CASE WHEN public.is_aure_school(p_school_id) THEN 'principiante' ELSE NULL END)
  RETURNING * INTO new_row;
  RETURN to_jsonb(new_row);
END;
$$;
COMMENT ON FUNCTION public.create_student_legacy(text, text, text, text, uuid) IS 'Create student without Auth; only school/platform admin. Aure: default level principiante.';
