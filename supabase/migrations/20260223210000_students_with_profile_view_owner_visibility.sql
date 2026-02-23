-- Fix: school admin sees empty student name for discovery-linked students.
-- The view students_with_profile had security_invoker = true, so when get_school_students
-- (SECURITY DEFINER) selected from it, the view ran as the invoker (school admin). RLS on
-- student_profiles then hid all rows except the admin's own (user_id = auth.uid()), so
-- COALESCE(p.name, s.name) was null for linked students and their names showed empty.
-- Use security_invoker = false so the view runs as owner and can read all student_profiles
-- when used from get_school_students / get_platform_all_data (callers are already
-- restricted to school/platform admins).

ALTER VIEW public.students_with_profile SET (security_invoker = false);
