-- Reviews for discovery: schools and private teachers. Trust levels: verified (linked) / community.
-- Submissions via Edge Function only; client cannot INSERT/UPDATE directly.

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('school', 'teacher')),
  target_id uuid NOT NULL,
  author_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating_overall int NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
  ratings jsonb,
  comment text,
  trust_level text NOT NULL CHECK (trust_level IN ('verified', 'community')),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'flagged', 'hidden')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(author_profile_id, target_type, target_id)
);

ALTER TABLE public.reviews ADD CONSTRAINT reviews_comment_length CHECK (char_length(comment) <= 500);

CREATE INDEX IF NOT EXISTS idx_reviews_target ON public.reviews(target_type, target_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_author ON public.reviews(author_profile_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON public.reviews(created_at);

DROP TRIGGER IF EXISTS set_reviews_updated_at ON public.reviews;
CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public read for published reviews only
CREATE POLICY "reviews_select_published" ON public.reviews
  FOR SELECT USING (status = 'published');

-- No INSERT/UPDATE/DELETE for anon or authenticated; Edge Function uses service role
-- (no policy = denied for client)

COMMENT ON TABLE public.reviews IS 'Reviews for discovery schools/teachers. Insert/update via submit_review Edge Function only.';
