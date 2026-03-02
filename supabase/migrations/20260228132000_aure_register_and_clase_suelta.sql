-- =============================================================================
-- Aure school: request_clase_suelta, admin_approve/reject, student_update_level,
-- and Aure gating in register_for_class / register_for_class_monthly.
-- =============================================================================

-- 1) request_clase_suelta (Aure only)
CREATE OR REPLACE FUNCTION public.request_clase_suelta(
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
  IF NOT public.is_aure_school(p_school_id) THEN
    RAISE EXCEPTION 'This flow is only available for Aure school.';
  END IF;

  SELECT * INTO v_class FROM public.classes WHERE id = p_class_id AND school_id = p_school_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Class not found.';
  END IF;

  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found.';
  END IF;

  IF NOT (
    public.is_school_admin(p_school_id)
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id::text = p_student_id AND s.school_id = p_school_id AND s.user_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Permission denied.';
  END IF;

  IF NOT v_student.paid THEN
    RAISE EXCEPTION 'No active membership. Please purchase a plan first.';
  END IF;

  IF COALESCE(v_student.level, '') = 'principiante' AND v_class.day = 'Thu' THEN
    RAISE EXCEPTION 'Principiantes cannot register for Thursday classes.';
  END IF;

  IF v_class.max_capacity IS NOT NULL THEN
    SELECT count(*) INTO v_count
    FROM public.class_registrations
    WHERE class_id = p_class_id
      AND class_date = p_class_date
      AND status IN ('registered', 'pending');
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
    IF v_row.status = 'pending' THEN
      RETURN to_jsonb(v_row);
    END IF;
    UPDATE public.class_registrations
    SET status = 'pending', cancelled_at = NULL
    WHERE id = v_row.id
    RETURNING * INTO v_row;
  ELSE
    INSERT INTO public.class_registrations (class_id, student_id, school_id, class_date, status)
    VALUES (p_class_id, p_student_id, p_school_id, p_class_date, 'pending')
    RETURNING * INTO v_row;
  END IF;

  RETURN to_jsonb(v_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_clase_suelta(text, bigint, uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_clase_suelta(text, bigint, uuid, date) TO anon;

-- 2) admin_approve_clase_suelta (Aure only)
CREATE OR REPLACE FUNCTION public.admin_approve_clase_suelta(p_registration_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg public.class_registrations%ROWTYPE;
BEGIN
  SELECT * INTO v_reg FROM public.class_registrations WHERE id = p_registration_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found.';
  END IF;
  IF v_reg.status != 'pending' THEN
    RAISE EXCEPTION 'Registration is not pending approval.';
  END IF;
  IF NOT public.is_aure_school(v_reg.school_id) THEN
    RAISE EXCEPTION 'This flow is only available for Aure school.';
  END IF;
  IF NOT (public.is_school_admin(v_reg.school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied: only school admin can approve.';
  END IF;

  UPDATE public.class_registrations SET status = 'registered' WHERE id = p_registration_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_approve_clase_suelta(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_approve_clase_suelta(uuid) TO anon;

-- 3) admin_reject_clase_suelta (Aure only)
CREATE OR REPLACE FUNCTION public.admin_reject_clase_suelta(p_registration_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg public.class_registrations%ROWTYPE;
BEGIN
  SELECT * INTO v_reg FROM public.class_registrations WHERE id = p_registration_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found.';
  END IF;
  IF v_reg.status != 'pending' THEN
    RAISE EXCEPTION 'Registration is not pending.';
  END IF;
  IF NOT public.is_aure_school(v_reg.school_id) THEN
    RAISE EXCEPTION 'This flow is only available for Aure school.';
  END IF;
  IF NOT (public.is_school_admin(v_reg.school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied: only school admin can reject.';
  END IF;

  UPDATE public.class_registrations SET status = 'cancelled', cancelled_at = now() WHERE id = p_registration_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_reject_clase_suelta(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_clase_suelta(uuid) TO anon;

-- 4) student_update_level (Aure only)
CREATE OR REPLACE FUNCTION public.student_update_level(
  p_student_id text,
  p_school_id uuid,
  p_level text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_aure_school(p_school_id) THEN
    RAISE EXCEPTION 'Student level is only configurable for Aure school.';
  END IF;
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied.';
  END IF;
  IF p_level IS NOT NULL AND p_level NOT IN ('principiante', 'avanzada') THEN
    RAISE EXCEPTION 'Level must be principiante, avanzada, or NULL.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id) THEN
    RAISE EXCEPTION 'Student not found.';
  END IF;

  UPDATE public.students SET level = p_level WHERE id::text = p_student_id AND school_id = p_school_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.student_update_level(text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.student_update_level(text, uuid, text) TO anon;

-- 5) register_for_class: Aure gating (principiante no Thu; 4/8 package only)
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
  v_has_4_8_package boolean := false;
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

  -- Aure: level check and package check
  IF public.is_aure_school(p_school_id) THEN
    IF COALESCE(v_student.level, '') = 'principiante' AND v_class.day = 'Thu' THEN
      RAISE EXCEPTION 'Principiantes cannot register for Thursday classes.';
    END IF;
    SELECT EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(v_student.active_packs, '[]'::jsonb)) AS elem
      WHERE ((elem->>'expires_at')::timestamptz IS NULL OR (elem->>'expires_at')::timestamptz > now())
        AND (elem->>'plan_limit')::int IN (4, 8)
    ) INTO v_has_4_8_package;
    IF NOT v_has_4_8_package THEN
      SELECT EXISTS (
        SELECT 1 FROM jsonb_array_elements(COALESCE(v_student.active_packs, '[]'::jsonb)) AS elem
        WHERE ((elem->>'expires_at')::timestamptz IS NULL OR (elem->>'expires_at')::timestamptz > now())
          AND (elem->>'count')::int IN (4, 8)
      ) INTO v_has_4_8_package;
    END IF;
    IF NOT v_has_4_8_package THEN
      RAISE EXCEPTION 'Direct registration requires a 4 or 8 class package. Use "Request clase suelta" instead.';
    END IF;
  END IF;

  -- Effective balance check (non-Aure logic unchanged)
  v_effective_balance := NULL;
  IF v_student.balance IS NULL THEN
    NULL;
  ELSIF v_student.balance IS NOT NULL THEN
    v_effective_balance := COALESCE(v_student.balance::int, 0);
    IF v_student.active_packs IS NOT NULL AND jsonb_array_length(v_student.active_packs) > 0 THEN
      FOR v_pack IN SELECT elem FROM jsonb_array_elements(v_student.active_packs) AS elem
      LOOP
        IF (v_pack->>'expires_at') IS NOT NULL AND (v_pack->>'expires_at')::timestamptz > now() THEN
          IF v_pack->>'count' IS NULL OR v_pack->>'count' = 'null' OR (v_pack->>'count')::int IS NULL THEN
            v_effective_balance := NULL;
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

  -- Capacity: count registered AND pending
  IF v_class.max_capacity IS NOT NULL THEN
    SELECT count(*) INTO v_count
    FROM public.class_registrations
    WHERE class_id = p_class_id
      AND class_date = p_class_date
      AND status IN ('registered', 'pending');
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

-- 6) register_for_class_monthly: Aure gating (same as single)
CREATE OR REPLACE FUNCTION public.register_for_class_monthly(
  p_student_id text,
  p_class_id bigint,
  p_school_id uuid,
  p_dates date[]
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
  v_date date;
  v_effective_balance int;
  v_num_dates int;
  v_row public.class_registrations%ROWTYPE;
  v_results jsonb := '[]'::jsonb;
  v_pack jsonb;
  v_pack_count int;
  v_has_4_8_package boolean := false;
BEGIN
  v_num_dates := array_length(p_dates, 1);
  IF v_num_dates IS NULL OR v_num_dates = 0 THEN
    RAISE EXCEPTION 'No dates provided.';
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

  -- Aure: level and package check
  IF public.is_aure_school(p_school_id) THEN
    IF COALESCE(v_student.level, '') = 'principiante' AND v_class.day = 'Thu' THEN
      RAISE EXCEPTION 'Principiantes cannot register for Thursday classes. Monthly registration not available.';
    END IF;
    SELECT EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(v_student.active_packs, '[]'::jsonb)) AS elem
      WHERE ((elem->>'expires_at')::timestamptz IS NULL OR (elem->>'expires_at')::timestamptz > now())
        AND ((elem->>'plan_limit')::int IN (4, 8) OR (elem->>'count')::int IN (4, 8))
    ) INTO v_has_4_8_package;
    IF NOT v_has_4_8_package THEN
      RAISE EXCEPTION 'Monthly registration requires a 4 or 8 class package.';
    END IF;
  END IF;

  IF v_student.balance IS NOT NULL THEN
    v_effective_balance := COALESCE(v_student.balance, 0);
    IF v_student.active_packs IS NOT NULL THEN
      FOR v_pack IN SELECT * FROM jsonb_array_elements(v_student.active_packs)
      LOOP
        IF (v_pack->>'expires_at')::timestamptz > now() THEN
          IF v_pack->>'count' IS NULL OR v_pack->>'count' = 'null' THEN
            v_effective_balance := NULL;
            EXIT;
          END IF;
          v_pack_count := COALESCE((v_pack->>'count')::int, 0);
          v_effective_balance := v_effective_balance + v_pack_count;
        END IF;
      END LOOP;
    END IF;
    IF v_effective_balance IS NOT NULL AND v_effective_balance < v_num_dates THEN
      RAISE EXCEPTION 'Insufficient classes. You need % but only have %.', v_num_dates, v_effective_balance;
    END IF;
  END IF;

  FOREACH v_date IN ARRAY p_dates
  LOOP
    IF v_class.max_capacity IS NOT NULL THEN
      SELECT count(*) INTO v_count
      FROM public.class_registrations
      WHERE class_id = p_class_id
        AND class_date = v_date
        AND status IN ('registered', 'pending');
      IF v_count >= v_class.max_capacity THEN
        RAISE EXCEPTION 'Class is full on %. No spots available.', v_date;
      END IF;
    END IF;

    SELECT * INTO v_row
    FROM public.class_registrations
    WHERE class_id = p_class_id AND student_id = p_student_id AND class_date = v_date;

    IF FOUND THEN
      IF v_row.status = 'registered' THEN
        v_results := v_results || to_jsonb(v_row);
        CONTINUE;
      END IF;
      UPDATE public.class_registrations
      SET status = 'registered', cancelled_at = NULL, is_monthly = true
      WHERE id = v_row.id
      RETURNING * INTO v_row;
    ELSE
      INSERT INTO public.class_registrations (class_id, student_id, school_id, class_date, status, is_monthly)
      VALUES (p_class_id, p_student_id, p_school_id, v_date, 'registered', true)
      RETURNING * INTO v_row;
    END IF;

    v_results := v_results || to_jsonb(v_row);
  END LOOP;

  RETURN v_results;
END;
$$;
