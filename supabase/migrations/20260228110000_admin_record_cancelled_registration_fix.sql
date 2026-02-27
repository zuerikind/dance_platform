-- Ensure admin_record_cancelled_registration function exists with correct definition.
-- This uses a new migration version to avoid conflicts with the existing 20260228100000 entry.

CREATE OR REPLACE FUNCTION public.admin_record_cancelled_registration(
  p_class_id bigint,
  p_student_id text,
  p_school_id uuid,
  p_class_date date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied: only a school admin can do this.';
  END IF;

  INSERT INTO public.class_registrations (class_id, student_id, school_id, class_date, status, cancelled_at)
  VALUES (p_class_id, p_student_id, p_school_id, p_class_date, 'cancelled', now())
  ON CONFLICT (class_id, student_id, class_date)
  DO UPDATE SET status = 'cancelled', cancelled_at = now();
END;
$$;

COMMENT ON FUNCTION public.admin_record_cancelled_registration(bigint, text, uuid, date)
  IS 'Admin only: record a cancelled registration (for virtual/slot-based regs with no row yet).';

GRANT EXECUTE ON FUNCTION public.admin_record_cancelled_registration(bigint, text, uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_record_cancelled_registration(bigint, text, uuid, date) TO anon;

