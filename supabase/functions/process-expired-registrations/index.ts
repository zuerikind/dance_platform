// Process expired class registrations (no-shows) for all schools with class_registration_enabled.
// Run nightly at 23:39 Mexico time via pg_cron, or invoke manually with service role key.
// Marks past undeducted registrations as no_show and deducts one class from each student's package.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceKey) {
      return new Response(
        JSON.stringify({ error: 'Service role key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!authHeader || authHeader.replace(/^Bearer\s+/i, '').trim() !== serviceKey.trim()) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Use Authorization: Bearer <service_role_key>' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data: schools, error: schoolsError } = await adminClient
      .from('schools')
      .select('id')
      .eq('class_registration_enabled', true);

    if (schoolsError) {
      console.error('Error fetching schools:', schoolsError);
      return new Response(
        JSON.stringify({ error: schoolsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: { school_id: string; processed: number }[] = [];
    for (const school of schools || []) {
      const { data, error } = await adminClient.rpc('process_expired_registrations', {
        p_school_id: school.id,
      });
      const processed = typeof data === 'number' ? data : 0;
      results.push({ school_id: school.id, processed });
      if (error) {
        console.error(`Error processing school ${school.id}:`, error);
        results[results.length - 1] = { ...results[results.length - 1], processed: -1 };
      }
    }

    const totalProcessed = results.reduce((sum, r) => sum + (r.processed > 0 ? r.processed : 0), 0);

    return new Response(
      JSON.stringify({
        ok: true,
        schools_processed: results.length,
        total_no_shows_deducted: totalProcessed,
        details: results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('process-expired-registrations error:', err);
    return new Response(
      JSON.stringify({ error: String(err?.message || err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
