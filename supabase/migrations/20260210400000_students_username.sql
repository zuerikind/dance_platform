-- Add username to students: unique per school, used for sign-up and Auth pseudo-email.
-- Students sign in with full name + password; username is for sign-up uniqueness only.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS username text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_school_username
  ON public.students (school_id, lower(trim(username)))
  WHERE trim(username) <> '';

COMMENT ON COLUMN public.students.username IS 'Unique per school; used at sign-up and for Auth. Sign-in uses full name + password.';

-- Check if a username is already taken in this school (callable by anon for sign-up form).
CREATE OR REPLACE FUNCTION public.student_username_exists(p_username text, p_school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students
    WHERE school_id = p_school_id
      AND lower(trim(username)) = lower(trim(p_username))
      AND trim(p_username) <> ''
  );
$$;
COMMENT ON FUNCTION public.student_username_exists(text, uuid) IS 'True if username is already used in this school. Used at sign-up to reject duplicates.';
GRANT EXECUTE ON FUNCTION public.student_username_exists(text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.student_username_exists(text, uuid) TO authenticated;

-- Update create_student_with_auth to accept and store username
CREATE OR REPLACE FUNCTION public.create_student_with_auth(
  p_user_id uuid,
  p_name text,
  p_username text,
  p_email text,
  p_phone text,
  p_password text,
  p_school_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id text;
  new_row public.students;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN NULL;
  END IF;
  new_id := 'STUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  INSERT INTO public.students (id, name, username, email, phone, password, paid, package, balance, school_id, user_id, created_at)
  VALUES (new_id, trim(p_name), nullif(trim(p_username), ''), nullif(trim(p_email), ''), nullif(trim(p_phone), ''), p_password, false, null, 0, p_school_id, p_user_id, now())
  RETURNING * INTO new_row;
  RETURN to_jsonb(new_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_student_with_auth(uuid, text, text, text, text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.create_student_with_auth(uuid, text, text, text, text, text, uuid) TO authenticated;

-- Update create_student_legacy to accept and store username
CREATE OR REPLACE FUNCTION public.create_student_legacy(
  p_name text,
  p_username text,
  p_email text,
  p_phone text,
  p_password text,
  p_school_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id text;
  new_row public.students;
BEGIN
  new_id := 'STUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  INSERT INTO public.students (id, name, username, email, phone, password, paid, package, balance, school_id, created_at)
  VALUES (new_id, trim(p_name), nullif(trim(p_username), ''), nullif(trim(p_email), ''), nullif(trim(p_phone), ''), p_password, false, null, 0, p_school_id, now())
  RETURNING * INTO new_row;
  RETURN to_jsonb(new_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_student_legacy(text, text, text, text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.create_student_legacy(text, text, text, text, text, uuid) TO authenticated;
