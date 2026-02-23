// Phase 2: School admin invites a student to activate/link their Bailadmin account.
// Uses admin JWT for RPC (is_school_admin), service role for audit, Resend for email.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'Bailadmin <noreply@bailadmin.lat>';
    const publicSiteUrl = (Deno.env.get('PUBLIC_SITE_URL') || 'https://bailadmin.lat').replace(/\/$/, '');

    const body = await req.json().catch(() => ({})) as { school_id?: string; school_student_id?: string };
    const schoolId = body.school_id;
    const schoolStudentId = body.school_student_id;

    if (!schoolId || !schoolStudentId) {
      return new Response(
        JSON.stringify({ error: 'school_id and school_student_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const { data: rpcData, error: rpcError } = await userClient.rpc('create_student_activation_invite', {
      p_school_id: schoolId,
      p_school_student_id: schoolStudentId,
    });

    if (rpcError) {
      const code = rpcError.code === 'P0001' ? 403 : 400;
      return new Response(
        JSON.stringify({ error: rpcError.message || 'Failed to create invite' }),
        { status: code, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawToken = rpcData?.raw_token as string | undefined;
    const studentEmail = rpcData?.student_email as string | undefined;
    const schoolName = rpcData?.school_name as string | undefined;
    const inviteId = rpcData?.invite_id as string | undefined;

    if (!rawToken || !studentEmail) {
      return new Response(
        JSON.stringify({ error: 'Invite created but missing token or email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user } } = await serviceClient.auth.getUser(token);
    const actorProfileId = user?.id ?? null;

    await serviceClient.from('account_link_audit').insert({
      action: 'INVITE_SENT',
      school_id: schoolId,
      school_student_id: schoolStudentId,
      profile_id: null,
      actor_profile_id: actorProfileId,
      metadata: { invite_id: inviteId },
    });

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ ok: true, message: 'Invite created. Email not sent (RESEND_API_KEY not set).' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const activateUrl = `${publicSiteUrl}/?view=activate&token=${encodeURIComponent(rawToken)}`;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [studentEmail],
        subject: `Link your account – ${schoolName || 'Bailadmin'}`,
        html: `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:560px;"><p>Hi,</p><p>You've been invited to link your dancer account with <strong>${(schoolName || 'your school').replace(/</g, '&lt;')}</strong> on Bailadmin.</p><p><a href="${activateUrl}" style="color:#007AFF;">Link my account</a></p><p>Or copy this link: ${activateUrl}</p><p>This link expires in 7 days.</p><p>— Bailadmin</p></body></html>`,
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
      JSON.stringify({ ok: true, message: 'Invite sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
