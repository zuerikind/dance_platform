-- Use effective rating (average of overall + category ratings when present) for summary so displayed avg is correct.

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
  WITH effective AS (
    SELECT
      r.target_type,
      r.target_id,
      CASE
        WHEN r.ratings IS NOT NULL AND jsonb_typeof(r.ratings) = 'object' AND (SELECT count(*) FROM jsonb_each_text(r.ratings)) > 0
        THEN (
          r.rating_overall::numeric
          + (SELECT sum((value)::numeric) FROM jsonb_each_text(r.ratings))
        ) / (1 + (SELECT count(*)::numeric FROM jsonb_each_text(r.ratings)))
        ELSE r.rating_overall::numeric
      END AS effective_rating
    FROM public.reviews r
    WHERE r.status = 'published'
  )
  SELECT
    target_type,
    target_id,
    count(*)::bigint AS review_count,
    round(avg(effective_rating)::numeric, 1) AS avg_rating
  FROM effective
  GROUP BY target_type, target_id;
$$;

CREATE OR REPLACE FUNCTION public.get_reviews_summary(p_target_type text, p_target_id uuid)
RETURNS TABLE (review_count bigint, avg_rating numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH effective AS (
    SELECT
      CASE
        WHEN r.ratings IS NOT NULL AND jsonb_typeof(r.ratings) = 'object' AND (SELECT count(*) FROM jsonb_each_text(r.ratings)) > 0
        THEN (
          r.rating_overall::numeric
          + (SELECT sum((value)::numeric) FROM jsonb_each_text(r.ratings))
        ) / (1 + (SELECT count(*)::numeric FROM jsonb_each_text(r.ratings)))
        ELSE r.rating_overall::numeric
      END AS effective_rating
    FROM public.reviews r
    WHERE r.status = 'published'
      AND r.target_type = p_target_type
      AND r.target_id = p_target_id
  )
  SELECT
    count(*)::bigint AS review_count,
    round(avg(effective_rating)::numeric, 1) AS avg_rating
  FROM effective;
$$;

COMMENT ON FUNCTION public.get_reviews_summary_for_discovery() IS 'Public: review count and average (using effective rating: avg of overall + categories when present).';
COMMENT ON FUNCTION public.get_reviews_summary(text, uuid) IS 'Public: review count and average for one target (effective rating).';
