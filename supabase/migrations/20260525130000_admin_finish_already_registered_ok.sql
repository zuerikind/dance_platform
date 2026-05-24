-- If the student is already registered on the target date, treat move as complete (clear pending audit).

CREATE OR REPLACE FUNCTION public.admin_finish_class_move(p_audit_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit public.admin_class_move_pending%ROWTYPE;
  v_class public.classes%ROWTYPE;
  v_cancelled public.class_registrations%ROWTYPE;
  v_row public.class_registrations%ROWTYPE;
  v_count int;
  v_is_monthly boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;

  SELECT * INTO v_audit FROM public.admin_class_move_pending WHERE id = p_audit_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Audit record not found.';
  END IF;

  IF NOT public.is_aure_school(v_audit.school_id) THEN
    RAISE EXCEPTION 'This action is only available for Auré.';
  END IF;

  IF NOT (public.is_school_admin(v_audit.school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied.';
  END IF;

  IF v_audit.status IS DISTINCT FROM 'pending_register' THEN
    RAISE EXCEPTION 'This move is not pending registration.';
  END IF;

  SELECT * INTO v_class
  FROM public.classes
  WHERE id = v_audit.intended_class_id AND school_id = v_audit.school_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target class not found for this school.';
  END IF;

  SELECT * INTO v_cancelled
  FROM public.class_registrations
  WHERE id = v_audit.cancelled_registration_id;

  IF FOUND THEN
    v_is_monthly := COALESCE(v_cancelled.is_monthly, false);
  END IF;

  IF v_class.max_capacity IS NOT NULL THEN
    SELECT count(*) INTO v_count
    FROM public.class_registrations
    WHERE class_id = v_audit.intended_class_id
      AND class_date = v_audit.intended_class_date
      AND status IN ('registered', 'pending');
    IF v_count >= v_class.max_capacity THEN
      RAISE EXCEPTION 'Class is full. No spots available.';
    END IF;
  END IF;

  SELECT * INTO v_row
  FROM public.class_registrations
  WHERE class_id = v_audit.intended_class_id
    AND student_id = v_audit.student_id
    AND class_date = v_audit.intended_class_date;

  IF FOUND THEN
    IF v_row.status = 'registered' THEN
      UPDATE public.admin_class_move_pending
      SET status = 'completed', resolved_at = now()
      WHERE id = p_audit_id AND status = 'pending_register';
      RETURN to_jsonb(v_row);
    END IF;
    UPDATE public.class_registrations
    SET status = 'registered', cancelled_at = NULL, is_monthly = v_is_monthly
    WHERE id = v_row.id
    RETURNING * INTO v_row;
  ELSE
    INSERT INTO public.class_registrations (
      class_id, student_id, school_id, class_date, status, is_monthly
    ) VALUES (
      v_audit.intended_class_id,
      v_audit.student_id,
      v_audit.school_id,
      v_audit.intended_class_date,
      'registered',
      v_is_monthly
    )
    RETURNING * INTO v_row;
  END IF;

  UPDATE public.admin_class_move_pending
  SET status = 'completed', resolved_at = now()
  WHERE id = p_audit_id AND status = 'pending_register';

  RETURN to_jsonb(v_row);
END;
$$;
