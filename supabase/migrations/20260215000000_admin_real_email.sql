-- 1) Add optional real email column to admins
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS email text;

COMMENT ON COLUMN public.admins.email IS
  'Real email for notifications and password reset. NULL or @temp.bailadmin.local = placeholder.';

-- 2) Auto-confirm Auth users with pseudo-email domains so admin signUp + signIn works
--    even when "Confirm email" is enabled in Supabase Auth settings.
CREATE OR REPLACE FUNCTION public.auto_confirm_admin_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email LIKE '%@admins.bailadmin.local'
     OR NEW.email LIKE '%@temp.bailadmin.local' THEN
    NEW.email_confirmed_at := coalesce(NEW.email_confirmed_at, now());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_confirm_admin ON auth.users;
CREATE TRIGGER trg_auto_confirm_admin
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_admin_auth_user();

-- 3) Retroactively confirm any existing unconfirmed admin Auth users
UPDATE auth.users
SET email_confirmed_at = coalesce(email_confirmed_at, now())
WHERE (email LIKE '%@admins.bailadmin.local' OR email LIKE '%@temp.bailadmin.local')
  AND email_confirmed_at IS NULL;

-- 4) RPC: admin_set_email – lets an admin set their real email
CREATE OR REPLACE FUNCTION public.admin_set_email(p_email text)
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

  SELECT id INTO v_admin_id
  FROM public.admins
  WHERE user_id = auth.uid()
  LIMIT 1;

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

GRANT EXECUTE ON FUNCTION public.admin_set_email(text) TO authenticated;
