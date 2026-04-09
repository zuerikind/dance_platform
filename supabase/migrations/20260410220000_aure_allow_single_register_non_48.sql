-- Aure: allow direct register_for_class (single class) for students with any remaining group
-- credits in days 1–14, not only 4/8 packs. Previous logic required plan_limit/count IN (4,8) and
-- blocked all non-admin Aure students with "use week registration", so 3-class packs only saw clase suelta.
-- After the 15th, students still use request_clase_suelta (unchanged).

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
  v_registered_count int;
  v_available int;
  v_is_admin_call boolean;
  v_ex jsonb;
  v_sum_group int := 0;
  v_has_unlimited boolean := false;
BEGIN
  v_is_admin_call := public.is_school_admin(p_school_id) OR public.is_platform_admin();

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
  IF NOT FOUND THEN RAISE EXCEPTION 'Class not found.'; END IF;

  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Student not found.'; END IF;

  IF v_student.balance IS NULL THEN
    v_has_unlimited := true;
  END IF;
  IF v_student.active_packs IS NOT NULL AND jsonb_array_length(v_student.active_packs) > 0 THEN
    FOR v_pack IN SELECT elem FROM jsonb_array_elements(v_student.active_packs) AS elem
    LOOP
      IF (v_pack->>'expires_at') IS NULL OR (v_pack->>'expires_at')::timestamptz > now() THEN
        IF v_pack->>'count' IS NULL OR v_pack->>'count' = 'null' OR (v_pack->>'count')::int IS NULL THEN
          v_has_unlimited := true;
          EXIT;
        END IF;
        v_sum_group := v_sum_group + COALESCE((v_pack->>'count')::int, 0);
      END IF;
    END LOOP;
  END IF;
  IF v_has_unlimited THEN
    v_effective_balance := NULL;
  ELSE
    v_effective_balance := GREATEST(COALESCE(v_student.balance::int, 0), v_sum_group);
  END IF;

  IF NOT (
    v_student.paid
    OR v_has_unlimited
    OR (v_effective_balance IS NOT NULL AND v_effective_balance > 0)
  ) THEN
    RAISE EXCEPTION 'No active membership. Please purchase a plan first.';
  END IF;

  IF NOT v_is_admin_call AND p_class_date < (now() AT TIME ZONE 'America/Mexico_City')::date THEN
    RAISE EXCEPTION 'Registration for this date is closed.';
  END IF;

  IF public.is_aure_school(p_school_id) AND NOT v_is_admin_call THEN
    IF EXTRACT(DAY FROM p_class_date)::int >= 15 THEN
      RAISE EXCEPTION 'From the 15th of the month onward, use Request clase suelta for each class.';
    END IF;
  END IF;

  IF public.is_aure_school(p_school_id) THEN
    IF v_student.level IS NULL OR trim(COALESCE(v_student.level, '')) = '' THEN
      RAISE EXCEPTION 'Level must be set by admin. Use "Request clase suelta" to request this class.';
    END IF;
    IF COALESCE(v_student.level, '') = 'principiante' AND v_class.day = 'Thu' THEN
      RAISE EXCEPTION 'Principiantes cannot register for Thursday classes.';
    END IF;
  END IF;

  v_ex := public.group_class_exception_resolve(p_school_id, p_class_id, p_class_date);
  IF NOT v_is_admin_call AND v_ex IS NOT NULL AND coalesce((v_ex->>'registration_closed')::boolean, false) THEN
    RAISE EXCEPTION '%', coalesce(nullif(trim(v_ex->>'occurrence_message'), ''), 'This class is not available on this date.');
  END IF;

  IF v_effective_balance IS NOT NULL THEN
    v_registered_count := 0;
    SELECT count(*) INTO v_registered_count FROM public.class_registrations
    WHERE student_id = p_student_id AND school_id = p_school_id AND class_date >= CURRENT_DATE
      AND status IN ('registered', 'pending') AND (deducted = false OR deducted IS NULL);
    v_available := v_effective_balance - v_registered_count;
    IF v_available < 1 THEN
      RAISE EXCEPTION 'You don''t have enough classes in your package. You have % left and are already registered for % classes, so you only have % classes left.', v_effective_balance, v_registered_count, GREATEST(0, v_available);
    END IF;
  END IF;

  IF v_class.max_capacity IS NOT NULL THEN
    SELECT count(*) INTO v_count FROM public.class_registrations
    WHERE class_id = p_class_id AND class_date = p_class_date AND status IN ('registered', 'pending');
    IF v_count >= v_class.max_capacity THEN RAISE EXCEPTION 'Class is full. No spots available.'; END IF;
  END IF;

  SELECT * INTO v_row FROM public.class_registrations
  WHERE class_id = p_class_id AND student_id = p_student_id AND class_date = p_class_date;

  IF FOUND THEN
    IF v_row.status = 'registered' THEN RAISE EXCEPTION 'Already registered for this class.'; END IF;
    UPDATE public.class_registrations SET status = 'registered', cancelled_at = NULL WHERE id = v_row.id RETURNING * INTO v_row;
  ELSE
    INSERT INTO public.class_registrations (class_id, student_id, school_id, class_date, status)
    VALUES (p_class_id, p_student_id, p_school_id, p_class_date, 'registered') RETURNING * INTO v_row;
  END IF;
  RETURN to_jsonb(v_row);
END;
$$;

COMMENT ON FUNCTION public.register_for_class(text, bigint, uuid, date) IS 'Register for one class; Aure days 1–14 allow any positive group credits; from day 15 use clase suelta.';
