-- Phase 2: Account linking – profile_student_links, student_activation_invites, account_link_audit.
-- Enables school-created students to link to an auth profile (discovery or school) without duplicates.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- 1. profile_student_links (one profile can link to many school students; one school student → one profile)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profile_student_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_student_id text NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, school_student_id),
  UNIQUE(school_student_id)
);

COMMENT ON TABLE public.profile_student_links IS 'Links auth profile to school student enrollment. One school-student can link to only one profile.';

CREATE INDEX IF NOT EXISTS idx_profile_student_links_profile_id ON public.profile_student_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_student_links_school_id ON public.profile_student_links(school_id);

ALTER TABLE public.profile_student_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile_student_links_select_own" ON public.profile_student_links FOR SELECT USING (auth.uid() = profile_id);

-- =============================================================================
-- 2. student_activation_invites (one-time invite tokens for “activate account” flow)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.student_activation_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  school_student_id text NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.student_activation_invites IS 'One-time invites for students to activate/link their Bailadmin account.';

CREATE INDEX IF NOT EXISTS idx_student_activation_invites_token_hash ON public.student_activation_invites(token_hash);
CREATE INDEX IF NOT EXISTS idx_student_activation_invites_school_student ON public.student_activation_invites(school_id, school_student_id);

ALTER TABLE public.student_activation_invites ENABLE ROW LEVEL SECURITY;
-- No client access; Edge Functions use service role.

-- =============================================================================
-- 3. account_link_audit (server-only readable via Edge Function / admin)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.account_link_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  school_student_id text REFERENCES public.students(id) ON DELETE SET NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.account_link_audit IS 'Audit log for invite/link actions. Read via admin/Edge Function only.';

CREATE INDEX IF NOT EXISTS idx_account_link_audit_school ON public.account_link_audit(school_id);
CREATE INDEX IF NOT EXISTS idx_account_link_audit_created ON public.account_link_audit(created_at);

ALTER TABLE public.account_link_audit ENABLE ROW LEVEL SECURITY;
-- No policies: no direct client access; Edge Functions use service role.

-- =============================================================================
-- 4. normalized_email on profiles and students (for matching; optional)
-- =============================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS normalized_email text;
CREATE INDEX IF NOT EXISTS idx_profiles_normalized_email ON public.profiles(normalized_email) WHERE normalized_email IS NOT NULL;

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS normalized_email text;
CREATE INDEX IF NOT EXISTS idx_students_normalized_email ON public.students(normalized_email) WHERE normalized_email IS NOT NULL;

-- Backfill and trigger for profiles
UPDATE public.profiles SET normalized_email = lower(trim(email)) WHERE normalized_email IS NULL AND email IS NOT NULL;
CREATE OR REPLACE FUNCTION public.set_profiles_normalized_email()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.normalized_email = lower(trim(NEW.email));
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trigger_profiles_normalized_email ON public.profiles;
CREATE TRIGGER trigger_profiles_normalized_email
  BEFORE INSERT OR UPDATE OF email ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_profiles_normalized_email();

-- Backfill and trigger for students (application can also set when updating email)
UPDATE public.students SET normalized_email = lower(trim(email)) WHERE normalized_email IS NULL AND email IS NOT NULL;
CREATE OR REPLACE FUNCTION public.set_students_normalized_email()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.normalized_email = CASE WHEN NEW.email IS NOT NULL THEN lower(trim(NEW.email)) ELSE NULL END;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trigger_students_normalized_email ON public.students;
CREATE TRIGGER trigger_students_normalized_email
  BEFORE INSERT OR UPDATE OF email ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.set_students_normalized_email();

-- =============================================================================
-- 5. RPC: create_student_activation_invite (called by Edge Function with admin JWT)
-- Returns raw_token, student_email, school_name for email sending. Runs as caller; checks is_school_admin.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_student_activation_invite(p_school_id uuid, p_school_student_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_name text;
  v_student_email text;
  v_raw_token text;
  v_token_hash text;
  v_expires_at timestamptz;
  v_invite_id uuid;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Forbidden: not a school admin';
  END IF;

  SELECT s.name INTO v_school_name FROM public.schools s WHERE s.id = p_school_id;
  IF v_school_name IS NULL THEN
    RAISE EXCEPTION 'School not found';
  END IF;

  SELECT COALESCE(sp.email, st.email) INTO v_student_email
  FROM public.students st
  LEFT JOIN public.student_profiles sp ON sp.user_id = st.user_id
  WHERE st.id = p_school_student_id AND st.school_id = p_school_id;
  IF v_student_email IS NULL OR trim(v_student_email) = '' THEN
    RAISE EXCEPTION 'Student has no email';
  END IF;

  -- One active invite per student: expire any existing
  UPDATE public.student_activation_invites
  SET expires_at = now() - interval '1 second'
  WHERE school_student_id = p_school_student_id AND consumed_at IS NULL;

  v_raw_token := encode(gen_random_bytes(24), 'hex');
  v_token_hash := encode(digest(v_raw_token, 'sha256'), 'hex');
  v_expires_at := now() + interval '7 days';

  INSERT INTO public.student_activation_invites (school_id, school_student_id, token_hash, expires_at)
  VALUES (p_school_id, p_school_student_id, v_token_hash, v_expires_at)
  RETURNING id INTO v_invite_id;

  RETURN jsonb_build_object(
    'invite_id', v_invite_id,
    'raw_token', v_raw_token,
    'student_email', v_student_email,
    'school_name', v_school_name
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_student_activation_invite(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_student_activation_invite(uuid, text) TO service_role;
