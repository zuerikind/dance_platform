-- Allow school admins to insert new admins for their own school.
-- Previously only platform admins could insert; school admins (e.g. Ale) could not add co-admins.

DROP POLICY IF EXISTS "admins_insert" ON public.admins;
CREATE POLICY "admins_insert" ON public.admins
  FOR INSERT WITH CHECK (
    public.is_platform_admin()
    OR public.is_school_admin(admins.school_id)
  );
