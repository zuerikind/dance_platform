-- Group class schedule exceptions: per-class or whole-school-day cancellations, info notes, special one-off messaging.
-- registration_closed = true for exception_kind IN ('cancelled', 'special'). 'info' shows message only.

CREATE TABLE IF NOT EXISTS public.group_class_occurrence_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id bigint REFERENCES public.classes(id) ON DELETE CASCADE,
  occurrence_date date NOT NULL,
  exception_kind text NOT NULL CHECK (exception_kind IN ('cancelled', 'info', 'special')),
  message text,
  display_title text,
  display_time text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.group_class_occurrence_exceptions IS 'Overrides for group class occurrences: cancel/special blocks self-serve registration; info is display-only.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_gcoe_school_day_whole
  ON public.group_class_occurrence_exceptions (school_id, occurrence_date)
  WHERE class_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_gcoe_school_class_day
  ON public.group_class_occurrence_exceptions (school_id, class_id, occurrence_date)
  WHERE class_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gcoe_school_date_range
  ON public.group_class_occurrence_exceptions (school_id, occurrence_date);

ALTER TABLE public.group_class_occurrence_exceptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gcoe_select" ON public.group_class_occurrence_exceptions;
CREATE POLICY "gcoe_select" ON public.group_class_occurrence_exceptions
  FOR SELECT USING (
    public.is_school_admin(school_id)
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "gcoe_insert" ON public.group_class_occurrence_exceptions;
CREATE POLICY "gcoe_insert" ON public.group_class_occurrence_exceptions
  FOR INSERT WITH CHECK (
    public.is_school_admin(school_id)
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "gcoe_delete" ON public.group_class_occurrence_exceptions;
CREATE POLICY "gcoe_delete" ON public.group_class_occurrence_exceptions
  FOR DELETE USING (
    public.is_school_admin(school_id)
    OR public.is_platform_admin()
  );

-- Class-specific row wins over whole-day row (checked first).
CREATE OR REPLACE FUNCTION public.group_class_exception_resolve(
  p_school_id uuid,
  p_class_id bigint,
  p_occurrence_date date
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.group_class_occurrence_exceptions%ROWTYPE;
BEGIN
  SELECT * INTO v_row
  FROM public.group_class_occurrence_exceptions
  WHERE school_id = p_school_id
    AND occurrence_date = p_occurrence_date
    AND class_id = p_class_id
  LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object(
      'exception_kind', v_row.exception_kind,
      'occurrence_message', v_row.message,
      'display_title', v_row.display_title,
      'display_time', v_row.display_time,
      'registration_closed', v_row.exception_kind IN ('cancelled', 'special')
    );
  END IF;

  SELECT * INTO v_row
  FROM public.group_class_occurrence_exceptions
  WHERE school_id = p_school_id
    AND occurrence_date = p_occurrence_date
    AND class_id IS NULL
  LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object(
      'exception_kind', v_row.exception_kind,
      'occurrence_message', v_row.message,
      'display_title', v_row.display_title,
      'display_time', v_row.display_time,
      'registration_closed', v_row.exception_kind IN ('cancelled', 'special')
    );
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_group_class_exceptions(
  p_school_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (
      SELECT jsonb_agg(sub.obj ORDER BY sub.occurrence_date, sub.class_id NULLS LAST)
      FROM (
        SELECT
          e.occurrence_date,
          e.class_id,
          jsonb_build_object(
            'id', e.id,
            'school_id', e.school_id,
            'class_id', e.class_id,
            'occurrence_date', e.occurrence_date,
            'exception_kind', e.exception_kind,
            'message', e.message,
            'display_title', e.display_title,
            'display_time', e.display_time,
            'created_at', e.created_at
          ) AS obj
        FROM public.group_class_occurrence_exceptions e
        WHERE e.school_id = p_school_id
          AND e.occurrence_date >= p_start_date
          AND e.occurrence_date <= p_end_date
      ) sub
    ),
    '[]'::jsonb
  );
$$;

CREATE OR REPLACE FUNCTION public.insert_group_class_exception(
  p_school_id uuid,
  p_occurrence_date date,
  p_class_id bigint DEFAULT NULL,
  p_exception_kind text DEFAULT 'cancelled',
  p_message text DEFAULT NULL,
  p_display_title text DEFAULT NULL,
  p_display_time text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.group_class_occurrence_exceptions%ROWTYPE;
  v_kind text;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  v_kind := lower(trim(coalesce(p_exception_kind, '')));
  IF v_kind NOT IN ('cancelled', 'info', 'special') THEN
    RAISE EXCEPTION 'Invalid exception_kind.';
  END IF;

  IF p_class_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = p_class_id AND c.school_id = p_school_id
    ) THEN
      RAISE EXCEPTION 'Class not found for this school.';
    END IF;
  END IF;

  INSERT INTO public.group_class_occurrence_exceptions (
    school_id, class_id, occurrence_date, exception_kind,
    message, display_title, display_time
  )
  VALUES (
    p_school_id,
    p_class_id,
    p_occurrence_date,
    v_kind,
    nullif(trim(p_message), ''),
    nullif(trim(p_display_title), ''),
    nullif(trim(p_display_time), '')
  )
  RETURNING * INTO v_row;

  RETURN to_jsonb(v_row);
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_group_class_exception(
  p_id uuid,
  p_school_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  DELETE FROM public.group_class_occurrence_exceptions
  WHERE id = p_id AND school_id = p_school_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.group_class_exception_resolve(uuid, bigint, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.group_class_exception_resolve(uuid, bigint, date) TO anon;
GRANT EXECUTE ON FUNCTION public.get_group_class_exceptions(uuid, date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_class_exceptions(uuid, date, date) TO anon;
GRANT EXECUTE ON FUNCTION public.insert_group_class_exception(uuid, date, bigint, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_group_class_exception(uuid, date, bigint, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.delete_group_class_exception(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_group_class_exception(uuid, uuid) TO anon;

-- -----------------------------------------------------------------------------
-- get_class_availability: attach occurrence_* keys when an exception exists
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_class_availability(
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
  v_class record;
  v_count int;
  v_ex jsonb;
BEGIN
  FOR v_class IN
    SELECT c.id, c.name, c.day, c.time, c.max_capacity
    FROM public.classes c
    WHERE c.school_id = p_school_id
  LOOP
    SELECT count(*) INTO v_count
    FROM public.class_registrations cr
    WHERE cr.class_id = v_class.id
      AND cr.class_date = p_class_date
      AND cr.status IN ('registered', 'pending');

    v_ex := public.group_class_exception_resolve(p_school_id, v_class.id, p_class_date);

    v_result := v_result || jsonb_build_object(
      'class_id', v_class.id,
      'class_name', v_class.name,
      'day', v_class.day,
      'time', v_class.time,
      'max_capacity', v_class.max_capacity,
      'registered_count', v_count,
      'spots_left', CASE
        WHEN v_class.max_capacity IS NULL THEN NULL
        ELSE GREATEST(v_class.max_capacity - v_count, 0)
      END,
      'occurrence_kind', CASE WHEN v_ex IS NULL THEN NULL ELSE v_ex->>'exception_kind' END,
      'occurrence_message', CASE WHEN v_ex IS NULL THEN NULL ELSE v_ex->>'occurrence_message' END,
      'display_title', CASE WHEN v_ex IS NULL THEN NULL ELSE v_ex->>'display_title' END,
      'display_time', CASE WHEN v_ex IS NULL THEN NULL ELSE v_ex->>'display_time' END,
      'registration_closed', CASE
        WHEN v_ex IS NULL THEN NULL
        ELSE (v_ex->>'registration_closed')::boolean
      END
    );
  END LOOP;

  RETURN v_result;
END;
$$;

-- -----------------------------------------------------------------------------
-- register_for_class (body from 20260319120000 + exception gate)
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

-- -----------------------------------------------------------------------------
-- register_for_aure_week_bundle: skip registration_closed dates for students only
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- request_clase_suelta (from 20260319143000 + exception gate)
-- -----------------------------------------------------------------------------
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

  IF NOT v_student.paid THEN
    RAISE EXCEPTION 'No active membership. Please purchase a plan first.';
  END IF;

  IF COALESCE(v_student.level, '') = 'principiante' AND v_class.day IN ('Thu', 'Th', 'Thursday') THEN
    RAISE EXCEPTION 'Principiantes cannot register for Thursday classes.';
  END IF;

  v_ex := public.group_class_exception_resolve(p_school_id, p_class_id, p_class_date);
  IF NOT v_is_admin_call AND v_ex IS NOT NULL AND coalesce((v_ex->>'registration_closed')::boolean, false) THEN
    RAISE EXCEPTION '%', coalesce(nullif(trim(v_ex->>'occurrence_message'), ''), 'This class is not available on this date.');
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

-- -----------------------------------------------------------------------------
-- register_for_class_monthly (from 20260319143000 + exception per date)
-- -----------------------------------------------------------------------------
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
