-- Link current Auth user to an existing admin row (user_id was NULL).
-- Used when a legacy admin signs in: after signUp/signIn with pseudo-email,
-- call this so is_school_admin() and RPCs that use it (e.g. competition_create) work.
-- Email format: {username_normalized}+{school_id}@admins.bailadmin.local

CREATE OR REPLACE FUNCTION public.link_admin_auth()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_username_part text;  -- normalized (lowercase, underscores)
  v_school_id text;
  v_at int;
  v_plus int;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  v_email := coalesce(auth.jwt() ->> 'email', '');
  IF v_email = '' OR v_email NOT LIKE '%@admins.bailadmin.local' THEN
    RETURN;
  END IF;
  v_plus := position('+' in v_email);
  v_at := position('@' in v_email);
  IF v_plus = 0 OR v_at <= v_plus + 1 THEN
    RETURN;
  END IF;
  v_username_part := lower(substring(v_email from 1 for v_plus - 1));
  v_school_id := substring(v_email from v_plus + 1 for v_at - v_plus - 1);

  UPDATE public.admins
  SET user_id = auth.uid()
  WHERE school_id = v_school_id::uuid
    AND user_id IS NULL
    AND lower(trim(replace(username, ' ', '_'))) = v_username_part;
END;
$$;

COMMENT ON FUNCTION public.link_admin_auth() IS 'Set user_id = auth.uid() on the admin row whose pseudo-email matches the current JWT. Call after signUp/signIn for legacy admins.';
GRANT EXECUTE ON FUNCTION public.link_admin_auth() TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_admin_auth() TO anon;
