// Send confirmation email when admin approves a clase suelta (Aure). Called by frontend after admin_approve_clase_suelta.

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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'Bailadmin <noreply@bailadmin.lat>';

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !user?.id) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const registrationId = body?.registration_id;
    if (!registrationId) {
      return new Response(
        JSON.stringify({ error: 'Missing registration_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: reg, error: regError } = await adminClient
      .from('class_registrations')
      .select('id, student_id, school_id, class_id, class_date')
      .eq('id', registrationId)
      .single();

    if (regError || !reg) {
      return new Response(
        JSON.stringify({ error: 'Registration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: cls } = await adminClient
      .from('classes')
      .select('name, time')
      .eq('id', reg.class_id)
      .single();

    const { data: student } = await adminClient
      .from('students')
      .select('id, user_id, email, name')
      .eq('id', reg.student_id)
      .eq('school_id', reg.school_id)
      .single();

    if (!student) {
      return new Response(
        JSON.stringify({ error: 'Student not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let toEmail = student.email;
    if (!toEmail && student.user_id) {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('email')
        .eq('id', student.user_id)
        .single();
      toEmail = profile?.email;
    }

    if (!toEmail) {
      return new Response(
        JSON.stringify({ error: 'Student has no email. Cannot send confirmation.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: isAdmin } = await userClient.rpc('is_school_admin', { p_school_id: reg.school_id });
    const { data: platformAdmin } = await userClient.rpc('is_platform_admin', {});
    if (!isAdmin && !platformAdmin) {
      return new Response(
        JSON.stringify({ error: 'Permission denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured. Set RESEND_API_KEY.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const className = cls?.name || 'la clase';
    const classTime = cls?.time || '';
    const dateStr = reg.class_date;

    const subject = `Tu clase suelta ha sido aprobada – ${className}`;
    const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:560px;">
<p>Hola${student.name ? ` ${String(student.name).split(' ')[0]}` : ''},</p>
<p>Tu solicitud de clase suelta ha sido aprobada.</p>
<p><strong>Clase:</strong> ${className}</p>
<p><strong>Fecha:</strong> ${dateStr}${classTime ? ` a las ${classTime}` : ''}</p>
<p>¡Nos vemos en la clase!</p>
<p>— Bailadmin</p>
</body></html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [toEmail],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend error:', errText);
      let errMessage = 'Failed to send email';
      try {
        const errJson = JSON.parse(errText);
        if (errJson?.message) errMessage = String(errJson.message).slice(0, 200);
      } catch {
        if (errText) errMessage = errText.slice(0, 200);
      }
      return new Response(
        JSON.stringify({ error: errMessage }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, message: 'Confirmation email sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
