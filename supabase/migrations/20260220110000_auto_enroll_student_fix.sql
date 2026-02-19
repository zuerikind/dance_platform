-- Fix cross-school login: return enrollment row without relying on security_invoker view,
-- and enforce that only the signed-in user can enroll themselves.

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
  -- Only the signed-in user can enroll themselves at a school
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
COMMENT ON FUNCTION public.auto_enroll_student(uuid, uuid) IS 'Create enrollment for school; only callable by the same user (auth.uid()). Returns student row with profile name/email/phone.';

GRANT EXECUTE ON FUNCTION public.auto_enroll_student(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.auto_enroll_student(uuid, uuid) TO authenticated;
