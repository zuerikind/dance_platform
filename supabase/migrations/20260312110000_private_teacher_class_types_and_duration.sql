-- Private teacher class types: duration_minutes on requests, create_private_class_request with
-- optional p_duration_minutes, teacher_respond_to_request uses request duration,
-- get_available_slots_for_week returns availableDurations per slot.
-- Backward compatible: existing callers (6 args) get default duration from settings.

-- 1) Add duration_minutes to private_class_requests
ALTER TABLE public.private_class_requests
  ADD COLUMN IF NOT EXISTS duration_minutes int DEFAULT NULL;

COMMENT ON COLUMN public.private_class_requests.duration_minutes
  IS 'Duration in minutes requested by student; used for overlap and when creating the lesson. NULL = use first duration from teacher_availability_settings.';

-- 2) Replace create_private_class_request: add optional p_duration_minutes (single signature, no overload)
DROP FUNCTION IF EXISTS public.create_private_class_request(uuid, text, date, text, text, text);

CREATE OR REPLACE FUNCTION public.create_private_class_request(
  p_school_id uuid,
  p_student_id text,
  p_requested_date date,
  p_requested_time text,
  p_location text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_duration_minutes int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_row public.private_class_requests%ROWTYPE;
  v_durations int[];
  v_duration int;
BEGIN
  IF NOT (
    public.is_school_admin(p_school_id)
    OR public.is_platform_admin()
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = p_student_id AND s.school_id = p_school_id AND s.user_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'Permission denied: only the student or admin can create a request';
  END IF;

  SELECT COALESCE(
    (SELECT duration_minutes FROM public.teacher_availability_settings WHERE school_id = p_school_id LIMIT 1),
    ARRAY[60]
  ) INTO v_durations;

  IF array_length(v_durations, 1) IS NULL OR array_length(v_durations, 1) < 1 THEN
    v_durations := ARRAY[60];
  END IF;

  IF p_duration_minutes IS NOT NULL THEN
    IF NOT (p_duration_minutes = ANY(v_durations)) THEN
      RAISE EXCEPTION 'Invalid duration: must be one of the teacher''s offered class lengths';
    END IF;
    v_duration := p_duration_minutes;
  ELSE
    v_duration := v_durations[1];
  END IF;

  INSERT INTO public.private_class_requests (school_id, student_id, requested_date, requested_time, location, message, duration_minutes)
  VALUES (p_school_id, p_student_id, p_requested_date, p_requested_time, nullif(trim(p_location), ''), nullif(trim(p_message), ''), v_duration)
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_private_class_request(uuid, text, date, text, text, text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_private_class_request(uuid, text, date, text, text, text, int) TO anon;

-- 3) teacher_respond_to_request: use request.duration_minutes when creating lesson (fallback to settings then 60)
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

  -- Duration: request first, then settings, then 60
  IF v_req.duration_minutes IS NOT NULL AND v_req.duration_minutes > 0 THEN
    v_duration_minutes := v_req.duration_minutes;
  ELSE
    SELECT * INTO v_settings FROM public.teacher_availability_settings WHERE school_id = v_school_id LIMIT 1;
    IF FOUND AND v_settings.duration_minutes IS NOT NULL AND array_length(v_settings.duration_minutes, 1) > 0 THEN
      v_duration_minutes := v_settings.duration_minutes[1];
    END IF;
  END IF;

  SELECT * INTO v_settings FROM public.teacher_availability_settings WHERE school_id = v_school_id LIMIT 1;
  IF FOUND AND v_settings.timezone IS NOT NULL AND trim(v_settings.timezone) <> '' THEN
    v_tz := v_settings.timezone;
  END IF;

  v_start_utc := ((v_req.requested_date::text || ' ' || coalesce(v_req.requested_time, '09:00'))::timestamp AT TIME ZONE v_tz) AT TIME ZONE 'UTC';
  v_end_utc := v_start_utc + (v_duration_minutes || ' minutes')::interval;

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

-- 4) get_available_slots_for_week: per-slot availableDurations; keep available for backward compat
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
  v_day_names text[] := ARRAY['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  v_tz text := 'UTC';
  v_slot_start_utc timestamptz;
  v_slot_end_utc timestamptz;
  v_settings public.teacher_availability_settings%ROWTYPE;
  v_durations int[];
  v_d int;
  v_ok boolean;
  v_req_start_utc timestamptz;
  v_req_end_utc timestamptz;
  v_avail_durations jsonb;
BEGIN
  SELECT * INTO v_settings FROM public.teacher_availability_settings WHERE school_id = p_school_id LIMIT 1;
  IF FOUND AND v_settings.timezone IS NOT NULL AND trim(v_settings.timezone) <> '' THEN
    v_tz := v_settings.timezone;
  END IF;
  v_durations := COALESCE(v_settings.duration_minutes, ARRAY[60]);
  IF array_length(v_durations, 1) IS NULL OR array_length(v_durations, 1) < 1 THEN
    v_durations := ARRAY[60];
  END IF;

  FOR v_day_idx IN 0..6 LOOP
    v_day_date := p_week_start + v_day_idx;
    v_day_name := v_day_names[v_day_idx + 1];
    v_slots := '[]'::jsonb;
    FOR v_avail IN
      SELECT start_time, end_time, location FROM public.teacher_availability
      WHERE school_id = p_school_id AND day_of_week = v_day_name
      ORDER BY (start_time::time)
    LOOP
      v_start := v_avail.start_time::time;
      v_end_time := v_avail.end_time::time;
      v_slot_time := v_start;
      WHILE v_slot_time < v_end_time LOOP
        v_slot_start_utc := ((v_day_date::text || ' ' || to_char(v_slot_time, 'HH24:MI'))::timestamp AT TIME ZONE v_tz) AT TIME ZONE 'UTC';
        v_avail_durations := '[]'::jsonb;
        FOREACH v_d IN ARRAY v_durations LOOP
          v_slot_end_utc := v_slot_start_utc + (v_d || ' minutes')::interval;
          -- Must fit within this availability block (slot_time + duration <= end_time)
          IF (v_slot_time + (v_d || ' minutes')::interval)::time > v_end_time THEN
            v_ok := false;
          ELSE
            v_ok := NOT (
              EXISTS (
                SELECT 1 FROM public.private_lessons pl
                WHERE pl.school_id = p_school_id AND pl.status IN ('confirmed', 'attended')
                  AND (pl.start_at_utc, pl.end_at_utc) OVERLAPS (v_slot_start_utc, v_slot_end_utc)
              )
              OR EXISTS (
                SELECT 1 FROM public.teacher_blocked_times tbt
                WHERE tbt.school_id = p_school_id
                  AND (tbt.start_at_utc, tbt.end_at_utc) OVERLAPS (v_slot_start_utc, v_slot_end_utc)
              )
              OR EXISTS (
                SELECT 1 FROM public.private_class_requests pcr
                WHERE pcr.school_id = p_school_id AND pcr.status IN ('pending', 'accepted')
                  AND (
                    ((pcr.requested_date::text || ' ' || coalesce(pcr.requested_time, '09:00'))::timestamp AT TIME ZONE v_tz) AT TIME ZONE 'UTC'
                    ,
                    ((pcr.requested_date::text || ' ' || coalesce(pcr.requested_time, '09:00'))::timestamp AT TIME ZONE v_tz) AT TIME ZONE 'UTC'
                      + (COALESCE(pcr.duration_minutes, 60) || ' minutes')::interval
                  ) OVERLAPS (v_slot_start_utc, v_slot_end_utc)
              )
            );
          END IF;
          IF v_ok THEN
            v_avail_durations := v_avail_durations || to_jsonb(v_d);
          END IF;
        END LOOP;
        v_slots := v_slots || jsonb_build_object(
          'time', to_char(v_slot_time, 'HH24:MI'),
          'location', coalesce(v_avail.location, ''),
          'availableDurations', v_avail_durations,
          'available', jsonb_array_length(v_avail_durations) > 0
        );
        v_slot_time := v_slot_time + interval '30 minutes';
      END LOOP;
    END LOOP;
    v_slots := (
      SELECT jsonb_agg(elem ORDER BY (elem->>'time'))
      FROM jsonb_array_elements(v_slots) AS elem
    );
    IF v_slots IS NULL THEN v_slots := '[]'::jsonb; END IF;
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
