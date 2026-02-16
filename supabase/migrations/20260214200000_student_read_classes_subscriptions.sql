-- Allow enrolled students to read classes and subscriptions for their school.
-- Fixes: student logging into a school (including first-time auto-enrollment) could not see schedule or shop.
-- Same pattern as get_school_admin_settings: admin, platform admin, or student enrolled at p_school_id.

CREATE OR REPLACE FUNCTION public.get_school_classes(p_school_id uuid)
RETURNS SETOF public.classes
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.* FROM public.classes c
  WHERE c.school_id = p_school_id
    AND (
      public.is_school_admin(p_school_id)
      OR public.is_platform_admin()
      OR EXISTS (SELECT 1 FROM public.students s WHERE s.school_id = p_school_id AND s.user_id = auth.uid())
    )
  ORDER BY c.id;
$$;

CREATE OR REPLACE FUNCTION public.get_school_subscriptions(p_school_id uuid)
RETURNS SETOF public.subscriptions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sub.* FROM public.subscriptions sub
  WHERE sub.school_id = p_school_id
    AND (
      public.is_school_admin(p_school_id)
      OR public.is_platform_admin()
      OR EXISTS (SELECT 1 FROM public.students s WHERE s.school_id = p_school_id AND s.user_id = auth.uid())
    )
  ORDER BY sub.name;
$$;
