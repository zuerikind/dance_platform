-- Admin: get one registration by id (for viewing answers)
-- Used when admin clicks to view student answers in registrations list
CREATE OR REPLACE FUNCTION public.competition_registration_get_by_id_admin(p_registration_id uuid)
RETURNS SETOF public.competition_registrations
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.* FROM public.competition_registrations r
  WHERE r.id = p_registration_id
    AND (public.is_school_admin(r.school_id) OR public.is_platform_admin());
$$;
GRANT EXECUTE ON FUNCTION public.competition_registration_get_by_id_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.competition_registration_get_by_id_admin(uuid) TO anon;
