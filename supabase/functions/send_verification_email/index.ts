// Send verification email for discovery users. Uses Authorization header and service role.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'Bailadmin <noreply@bailadmin.lat>';
    const publicSiteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://bailadmin.lat';

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !user?.id) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, origin, email_confirmed, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (profile.origin !== 'discovery') {
      return new Response(
        JSON.stringify({ message: 'Verification only for discovery users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (profile.email_confirmed === true) {
      return new Response(
        JSON.stringify({ message: 'Email already confirmed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawToken = crypto.getRandomValues(new Uint8Array(32));
    const tokenHex = Array.from(rawToken).map((b) => b.toString(16).padStart(2, '0')).join('');
    const tokenHash = await sha256Hex(rawToken);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await adminClient.from('email_verifications').update({ consumed_at: new Date().toISOString() }).eq('user_id', user.id).is('consumed_at', null);

    const { error: insertErr } = await adminClient.from('email_verifications').insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      consumed_at: null,
    });

    if (insertErr) {
      return new Response(
        JSON.stringify({ error: insertErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verifyUrl = `${publicSiteUrl.replace(/\/$/, '')}/?view=verify-email&token=${encodeURIComponent(tokenHex)}`;

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured. Set RESEND_API_KEY in Edge Function secrets.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [profile.email],
        subject: 'Confirm your email – Bailadmin',
        html: `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:560px;"><p>Hi,</p><p>Please confirm your email by clicking the link below:</p><p><a href="${verifyUrl}" style="color:#007AFF;">Confirm my email</a></p><p>Or copy this link: ${verifyUrl}</p><p>This link expires in 24 hours.</p><p>— Bailadmin</p></body></html>`,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend error:', errText);
      let errMessage = 'Failed to send email';
      try {
        const errJson = JSON.parse(errText);
        if (errJson?.message) errMessage = String(errJson.message).slice(0, 200);
      } catch (_) {
        if (errText) errMessage = errText.slice(0, 200);
      }
      return new Response(
        JSON.stringify({ error: errMessage }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, message: 'Verification email sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
