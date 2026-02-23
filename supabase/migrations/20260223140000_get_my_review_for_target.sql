-- Let authenticated users check if they have already reviewed a target (for discovery "Leave a review" gating).
-- Returns one row with id if the current user has a review for the target, else no rows.

CREATE OR REPLACE FUNCTION public.get_my_review_for_target(
  p_target_type text,
  p_target_id uuid
)
RETURNS TABLE (id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id
  FROM public.reviews r
  WHERE r.author_profile_id = auth.uid()
    AND r.target_type = p_target_type
    AND r.target_id = p_target_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_review_for_target(text, uuid) TO authenticated;

COMMENT ON FUNCTION public.get_my_review_for_target(text, uuid) IS 'Returns current user’s review id for a target if any; used to hide “Leave a review” when already reviewed.';
