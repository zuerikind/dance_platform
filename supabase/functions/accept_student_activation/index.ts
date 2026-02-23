// Phase 2: Accept activation token – link profile to school student.
// Can be called unauthenticated (returns requires_login) or authenticated (performs link).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return '***@***';
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (local.length <= 2) return local[0] + '***' + domain;
  return local[0] + '***' + local[local.length - 1] + domain;
}

async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const body = await req.json().catch(() => ({})) as { token?: string };
    const rawToken = body.token?.trim();
    if (!rawToken) {
      return new Response(
        JSON.stringify({ error: 'token required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenHash = await sha256Hex(rawToken);
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const { data: invites, error: inviteError } = await serviceClient
      .from('student_activation_invites')
      .select('id, school_id, school_student_id, expires_at, consumed_at')
      .eq('token_hash', tokenHash)
      .limit(1);

    if (inviteError || !invites?.length) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired link' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const invite = invites[0];
    if (invite.consumed_at) {
      return new Response(
        JSON.stringify({ error: 'This link has already been used' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (new Date(invite.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'This link has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: school } = await serviceClient.from('schools').select('id, name').eq('id', invite.school_id).single();
    const { data: student } = await serviceClient
      .from('students')
      .select('id, email')
      .eq('id', invite.school_student_id)
      .eq('school_id', invite.school_id)
      .single();

    const schoolName = school?.name ?? 'Your school';
    const studentEmail = student?.email ?? '';
    const maskedEmail = studentEmail ? maskEmail(studentEmail) : '';

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          requires_login: true,
          school_name: schoolName,
          masked_email: maskedEmail,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await serviceClient.auth.getUser(token);
    if (userError || !user?.id) {
      return new Response(
        JSON.stringify({
          requires_login: true,
          school_name: schoolName,
          masked_email: maskedEmail,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const profileId = user.id;

    const { error: linkError } = await serviceClient.from('profile_student_links').insert({
      profile_id: profileId,
      school_student_id: invite.school_student_id,
      school_id: invite.school_id,
    });

    if (linkError) {
      if (linkError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'This student is already linked to an account' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: linkError.message || 'Failed to link' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await serviceClient
      .from('student_activation_invites')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', invite.id);

    await serviceClient.from('account_link_audit').insert([
      { action: 'INVITE_ACCEPTED', school_id: invite.school_id, school_student_id: invite.school_student_id, profile_id: profileId, actor_profile_id: profileId, metadata: { invite_id: invite.id } },
      { action: 'LINK_CREATED', school_id: invite.school_id, school_student_id: invite.school_student_id, profile_id: profileId, actor_profile_id: profileId },
    ]);

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Account linked',
        school: { id: invite.school_id, name: schoolName },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
