-- Allow platform to enable/disable "events as packages" and "private classes as packages" per school.
-- When disabled, the school admin does not see the corresponding toggle in Settings.

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS events_packages_enabled boolean NOT NULL DEFAULT true;

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS private_packages_enabled boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.schools.events_packages_enabled IS 'When true, school can offer events in packages (toggle visible in admin Settings).';
COMMENT ON COLUMN public.schools.private_packages_enabled IS 'When true, school can offer private classes in packages (toggle visible in admin Settings).';

-- RPCs for platform admin to toggle (same pattern as jack_and_jill)
CREATE OR REPLACE FUNCTION public.school_update_events_packages_enabled(p_school_id uuid, p_enabled boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.schools%ROWTYPE;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Permission denied: only platform admin can update school features.';
  END IF;
  UPDATE public.schools SET events_packages_enabled = p_enabled WHERE id = p_school_id
  RETURNING * INTO v_row;
  IF v_row IS NULL THEN
    RAISE EXCEPTION 'School not found.';
  END IF;
  RETURN to_jsonb(v_row);
END;
$$;

CREATE OR REPLACE FUNCTION public.school_update_private_packages_enabled(p_school_id uuid, p_enabled boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.schools%ROWTYPE;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Permission denied: only platform admin can update school features.';
  END IF;
  UPDATE public.schools SET private_packages_enabled = p_enabled WHERE id = p_school_id
  RETURNING * INTO v_row;
  IF v_row IS NULL THEN
    RAISE EXCEPTION 'School not found.';
  END IF;
  RETURN to_jsonb(v_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.school_update_events_packages_enabled(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_update_events_packages_enabled(uuid, boolean) TO anon;
GRANT EXECUTE ON FUNCTION public.school_update_private_packages_enabled(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_update_private_packages_enabled(uuid, boolean) TO anon;
