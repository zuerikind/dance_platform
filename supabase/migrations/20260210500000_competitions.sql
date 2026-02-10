-- =============================================================================
-- Jack and Jill competitions: tables, RLS, RPCs. School-scoped; students
-- register once per competition; admin approves/declines and publishes.
-- =============================================================================

-- Helper: current user's student row (when logged in as student via Auth).
-- Returns (school_id, student_id) or (NULL, NULL).
CREATE OR REPLACE FUNCTION public.get_current_student_context()
RETURNS TABLE(school_id uuid, student_id text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.school_id, s.id
  FROM public.students s
  WHERE s.user_id = auth.uid()
  LIMIT 1;
$$;

-- -----------------------------------------------------------------------------
-- TABLE: competitions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'JACK_AND_JILL' CHECK (type = 'JACK_AND_JILL'),
  name text NOT NULL,
  starts_at timestamptz NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]',
  next_steps_text text DEFAULT '',
  is_active boolean NOT NULL DEFAULT false,
  is_sign_in_active boolean NOT NULL DEFAULT false,
  decisions_published_at timestamptz NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_competitions_school_id ON public.competitions(school_id);
CREATE INDEX IF NOT EXISTS idx_competitions_active_signin ON public.competitions(school_id, is_active, is_sign_in_active) WHERE is_active AND is_sign_in_active;

-- -----------------------------------------------------------------------------
-- TABLE: competition_registrations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.competition_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id text NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'DECLINED')),
  submitted_at timestamptz NULL,
  decided_at timestamptz NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(competition_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_competition_registrations_competition ON public.competition_registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_registrations_school ON public.competition_registrations(school_id);

-- -----------------------------------------------------------------------------
-- RLS: competitions
-- -----------------------------------------------------------------------------
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- SELECT: school admin for school_id, OR platform admin, OR (student: competition where school = student's school AND (is_active AND is_sign_in_active) OR student has a registration for this competition)
CREATE POLICY "competitions_select_admin" ON public.competitions
  FOR SELECT USING (
    public.is_school_admin(school_id) OR public.is_platform_admin()
  );

CREATE POLICY "competitions_select_student" ON public.competitions
  FOR SELECT USING (
    (SELECT ctx.school_id FROM public.get_current_student_context() ctx LIMIT 1) = competitions.school_id
    AND (
      (competitions.is_active AND competitions.is_sign_in_active)
      OR EXISTS (
        SELECT 1 FROM public.competition_registrations r
        JOIN (SELECT school_id, student_id FROM public.get_current_student_context() LIMIT 1) ctx ON true
        WHERE r.competition_id = competitions.id AND r.student_id = ctx.student_id
      )
    )
  );

-- INSERT/UPDATE/DELETE: school admin or platform admin only
CREATE POLICY "competitions_insert" ON public.competitions
  FOR INSERT WITH CHECK (public.is_school_admin(school_id) OR public.is_platform_admin());

CREATE POLICY "competitions_update" ON public.competitions
  FOR UPDATE USING (public.is_school_admin(school_id) OR public.is_platform_admin());

CREATE POLICY "competitions_delete" ON public.competitions
  FOR DELETE USING (public.is_school_admin(school_id) OR public.is_platform_admin());

-- -----------------------------------------------------------------------------
-- RLS: competition_registrations
-- -----------------------------------------------------------------------------
ALTER TABLE public.competition_registrations ENABLE ROW LEVEL SECURITY;

-- SELECT: school admin for school_id, OR student's own row
CREATE POLICY "competition_registrations_select_admin" ON public.competition_registrations
  FOR SELECT USING (public.is_school_admin(school_id) OR public.is_platform_admin());

CREATE POLICY "competition_registrations_select_student" ON public.competition_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.get_current_student_context() ctx
      WHERE ctx.student_id = competition_registrations.student_id AND ctx.school_id = competition_registrations.school_id
    )
  );

-- INSERT: student only for own row (enforced by RPC in practice; RLS allows if student_id matches current student and school matches)
CREATE POLICY "competition_registrations_insert_student" ON public.competition_registrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.get_current_student_context() ctx
      WHERE ctx.student_id = competition_registrations.student_id AND ctx.school_id = competition_registrations.school_id
    )
  );

-- UPDATE: student can update own row only when status = DRAFT; admin can update any in their school
CREATE POLICY "competition_registrations_update_student" ON public.competition_registrations
  FOR UPDATE USING (
    (EXISTS (SELECT 1 FROM public.get_current_student_context() ctx WHERE ctx.student_id = competition_registrations.student_id) AND status = 'DRAFT')
    OR public.is_school_admin(school_id)
    OR public.is_platform_admin()
  );

CREATE POLICY "competition_registrations_delete" ON public.competition_registrations
  FOR DELETE USING (public.is_school_admin(school_id) OR public.is_platform_admin());

