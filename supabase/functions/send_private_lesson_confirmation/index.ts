// Send a well-designed confirmation email to the student when a private teacher accepts their class request.
// Called by the frontend after teacher_respond_to_request(..., true) succeeds.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildClassConfirmedEmail(params: {
  studentFirstName: string;
  schoolName: string;
  logoUrl: string | null;
  dateLabel: string;
  timeLabel: string;
  classLabel: string;
  signOff?: string;
}): string {
  const { studentFirstName, schoolName, logoUrl, dateLabel, timeLabel, classLabel, signOff = 'Bailadmin' } = params;
  const logoSection = logoUrl
    ? `<tr><td style="padding:40px 48px 0;"><img src="${escapeHtml(logoUrl)}" alt="" style="max-width:160px;max-height:60px;object-fit:contain;display:block;border:0;" /></td></tr>`
    : '';
  const topPad = logoUrl ? '28px' : '48px';
  const greeting = studentFirstName ? escapeHtml(studentFirstName) : 'there';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Class confirmed</title></head>
<body style="margin:0;padding:0;background-color:#f5f5f7;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f7;">
<tr><td align="center" style="padding:48px 16px 64px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
${logoSection}
<tr><td style="padding:${topPad} 48px 12px;"><h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:-0.3px;line-height:1.3;color:#1d1d1f;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">Your class is confirmed!</h1></td></tr>
<tr><td style="padding:12px 48px 24px;font-size:16px;line-height:1.65;color:#3a3a3c;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">Hi ${greeting},</td></tr>
<tr><td style="padding:0 48px 24px;"><p style="margin:0;font-size:16px;line-height:1.65;color:#3a3a3c;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">Great news — your private lesson with <strong>${escapeHtml(schoolName)}</strong> has been confirmed.</p></td></tr>
<tr><td style="padding:0 48px 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f7;border-radius:14px;border:1px solid #e8e8ed;"><tr><td style="padding:20px 24px;">
<p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#86868b;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">Details</p>
<p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#1d1d1f;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">${escapeHtml(classLabel)}</p>
<p style="margin:0 0 4px;font-size:15px;color:#3a3a3c;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">${escapeHtml(dateLabel)}</p>
<p style="margin:0;font-size:15px;color:#3a3a3c;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">${escapeHtml(timeLabel)}</p>
</td></tr></table></td></tr>
<tr><td style="padding:0 48px 44px;"><p style="margin:0;font-size:16px;line-height:1.65;color:#3a3a3c;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">See you in class!</p></td></tr>
<tr><td style="border-top:1px solid #f0f0f2;padding:20px 48px 32px;"><p style="margin:0;font-size:13px;color:#86868b;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">— ${escapeHtml(signOff)}</p></td></tr>
</table>
<p style="margin:24px 0 0;font-size:12px;color:#86868b;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">Bailadmin &bull; noreply@bailadmin.lat</p>
</td></tr>
</table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(undefined, { status: 200, headers: corsHeaders });
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

    const body = await req.json().catch(() => ({}));
    const requestId = body?.request_id ?? body?.requestId;
    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'Missing request_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
    const token = authHeader.replace('Bearer ', '');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: reqRow, error: reqError } = await adminClient
      .from('private_class_requests')
      .select('id, school_id, student_id, requested_date, requested_time, start_at_utc, end_at_utc, status')
      .eq('id', requestId)
      .single();

    if (reqError || !reqRow) {
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (reqRow.status !== 'accepted') {
      return new Response(
        JSON.stringify({ error: 'Request is not accepted' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: isAdmin } = await userClient.rpc('is_school_admin', { p_school_id: reqRow.school_id });
    const { data: platformAdmin } = await userClient.rpc('is_platform_admin', {});
    if (!isAdmin && !platformAdmin) {
      return new Response(
        JSON.stringify({ error: 'Permission denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: schoolRow } = await adminClient
      .from('schools')
      .select('name, logo_url')
      .eq('id', reqRow.school_id)
      .single();
    const schoolName = schoolRow?.name || 'Your teacher';

    let logoUrl: string | null = (schoolRow?.logo_url && String(schoolRow.logo_url).trim()) || null;
    if (!logoUrl) {
      const { data: settingRow } = await adminClient
        .from('admin_settings')
        .select('value')
        .eq('school_id', reqRow.school_id)
        .eq('key', 'email_logo_url')
        .maybeSingle();
      logoUrl = (settingRow?.value && String(settingRow.value).trim()) || null;
    }

    const { data: studentRow } = await adminClient
      .from('students')
      .select('id, name, email, user_id')
      .eq('id', reqRow.student_id)
      .eq('school_id', reqRow.school_id)
      .single();

    if (!studentRow) {
      return new Response(
        JSON.stringify({ error: 'Student not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let toEmail: string | null = (studentRow.email && String(studentRow.email).trim()) || null;
    if (!toEmail && studentRow.user_id) {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('email')
        .eq('id', studentRow.user_id)
        .single();
      toEmail = (profile?.email && String(profile.email).trim()) || null;
    }

    if (!toEmail || !toEmail.includes('@')) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Student has no email. Cannot send confirmation.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const studentFirstName = studentRow.name
      ? String(studentRow.name).trim().split(/\s+/)[0] || ''
      : '';

    const startUtc = reqRow.start_at_utc ? new Date(reqRow.start_at_utc) : null;
    const endUtc = reqRow.end_at_utc ? new Date(reqRow.end_at_utc) : null;
    const dateLabel = startUtc
      ? startUtc.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : (reqRow.requested_date || '');
    const timeLabel = startUtc && endUtc
      ? `${startUtc.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} – ${endUtc.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
      : (reqRow.requested_time ? `at ${reqRow.requested_time}` : '');

    const html = buildClassConfirmedEmail({
      studentFirstName,
      schoolName,
      logoUrl,
      dateLabel,
      timeLabel,
      classLabel: 'Private lesson',
      signOff: schoolName,
    });

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Email service not configured. Set RESEND_API_KEY.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subject = `Your private lesson is confirmed – ${schoolName}`;
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
