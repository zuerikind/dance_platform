-- =============================================================================
-- RUN THIS IN SUPABASE SQL EDITOR (same project where you see the check = false)
-- Dashboard: https://supabase.com/dashboard/project/fziyybqhecfxhkagknvg
-- Copy this ENTIRE file, paste into SQL Editor, click Run.
-- Then run: SELECT prosrc LIKE '%You don''t have enough classes%' FROM pg_proc WHERE proname = 'register_for_class';
-- It should return true.
-- =============================================================================

DROP FUNCTION IF EXISTS public.register_for_class(text, bigint, uuid, date);
DROP FUNCTION IF EXISTS public.register_for_class_monthly(text, bigint, uuid, date[]);

CREATE FUNCTION public.register_for_class(
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
  v_registered_count int;
  v_available int;
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
  IF NOT FOUND THEN RAISE EXCEPTION 'Class not found.'; END IF;

  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Student not found.'; END IF;

  IF NOT v_student.paid THEN
    RAISE EXCEPTION 'No active membership. Please purchase a plan first.';
  END IF;

  IF public.is_aure_school(p_school_id) THEN
    IF v_student.level IS NULL OR trim(COALESCE(v_student.level, '')) = '' THEN
      RAISE EXCEPTION 'Level must be set by admin. Use "Request clase suelta" to request this class.';
    END IF;
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

  -- Effective balance: use pack sum when any non-expired packs exist (avoid double-count with balance).
  v_effective_balance := NULL;
  IF v_student.active_packs IS NOT NULL AND jsonb_array_length(v_student.active_packs) > 0 THEN
    v_effective_balance := 0;
    FOR v_pack IN SELECT elem FROM jsonb_array_elements(v_student.active_packs) AS elem
    LOOP
      IF (v_pack->>'expires_at') IS NULL OR (v_pack->>'expires_at')::timestamptz > now() THEN
        IF v_pack->>'count' IS NULL OR v_pack->>'count' = 'null' OR (v_pack->>'count')::int IS NULL THEN
          v_effective_balance := NULL; EXIT;
        END IF;
        v_pack_count := COALESCE((v_pack->>'count')::int, 0);
        v_effective_balance := COALESCE(v_effective_balance, 0) + v_pack_count;
      END IF;
    END LOOP;
  END IF;
  IF v_effective_balance IS NULL THEN
    v_effective_balance := COALESCE(v_student.balance::int, 0);
  END IF;
  IF v_effective_balance IS NOT NULL THEN
    v_registered_count := 0;
    SELECT count(*) INTO v_registered_count
    FROM public.class_registrations
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

GRANT EXECUTE ON FUNCTION public.register_for_class(text, bigint, uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_for_class(text, bigint, uuid, date) TO anon;

CREATE FUNCTION public.register_for_class_monthly(
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
  v_registered_count int;
  v_available int;
  v_need_new int;
  v_already_registered int;
BEGIN
  v_num_dates := array_length(p_dates, 1);
  IF v_num_dates IS NULL OR v_num_dates = 0 THEN RAISE EXCEPTION 'No dates provided.'; END IF;

  SELECT * INTO v_class FROM public.classes WHERE id = p_class_id AND school_id = p_school_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Class not found.'; END IF;

  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Student not found.'; END IF;

  IF NOT v_student.paid THEN RAISE EXCEPTION 'No active membership. Please purchase a plan first.'; END IF;

  IF public.is_aure_school(p_school_id) THEN
    IF v_student.level IS NULL OR trim(COALESCE(v_student.level, '')) = '' THEN
      RAISE EXCEPTION 'Level must be set by admin. Use "Request clase suelta" to request classes.';
    END IF;
    IF COALESCE(v_student.level, '') = 'principiante' AND v_class.day = 'Thu' THEN
      RAISE EXCEPTION 'Principiantes cannot register for Thursday classes. Monthly registration not available.';
    END IF;
    SELECT EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(v_student.active_packs, '[]'::jsonb)) AS elem
      WHERE ((elem->>'expires_at')::timestamptz IS NULL OR (elem->>'expires_at')::timestamptz > now())
        AND ((elem->>'plan_limit')::int IN (4, 8) OR (elem->>'count')::int IN (4, 8))
    ) INTO v_has_4_8_package;
    IF NOT v_has_4_8_package THEN RAISE EXCEPTION 'Monthly registration requires a 4 or 8 class package.'; END IF;
  END IF;

  -- Effective balance: use pack sum when any non-expired packs exist (avoid double-count with balance).
  v_effective_balance := NULL;
  IF v_student.active_packs IS NOT NULL AND jsonb_array_length(v_student.active_packs) > 0 THEN
    v_effective_balance := 0;
    FOR v_pack IN SELECT * FROM jsonb_array_elements(v_student.active_packs)
    LOOP
      IF (v_pack->>'expires_at') IS NULL OR (v_pack->>'expires_at')::timestamptz > now() THEN
        IF v_pack->>'count' IS NULL OR v_pack->>'count' = 'null' THEN v_effective_balance := NULL; EXIT; END IF;
        v_pack_count := COALESCE((v_pack->>'count')::int, 0);
        v_effective_balance := COALESCE(v_effective_balance, 0) + v_pack_count;
      END IF;
    END LOOP;
  END IF;
  IF v_effective_balance IS NULL THEN
    v_effective_balance := COALESCE(v_student.balance::int, 0);
  END IF;
  IF v_effective_balance IS NOT NULL THEN
    v_registered_count := 0;
    SELECT count(*) INTO v_registered_count FROM public.class_registrations
    WHERE student_id = p_student_id AND school_id = p_school_id AND class_date >= CURRENT_DATE
      AND status IN ('registered', 'pending') AND (deducted = false OR deducted IS NULL);
    v_available := v_effective_balance - v_registered_count;
    v_already_registered := 0;
    SELECT count(*) INTO v_already_registered FROM public.class_registrations
    WHERE student_id = p_student_id AND school_id = p_school_id AND class_date = ANY(p_dates) AND status = 'registered';
    v_need_new := v_num_dates - v_already_registered;
    IF v_need_new > 0 AND v_available < v_need_new THEN
      RAISE EXCEPTION 'You don''t have enough classes in your package to sign up for % more classes. You have % left and are already registered for % classes, so you only have % classes left.', v_need_new, v_effective_balance, v_registered_count, GREATEST(0, v_available);
    END IF;
  END IF;

  FOREACH v_date IN ARRAY p_dates
  LOOP
    IF v_class.max_capacity IS NOT NULL THEN
      SELECT count(*) INTO v_count FROM public.class_registrations
      WHERE class_id = p_class_id AND class_date = v_date AND status IN ('registered', 'pending');
      IF v_count >= v_class.max_capacity THEN RAISE EXCEPTION 'Class is full on %. No spots available.', v_date; END IF;
    END IF;
    SELECT * INTO v_row FROM public.class_registrations
    WHERE class_id = p_class_id AND student_id = p_student_id AND class_date = v_date;
    IF FOUND THEN
      IF v_row.status = 'registered' THEN v_results := v_results || to_jsonb(v_row); CONTINUE; END IF;
      UPDATE public.class_registrations SET status = 'registered', cancelled_at = NULL, is_monthly = true WHERE id = v_row.id RETURNING * INTO v_row;
    ELSE
      INSERT INTO public.class_registrations (class_id, student_id, school_id, class_date, status, is_monthly)
      VALUES (p_class_id, p_student_id, p_school_id, v_date, 'registered', true) RETURNING * INTO v_row;
    END IF;
    v_results := v_results || to_jsonb(v_row);
  END LOOP;
  RETURN v_results;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_for_class_monthly(text, bigint, uuid, date[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_for_class_monthly(text, bigint, uuid, date[]) TO anon;
