-- Fix: admin_set_email must update the admin for the CURRENT school.
-- When an admin is in multiple schools, LIMIT 1 picked an arbitrary row; now we pass school_id.

DROP FUNCTION IF EXISTS public.admin_set_email(text);

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
  SET email = trim(lower(p_email))
  WHERE id = v_admin_id;
END;
$$;

COMMENT ON FUNCTION public.admin_set_email(text, uuid) IS 'Set real email for the current user''s admin row. Pass p_school_id to update the admin for that school.';
GRANT EXECUTE ON FUNCTION public.admin_set_email(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_email(text, uuid) TO anon;
