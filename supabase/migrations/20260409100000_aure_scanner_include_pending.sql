-- Aure: QR scanner lists clase suelta rows still in `pending` so teachers do not fall
-- through to manual deduct_student_classes. mark_registration_attended treats pending like
-- registered (one group deduction) when admin confirms at the door.

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
