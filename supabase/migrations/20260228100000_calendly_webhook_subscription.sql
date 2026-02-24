-- Add organization_uri and webhook_subscription_uri to calendly_connections for per-teacher webhook subscriptions.
-- Teachers = schools with profile_type = 'private_teacher' (school_id is the teacher scope).
-- Requires: 20260227100000_calendly_private_bookings.sql (creates calendly_connections).

ALTER TABLE public.calendly_connections
  ADD COLUMN IF NOT EXISTS organization_uri text;

ALTER TABLE public.calendly_connections
  ADD COLUMN IF NOT EXISTS webhook_subscription_uri text;

COMMENT ON COLUMN public.calendly_connections.organization_uri IS 'Calendly organization URI from /users/me, required for webhook subscription.';
COMMENT ON COLUMN public.calendly_connections.webhook_subscription_uri IS 'Calendly webhook subscription URI; used to delete subscription on disconnect.';
