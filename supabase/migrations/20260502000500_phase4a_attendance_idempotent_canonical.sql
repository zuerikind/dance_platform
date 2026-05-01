-- Phase 4a: Attendance transition hardening for Aure-dominant flow.
-- Goal:
-- - Deduct at most once per class registration when attendance is finalized.
-- - Keep teacher post-class status edits idempotent.
-- - Route deduction through canonical mutation RPCs with idempotency keys.

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
  v_target_status text := CASE WHEN p_present THEN 'attended' ELSE 'no_show' END;
  v_student_id text;
  v_deduct_result jsonb;
  v_deduct_key text;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  SELECT *
  INTO v_reg
  FROM public.class_registrations
  WHERE id = p_registration_id
    AND school_id = p_school_id
    AND (
      status IN ('registered', 'attended', 'no_show')
      OR (public.is_aure_school(p_school_id) AND status = 'pending')
    )
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found or status cannot be updated.';
  END IF;

  -- Idempotent status no-op.
  IF v_reg.status = v_target_status THEN
    RETURN;
  END IF;

  -- First finalization: mark deducted and deduct exactly once.
  IF NOT COALESCE(v_reg.deducted, false) THEN
    UPDATE public.class_registrations
    SET
      status = v_target_status,
      deducted = true
    WHERE id = p_registration_id
      AND school_id = p_school_id
      AND deducted = false
    RETURNING student_id INTO v_student_id;

    IF FOUND THEN
      v_deduct_key := 'class_registration:' || p_registration_id::text || ':first_deduct';
      SELECT public.canonical_deduct_student_balances(
        p_student_id := v_student_id,
        p_school_id := p_school_id,
        p_count := 1,
        p_class_type := 'group',
        p_idempotency_key := v_deduct_key,
        p_source_ref := p_registration_id::text,
        p_metadata := jsonb_build_object(
          'flow', 'admin_set_registration_attendance',
          'target_status', v_target_status,
          'registration_id', p_registration_id
        )
      ) INTO v_deduct_result;
      RETURN;
    END IF;
  END IF;

  -- Already deducted: only status change, never extra charge/refund here.
  UPDATE public.class_registrations
  SET status = v_target_status
  WHERE id = p_registration_id
    AND school_id = p_school_id;
END;
$$;

COMMENT ON FUNCTION public.admin_set_registration_attendance(uuid, uuid, boolean) IS
'Idempotent attendance finalization: first finalized status deducts once via canonical RPC; subsequent present/no_show flips only change status.';

CREATE OR REPLACE FUNCTION public.mark_registration_attended(
  p_registration_id uuid,
  p_school_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.admin_set_registration_attendance(
    p_registration_id := p_registration_id,
    p_school_id := p_school_id,
    p_present := true
  );
END;
$$;

COMMENT ON FUNCTION public.mark_registration_attended(uuid, uuid) IS
'Compatibility wrapper to admin_set_registration_attendance(..., true) with canonical idempotent deduction behavior.';

CREATE OR REPLACE FUNCTION public.process_expired_registrations(p_school_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg record;
  v_processed int := 0;
  v_cutoff date;
  v_student_id text;
  v_deduct_result jsonb;
  v_deduct_key text;
BEGIN
  IF public.is_aure_school(p_school_id) THEN
    v_cutoff := (now() AT TIME ZONE 'America/Mexico_City')::date;
  ELSE
    v_cutoff := CURRENT_DATE;
  END IF;

  FOR v_reg IN
    SELECT cr.id, cr.student_id
    FROM public.class_registrations cr
    WHERE cr.school_id = p_school_id
      AND cr.status = 'registered'
      AND cr.deducted = false
      AND cr.class_date < v_cutoff
  LOOP
    UPDATE public.class_registrations
    SET status = 'no_show', deducted = true
    WHERE id = v_reg.id
      AND status = 'registered'
      AND deducted = false
    RETURNING student_id INTO v_student_id;

    IF FOUND THEN
      v_deduct_key := 'class_registration:' || v_reg.id::text || ':first_deduct';
      SELECT public.canonical_deduct_student_balances(
        p_student_id := v_student_id,
        p_school_id := p_school_id,
        p_count := 1,
        p_class_type := 'group',
        p_idempotency_key := v_deduct_key,
        p_source_ref := v_reg.id::text,
        p_metadata := jsonb_build_object(
          'flow', 'process_expired_registrations',
          'registration_id', v_reg.id
        )
      ) INTO v_deduct_result;
      v_processed := v_processed + 1;
    END IF;
  END LOOP;

  RETURN v_processed;
END;
$$;

COMMENT ON FUNCTION public.process_expired_registrations(uuid) IS
'Marks overdue registrations as no_show and deducts once via canonical idempotent deduction key.';

GRANT EXECUTE ON FUNCTION public.admin_set_registration_attendance(uuid, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_registration_attendance(uuid, uuid, boolean) TO anon;
GRANT EXECUTE ON FUNCTION public.mark_registration_attended(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_expired_registrations(uuid) TO authenticated;
