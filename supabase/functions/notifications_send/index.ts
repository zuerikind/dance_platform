// Settings Notifications: send email to students (test / all / selected) via Resend.
// Resolves school from JWT (get_current_admin_school). Logo: schools.logo_url then admin_settings.email_logo_url.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitizeUrl(url: string): string | null {
  const t = url.trim();
  if (t.startsWith('https://') || t.startsWith('http://')) return t;
  return null;
}

/** Convert markdown-like body to HTML: **bold**, [label](url), newlines. Escape rest. */
function markdownLikeToHtml(body: string): string {
  if (!body || typeof body !== 'string') return '';
  let out = '';
  let i = 0;
  const len = body.length;
  while (i < len) {
    // **text**
    if (body.slice(i, i + 2) === '**') {
      const end = body.indexOf('**', i + 2);
      if (end !== -1) {
        out += '<strong>' + escapeHtml(body.slice(i + 2, end)) + '</strong>';
        i = end + 2;
        continue;
      }
    }
    // [label](url)
    if (body[i] === '[') {
      const closeB = body.indexOf(']', i + 1);
      if (closeB !== -1 && body.slice(closeB, closeB + 2) === '](') {
        const closeP = body.indexOf(')', closeB + 2);
        if (closeP !== -1) {
          const label = body.slice(i + 1, closeB);
          const urlRaw = body.slice(closeB + 2, closeP);
          const url = sanitizeUrl(urlRaw);
          if (url) {
            out += '<a href="' + escapeHtml(url) + '">' + escapeHtml(label) + '</a>';
            i = closeP + 1;
            continue;
          }
        }
      }
    }
    // newline
    if (body[i] === '\n') {
      out += '<br>\n';
      i++;
      continue;
    }
    out += escapeHtml(body[i]);
    i++;
  }
  return out;
}

