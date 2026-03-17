-- Adjust process_expired_registrations to only deduct
-- classes for past dates (class_date < CURRENT_DATE),
-- so same-day classes are not auto-deducted before midnight.
-- This keeps the same signature and name, just updates logic.

CREATE OR REPLACE FUNCTION public.process_expired_registrations(p_school_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg record;
  v_processed int := 0;
BEGIN
  -- Only consider registrations for class dates strictly before "today".
  -- This allows teachers to scan / mark attendance any time during
  -- the class day without triggering an automatic no_show deduction.
  FOR v_reg IN
    SELECT cr.id, cr.student_id
    FROM public.class_registrations cr
    WHERE cr.school_id = p_school_id
      AND cr.status = 'registered'
      AND cr.deducted = false
      AND cr.class_date < CURRENT_DATE
  LOOP
    UPDATE public.class_registrations
    SET status = 'no_show', deducted = true
    WHERE id = v_reg.id;

    PERFORM public.deduct_student_classes(v_reg.student_id, p_school_id, 1, 'group');
    v_processed := v_processed + 1;
  END LOOP;

  RETURN v_processed;
END;
$$;

