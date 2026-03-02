-- =============================================================================
-- Security fix: Remove RLS bypass from students_with_profile.
-- 1) Add RLS policy so school admins can see student_profiles of students in their school.
-- 2) Set security_invoker = true so the view runs as the caller and RLS applies.
-- Without this, any anon/authenticated user could SELECT * and get all students/profiles.
-- =============================================================================

-- 1) Allow school admins and platform admins to SELECT student_profiles for students in their school
DROP POLICY IF EXISTS "student_profiles_select_school_admin" ON public.student_profiles;
CREATE POLICY "student_profiles_select_school_admin" ON public.student_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = student_profiles.user_id
      AND public.is_school_admin(s.school_id)
  )
  OR public.is_platform_admin()
);

-- 2) View runs as caller; RLS on students and student_profiles now applies
ALTER VIEW public.students_with_profile SET (security_invoker = true);
