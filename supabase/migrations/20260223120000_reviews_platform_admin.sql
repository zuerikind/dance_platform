-- Platform admin: list all reviews (with author and target info) and delete.

-- List reviews for platform admin dashboard (author email, target school name, etc.)
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
  ORDER BY r.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_reviews_platform_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_reviews_platform_admin() TO service_role;

COMMENT ON FUNCTION public.get_reviews_platform_admin() IS 'Platform admin only: list all reviews with author email and target name.';

-- Delete a review (platform admin only)
CREATE OR REPLACE FUNCTION public.delete_review_platform_admin(p_review_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Forbidden: not a platform admin';
  END IF;
  DELETE FROM public.reviews WHERE id = p_review_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_review_platform_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_review_platform_admin(uuid) TO service_role;

COMMENT ON FUNCTION public.delete_review_platform_admin(uuid) IS 'Platform admin only: delete a review by id.';
