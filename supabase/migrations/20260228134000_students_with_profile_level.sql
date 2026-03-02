-- Add level column to students_with_profile view so Aure student level is available to frontend.
-- Backward compatible: adds one column (level). For non-Aure schools, level is always NULL.
-- No change to existing columns or view options. Other schools unaffected.
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
  s.level
FROM public.students s
LEFT JOIN public.student_profiles p ON p.user_id = s.user_id;

-- Preserve security_invoker = false (required for get_school_students / get_platform_all_data).
-- CREATE OR REPLACE can reset view options; explicitly re-apply to avoid breaking other schools.
ALTER VIEW public.students_with_profile SET (security_invoker = false);
