// Verify email token and set profiles.email_confirmed. Uses service role.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

async function sha256Hex(hexString: string): Promise<string> {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
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
    let body: { token?: string } = {};
    try {
      body = await req.json();
    } catch (_) {
      body = {};
    }
    const token = body?.token && typeof body.token === 'string' ? body.token.trim() : null;
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const tokenHash = await sha256Hex(token);

    const { data: row, error: findErr } = await adminClient
      .from('email_verifications')
      .select('id, user_id')
      .eq('token_hash', tokenHash)
      .is('consumed_at', null)
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .single();

    if (findErr || !row) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired link' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();
    await adminClient.from('email_verifications').update({ consumed_at: now }).eq('id', row.id);
    const { error: profileErr } = await adminClient.from('profiles').update({ email_confirmed: true }).eq('id', row.user_id);

    if (profileErr) {
      return new Response(
        JSON.stringify({ error: profileErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, message: 'Email confirmed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
