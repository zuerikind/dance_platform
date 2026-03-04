-- Add balance_events to students_with_profile so get_school_students and update_student_details
-- return it; admin-set event count then persists after refetch (same as balance, balance_private).
-- Must add the new column at the end to avoid "cannot change name of view column" (positional match).
CREATE OR REPLACE VIEW public.students_with_profile AS
SELECT
  s.id,
  COALESCE(p.name, s.name) AS name,
  COALESCE(p.email, s.email) AS email,
  COALESCE(p.phone, s.phone) AS phone,
  s.password,
  s.paid,
  s.package,
  s.balance,
  s.balance_private,
  s.active_packs,
  s.package_expires_at,
  s.school_id,
  s.user_id,
  s.created_at,
  s.level,
  s.balance_events
FROM public.students s
LEFT JOIN public.student_profiles p ON p.user_id = s.user_id;

ALTER VIEW public.students_with_profile SET (security_invoker = false);
