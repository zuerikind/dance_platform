-- Root cause: admin UI shows "Impago" from students.paid but class counts from getEffectiveBalances
-- (max(balance, sum of non-expired pack counts)). Registration RPCs required paid=true before any balance
-- check, so students with classes but paid=false always got "No active membership".
--
-- Fix: allow registration when paid OR unlimited OR effective group balance > 0 (same basis as monthly RPC).
-- Also fix register_for_class to use GREATEST(balance, sum packs) instead of balance + sum (double-count).

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
  v_has_4_8_package boolean := false;
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
    RAISE EXCEPTION 'In the first two weeks, use week registration to sign up for all classes of the week at once, or Request clase suelta if only one class remains in that week.';
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
  v_pack jsonb;
  v_effective_balance int;
  v_sum_group int := 0;
  v_has_unlimited boolean := false;
  v_registered_count int;
  v_available int;
  v_is_admin_call boolean;
  v_ex jsonb;
BEGIN
  IF NOT public.is_aure_school(p_school_id) THEN
    RAISE EXCEPTION 'This flow is only available for Aure school.';
  END IF;

  v_is_admin_call := public.is_school_admin(p_school_id) OR public.is_platform_admin();

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

  IF COALESCE(v_student.level, '') = 'principiante' AND v_class.day IN ('Thu', 'Th', 'Thursday') THEN
    RAISE EXCEPTION 'Principiantes cannot register for Thursday classes.';
  END IF;

  v_ex := public.group_class_exception_resolve(p_school_id, p_class_id, p_class_date);
  IF NOT v_is_admin_call AND v_ex IS NOT NULL AND coalesce((v_ex->>'registration_closed')::boolean, false) THEN
    RAISE EXCEPTION '%', coalesce(nullif(trim(v_ex->>'occurrence_message'), ''), 'This class is not available on this date.');
  END IF;

  IF v_effective_balance IS NOT NULL THEN
    SELECT count(*) INTO v_registered_count
    FROM public.class_registrations
    WHERE student_id = p_student_id
      AND school_id = p_school_id
      AND class_date >= CURRENT_DATE
      AND status IN ('registered', 'pending')
      AND (deducted = false OR deducted IS NULL);
    v_available := v_effective_balance - v_registered_count;
    IF v_available < 1 THEN
      RAISE EXCEPTION 'You don''t have enough classes in your package. You have % left and are already registered for % classes, so you only have % classes left.',
        v_effective_balance, v_registered_count, GREATEST(0, v_available);
    END IF;
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
  WHERE class_id = p_class_id
    AND student_id = p_student_id
    AND class_date = p_class_date;

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
  v_has_4_8_package boolean := false;
  v_registered_count int;
  v_available int;
  v_need_new int;
  v_already_registered int;
  v_first_date date;
  v_is_admin_call boolean := false;
  v_sum_group int := 0;
  v_has_unlimited boolean := false;
  v_ex jsonb;
BEGIN
  v_num_dates := array_length(p_dates, 1);
  IF v_num_dates IS NULL OR v_num_dates = 0 THEN RAISE EXCEPTION 'No dates provided.'; END IF;
  v_is_admin_call := public.is_school_admin(p_school_id) OR public.is_platform_admin();
  SELECT min(d) INTO v_first_date FROM unnest(p_dates) AS d;

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

  IF public.is_aure_school(p_school_id) THEN
    IF NOT v_is_admin_call AND v_first_date IS NOT NULL AND EXTRACT(DAY FROM v_first_date)::int > 14 THEN
      RAISE EXCEPTION 'From the third week onward, Aure students can only request clase suelta.';
    END IF;
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

  IF v_effective_balance IS NOT NULL THEN
    v_registered_count := 0;
    SELECT count(*) INTO v_registered_count
    FROM public.class_registrations
    WHERE student_id = p_student_id
      AND school_id = p_school_id
      AND class_date >= CURRENT_DATE
      AND status IN ('registered', 'pending')
      AND (deducted = false OR deducted IS NULL);
    v_available := v_effective_balance - v_registered_count;
    v_already_registered := 0;
    SELECT count(*) INTO v_already_registered
    FROM public.class_registrations
    WHERE student_id = p_student_id
      AND school_id = p_school_id
      AND class_date = ANY(p_dates)
      AND status = 'registered';
    v_need_new := v_num_dates - v_already_registered;
    IF v_need_new > 0 AND v_available < v_need_new THEN
      RAISE EXCEPTION 'You don''t have enough classes in your package to sign up for % more classes. You have % left and are already registered for % classes, so you only have % classes left.',
        v_need_new, v_effective_balance, v_registered_count, GREATEST(0, v_available);
    END IF;
  END IF;

  FOREACH v_date IN ARRAY p_dates
  LOOP
    IF NOT v_is_admin_call THEN
      IF v_date < (now() AT TIME ZONE 'America/Mexico_City')::date THEN
        RAISE EXCEPTION 'Registration for date % is closed.', v_date;
      END IF;
      v_ex := public.group_class_exception_resolve(p_school_id, p_class_id, v_date);
      IF v_ex IS NOT NULL AND coalesce((v_ex->>'registration_closed')::boolean, false) THEN
        RAISE EXCEPTION 'This class is not available on %: %', v_date,
          coalesce(nullif(trim(v_ex->>'occurrence_message'), ''), 'see schedule for details.');
      END IF;
    END IF;

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
