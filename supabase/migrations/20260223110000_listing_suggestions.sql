-- Listing suggestions: users can suggest new schools/teachers for discovery. Moderation by platform admin.

CREATE TABLE IF NOT EXISTS public.listing_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggester_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  suggested_type text NOT NULL CHECK (suggested_type IN ('school', 'teacher')),
  name text NOT NULL,
  city text,
  country text,
  dance_styles text[],
  instagram text,
  website text,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_suggestions_status ON public.listing_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_listing_suggestions_type_city_country ON public.listing_suggestions(suggested_type, city, country);

ALTER TABLE public.listing_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own suggestion; can select own
CREATE POLICY "listing_suggestions_insert_own" ON public.listing_suggestions
  FOR INSERT WITH CHECK (auth.uid() = suggester_profile_id);

CREATE POLICY "listing_suggestions_select_own" ON public.listing_suggestions
  FOR SELECT USING (auth.uid() = suggester_profile_id);

-- Platform admin read/all in Edge Function via service role; no client UPDATE/DELETE policies
COMMENT ON TABLE public.listing_suggestions IS 'User-submitted school/teacher suggestions for discovery. Moderation via admin_review_listing_suggestion Edge Function.';

-- RPC: list pending suggestions (platform admin only)
CREATE OR REPLACE FUNCTION public.get_listing_suggestions_pending()
RETURNS SETOF public.listing_suggestions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.listing_suggestions WHERE status = 'pending' AND public.is_platform_admin() ORDER BY created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.get_listing_suggestions_pending() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_listing_suggestions_pending() TO anon;
