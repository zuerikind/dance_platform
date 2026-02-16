-- Schools active flag: inactive schools are hidden from selection and everywhere for non-platform users.
-- Platform admins can activate/deactivate schools (e.g. for non-payment).

-- -----------------------------------------------------------------------------
-- 1) Add column
-- -----------------------------------------------------------------------------
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.schools.active IS 'When false, school is hidden from school list and not usable by admins/students. Platform admin can toggle.';

CREATE INDEX IF NOT EXISTS idx_schools_active ON public.schools(active);

-- -----------------------------------------------------------------------------
-- 2) RLS: non-platform users see only active schools
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "schools_select_all" ON public.schools;
CREATE POLICY "schools_select_all" ON public.schools
  FOR SELECT USING (active = true OR public.is_platform_admin());

-- -----------------------------------------------------------------------------
-- 3) RPC: set school active/inactive (platform admin only)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.school_set_active(p_school_id uuid, p_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RETURN;
  END IF;
  UPDATE public.schools SET active = p_active WHERE id = p_school_id;
END;
$$;

COMMENT ON FUNCTION public.school_set_active(uuid, boolean) IS 'Activate or deactivate a school. Only platform admin. Inactive schools are hidden from selection.';
GRANT EXECUTE ON FUNCTION public.school_set_active(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_set_active(uuid, boolean) TO anon;
