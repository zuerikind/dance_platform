-- Add video submission option to competitions: one toggle + prompt, video appears at end of questionnaire.
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS video_submission_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS video_submission_prompt text DEFAULT '';

COMMENT ON COLUMN public.competitions.video_submission_enabled IS 'When true, registration form shows a video upload field at the end.';
COMMENT ON COLUMN public.competitions.video_submission_prompt IS 'Label/prompt for the video upload field, e.g. "Upload your demo video (2-3 minutes)".';

-- Update competition_create to accept video params
CREATE OR REPLACE FUNCTION public.competition_create(
  p_school_id uuid,
  p_name text,
  p_starts_at timestamptz,
  p_questions jsonb,
  p_next_steps_text text,
  p_video_submission_enabled boolean DEFAULT false,
  p_video_submission_prompt text DEFAULT ''
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
  INSERT INTO public.competitions (school_id, type, name, starts_at, questions, next_steps_text, video_submission_enabled, video_submission_prompt)
  VALUES (p_school_id, 'JACK_AND_JILL', trim(p_name), p_starts_at, COALESCE(p_questions, '[]'::jsonb), COALESCE(trim(p_next_steps_text), ''), COALESCE(p_video_submission_enabled, false), COALESCE(trim(p_video_submission_prompt), ''))
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_create(uuid, text, timestamptz, jsonb, text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_create(uuid, text, timestamptz, jsonb, text, boolean, text) TO anon;

-- Update competition_update to accept video params
CREATE OR REPLACE FUNCTION public.competition_update(
  p_competition_id uuid,
  p_name text,
  p_starts_at timestamptz,
  p_questions jsonb,
  p_next_steps_text text,
  p_is_active boolean,
  p_is_sign_in_active boolean,
  p_video_submission_enabled boolean DEFAULT false,
  p_video_submission_prompt text DEFAULT ''
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
  SET name = trim(p_name), starts_at = p_starts_at, questions = COALESCE(p_questions, questions),
      next_steps_text = COALESCE(trim(p_next_steps_text), next_steps_text),
      is_active = p_is_active, is_sign_in_active = p_is_sign_in_active,
      video_submission_enabled = COALESCE(p_video_submission_enabled, video_submission_enabled),
      video_submission_prompt = COALESCE(trim(p_video_submission_prompt), video_submission_prompt),
      updated_at = now()
  WHERE id = p_competition_id;
  RETURN to_jsonb((SELECT row_to_json(c) FROM public.competitions c WHERE c.id = p_competition_id));
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_update(uuid, text, timestamptz, jsonb, text, boolean, boolean, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_update(uuid, text, timestamptz, jsonb, text, boolean, boolean, boolean, text) TO anon;

-- competition_copy: include video fields when copying
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
    is_sign_in_active,
    video_submission_enabled,
    video_submission_prompt
  )
  VALUES (
    v_src.school_id,
    v_src.type,
    COALESCE(trim(p_name_prefix), 'Copia de ') || COALESCE(v_src.name, ''),
    v_src.starts_at,
    COALESCE(v_src.questions, '[]'::jsonb),
    COALESCE(v_src.next_steps_text, ''),
    false,
    false,
    COALESCE(v_src.video_submission_enabled, false),
    COALESCE(v_src.video_submission_prompt, '')
  )
  RETURNING * INTO v_row;

  RETURN to_jsonb(v_row);
END;
$$;
