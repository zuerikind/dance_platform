// Notify teacher (school admin) by email when a student requests a private class.
// Call after create_private_class_request succeeds. Uses Resend.

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

    const body = await req.json().catch(() => ({}));
    const requestId = body?.request_id ?? body?.requestId;
    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'Missing request_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const { data: reqRow, error: reqError } = await adminClient
      .from('private_class_requests')
      .select('id, school_id, student_id, requested_date, requested_time, status')
      .eq('id', requestId)
      .single();

    if (reqError || !reqRow) {
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const schoolId = reqRow.school_id;
    const { data: schoolRow } = await adminClient.from('schools').select('name').eq('id', schoolId).single();
    const schoolName = schoolRow?.name || 'Your school';

    let studentName = 'A student';
    const { data: studentRow } = await adminClient
      .from('students')
      .select('name')
      .eq('id', reqRow.student_id)
      .eq('school_id', schoolId)
      .single();
    if (studentRow?.name && String(studentRow.name).trim()) {
      studentName = String(studentRow.name).trim();
    }

    const { data: admins } = await adminClient
      .from('admins')
      .select('email')
      .eq('school_id', schoolId)
      .not('email', 'is', null)
      .limit(1);
    const toEmail = admins?.[0]?.email;
    if (!toEmail || String(toEmail).includes('@temp.bailadmin.local') || String(toEmail).includes('@admins.bailadmin.local')) {
      return new Response(
        JSON.stringify({ ok: false, message: 'No teacher email configured for this school' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Email service not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dateStr = reqRow.requested_date || '';
    const timeStr = reqRow.requested_time || '';
    const subject = `New private class request – ${dateStr} ${timeStr}`;
    const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:560px;">
<p>Hi,</p>
<p><strong>${escapeHtml(studentName)}</strong> requested a private class on <strong>${escapeHtml(dateStr)}</strong> at <strong>${escapeHtml(timeStr)}</strong>.</p>
<p>Log in to your dashboard to accept or decline the request.</p>
<p>— ${escapeHtml(schoolName)}</p>
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
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to send email' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, message: 'Notification sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
