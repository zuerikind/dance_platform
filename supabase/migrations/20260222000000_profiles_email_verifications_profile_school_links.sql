-- Phase 1: Dancer identity layer – profiles (auth users), email_verifications, profile_school_links.
-- School-created students remain in students/student_profiles; no change to those flows.

-- =============================================================================
-- 0. updated_at trigger function (if not exists)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- 1. profiles table (one row per auth user)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'dancer' CHECK (role IN ('dancer', 'school_admin', 'platform_admin')),
  origin text NOT NULL CHECK (origin IN ('discovery', 'school', 'admin')),
  email_confirmed boolean NOT NULL DEFAULT false,
  first_name text,
  last_name text,
  display_name text,
  phone text,
  country text,
  city text,
  instagram text,
  dance_styles text[],
  level text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'One row per auth user (dancer identity). Used by discovery and unified profile settings.';

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================================================
-- 2. email_verifications (custom verification for discovery users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON public.email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token_hash ON public.email_verifications(token_hash);

ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
-- Prefer no direct client access; Edge Functions use service role. Optional: allow user to read own.
DROP POLICY IF EXISTS "email_verifications_select_own" ON public.email_verifications;
CREATE POLICY "email_verifications_select_own" ON public.email_verifications FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- 3. profile_school_links (for future linking; read-only in phase 1)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profile_school_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, school_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_school_links_profile_id ON public.profile_school_links(profile_id);

ALTER TABLE public.profile_school_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profile_school_links_select_own" ON public.profile_school_links;
CREATE POLICY "profile_school_links_select_own" ON public.profile_school_links FOR SELECT USING (auth.uid() = profile_id);
