/**
 * Shared helpers: formatPrice, formatClassTime, currency constants.
 * Change price/date formatting or currency here.
 */

import { escapeHtml } from './config.js';

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

/** False when teacher hid the plan from shop / discovery (`student_visible === false`). */
export function subscriptionShownToStudents(sub) {
    return !!(sub && sub.student_visible !== false);
}

/** Strong ghost styling for entire plan card when hidden from students (admin UI). */
export function planCardGhostStyleIfHidden(sub) {
    if (subscriptionShownToStudents(sub)) return '';
    return 'opacity:0.34;filter:saturate(0.12) brightness(0.88);';
}

/**
 * Admin plan card: label + pill toggle (glossy track + knob). `t` is a locale object (e.g. DANCE_LOCALES.en).
 */
export function planVisibilityToggleRow(sub, t) {
    const vis = subscriptionShownToStudents(sub);
    const lab = (t && t.package_student_visible_label) || 'Show in shop';
    const title = vis ? lab : ((t && t.package_hidden_from_students_hint) || 'Hidden from students');
    const labelColor = vis ? 'var(--text-primary)' : 'var(--text-secondary)';
    const trackBg = vis
        ? 'linear-gradient(180deg,#7aefb0 0%,#3ddc7a 38%,#24b55f 100%)'
        : 'linear-gradient(180deg,#4d4d52 0%,#38383c 55%,#2c2c30 100%)';
    const trackShadow = vis
        ? 'inset 0 1px 0 rgba(255,255,255,0.42),inset 0 -1px 0 rgba(0,0,0,0.12),0 2px 10px rgba(36,181,95,0.38)'
        : 'inset 0 1px 0 rgba(255,255,255,0.08),inset 0 -1px 0 rgba(0,0,0,0.45),0 1px 4px rgba(0,0,0,0.4)';
    const knobLeft = vis ? '27px' : '3px';
    return `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;margin-top:6px;padding-top:8px;border-top:1px solid rgba(128,128,140,0.14);">
      <span style="font-size:12px;font-weight:600;color:${labelColor};line-height:1.3;letter-spacing:-0.01em;opacity:${vis ? '0.95' : '0.72'};">${escapeHtml(lab)}</span>
      <button type="button" data-field="student_visible_toggle" aria-pressed="${vis}" title="${escapeHtml(title)}" onclick="window.togglePlanStudentVisible('${sub.id}')" style="width:54px;height:30px;border-radius:15px;border:none;cursor:pointer;background:${trackBg};box-shadow:${trackShadow};position:relative;flex-shrink:0;padding:0;outline:none;transition:background 0.26s ease,box-shadow 0.26s ease;">
        <span aria-hidden="true" style="position:absolute;width:24px;height:24px;border-radius:50%;top:3px;left:${knobLeft};background:radial-gradient(circle at 32% 28%,#ffffff 0%,#f4f4f8 42%,#e4e4ea 100%);box-shadow:0 2px 7px rgba(0,0,0,0.32),inset 0 1px 0 rgba(255,255,255,0.92);border:0.5px solid rgba(0,0,0,0.07);transition:left 0.24s cubic-bezier(0.34,1.35,0.64,1);"></span>
      </button>
    </div>`;
}
