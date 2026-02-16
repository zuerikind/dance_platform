-- Platform admin can update school name and address from dev dashboard.

CREATE OR REPLACE FUNCTION public.school_update_info_by_platform(
  p_school_id uuid,
  p_name text DEFAULT NULL,
  p_address text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.schools%ROWTYPE;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Permission denied: only platform admin can update school info.';
  END IF;

  UPDATE public.schools
  SET
    name = COALESCE(trim(NULLIF(p_name, '')), name),
    address = CASE WHEN p_address IS NOT NULL THEN NULLIF(trim(p_address), '') ELSE address END
  WHERE id = p_school_id
  RETURNING * INTO v_row;

  IF v_row IS NULL THEN
    RAISE EXCEPTION 'School not found.';
  END IF;
  RETURN to_jsonb(v_row);
END;
$$;

COMMENT ON FUNCTION public.school_update_info_by_platform(uuid, text, text) IS 'Update school name and/or address; platform admin only.';
GRANT EXECUTE ON FUNCTION public.school_update_info_by_platform(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_update_info_by_platform(uuid, text, text) TO anon;
