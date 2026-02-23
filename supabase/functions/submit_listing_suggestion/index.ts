// Submit a listing suggestion (school or teacher). Auth required; discovery users must have email confirmed.
// Duplicate check by instagram or name+city; returns { duplicate: true, matches } if likely duplicate.

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

    const body = await req.json().catch(() => ({}));
    const suggestedType = body?.suggested_type === 'teacher' ? 'teacher' : 'school';
    let name = typeof body?.name === 'string' ? body.name.trim() : '';
    const city = typeof body?.city === 'string' ? body.city.trim() || null : null;
    const country = typeof body?.country === 'string' ? body.country.trim() || null : null;
    let danceStyles: string[] | null = Array.isArray(body?.dance_styles) ? body.dance_styles.filter((x: unknown) => typeof x === 'string').map((x: string) => x.trim()).filter(Boolean) : null;
    if (danceStyles && danceStyles.length === 0) danceStyles = null;
    let instagram = typeof body?.instagram === 'string' ? body.instagram.trim().toLowerCase().replace(/^@/, '') || null : null;
    const website = typeof body?.website === 'string' ? body.website.trim() || null : null;
    const notes = typeof body?.notes === 'string' ? body.notes.trim() || null : null;

    if (!name) {
      return new Response(
        JSON.stringify({ error: 'name required' }),
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
        JSON.stringify({ error: 'Confirm your email to suggest a listing' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const nameLower = name.toLowerCase();
    const matches: { id: string; name: string; city: string | null; country: string | null; instagram?: string | null }[] = [];

    if (instagram) {
      const { data: suggByIg } = await adminClient
        .from('listing_suggestions')
        .select('id, name, city, country, instagram')
        .eq('instagram', instagram)
        .in('status', ['pending', 'approved'])
        .limit(5);
      if (suggByIg?.length) {
        suggByIg.forEach((s: { id: string; name: string; city: string | null; country: string | null; instagram: string | null }) =>
          matches.push({ id: s.id, name: s.name, city: s.city, country: s.country, instagram: s.instagram })
        );
      }
    }

    const { data: byNameCity } = await adminClient
      .from('schools')
      .select('id, name, city, country')
      .ilike('name', nameLower + '%')
      .limit(10);
    if (byNameCity?.length) {
      const filtered = !city && !country ? byNameCity : byNameCity.filter(
        (s: { city: string | null; country: string | null }) =>
          (!city || (s.city && s.city.toLowerCase() === city.toLowerCase())) &&
          (!country || (s.country && s.country.toLowerCase() === country.toLowerCase()))
      );
      filtered.forEach((s: { id: string; name: string; city: string | null; country: string | null }) => {
        if (!matches.some((m) => m.id === s.id)) matches.push({ ...s, instagram: null });
      });
    }

    const uniqueMatches = matches.filter((m, i) => matches.findIndex((x) => x.id === m.id) === i);
    if (uniqueMatches.length > 0) {
      return new Response(
        JSON.stringify({ duplicate: true, matches: uniqueMatches }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: inserted, error: insertErr } = await adminClient
      .from('listing_suggestions')
      .insert({
        suggester_profile_id: profile.id,
        suggested_type: suggestedType,
        name,
        city,
        country,
        dance_styles: danceStyles,
        instagram,
        website,
        notes,
        status: 'pending',
      })
      .select('id, status')
      .single();

    if (insertErr) {
      return new Response(
        JSON.stringify({ error: insertErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ id: inserted.id, status: inserted.status }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
