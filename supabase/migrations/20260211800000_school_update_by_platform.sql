-- Update school name (platform admin only). Used from dev dashboard.

CREATE OR REPLACE FUNCTION public.school_update_by_platform(p_school_id uuid, p_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.schools%ROWTYPE;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Permission denied: only platform admin can update schools.';
  END IF;
  UPDATE public.schools SET name = trim(p_name) WHERE id = p_school_id
  RETURNING * INTO v_row;
  IF v_row IS NULL THEN
    RAISE EXCEPTION 'School not found.';
  END IF;
  RETURN to_jsonb(v_row);
END;
$$;

COMMENT ON FUNCTION public.school_update_by_platform(uuid, text) IS 'Update school name; platform admin only.';
GRANT EXECUTE ON FUNCTION public.school_update_by_platform(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_update_by_platform(uuid, text) TO anon;
