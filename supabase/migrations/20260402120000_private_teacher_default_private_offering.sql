-- Private teachers: default UX is private-class packages only; admin toggle enables group+private ("dual") mode.
-- Existing teachers without an explicit row were treated as dual before this change; set 'true' so behavior stays the same.

INSERT INTO public.admin_settings (school_id, key, value)
SELECT s.id, 'private_classes_offering_enabled', 'true'
FROM public.schools s
WHERE s.profile_type = 'private_teacher'
  AND NOT EXISTS (
    SELECT 1
    FROM public.admin_settings a
    WHERE a.school_id = s.id
      AND a.key = 'private_classes_offering_enabled'
  );
