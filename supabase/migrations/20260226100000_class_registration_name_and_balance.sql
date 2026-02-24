-- 1) get_class_registrations_for_date: never return null student_name (use email or student_id as fallback)
-- 2) register_for_class: require at least 1 group class in package (effective balance) before allowing registration

-- -----------------------------------------------------------------------------
-- 1) get_class_registrations_for_date: COALESCE student_name
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
           COALESCE(NULLIF(trim(s.name), ''), s.email, cr.student_id, 'Student') AS student_name
    FROM public.class_registrations cr
    JOIN public.classes c ON c.id = cr.class_id
    LEFT JOIN public.students s ON s.id::text = cr.student_id AND s.school_id = cr.school_id
    WHERE cr.school_id = p_school_id
      AND cr.class_date = p_class_date
    ORDER BY c.time, COALESCE(NULLIF(trim(s.name), ''), s.email, cr.student_id)
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
  IS 'List registrations for a school and date. Admin only. student_name never null (fallback: email, student_id, Student).';

-- -----------------------------------------------------------------------------
-- 2) register_for_class: require at least 1 group class in package
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
  v_effective_balance int;
  v_pack jsonb;
  v_pack_count int;
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

  -- Require at least 1 group class in package (balance or active packs)
  -- balance IS NULL = unlimited; otherwise effective = balance + sum of non-expired pack counts
  v_effective_balance := NULL;
  IF v_student.balance IS NULL THEN
    -- Unlimited: no check
    NULL;
  ELSIF v_student.balance IS NOT NULL THEN
    v_effective_balance := COALESCE(v_student.balance::int, 0);
    IF v_student.active_packs IS NOT NULL AND jsonb_array_length(v_student.active_packs) > 0 THEN
      FOR v_pack IN SELECT elem FROM jsonb_array_elements(v_student.active_packs) AS elem
      LOOP
        IF (v_pack->>'expires_at') IS NOT NULL AND (v_pack->>'expires_at')::timestamptz > now() THEN
          IF v_pack->>'count' IS NULL OR v_pack->>'count' = 'null' OR (v_pack->>'count')::int IS NULL THEN
            v_effective_balance := NULL; -- unlimited pack
            EXIT;
          END IF;
          v_pack_count := COALESCE((v_pack->>'count')::int, 0);
          v_effective_balance := v_effective_balance + v_pack_count;
        END IF;
      END LOOP;
    END IF;
    IF v_effective_balance IS NOT NULL AND v_effective_balance < 1 THEN
      RAISE EXCEPTION 'No classes left in your package. Please purchase or top up to register for classes.';
    END IF;
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
  IS 'Register a student for a class. Requires at least 1 group class in package. Caller must be that student or school/platform admin.';
