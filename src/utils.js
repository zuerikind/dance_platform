/**
 * Shared helpers: formatPrice, formatClassTime, currency constants.
 * Change price/date formatting or currency here.
 */

export const CURRENCY_LABELS = { MXN: 'Mexican Peso (MXN)', CHF: 'Swiss Franc (CHF)', USD: 'US Dollar (USD)', COP: 'Colombian Peso (COP)' };
export const CURRENCY_SYMBOLS = { MXN: 'MX$', CHF: 'CHF ', USD: 'US$', COP: 'COP ' };

export const formatClassTime = (c) => (c && c.end_time ? `${c.time || ''} – ${c.end_time}` : (c && c.time) ? c.time : '');

export function formatPrice(price, currency) {
    const c = (currency || 'MXN').toUpperCase();
    const sym = CURRENCY_SYMBOLS[c] || 'MX$';
    const p = parseFloat(price);
    if (isNaN(p)) return sym + '0';
    const n = p;
    const formatted = Number.isInteger(n) ? n.toLocaleString() : parseFloat(n.toFixed(2)).toLocaleString();
    return sym + formatted;
}

/** Stub; overwritten by settings module when admin settings are loaded. */
export function getPlanExpiryUseFixedDate() {
    return false;
}

/**
 * True when the school should show separate group + private balances, shop sections, and scanner deductions.
 * Private teachers: same admin_settings key means "also offer group class packages" (default off = private-only UX).
 * Regular schools: requires private_packages_enabled and the same setting ("offer private class packages").
 */
export function schoolHasDualGroupPrivateOffering(school, adminSettings) {
    if (!school) return false;
    const offeringOn = adminSettings?.private_classes_offering_enabled === 'true';
    if (school.profile_type === 'private_teacher') return offeringOn;
    return school.private_packages_enabled !== false && offeringOn;
}

/**
 * Adjust per-pack numeric fields so their sum matches target. Uses FIFO by expires_at (soonest first),
 * matching how deductions consume packs. Keeps students.balance / balance_* and active_packs aligned so
 * effective balance (max(row, sum(packs))) matches what the admin typed.
 *
 * @param {'count'|'private_count'|'event_count'} field
 * @param {number} targetSum — non-negative integer
 */
export function syncActivePacksFieldSumToTarget(activePacks, field, targetSum) {
    if (!Array.isArray(activePacks)) return [];
    const target = Math.max(0, Math.floor(Number(targetSum)));
    if (!Number.isFinite(target)) return activePacks.map((p) => ({ ...p }));

    const packs = activePacks.map((p) => ({ ...p }));

    const readVal = (p) => {
        if (field === 'count') {
            if (p.count == null || p.count === 'null') return null;
            const n = parseInt(p.count, 10);
            return Number.isFinite(n) ? n : 0;
        }
        if (field === 'private_count') return Math.max(0, parseInt(p.private_count, 10) || 0);
        if (field === 'event_count') return Math.max(0, parseInt(p.event_count, 10) || 0);
        return 0;
    };
    const writeVal = (p, v) => {
        const n = Math.max(0, Math.floor(v));
        if (field === 'count') p.count = n;
        else if (field === 'private_count') p.private_count = n;
        else p.event_count = n;
    };

    const entries = [];
    packs.forEach((p, i) => {
        const v = readVal(p);
        if (field === 'count' && v === null) return;
        const exp = p.expires_at ? new Date(p.expires_at).getTime() : 0;
        entries.push({ i, exp });
    });

    let sum = 0;
    entries.forEach((e) => {
        const v = readVal(packs[e.i]);
        sum += v;
    });

    let diff = target - sum;
    if (diff === 0) return packs;

    entries.sort((a, b) => a.exp - b.exp);

    if (diff > 0) {
        const first = entries[0];
        if (!first) return packs;
        const cur = readVal(packs[first.i]);
        writeVal(packs[first.i], cur + diff);
        return packs;
    }

    let rem = -diff;
    for (const e of entries) {
        if (rem <= 0) break;
        const cur = readVal(packs[e.i]);
        const take = Math.min(cur, rem);
        writeVal(packs[e.i], cur - take);
        rem -= take;
    }
    return packs;
}
