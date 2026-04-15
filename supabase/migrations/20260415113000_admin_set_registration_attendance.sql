-- Allow teachers/admins to mark class-registration attendance explicitly
-- after class (present vs absent), while keeping deduction idempotent.
CREATE OR REPLACE FUNCTION public.admin_set_registration_attendance(
  p_registration_id uuid,
  p_school_id uuid,
  p_present boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg public.class_registrations%ROWTYPE;
BEGIN
  SELECT *
  INTO v_reg
  FROM public.class_registrations
  WHERE id = p_registration_id
    AND school_id = p_school_id
    AND status IN ('registered', 'attended', 'no_show');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found or status cannot be updated.';
  END IF;

  IF p_present THEN
    IF v_reg.status = 'attended' THEN
      RETURN;
    END IF;

    UPDATE public.class_registrations
    SET status = 'attended', deducted = true
    WHERE id = v_reg.id;
  ELSE
    IF v_reg.status = 'no_show' AND v_reg.deducted THEN
      RETURN;
    END IF;

    UPDATE public.class_registrations
    SET status = 'no_show', deducted = true
    WHERE id = v_reg.id;
  END IF;

  IF NOT COALESCE(v_reg.deducted, false) THEN
    PERFORM public.deduct_student_classes(v_reg.student_id, p_school_id, 1);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_registration_attendance(uuid, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_registration_attendance(uuid, uuid, boolean) TO anon;
