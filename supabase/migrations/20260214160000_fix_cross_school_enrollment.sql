-- Fix cross-school enrollment: allow same username across multiple schools
-- and add RPCs for cross-school login fallback + multi-school package display.

-- =============================================================================
-- 1. Fix unique index: replace global username uniqueness with (user_id, school_id)
-- =============================================================================
-- The global unique index on username prevents auto_enroll_student from
-- creating a second enrollment with the same username in a different school.
-- We replace it with a (user_id, school_id) unique index that prevents
-- double-enrollment at the same school while allowing multi-school enrollments.
DROP INDEX IF EXISTS idx_students_global_username;

-- Prevent double-enrollment: one enrollment per user per school
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_user_school
  ON public.students (user_id, school_id)
  WHERE user_id IS NOT NULL;

-- =============================================================================
-- 2. find_student_auth_school: find any school where username has a linked Auth user
--    Used as a fallback for cross-school login when the student was created
--    with a legacy per-school pseudo-email format.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.find_student_auth_school(p_username text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.students
  WHERE lower(trim(username)) = lower(trim(p_username))
    AND user_id IS NOT NULL
  ORDER BY created_at ASC
  LIMIT 1;
$$;
COMMENT ON FUNCTION public.find_student_auth_school(text)
  IS 'Find the school_id of an existing enrollment for a username (for cross-school legacy login fallback).';
GRANT EXECUTE ON FUNCTION public.find_student_auth_school(text) TO anon;
GRANT EXECUTE ON FUNCTION public.find_student_auth_school(text) TO authenticated;

-- =============================================================================
-- 3. get_all_student_enrollments: return all enrollments for a user, with school name
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_all_student_enrollments(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_agg(
    to_jsonb(e.*) || jsonb_build_object('school_name', COALESCE(s.name, 'Unknown'))
    ORDER BY e.created_at ASC
  )
  INTO v_result
  FROM public.students e
  LEFT JOIN public.schools s ON s.id = e.school_id
  WHERE e.user_id = p_user_id;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;
COMMENT ON FUNCTION public.get_all_student_enrollments(uuid)
  IS 'Return all school enrollments for a student auth user, each with school_name attached.';
GRANT EXECUTE ON FUNCTION public.get_all_student_enrollments(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_all_student_enrollments(uuid) TO authenticated;
