-- Run this in Supabase Dashboard → SQL Editor
-- Fixes: "Bucket not found", "function competition_update not found", and "row-level security" / events not showing
-- Creates bucket, policies, updates RPC functions, and helps link admin accounts

-- ========== OPTIONAL: Link admin "Chris" to their Auth session (if events don't show) ==========
-- Run this ONLY if you're logged in as Chris in the app and don't see events.
-- 1. Get your Auth user ID: Supabase Dashboard → Authentication → Users → find the user (email like chris+uuid@admins.bailadmin.local) → copy the UUID
-- 2. Get Mexa Flow school ID: Supabase Dashboard → Table Editor → schools → find Mexa Flow → copy id
-- 3. Uncomment and run:
/*
UPDATE public.admins 
SET user_id = 'PASTE_YOUR_AUTH_USER_UUID_HERE'::uuid 
WHERE school_id = 'PASTE_MEXA_FLOW_SCHOOL_UUID_HERE'::uuid 
  AND (TRIM(username) ILIKE 'chris' OR TRIM(username) ILIKE 'Chris');
*/

-- 0. Add image_url column if missing
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';

-- 1. Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'competition-logos',
  'competition-logos',
  true,
  15728640,  -- 15 MB
  ARRAY['image/jpeg', 'image/png', 'image/x-png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 15728640,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/x-png', 'image/gif', 'image/webp']::text[];

-- 2. Drop existing policies if they exist (to avoid "policy already exists" errors)
DROP POLICY IF EXISTS "competition_logos_insert" ON storage.objects;
DROP POLICY IF EXISTS "competition_logos_insert_anon" ON storage.objects;
DROP POLICY IF EXISTS "competition_logos_select" ON storage.objects;
DROP POLICY IF EXISTS "competition_logos_select_anon" ON storage.objects;
DROP POLICY IF EXISTS "competition_logos_select_auth" ON storage.objects;

-- 3. Create policies for admins to upload logos
-- NOTE: Do NOT call is_school_admin() from Storage RLS. Supabase bug: JWT/auth.uid() is sometimes
-- unavailable in Storage policy context (works in RPC, fails in Storage). Inline the check and use
-- auth.jwt()->>'sub' per Storage docs; COALESCE with auth.uid() for compatibility.
CREATE POLICY "competition_logos_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'competition-logos'
  AND (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.school_id = ((storage.foldername(name))[1])::uuid
        AND a.user_id = COALESCE(auth.uid(), (NULLIF(TRIM(auth.jwt()->>'sub'), ''))::uuid)
    )
    OR EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = COALESCE(auth.uid(), (NULLIF(TRIM(auth.jwt()->>'sub'), ''))::uuid)
    )
  )
);

CREATE POLICY "competition_logos_insert_anon"
ON storage.objects FOR INSERT TO anon
WITH CHECK (
  bucket_id = 'competition-logos'
  AND (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.school_id = ((storage.foldername(name))[1])::uuid
        AND a.user_id = (NULLIF(TRIM(auth.jwt()->>'sub'), ''))::uuid
    )
    OR EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = (NULLIF(TRIM(auth.jwt()->>'sub'), ''))::uuid
    )
  )
);

CREATE POLICY "competition_logos_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'competition-logos');

-- 4. Update competition_update to accept p_image_url (fixes "function not found in schema cache")
CREATE OR REPLACE FUNCTION public.competition_update(
  p_competition_id uuid,
  p_name text,
  p_starts_at timestamptz,
  p_questions jsonb,
  p_next_steps_text text,
  p_is_active boolean,
  p_is_sign_in_active boolean,
  p_video_submission_enabled boolean DEFAULT false,
  p_video_submission_prompt text DEFAULT '',
  p_image_url text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
BEGIN
  SELECT c.school_id INTO v_school_id FROM public.competitions c WHERE c.id = p_competition_id;
  IF v_school_id IS NULL THEN RAISE EXCEPTION 'Competition not found.'; END IF;
  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied: not an admin for this school. Log in as a school admin.';
  END IF;
  UPDATE public.competitions
  SET name = trim(p_name), starts_at = p_starts_at, questions = COALESCE(p_questions, questions),
      next_steps_text = COALESCE(trim(p_next_steps_text), next_steps_text),
      is_active = p_is_active, is_sign_in_active = p_is_sign_in_active,
      video_submission_enabled = COALESCE(p_video_submission_enabled, video_submission_enabled),
      video_submission_prompt = COALESCE(trim(p_video_submission_prompt), video_submission_prompt),
      image_url = COALESCE(nullif(trim(p_image_url), ''), image_url),
      updated_at = now()
  WHERE id = p_competition_id;
  RETURN to_jsonb((SELECT row_to_json(c) FROM public.competitions c WHERE c.id = p_competition_id));
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_update(uuid, text, timestamptz, jsonb, text, boolean, boolean, boolean, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_update(uuid, text, timestamptz, jsonb, text, boolean, boolean, boolean, text, text) TO anon;

-- 5. Update competition_create to accept p_image_url
CREATE OR REPLACE FUNCTION public.competition_create(
  p_school_id uuid,
  p_name text,
  p_starts_at timestamptz,
  p_questions jsonb,
  p_next_steps_text text,
  p_video_submission_enabled boolean DEFAULT false,
  p_video_submission_prompt text DEFAULT '',
  p_image_url text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.competitions;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied: not an admin for this school. Log in as a school admin.';
  END IF;
  INSERT INTO public.competitions (school_id, type, name, starts_at, questions, next_steps_text, video_submission_enabled, video_submission_prompt, image_url)
  VALUES (p_school_id, 'JACK_AND_JILL', trim(p_name), p_starts_at, COALESCE(p_questions, '[]'::jsonb), COALESCE(trim(p_next_steps_text), ''), COALESCE(p_video_submission_enabled, false), COALESCE(trim(p_video_submission_prompt), ''), COALESCE(nullif(trim(p_image_url), ''), ''))
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_create(uuid, text, timestamptz, jsonb, text, boolean, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_create(uuid, text, timestamptz, jsonb, text, boolean, text, text) TO anon;
