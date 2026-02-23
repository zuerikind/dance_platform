-- Let platform admins see all reviews (including flagged/hidden) in the dev dashboard.
-- Without this, RLS "reviews_select_published" hides non-published rows from everyone, including admins.

CREATE POLICY "reviews_select_platform_admin" ON public.reviews
  FOR SELECT
  USING (public.is_platform_admin());

COMMENT ON POLICY "reviews_select_platform_admin" ON public.reviews IS 'Platform admin can see all reviews for moderation.';
