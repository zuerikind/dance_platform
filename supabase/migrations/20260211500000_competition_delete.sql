-- Admin: delete a competition (cascades to competition_registrations)
CREATE OR REPLACE FUNCTION public.competition_delete(p_competition_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
BEGIN
  SELECT c.school_id INTO v_school_id FROM public.competitions c WHERE c.id = p_competition_id;
  IF v_school_id IS NULL OR NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN false;
  END IF;
  DELETE FROM public.competitions WHERE id = p_competition_id;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.competition_delete(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_delete(uuid) TO anon;
