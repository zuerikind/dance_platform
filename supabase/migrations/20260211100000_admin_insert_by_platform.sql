-- Platform admin only: insert first admin for a school (e.g. when creating new school from dev dashboard).
-- Does not require is_school_admin(p_school_id) since the school was just created.

CREATE OR REPLACE FUNCTION public.admin_insert_for_school_by_platform(
  p_school_id uuid,
  p_username text,
  p_password text,
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id text;
  v_row public.admins%ROWTYPE;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Permission denied: only platform admin can use this.';
  END IF;
  v_id := 'ADM-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  INSERT INTO public.admins (id, username, password, school_id, user_id)
  VALUES (v_id, trim(p_username), p_password, p_school_id, p_user_id)
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;

COMMENT ON FUNCTION public.admin_insert_for_school_by_platform(uuid, text, text, uuid) IS 'Insert admin for school; platform admin only. Use when creating first admin for a new school.';
GRANT EXECUTE ON FUNCTION public.admin_insert_for_school_by_platform(uuid, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_insert_for_school_by_platform(uuid, text, text, uuid) TO anon;
