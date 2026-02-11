-- Admin insert: optional user_id so new admins get auth.uid() from the start.
-- Caller must be platform admin or school admin for p_school_id.
-- No real email needed: Auth user is created with pseudo-email username+school_id@admins.bailadmin.local.

DROP FUNCTION IF EXISTS public.admin_insert_for_school(uuid, text, text);

CREATE OR REPLACE FUNCTION public.admin_insert_for_school(
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
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied: only platform admin or school admin can add admins.';
  END IF;
  v_id := 'ADM-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  INSERT INTO public.admins (id, username, password, school_id, user_id)
  VALUES (v_id, trim(p_username), p_password, p_school_id, p_user_id)
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;

COMMENT ON FUNCTION public.admin_insert_for_school(uuid, text, text, uuid) IS 'Insert admin for school; optional p_user_id links to Supabase Auth (pseudo-email login). Caller must be platform or school admin.';
GRANT EXECUTE ON FUNCTION public.admin_insert_for_school(uuid, text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_insert_for_school(uuid, text, text, uuid) TO authenticated;
