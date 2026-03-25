-- Schedule exceptions: "info" kind should block self-serve registration (same as cancelled/special).

-- Admins still bypass via existing is_school_admin / is_platform_admin checks in register RPCs.



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

      'registration_closed', v_row.exception_kind IN ('cancelled', 'special', 'info')

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

      'registration_closed', v_row.exception_kind IN ('cancelled', 'special', 'info')

    );

  END IF;



  RETURN NULL;

END;

$$;
