// Calendly OAuth callback: exchange code for tokens, get user + organization,
// store connection, create webhook subscription (idempotent), redirect to SPA.
// GET with query: code, state.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const CALENDLY_TOKEN_URL = 'https://auth.calendly.com/oauth/token';
const CALENDLY_USER_ME = 'https://api.calendly.com/users/me';
const CALENDLY_WEBHOOK_SUBSCRIPTIONS = 'https://api.calendly.com/webhook_subscriptions';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
      return redirectWithError('Missing code or state');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const clientId = Deno.env.get('CALENDLY_CLIENT_ID');
    const clientSecret = Deno.env.get('CALENDLY_CLIENT_SECRET');
    const redirectUri = Deno.env.get('CALENDLY_REDIRECT_URI');
    const webhookUrl = Deno.env.get('CALENDLY_WEBHOOK_URL');

    if (!clientId || !clientSecret || !redirectUri) {
      return redirectWithError('Calendly OAuth not configured');
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const { data: stateRow, error: stateError } = await adminClient
      .from('calendly_oauth_state')
      .select('school_id, expires_at')
      .eq('state', state)
      .single();

    if (stateError || !stateRow) {
      return redirectWithError('Invalid or expired state');
    }
    const schoolId = stateRow.school_id as string;
    const expiresAt = stateRow.expires_at as string;
    if (new Date(expiresAt) <= new Date()) {
      await adminClient.from('calendly_oauth_state').delete().eq('state', state);
      return redirectWithError('State expired');
    }

    await adminClient.from('calendly_oauth_state').delete().eq('state', state);

    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });
    const tokenRes = await fetch(CALENDLY_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody.toString(),
    });
    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Calendly token error:', tokenRes.status, errText);
      return redirectWithError('Token exchange failed');
    }
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in ?? 7200;
    if (!accessToken || !refreshToken) {
      return redirectWithError('Invalid token response');
    }
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const userRes = await fetch(CALENDLY_USER_ME, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) {
      console.error('Calendly user/me error:', userRes.status, await userRes.text());
      return redirectWithError('Failed to get Calendly user');
    }
    const userData = await userRes.json();
    const resource = userData.resource ?? userData;
    const calendlyUserUri = resource.uri ?? userData.uri;
    const organizationUri =
      resource.current_organization ?? resource.organization ?? (userData as { organization?: string }).organization;
    if (!calendlyUserUri) {
      return redirectWithError('Invalid Calendly user response');
    }
    if (!organizationUri) {
      return redirectWithError('Missing organization URI from Calendly');
    }

    const now = new Date().toISOString();
    const { error: upsertError } = await adminClient.from('calendly_connections').upsert(
      {
        school_id: schoolId,
        calendly_user_uri: calendlyUserUri,
        organization_uri: organizationUri,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: tokenExpiresAt,
        updated_at: now,
      },
      { onConflict: 'school_id' }
    );
    if (upsertError) {
      console.error('calendly_connections upsert:', upsertError);
      return redirectWithError('Failed to save connection');
    }

    const { data: conn, error: connErr } = await adminClient
      .from('calendly_connections')
      .select('id, webhook_subscription_uri')
      .eq('school_id', schoolId)
      .single();
    if (connErr || !conn) {
      return redirectWithError('Failed to load connection');
    }

    let webhookSubscriptionUri = (conn.webhook_subscription_uri as string) || null;
    if (!webhookSubscriptionUri && webhookUrl) {
      const createRes = await fetch(CALENDLY_WEBHOOK_SUBSCRIPTIONS, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          events: ['invitee.created', 'invitee.canceled'],
          organization: organizationUri,
          scope: 'user',
          user: calendlyUserUri,
        }),
      });
      if (createRes.ok) {
        const createData = await createRes.json();
        const subUri = createData.resource?.uri ?? createData.uri;
        if (subUri) {
          webhookSubscriptionUri = subUri;
          await adminClient
            .from('calendly_connections')
            .update({ webhook_subscription_uri: subUri, updated_at: now })
            .eq('school_id', schoolId);
        }
      } else {
        const errText = await createRes.text();
        console.error('Calendly webhook create error:', createRes.status, errText);
        const listRes = await fetch(
          `${CALENDLY_WEBHOOK_SUBSCRIPTIONS}?organization=${encodeURIComponent(organizationUri)}&scope=user`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (listRes.ok) {
          const listData = await listRes.json();
          const collection = listData.collection ?? [];
          const match = collection.find(
            (s: { callback_url?: string; scope?: string }) =>
              s.callback_url === webhookUrl && (s.scope === 'user' || !s.scope)
          );
          const existingUri = match?.uri ?? match?.resource?.uri;
          if (existingUri) {
            webhookSubscriptionUri = existingUri;
            await adminClient
              .from('calendly_connections')
              .update({ webhook_subscription_uri: existingUri, updated_at: now })
              .eq('school_id', schoolId);
          }
        }
      }
    }

    const appOrigin = Deno.env.get('APP_ORIGIN') || supabaseUrl.replace(/\.supabase\.co.*/, '');
    const redirectUrl = `${appOrigin}/#/settings?calendly=connected`;
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: redirectUrl,
      },
    });
  } catch (e) {
    console.error('calendly-oauth-callback error:', e);
    return redirectWithError(e instanceof Error ? e.message : 'Server error');
  }
});

function redirectWithError(message: string): Response {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const appOrigin = Deno.env.get('APP_ORIGIN') || supabaseUrl.replace(/\.supabase\.co.*/, '');
  const redirectUrl = `${appOrigin}/#/settings?calendly=error&message=${encodeURIComponent(message)}`;
  return new Response(null, {
    status: 302,
    headers: {
      'Access-Control-Allow-Origin': '*',
      Location: redirectUrl,
    },
  });
}
