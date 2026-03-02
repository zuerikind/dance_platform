-- =============================================================================
-- Aure school: student level (principiante/avanzada) and pending registration status.
-- Scope: Aure only. Non-Aure schools unaffected.
-- =============================================================================

-- 1) students: add level column (principiante | avanzada)
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS level text DEFAULT NULL
  CHECK (level IS NULL OR level IN ('principiante', 'avanzada'));

COMMENT ON COLUMN public.students.level IS 'Aure: principiante (no Thursday) or avanzada (all classes). NULL = default.';

-- 2) class_registrations: add pending status
ALTER TABLE public.class_registrations
  DROP CONSTRAINT IF EXISTS class_registrations_status_check;

ALTER TABLE public.class_registrations
  ADD CONSTRAINT class_registrations_status_check
  CHECK (status IN ('registered','cancelled','attended','no_show','pending'));

COMMENT ON COLUMN public.class_registrations.status IS 'registered=confirmed; pending=awaiting approval (Aure clase suelta); cancelled; attended; no_show.';

-- 3) Helper: is_aure_school
CREATE OR REPLACE FUNCTION public.is_aure_school(p_school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p_school_id = '38e570f9-5ca0-435e-8e99-70ebb5ae3b64'::uuid;
$$;
