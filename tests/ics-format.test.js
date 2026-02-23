/**
 * Minimal ICS format validation. Run: node tests/ics-format.test.js
 * Validates structure produced by export_calendar_ics (VCALENDAR, VEVENT, DTSTART, DTEND).
 */

function formatUtcForIcs(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${day}T${h}${min}${s}Z`;
}

function buildSampleIcs() {
  const start = new Date(Date.UTC(2026, 1, 25, 14, 0, 0));
  const end = new Date(Date.UTC(2026, 1, 25, 15, 0, 0));
  const dtstamp = formatUtcForIcs(new Date());
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DancePlatform//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:private-lesson-1@calendar',
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${formatUtcForIcs(start)}`,
    `DTEND:${formatUtcForIcs(end)}`,
    'SUMMARY:Private lesson with Student',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function parseIcs(ics) {
  const lines = ics.split(/\r?\n/).map((l) => l.replace(/^[\s]+/, ''));
  const events = [];
  let inEvent = false;
  let current = {};
  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      current = {};
    } else if (line.startsWith('END:VEVENT')) {
      events.push(current);
      inEvent = false;
    } else if (inEvent) {
      const idx = line.indexOf(':');
      if (idx > 0) {
        const key = line.slice(0, idx).split(';')[0];
        const value = line.slice(idx + 1).replace(/\\n/g, '\n').replace(/\\([;,])/g, '$1');
        current[key] = value;
      }
    }
  }
  return { events, hasCalendar: /BEGIN:VCALENDAR/.test(ics) && /END:VCALENDAR/.test(ics) };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  let ok = 0;
  const ics = buildSampleIcs();
  const { events, hasCalendar } = parseIcs(ics);

  assert(hasCalendar, 'ICS must contain BEGIN:VCALENDAR and END:VCALENDAR');
  ok++;
  assert(events.length >= 1, 'At least one VEVENT');
  ok++;
  const ev = events[0];
  assert(ev.DTSTART && ev.DTSTART.endsWith('Z'), 'DTSTART must be UTC (Z)');
  ok++;
  assert(ev.DTEND && ev.DTEND.endsWith('Z'), 'DTEND must be UTC (Z)');
  ok++;
  assert(ev.SUMMARY, 'SUMMARY present');
  ok++;
  assert(/^\d{8}T\d{6}Z$/.test(ev.DTSTART), 'DTSTART format YYYYMMDDTHHMMSSZ');
  ok++;
  assert(/^\d{8}T\d{6}Z$/.test(ev.DTEND), 'DTEND format YYYYMMDDTHHMMSSZ');
  ok++;

  console.log('ICS format tests: ' + ok + ' passed');
}

run();
