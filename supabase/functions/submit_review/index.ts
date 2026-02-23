// Submit a review for a discovery school or teacher. Auth required; discovery users must have email confirmed.
// Rate limit: 3 reviews per profile per 24h. Low ratings (<=2) set status = 'flagged'.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const RATE_LIMIT_PER_24H = 3;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
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
    const targetType = body?.target_type;
    const targetId = body?.target_id;
    const ratingOverall = body?.rating_overall;
    const ratings = body?.ratings ?? null;
    let comment = typeof body?.comment === 'string' ? body.comment.trim() : null;
    if (comment && comment.length > 500) comment = comment.slice(0, 500);

    if (!targetType || !targetId || ratingOverall == null) {
      return new Response(
        JSON.stringify({ error: 'target_type, target_id and rating_overall required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!['school', 'teacher'].includes(targetType)) {
      return new Response(
        JSON.stringify({ error: 'target_type must be school or teacher' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const rating = Number(ratingOverall);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ error: 'rating_overall must be 1–5' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, origin, email_confirmed')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (profile.origin === 'discovery' && !profile.email_confirmed) {
      return new Response(
        JSON.stringify({ error: 'Confirm your email to leave reviews' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countErr } = await adminClient
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('author_profile_id', profile.id)
      .gte('created_at', since);

    if (!countErr && count != null && count >= RATE_LIMIT_PER_24H) {
      return new Response(
        JSON.stringify({ error: 'Rate limit: max 3 reviews per 24 hours' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetUuid = typeof targetId === 'string' ? targetId : String(targetId);
    const { data: school } = await adminClient
      .from('schools')
      .select('id')
      .eq('id', targetUuid)
      .or('discovery_visible.eq.true,discovery_visible.is.null')
      .limit(1)
      .single();

    if (!school) {
      return new Response(
        JSON.stringify({ error: 'Target school or teacher not found or not reviewable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let trustLevel: 'verified' | 'community' = 'community';
    if (targetType === 'school') {
      const { data: linkSchool } = await adminClient
        .from('profile_school_links')
        .select('school_id')
        .eq('profile_id', profile.id)
        .eq('school_id', targetUuid)
        .limit(1)
        .single();
      const { data: linkStudent } = await adminClient
        .from('profile_student_links')
        .select('school_id')
        .eq('profile_id', profile.id)
        .eq('school_id', targetUuid)
        .limit(1)
        .single();
      if (linkSchool || linkStudent) trustLevel = 'verified';
    }

    const status = rating <= 2 ? 'flagged' : 'published';

    const { data: inserted, error: insertErr } = await adminClient
      .from('reviews')
      .insert({
        target_type: targetType,
        target_id: targetUuid,
        author_profile_id: profile.id,
        rating_overall: rating,
        ratings: ratings && typeof ratings === 'object' ? ratings : null,
        comment: comment || null,
        trust_level: trustLevel,
        status,
      })
      .select('id, trust_level, status')
      .single();

    if (insertErr) {
      if (insertErr.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'You have already reviewed this' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: insertErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (status === 'flagged') {
      try {
        const { data: schoolRow } = await adminClient
          .from('schools')
          .select('name')
          .eq('id', targetUuid)
          .single();
        const schoolName = schoolRow?.name || targetUuid;
        const { data: adminRows } = await adminClient
          .from('platform_admins')
          .select('email, user_id');
        type AdminRow = { email?: string | null; user_id?: string | null };
        let to: string[] = (adminRows || []).map((r: AdminRow) => (r?.email && String(r.email).trim()) || '').filter((e): e is string => e !== '');
        if (to.length === 0 && adminRows?.length) {
          const userIds = (adminRows as AdminRow[]).map((r) => r?.user_id).filter((id): id is string => typeof id === 'string' && id.length > 0);
          if (userIds.length > 0) {
            const { data: profileRows } = await adminClient.from('profiles').select('email').in('id', userIds);
            to = (profileRows || []).map((r: { email?: string | null }) => r?.email).filter((e): e is string => typeof e === 'string' && e.trim() !== '');
          }
        }
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        const emailFrom = Deno.env.get('EMAIL_FROM') || 'Bailadmin <noreply@bailadmin.lat>';
        const publicSiteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://bailadmin.lat';
        if (to.length === 0) {
          console.warn('Flagged review: no platform admin emails (platform_admins.email or profiles.email for linked user_id). Add email in platform_admins or link platform_admins.user_id to a profile with email.');
        }
        if (resendApiKey && to.length === 0) {
          console.warn('Flagged review: RESEND_API_KEY is set but no admin emails – configure platform_admins.email or ensure platform_admins.user_id links to profiles with email.');
        }
        if (!resendApiKey) {
          console.warn('Flagged review: RESEND_API_KEY not set in Edge Function secrets – notification not sent. Set in Supabase Dashboard → Edge Functions → submit_review → Secrets.');
        }
        if (to.length > 0 && resendApiKey) {
          const commentSnippet = comment ? comment.slice(0, 200) + (comment.length > 200 ? '…' : '') : '(no comment)';
          const reviewUrl = `${publicSiteUrl.replace(/\/$/, '')}/`;
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: emailFrom,
              to,
              subject: '[Bailadmin] Flagged review – ' + schoolName,
              html: `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:560px;"><p>A review was submitted with a low rating and has been <strong>flagged</strong> for moderation.</p><p><strong>School:</strong> ${escapeHtml(schoolName)}</p><p><strong>Rating:</strong> ${rating}/5</p><p><strong>Comment:</strong> ${escapeHtml(commentSnippet)}</p><p>Open the <a href="${reviewUrl}">Bailadmin platform</a> and go to Dev dashboard → Reviews to review or delete it.</p><p>— Bailadmin</p></body></html>`,
            }),
          });
          const resBody = await res.text();
          if (!res.ok) {
            console.error('Resend flagged-review email error:', res.status, resBody);
          } else {
            console.log('Flagged review notification sent to', to.length, 'admin(s)');
          }
        }
      } catch (e) {
        console.error('Failed to send flagged-review notification:', e);
      }
    }

    return new Response(
      JSON.stringify({ id: inserted.id, trust_level: inserted.trust_level, status: inserted.status }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
