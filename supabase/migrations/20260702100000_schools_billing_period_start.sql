-- Track when the current billing period started, so the admin UI can show
-- "active since" alongside the existing "active until" (billing_current_period_end).

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS billing_current_period_start timestamptz;

COMMENT ON COLUMN public.schools.billing_current_period_start IS 'UTC timestamp when the current billing period started (i.e. last successful payment).';
