-- Add jack_and_jill_enabled to schools. When false, the Jack and Jill button is hidden for that school.
-- Default false for new schools (premium feature).

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS jack_and_jill_enabled boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.schools.jack_and_jill_enabled IS 'When true, school can create Jack and Jill events. Premium feature, default off.';

-- RPC for platform admin to toggle
CREATE OR REPLACE FUNCTION public.school_update_jack_and_jill_enabled(p_school_id uuid, p_enabled boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.schools%ROWTYPE;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Permission denied: only platform admin can update school features.';
  END IF;
  UPDATE public.schools SET jack_and_jill_enabled = p_enabled WHERE id = p_school_id
  RETURNING * INTO v_row;
  IF v_row IS NULL THEN
    RAISE EXCEPTION 'School not found.';
  END IF;
  RETURN to_jsonb(v_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.school_update_jack_and_jill_enabled(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_update_jack_and_jill_enabled(uuid, boolean) TO anon;
