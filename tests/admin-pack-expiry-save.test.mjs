/**
 * Admin per-pack expiry save logic. Run: node tests/admin-pack-expiry-save.test.mjs
 */
import assert from 'node:assert';
import {
    isoEndOfLocalDayFromDateInput,
    applyPerPackExpiryFromInputs,
    computePPackageExpiresAtFromPacks,
} from '../src/studentExpirySave.js';
import { syncActivePacksFieldSumToTarget } from '../src/utils.js';

function formatClassDate(date) {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

let passed = 0;
function test(name, fn) {
    try {
        fn();
        passed++;
        console.log('  ok: ' + name);
    } catch (e) {
        console.error('  FAIL: ' + name);
        throw e;
    }
}

test('isoEndOfLocalDayFromDateInput returns null for bad input', () => {
    assert.strictEqual(isoEndOfLocalDayFromDateInput(null), null);
    assert.strictEqual(isoEndOfLocalDayFromDateInput(''), null);
    assert.strictEqual(isoEndOfLocalDayFromDateInput('2026-xx-01'), null);
});

test('isoEndOfLocalDayFromDateInput matches local end-of-day', () => {
    const ymd = '2026-06-15';
    const got = isoEndOfLocalDayFromDateInput(ymd);
    const [y, m, d] = ymd.split('-').map((x) => parseInt(x, 10));
    const want = new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
    assert.strictEqual(got, want);
});

test('applyPerPackExpiryFromInputs skips when YMD unchanged', () => {
    const origIso = isoEndOfLocalDayFromDateInput('2026-03-01');
    const packs = [{ id: 'P1', count: 5, expires_at: origIso }];
    const clone = JSON.parse(JSON.stringify(packs));
    const ymd = formatClassDate(new Date(origIso));
    applyPerPackExpiryFromInputs(clone, [{ packId: 'P1', inputYmd: ymd }], formatClassDate);
    assert.strictEqual(clone[0].expires_at, origIso);
});

test('applyPerPackExpiryFromInputs updates when YMD changes', () => {
    const origIso = isoEndOfLocalDayFromDateInput('2026-03-01');
    const packs = [{ id: 'P1', count: 5, expires_at: origIso }];
    const clone = JSON.parse(JSON.stringify(packs));
    applyPerPackExpiryFromInputs(clone, [{ packId: 'P1', inputYmd: '2026-12-31' }], formatClassDate);
    assert.notStrictEqual(clone[0].expires_at, origIso);
    assert.strictEqual(clone[0].expires_at, isoEndOfLocalDayFromDateInput('2026-12-31'));
});

test('computePPackageExpiresAtFromPacks is earliest expires_at', () => {
    const a = isoEndOfLocalDayFromDateInput('2026-08-01');
    const b = isoEndOfLocalDayFromDateInput('2026-02-01');
    const c = isoEndOfLocalDayFromDateInput('2026-06-01');
    const minIso = computePPackageExpiresAtFromPacks([
        { id: 'x', expires_at: a },
        { id: 'y', expires_at: b },
        { id: 'z', expires_at: c },
    ]);
    assert.strictEqual(minIso, b);
});

test('computePPackageExpiresAtFromPacks returns null for empty / no dates', () => {
    assert.strictEqual(computePPackageExpiresAtFromPacks([]), null);
    assert.strictEqual(computePPackageExpiresAtFromPacks([{ id: 'a' }]), null);
});

test('syncActivePacksFieldSumToTarget preserves expires_at', () => {
    const e1 = isoEndOfLocalDayFromDateInput('2026-04-10');
    const e2 = isoEndOfLocalDayFromDateInput('2026-05-10');
    const packs = [
        { id: 'A', count: 3, expires_at: e1 },
        { id: 'B', count: 2, expires_at: e2 },
    ];
    const out = syncActivePacksFieldSumToTarget(JSON.parse(JSON.stringify(packs)), 'count', 4);
    assert.strictEqual(out[0].expires_at, e1);
    assert.strictEqual(out[1].expires_at, e2);
    assert.strictEqual(out[0].count + out[1].count, 4);
});

test('full save path: extend one pack, pPackage is min of all', () => {
    const eEarly = isoEndOfLocalDayFromDateInput('2026-01-15');
    const eLate = isoEndOfLocalDayFromDateInput('2026-09-01');
    const origPacks = [
        { id: 'PACK-A', name: '10 pack', count: 4, expires_at: eEarly },
        { id: 'PACK-B', name: '5 pack', count: 2, expires_at: eLate },
    ];
    const origJson = JSON.stringify(origPacks);
    let packsMut = JSON.parse(origJson);
    applyPerPackExpiryFromInputs(
        packsMut,
        [{ packId: 'PACK-B', inputYmd: '2027-01-01' }],
        formatClassDate
    );
    assert.notStrictEqual(JSON.stringify(packsMut), origJson);
    const pPackage = computePPackageExpiresAtFromPacks(packsMut);
    assert.strictEqual(pPackage, eEarly, 'row timer should match soonest pack');
    assert.strictEqual(
        packsMut.find((p) => p.id === 'PACK-B').expires_at,
        isoEndOfLocalDayFromDateInput('2027-01-01')
    );
});

test('extending soonest pack moves pPackage to new min', () => {
    const e1 = isoEndOfLocalDayFromDateInput('2026-01-15');
    const e2 = isoEndOfLocalDayFromDateInput('2026-09-01');
    const packsMut = JSON.parse(
        JSON.stringify([
            { id: 'A', count: 1, expires_at: e1 },
            { id: 'B', count: 1, expires_at: e2 },
        ])
    );
    applyPerPackExpiryFromInputs(packsMut, [{ packId: 'A', inputYmd: '2026-12-01' }], formatClassDate);
    const pPackage = computePPackageExpiresAtFromPacks(packsMut);
    assert.strictEqual(pPackage, e2);
});

console.log('admin-pack-expiry-save tests: ' + passed + ' passed');
