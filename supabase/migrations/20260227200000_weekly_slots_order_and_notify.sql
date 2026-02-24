-- 1) Fix get_available_slots_for_week: order availability by time (not text) and sort slots within each day
--    so times like "9:00" are not ordered after "18:00" when stored as text.
-- 2) No DB change for email; notification is sent from Edge Function when client calls it after create_private_class_request.

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
    -- Order by start_time::time so "09:00" comes before "18:00" (text sort would put "18" before "9")
    FOR v_avail IN
      SELECT start_time, end_time, location FROM public.teacher_availability
      WHERE school_id = p_school_id AND day_of_week = v_day_name
      ORDER BY (start_time::time)
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
    -- Sort slots by time so display is always chronological (handles multiple availability blocks)
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
