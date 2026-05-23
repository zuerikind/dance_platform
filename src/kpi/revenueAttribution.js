/**
 * Aure Ganancias revenue month attribution (America/Mexico_City).
 * Non-Aure schools: unchanged — filter by payment created_at.
 */
import { AURE_SCHOOL_ID } from '../config.js';

export const AURE_REVENUE_TZ = 'America/Mexico_City';

export function isAureSchool(school) {
    const id = school?.id;
    return id === AURE_SCHOOL_ID;
}

/** YYYY-MM-DD for instant in IANA timezone. */
export function calendarDateStrInTimeZone(date, timeZone) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(date);
    const y = parts.find((p) => p.type === 'year').value;
    const m = parts.find((p) => p.type === 'month').value;
    const d = parts.find((p) => p.type === 'day').value;
    return `${y}-${m}-${d}`;
}

function daysInGregorianMonth(year, month1to12) {
    return new Date(year, month1to12, 0).getDate();
}

function normalizeRecognizedMonthValue(val) {
    if (val == null || val === '') return null;
    const s = String(val).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    return `${s.slice(0, 7)}-01`;
}

export function findSubscriptionForPayment(payment, subscriptions) {
    const subs = subscriptions || [];
    if (!payment) return null;
    if (payment.sub_id) {
        const byId = subs.find((s) => String(s.id) === String(payment.sub_id));
        if (byId) return byId;
    }
    const name = (payment.sub_name || '').trim().toLowerCase();
    if (!name) return null;
    return subs.find((s) => (s.name || '').trim().toLowerCase() === name) || null;
}

export function isClaseSueltaSubscription(sub, subName) {
    if (sub && sub.limit_count === 1) return true;
    const n = (subName || sub?.name || '').toLowerCase();
    return /(?:^|\s)1\s*clase|clase\s*suelta|single\s*class/i.test(n);
}

export function hasGroupInPlan(sub) {
    return sub != null && sub.limit_count != null && sub.limit_count > 0;
}

export function hasPrivateInPlan(sub) {
    return sub != null && sub.limit_count_private != null && sub.limit_count_private > 0;
}

export function isPrivateOnlySubscription(sub) {
    return hasPrivateInPlan(sub) && !hasGroupInPlan(sub);
}

function isMxDateInLastSevenDays(mxYmd) {
    const parts = String(mxYmd || '').split('-').map((x) => parseInt(x, 10));
    if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return false;
    const [y, mo, day] = parts;
    const dim = daysInGregorianMonth(y, mo);
    return day > dim - 7;
}

/**
 * @returns {'default'|'clase_suelta'|'private_only'|'group_package'}
 */
export function classifyPaymentType(payment, subscriptions, school) {
    if (!isAureSchool(school) && !isAureSchool({ id: payment?.school_id })) return 'default';
    const sub = findSubscriptionForPayment(payment, subscriptions);
    if (isClaseSueltaSubscription(sub, payment?.sub_name)) return 'clase_suelta';
    if (isPrivateOnlySubscription(sub)) return 'private_only';
    return 'group_package';
}

function computeAureRecognizedMonthFromMxDate(mxYmd, paymentType) {
    const parts = String(mxYmd || '').split('-').map((x) => parseInt(x, 10));
    if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
    const [y, mo, day] = parts;
    let recY = y;
    let recM = mo;
    if (paymentType === 'group_package' && isMxDateInLastSevenDays(mxYmd)) {
        recM += 1;
        if (recM > 12) {
            recM = 1;
            recY += 1;
        }
    }
    return `${recY}-${String(recM).padStart(2, '0')}-01`;
}

/**
 * Recognized revenue month as YYYY-MM-01 (Aure rules; non-Aure = created_at calendar month in local TZ).
 */
