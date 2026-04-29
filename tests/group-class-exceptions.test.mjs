/**
 * Group class occurrence exceptions (per-class vs whole-day, registration gating).
 * Run: node tests/group-class-exceptions.test.mjs
 */
import assert from 'node:assert';
import {
    registrationClosedFromExceptionKind,
    resolveScheduleGroupExceptionFromRows,
} from '../src/groupClassExceptionResolve.js';

let passed = 0;
function test(name, fn) {
    fn();
    passed++;
    console.log('  ok: ' + name);
}

test('registrationClosedFromExceptionKind: cancelled and special block', () => {
    assert.strictEqual(registrationClosedFromExceptionKind('cancelled'), true);
    assert.strictEqual(registrationClosedFromExceptionKind('special'), true);
    assert.strictEqual(registrationClosedFromExceptionKind('CANCELLED'), true);
});

test('registrationClosedFromExceptionKind: info does not block', () => {
    assert.strictEqual(registrationClosedFromExceptionKind('info'), false);
    assert.strictEqual(registrationClosedFromExceptionKind(''), false);
    assert.strictEqual(registrationClosedFromExceptionKind(null), false);
});

test('resolveScheduleGroupExceptionFromRows: class-specific wins over whole day', () => {
    const rows = [
        { class_id: null, occurrence_date: '2026-06-10', exception_kind: 'cancelled', message: 'school closed' },
        { class_id: 42, occurrence_date: '2026-06-10', exception_kind: 'info', message: 'room change' },
    ];
    const r = resolveScheduleGroupExceptionFromRows(42, '2026-06-10', rows);
    assert.strictEqual(r.exception_kind, 'info');
    assert.strictEqual(registrationClosedFromExceptionKind(r.exception_kind), false);
});

test('resolveScheduleGroupExceptionFromRows: whole day applies when no class row', () => {
    const rows = [
        { class_id: null, occurrence_date: '2026-06-11', exception_kind: 'cancelled', message: 'holiday' },
    ];
    const r = resolveScheduleGroupExceptionFromRows(99, '2026-06-11', rows);
    assert.strictEqual(r.exception_kind, 'cancelled');
    assert.strictEqual(registrationClosedFromExceptionKind(r.exception_kind), true);
});

test('resolveScheduleGroupExceptionFromRows: other class on same day ignored', () => {
    const rows = [{ class_id: 1, occurrence_date: '2026-06-12', exception_kind: 'cancelled', message: 'x' }];
    assert.strictEqual(resolveScheduleGroupExceptionFromRows(2, '2026-06-12', rows), null);
});

test('resolveScheduleGroupExceptionFromRows: no match', () => {
    assert.strictEqual(resolveScheduleGroupExceptionFromRows(1, '2026-01-01', []), null);
});

console.log('group-class-exceptions tests: ' + passed + ' passed');
