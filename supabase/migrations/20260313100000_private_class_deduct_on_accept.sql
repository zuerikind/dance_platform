-- When teacher accepts a private class request, deduct the student's private class balance.
-- Allowed durations: 1h, 2h, 3h only (60, 120, 180 minutes). 1 class = 1 hour.

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
  v_classes int;
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

  -- Only 1h, 2h, 3h allowed for balance deduction
  IF v_duration_minutes NOT IN (60, 120, 180) THEN
    RAISE EXCEPTION 'Invalid duration: must be 60, 120, or 180 minutes (1h, 2h, or 3h)';
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

  -- Deduct student's private class balance (1 class per hour)
  v_classes := v_duration_minutes / 60;
  PERFORM public.deduct_student_classes(v_student_id, v_school_id, v_classes, 'private');

  RETURN to_jsonb(v_req);
END;
$$;

COMMENT ON FUNCTION public.teacher_respond_to_request(uuid, boolean) IS 'Accept or decline a private class request. On accept: creates private_lesson, deducts student balance (1 class per hour). Duration must be 60, 120, or 180 minutes.';
