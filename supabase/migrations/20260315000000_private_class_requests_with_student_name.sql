-- Return private class requests with student name from students_with_profile
-- so the admin UI shows names even when state.students is empty or out of sync.

DROP FUNCTION IF EXISTS public.get_private_class_requests_for_school(uuid);

CREATE OR REPLACE FUNCTION public.get_private_class_requests_for_school(p_school_id uuid)
RETURNS TABLE (
  id uuid,
  school_id uuid,
  student_id text,
  requested_date date,
  requested_time text,
  location text,
  message text,
  status text,
  created_at timestamptz,
  responded_at timestamptz,
  start_at_utc timestamptz,
  end_at_utc timestamptz,
  duration_minutes int,
  student_name text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    r.id,
    r.school_id,
    r.student_id,
    r.requested_date,
    r.requested_time,
    r.location,
    r.message,
    r.status,
    r.created_at,
    r.responded_at,
    r.start_at_utc,
    r.end_at_utc,
    r.duration_minutes,
    COALESCE(v.name, r.student_id) AS student_name
  FROM public.private_class_requests r
  LEFT JOIN public.students_with_profile v ON v.id = r.student_id AND v.school_id = r.school_id
  WHERE r.school_id = p_school_id
  ORDER BY r.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_private_class_requests_for_school(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_private_class_requests_for_school(uuid) TO anon;

COMMENT ON FUNCTION public.get_private_class_requests_for_school(uuid) IS 'Private class requests for a school with student_name from students_with_profile.';
