-- Public review summary and listing for discovery list and school detail.
-- Only published reviews; anon/authenticated can call.

-- Summary for all targets that have at least one published review (for discovery list cards)
CREATE OR REPLACE FUNCTION public.get_reviews_summary_for_discovery()
RETURNS TABLE (
  target_type text,
  target_id uuid,
  review_count bigint,
  avg_rating numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.target_type,
    r.target_id,
    count(*)::bigint AS review_count,
    round(avg(r.rating_overall)::numeric, 1) AS avg_rating
  FROM public.reviews r
  WHERE r.status = 'published'
  GROUP BY r.target_type, r.target_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_reviews_summary_for_discovery() TO anon;
GRANT EXECUTE ON FUNCTION public.get_reviews_summary_for_discovery() TO authenticated;

-- Summary for a single target (for school detail header)
CREATE OR REPLACE FUNCTION public.get_reviews_summary(p_target_type text, p_target_id uuid)
RETURNS TABLE (review_count bigint, avg_rating numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    count(*)::bigint AS review_count,
    round(avg(r.rating_overall)::numeric, 1) AS avg_rating
  FROM public.reviews r
  WHERE r.status = 'published'
    AND r.target_type = p_target_type
    AND r.target_id = p_target_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_reviews_summary(text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_reviews_summary(text, uuid) TO authenticated;

-- Paginated public reviews for one target (for detail page and "See all")
CREATE OR REPLACE FUNCTION public.get_reviews_public(
  p_target_type text,
  p_target_id uuid,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  rating_overall int,
  ratings jsonb,
  comment text,
  trust_level text,
  created_at timestamptz,
  author_display_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id,
    r.rating_overall,
    r.ratings,
    r.comment,
    r.trust_level,
    r.created_at,
    COALESCE(
      nullif(trim(p.first_name || ' ' || p.last_name), ''),
      p.first_name,
      p.last_name,
      'Dancer'
    ) AS author_display_name
  FROM public.reviews r
  JOIN public.profiles p ON p.id = r.author_profile_id
  WHERE r.status = 'published'
    AND r.target_type = p_target_type
    AND r.target_id = p_target_id
  ORDER BY r.created_at DESC
  LIMIT greatest(1, least(p_limit, 100))
  OFFSET greatest(0, p_offset);
$$;

GRANT EXECUTE ON FUNCTION public.get_reviews_public(text, uuid, int, int) TO anon;
GRANT EXECUTE ON FUNCTION public.get_reviews_public(text, uuid, int, int) TO authenticated;

COMMENT ON FUNCTION public.get_reviews_summary_for_discovery() IS 'Public: review count and average rating per target for discovery list.';
COMMENT ON FUNCTION public.get_reviews_summary(text, uuid) IS 'Public: review count and average for one school/teacher.';
COMMENT ON FUNCTION public.get_reviews_public(text, uuid, int, int) IS 'Public: paginated published reviews for discovery detail and See all.';
