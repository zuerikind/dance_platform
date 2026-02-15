-- Global student accounts: one Auth identity, one enrollment (students row) per school.
-- Students sign up once, then auto-enroll when they log into a new school.
-- QR code uses user_id (auth UUID) instead of students.id.
-- PREREQUISITE: Delete all existing students before running this migration.

-- =============================================================================
-- 1. Global username uniqueness (replace per-school index)
-- =============================================================================
DROP INDEX IF EXISTS idx_students_school_username;
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_global_username
  ON public.students (lower(trim(username)))
  WHERE username IS NOT NULL AND trim(username) != '';

-- =============================================================================
-- 2. student_username_exists: check globally (1-param version)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.student_username_exists(p_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students
    WHERE lower(trim(username)) = lower(trim(p_username))
      AND trim(p_username) <> ''
  );
$$;
COMMENT ON FUNCTION public.student_username_exists(text) IS 'True if username is taken globally (any school). Used at sign-up.';
GRANT EXECUTE ON FUNCTION public.student_username_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION public.student_username_exists(text) TO authenticated;

-- Keep old 2-param signature as wrapper for backward compat
CREATE OR REPLACE FUNCTION public.student_username_exists(p_username text, p_school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.student_username_exists(p_username);
$$;

-- =============================================================================
-- 3. get_student_by_user_id: lookup student by auth user_id + school
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_student_by_user_id(p_user_id uuid, p_school_id uuid)
RETURNS SETOF public.students
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.students
  WHERE user_id = p_user_id AND school_id = p_school_id
  LIMIT 1;
$$;
COMMENT ON FUNCTION public.get_student_by_user_id(uuid, uuid) IS 'Return student enrollment for a given auth user_id and school.';
GRANT EXECUTE ON FUNCTION public.get_student_by_user_id(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_student_by_user_id(uuid, uuid) TO authenticated;

-- =============================================================================
-- 4. auto_enroll_student: create enrollment in a new school by copying profile
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
  -- If already enrolled, return existing row
  SELECT * INTO v_existing
  FROM public.students
  WHERE user_id = p_user_id AND school_id = p_school_id
  LIMIT 1;

  IF FOUND THEN
    RETURN to_jsonb(v_existing);
  END IF;

  -- Find any existing enrollment to copy profile from
  SELECT * INTO v_source
  FROM public.students
  WHERE user_id = p_user_id
  ORDER BY created_at ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existing student profile found for this user';
  END IF;

  -- Create new enrollment for this school
  v_new_id := 'STUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));

  INSERT INTO public.students (
    id, name, username, email, phone, password,
    paid, package, balance, active_packs, package_expires_at,
    school_id, user_id, created_at
  ) VALUES (
    v_new_id,
    v_source.name,
    v_source.username,
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
COMMENT ON FUNCTION public.auto_enroll_student(uuid, uuid) IS 'Auto-enroll student in a school: copies profile from existing enrollment, starts with 0 balance.';
GRANT EXECUTE ON FUNCTION public.auto_enroll_student(uuid, uuid) TO authenticated;
