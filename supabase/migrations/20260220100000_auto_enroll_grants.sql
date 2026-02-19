-- Cross-school login: ensure auto_enroll_student is callable by anon and authenticated
-- so a student who registered at one school can sign in at another and get auto-enrolled.

GRANT EXECUTE ON FUNCTION public.auto_enroll_student(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.auto_enroll_student(uuid, uuid) TO authenticated;
