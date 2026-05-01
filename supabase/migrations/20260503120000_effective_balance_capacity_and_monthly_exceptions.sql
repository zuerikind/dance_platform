-- Single effective group-credit number for capacity checks: GREATEST(balance, sum of
-- non-expired pack counts), or NULL when unlimited (null balance with suelta semantics,
-- or any active pack with null count). register_for_class / week bundle use
-- p_null_balance_means_unlimited = false (null balance treated as 0).

CREATE OR REPLACE FUNCTION public.student_effective_group_balance_for_capacity(
  p_balance numeric,
  p_active_packs jsonb,
  p_null_balance_means_unlimited boolean DEFAULT false
)
RETURNS int
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pack jsonb;
  v_sum_group int := 0;
  v_has_unlimited boolean := false;
BEGIN
  IF p_null_balance_means_unlimited AND p_balance IS NULL THEN
    v_has_unlimited := true;
  END IF;

  IF p_active_packs IS NOT NULL AND jsonb_array_length(p_active_packs) > 0 THEN
    FOR v_pack IN SELECT elem FROM jsonb_array_elements(p_active_packs) AS elem
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
    RETURN NULL;
  END IF;

  RETURN GREATEST(COALESCE(p_balance::int, 0), v_sum_group);
END;
$$;

GRANT EXECUTE ON FUNCTION public.student_effective_group_balance_for_capacity(numeric, jsonb, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.student_effective_group_balance_for_capacity(numeric, jsonb, boolean) TO anon;

COMMENT ON FUNCTION public.student_effective_group_balance_for_capacity(numeric, jsonb, boolean) IS
  'Effective group credits for registration capacity: GREATEST(balance, sum of active pack counts), or NULL if unlimited.';

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
  v_has_4_8_package boolean := false;
  v_registered_count int;
  v_available int;
  v_is_admin_call boolean;
  v_ex jsonb;
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

  IF NOT v_student.paid THEN
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

  v_effective_balance := public.student_effective_group_balance_for_capacity(
    v_student.balance,
    v_student.active_packs,
    false
  );

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
  v_effective_balance int;
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

  IF NOT v_student.paid THEN
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

  v_effective_balance := public.student_effective_group_balance_for_capacity(
    v_student.balance,
    v_student.active_packs,
    true
  );

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
  v_has_4_8_package boolean := false;
  v_registered_count int;
  v_available int;
  v_need_new int;
  v_already_registered int;
  v_first_date date;
  v_is_admin_call boolean := false;
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

  IF NOT v_student.paid THEN RAISE EXCEPTION 'No active membership. Please purchase a plan first.'; END IF;

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

  v_effective_balance := public.student_effective_group_balance_for_capacity(
    v_student.balance,
    v_student.active_packs,
    true
  );

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

    IF v_is_admin_call THEN
      v_already_registered := 0;
      SELECT count(*) INTO v_already_registered
      FROM public.class_registrations
      WHERE student_id = p_student_id
        AND school_id = p_school_id
        AND class_date = ANY(p_dates)
        AND status = 'registered';
      v_need_new := v_num_dates - v_already_registered;
    ELSE
      v_need_new := 0;
      FOREACH v_date IN ARRAY p_dates
      LOOP
        IF v_date < (now() AT TIME ZONE 'America/Mexico_City')::date THEN
          CONTINUE;
        END IF;
        v_ex := public.group_class_exception_resolve(p_school_id, p_class_id, v_date);
        IF v_ex IS NOT NULL AND coalesce((v_ex->>'registration_closed')::boolean, false) THEN
          CONTINUE;
        END IF;
        SELECT count(*) INTO v_count
        FROM public.class_registrations
        WHERE class_id = p_class_id
          AND student_id = p_student_id
          AND class_date = v_date
          AND status = 'registered';
        IF v_count = 0 THEN
          v_need_new := v_need_new + 1;
        END IF;
      END LOOP;
    END IF;

    IF v_need_new > 0 AND v_available < v_need_new THEN
      RAISE EXCEPTION 'You don''t have enough classes in your package to sign up for % more classes. You have % left and are already registered for % classes, so you only have % classes left.',
        v_need_new, v_effective_balance, v_registered_count, GREATEST(0, v_available);
    END IF;
  END IF;

  FOREACH v_date IN ARRAY p_dates
  LOOP
    IF NOT v_is_admin_call THEN
      IF v_date < (now() AT TIME ZONE 'America/Mexico_City')::date THEN
        CONTINUE;
      END IF;
      v_ex := public.group_class_exception_resolve(p_school_id, p_class_id, v_date);
      IF v_ex IS NOT NULL AND coalesce((v_ex->>'registration_closed')::boolean, false) THEN
        CONTINUE;
      END IF;
    ELSE
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

  IF NOT v_is_admin_call AND coalesce(jsonb_array_length(v_results), 0) = 0 THEN
    RAISE EXCEPTION 'No classes available on the selected dates. Some may be cancelled or closed; check the schedule.';
  END IF;

  RETURN v_results;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_for_aure_week_bundle(
  p_student_id text,
  p_school_id uuid,
  p_week_monday date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student public.students%ROWTYPE;
  v_class public.classes%ROWTYPE;
  v_effective_balance int;
  v_has_4_8_package boolean := false;
  v_registered_count int;
  v_available int;
  v_need int := 0;
  v_cd date;
  v_offset int;
  v_row public.class_registrations%ROWTYPE;
  v_results jsonb := '[]'::jsonb;
  v_count int;
  v_is_admin_call boolean;
  v_ex jsonb;
BEGIN
  IF NOT public.is_aure_school(p_school_id) THEN
    RAISE EXCEPTION 'This flow is only available for Aure school.';
  END IF;

  v_is_admin_call := public.is_school_admin(p_school_id) OR public.is_platform_admin();

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

  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Student not found.'; END IF;
  IF NOT v_student.paid THEN RAISE EXCEPTION 'No active membership. Please purchase a plan first.'; END IF;

  IF v_student.level IS NULL OR trim(COALESCE(v_student.level, '')) = '' THEN
    RAISE EXCEPTION 'Level must be set by admin before registering.';
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
    RAISE EXCEPTION 'Week registration requires a 4 or 8 class package. Use Request clase suelta instead.';
  END IF;

  v_effective_balance := public.student_effective_group_balance_for_capacity(
    v_student.balance,
    v_student.active_packs,
    false
  );

  IF v_effective_balance IS NOT NULL THEN
    SELECT count(*) INTO v_registered_count FROM public.class_registrations
    WHERE student_id = p_student_id AND school_id = p_school_id AND class_date >= CURRENT_DATE
      AND status IN ('registered', 'pending') AND (deducted = false OR deducted IS NULL);
    v_available := v_effective_balance - v_registered_count;
  ELSE
    v_available := 999999;
  END IF;

  FOR v_class IN SELECT * FROM public.classes WHERE school_id = p_school_id ORDER BY id
  LOOP
    IF COALESCE(v_student.level, '') = 'principiante' AND v_class.day IN ('Thu', 'Th', 'Thursday') THEN
      CONTINUE;
    END IF;
    v_offset := CASE trim(v_class.day)
      WHEN 'Mon' THEN 0 WHEN 'Mo' THEN 0 WHEN 'Monday' THEN 0
      WHEN 'Tue' THEN 1 WHEN 'Tu' THEN 1 WHEN 'Tuesday' THEN 1
      WHEN 'Wed' THEN 2 WHEN 'We' THEN 2 WHEN 'Wednesday' THEN 2
      WHEN 'Thu' THEN 3 WHEN 'Th' THEN 3 WHEN 'Thursday' THEN 3
      WHEN 'Fri' THEN 4 WHEN 'Fr' THEN 4 WHEN 'Friday' THEN 4
      WHEN 'Sat' THEN 5 WHEN 'Sa' THEN 5 WHEN 'Saturday' THEN 5
      WHEN 'Sun' THEN 6 WHEN 'Su' THEN 6 WHEN 'Sunday' THEN 6
      ELSE NULL END;
    IF v_offset IS NULL THEN CONTINUE; END IF;
    v_cd := p_week_monday + v_offset;
    IF v_cd < CURRENT_DATE THEN CONTINUE; END IF;
    IF EXTRACT(DAY FROM v_cd)::int > 14 THEN CONTINUE; END IF;

    IF NOT v_is_admin_call THEN
      v_ex := public.group_class_exception_resolve(p_school_id, v_class.id, v_cd);
      IF v_ex IS NOT NULL AND coalesce((v_ex->>'registration_closed')::boolean, false) THEN
        CONTINUE;
      END IF;
    END IF;

    SELECT * INTO v_row FROM public.class_registrations
    WHERE class_id = v_class.id AND student_id = p_student_id AND class_date = v_cd AND status = 'registered';
    IF FOUND THEN CONTINUE; END IF;

    v_need := v_need + 1;
  END LOOP;

  IF v_need = 0 THEN
    RAISE EXCEPTION 'No classes to register in the first half of this week, or you are already registered for those dates.';
  END IF;

  IF v_effective_balance IS NOT NULL AND v_available < v_need THEN
    RAISE EXCEPTION 'You don''t have enough classes in your package. You have % left and are already registered for % classes, so you only have % classes left; you need % for this week.',
      v_effective_balance, v_registered_count, GREATEST(0, v_available), v_need;
  END IF;

  FOR v_class IN SELECT * FROM public.classes WHERE school_id = p_school_id ORDER BY id
  LOOP
    IF COALESCE(v_student.level, '') = 'principiante' AND v_class.day IN ('Thu', 'Th', 'Thursday') THEN
      CONTINUE;
    END IF;
    v_offset := CASE trim(v_class.day)
      WHEN 'Mon' THEN 0 WHEN 'Mo' THEN 0 WHEN 'Monday' THEN 0
      WHEN 'Tue' THEN 1 WHEN 'Tu' THEN 1 WHEN 'Tuesday' THEN 1
      WHEN 'Wed' THEN 2 WHEN 'We' THEN 2 WHEN 'Wednesday' THEN 2
      WHEN 'Thu' THEN 3 WHEN 'Th' THEN 3 WHEN 'Thursday' THEN 3
      WHEN 'Fri' THEN 4 WHEN 'Fr' THEN 4 WHEN 'Friday' THEN 4
      WHEN 'Sat' THEN 5 WHEN 'Sa' THEN 5 WHEN 'Saturday' THEN 5
      WHEN 'Sun' THEN 6 WHEN 'Su' THEN 6 WHEN 'Sunday' THEN 6
      ELSE NULL END;
    IF v_offset IS NULL THEN CONTINUE; END IF;
    v_cd := p_week_monday + v_offset;
    IF v_cd < CURRENT_DATE THEN CONTINUE; END IF;
    IF EXTRACT(DAY FROM v_cd)::int > 14 THEN CONTINUE; END IF;

    IF NOT v_is_admin_call THEN
      v_ex := public.group_class_exception_resolve(p_school_id, v_class.id, v_cd);
      IF v_ex IS NOT NULL AND coalesce((v_ex->>'registration_closed')::boolean, false) THEN
        CONTINUE;
      END IF;
    END IF;

    IF v_class.max_capacity IS NOT NULL THEN
      SELECT count(*) INTO v_count FROM public.class_registrations
      WHERE class_id = v_class.id AND class_date = v_cd AND status IN ('registered', 'pending');
      IF v_count >= v_class.max_capacity THEN
        RAISE EXCEPTION 'Class is full on %.', v_cd;
      END IF;
    END IF;

    SELECT * INTO v_row FROM public.class_registrations
    WHERE class_id = v_class.id AND student_id = p_student_id AND class_date = v_cd;
    IF FOUND THEN
      IF v_row.status = 'registered' THEN CONTINUE; END IF;
      UPDATE public.class_registrations SET status = 'registered', cancelled_at = NULL WHERE id = v_row.id RETURNING * INTO v_row;
    ELSE
      INSERT INTO public.class_registrations (class_id, student_id, school_id, class_date, status)
      VALUES (v_class.id, p_student_id, p_school_id, v_cd, 'registered') RETURNING * INTO v_row;
    END IF;
    v_results := v_results || to_jsonb(v_row);
  END LOOP;

  RETURN v_results;
END;
$$;
