// Disconnect Calendly: delete webhook subscription in Calendly, then delete local connection.
// POST with Authorization (teacher only). Body optional: { school_id } if multiple schools.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ensureValidToken, type ConnectionRow } from '../_shared/calendly.ts';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !user?.id) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let schoolId: string | null = null;
    try {
      const body = await req.json().catch(() => ({}));
      schoolId = (body && typeof body === 'object' && body.school_id) ? body.school_id : null;
    } catch {
      // no body
    }
    if (!schoolId) {
      const { data: admins } = await adminClient.from('admins').select('school_id').eq('user_id', user.id);
      const adminSchoolIds = (admins ?? []).map((a: { school_id: string }) => a.school_id).filter(Boolean);
      const { data: schools } = await adminClient
        .from('schools')
        .select('id')
        .in('id', adminSchoolIds)
        .eq('profile_type', 'private_teacher');
      const ids = (schools ?? []).map((s: { id: string }) => s.id);
      if (ids.length === 0) {
        return new Response(JSON.stringify({ error: 'Not a private teacher admin' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (ids.length > 1) {
        return new Response(JSON.stringify({ error: 'school_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      schoolId = ids[0];
    } else {
      const { data: school } = await adminClient
        .from('schools')
        .select('id')
        .eq('id', schoolId)
        .eq('profile_type', 'private_teacher')
        .single();
      if (!school) {
        return new Response(JSON.stringify({ error: 'School not found or not private teacher' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { data: adminRow } = await adminClient.from('admins').select('id').eq('school_id', schoolId).eq('user_id', user.id).single();
      const { data: platformAdminRow } = await adminClient.from('platform_admins').select('id').eq('user_id', user.id).maybeSingle();
      if (!adminRow && !platformAdminRow) {
        return new Response(JSON.stringify({ error: 'Not admin for this school' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const { data: conn, error: connError } = await adminClient
      .from('calendly_connections')
      .select('id, school_id, calendly_user_uri, organization_uri, access_token, refresh_token, token_expires_at, webhook_subscription_uri')
      .eq('school_id', schoolId)
      .single();
    if (connError || !conn) {
      return new Response(JSON.stringify({ error: 'Calendly not connected for this school' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const connectionRow = conn as ConnectionRow;
    let accessToken = connectionRow.access_token;
    try {
      accessToken = await ensureValidToken(connectionRow, adminClient, Deno.env.toObject());
    } catch (e) {
      console.error('Token refresh during disconnect:', e);
    }

    const webhookUri = (conn as { webhook_subscription_uri?: string }).webhook_subscription_uri;
    if (webhookUri) {
      const delRes = await fetch(webhookUri, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!delRes.ok) {
        console.error('Calendly webhook delete error:', delRes.status, await delRes.text());
      }
    }

    await adminClient.from('calendly_connections').delete().eq('school_id', schoolId);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('calendly-disconnect error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
