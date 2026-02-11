-- Fix: allow re-linking when platform admin credentials match (overwrite user_id if it was set to a different auth user).
-- Previously: UPDATE only when user_id IS NULL OR user_id = auth.uid() - so a stale/mismatched user_id could never be fixed.
-- Now: always set user_id = auth.uid() when username+password match, so user can re-link after session/browser change.
-- DROP first because Postgres can refuse CREATE OR REPLACE when changing function body in some cases.

DROP FUNCTION IF EXISTS public.link_platform_admin_auth(text, text);

CREATE OR REPLACE FUNCTION public.link_platform_admin_auth(p_username text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.platform_admins;
  v_updated int;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  SELECT * INTO v_row FROM public.platform_admins
  WHERE TRIM(username) = TRIM(p_username) AND password = p_password
  LIMIT 1;
  IF v_row.id IS NULL THEN
    RETURN false;
  END IF;
  -- Always update to current auth user when credentials match (allows re-link after browser/session change)
  UPDATE public.platform_admins SET user_id = auth.uid() WHERE id = v_row.id;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;
