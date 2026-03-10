-- link_admin_auth_force: like link_admin_auth but without the user_id IS NULL restriction.
-- Fixes stale/wrong user_id links by unconditionally updating to auth.uid() when email matches.
CREATE OR REPLACE FUNCTION public.link_admin_auth_force(p_school_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_email text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  v_email := coalesce(auth.jwt() ->> 'email', '');
  IF v_email = '' OR v_email LIKE '%@admins.bailadmin.local' OR v_email LIKE '%@temp.bailadmin.local' THEN RETURN; END IF;
  IF p_school_id IS NULL THEN RETURN; END IF;
  UPDATE public.admins
    SET user_id = auth.uid()
    WHERE school_id = p_school_id
      AND LOWER(TRIM(email)) = LOWER(TRIM(v_email));
END;
$$;
GRANT EXECUTE ON FUNCTION public.link_admin_auth_force(uuid) TO authenticated;
