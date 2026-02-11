-- Make competition_create and competition_update raise on permission denied
-- so the client receives an error instead of null.

CREATE OR REPLACE FUNCTION public.competition_create(
  p_school_id uuid,
  p_name text,
  p_starts_at timestamptz,
  p_questions jsonb,
  p_next_steps_text text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.competitions;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied: not an admin for this school. Log in as a school admin.';
  END IF;
  INSERT INTO public.competitions (school_id, type, name, starts_at, questions, next_steps_text)
  VALUES (p_school_id, 'JACK_AND_JILL', trim(p_name), p_starts_at, COALESCE(p_questions, '[]'::jsonb), COALESCE(trim(p_next_steps_text), ''))
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;

CREATE OR REPLACE FUNCTION public.competition_update(
  p_competition_id uuid,
  p_name text,
  p_starts_at timestamptz,
  p_questions jsonb,
  p_next_steps_text text,
  p_is_active boolean,
  p_is_sign_in_active boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
BEGIN
  SELECT c.school_id INTO v_school_id FROM public.competitions c WHERE c.id = p_competition_id;
  IF v_school_id IS NULL THEN
    RAISE EXCEPTION 'Competition not found.';
  END IF;
  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied: not an admin for this school. Log in as a school admin.';
  END IF;
  UPDATE public.competitions
  SET name = trim(p_name), starts_at = p_starts_at, questions = COALESCE(p_questions, questions), next_steps_text = COALESCE(trim(p_next_steps_text), next_steps_text),
      is_active = p_is_active, is_sign_in_active = p_is_sign_in_active, updated_at = now()
  WHERE id = p_competition_id;
  RETURN to_jsonb((SELECT row_to_json(c) FROM public.competitions c WHERE c.id = p_competition_id));
END;
$$;
