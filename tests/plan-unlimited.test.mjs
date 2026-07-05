// Verifies planIsUnlimited (0/0/0 => unlimited, non-private-teacher) — the rule the
// admin UI badge + "set to 0" confirmation and activate_package_for_student share.
import assert from 'node:assert';
import { planIsUnlimited } from '../src/utils.js';

const school = { profile_type: 'studio' };
const pt = { profile_type: 'private_teacher' };

// all-zero, normal school => unlimited
assert.strictEqual(planIsUnlimited({ limit_count: 0, limit_count_private: 0, limit_count_events: 0 }, school), true);
// string zeros (values arrive as strings from inputs/RPC)
assert.strictEqual(planIsUnlimited({ limit_count: '0', limit_count_private: '', limit_count_events: null }, school), true);
// finite group => not unlimited
assert.strictEqual(planIsUnlimited({ limit_count: 8, limit_count_private: 0, limit_count_events: 0 }, school), false);
// private-only => not unlimited (it's a real private plan, not unlimited)
assert.strictEqual(planIsUnlimited({ limit_count: 0, limit_count_private: 5, limit_count_events: 0 }, school), false);
// events-only => not unlimited
assert.strictEqual(planIsUnlimited({ limit_count: 0, limit_count_private: 0, limit_count_events: 3 }, school), false);
// private-teacher all-zero => never unlimited here
assert.strictEqual(planIsUnlimited({ limit_count: 0, limit_count_private: 0, limit_count_events: 0 }, pt), false);

// Transition check the confirmation relies on: editing a finite plan's group to 0 makes it unlimited.
const before = { limit_count: 8, limit_count_private: 0, limit_count_events: 0 };
const afterSetZero = { ...before, limit_count: 0 };
assert.strictEqual(planIsUnlimited(before, school), false);
assert.strictEqual(planIsUnlimited(afterSetZero, school), true);

console.log('plan-unlimited.test.mjs: all assertions passed');
