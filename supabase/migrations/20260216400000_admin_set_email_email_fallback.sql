-- admin_set_email: find admin by session email when user_id not linked (fix "Admin not found for current user")

CREATE OR REPLACE FUNCTION public.admin_set_email(p_email text, p_school_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_school_id IS NOT NULL THEN
    SELECT id INTO v_admin_id
    FROM public.admins
    WHERE user_id = auth.uid() AND school_id = p_school_id
    LIMIT 1;
    -- Fallback: admin row may not have user_id linked yet; match by session email for this school
    IF v_admin_id IS NULL THEN
      SELECT id INTO v_admin_id
      FROM public.admins
      WHERE school_id = p_school_id
        AND email IS NOT NULL AND trim(email) != ''
        AND email NOT LIKE '%@admins.bailadmin.local' AND email NOT LIKE '%@temp.bailadmin.local'
        AND lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
      LIMIT 1;
    END IF;
  ELSE
    SELECT id INTO v_admin_id
    FROM public.admins
    WHERE user_id = auth.uid()
    LIMIT 1;
  END IF;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin not found for current user';
  END IF;

  IF trim(p_email) = '' OR p_email IS NULL THEN
    RAISE EXCEPTION 'Email cannot be empty';
  END IF;

  IF p_email LIKE '%@temp.bailadmin.local' OR p_email LIKE '%@admins.bailadmin.local' THEN
    RAISE EXCEPTION 'Please enter a real email address';
  END IF;

  UPDATE public.admins
  SET email = trim(lower(p_email)), user_id = coalesce(user_id, auth.uid())
  WHERE id = v_admin_id;
END;
$$;
