/**
 * stripe-create-checkout
 *
 * Creates a Stripe Checkout session (subscription mode) for a given academy,
 * plan, and currency.
 *
 * POST body:
 *   academyId  – string (maps to school_id in the DB)
 *   planKey    – "basico" | "intermedio" | "avanzado"
 *   currency   – "MXN" | "USD" | "EUR" | "COP" | "CHF"
 *
 * Returns:
 *   { url: string }  – Stripe hosted Checkout URL, redirect the user there.
 *
 * Required environment variables (set in Supabase / Vercel dashboard):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   STRIPE_SECRET_KEY          – sk_live_… or sk_test_…
 *   STRIPE_PRICE_BASICO_MXN    – price_…  (one per plan/currency combination)
 *   STRIPE_PRICE_BASICO_USD
 *   STRIPE_PRICE_BASICO_EUR
 *   STRIPE_PRICE_BASICO_COP
 *   STRIPE_PRICE_BASICO_CHF
 *   STRIPE_PRICE_INTERMEDIO_MXN
 *   … (15 total)
 *   APP_BASE_URL               – e.g. https://app.bailadmin.lat  (no trailing slash)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import {
  isValidPlan,
  isValidCurrency,
  getStripePriceId,
  type PlanKey,
  type Currency,
} from '../_shared/stripe-price-map.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    // -----------------------------------------------------------------------
    // 1. Authenticate the caller via JWT
    // -----------------------------------------------------------------------
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing Authorization header' }, 401);
    }
    const token = authHeader.replace(/^\s*Bearer\s+/i, '').trim();
    if (!token) {
      return json({ error: 'Invalid Authorization header' }, 401);
    }

    // -----------------------------------------------------------------------
    // 2. Parse and validate request body
    // -----------------------------------------------------------------------
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    const { academyId, planKey, currency, returnView } = body as {
      academyId?: unknown;
      planKey?: unknown;
      currency?: unknown;
      returnView?: unknown;
    };

    if (!academyId || typeof academyId !== 'string' || !academyId.trim()) {
      return json({ error: 'academyId is required and must be a non-empty string' }, 400);
    }
    if (!isValidPlan(planKey)) {
      return json({ error: 'planKey must be one of: basico, intermedio, avanzado' }, 400);
    }
    if (!isValidCurrency(currency)) {
      return json({ error: 'currency must be one of: MXN, USD, EUR, COP, CHF' }, 400);
    }

    const safeAcademyId = academyId.trim();
    // Optional: view to restore when user cancels or completes checkout (e.g. admin-settings, admin-students)
    const safeReturnView =
      typeof returnView === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(returnView.trim())
        ? encodeURIComponent(returnView.trim())
        : '';

    // -----------------------------------------------------------------------
    // 3. Load required environment variables
    // -----------------------------------------------------------------------
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const appBaseUrl = (Deno.env.get('APP_BASE_URL') ?? 'https://app.bailadmin.lat').replace(/\/$/, '');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('stripe-create-checkout: missing Supabase env vars');
      return json({ error: 'Server configuration error' }, 500);
    }
    if (!stripeSecretKey) {
      console.error('stripe-create-checkout: STRIPE_SECRET_KEY not set');
      return json({ error: 'Stripe not configured' }, 500);
    }

    // -----------------------------------------------------------------------
    // 4. Verify JWT and admin membership for the requested academy
    // -----------------------------------------------------------------------
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: { user: jwtUser }, error: userErr } = await serviceClient.auth.getUser(token);
    if (userErr || !jwtUser?.id) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // Check by user_id first (most reliable)
    const { data: adminByUid } = await serviceClient
      .from('admins')
      .select('school_id, email')
      .eq('school_id', safeAcademyId)
      .eq('user_id', jwtUser.id)
      .maybeSingle();

    let confirmedAdmin = adminByUid;

    // Fall back to email match (legacy admins without user_id set)
    if (!confirmedAdmin && jwtUser.email && !jwtUser.email.includes('@admins.bailadmin.local')) {
      const { data: adminByEmail } = await serviceClient
        .from('admins')
        .select('school_id, email')
        .eq('school_id', safeAcademyId)
        .ilike('email', jwtUser.email)
        .maybeSingle();
      confirmedAdmin = adminByEmail;
    }

    if (!confirmedAdmin) {
      return json({ error: 'Forbidden: you are not an admin of this academy' }, 403);
    }

    // -----------------------------------------------------------------------
    // 5. Resolve the Stripe price ID from environment variables
    //    (frontend-provided price IDs are NEVER trusted)
    // -----------------------------------------------------------------------
    const priceId = getStripePriceId(planKey as PlanKey, currency as Currency);
    if (!priceId) {
      return json(
        { error: `No Stripe price configured for plan "${planKey}" / currency "${currency}". Contact support.` },
        400,
      );
    }

    // -----------------------------------------------------------------------
    // 6. Create the Stripe Checkout session
    // -----------------------------------------------------------------------
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-04-10' });

    const success_url = `${appBaseUrl}/?billing=success&session_id={CHECKOUT_SESSION_ID}&academy=${encodeURIComponent(safeAcademyId)}${safeReturnView ? `&return_view=${safeReturnView}` : ''}`;
    const cancel_url = `${appBaseUrl}/?billing=cancel&academy=${encodeURIComponent(safeAcademyId)}${safeReturnView ? `&return_view=${safeReturnView}` : ''}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: safeAcademyId,
      metadata: {
        academyId: safeAcademyId,
        planKey: planKey as string,
        currency: currency as string,
      },
      success_url,
      cancel_url,
    });

    if (!session.url) {
      console.error('stripe-create-checkout: Stripe returned a session without a URL', session.id);
      return json({ error: 'Failed to generate checkout URL' }, 500);
    }

    // -----------------------------------------------------------------------
    // 7. Return the hosted checkout URL to the frontend
    // -----------------------------------------------------------------------
    return json({ url: session.url });

  } catch (err) {
    console.error('stripe-create-checkout unhandled error:', err);
    return json({ error: 'Internal server error' }, 500);
  }
});
