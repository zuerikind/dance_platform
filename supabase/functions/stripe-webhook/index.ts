/**
 * stripe-webhook
 *
 * Receives Stripe webhook events, verifies the signature, and syncs
 * subscription state into the schools table.
 *
 * Handled events:
 *   checkout.session.completed  → save customer/subscription/plan IDs
 *   invoice.paid                → billing_status = active, update period end
 *   invoice.payment_failed      → billing_status = payment_failed
 *   customer.subscription.updated → sync status, period end, cancel flag, price
 *   customer.subscription.deleted → billing_status = canceled
 *
 * Required environment variables:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   STRIPE_SECRET_KEY          – sk_live_… / sk_test_…
 *   STRIPE_WEBHOOK_SECRET      – whsec_… from Stripe Dashboard → Webhooks
 *
 * Idempotency: all writes are UPDATEs that set the same values on replay,
 * so repeated delivery of the same event is harmless.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BillingStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'payment_failed'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired';

interface BillingUpdate {
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  billing_status?: BillingStatus;
  billing_plan_key?: string;
  billing_currency?: string;
  billing_stripe_price_id?: string;
  billing_current_period_end?: string;   // ISO-8601 UTC
  billing_cancel_at_period_end?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Convert a Unix timestamp (seconds) to ISO-8601 UTC string, or null. */
function tsToIso(ts: number | null | undefined): string | undefined {
  if (!ts) return undefined;
  return new Date(ts * 1000).toISOString();
}

/** Map a Stripe subscription status to our DB enum. */
function mapSubStatus(stripeStatus: Stripe.Subscription.Status): BillingStatus {
  // Stripe statuses: active | past_due | unpaid | canceled | incomplete | incomplete_expired | trialing | paused
  const known: Record<string, BillingStatus> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    unpaid: 'unpaid',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
  };
  return known[stripeStatus] ?? 'incomplete';
}

// ---------------------------------------------------------------------------
// DB update helper — looks up school by customer or subscription ID
// ---------------------------------------------------------------------------

async function updateSchoolBilling(
  serviceClient: ReturnType<typeof createClient>,
  lookup: { stripeCustomerId?: string; stripeSubscriptionId?: string },
  update: BillingUpdate,
  eventType: string,
): Promise<void> {
  const { stripeCustomerId, stripeSubscriptionId } = lookup;

  // Build query: prefer subscription ID lookup (more specific), fall back to customer ID
  let query = serviceClient.from('schools').update(update);

  if (stripeSubscriptionId) {
    query = query.eq('stripe_subscription_id', stripeSubscriptionId);
  } else if (stripeCustomerId) {
    query = query.eq('stripe_customer_id', stripeCustomerId);
  } else {
    console.warn(`[stripe-webhook] ${eventType}: no lookup key available, skipping update`);
    return;
  }

  const { error, count } = await query.select('id', { count: 'exact', head: true });

  if (error) {
    console.error(`[stripe-webhook] ${eventType}: DB update failed —`, error.message);
    throw error;
  }
  if ((count ?? 0) === 0) {
    console.warn(`[stripe-webhook] ${eventType}: no school matched lookup`, lookup);
  } else {
    console.log(`[stripe-webhook] ${eventType}: updated ${count} school(s)`, lookup);
  }
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleCheckoutSessionCompleted(
  serviceClient: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
  stripe: Stripe,
): Promise<void> {
  const academyId = session.metadata?.academyId || session.client_reference_id;
  if (!academyId) {
    console.warn('[stripe-webhook] checkout.session.completed: no academyId in metadata or client_reference_id');
    return;
  }

  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;

  const update: BillingUpdate = {};
  if (customerId) update.stripe_customer_id = customerId;
  if (subscriptionId) update.stripe_subscription_id = subscriptionId;

  // Grab plan metadata saved at checkout creation
  if (session.metadata?.planKey) update.billing_plan_key = session.metadata.planKey;
  if (session.metadata?.currency) update.billing_currency = session.metadata.currency;

  // Pull price ID from the subscription's first item if available
  if (subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price'],
      });
      const priceId = sub.items?.data?.[0]?.price?.id;
      if (priceId) update.billing_stripe_price_id = priceId;
      update.billing_status = mapSubStatus(sub.status);
      update.billing_current_period_end = tsToIso(sub.current_period_end);
      update.billing_cancel_at_period_end = sub.cancel_at_period_end;
    } catch (err) {
      console.warn('[stripe-webhook] checkout.session.completed: could not retrieve subscription', err);
    }
  }

  // Update by academyId directly (most reliable for checkout events)
  const { error, count } = await serviceClient
    .from('schools')
    .update(update)
    .eq('id', academyId)
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error('[stripe-webhook] checkout.session.completed: DB update failed —', error.message);
    throw error;
  }
  console.log(`[stripe-webhook] checkout.session.completed: updated academy ${academyId}, matched ${count} row(s)`);
}

