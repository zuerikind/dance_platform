-- RPC for school admin to get per-student activation status (linked / invited) for the students list UI.
CREATE OR REPLACE FUNCTION public.get_school_students_activation_status(p_school_id uuid)
RETURNS TABLE(student_id text, linked boolean, invited_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id AS student_id,
    EXISTS (SELECT 1 FROM public.profile_student_links psl WHERE psl.school_student_id = s.id) AS linked,
    (SELECT i.created_at FROM public.student_activation_invites i
     WHERE i.school_student_id = s.id AND i.school_id = p_school_id
       AND i.consumed_at IS NULL AND i.expires_at > now()
     ORDER BY i.created_at DESC LIMIT 1) AS invited_at
  FROM public.students s
  WHERE s.school_id = p_school_id
    AND (public.is_school_admin(p_school_id) OR public.is_platform_admin());
$$;
GRANT EXECUTE ON FUNCTION public.get_school_students_activation_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_school_students_activation_status(uuid) TO service_role;
