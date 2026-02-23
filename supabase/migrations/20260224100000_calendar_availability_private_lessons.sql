-- Calendar + Availability + Private Lessons: tables, RLS, and RPCs.
-- Deduction only on QR check-in (mark_private_lesson_attended), late cancel (< 4h), or no-show.
-- No deduction on teacher accept.

-- 1) teacher_availability_settings: one row per school (timezone, min notice, duration options, buffer, late cancel)
CREATE TABLE IF NOT EXISTS public.teacher_availability_settings (
  school_id uuid PRIMARY KEY REFERENCES public.schools(id) ON DELETE CASCADE,
  timezone text NOT NULL DEFAULT 'UTC',
  min_notice_minutes int NOT NULL DEFAULT 360,
  duration_minutes int[] NOT NULL DEFAULT ARRAY[60],
  buffer_minutes int NOT NULL DEFAULT 15,
  late_cancel_minutes int NOT NULL DEFAULT 240,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.teacher_availability_settings IS 'Per-school settings for private teacher availability and cancellation policy.';

ALTER TABLE public.teacher_availability_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tav_settings_select" ON public.teacher_availability_settings;
CREATE POLICY "tav_settings_select" ON public.teacher_availability_settings
  FOR SELECT USING (
    public.is_school_admin(school_id)
    OR public.is_platform_admin()
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.school_id = teacher_availability_settings.school_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tav_settings_insert" ON public.teacher_availability_settings;
CREATE POLICY "tav_settings_insert" ON public.teacher_availability_settings
  FOR INSERT WITH CHECK (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "tav_settings_update" ON public.teacher_availability_settings;
CREATE POLICY "tav_settings_update" ON public.teacher_availability_settings
  FOR UPDATE USING (public.is_school_admin(school_id) OR public.is_platform_admin());

-- 2) teacher_availability: add timezone (optional, fallback to settings)
ALTER TABLE public.teacher_availability
  ADD COLUMN IF NOT EXISTS timezone text;

-- 3) teacher_blocked_times
CREATE TABLE IF NOT EXISTS public.teacher_blocked_times (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  start_at_utc timestamptz NOT NULL,
  end_at_utc timestamptz NOT NULL,
  reason text,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'external')),
  external_ref text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_blocked_school_range ON public.teacher_blocked_times(school_id, start_at_utc, end_at_utc);

ALTER TABLE public.teacher_blocked_times ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tbt_select" ON public.teacher_blocked_times;
CREATE POLICY "tbt_select" ON public.teacher_blocked_times
  FOR SELECT USING (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "tbt_insert" ON public.teacher_blocked_times;
CREATE POLICY "tbt_insert" ON public.teacher_blocked_times
  FOR INSERT WITH CHECK (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "tbt_delete" ON public.teacher_blocked_times;
CREATE POLICY "tbt_delete" ON public.teacher_blocked_times
  FOR DELETE USING (public.is_school_admin(school_id) OR public.is_platform_admin());

-- 4) private_class_requests: add start_at_utc, end_at_utc (set when lesson is created on accept)
ALTER TABLE public.private_class_requests
  ADD COLUMN IF NOT EXISTS start_at_utc timestamptz,
  ADD COLUMN IF NOT EXISTS end_at_utc timestamptz;

-- 5) private_lessons: confirmed lessons (created on accept; no deduction until check-in / late cancel / no-show)
CREATE TABLE IF NOT EXISTS public.private_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL UNIQUE REFERENCES public.private_class_requests(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id text NOT NULL,
  start_at_utc timestamptz NOT NULL,
  end_at_utc timestamptz NOT NULL,
  package_id uuid,
  credits_used int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'attended', 'cancelled', 'no_show')),
  credit_deducted boolean NOT NULL DEFAULT false,
  attended_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by text CHECK (cancelled_by IS NULL OR cancelled_by IN ('student', 'teacher', 'system')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_private_lessons_school_start ON public.private_lessons(school_id, start_at_utc);
CREATE INDEX IF NOT EXISTS idx_private_lessons_student_start ON public.private_lessons(student_id, start_at_utc);

ALTER TABLE public.private_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pl_select_teacher" ON public.private_lessons;
CREATE POLICY "pl_select_teacher" ON public.private_lessons
  FOR SELECT USING (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "pl_select_student" ON public.private_lessons;
CREATE POLICY "pl_select_student" ON public.private_lessons
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = private_lessons.student_id AND s.user_id = auth.uid())
  );