async function handleInvoicePaid(
  serviceClient: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice,
): Promise<void> {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id;
  if (!customerId && !subscriptionId) return;

  const update: BillingUpdate = { billing_status: 'active' };

  // period_end lives on the subscription lines
  const periodEnd = (invoice.lines?.data?.[0] as { period?: { end?: number } } | undefined)?.period?.end;
  if (periodEnd) update.billing_current_period_end = tsToIso(periodEnd);

  await updateSchoolBilling(
    serviceClient,
    { stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId },
    update,
    'invoice.paid',
  );
}

async function handleInvoicePaymentFailed(
  serviceClient: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice,
): Promise<void> {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id;
  if (!customerId && !subscriptionId) return;

  await updateSchoolBilling(
    serviceClient,
    { stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId },
    { billing_status: 'payment_failed' },
    'invoice.payment_failed',
  );
}

async function handleSubscriptionUpdated(
  serviceClient: ReturnType<typeof createClient>,
  sub: Stripe.Subscription,
): Promise<void> {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;

  const update: BillingUpdate = {
    billing_status: mapSubStatus(sub.status),
    billing_current_period_end: tsToIso(sub.current_period_end),
    billing_cancel_at_period_end: sub.cancel_at_period_end,
  };

  const priceId = sub.items?.data?.[0]?.price?.id;
  if (priceId) update.billing_stripe_price_id = priceId;

  await updateSchoolBilling(
    serviceClient,
    { stripeCustomerId: customerId, stripeSubscriptionId: sub.id },
    update,
    'customer.subscription.updated',
  );
}

async function handleSubscriptionDeleted(
  serviceClient: ReturnType<typeof createClient>,
  sub: Stripe.Subscription,
): Promise<void> {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;

  await updateSchoolBilling(
    serviceClient,
    { stripeCustomerId: customerId, stripeSubscriptionId: sub.id },
    { billing_status: 'canceled', billing_cancel_at_period_end: false },
    'customer.subscription.deleted',
  );
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // -------------------------------------------------------------------------
  // 1. Read raw body BEFORE any parsing — required for signature verification
  // -------------------------------------------------------------------------
  const rawBody = await req.text();

  // -------------------------------------------------------------------------
  // 2. Load env vars
  // -------------------------------------------------------------------------
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[stripe-webhook] missing Supabase env vars');
    return json({ error: 'Server configuration error' }, 500);
  }
  if (!stripeSecretKey || !webhookSecret) {
    console.error('[stripe-webhook] missing Stripe env vars');
    return json({ error: 'Stripe not configured' }, 500);
  }

  // -------------------------------------------------------------------------
  // 3. Verify Stripe webhook signature
  //    Uses constructEventAsync (Web Crypto API — required for Deno)
  // -------------------------------------------------------------------------
  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-04-10' });
  const sig = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[stripe-webhook] signature verification failed:', msg);
    return json({ error: `Webhook signature verification failed: ${msg}` }, 400);
  }

  console.log(`[stripe-webhook] received event: ${event.type} (${event.id})`);

  // -------------------------------------------------------------------------
  // 4. Service client — bypasses RLS for webhook writes
  // -------------------------------------------------------------------------
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // -------------------------------------------------------------------------
  // 5. Dispatch by event type
  // -------------------------------------------------------------------------
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          serviceClient,
          event.data.object as Stripe.Checkout.Session,
          stripe,
        );
        break;

      case 'invoice.paid':
        await handleInvoicePaid(
          serviceClient,
          event.data.object as Stripe.Invoice,
        );
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(
          serviceClient,
          event.data.object as Stripe.Invoice,
        );
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          serviceClient,
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          serviceClient,
          event.data.object as Stripe.Subscription,
        );
        break;

      default:
        // Acknowledge without processing — avoids Stripe retrying unknown events
        console.log(`[stripe-webhook] unhandled event type: ${event.type}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[stripe-webhook] error processing ${event.type}:`, msg);
    // Return 500 so Stripe retries the event
    return json({ error: 'Processing error' }, 500);
  }

  return json({ received: true });
});