-- -----------------------------------------------------------------------------
-- RPCs (SECURITY DEFINER, enforce school/role in body)
-- -----------------------------------------------------------------------------

-- Admin: create competition
CREATE OR REPLACE FUNCTION public.competition_create(
  p_school_id uuid,
  p_name text,
  p_starts_at timestamptz,
  p_questions jsonb,
  p_next_steps_text text
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
    RETURN NULL;
  END IF;
  INSERT INTO public.competitions (school_id, type, name, starts_at, questions, next_steps_text)
  VALUES (p_school_id, 'JACK_AND_JILL', trim(p_name), p_starts_at, COALESCE(p_questions, '[]'::jsonb), COALESCE(trim(p_next_steps_text), ''))
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_create(uuid, text, timestamptz, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_create(uuid, text, timestamptz, jsonb, text) TO anon;

-- Admin: update competition
CREATE OR REPLACE FUNCTION public.competition_update(
  p_competition_id uuid,
  p_name text,
  p_starts_at timestamptz,
  p_questions jsonb,
  p_next_steps_text text,
  p_is_active boolean,
  p_is_sign_in_active boolean
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
  IF v_school_id IS NULL OR NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;
  UPDATE public.competitions
  SET name = trim(p_name), starts_at = p_starts_at, questions = COALESCE(p_questions, questions), next_steps_text = COALESCE(trim(p_next_steps_text), next_steps_text),
      is_active = p_is_active, is_sign_in_active = p_is_sign_in_active, updated_at = now()
  WHERE id = p_competition_id;
  RETURN to_jsonb((SELECT row_to_json(c) FROM public.competitions c WHERE c.id = p_competition_id));
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_update(uuid, text, timestamptz, jsonb, text, boolean, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_update(uuid, text, timestamptz, jsonb, text, boolean, boolean) TO anon;

-- Admin: toggle is_active
CREATE OR REPLACE FUNCTION public.competition_toggle_active(p_competition_id uuid, p_is_active boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
  v_row public.competitions;
BEGIN
  SELECT c.school_id INTO v_school_id FROM public.competitions c WHERE c.id = p_competition_id;
  IF v_school_id IS NULL OR NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;
  UPDATE public.competitions SET is_active = p_is_active, updated_at = now() WHERE id = p_competition_id RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_toggle_active(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_toggle_active(uuid, boolean) TO anon;

-- Admin: toggle is_sign_in_active
CREATE OR REPLACE FUNCTION public.competition_toggle_sign_in(p_competition_id uuid, p_is_sign_in_active boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
  v_row public.competitions;
BEGIN
  SELECT c.school_id INTO v_school_id FROM public.competitions c WHERE c.id = p_competition_id;
  IF v_school_id IS NULL OR NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;
  UPDATE public.competitions SET is_sign_in_active = p_is_sign_in_active, updated_at = now() WHERE id = p_competition_id RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_toggle_sign_in(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_toggle_sign_in(uuid, boolean) TO anon;

-- Admin: list competitions for school
CREATE OR REPLACE FUNCTION public.competition_list_for_admin(p_school_id uuid)
RETURNS SETOF public.competitions
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT * FROM public.competitions
  WHERE school_id = p_school_id
  ORDER BY starts_at DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_list_for_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_list_for_admin(uuid) TO anon;

-- Student: get single "current" competition (is_active AND is_sign_in_active, nearest upcoming then past)
CREATE OR REPLACE FUNCTION public.competition_get_for_student(p_student_id text, p_school_id uuid)
RETURNS SETOF public.competitions
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id AND school_id = p_school_id) THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT c.* FROM public.competitions c
  WHERE c.school_id = p_school_id
    AND c.type = 'JACK_AND_JILL'
    AND c.is_active AND c.is_sign_in_active
  ORDER BY c.starts_at ASC
  LIMIT 1;
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_get_for_student(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_get_for_student(text, uuid) TO anon;

-- Student: get one competition by id (for registration page; must be same school and allowed)
CREATE OR REPLACE FUNCTION public.competition_get_by_id_for_student(p_competition_id uuid, p_student_id text, p_school_id uuid)
RETURNS SETOF public.competitions
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id AND school_id = p_school_id) THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT c.* FROM public.competitions c
  WHERE c.id = p_competition_id AND c.school_id = p_school_id
    AND (c.is_active AND c.is_sign_in_active OR EXISTS (SELECT 1 FROM public.competition_registrations r WHERE r.competition_id = c.id AND r.student_id = p_student_id));
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_get_by_id_for_student(uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_get_by_id_for_student(uuid, text, uuid) TO anon;

-- Student: get or create registration (upsert draft)
CREATE OR REPLACE FUNCTION public.competition_registration_upsert_draft(
  p_competition_id uuid,
  p_student_id text,
  p_school_id uuid,
  p_answers jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comp_school uuid;
  v_row public.competition_registrations;
BEGIN
  SELECT school_id INTO v_comp_school FROM public.competitions WHERE id = p_competition_id;
  IF v_comp_school IS NULL OR v_comp_school <> p_school_id THEN
    RETURN NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id AND school_id = p_school_id) THEN
    RETURN NULL;
  END IF;
  INSERT INTO public.competition_registrations (competition_id, school_id, student_id, answers, status)
  VALUES (p_competition_id, p_school_id, p_student_id, COALESCE(p_answers, '{}'), 'DRAFT')
  ON CONFLICT (competition_id, student_id) DO UPDATE
  SET answers = COALESCE(p_answers, competition_registrations.answers), updated_at = now()
  WHERE competition_registrations.status = 'DRAFT'
  RETURNING * INTO v_row;
  IF v_row.id IS NULL THEN
    SELECT * INTO v_row FROM public.competition_registrations WHERE competition_id = p_competition_id AND student_id = p_student_id LIMIT 1;
  END IF;
  RETURN to_jsonb(v_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_registration_upsert_draft(uuid, text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_registration_upsert_draft(uuid, text, uuid, jsonb) TO anon;

-- Student: submit registration (DRAFT -> SUBMITTED once)
CREATE OR REPLACE FUNCTION public.competition_registration_submit(
  p_competition_id uuid,
  p_student_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.competition_registrations;
BEGIN
  UPDATE public.competition_registrations
  SET status = 'SUBMITTED', submitted_at = now(), updated_at = now()
  WHERE competition_id = p_competition_id AND student_id = p_student_id AND status = 'DRAFT'
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_registration_submit(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_registration_submit(uuid, text) TO anon;

-- Student: get own registration for a competition
CREATE OR REPLACE FUNCTION public.competition_registration_get(
  p_competition_id uuid,
  p_student_id text
)
RETURNS SETOF public.competition_registrations
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.competition_registrations
  WHERE competition_id = p_competition_id AND student_id = p_student_id
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.competition_registration_get(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_registration_get(uuid, text) TO anon;

-- Admin: list registrations for a competition
CREATE OR REPLACE FUNCTION public.competition_registrations_list(p_competition_id uuid)
RETURNS TABLE(
  id uuid,
  competition_id uuid,
  school_id uuid,
  student_id text,
  answers jsonb,
  status text,
  submitted_at timestamptz,
  decided_at timestamptz,
  created_at timestamptz,
  student_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.competition_id, r.school_id, r.student_id, r.answers, r.status, r.submitted_at, r.decided_at, r.created_at, s.name AS student_name
  FROM public.competition_registrations r
  JOIN public.students s ON s.id = r.student_id AND s.school_id = r.school_id
  WHERE r.competition_id = p_competition_id
    AND (public.is_school_admin(r.school_id) OR public.is_platform_admin())
  ORDER BY r.submitted_at DESC NULLS LAST, r.created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.competition_registrations_list(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_registrations_list(uuid) TO anon;

-- Admin: set approve/decline for a registration
CREATE OR REPLACE FUNCTION public.competition_registration_decide(
  p_registration_id uuid,
  p_status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
  v_row public.competition_registrations;
BEGIN
  IF p_status NOT IN ('APPROVED', 'DECLINED') THEN
    RETURN NULL;
  END IF;
  SELECT r.school_id INTO v_school_id FROM public.competition_registrations r WHERE r.id = p_registration_id;
  IF v_school_id IS NULL OR NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;
  UPDATE public.competition_registrations
  SET status = p_status, decided_at = now(), updated_at = now()
  WHERE id = p_registration_id AND status = 'SUBMITTED'
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_registration_decide(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_registration_decide(uuid, text) TO anon;

-- Admin: publish decisions (set competition.decisions_published_at)
CREATE OR REPLACE FUNCTION public.competition_publish_decisions(p_competition_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
  v_row public.competitions;
BEGIN
  SELECT c.school_id INTO v_school_id FROM public.competitions c WHERE c.id = p_competition_id;
  IF v_school_id IS NULL OR NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;
  UPDATE public.competitions SET decisions_published_at = now(), updated_at = now() WHERE id = p_competition_id RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_publish_decisions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_publish_decisions(uuid) TO anon;

-- Admin: get one competition by id (for edit/registrations page)
CREATE OR REPLACE FUNCTION public.competition_get_by_id_admin(p_competition_id uuid, p_school_id uuid)
RETURNS SETOF public.competitions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.competitions
  WHERE id = p_competition_id AND school_id = p_school_id
    AND (public.is_school_admin(p_school_id) OR public.is_platform_admin());
$$;
GRANT EXECUTE ON FUNCTION public.competition_get_by_id_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_get_by_id_admin(uuid, uuid) TO anon;
