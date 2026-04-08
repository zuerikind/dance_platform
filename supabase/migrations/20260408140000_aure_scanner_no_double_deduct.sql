-- Aure: align registration "today" and expiry cutoff with America/Mexico_City (matches
-- register_for_class / request_clase_suelta). Include auto no_show + deducted rows in
-- scanner list so teachers use mark_registration_attended instead of manual deduct.
-- mark_registration_attended: if already no_show + deducted, set attended only (no second deduct).

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
    WHERE id = v_reg.id;

    PERFORM public.deduct_student_classes(v_reg.student_id, p_school_id, 1, 'group');
    v_processed := v_processed + 1;
  END LOOP;

  RETURN v_processed;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_student_registrations_for_today(
  p_student_id text,
  p_school_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb := '[]'::jsonb;
  v_row record;
  v_today date;
BEGIN
  IF NOT (
    public.is_school_admin(p_school_id)
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id::text = p_student_id AND s.school_id = p_school_id AND s.user_id = auth.uid()
    )
  ) THEN
    RETURN v_result;
  END IF;

  IF public.is_aure_school(p_school_id) THEN
    v_today := (now() AT TIME ZONE 'America/Mexico_City')::date;
  ELSE
    v_today := CURRENT_DATE;
  END IF;

  FOR v_row IN
    SELECT cr.id, cr.class_id, cr.class_date, cr.status, cr.deducted,
           c.name AS class_name, c.time AS class_time
    FROM public.class_registrations cr
    JOIN public.classes c ON c.id = cr.class_id
    WHERE cr.student_id = p_student_id
      AND cr.school_id = p_school_id
      AND cr.class_date = v_today
      AND (
        cr.status = 'registered'
        OR (
          public.is_aure_school(p_school_id)
          AND cr.status = 'pending'
          AND NOT COALESCE(cr.deducted, false)
        )
        OR (
          public.is_aure_school(p_school_id)
          AND cr.status = 'no_show'
          AND cr.deducted = true
        )
      )
    ORDER BY c.time
  LOOP
    v_result := v_result || jsonb_build_object(
      'id', v_row.id,
      'class_id', v_row.class_id,
      'class_date', v_row.class_date,
      'status', v_row.status,
      'deducted', v_row.deducted,
      'class_name', v_row.class_name,
      'class_time', v_row.class_time
    );
  END LOOP;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_registration_attended(
  p_registration_id uuid,
  p_school_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg public.class_registrations%ROWTYPE;
  v_skip_deduct boolean := false;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;

  SELECT * INTO v_reg
  FROM public.class_registrations
  WHERE id = p_registration_id
    AND school_id = p_school_id
    AND (
      status = 'registered'
      OR (
        public.is_aure_school(p_school_id)
        AND status = 'pending'
        AND NOT COALESCE(deducted, false)
      )
      OR (
        public.is_aure_school(p_school_id)
        AND status = 'no_show'
        AND deducted = true
      )
    );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found or not in a scannable status.';
  END IF;

  IF v_reg.status = 'no_show' AND v_reg.deducted THEN
    v_skip_deduct := true;
  END IF;

  UPDATE public.class_registrations
  SET status = 'attended', deducted = true
  WHERE id = p_registration_id;

  IF NOT v_skip_deduct THEN
    PERFORM public.deduct_student_classes(v_reg.student_id, p_school_id, 1, 'group');
  END IF;
END;
$$;
