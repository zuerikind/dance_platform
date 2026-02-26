-- Restore is_monthly in get_class_registrations_for_date so admin UI can show the Monthly badge.
CREATE OR REPLACE FUNCTION public.get_class_registrations_for_date(
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
  v_row record;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN v_result;
  END IF;

  FOR v_row IN
    SELECT cr.id, cr.class_id, cr.student_id, cr.class_date, cr.status, cr.deducted,
           COALESCE(cr.is_monthly, false) AS is_monthly,
           c.name AS class_name, c.time AS class_time,
           COALESCE(NULLIF(trim(s.name), ''), s.email, cr.student_id, 'Student') AS student_name
    FROM public.class_registrations cr
    JOIN public.classes c ON c.id = cr.class_id
    LEFT JOIN public.students s ON s.id::text = cr.student_id AND s.school_id = cr.school_id
    WHERE cr.school_id = p_school_id
      AND cr.class_date = p_class_date
    ORDER BY c.time, COALESCE(NULLIF(trim(s.name), ''), s.email, cr.student_id)
  LOOP
    v_result := v_result || jsonb_build_object(
      'id', v_row.id,
      'class_id', v_row.class_id,
      'student_id', v_row.student_id,
      'class_date', v_row.class_date,
      'status', v_row.status,
      'deducted', v_row.deducted,
      'is_monthly', v_row.is_monthly,
      'class_name', v_row.class_name,
      'class_time', v_row.class_time,
      'student_name', v_row.student_name
    );
  END LOOP;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_class_registrations_for_date(uuid, date)
  IS 'List registrations for a school and date. Admin only. Includes is_monthly for badge.';
