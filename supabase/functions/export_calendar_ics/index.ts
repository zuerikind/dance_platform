// Export calendar as ICS for Apple/Android. Auth required.
// GET with query: type=teacher|student, include_group_classes=true|false, range_days=30, school_id (optional for student)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function formatUtcForIcs(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${day}T${h}${min}${s}Z`;
}

function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

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
    const type = url.searchParams.get('type') || 'student';
    const includeGroupClasses = url.searchParams.get('include_group_classes') === 'true';
    const rangeDays = Math.min(365, Math.max(1, parseInt(url.searchParams.get('range_days') || '30', 10) || 30));
    const schoolIdParam = url.searchParams.get('school_id');

    const now = new Date();
    const fromUtc = new Date(now.getTime());
    const toUtc = new Date(now.getTime() + rangeDays * 24 * 60 * 60 * 1000);

    const events: Array<{ uid: string; start: Date; end: Date; summary: string; description?: string; location?: string; status: string }> = [];

    if (type === 'teacher') {
      const { data: admins } = await adminClient.from('admins').select('school_id').eq('user_id', user.id);
      const schoolIds: string[] = admins?.map((a) => a.school_id).filter(Boolean) || [];
      if (schoolIds.length === 0) {
        const { data: byEmail } = await adminClient.from('admins').select('school_id').not('email', 'is', null);
        const userEmail = user.email?.toLowerCase();
        if (userEmail && byEmail) {
          for (const a of byEmail) {
            const adm = a as { school_id?: string; email?: string };
            if (adm.email?.toLowerCase() === userEmail) schoolIds.push(adm.school_id!);
          }
        }
      }
      const { data: schools } = await adminClient.from('schools').select('id, name').in('id', schoolIds).eq('profile_type', 'private_teacher');
      const teacherSchoolIds = (schools || []).map((s) => s.id);

      for (const sid of teacherSchoolIds) {
        const { data: lessons } = await adminClient
          .from('private_lessons')
          .select('id, student_id, start_at_utc, end_at_utc, status')
          .eq('school_id', sid)
          .in('status', ['confirmed', 'attended'])
          .gte('end_at_utc', fromUtc.toISOString())
          .lte('start_at_utc', toUtc.toISOString())
          .order('start_at_utc');
        const schoolName = schools?.find((s) => s.id === sid)?.name || 'School';
        const studentIds = [...new Set((lessons || []).map((l) => l.student_id))];
        const { data: students } = await adminClient.from('students').select('id, name').in('id', studentIds);
        const studentNames: Record<string, string> = {};
        (students || []).forEach((s) => { studentNames[s.id] = s.name || 'Student'; });
        (lessons || []).forEach((l) => {
          events.push({
            uid: `private-lesson-${l.id}@calendar`,
            start: new Date(l.start_at_utc),
            end: new Date(l.end_at_utc),
            summary: `Private lesson with ${escapeIcsText(studentNames[l.student_id] || 'Student')}`,
            status: 'CONFIRMED',
          });
        });
      }

      if (includeGroupClasses && teacherSchoolIds.length > 0) {
        const { data: classes } = await adminClient.from('classes').select('id, name, day, time, end_time, location').in('school_id', teacherSchoolIds);
        const dayMap: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
        for (const c of classes || []) {
          const startTime = (c.time || '09:00').slice(0, 5);
          const endTime = (c.end_time || c.time || '10:00').slice(0, 5);
          const dayNum = dayMap[c.day] ?? 1;
          for (let d = 0; d < rangeDays; d++) {
            const date = new Date(now);
            date.setDate(date.getDate() + d);
            if (date.getDay() === dayNum) {
              const start = new Date(`${date.toISOString().slice(0, 10)}T${startTime}:00.000Z`);
              const end = new Date(`${date.toISOString().slice(0, 10)}T${endTime}:00.000Z`);
              if (end <= fromUtc || start >= toUtc) continue;
              events.push({
                uid: `group-class-${c.id}-${date.toISOString().slice(0, 10)}@calendar`,
                start,
                end,
                summary: escapeIcsText(c.name || 'Group class'),
                location: c.location ? escapeIcsText(c.location) : undefined,
                status: 'CONFIRMED',
              });
            }
          }
        }
      }
    } else {
      const { data: studentRows } = await adminClient.from('students').select('id, school_id, name').eq('user_id', user.id);
      const pairs = schoolIdParam
        ? (studentRows || []).filter((s) => s.school_id === schoolIdParam).map((s) => ({ student_id: s.id, school_id: s.school_id! }))
        : (studentRows || []).map((s) => ({ student_id: s.id, school_id: s.school_id! }));
      const schoolIds = [...new Set(pairs.map((p) => p.school_id))];
      const { data: schools } = await adminClient.from('schools').select('id, name').in('id', schoolIds);
      const schoolNames: Record<string, string> = {};
      (schools || []).forEach((s) => { schoolNames[s.id] = s.name || 'Teacher'; });

      for (const { student_id, school_id } of pairs) {
        const { data: lessons } = await adminClient
          .from('private_lessons')
          .select('id, start_at_utc, end_at_utc, status')
          .eq('student_id', student_id)
          .eq('school_id', school_id)
          .in('status', ['confirmed', 'attended'])
          .gte('end_at_utc', fromUtc.toISOString())
          .lte('start_at_utc', toUtc.toISOString())
          .order('start_at_utc');
        const teacherName = schoolNames[school_id] || 'Teacher';
        (lessons || []).forEach((l) => {
          events.push({
            uid: `private-lesson-${l.id}@calendar`,
            start: new Date(l.start_at_utc),
            end: new Date(l.end_at_utc),
            summary: `Private lesson with ${escapeIcsText(teacherName)}`,
            status: 'CONFIRMED',
          });
        });
      }

      if (includeGroupClasses && pairs.length > 0) {
        const { data: regs } = await adminClient
          .from('class_registrations')
          .select('class_id, class_date')
          .in('student_id', pairs.map((p) => p.student_id))
          .gte('class_date', fromUtc.toISOString().slice(0, 10))
          .lte('class_date', toUtc.toISOString().slice(0, 10));
        const classIds = [...new Set((regs || []).map((r) => r.class_id))];
        if (classIds.length > 0) {
          const { data: classes } = await adminClient.from('classes').select('id, name, time, end_time, location').in('id', classIds);
          const classMap: Record<number, { name: string; time: string; end_time: string; location?: string }> = {};
          (classes || []).forEach((c) => { classMap[c.id] = c; });
          (regs || []).forEach((r) => {
            const c = classMap[r.class_id];
            if (!c) return;
            const start = new Date(`${r.class_date}T${(c.time || '09:00').slice(0, 5)}:00.000Z`);
            const end = new Date(`${r.class_date}T${(c.end_time || c.time || '10:00').slice(0, 5)}:00.000Z`);
            events.push({
              uid: `group-reg-${r.class_id}-${r.class_date}@calendar`,
              start,
              end,
              summary: `Group: ${escapeIcsText(c.name || 'Class')}`,
              location: c.location ? escapeIcsText(c.location) : undefined,
              status: 'CONFIRMED',
            });
          });
        }
      }
    }

    const dtstamp = formatUtcForIcs(new Date());
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DancePlatform//Calendar//EN',
      'CALSCALE:GREGORIAN',
    ];
    for (const ev of events.sort((a, b) => a.start.getTime() - b.start.getTime())) {
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${ev.uid}`);
      lines.push(`DTSTAMP:${dtstamp}`);
      lines.push(`DTSTART:${formatUtcForIcs(ev.start)}`);
      lines.push(`DTEND:${formatUtcForIcs(ev.end)}`);
      lines.push(`SUMMARY:${ev.summary}`);
      if (ev.description) lines.push(`DESCRIPTION:${ev.description}`);
      if (ev.location) lines.push(`LOCATION:${ev.location}`);
      lines.push(`STATUS:${ev.status}`);
      lines.push('END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    const ics = lines.join('\r\n');

    return new Response(ics, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="schedule.ics"',
      },
    });
  } catch (e) {
    console.error('export_calendar_ics error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
