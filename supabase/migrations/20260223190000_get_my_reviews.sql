-- List current user's reviews for profile "Your reviews" (school name, rating, date, status).
CREATE OR REPLACE FUNCTION public.get_my_reviews()
RETURNS TABLE (
  id uuid,
  target_type text,
  target_id uuid,
  target_name text,
  rating_overall int,
  ratings jsonb,
  comment text,
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
    r.rating_overall,
    r.ratings,
    r.comment,
    r.status,
    r.created_at
  FROM public.reviews r
  LEFT JOIN public.schools s ON s.id = r.target_id AND r.target_type = 'school'
  WHERE r.author_profile_id = auth.uid()
  ORDER BY r.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_reviews() TO authenticated;

COMMENT ON FUNCTION public.get_my_reviews() IS 'Returns current user’s reviews with school name for profile “Your reviews”.';