export function getRevenueRecognizedMonth(payment, subscriptions, school, referenceInstant) {
    if (!payment) return null;

    const schoolObj = school || { id: payment.school_id };
    if (!isAureSchool(schoolObj)) {
        const d = new Date(payment.created_at);
        if (Number.isNaN(d.getTime())) return null;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    }

    // Always derive Aure month from CDMX date + package type. Do not trust
    // revenue_recognized_month alone — it can be stale until repair backfill runs.
    const ref = referenceInstant != null ? new Date(referenceInstant) : new Date(payment.created_at);
    if (Number.isNaN(ref.getTime())) return null;
    const mxYmd = calendarDateStrInTimeZone(ref, AURE_REVENUE_TZ);
    const paymentType = classifyPaymentType(payment, subscriptions, schoolObj);
    return computeAureRecognizedMonthFromMxDate(mxYmd, paymentType);
}

function recognizedMonthRange(recMonthYmd, dateStart, dateEnd) {
    const recStart = new Date(recMonthYmd + 'T00:00:00');
    if (Number.isNaN(recStart.getTime())) return false;
    const parts = recMonthYmd.split('-').map((x) => parseInt(x, 10));
    const y = parts[0];
    const m = parts[1];
    const lastDay = daysInGregorianMonth(y, m);
    const recEnd = new Date(y, m - 1, lastDay, 23, 59, 59, 999);
    return recStart <= dateEnd && recEnd >= dateStart;
}

export function paymentInRevenueRange(payment, dateStart, dateEnd, subscriptions, school) {
    if (!payment || !dateStart || !dateEnd) return false;
    const schoolObj = school || { id: payment.school_id };

    if (!isAureSchool(schoolObj)) {
        const d = new Date(payment.created_at);
        return !Number.isNaN(d.getTime()) && d >= dateStart && d <= dateEnd;
    }

    const rec = getRevenueRecognizedMonth(payment, subscriptions, schoolObj);
    if (!rec) return false;
    return recognizedMonthRange(rec, dateStart, dateEnd);
}

export function formatRecognizedMonthLabel(monthYmd, locale) {
    const norm = normalizeRecognizedMonthValue(monthYmd);
    if (!norm) return '';
    const d = new Date(norm + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return '';
    const loc = locale === 'es' ? 'es-MX' : locale === 'de' ? 'de-DE' : 'en-US';
    const label = d.toLocaleDateString(loc, { month: 'long', year: 'numeric', timeZone: AURE_REVENUE_TZ });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Short month label for Aure accounting badge (e.g. "abr"). */
export function formatRecognizedMonthShort(monthYmd, locale) {
    const norm = normalizeRecognizedMonthValue(monthYmd);
    if (!norm) return '';
    const d = new Date(norm + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return '';
    const loc = locale === 'es' ? 'es-MX' : locale === 'de' ? 'de-DE' : 'en-US';
    return d.toLocaleDateString(loc, { month: 'short', timeZone: AURE_REVENUE_TZ }).replace(/\./g, '').trim();
}

/** True when Aure recognized month differs from payment date month (CDMX). */
export function aureRevenueMonthDiffersFromPaymentDate(payment, subscriptions, school) {
    if (!payment?.created_at || !isAureSchool(school || { id: payment.school_id })) return false;
    const rec = getRevenueRecognizedMonth(payment, subscriptions, school);
    if (!rec) return false;
    const created = new Date(payment.created_at);
    if (Number.isNaN(created.getTime())) return false;
    const mxYmd = calendarDateStrInTimeZone(created, AURE_REVENUE_TZ);
    return rec.slice(0, 7) !== mxYmd.slice(0, 7);
}

export function getAureAccountingMonthBadge(payment, subscriptions, school, locale) {
    if (!aureRevenueMonthDiffersFromPaymentDate(payment, subscriptions, school)) return '';
    const rec = getRevenueRecognizedMonth(payment, subscriptions, school);
    const short = formatRecognizedMonthShort(rec, locale);
    return short || '';
}

/** Preview for manual payment modal (now in CDMX + matched subscription). */
export function getManualPaymentRevenueMonthPreview(subName, subscriptions, school, referenceInstant) {
    if (!isAureSchool(school)) return null;
    const fakePayment = {
        school_id: school?.id,
        sub_name: subName || '',
        created_at: (referenceInstant != null ? new Date(referenceInstant) : new Date()).toISOString()
    };
    const month = getRevenueRecognizedMonth(fakePayment, subscriptions, school, referenceInstant);
    return month;
}
