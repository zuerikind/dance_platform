-- Aure: (1) First half of month — multiple H1 slots in same week → week-bundle RPC only, not suelta.
--         One remaining H1 slot in week → suelta OK. (2) Second half (day >= 15) → suelta only; direct register blocked for students.
-- (3) request_clase_suelta: enforce same balance as register_for_class.
-- Admin / platform admin bypass Aure phase rules on register_for_class / register_for_class_monthly.

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
  v_pack jsonb;
  v_effective_balance int;
  v_pack_count int;
  v_has_4_8_package boolean := false;
  v_registered_count int;
  v_available int;
  v_need int := 0;
  v_cd date;
  v_offset int;
  v_row public.class_registrations%ROWTYPE;
  v_results jsonb := '[]'::jsonb;
  v_count int;
BEGIN
  IF NOT public.is_aure_school(p_school_id) THEN
    RAISE EXCEPTION 'This flow is only available for Aure school.';
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

  v_effective_balance := COALESCE(v_student.balance::int, 0);
  IF v_student.active_packs IS NOT NULL AND jsonb_array_length(v_student.active_packs) > 0 THEN
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

GRANT EXECUTE ON FUNCTION public.register_for_aure_week_bundle(text, uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_for_aure_week_bundle(text, uuid, date) TO anon;

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
  v_pack_count int;
  v_has_4_8_package boolean := false;
  v_registered_count int;
  v_available int;
  v_other_h1_slots int := 0;
  v_monday date;
  v_offset int;
  v_cd date;
  v_c public.classes%ROWTYPE;
BEGIN
  IF NOT public.is_aure_school(p_school_id) THEN
    RAISE EXCEPTION 'This flow is only available for Aure school.';
  END IF;

  SELECT * INTO v_class FROM public.classes WHERE id = p_class_id AND school_id = p_school_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Class not found.'; END IF;

  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Student not found.'; END IF;

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

  IF COALESCE(v_student.level, '') = 'principiante' AND v_class.day IN ('Thu', 'Th', 'Thursday') THEN
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

  v_effective_balance := COALESCE(v_student.balance::int, 0);
  IF v_student.active_packs IS NOT NULL AND jsonb_array_length(v_student.active_packs) > 0 THEN
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

  IF v_effective_balance IS NOT NULL THEN
    SELECT count(*) INTO v_registered_count FROM public.class_registrations
    WHERE student_id = p_student_id AND school_id = p_school_id AND class_date >= CURRENT_DATE
      AND status IN ('registered', 'pending') AND (deducted = false OR deducted IS NULL);
    v_available := v_effective_balance - v_registered_count;
    IF v_available < 1 THEN
      RAISE EXCEPTION 'You don''t have enough classes in your package. You have % left and are already registered for % classes, so you only have % classes left.',
        v_effective_balance, v_registered_count, GREATEST(0, v_available);
    END IF;
  END IF;

  IF v_has_4_8_package AND EXTRACT(DAY FROM p_class_date)::int <= 14 THEN
    v_monday := p_class_date - (EXTRACT(ISODOW FROM p_class_date)::int - 1);
    FOR v_c IN SELECT * FROM public.classes WHERE school_id = p_school_id
    LOOP
      IF COALESCE(v_student.level, '') = 'principiante' AND v_c.day IN ('Thu', 'Th', 'Thursday') THEN
        CONTINUE;
      END IF;
      v_offset := CASE trim(v_c.day)
        WHEN 'Mon' THEN 0 WHEN 'Mo' THEN 0 WHEN 'Monday' THEN 0
        WHEN 'Tue' THEN 1 WHEN 'Tu' THEN 1 WHEN 'Tuesday' THEN 1
        WHEN 'Wed' THEN 2 WHEN 'We' THEN 2 WHEN 'Wednesday' THEN 2
        WHEN 'Thu' THEN 3 WHEN 'Th' THEN 3 WHEN 'Thursday' THEN 3
        WHEN 'Fri' THEN 4 WHEN 'Fr' THEN 4 WHEN 'Friday' THEN 4
        WHEN 'Sat' THEN 5 WHEN 'Sa' THEN 5 WHEN 'Saturday' THEN 5
        WHEN 'Sun' THEN 6 WHEN 'Su' THEN 6 WHEN 'Sunday' THEN 6
        ELSE NULL END;
      IF v_offset IS NULL THEN CONTINUE; END IF;
      v_cd := v_monday + v_offset;
      IF v_cd < CURRENT_DATE THEN CONTINUE; END IF;
      IF EXTRACT(DAY FROM v_cd)::int > 14 THEN CONTINUE; END IF;
      IF v_c.id = p_class_id AND v_cd = p_class_date THEN CONTINUE; END IF;
      IF NOT EXISTS (
        SELECT 1 FROM public.class_registrations
        WHERE class_id = v_c.id AND student_id = p_student_id AND class_date = v_cd AND status = 'registered'
      ) THEN
        v_other_h1_slots := v_other_h1_slots + 1;
      END IF;
    END LOOP;
    IF v_other_h1_slots > 0 THEN
      RAISE EXCEPTION 'In the first two weeks of the month, register for all classes of this week at once (use the week registration button), or wait until after the 14th to request classes one by one.';
    END IF;
  END IF;

  IF v_class.max_capacity IS NOT NULL THEN
    SELECT count(*) INTO v_count FROM public.class_registrations
    WHERE class_id = p_class_id AND class_date = p_class_date AND status IN ('registered', 'pending');
    IF v_count >= v_class.max_capacity THEN
      RAISE EXCEPTION 'Class is full. No spots available.';
    END IF;
  END IF;

  SELECT * INTO v_row FROM public.class_registrations
  WHERE class_id = p_class_id AND student_id = p_student_id AND class_date = p_class_date;

  IF FOUND THEN
    IF v_row.status = 'registered' THEN RAISE EXCEPTION 'Already registered for this class.'; END IF;
    IF v_row.status = 'pending' THEN RETURN to_jsonb(v_row); END IF;
    UPDATE public.class_registrations SET status = 'pending', cancelled_at = NULL WHERE id = v_row.id RETURNING * INTO v_row;
  ELSE
    INSERT INTO public.class_registrations (class_id, student_id, school_id, class_date, status)
    VALUES (p_class_id, p_student_id, p_school_id, p_class_date, 'pending') RETURNING * INTO v_row;
  END IF;

  RETURN to_jsonb(v_row);
END;
$$;

-- Students: Aure + day 15+ → no direct register (clase suelta only for self-serve)
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
  v_registered_count int;
  v_available int;
  v_is_admin_call boolean;
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

  v_effective_balance := COALESCE(v_student.balance::int, 0);
  IF v_student.active_packs IS NOT NULL AND jsonb_array_length(v_student.active_packs) > 0 THEN
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
  v_registered_count int;
  v_available int;
  v_need_new int;
  v_already_registered int;
  v_is_admin_call boolean;
BEGIN
  v_is_admin_call := public.is_school_admin(p_school_id) OR public.is_platform_admin();
  v_num_dates := array_length(p_dates, 1);
  IF v_num_dates IS NULL OR v_num_dates = 0 THEN RAISE EXCEPTION 'No dates provided.'; END IF;

  IF public.is_aure_school(p_school_id) AND NOT v_is_admin_call THEN
    RAISE EXCEPTION 'Aure uses week registration (days 1–14) or Request clase suelta per class (from the 15th). Monthly registration is not used.';
  END IF;

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

  v_effective_balance := COALESCE(v_student.balance::int, 0);
  IF v_student.active_packs IS NOT NULL AND jsonb_array_length(v_student.active_packs) > 0 THEN
    FOR v_pack IN SELECT * FROM jsonb_array_elements(v_student.active_packs)
    LOOP
      IF (v_pack->>'expires_at') IS NULL OR (v_pack->>'expires_at')::timestamptz > now() THEN
        IF v_pack->>'count' IS NULL OR v_pack->>'count' = 'null' THEN v_effective_balance := NULL; EXIT; END IF;
        v_pack_count := COALESCE((v_pack->>'count')::int, 0);
        v_effective_balance := COALESCE(v_effective_balance, 0) + v_pack_count;
      END IF;
    END LOOP;
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
