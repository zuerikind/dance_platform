-- Admin-only: cancel a class registration without the 4-hour rule.
-- Used when admin explicitly removes a student's registration (e.g. Aure dashboard).
CREATE OR REPLACE FUNCTION public.admin_cancel_class_registration(
  p_registration_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg public.class_registrations%ROWTYPE;
BEGIN
  SELECT * INTO v_reg
  FROM public.class_registrations
  WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found.';
  END IF;

  IF NOT (public.is_school_admin(v_reg.school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied: only a school admin can remove this registration.';
  END IF;

  UPDATE public.class_registrations
  SET status = 'cancelled', cancelled_at = now()
  WHERE id = p_registration_id;
END;
$$;

COMMENT ON FUNCTION public.admin_cancel_class_registration(uuid)
  IS 'Admin only: cancel a class registration (no 4-hour rule).';

GRANT EXECUTE ON FUNCTION public.admin_cancel_class_registration(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_cancel_class_registration(uuid) TO anon;
