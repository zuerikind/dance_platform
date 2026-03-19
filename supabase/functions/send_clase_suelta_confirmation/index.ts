// Send confirmation email when admin approves clase suelta (Aure).
// Auth: is_school_admin / is_platform_admin with user JWT.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildAureEmailLayout, escapeHtml } from '../_shared/aure_email_layout.ts';

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
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const body = await req.json().catch(() => ({}));
    const registrationId = body?.registration_id;
    if (!registrationId) {
      return new Response(
        JSON.stringify({ error: 'Missing registration_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

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

    const { data: isAdmin, error: adminRpcErr } = await userClient.rpc('is_school_admin', { p_school_id: reg.school_id });
    const { data: platformAdmin, error: platRpcErr } = await userClient.rpc('is_platform_admin', {});
    const rpcErrMsg = String(adminRpcErr?.message || platRpcErr?.message || '');
    const looksLikeBadJwt = /jwt|expired|invalid|session|unauthorized|401/i.test(rpcErrMsg);

    if (!isAdmin && !platformAdmin) {
      if (looksLikeBadJwt || (adminRpcErr && platRpcErr)) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired session' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Permission denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    const { data: schoolRow } = await adminClient
      .from('schools')
      .select('name, logo_url')
      .eq('id', reg.school_id)
      .single();
    const schoolName = schoolRow?.name || 'Tu escuela';
    let logoUrl: string | null = (schoolRow?.logo_url && String(schoolRow.logo_url).trim()) || null;
    if (!logoUrl) {
      const { data: settingRow } = await adminClient
        .from('admin_settings')
        .select('value')
        .eq('school_id', reg.school_id)
        .eq('key', 'email_logo_url')
        .maybeSingle();
      logoUrl = (settingRow?.value && String(settingRow.value).trim()) || null;
    }

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured. Set RESEND_API_KEY.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const className = cls?.name || 'Clase';
    const classTime = cls?.time || '';
    const dateStr = reg.class_date;
    const rawFirst = student.name ? String(student.name).trim().split(/\s+/)[0] || '' : '';
    const firstName = rawFirst ? escapeHtml(rawFirst) : '';
    const greetingLine = firstName ? `Hola ${firstName},` : 'Hola,';
    const dateLabel = dateStr
      ? new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : dateStr;
    const timeDetail = classTime ? escapeHtml(classTime) : '';

    const html = buildAureEmailLayout({
      logoUrl,
      schoolName,
      preheader: `Tu clase suelta en ${schoolName} ha sido aprobada`,
      headline: '¡Tu clase ha sido aprobada!',
      greetingLine,
      bodyHtml: [
        `Tu solicitud de <strong>clase suelta</strong> en <strong>${escapeHtml(schoolName)}</strong> ha sido <strong>confirmada</strong>.`,
      ],
      details: [
        { label: 'Clase', valueHtml: escapeHtml(className) },
        { label: 'Fecha', valueHtml: escapeHtml(dateLabel) },
        ...(classTime ? [{ label: 'Hora', valueHtml: timeDetail }] : []),
      ],
      closingLine: '¡Nos vemos en la clase!',
      signOff: schoolName,
    });

    const subject = `Tu clase suelta ha sido aprobada — ${className}`;

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
