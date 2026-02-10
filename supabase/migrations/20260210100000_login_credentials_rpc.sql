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

-- Admins: list students for a school (RLS blocks direct select for legacy admins).
CREATE OR REPLACE FUNCTION public.get_school_students(p_school_id uuid)
RETURNS SETOF public.students
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.students WHERE school_id = p_school_id ORDER BY name;
$$;

GRANT EXECUTE ON FUNCTION public.get_school_students(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_school_students(uuid) TO authenticated;

-- Student creates a payment request (RLS only allows admins to insert; this runs as definer).
CREATE OR REPLACE FUNCTION public.create_payment_request(
  p_student_id text,
  p_sub_id text,
  p_sub_name text,
  p_price numeric,
  p_payment_method text,
  p_school_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.payment_requests (student_id, sub_id, sub_name, price, payment_method, school_id, status)
  VALUES (p_student_id, p_sub_id, p_sub_name, p_price, p_payment_method, p_school_id, 'pending');
END;
$$;

COMMENT ON FUNCTION public.create_payment_request IS 'Allows students to submit a payment request; RLS blocks direct insert.';

GRANT EXECUTE ON FUNCTION public.create_payment_request(text, text, text, numeric, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.create_payment_request(text, text, text, numeric, text, uuid) TO authenticated;

-- Bank details for payment modal (students cannot read admin_settings via RLS).
CREATE OR REPLACE FUNCTION public.get_school_admin_settings(p_school_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_object_agg(key, value), '{}'::jsonb)
  FROM public.admin_settings
  WHERE school_id = p_school_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_school_admin_settings(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_school_admin_settings(uuid) TO authenticated;

-- Payment requests for a school (legacy admins cannot read via RLS; this runs as definer).
CREATE OR REPLACE FUNCTION public.get_school_payment_requests(p_school_id uuid)
RETURNS SETOF public.payment_requests
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.payment_requests
  WHERE school_id = p_school_id
  ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_school_payment_requests(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_school_payment_requests(uuid) TO authenticated;

-- Legacy admin: update/delete payment_requests (RLS requires auth.uid()).
-- id may be int4 (serial) or int8; use bigint to accept both.
CREATE OR REPLACE FUNCTION public.update_payment_request_status(p_request_id bigint, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.payment_requests SET status = p_status WHERE id = p_request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_payment_request(p_request_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.payment_requests WHERE id = p_request_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_payment_request_status(bigint, text) TO anon;
GRANT EXECUTE ON FUNCTION public.update_payment_request_status(bigint, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_payment_request(bigint) TO anon;
GRANT EXECUTE ON FUNCTION public.delete_payment_request(bigint) TO authenticated;