-- Insert/update only via RPCs (teacher_respond_to_request, etc.)
DROP POLICY IF EXISTS "pl_insert_service" ON public.private_lessons;
CREATE POLICY "pl_insert_service" ON public.private_lessons
  FOR INSERT WITH CHECK (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "pl_update_service" ON public.private_lessons;
CREATE POLICY "pl_update_service" ON public.private_lessons
  FOR UPDATE USING (public.is_school_admin(school_id) OR public.is_platform_admin());

-- 6) RPC: get_teacher_availability_settings
CREATE OR REPLACE FUNCTION public.get_teacher_availability_settings(p_school_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT to_jsonb(t) FROM public.teacher_availability_settings t WHERE t.school_id = p_school_id LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_teacher_availability_settings(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_teacher_availability_settings(uuid) TO anon;

-- 7) RPC: upsert_teacher_availability_settings
CREATE OR REPLACE FUNCTION public.upsert_teacher_availability_settings(
  p_school_id uuid,
  p_timezone text DEFAULT NULL,
  p_min_notice_minutes int DEFAULT NULL,
  p_duration_minutes int[] DEFAULT NULL,
  p_buffer_minutes int DEFAULT NULL,
  p_late_cancel_minutes int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_row public.teacher_availability_settings%ROWTYPE;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  INSERT INTO public.teacher_availability_settings (school_id, timezone, min_notice_minutes, duration_minutes, buffer_minutes, late_cancel_minutes, updated_at)
  VALUES (
    p_school_id,
    COALESCE(nullif(trim(p_timezone), ''), 'UTC'),
    COALESCE(p_min_notice_minutes, 360),
    COALESCE(p_duration_minutes, ARRAY[60]),
    COALESCE(p_buffer_minutes, 15),
    COALESCE(p_late_cancel_minutes, 240),
    now()
  )
  ON CONFLICT (school_id) DO UPDATE SET
    timezone = COALESCE(nullif(trim(p_timezone), ''), teacher_availability_settings.timezone),
    min_notice_minutes = COALESCE(p_min_notice_minutes, teacher_availability_settings.min_notice_minutes),
    duration_minutes = COALESCE(p_duration_minutes, teacher_availability_settings.duration_minutes),
    buffer_minutes = COALESCE(p_buffer_minutes, teacher_availability_settings.buffer_minutes),
    late_cancel_minutes = COALESCE(p_late_cancel_minutes, teacher_availability_settings.late_cancel_minutes),
    updated_at = now()
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.upsert_teacher_availability_settings(uuid, text, int, int[], int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_teacher_availability_settings(uuid, text, int, int[], int, int) TO anon;

-- 8) RPC: get_teacher_blocked_times
CREATE OR REPLACE FUNCTION public.get_teacher_blocked_times(
  p_school_id uuid,
  p_start_utc timestamptz DEFAULT NULL,
  p_end_utc timestamptz DEFAULT NULL
)
RETURNS SETOF public.teacher_blocked_times
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.teacher_blocked_times
  WHERE school_id = p_school_id
    AND (p_start_utc IS NULL OR end_at_utc >= p_start_utc)
    AND (p_end_utc IS NULL OR start_at_utc <= p_end_utc)
  ORDER BY start_at_utc;
$$;
GRANT EXECUTE ON FUNCTION public.get_teacher_blocked_times(uuid, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_teacher_blocked_times(uuid, timestamptz, timestamptz) TO anon;

-- 9) RPC: insert_teacher_blocked_time
CREATE OR REPLACE FUNCTION public.insert_teacher_blocked_time(
  p_school_id uuid,
  p_start_at_utc timestamptz,
  p_end_at_utc timestamptz,
  p_reason text DEFAULT NULL,
  p_source text DEFAULT 'manual'
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_row public.teacher_blocked_times%ROWTYPE;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  IF p_end_at_utc <= p_start_at_utc THEN
    RAISE EXCEPTION 'end_at_utc must be after start_at_utc';
  END IF;
  INSERT INTO public.teacher_blocked_times (school_id, start_at_utc, end_at_utc, reason, source)
  VALUES (p_school_id, p_start_at_utc, p_end_at_utc, nullif(trim(p_reason), ''), COALESCE(nullif(trim(p_source), ''), 'manual'))
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.insert_teacher_blocked_time(uuid, timestamptz, timestamptz, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_teacher_blocked_time(uuid, timestamptz, timestamptz, text, text) TO anon;

-- 10) RPC: delete_teacher_blocked_time
CREATE OR REPLACE FUNCTION public.delete_teacher_blocked_time(p_id uuid, p_school_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  DELETE FROM public.teacher_blocked_times WHERE id = p_id AND school_id = p_school_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.delete_teacher_blocked_time(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_teacher_blocked_time(uuid, uuid) TO anon;

-- 11) teacher_respond_to_request: on accept create private_lesson and set request start_at_utc/end_at_utc; NO deduction
CREATE OR REPLACE FUNCTION public.teacher_respond_to_request(p_request_id uuid, p_accept boolean)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
  v_student_id text;
  v_req public.private_class_requests%ROWTYPE;
  v_settings public.teacher_availability_settings%ROWTYPE;
  v_duration_minutes int := 60;
  v_tz text := 'UTC';
  v_start_utc timestamptz;
  v_end_utc timestamptz;
  v_overlap boolean;
  v_lesson public.private_lessons%ROWTYPE;
BEGIN
  SELECT * INTO v_req FROM public.private_class_requests WHERE id = p_request_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Request not found'; END IF;
  v_school_id := v_req.school_id;
  v_student_id := v_req.student_id;

  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  IF NOT p_accept THEN
    UPDATE public.private_class_requests
    SET status = 'declined', responded_at = now()
    WHERE id = p_request_id
    RETURNING * INTO v_req;
    RETURN to_jsonb(v_req);
  END IF;

  -- Accept: need start_at_utc, end_at_utc from requested_date + requested_time + duration and timezone
  SELECT * INTO v_settings FROM public.teacher_availability_settings WHERE school_id = v_school_id LIMIT 1;
  IF FOUND THEN
    v_tz := COALESCE(nullif(trim(v_settings.timezone), ''), 'UTC');
    IF v_settings.duration_minutes IS NOT NULL AND array_length(v_settings.duration_minutes, 1) > 0 THEN
      v_duration_minutes := v_settings.duration_minutes[1];
    END IF;
  END IF;

  v_start_utc := ((v_req.requested_date::text || ' ' || coalesce(v_req.requested_time, '09:00'))::timestamp AT TIME ZONE v_tz) AT TIME ZONE 'UTC';
  v_end_utc := v_start_utc + (v_duration_minutes || ' minutes')::interval;

  -- Overlap check: no confirmed private_lesson in same window
  SELECT EXISTS (
    SELECT 1 FROM public.private_lessons pl
    WHERE pl.school_id = v_school_id AND pl.status IN ('confirmed', 'attended')
      AND (pl.start_at_utc, pl.end_at_utc) OVERLAPS (v_start_utc, v_end_utc)
  ) INTO v_overlap;
  IF v_overlap THEN
    RAISE EXCEPTION 'Slot no longer available';
  END IF;

  INSERT INTO public.private_lessons (request_id, school_id, student_id, start_at_utc, end_at_utc, status)
  VALUES (p_request_id, v_school_id, v_student_id, v_start_utc, v_end_utc, 'confirmed')
  RETURNING * INTO v_lesson;

  UPDATE public.private_class_requests
  SET status = 'accepted', responded_at = now(), start_at_utc = v_start_utc, end_at_utc = v_end_utc
  WHERE id = p_request_id
  RETURNING * INTO v_req;

  RETURN to_jsonb(v_req);
END;
$$;
GRANT EXECUTE ON FUNCTION public.teacher_respond_to_request(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.teacher_respond_to_request(uuid, boolean) TO anon;

-- 12) RPC: student_cancel_private_lesson (4h rule: if < 4h before start, deduct)
CREATE OR REPLACE FUNCTION public.student_cancel_private_lesson(p_lesson_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_lesson public.private_lessons%ROWTYPE;
  v_late_cancel_minutes int := 240;
  v_settings public.teacher_availability_settings%ROWTYPE;
  v_minutes_until_start numeric;
  v_do_deduct boolean := false;
BEGIN
  SELECT * INTO v_lesson FROM public.private_lessons WHERE id = p_lesson_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Lesson not found'; END IF;
  IF v_lesson.status <> 'confirmed' THEN
    RAISE EXCEPTION 'Lesson cannot be cancelled';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.students s WHERE s.id = v_lesson.student_id AND s.user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  SELECT * INTO v_settings FROM public.teacher_availability_settings WHERE school_id = v_lesson.school_id LIMIT 1;
  IF FOUND AND v_settings.late_cancel_minutes IS NOT NULL THEN
    v_late_cancel_minutes := v_settings.late_cancel_minutes;
  END IF;

  v_minutes_until_start := EXTRACT(EPOCH FROM (v_lesson.start_at_utc - now())) / 60.0;
  v_do_deduct := (v_minutes_until_start < v_late_cancel_minutes);

  UPDATE public.private_lessons
  SET status = 'cancelled', cancelled_at = now(), cancelled_by = 'student', credit_deducted = v_do_deduct
  WHERE id = p_lesson_id
  RETURNING * INTO v_lesson;

  IF v_do_deduct THEN
    PERFORM public.deduct_student_classes(v_lesson.student_id, v_lesson.school_id, 1, 'private');
  END IF;

  RETURN to_jsonb(v_lesson);
END;
$$;
GRANT EXECUTE ON FUNCTION public.student_cancel_private_lesson(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.student_cancel_private_lesson(uuid) TO anon;

-- 13) RPC: mark_private_lesson_attended (teacher; deduct on check-in)
CREATE OR REPLACE FUNCTION public.mark_private_lesson_attended(p_lesson_id uuid, p_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_lesson public.private_lessons%ROWTYPE;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  SELECT * INTO v_lesson FROM public.private_lessons WHERE id = p_lesson_id AND school_id = p_school_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Lesson not found'; END IF;
  IF v_lesson.status NOT IN ('confirmed', 'attended') THEN
    RAISE EXCEPTION 'Lesson cannot be marked attended';
  END IF;
  IF v_lesson.credit_deducted THEN
    UPDATE public.private_lessons SET status = 'attended', attended_at = COALESCE(attended_at, now()) WHERE id = p_lesson_id RETURNING * INTO v_lesson;
    RETURN to_jsonb(v_lesson);
  END IF;

  UPDATE public.private_lessons
  SET status = 'attended', attended_at = now(), credit_deducted = true
  WHERE id = p_lesson_id
  RETURNING * INTO v_lesson;

  PERFORM public.deduct_student_classes(v_lesson.student_id, p_school_id, 1, 'private');
  RETURN to_jsonb(v_lesson);
END;
$$;
GRANT EXECUTE ON FUNCTION public.mark_private_lesson_attended(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_private_lesson_attended(uuid, uuid) TO anon;

-- 14) RPC: mark_private_lesson_no_show (teacher; deduct)
CREATE OR REPLACE FUNCTION public.mark_private_lesson_no_show(p_lesson_id uuid, p_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_lesson public.private_lessons%ROWTYPE;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  SELECT * INTO v_lesson FROM public.private_lessons WHERE id = p_lesson_id AND school_id = p_school_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Lesson not found'; END IF;
  IF v_lesson.status <> 'confirmed' THEN
    RAISE EXCEPTION 'Lesson cannot be marked no-show';
  END IF;
  IF v_lesson.end_at_utc >= now() THEN
    RAISE EXCEPTION 'Cannot mark no-show before lesson end';
  END IF;
  IF v_lesson.credit_deducted THEN
    UPDATE public.private_lessons SET status = 'no_show' WHERE id = p_lesson_id RETURNING * INTO v_lesson;
    RETURN to_jsonb(v_lesson);
  END IF;

  UPDATE public.private_lessons
  SET status = 'no_show', credit_deducted = true
  WHERE id = p_lesson_id
  RETURNING * INTO v_lesson;

  PERFORM public.deduct_student_classes(v_lesson.student_id, p_school_id, 1, 'private');
  RETURN to_jsonb(v_lesson);
END;
$$;
GRANT EXECUTE ON FUNCTION public.mark_private_lesson_no_show(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_private_lesson_no_show(uuid, uuid) TO anon;

-- 15) get_available_slots_for_week: also block slots that overlap private_lessons (confirmed/attended) or teacher_blocked_times
CREATE OR REPLACE FUNCTION public.get_available_slots_for_week(p_school_id uuid, p_week_start date)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_result jsonb := '[]'::jsonb;
  v_day_date date;
  v_day_name text;
  v_day_idx int;
  v_slots jsonb;
  v_slot_time time;
  v_end_time time;
  v_start time;
  v_avail record;
  v_blocked boolean;
  v_day_names text[] := ARRAY['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  v_tz text := 'UTC';
  v_slot_start_utc timestamptz;
  v_slot_end_utc timestamptz;
  v_settings public.teacher_availability_settings%ROWTYPE;
BEGIN
  SELECT * INTO v_settings FROM public.teacher_availability_settings WHERE school_id = p_school_id LIMIT 1;
  IF FOUND AND v_settings.timezone IS NOT NULL AND trim(v_settings.timezone) <> '' THEN
    v_tz := v_settings.timezone;
  END IF;

  FOR v_day_idx IN 0..6 LOOP
    v_day_date := p_week_start + v_day_idx;
    v_day_name := v_day_names[v_day_idx + 1];
    v_slots := '[]'::jsonb;
    FOR v_avail IN
      SELECT start_time, end_time, location FROM public.teacher_availability
      WHERE school_id = p_school_id AND day_of_week = v_day_name
      ORDER BY start_time
    LOOP
      v_start := v_avail.start_time::time;
      v_end_time := v_avail.end_time::time;
      v_slot_time := v_start;
      WHILE v_slot_time < v_end_time LOOP
        v_blocked := EXISTS (
          SELECT 1 FROM public.private_class_requests pcr
          WHERE pcr.school_id = p_school_id
            AND pcr.requested_date = v_day_date
            AND pcr.requested_time = to_char(v_slot_time, 'HH24:MI')
            AND pcr.status IN ('pending', 'accepted')
        );
        IF NOT v_blocked THEN
          v_slot_start_utc := ((v_day_date::text || ' ' || to_char(v_slot_time, 'HH24:MI'))::timestamp AT TIME ZONE v_tz) AT TIME ZONE 'UTC';
          v_slot_end_utc := v_slot_start_utc + interval '30 minutes';
          v_blocked := EXISTS (
            SELECT 1 FROM public.private_lessons pl
            WHERE pl.school_id = p_school_id AND pl.status IN ('confirmed', 'attended')
              AND (pl.start_at_utc, pl.end_at_utc) OVERLAPS (v_slot_start_utc, v_slot_end_utc)
          ) OR EXISTS (
            SELECT 1 FROM public.teacher_blocked_times tbt
            WHERE tbt.school_id = p_school_id
              AND (tbt.start_at_utc, tbt.end_at_utc) OVERLAPS (v_slot_start_utc, v_slot_end_utc)
          );
        END IF;
        v_slots := v_slots || jsonb_build_object(
          'time', to_char(v_slot_time, 'HH24:MI'),
          'available', NOT v_blocked,
          'location', coalesce(v_avail.location, '')
        );
        v_slot_time := v_slot_time + interval '30 minutes';
      END LOOP;
    END LOOP;
    v_result := v_result || jsonb_build_array(jsonb_build_object(
      'date', to_char(v_day_date, 'YYYY-MM-DD'),
      'dayName', v_day_name,
      'dayNumber', extract(day from v_day_date)::int,
      'hasAvailability', jsonb_array_length(v_slots) > 0,
      'slots', v_slots
    ));
  END LOOP;
  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_available_slots_for_week(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_slots_for_week(uuid, date) TO anon;

-- 16) RPC: get_private_lessons_for_school (teacher view; for calendar and today's list)
CREATE OR REPLACE FUNCTION public.get_private_lessons_for_school(
  p_school_id uuid,
  p_from_utc timestamptz DEFAULT NULL,
  p_to_utc timestamptz DEFAULT NULL
)
RETURNS SETOF public.private_lessons
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.private_lessons
  WHERE school_id = p_school_id
    AND (p_from_utc IS NULL OR end_at_utc >= p_from_utc)
    AND (p_to_utc IS NULL OR start_at_utc <= p_to_utc)
  ORDER BY start_at_utc;
$$;
GRANT EXECUTE ON FUNCTION public.get_private_lessons_for_school(uuid, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_private_lessons_for_school(uuid, timestamptz, timestamptz) TO anon;

-- 17) RPC: get_student_private_lessons (student view; own lessons only)
CREATE OR REPLACE FUNCTION public.get_student_private_lessons(
  p_student_id text,
  p_school_id uuid,
  p_from_utc timestamptz DEFAULT NULL,
  p_to_utc timestamptz DEFAULT NULL
)
RETURNS SETOF public.private_lessons
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.private_lessons
  WHERE student_id = p_student_id AND school_id = p_school_id
    AND (p_from_utc IS NULL OR end_at_utc >= p_from_utc)
    AND (p_to_utc IS NULL OR start_at_utc <= p_to_utc)
  ORDER BY start_at_utc;
$$;
GRANT EXECUTE ON FUNCTION public.get_student_private_lessons(text, uuid, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_private_lessons(text, uuid, timestamptz, timestamptz) TO anon;
