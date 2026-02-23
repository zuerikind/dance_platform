// Platform admin only: approve or reject a listing suggestion. Approve creates a school and marks suggestion approved.

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
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !user?.id) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: platformAdmin } = await adminClient
      .from('platform_admins')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!platformAdmin) {
      return new Response(
        JSON.stringify({ error: 'Platform admin only' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const suggestionId = body?.suggestion_id;
    const action = body?.action === 'reject' ? 'reject' : (body?.action === 'approve' ? 'approve' : null);

    if (!suggestionId || !action) {
      return new Response(
        JSON.stringify({ error: 'suggestion_id and action (approve|reject) required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: suggestion, error: suggErr } = await adminClient
      .from('listing_suggestions')
      .select('*')
      .eq('id', suggestionId)
      .single();

    if (suggErr || !suggestion) {
      return new Response(
        JSON.stringify({ error: 'Suggestion not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (suggestion.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Suggestion already reviewed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reviewedAt = new Date().toISOString();

    if (action === 'reject') {
      const { error: updateErr } = await adminClient
        .from('listing_suggestions')
        .update({
          status: 'rejected',
          reviewed_by_profile_id: user.id,
          reviewed_at: reviewedAt,
        })
        .eq('id', suggestionId);

      if (updateErr) {
        return new Response(
          JSON.stringify({ error: updateErr.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ ok: true, status: 'rejected' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const profileType = suggestion.suggested_type === 'teacher' ? 'private_teacher' : 'school';
    const discoveryGenres = suggestion.dance_styles && suggestion.dance_styles.length
      ? suggestion.dance_styles
      : [];

    const { data: newSchool, error: insertErr } = await adminClient
      .from('schools')
      .insert({
        name: suggestion.name,
        country: suggestion.country || null,
        city: suggestion.city || null,
        discovery_genres: discoveryGenres,
        profile_type: profileType,
        discovery_visible: false,
        active: true,
      })
      .select('id, name')
      .single();

    if (insertErr) {
      return new Response(
        JSON.stringify({ error: insertErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error: updateErr } = await adminClient
      .from('listing_suggestions')
      .update({
        status: 'approved',
        reviewed_by_profile_id: user.id,
        reviewed_at: reviewedAt,
      })
      .eq('id', suggestionId);

    if (updateErr) {
      return new Response(
        JSON.stringify({ error: updateErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, status: 'approved', school_id: newSchool.id, school_name: newSchool.name }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
