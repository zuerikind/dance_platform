-- Extend update_student_details to allow updating balance_private and balance_events (admin student edit).
DROP FUNCTION IF EXISTS public.update_student_details(text, uuid, text, text, text, text, numeric, timestamptz);

CREATE OR REPLACE FUNCTION public.update_student_details(
  p_student_id text,
  p_school_id uuid,
  p_name text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_password text DEFAULT NULL,
  p_balance numeric DEFAULT NULL,
  p_package_expires_at timestamptz DEFAULT NULL,
  p_balance_private int DEFAULT NULL,
  p_balance_events int DEFAULT NULL
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
    password = CASE WHEN p_password IS NOT NULL AND p_password <> '' THEN p_password ELSE password END,
    balance_private = CASE WHEN p_balance_private IS NOT NULL THEN p_balance_private ELSE balance_private END,
    balance_events = CASE WHEN p_balance_events IS NOT NULL THEN p_balance_events ELSE balance_events END
  WHERE id::text = p_student_id AND school_id = p_school_id;
END;
$$;

COMMENT ON FUNCTION public.update_student_details(text, uuid, text, text, text, text, numeric, timestamptz, int, int) IS 'Update student: profile, balance, balance_private, balance_events, expires, password.';

GRANT EXECUTE ON FUNCTION public.update_student_details(text, uuid, text, text, text, text, numeric, timestamptz, int, int) TO authenticated;
