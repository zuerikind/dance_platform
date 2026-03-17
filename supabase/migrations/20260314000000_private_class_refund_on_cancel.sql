-- When a student cancels a private lesson in time (>= 4h before start), refund the
-- classes that were deducted on accept (1 class per hour: 1h=1, 2h=2, 3h=3).
-- Late cancel still deducts 1; no refund.

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
  v_classes int;
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
  ELSE
    -- In-time cancel: refund the classes that were deducted on accept (1 per hour: 60→1, 120→2, 180→3)
    v_classes := (EXTRACT(EPOCH FROM (v_lesson.end_at_utc - v_lesson.start_at_utc)) / 60.0)::int / 60;
    IF v_classes < 1 THEN v_classes := 1; END IF;
    PERFORM public.refund_student_private(v_lesson.school_id, v_lesson.student_id, v_classes);
  END IF;

  RETURN to_jsonb(v_lesson);
END;
$$;

COMMENT ON FUNCTION public.student_cancel_private_lesson(uuid) IS 'Student cancels a confirmed private lesson. Late cancel (< 4h before): deduct 1. In-time cancel: refund classes (1 per hour) so remaining count goes up and slot is freed.';
