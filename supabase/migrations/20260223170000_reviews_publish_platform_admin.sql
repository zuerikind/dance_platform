-- Platform admin: publish a flagged review (set status to 'published') and order admin list with flagged first.

-- Allow platform admins to UPDATE reviews (for publish action)
DROP POLICY IF EXISTS "reviews_update_platform_admin" ON public.reviews;
CREATE POLICY "reviews_update_platform_admin" ON public.reviews
  FOR UPDATE
  USING (public.is_platform_admin());

COMMENT ON POLICY "reviews_update_platform_admin" ON public.reviews IS 'Platform admin can update review status (e.g. publish flagged).';

-- RPC: publish a review (set status = 'published'). Platform admin only.
CREATE OR REPLACE FUNCTION public.publish_review_platform_admin(p_review_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Forbidden: not a platform admin';
  END IF;
  UPDATE public.reviews
  SET status = 'published', updated_at = now()
  WHERE id = p_review_id AND status IN ('flagged', 'hidden');
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_review_platform_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_review_platform_admin(uuid) TO service_role;

COMMENT ON FUNCTION public.publish_review_platform_admin(uuid) IS 'Platform admin only: set review status to published (accept flagged/hidden review).';

-- List: put flagged first so they are easy to spot
CREATE OR REPLACE FUNCTION public.get_reviews_platform_admin()
RETURNS TABLE (
  id uuid,
  target_type text,
  target_id uuid,
  target_name text,
  author_profile_id uuid,
  author_email text,
  rating_overall int,
  ratings jsonb,
  comment text,
  trust_level text,
  status text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id,
    r.target_type,
    r.target_id,
    COALESCE(s.name, r.target_id::text) AS target_name,
    r.author_profile_id,
    p.email AS author_email,
    r.rating_overall,
    r.ratings,
    r.comment,
    r.trust_level,
    r.status,
    r.created_at
  FROM public.reviews r
  LEFT JOIN public.profiles p ON p.id = r.author_profile_id
  LEFT JOIN public.schools s ON s.id = r.target_id
  WHERE public.is_platform_admin()
  ORDER BY (CASE WHEN r.status = 'flagged' THEN 0 WHEN r.status = 'hidden' THEN 1 ELSE 2 END), r.created_at DESC;
$$;
