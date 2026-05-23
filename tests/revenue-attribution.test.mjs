import assert from 'node:assert/strict';
import {
    aureRevenueMonthDiffersFromPaymentDate,
    classifyPaymentType,
    getAureAccountingMonthBadge,
    getRevenueRecognizedMonth,
    paymentInRevenueRange
} from '../src/kpi/revenueAttribution.js';
import { sumApprovedHistoricalRevenue } from '../src/kpi/revenueKpis.js';

const AURE = { id: '38e570f9-5ca0-435e-8e99-70ebb5ae3b64' };
const OTHER = { id: '00000000-0000-0000-0000-000000000099' };

const subs = [
    { id: '1', name: '8 Clases', limit_count: 8, limit_count_private: 0 },
    { id: '2', name: '1 Clase', limit_count: 1, limit_count_private: 0 },
    { id: '3', name: 'Privado 4', limit_count: 0, limit_count_private: 4 },
    { id: '4', name: '4 Clases grupales', limit_count: 4, limit_count_private: 0 },
    { id: '5', name: 'Clase Suelta (Martes o Domingo)', limit_count: 1, limit_count_private: 0 }
];

function pay(subName, createdAtIso, extra = {}) {
    return { school_id: AURE.id, sub_name: subName, created_at: createdAtIso, ...extra };
}

// Aure 8-pack Jan 31 MX → February
const jan31 = '2026-01-31T23:30:00-06:00';
assert.equal(
    getRevenueRecognizedMonth(pay('8 Clases', jan31), subs, AURE),
    '2026-02-01'
);

// Aure 8-pack Jan 15 → January
assert.equal(
    getRevenueRecognizedMonth(pay('8 Clases', '2026-01-15T12:00:00-06:00'), subs, AURE),
    '2026-01-01'
);

// Aure 1 Clase Jan 31 → January
assert.equal(
    getRevenueRecognizedMonth(pay('1 Clase', jan31), subs, AURE),
    '2026-01-01'
);

// Aure private Jan 31 → January
assert.equal(
    getRevenueRecognizedMonth(pay('Privado 4', jan31), subs, AURE),
    '2026-01-01'
);

// Non-Aure: unchanged created_at month (midday UTC stays in January)
const nonAure = getRevenueRecognizedMonth(
    { school_id: OTHER.id, sub_name: '8 Clases', created_at: '2026-01-31T12:00:00Z' },
    subs,
    OTHER
);
assert.equal(nonAure, '2026-01-01');

assert.equal(classifyPaymentType(pay('8 Clases', jan31), subs, AURE), 'group_package');
assert.equal(classifyPaymentType(pay('1 Clase', jan31), subs, AURE), 'clase_suelta');

const rangeStart = new Date('2026-02-01T00:00:00');
const rangeEnd = new Date('2026-02-28T23:59:59.999');
assert.equal(
    paymentInRevenueRange(pay('8 Clases', jan31), rangeStart, rangeEnd, subs, AURE),
    true
);
assert.equal(
    paymentInRevenueRange(pay('8 Clases', jan31), new Date('2026-01-01'), new Date('2026-01-31T23:59:59'), subs, AURE),
    false
);

// Feb 25 group package → March recognized; appears in March filter, not February
const feb25 = '2026-02-25T12:00:00-06:00';
assert.equal(getRevenueRecognizedMonth(pay('8 Clases', feb25), subs, AURE), '2026-03-01');
const marchStart = new Date('2026-03-01T00:00:00');
const marchEnd = new Date('2026-03-31T23:59:59.999');
assert.equal(paymentInRevenueRange(pay('8 Clases', feb25), marchStart, marchEnd, subs, AURE), true);
assert.equal(
    paymentInRevenueRange(pay('8 Clases', feb25), new Date('2026-02-01'), new Date('2026-02-28T23:59:59'), subs, AURE),
    false
);

// March 25 group pack → April recognized; not in March filter even if DB column says March
const mar25Group = '2026-03-25T12:00:00-06:00';
const mar25Pay = pay('4 Clases grupales', mar25Group, { revenue_recognized_month: '2026-03-01' });
assert.equal(getRevenueRecognizedMonth(mar25Pay, subs, AURE), '2026-04-01');
assert.equal(classifyPaymentType(mar25Pay, subs, AURE), 'group_package');
const aprilStart = new Date('2026-04-01T00:00:00');
const aprilEnd = new Date('2026-04-30T23:59:59.999');
assert.equal(paymentInRevenueRange(mar25Pay, marchStart, marchEnd, subs, AURE), false);
assert.equal(paymentInRevenueRange(mar25Pay, aprilStart, aprilEnd, subs, AURE), true);

// March 29 clase suelta stays in March
const mar29Suelta = pay('1 Clase', '2026-03-29T12:00:00-06:00');
assert.equal(getRevenueRecognizedMonth(mar29Suelta, subs, AURE), '2026-03-01');
assert.equal(paymentInRevenueRange(mar29Suelta, marchStart, marchEnd, subs, AURE), true);

// Aure product name "Clase Suelta (Martes o Domingo)" — clase_suelta, no shift on Mar 29
const mar29NamedSuelta = pay('Clase Suelta (Martes o Domingo)', '2026-03-29T12:00:00-06:00', { sub_id: '5' });
assert.equal(classifyPaymentType(mar29NamedSuelta, subs, AURE), 'clase_suelta');
assert.equal(getRevenueRecognizedMonth(mar29NamedSuelta, subs, AURE), '2026-03-01');
assert.equal(paymentInRevenueRange(mar29NamedSuelta, marchStart, marchEnd, subs, AURE), true);
assert.equal(paymentInRevenueRange(mar29NamedSuelta, aprilStart, aprilEnd, subs, AURE), false);

assert.equal(aureRevenueMonthDiffersFromPaymentDate(pay('8 Clases', jan31), subs, AURE), true);
assert.equal(aureRevenueMonthDiffersFromPaymentDate(pay('1 Clase', jan31), subs, AURE), false);
const badge = getAureAccountingMonthBadge(pay('8 Clases', jan31), subs, AURE, 'es');
assert.ok(badge.length > 0);

// Historical sum: shifted Jan-31 pack counts in February bucket only once
const payments = [
    { ...pay('8 Clases', jan31), status: 'approved', price: 1000 },
    { ...pay('8 Clases', '2026-01-15T12:00:00-06:00'), status: 'approved', price: 500 }
];
const historical = sumApprovedHistoricalRevenue(payments, AURE, subs);
assert.equal(historical, 1500);

console.log('revenue-attribution.test.mjs: ok');
