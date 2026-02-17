-- Fix: is_school_admin should also recognize admins whose email matches auth.jwt().email
-- when user_id is not yet linked. This allows the admin list to appear in Settings when
-- an admin was added with real email (e.g. manually in DB) but Auth link hasn't run yet.

CREATE OR REPLACE FUNCTION public.is_school_admin(p_school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.school_id = p_school_id
      AND (
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
  );
$$;

-- RPC: get_current_admin – returns the current user's admin row for the school.
-- Used when admins list is empty (RLS) but we need currentAdmin for My Profile / Change Password.
-- Matches by user_id = auth.uid() OR by email when auth.jwt().email matches.
CREATE OR REPLACE FUNCTION public.get_current_admin(p_school_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT to_jsonb(a)
  FROM public.admins a
  WHERE a.school_id = p_school_id
    AND (
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

COMMENT ON FUNCTION public.get_current_admin(uuid) IS 'Return current user''s admin row for school. Matches by user_id or email. Used for profile/password in settings.';
GRANT EXECUTE ON FUNCTION public.get_current_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_admin(uuid) TO anon;
