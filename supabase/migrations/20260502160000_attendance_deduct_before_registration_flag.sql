-- Fix: admin_set_registration_attendance previously set deducted=true BEFORE canonical_deduct.
-- If deduct returned ok=false (insufficient_balance), the registration stayed deducted with no
-- balance change — student lost the slot without a credit. Deduct first, then set deducted.

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

  IF v_reg.status = v_target_status THEN
    RETURN;
  END IF;

  IF NOT COALESCE(v_reg.deducted, false) THEN
    v_deduct_key := 'class_registration:' || p_registration_id::text || ':first_deduct';
    SELECT public.canonical_deduct_student_balances(
      p_student_id := v_reg.student_id,
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

    IF NOT coalesce((v_deduct_result->>'ok')::boolean, false) THEN
      RAISE EXCEPTION 'Insufficient class credits (%).',
        coalesce(v_deduct_result->>'reason', 'deduct_failed');
    END IF;

    UPDATE public.class_registrations
    SET
      status = v_target_status,
      deducted = true
    WHERE id = p_registration_id
      AND school_id = p_school_id
      AND deducted = false;

    RETURN;
  END IF;

  UPDATE public.class_registrations
  SET status = v_target_status
  WHERE id = p_registration_id
    AND school_id = p_school_id;
END;
$$;

COMMENT ON FUNCTION public.admin_set_registration_attendance(uuid, uuid, boolean) IS
'Idempotent attendance: first deduct via canonical RPC (must succeed), then set deducted=true and status; later status flips do not re-deduct.';

-- Same ordering for overdue registrations (cron): deduct must succeed before marking deducted.
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
    v_deduct_key := 'class_registration:' || v_reg.id::text || ':first_deduct';
    SELECT public.canonical_deduct_student_balances(
      p_student_id := v_reg.student_id,
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

    IF coalesce((v_deduct_result->>'ok')::boolean, false) THEN
      UPDATE public.class_registrations
      SET status = 'no_show', deducted = true
      WHERE id = v_reg.id
        AND status = 'registered'
        AND deducted = false
      RETURNING student_id INTO v_student_id;

      IF FOUND THEN
        v_processed := v_processed + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN v_processed;
END;
$$;

COMMENT ON FUNCTION public.process_expired_registrations(uuid) IS
'Overdue registered rows: deduct once (canonical, idempotent) then mark no_show+deducted; skips row if deduct fails.';
