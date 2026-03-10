-- The view is only safe to query via SECURITY DEFINER functions that enforce school scoping.
-- Revoking direct access closes the P0 cross-school data leak.
REVOKE SELECT ON public.students_with_profile FROM anon;
REVOKE SELECT ON public.students_with_profile FROM authenticated;
