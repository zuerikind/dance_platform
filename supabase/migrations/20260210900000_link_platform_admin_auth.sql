-- Link current Auth user to a platform_admin row (user_id was NULL).
-- Used when a platform dev signs in with username+password so is_platform_admin() becomes true
-- (required for RLS on schools, etc.). Call after signUp/signIn with pseudo-email.

CREATE OR REPLACE FUNCTION public.link_platform_admin_auth(p_username text, p_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.platform_admins;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  SELECT * INTO v_row FROM public.platform_admins
  WHERE TRIM(username) = TRIM(p_username) AND password = p_password
  LIMIT 1;
  IF v_row.id IS NOT NULL THEN
    UPDATE public.platform_admins SET user_id = auth.uid() WHERE id = v_row.id AND (user_id IS NULL OR user_id = auth.uid());
  END IF;
END;
$$;

COMMENT ON FUNCTION public.link_platform_admin_auth(text, text) IS 'Set platform_admins.user_id = auth.uid() for the row matching username+password. Call after signUp/signIn for legacy platform devs.';
GRANT EXECUTE ON FUNCTION public.link_platform_admin_auth(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_platform_admin_auth(text, text) TO anon;
