-- Canonical balance RPCs (admin_set_student_balances, canonical_apply_student_package,
-- canonical_deduct_student_balances) use students.updated_at for optimistic concurrency and row bumps.
-- The legacy students table had no updated_at; PL/pgSQL %ROWTYPE then fails at runtime.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE public.students
SET updated_at = COALESCE(created_at, now())
WHERE updated_at IS NULL;

ALTER TABLE public.students
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.students
  ALTER COLUMN updated_at SET NOT NULL;

COMMENT ON COLUMN public.students.updated_at IS 'Last mutation time; used by canonical balance RPCs for stale-write checks.';
