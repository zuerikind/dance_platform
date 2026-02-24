// Calendly webhook: invitee.created (create booking, idempotent deduct) and invitee.canceled (cancel, idempotent refund).
// POST only. Optional: verify Calendly-Callback-Signature or shared secret header.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, calendly-webhook-secret, x-bailadmin-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

type WebhookPayload = {
  event?: string;
  payload?: {
    uri?: string;
    event?: string;
    email?: string;
    name?: string;
    start_time?: string;
    end_time?: string;
    event_type?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
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
    const secret =
      Deno.env.get('CALENDLY_WEBHOOK_SHARED_SECRET') ||
      Deno.env.get('CALENDLY_WEBHOOK_SECRET');
    if (secret) {
      const provided =
        req.headers.get('x-bailadmin-secret') ||
        req.headers.get('calendly-webhook-secret') ||
        req.headers.get('x-calendly-webhook-secret');
      if (provided !== secret) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const body = (await req.json().catch(() => null)) as WebhookPayload | null;
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const event = body.event;
    const payload = body.payload && typeof body.payload === 'object' ? body.payload : {};

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    if (event === 'invitee.created') {
      const inviteeUri = payload.uri || payload.invitee_uri || (payload as { invitee?: { uri?: string } }).invitee?.uri;
      const eventUri = payload.event || payload.event_uri;
      const startTime = payload.start_time || (payload as { scheduled_event?: { start_time?: string } }).scheduled_event?.start_time;
      const endTime = payload.end_time || (payload as { scheduled_event?: { end_time?: string } }).scheduled_event?.end_time;
      const eventTypeUri = payload.event_type || (payload as { event_type_uri?: string }).event_type_uri || (payload as { scheduled_event?: { event_type?: string } }).scheduled_event?.event_type;
      const email = payload.email || (payload as { invitee?: { email?: string } }).invitee?.email;
      const name = payload.name || (payload as { invitee?: { name?: string } }).invitee?.name;

      if (!inviteeUri || !startTime || !endTime) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (!eventTypeUri) {
        return new Response(JSON.stringify({ error: 'Missing event_type for school lookup' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: selection, error: selErr } = await adminClient
        .from('calendly_event_type_selection')
        .select('school_id')
        .eq('calendly_event_type_uri', eventTypeUri)
        .maybeSingle();
      if (selErr || !selection?.school_id) {
        return new Response(JSON.stringify({ error: 'Event type not linked to a teacher' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const schoolId = selection.school_id as string;

      let studentId: string | null = null;
      if (email && typeof email === 'string') {
        const { data: student } = await adminClient
          .from('students')
          .select('id')
          .eq('school_id', schoolId)
          .ilike('email', email.trim())
          .limit(1)
          .maybeSingle();
        if (student?.id) studentId = student.id as string;
      }

      const { data: booking, error: upsertErr } = await adminClient
        .from('private_bookings')
        .upsert(
          {
            school_id: schoolId,
            student_id: studentId,
            student_email: (email && typeof email === 'string') ? email.trim() : null,
            student_name: (name && typeof name === 'string') ? name.trim() : null,
            start_time: startTime,
            end_time: endTime,
            status: 'scheduled',
            source: 'calendly',
            calendly_event_uri: eventUri || null,
            calendly_invitee_uri: inviteeUri,
          },
          { onConflict: 'calendly_invitee_uri' }
        )
        .select('id')
        .single();
      if (upsertErr) {
        if (upsertErr.code === '23505') {
          return new Response(JSON.stringify({ ok: true, message: 'Duplicate ignored' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw upsertErr;
      }
      const bookingId = booking?.id;
      if (!bookingId || !studentId) {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { data: txRow, error: txErr } = await adminClient
        .from('pass_transactions')
        .insert({
          student_id: studentId,
          school_id: schoolId,
          booking_id: bookingId,
          type: 'deduct',
          amount: 1,
        })
        .select('id')
        .single();
      if (txErr) {
        if (txErr.code === '23505') {
          return new Response(JSON.stringify({ ok: true, message: 'Deduct already applied' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw txErr;
      }
      const { error: rpcErr } = await adminClient.rpc('deduct_student_classes', {
        p_student_id: studentId,
        p_school_id: schoolId,
        p_count: 1,
        p_class_type: 'private',
      });
      if (rpcErr) console.error('deduct_student_classes:', rpcErr);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (event === 'invitee.canceled') {
      const inviteeUri = payload.uri || payload.invitee_uri || (payload as { invitee?: { uri?: string } }).invitee?.uri;
      if (!inviteeUri) {
        return new Response(JSON.stringify({ error: 'Missing invitee URI' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { data: existing, error: findErr } = await adminClient
        .from('private_bookings')
        .select('id, school_id, student_id')
        .eq('calendly_invitee_uri', inviteeUri)
        .single();
      if (findErr || !existing) {
        return new Response(JSON.stringify({ ok: true, message: 'Booking not found' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      await adminClient
        .from('private_bookings')
        .update({ status: 'canceled' })
        .eq('id', existing.id);
      const schoolId = existing.school_id as string;
      const studentId = existing.student_id as string | null;
      if (studentId) {
        const { error: refErr } = await adminClient
          .from('pass_transactions')
          .insert({
            student_id: studentId,
            school_id: schoolId,
            booking_id: existing.id,
            type: 'refund',
            amount: 1,
          });
        if (!refErr) {
          const { error: rpcErr } = await adminClient.rpc('refund_student_private', {
            p_school_id: schoolId,
            p_student_id: studentId,
            p_count: 1,
          });
          if (rpcErr) console.error('refund_student_private:', rpcErr);
        }
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, ignored: event }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('calendly-webhook error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
