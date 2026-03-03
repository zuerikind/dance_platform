-- Ensure update_student_details matches row and persists balance; return updated row so frontend uses it.
DROP FUNCTION IF EXISTS public.update_student_details(text, uuid, text, text, text, text, numeric, timestamptz, int, int);

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
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_sid text := nullif(trim(p_student_id), '');
  v_updated jsonb;
  v_rows int;
BEGIN
  IF v_sid IS NULL OR p_school_id IS NULL THEN
    RETURN NULL;
  END IF;
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;

  SELECT user_id INTO v_user_id FROM public.students WHERE id = v_sid AND school_id = p_school_id LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
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
    WHERE id = v_sid AND school_id = p_school_id;
  END IF;

  UPDATE public.students
  SET
    balance = CASE WHEN p_balance IS NOT NULL THEN p_balance::numeric ELSE balance END,
    package_expires_at = COALESCE(p_package_expires_at, package_expires_at),
    password = CASE WHEN p_password IS NOT NULL AND p_password <> '' THEN p_password ELSE password END,
    balance_private = CASE WHEN p_balance_private IS NOT NULL THEN p_balance_private ELSE balance_private END,
    balance_events = CASE WHEN p_balance_events IS NOT NULL THEN p_balance_events ELSE balance_events END
  WHERE id = v_sid AND school_id = p_school_id;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    RETURN NULL;
  END IF;

  SELECT to_jsonb(v.*) INTO v_updated
  FROM public.students_with_profile v
  WHERE v.id = v_sid AND v.school_id = p_school_id
  LIMIT 1;
  RETURN v_updated;
END;
$$;

COMMENT ON FUNCTION public.update_student_details(text, uuid, text, text, text, text, numeric, timestamptz, int, int) IS 'Update student details; returns updated row as jsonb for frontend.';

GRANT EXECUTE ON FUNCTION public.update_student_details(text, uuid, text, text, text, text, numeric, timestamptz, int, int) TO authenticated;
