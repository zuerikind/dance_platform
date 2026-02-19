-- =============================================================================
-- Class registration RPC authorization: restrict to owning student or school
-- (and platform) admin so students cannot register/cancel others or read
-- other schools' registration lists.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) register_for_class: only the student (own id) or school/platform admin
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.register_for_class(
  p_student_id text,
  p_class_id bigint,
  p_school_id uuid,
  p_class_date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_class public.classes%ROWTYPE;
  v_student public.students%ROWTYPE;
  v_count int;
  v_row public.class_registrations%ROWTYPE;
BEGIN
  IF NOT (
    public.is_school_admin(p_school_id)
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id::text = p_student_id AND s.school_id = p_school_id AND s.user_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Permission denied: only the student or a school admin can register.';
  END IF;

  SELECT * INTO v_class FROM public.classes WHERE id = p_class_id AND school_id = p_school_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Class not found.';
  END IF;

  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found.';
  END IF;

  IF NOT v_student.paid THEN
    RAISE EXCEPTION 'No active membership. Please purchase a plan first.';
  END IF;

  IF v_class.max_capacity IS NOT NULL THEN
    SELECT count(*) INTO v_count
    FROM public.class_registrations
    WHERE class_id = p_class_id
      AND class_date = p_class_date
      AND status = 'registered';
    IF v_count >= v_class.max_capacity THEN
      RAISE EXCEPTION 'Class is full. No spots available.';
    END IF;
  END IF;

  SELECT * INTO v_row
  FROM public.class_registrations
  WHERE class_id = p_class_id AND student_id = p_student_id AND class_date = p_class_date;

  IF FOUND THEN
    IF v_row.status = 'registered' THEN
      RAISE EXCEPTION 'Already registered for this class.';
    END IF;
    UPDATE public.class_registrations
    SET status = 'registered', cancelled_at = NULL
    WHERE id = v_row.id
    RETURNING * INTO v_row;
  ELSE
    INSERT INTO public.class_registrations (class_id, student_id, school_id, class_date, status)
    VALUES (p_class_id, p_student_id, p_school_id, p_class_date, 'registered')
    RETURNING * INTO v_row;
  END IF;

  RETURN to_jsonb(v_row);
END;
$$;

COMMENT ON FUNCTION public.register_for_class(text, bigint, uuid, date)
  IS 'Register a student for a class. Caller must be that student (auth.uid()) or school/platform admin.';

-- -----------------------------------------------------------------------------
-- 2) cancel_class_registration: only the student (own registration) or admin
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancel_class_registration(
  p_registration_id uuid,
  p_student_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg public.class_registrations%ROWTYPE;
  v_class public.classes%ROWTYPE;
  v_class_datetime timestamptz;
BEGIN
  SELECT * INTO v_reg
  FROM public.class_registrations
  WHERE id = p_registration_id AND student_id = p_student_id AND status = 'registered';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found or already cancelled.';
  END IF;

  IF NOT (
    public.is_school_admin(v_reg.school_id)
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id::text = v_reg.student_id AND s.school_id = v_reg.school_id AND s.user_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Permission denied: only the student or a school admin can cancel.';
  END IF;

  SELECT * INTO v_class FROM public.classes WHERE id = v_reg.class_id;
  v_class_datetime := (v_reg.class_date || ' ' || coalesce(v_class.time, '23:59'))::timestamptz;

  IF v_class_datetime - interval '4 hours' <= now() THEN
    RAISE EXCEPTION 'Cannot cancel less than 4 hours before class.';
  END IF;

  UPDATE public.class_registrations
  SET status = 'cancelled', cancelled_at = now()
  WHERE id = p_registration_id;
END;
$$;

COMMENT ON FUNCTION public.cancel_class_registration(uuid, text)
  IS 'Cancel a class registration. Caller must be that student or school/platform admin.';

-- -----------------------------------------------------------------------------
-- 3) get_class_registrations_for_date: only school or platform admin
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_class_registrations_for_date(
  p_school_id uuid,
  p_class_date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb := '[]'::jsonb;
  v_row record;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN v_result;
  END IF;

  FOR v_row IN
    SELECT cr.id, cr.class_id, cr.student_id, cr.class_date, cr.status, cr.deducted,
           c.name AS class_name, c.time AS class_time,
           s.name AS student_name
    FROM public.class_registrations cr
    JOIN public.classes c ON c.id = cr.class_id
    JOIN public.students s ON s.id::text = cr.student_id
    WHERE cr.school_id = p_school_id
      AND cr.class_date = p_class_date
    ORDER BY c.time, s.name
  LOOP
    v_result := v_result || jsonb_build_object(
      'id', v_row.id,
      'class_id', v_row.class_id,
      'student_id', v_row.student_id,
      'class_date', v_row.class_date,
      'status', v_row.status,
      'deducted', v_row.deducted,
      'class_name', v_row.class_name,
      'class_time', v_row.class_time,
      'student_name', v_row.student_name
    );
  END LOOP;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_class_registrations_for_date(uuid, date)
  IS 'List registrations for a school and date. Admin only.';
