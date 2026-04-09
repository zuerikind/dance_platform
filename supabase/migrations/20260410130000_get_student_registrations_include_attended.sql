-- Include status = 'attended' for class_date = today so the scanner can show
-- "already confirmed" on rescan without falling through to manual deduct.

CREATE OR REPLACE FUNCTION public.get_student_registrations_for_today(
  p_student_id text,
  p_school_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb := '[]'::jsonb;
  v_row record;
  v_today date;
BEGIN
  IF NOT (
    public.is_school_admin(p_school_id)
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id::text = p_student_id AND s.school_id = p_school_id AND s.user_id = auth.uid()
    )
  ) THEN
    RETURN v_result;
  END IF;

  IF public.is_aure_school(p_school_id) THEN
    v_today := (now() AT TIME ZONE 'America/Mexico_City')::date;
  ELSE
    v_today := CURRENT_DATE;
  END IF;

  FOR v_row IN
    SELECT cr.id, cr.class_id, cr.class_date, cr.status, cr.deducted,
           c.name AS class_name, c.time AS class_time
    FROM public.class_registrations cr
    JOIN public.classes c ON c.id = cr.class_id
    WHERE cr.student_id = p_student_id
      AND cr.school_id = p_school_id
      AND cr.class_date = v_today
      AND (
        cr.status = 'registered'
        OR cr.status = 'attended'
        OR (
          public.is_aure_school(p_school_id)
          AND cr.status = 'pending'
          AND NOT COALESCE(cr.deducted, false)
        )
        OR (
          public.is_aure_school(p_school_id)
          AND cr.status = 'no_show'
          AND cr.deducted = true
        )
      )
    ORDER BY c.time
  LOOP
    v_result := v_result || jsonb_build_object(
      'id', v_row.id,
      'class_id', v_row.class_id,
      'class_date', v_row.class_date,
      'status', v_row.status,
      'deducted', v_row.deducted,
      'class_name', v_row.class_name,
      'class_time', v_row.class_time
    );
  END LOOP;
  RETURN v_result;
END;
$$;
