-- Add Stripe billing columns to schools.
-- These are written exclusively by the stripe-webhook edge function (service role).
-- The frontend reads them to enforce paywall and display billing status.
--
-- Lifecycle:
--   checkout.session.completed → stripe_customer_id, stripe_subscription_id, billing_plan_key, billing_currency, billing_stripe_price_id
--   invoice.paid               → billing_status = 'active', billing_current_period_end
--   invoice.payment_failed     → billing_status = 'payment_failed'
--   subscription.updated       → billing_status, billing_current_period_end, billing_cancel_at_period_end, billing_stripe_price_id
--   subscription.deleted       → billing_status = 'canceled'

-- ---------------------------------------------------------------------------
-- 1. Columns
-- ---------------------------------------------------------------------------

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS stripe_customer_id        text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id    text,
  ADD COLUMN IF NOT EXISTS billing_status            text
    CHECK (billing_status IN ('active','trialing','past_due','payment_failed','canceled','unpaid','incomplete','incomplete_expired')),
  ADD COLUMN IF NOT EXISTS billing_plan_key          text
    CHECK (billing_plan_key IN ('basico','intermedio','avanzado')),
  ADD COLUMN IF NOT EXISTS billing_currency          text
    CHECK (billing_currency IN ('MXN','USD','EUR','COP','CHF')),
  ADD COLUMN IF NOT EXISTS billing_stripe_price_id   text,
  ADD COLUMN IF NOT EXISTS billing_current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS billing_cancel_at_period_end boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paywall_enabled           boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.schools.stripe_customer_id         IS 'Stripe customer ID (cus_…). Set on first checkout.session.completed.';
COMMENT ON COLUMN public.schools.stripe_subscription_id     IS 'Active Stripe subscription ID (sub_…).';
COMMENT ON COLUMN public.schools.billing_status             IS 'Mirrors Stripe subscription status. NULL = no subscription yet.';
COMMENT ON COLUMN public.schools.billing_plan_key           IS 'Plan selected at checkout: basico | intermedio | avanzado.';
COMMENT ON COLUMN public.schools.billing_currency           IS 'Currency selected at checkout.';
COMMENT ON COLUMN public.schools.billing_stripe_price_id    IS 'Current Stripe price ID (price_…). Updated on subscription changes.';
COMMENT ON COLUMN public.schools.billing_current_period_end IS 'UTC timestamp when the current billing period ends.';
COMMENT ON COLUMN public.schools.billing_cancel_at_period_end IS 'True when the subscription is set to cancel at the end of the period.';
COMMENT ON COLUMN public.schools.paywall_enabled            IS 'When true the app enforces billing_status to grant access. Set manually per school.';

-- ---------------------------------------------------------------------------
-- 2. Indexes for fast webhook lookups
-- ---------------------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_stripe_customer_id
  ON public.schools (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_stripe_subscription_id
  ON public.schools (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 3. RLS — billing columns are readable by school admins & platform admins.
--    Writes happen only via service role (webhook), never via client JWT.
--    Existing RLS policies on schools already cover SELECT for school admins,
--    so no new policies are needed for reads.
--    We do NOT grant UPDATE on billing columns to authenticated role.
-- ---------------------------------------------------------------------------
