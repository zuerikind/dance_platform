-- =============================================================================
-- Auré admin: finish pending class move (register on new date without student
-- Aure rules that block register_for_class for monthly / non-4-8 packs).
-- =============================================================================

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
      RAISE EXCEPTION 'Already registered for this class.';
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

COMMENT ON FUNCTION public.admin_finish_class_move(uuid) IS
  'Auré admin: register student on intended date for a pending move; bypasses student Aure pack/balance rules.';

GRANT EXECUTE ON FUNCTION public.admin_finish_class_move(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_finish_class_move(uuid) TO anon;


-- Improve student name snapshot on begin (trim id match).
CREATE OR REPLACE FUNCTION public.admin_begin_class_move(
  p_registration_id uuid,
  p_target_class_id bigint,
  p_target_class_date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg public.class_registrations%ROWTYPE;
  v_target public.classes%ROWTYPE;
  v_old_class public.classes%ROWTYPE;
  v_student_name text;
  v_audit_id uuid;
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;

  SELECT * INTO v_reg
  FROM public.class_registrations
  WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found.';
  END IF;

  IF NOT public.is_aure_school(v_reg.school_id) THEN
    RAISE EXCEPTION 'This action is only available for Auré.';
  END IF;

  IF NOT (public.is_school_admin(v_reg.school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied: only a school admin can move this registration.';
  END IF;

  IF v_reg.status IS DISTINCT FROM 'registered' THEN
    RAISE EXCEPTION 'Only an active registered class can be moved.';
  END IF;

  IF v_reg.class_id = p_target_class_id AND v_reg.class_date = p_target_class_date THEN
    RAISE EXCEPTION 'Choose a different class or date than the current registration.';
  END IF;

  SELECT * INTO v_target
  FROM public.classes
  WHERE id = p_target_class_id AND school_id = v_reg.school_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target class not found for this school.';
  END IF;

  SELECT * INTO v_old_class FROM public.classes WHERE id = v_reg.class_id;

  SELECT trim(COALESCE(s.name, '')) INTO v_student_name
  FROM public.students s
  WHERE s.school_id = v_reg.school_id
    AND (s.id::text = v_reg.student_id OR trim(s.id::text) = trim(v_reg.student_id))
  LIMIT 1;

  UPDATE public.class_registrations
  SET status = 'cancelled', cancelled_at = now()
  WHERE id = p_registration_id AND status = 'registered'
  RETURNING * INTO v_reg;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Could not cancel registration (it may have changed).';
  END IF;

  INSERT INTO public.admin_class_move_pending (
    school_id,
    initiated_by,
    student_id,
    cancelled_registration_id,
    intended_class_id,
    intended_class_date,
    student_name_snapshot,
    old_class_name_snapshot,
    old_class_date_snapshot,
    intended_class_name_snapshot,
    intended_class_time_snapshot,
    status
  ) VALUES (
    v_reg.school_id,
    v_uid,
    v_reg.student_id,
    p_registration_id,
    p_target_class_id,
    p_target_class_date,
    NULLIF(trim(COALESCE(v_student_name, '')), ''),
    COALESCE(v_old_class.name, ''),
    v_reg.class_date,
    COALESCE(v_target.name, ''),
    COALESCE(v_target.time::text, ''),
    'pending_register'
  )
  RETURNING id INTO v_audit_id;

  RETURN jsonb_build_object(
    'audit_id', v_audit_id,
    'student_id', v_reg.student_id,
    'school_id', v_reg.school_id,
    'intended_class_id', p_target_class_id,
    'intended_class_date', p_target_class_date
  );
END;
$$;
