-- =============================================================================
-- Update get_class_availability to count pending in capacity (Aure clase suelta).
-- get_student_upcoming_registrations and get_student_past_registrations already
-- return all statuses including pending (no filter).
-- =============================================================================

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
      END
    );
  END LOOP;

  RETURN v_result;
END;
$$;
