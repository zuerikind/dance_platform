-- =============================================================================
-- Login fallback: check credentials against students/admins tables when
-- Supabase Auth has no user (e.g. existing rows without user_id).
-- Run in Supabase SQL Editor after the main security migration.
-- =============================================================================

-- Student login: return the student row if name + password + school_id match.
CREATE OR REPLACE FUNCTION public.get_student_by_credentials(
  p_name text,
  p_password text,
  p_school_id uuid
)
RETURNS SETOF public.students
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.students
  WHERE school_id = p_school_id
    AND LOWER(TRIM(name)) = LOWER(TRIM(p_name))
    AND password = p_password
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_student_by_credentials IS 'Legacy login: validate student name+password for a school. Used when Auth user does not exist.';

-- Admin login: return the admin row if username + password + school_id match.
CREATE OR REPLACE FUNCTION public.get_admin_by_credentials(
  p_username text,
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
    AND TRIM(username) = TRIM(p_username)
    AND password = p_password
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_admin_by_credentials IS 'Legacy login: validate admin username+password for a school. Used when Auth user does not exist.';

-- Allow anon and authenticated to call these (they only return one row when credentials match).
GRANT EXECUTE ON FUNCTION public.get_student_by_credentials(text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_student_by_credentials(text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_by_credentials(text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_admin_by_credentials(text, text, uuid) TO authenticated;

-- Schedule/shop for students: return classes and subscriptions for a school.
-- Used when student has no Auth session (legacy login) so RLS would block direct select.
CREATE OR REPLACE FUNCTION public.get_school_classes(p_school_id uuid)
RETURNS SETOF public.classes
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.classes WHERE school_id = p_school_id ORDER BY id;
$$;

CREATE OR REPLACE FUNCTION public.get_school_subscriptions(p_school_id uuid)
RETURNS SETOF public.subscriptions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.subscriptions WHERE school_id = p_school_id ORDER BY name;
$$;

GRANT EXECUTE ON FUNCTION public.get_school_classes(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_school_classes(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_school_subscriptions(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_school_subscriptions(uuid) TO authenticated;
