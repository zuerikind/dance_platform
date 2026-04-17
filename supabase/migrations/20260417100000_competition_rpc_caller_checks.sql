-- Add caller-identity checks to student-facing competition RPCs.
-- Previously these checked that the student row exists but not that the
-- caller (auth.uid()) is that student. A different authenticated user could
-- pass another student's id and read or mutate their registration.
--
-- Three RPCs are fixed:
--   1. competition_get_for_student      – read-only; low but real info-disclosure risk
--   2. competition_registration_upsert_draft – write; medium risk
--   3. competition_registration_submit  – write; medium risk
--
-- All callers in the app already pass state.currentUser.id which is the
-- authenticated student, so normal usage is unaffected.

-- 1. competition_get_for_student
-- Overrides both 20260210500000 and 20260211400000 (relaxed version).
-- Logic preserved: return is_active competition; auth.uid() check added.
CREATE OR REPLACE FUNCTION public.competition_get_for_student(p_student_id text, p_school_id uuid)
RETURNS SETOF public.competitions
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- caller must be this student
  IF NOT EXISTS (
    SELECT 1 FROM public.students
    WHERE id = p_student_id AND school_id = p_school_id AND user_id = auth.uid()
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT c.* FROM public.competitions c
  WHERE c.school_id = p_school_id
    AND c.type = 'JACK_AND_JILL'
    AND c.is_active
  ORDER BY c.starts_at ASC
  LIMIT 1;
END;
$$;

-- 2. competition_registration_upsert_draft
-- Logic preserved: upserts draft, returns row; auth.uid() check added.
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
  -- caller must be this student
  IF NOT EXISTS (
    SELECT 1 FROM public.students
    WHERE id = p_student_id AND school_id = p_school_id AND user_id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;

  SELECT school_id INTO v_comp_school FROM public.competitions WHERE id = p_competition_id;
  IF v_comp_school IS NULL OR v_comp_school <> p_school_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.competition_registrations (competition_id, school_id, student_id, answers, status)
  VALUES (p_competition_id, p_school_id, p_student_id, COALESCE(p_answers, '{}'), 'DRAFT')
  ON CONFLICT (competition_id, student_id) DO UPDATE
  SET answers = COALESCE(p_answers, competition_registrations.answers), updated_at = now()
  WHERE competition_registrations.status = 'DRAFT'
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    SELECT * INTO v_row FROM public.competition_registrations
    WHERE competition_id = p_competition_id AND student_id = p_student_id LIMIT 1;
  END IF;

  RETURN to_jsonb(v_row);
END;
$$;

-- 3. competition_registration_submit
-- Logic preserved: DRAFT → SUBMITTED; auth.uid() check added.
-- school_id is derived from the student row (p_school_id not a parameter here).
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
  -- caller must be this student
  IF NOT EXISTS (
    SELECT 1 FROM public.students
    WHERE id = p_student_id AND user_id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;

  UPDATE public.competition_registrations
  SET status = 'SUBMITTED', submitted_at = now(), updated_at = now()
  WHERE competition_id = p_competition_id AND student_id = p_student_id AND status = 'DRAFT'
  RETURNING * INTO v_row;

  RETURN to_jsonb(v_row);
END;
$$;
