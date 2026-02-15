-- Student auth with email only: remove username from students.
-- Students sign up and log in with email + password; Supabase Auth uses real email.

-- =============================================================================
-- 1. Drop username-based functions (must run before dropping column)
-- =============================================================================
DROP FUNCTION IF EXISTS public.find_student_auth_school(text);
DROP FUNCTION IF EXISTS public.student_username_exists(text);
DROP FUNCTION IF EXISTS public.student_username_exists(text, uuid);
DROP FUNCTION IF EXISTS public.get_student_by_username_credentials(text, text, uuid);

-- =============================================================================
-- 2. Drop username column and any indexes on it
-- =============================================================================
DROP INDEX IF EXISTS idx_students_global_username;
DROP INDEX IF EXISTS idx_students_school_username;
ALTER TABLE public.students DROP COLUMN IF EXISTS username;

-- =============================================================================
-- 3. create_student_with_auth: no p_username, insert without username
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_student_with_auth(
  p_user_id uuid,
  p_name text,
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
  INSERT INTO public.students (id, name, email, phone, password, paid, package, balance, active_packs, package_expires_at, school_id, user_id, created_at)
  VALUES (new_id, trim(p_name), nullif(trim(p_email), ''), nullif(trim(p_phone), ''), p_password, false, null, 0, '[]'::jsonb, null, p_school_id, p_user_id, now())
  RETURNING * INTO new_row;
  RETURN to_jsonb(new_row);
END;
$$;
COMMENT ON FUNCTION public.create_student_with_auth(uuid, text, text, text, text, uuid) IS 'Create student row with user_id; used after Auth signUp. Students use email to sign in.';
GRANT EXECUTE ON FUNCTION public.create_student_with_auth(uuid, text, text, text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.create_student_with_auth(uuid, text, text, text, text, uuid) TO authenticated;

-- =============================================================================
-- 4. create_student_legacy: no p_username, insert without username
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_student_legacy(
  p_name text,
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
  INSERT INTO public.students (id, name, email, phone, password, paid, package, balance, active_packs, package_expires_at, school_id, created_at)
  VALUES (new_id, trim(p_name), nullif(trim(p_email), ''), nullif(trim(p_phone), ''), p_password, false, null, 0, '[]'::jsonb, null, p_school_id, now())
  RETURNING * INTO new_row;
  RETURN to_jsonb(new_row);
END;
$$;
COMMENT ON FUNCTION public.create_student_legacy(text, text, text, text, uuid) IS 'Create student without Auth (e.g. when Auth fails). user_id stays NULL.';
GRANT EXECUTE ON FUNCTION public.create_student_legacy(text, text, text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.create_student_legacy(text, text, text, text, uuid) TO authenticated;

-- =============================================================================
-- 5. auto_enroll_student: do not copy or insert username
-- =============================================================================
CREATE OR REPLACE FUNCTION public.auto_enroll_student(p_user_id uuid, p_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing public.students;
  v_source   public.students;
  v_new_id   text;
  v_new_row  public.students;
BEGIN
  SELECT * INTO v_existing
  FROM public.students
  WHERE user_id = p_user_id AND school_id = p_school_id
  LIMIT 1;

  IF FOUND THEN
    RETURN to_jsonb(v_existing);
  END IF;

  SELECT * INTO v_source
  FROM public.students
  WHERE user_id = p_user_id
  ORDER BY created_at ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existing student profile found for this user';
  END IF;

  v_new_id := 'STUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));

  INSERT INTO public.students (
    id, name, email, phone, password,
    paid, package, balance, active_packs, package_expires_at,
    school_id, user_id, created_at
  ) VALUES (
    v_new_id,
    v_source.name,
    v_source.email,
    v_source.phone,
    v_source.password,
    false, null, 0, '[]'::jsonb, null,
    p_school_id, p_user_id, now()
  )
  RETURNING * INTO v_new_row;

  RETURN to_jsonb(v_new_row);
END;
$$;
COMMENT ON FUNCTION public.auto_enroll_student(uuid, uuid) IS 'Auto-enroll student in a school: copies profile from existing enrollment (no username), starts with 0 balance.';
GRANT EXECUTE ON FUNCTION public.auto_enroll_student(uuid, uuid) TO authenticated;
