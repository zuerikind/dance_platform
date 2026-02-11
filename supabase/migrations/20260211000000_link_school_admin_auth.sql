-- Link current Auth user to an existing school admin row (user_id was NULL).
-- Same idea as link_platform_admin_auth: verify username+password+school_id, set user_id = auth.uid(), return true if updated.

CREATE OR REPLACE FUNCTION public.link_school_admin_auth(
  p_username text,
  p_password text,
  p_school_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.admins%ROWTYPE;
  v_updated int;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  SELECT * INTO v_row FROM public.admins
  WHERE school_id = p_school_id
    AND TRIM(username) = TRIM(p_username)
    AND password = p_password
  LIMIT 1;
  IF v_row.id IS NULL THEN
    RETURN false;
  END IF;
  UPDATE public.admins SET user_id = auth.uid()
  WHERE id = v_row.id AND (user_id IS NULL OR user_id = auth.uid());
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

COMMENT ON FUNCTION public.link_school_admin_auth(text, text, uuid) IS 'Set admins.user_id = auth.uid() for the row matching username+password+school_id. Returns true if a row was updated.';
GRANT EXECUTE ON FUNCTION public.link_school_admin_auth(text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_school_admin_auth(text, text, uuid) TO anon;
