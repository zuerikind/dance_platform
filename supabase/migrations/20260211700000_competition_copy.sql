-- Copy a Jack and Jill competition as a new row (server-side, ensures full DB copy)
-- New event: is_active=false, is_sign_in_active=false, no registrations

CREATE OR REPLACE FUNCTION public.competition_copy(
  p_competition_id uuid,
  p_name_prefix text DEFAULT 'Copia de '
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_src public.competitions;
  v_row public.competitions;
BEGIN
  SELECT * INTO v_src FROM public.competitions WHERE id = p_competition_id;
  IF v_src IS NULL THEN
    RAISE EXCEPTION 'Competition not found.';
  END IF;
  IF NOT (public.is_school_admin(v_src.school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied: not an admin for this school.';
  END IF;

  INSERT INTO public.competitions (
    school_id,
    type,
    name,
    starts_at,
    questions,
    next_steps_text,
    is_active,
    is_sign_in_active
  )
  VALUES (
    v_src.school_id,
    v_src.type,
    COALESCE(trim(p_name_prefix), 'Copia de ') || COALESCE(v_src.name, ''),
    v_src.starts_at,
    COALESCE(v_src.questions, '[]'::jsonb),
    COALESCE(v_src.next_steps_text, ''),
    false,
    false
  )
  RETURNING * INTO v_row;

  RETURN to_jsonb(v_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.competition_copy(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_copy(uuid, text) TO anon;