function json(res: unknown, status: number, headers = corsHeaders) {
  return new Response(JSON.stringify(res), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing Authorization header' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailFrom = Deno.env.get('EMAIL_FROM') || Deno.env.get('RESEND_FROM') || 'Bailadmin <noreply@bailadmin.lat>';

    const body = await req.json().catch(() => ({})) as {
      mode?: string;
      subject?: string;
      body?: string;
      selected_student_ids?: string[];
      school_id?: string;
    };
    const mode = body.mode === 'test' ? 'test' : body.mode === 'selected' ? 'selected' : 'all';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const bodyRaw = typeof body.body === 'string' ? body.body : '';
    const selectedIds = Array.isArray(body.selected_student_ids) ? body.selected_student_ids : [];
    const providedSchoolId = typeof body.school_id === 'string' ? body.school_id : null;

    if (!subject) {
      return json({ error: 'Subject is required' }, 400);
    }

    const token = authHeader.replace(/^\s*Bearer\s+/i, '');
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    let schoolId: string | null = null;
    let adminEmail = '';

    // Primary: if frontend provided school_id, verify admin membership via service client (bypasses RPC issues)
    if (providedSchoolId) {
      const { data: { user: jwtUser } } = await serviceClient.auth.getUser(token);
      if (jwtUser?.id || jwtUser?.email) {
        const byUid = jwtUser?.id
          ? await serviceClient.from('admins').select('school_id, email').eq('school_id', providedSchoolId).eq('user_id', jwtUser.id).maybeSingle()
          : { data: null };
        let found = byUid.data;
        if (!found && jwtUser?.email && !jwtUser.email.includes('@admins.bailadmin.local')) {
          const byEmail = await serviceClient.from('admins').select('school_id, email')
            .eq('school_id', providedSchoolId).ilike('email', jwtUser.email).maybeSingle();
          found = byEmail.data;
        }
        if (found?.school_id) {
          schoolId = found.school_id as string;
          adminEmail = (jwtUser?.email && !jwtUser.email.includes('@admins.bailadmin.local'))
            ? jwtUser.email : (found.email as string) || '';
        }
      }
    }

    // Fallback A: if Path 1 failed, try to link user_id via email match then recheck.
    // Handles the case where the admin has a valid Supabase session but user_id was never
    // written to their admin row (e.g. first login via legacy credentials + new Supabase signUp).
    if (!schoolId && providedSchoolId) {
      const { data: { user: jwtUser2 } } = await serviceClient.auth.getUser(token);
      if (jwtUser2?.id) {
        // Attempt to link user_id → admin row by email match (no-op if already linked or email mismatch)
        await userClient.rpc('link_admin_auth_force', { p_school_id: providedSchoolId });
        // Retry lookup by user_id now that linking may have happened
        const { data: recheck } = await serviceClient.from('admins')
          .select('school_id, email').eq('school_id', providedSchoolId).eq('user_id', jwtUser2.id).maybeSingle();
        if (recheck?.school_id) {
          schoolId = recheck.school_id as string;
          adminEmail = (jwtUser2.email && !jwtUser2.email.includes('@admins.bailadmin.local'))
            ? jwtUser2.email : (recheck.email as string) || '';
        }
      }
    }

    // Fallback B: derive school from JWT via RPC
    if (!schoolId) {
      const { data: adminData, error: adminError } = await userClient.rpc('get_current_admin_school');
      if (!adminError && adminData?.school_id) {
        schoolId = adminData.school_id as string;
        adminEmail = (adminData.email as string) || '';
      }
    }

    // Fallback: look up via service client using JWT uid and/or email
    if (!schoolId) {
      const { data: { user: jwtUser } } = await serviceClient.auth.getUser(token);
      if (jwtUser?.id) {
        const { data: byUid } = await serviceClient.from('admins').select('school_id, email').eq('user_id', jwtUser.id).maybeSingle();
        if (byUid?.school_id) {
          schoolId = byUid.school_id as string;
          adminEmail = (jwtUser.email && !jwtUser.email.includes('@admins.bailadmin.local')) ? jwtUser.email : (byUid.email as string) || '';
        }
        if (!schoolId && jwtUser.email && !jwtUser.email.includes('@admins.bailadmin.local')) {
          const { data: byEmail } = await serviceClient.from('admins').select('school_id, email').ilike('email', jwtUser.email).maybeSingle();
          if (byEmail?.school_id) { schoolId = byEmail.school_id as string; adminEmail = jwtUser.email; }
        }
      }
    }

    if (!schoolId) {
      return json({ error: 'Admin school not found' }, 403);
    }

    // Ensure adminEmail is real (not a placeholder)
    if (!adminEmail || adminEmail.includes('@admins.bailadmin.local')) {
      const { data: { user } } = await serviceClient.auth.getUser(token);
      adminEmail = (user?.email && !user.email.includes('@admins.bailadmin.local')) ? user.email : adminEmail;
    }

    // Logo: schools.logo_url first, then admin_settings.email_logo_url
    const { data: schoolRow } = await serviceClient.from('schools').select('logo_url').eq('id', schoolId).single();
    let logoUrl: string | null = (schoolRow?.logo_url && String(schoolRow.logo_url).trim()) || null;
    if (!logoUrl) {
      const { data: settingRow } = await serviceClient
        .from('admin_settings')
        .select('value')
        .eq('school_id', schoolId)
        .eq('key', 'email_logo_url')
        .maybeSingle();
      logoUrl = (settingRow?.value && String(settingRow.value).trim()) || null;
    }

    // Recipients
    let emails: string[] = [];
    if (mode === 'test') {
      if (adminEmail) emails = [adminEmail];
    } else {
      let query = serviceClient.from('students_with_profile').select('email').eq('school_id', schoolId);
      if (mode === 'selected' && selectedIds.length > 0) {
        query = query.in('id', selectedIds);
      }
      const { data: students, error: studentsError } = await query;
      if (studentsError) {
        return json({ error: 'Failed to load students' }, 500);
      }
      const set = new Set<string>();
      for (const row of students || []) {
        const e = row?.email && String(row.email).trim();
        if (e && e.includes('@')) set.add(e);
      }
      emails = [...set];
    }

    // Rate limit: max 2 campaigns per school per minute
    const { count } = await serviceClient
      .from('notifications_log')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .gte('created_at', new Date(Date.now() - 60_000).toISOString());
    if ((count ?? 0) >= 2) {
      return json({ error: 'Rate limit: try again in a minute' }, 429);
    }

    const bodyHtml = markdownLikeToHtml(bodyRaw);
    const sentBy = adminEmail ? escapeHtml(adminEmail) : '';
    const logoSection = logoUrl
      ? `<tr><td style="padding:40px 48px 0;"><img src="${escapeHtml(logoUrl)}" alt="" style="max-width:160px;max-height:60px;object-fit:contain;display:block;border:0;" /></td></tr>`
      : '';
    const topPad = logoUrl ? '28px' : '48px';
    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f7;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f7;">
<tr><td align="center" style="padding:48px 16px 64px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:18px;overflow:hidden;">
${logoSection}
<tr><td style="padding:${topPad} 48px 12px;"><h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:-0.3px;line-height:1.3;color:#1d1d1f;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">${escapeHtml(subject)}</h1></td></tr>
<tr><td style="padding:12px 48px 44px;font-size:16px;line-height:1.65;color:#3a3a3c;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">${bodyHtml}</td></tr>
${sentBy ? `<tr><td style="border-top:1px solid #f0f0f2;padding:20px 48px 32px;"><p style="margin:0;font-size:13px;color:#86868b;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">Sent by ${sentBy}</p></td></tr>` : ''}
</table>
<p style="margin:24px 0 0;font-size:12px;color:#86868b;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">Bailadmin &bull; noreply@bailadmin.lat</p>
</td></tr>
</table>
</body>
</html>`;

    if (emails.length === 0) {
      return json({ error: mode === 'test' ? 'No admin email address found to send test to' : 'No student emails found' }, 400);
    }

    if (!resendApiKey) {
      return json({ error: 'Email sending is not configured (RESEND_API_KEY missing)' }, 500);
    }

    let status: string = 'ok';
    let resendBatchId: string | null = null;
    let firstResendError: string | null = null;

    const BATCH_SIZE = 50;
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const to = emails.slice(i, i + BATCH_SIZE);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: emailFrom,
          to,
          reply_to: adminEmail || undefined,
          subject,
          html,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error('Resend error:', errText);
        if (!firstResendError) firstResendError = errText;
        status = emails.length > BATCH_SIZE ? 'partial' : 'error';
        try {
          const errJson = JSON.parse(errText);
          if (errJson?.id && !resendBatchId) resendBatchId = errJson.id;
        } catch (_) {}
        // For test mode, surface the error immediately
        if (mode === 'test') {
          let detail = errText;
          try { const j = JSON.parse(errText); detail = j?.message || j?.error || errText; } catch (_) {}
          return json({ error: `Email delivery failed: ${detail}` }, 502);
        }
      } else {
        try {
          const okJson = await res.json();
          if (okJson?.id && !resendBatchId) resendBatchId = okJson.id;
        } catch (_) {}
      }
    }

    await serviceClient.from('notifications_log').insert({
      school_id: schoolId,
      admin_user_id: null,
      mode,
      subject,
      body_raw: bodyRaw,
      logo_url: logoUrl,
      recipient_count: emails.length,
      status,
      resend_batch_id: resendBatchId,
    });

    if (mode === 'test') {
      return json({ ok: true, message: 'Test email sent' }, 200);
    }
    return json({ ok: true, recipient_count: emails.length }, 200);
  } catch (e) {
    console.error('notifications_send:', e);
    return json({ error: String(e) }, 500);
  }
});
