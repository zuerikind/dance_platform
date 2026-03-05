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
    };
    const mode = body.mode === 'test' ? 'test' : body.mode === 'selected' ? 'selected' : 'all';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const bodyRaw = typeof body.body === 'string' ? body.body : '';
    const selectedIds = Array.isArray(body.selected_student_ids) ? body.selected_student_ids : [];

    if (!subject) {
      return json({ error: 'Subject is required' }, 400);
    }

    const token = authHeader.replace(/^\s*Bearer\s+/i, '');
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const { data: adminData, error: adminError } = await userClient.rpc('get_current_admin_school');
    if (adminError || !adminData?.school_id) {
      return json({ error: 'Admin school not found' }, 403);
    }
    const schoolId = adminData.school_id as string;
    let adminEmail = (adminData.email as string) || '';
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
    const logoImg = logoUrl
      ? `<img src="${escapeHtml(logoUrl)}" alt="" style="max-width:200px;max-height:80px;display:block;margin-bottom:16px;" />`
      : '';
    const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:560px;">${logoImg}<h2 style="margin-top:0;">${escapeHtml(subject)}</h2><div>${bodyHtml}</div>${sentBy ? `<p style="margin-top:24px;font-size:12px;color:#666;">Sent by: ${sentBy}</p>` : ''}</body></html>`;

    let status: string = 'ok';
    let resendBatchId: string | null = null;

    if (emails.length === 0) {
      status = 'error';
    } else if (resendApiKey) {
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
          status = emails.length > BATCH_SIZE ? 'partial' : 'error';
          if (!resendBatchId) {
            try {
              const errJson = JSON.parse(errText);
              if (errJson?.id) resendBatchId = errJson.id;
            } catch (_) {}
          }
        }
      }
    } else {
      status = 'error';
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

    if (mode === 'test' && emails.length > 0) {
      return json({ ok: true, message: 'Test email sent' }, 200);
    }
    return json({ ok: true, recipient_count: emails.length }, 200);
  } catch (e) {
    console.error('notifications_send:', e);
    return json({ error: String(e) }, 500);
  }
});
