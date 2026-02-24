// List Calendly event types for the connected teacher. Auth required.
// GET with Authorization. Query: school_id (optional if single private teacher).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ensureValidToken, type ConnectionRow } from '../_shared/calendly.ts';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const CALENDLY_EVENT_TYPES = 'https://api.calendly.com/event_types';

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
    let schoolId: string | null = url.searchParams.get('school_id');
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
      if (!adminRow) {
        return new Response(JSON.stringify({ error: 'Not admin for this school' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const { data: conn, error: connError } = await adminClient
      .from('calendly_connections')
      .select('id, school_id, calendly_user_uri, access_token, refresh_token, token_expires_at')
      .eq('school_id', schoolId)
      .single();
    if (connError || !conn) {
      return new Response(JSON.stringify({ error: 'Calendly not connected for this school' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userUri = (conn as { calendly_user_uri?: string }).calendly_user_uri;
    if (!userUri) {
      return new Response(JSON.stringify({ error: 'Missing Calendly user URI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = await ensureValidToken(conn as ConnectionRow, adminClient, Deno.env.toObject());
    const eventTypesUrl = `${CALENDLY_EVENT_TYPES}?user=${encodeURIComponent(userUri)}`;
    const eventRes = await fetch(eventTypesUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!eventRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch event types', detail: await eventRes.text() }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const eventData = await eventRes.json();
    const collection = eventData.collection ?? [];
    const list = collection.map((et: { uri?: string; name?: string; scheduling_url?: string }) => ({
      uri: et.uri ?? '',
      name: et.name ?? '',
      scheduling_url: et.scheduling_url ?? (et.uri ? `https://calendly.com${et.uri.replace('https://api.calendly.com', '')}` : ''),
    }));
    return new Response(JSON.stringify({ event_types: list }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('calendly-list-event-types error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
