-- Admin email login: credentials by email, link_admin_auth for real email, admin_insert with email.

-- 1) get_admin_by_email_credentials: validate admin by email+password+school_id (used when Auth user doesn't exist yet)
CREATE OR REPLACE FUNCTION public.get_admin_by_email_credentials(
  p_email text,
  p_password text,
  p_school_id uuid
)
RETURNS SETOF public.admins
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.admins
  WHERE school_id = p_school_id
    AND LOWER(TRIM(email)) = LOWER(TRIM(p_email))
    AND password = p_password
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_admin_by_email_credentials(text, text, uuid) IS 'Validate admin by email+password for school. Used when Auth user does not exist yet.';
GRANT EXECUTE ON FUNCTION public.get_admin_by_email_credentials(text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_admin_by_email_credentials(text, text, uuid) TO authenticated;

-- 2) link_admin_auth: extend to support real email (pass p_school_id when login uses real email)
DROP FUNCTION IF EXISTS public.link_admin_auth();

CREATE OR REPLACE FUNCTION public.link_admin_auth(p_school_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_username_part text;
  v_school_id_param text;
  v_at int;
  v_plus int;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  v_email := coalesce(auth.jwt() ->> 'email', '');
  IF v_email = '' THEN
    RETURN;
  END IF;

  -- Real email: match admins.email + school_id
  IF v_email NOT LIKE '%@admins.bailadmin.local' AND v_email NOT LIKE '%@temp.bailadmin.local' THEN
    IF p_school_id IS NULL THEN
      RETURN;
    END IF;
    UPDATE public.admins
    SET user_id = auth.uid()
    WHERE school_id = p_school_id
      AND user_id IS NULL
      AND LOWER(TRIM(email)) = LOWER(TRIM(v_email));
    RETURN;
  END IF;

  -- Pseudo-email: parse username+school from format username+schoolId@admins.bailadmin.local
  v_plus := position('+' in v_email);
  v_at := position('@' in v_email);
  IF v_plus = 0 OR v_at <= v_plus + 1 THEN
    RETURN;
  END IF;
  v_username_part := lower(substring(v_email from 1 for v_plus - 1));
  v_school_id_param := substring(v_email from v_plus + 1 for v_at - v_plus - 1);

  UPDATE public.admins
  SET user_id = auth.uid()
  WHERE school_id = v_school_id_param::uuid
    AND user_id IS NULL
    AND lower(trim(replace(username, ' ', '_'))) = v_username_part;
END;
$$;

COMMENT ON FUNCTION public.link_admin_auth(uuid) IS 'Set user_id = auth.uid() on admin row. For real email: match admins.email + p_school_id. For pseudo-email: parse username+school from JWT.';
GRANT EXECUTE ON FUNCTION public.link_admin_auth(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_admin_auth(uuid) TO anon;

-- 3) admin_insert_for_school_by_platform: add p_email
DROP FUNCTION IF EXISTS public.admin_insert_for_school_by_platform(uuid, text, text, uuid);

CREATE OR REPLACE FUNCTION public.admin_insert_for_school_by_platform(
  p_school_id uuid,
  p_username text,
  p_email text,
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
  INSERT INTO public.admins (id, username, email, password, school_id, user_id)
  VALUES (v_id, trim(p_username), nullif(trim(lower(p_email)), ''), p_password, p_school_id, p_user_id)
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;

COMMENT ON FUNCTION public.admin_insert_for_school_by_platform(uuid, text, text, text, uuid) IS 'Insert admin for school; platform admin only. Email is used for login.';
GRANT EXECUTE ON FUNCTION public.admin_insert_for_school_by_platform(uuid, text, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_insert_for_school_by_platform(uuid, text, text, text, uuid) TO anon;

-- 4) admin_insert_for_school: add p_email
DROP FUNCTION IF EXISTS public.admin_insert_for_school(uuid, text, text, uuid);

CREATE OR REPLACE FUNCTION public.admin_insert_for_school(
  p_school_id uuid,
  p_username text,
  p_email text,
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
  INSERT INTO public.admins (id, username, email, password, school_id, user_id)
  VALUES (v_id, trim(p_username), nullif(trim(lower(p_email)), ''), p_password, p_school_id, p_user_id)
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;

COMMENT ON FUNCTION public.admin_insert_for_school(uuid, text, text, text, uuid) IS 'Insert admin for school; optional p_user_id. Email is used for login.';
GRANT EXECUTE ON FUNCTION public.admin_insert_for_school(uuid, text, text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_insert_for_school(uuid, text, text, text, uuid) TO authenticated;
