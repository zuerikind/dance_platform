-- Relax: return competition when is_active (show event to student even if sign-in not yet open).
-- Frontend will show "Register" only when is_sign_in_active is true.
-- Previously: required BOTH is_active AND is_sign_in_active, so students saw nothing until both toggles were on.

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
    AND c.is_active
  ORDER BY c.starts_at ASC
  LIMIT 1;
END;
$$;
