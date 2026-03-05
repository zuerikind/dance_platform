-- Fix get_current_admin_school to also match by email (like get_current_admin does).
-- Previously it only matched by user_id = auth.uid(), which caused a 403 in notifications_send
-- for admins whose user_id was not yet linked in the admins table.

CREATE OR REPLACE FUNCTION public.get_current_admin_school()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'school_id', a.school_id,
    'email', a.email
  )
  FROM public.admins a
  WHERE (
    a.user_id = auth.uid()
    OR (
      auth.uid() IS NOT NULL
      AND a.email IS NOT NULL
      AND trim(a.email) != ''
      AND a.email NOT LIKE '%@admins.bailadmin.local'
      AND a.email NOT LIKE '%@temp.bailadmin.local'
      AND lower(trim(a.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    )
  )
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_current_admin_school() IS 'Returns school_id and email for the current auth user (admin). Matches by user_id or by email (fallback). Used by notifications_send Edge Function.';
