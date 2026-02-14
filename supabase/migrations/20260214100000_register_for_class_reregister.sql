-- Allow re-registering after cancel: update existing cancelled row instead of inserting.
-- Fixes: duplicate key value violates unique constraint class_registrations_class_id_student_id_class_date_key

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
BEGIN
  -- Validate class exists and belongs to school
  SELECT * INTO v_class FROM public.classes WHERE id = p_class_id AND school_id = p_school_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Class not found.';
  END IF;

  -- Validate student exists and belongs to school
  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found.';
  END IF;

  -- Check student has an active package (paid with balance > 0 or unlimited)
  IF NOT v_student.paid THEN
    RAISE EXCEPTION 'No active membership. Please purchase a plan first.';
  END IF;

  -- Check capacity (only count currently registered)
  IF v_class.max_capacity IS NOT NULL THEN
    SELECT count(*) INTO v_count
    FROM public.class_registrations
    WHERE class_id = p_class_id
      AND class_date = p_class_date
      AND status = 'registered';

    IF v_count >= v_class.max_capacity THEN
      RAISE EXCEPTION 'Class is full. No spots available.';
    END IF;
  END IF;

  -- Re-use existing row if student previously cancelled (allows sign up again after cancel)
  SELECT * INTO v_row
  FROM public.class_registrations
  WHERE class_id = p_class_id AND student_id = p_student_id AND class_date = p_class_date;

  IF FOUND THEN
    IF v_row.status = 'registered' THEN
      RAISE EXCEPTION 'Already registered for this class.';
    END IF;
    UPDATE public.class_registrations
    SET status = 'registered', cancelled_at = NULL
    WHERE id = v_row.id
    RETURNING * INTO v_row;
  ELSE
    INSERT INTO public.class_registrations (class_id, student_id, school_id, class_date, status)
    VALUES (p_class_id, p_student_id, p_school_id, p_class_date, 'registered')
    RETURNING * INTO v_row;
  END IF;

  RETURN to_jsonb(v_row);
END;
$$;
