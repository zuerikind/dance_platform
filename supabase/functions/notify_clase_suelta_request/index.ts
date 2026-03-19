// Email school admin(s) when an Auré student requests clase suelta (pending registration).
// Caller must be the student (JWT user_id matches registration's student).

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
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing Authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'Bailadmin <noreply@bailadmin.lat>';

    const body = await req.json().catch(() => ({}));
    const registrationId = body?.registration_id;
    if (!registrationId || typeof registrationId !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing registration_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
    const { data: userData, error: userErr } = await adminClient.auth.getUser(token);
    const userId = userData?.user?.id;
    if (userErr || !userId) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: reg, error: regErr } = await adminClient
      .from('class_registrations')
      .select('id, student_id, school_id, class_id, class_date, status')
      .eq('id', registrationId)
      .single();

    if (regErr || !reg) {
      return new Response(JSON.stringify({ error: 'Registration not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (reg.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Not a pending request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAure } = await adminClient.rpc('is_aure_school', { p_school_id: reg.school_id });
    if (!isAure) {
      return new Response(JSON.stringify({ ok: false, message: 'Not applicable for this school' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: student } = await adminClient
      .from('students')
      .select('user_id, name, email')
      .eq('id', reg.student_id)
      .eq('school_id', reg.school_id)
      .single();

    if (!student || student.user_id !== userId) {
      return new Response(JSON.stringify({ error: 'Permission denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: admins } = await adminClient
      .from('admins')
      .select('email')
      .eq('school_id', reg.school_id)
      .not('email', 'is', null);

    const toEmails = (admins || [])
      .map((a) => String(a.email || '').trim())
      .filter(
        (e) =>
          e.includes('@') &&
          !e.includes('@temp.bailadmin.local') &&
          !e.includes('@admins.bailadmin.local')
      );
    const uniqueTo = [...new Set(toEmails)];
    if (!uniqueTo.length) {
      return new Response(
        JSON.stringify({ ok: false, message: 'No admin email configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!resendApiKey) {
      return new Response(JSON.stringify({ ok: false, error: 'Email service not configured' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: cls } = await adminClient
      .from('classes')
      .select('name, time')
      .eq('id', reg.class_id)
      .single();

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

    const studentName = (student.name && String(student.name).trim()) || 'Alumno/a';
    const className = cls?.name || 'Clase';
    const classTime = cls?.time || '';
    const dateStr = reg.class_date || '';
    const dateLabel = dateStr
      ? new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : dateStr;
    const html = buildAureEmailLayout({
      logoUrl,
      schoolName,
      preheader: `Nueva solicitud de clase suelta de ${studentName}`,
      headline: 'Nueva solicitud de clase suelta',
      greetingLine: 'Hola,',
      bodyHtml: [
        `<strong>${escapeHtml(studentName)}</strong> ha solicitado una <strong>clase suelta</strong> en <strong>${escapeHtml(schoolName)}</strong>.`,
        'Entra en el panel de administración para aprobar o rechazar la solicitud.',
      ],
      details: [
        { label: 'Clase', valueHtml: escapeHtml(className) },
        { label: 'Fecha', valueHtml: escapeHtml(dateLabel) },
        ...(classTime ? [{ label: 'Hora', valueHtml: escapeHtml(classTime) }] : []),
        ...(student.email ? [{ label: 'Contacto alumno', valueHtml: escapeHtml(String(student.email)) }] : []),
      ],
      closingLine: 'Gracias por gestionar las solicitudes a tiempo.',
      signOff: schoolName,
    });

    const subject = `Nueva solicitud de clase suelta — ${studentName} — ${dateStr}`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: emailFrom,
        to: uniqueTo,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend error:', errText);
      return new Response(JSON.stringify({ ok: false, error: 'Failed to send email' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, message: 'Admin notified' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
