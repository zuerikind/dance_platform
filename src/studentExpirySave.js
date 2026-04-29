/**
 * Pure helpers for admin per-pack expiry save (student modal).
 * Kept separate from legacy DOM code for unit tests.
 */

export function isoEndOfLocalDayFromDateInput(ymd) {
    if (!ymd || typeof ymd !== 'string') return null;
    const parts = ymd.split('-').map((x) => parseInt(x, 10));
    if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
    return new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999).toISOString();
}

/**
 * Mutates packs in place (same as legacy save path).
 * @param {object[]} packsMut
 * @param {{ packId: string, inputYmd: string }[]} pairs
 * @param {(d: Date) => string} [formatClassDate]
 */
export function applyPerPackExpiryFromInputs(packsMut, pairs, formatClassDate) {
    if (!Array.isArray(packsMut) || !Array.isArray(pairs)) return;
    for (const { packId, inputYmd: dv } of pairs) {
        if (!packId) continue;
        const idx = packsMut.findIndex((p) => String(p.id) === String(packId));
        if (idx < 0) continue;
        const cur = packsMut[idx].expires_at;
        const prevYmd = cur && typeof formatClassDate === 'function' ? formatClassDate(new Date(cur)) : '';
        if (!dv || dv === prevYmd) continue;
        const iso = isoEndOfLocalDayFromDateInput(dv);
        if (iso) {
            packsMut[idx] = { ...packsMut[idx], expires_at: iso };
        }
    }
}

/** Earliest pack expires_at ISO, or null. */
export function computePPackageExpiresAtFromPacks(packsMut) {
    if (!Array.isArray(packsMut) || packsMut.length === 0) return null;
    let minMs = Infinity;
    for (const p of packsMut) {
        if (!p.expires_at) continue;
        const ms = new Date(p.expires_at).getTime();
        if (Number.isFinite(ms) && ms < minMs) minMs = ms;
    }
    return minMs !== Infinity ? new Date(minMs).toISOString() : null;
}
