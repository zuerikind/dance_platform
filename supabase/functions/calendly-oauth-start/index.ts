// Start Calendly OAuth: create state, return auth URL. Teacher (private_teacher school admin) only.
// GET with Authorization header. Query: school_id (optional if user has one private teacher school).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const CALENDLY_AUTHORIZE = 'https://auth.calendly.com/oauth/authorize';
const STATE_TTL_MINUTES = 10;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
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
    const clientId = Deno.env.get('CALENDLY_CLIENT_ID');
    const redirectUri = Deno.env.get('CALENDLY_REDIRECT_URI');

    if (!clientId || !redirectUri) {
      return new Response(JSON.stringify({ error: 'Calendly OAuth not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !user?.id) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const schoolIdParam = url.searchParams.get('school_id');

    let schoolId: string | null = schoolIdParam;
    if (!schoolId) {
      const { data: admins } = await adminClient.from('admins').select('school_id').eq('user_id', user.id);
      const adminSchoolIds = (admins ?? []).map((a: { school_id: string }) => a.school_id).filter(Boolean);
      const { data: schools } = await adminClient
        .from('schools')
        .select('id')
        .in('id', adminSchoolIds)
        .eq('profile_type', 'private_teacher');
      const teacherSchoolIds = (schools ?? []).map((s: { id: string }) => s.id);
      if (teacherSchoolIds.length === 0) {
        return new Response(JSON.stringify({ error: 'Not a private teacher admin' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (teacherSchoolIds.length > 1) {
        return new Response(JSON.stringify({ error: 'school_id required when multiple schools' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      schoolId = teacherSchoolIds[0];
    } else {
      const { data: school } = await adminClient
        .from('schools')
        .select('id')
        .eq('id', schoolId)
        .eq('profile_type', 'private_teacher')
        .single();
      if (!school) {
        return new Response(JSON.stringify({ error: 'School not found or not a private teacher' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { data: adminRow } = await adminClient.from('admins').select('id').eq('school_id', schoolId).eq('user_id', user.id).single();
      if (!adminRow) {
        return new Response(JSON.stringify({ error: 'Not admin for this school' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const state = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + STATE_TTL_MINUTES * 60 * 1000).toISOString();
    const { error: insertError } = await adminClient.from('calendly_oauth_state').insert({
      state,
      school_id: schoolId,
      expires_at: expiresAt,
    });
    if (insertError) {
      console.error('calendly_oauth_state insert:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create state' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authUrl = `${CALENDLY_AUTHORIZE}?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    })}`;

    return new Response(JSON.stringify({ auth_url: authUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('calendly-oauth-start error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
