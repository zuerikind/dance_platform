/**
 * Rolling monthly revenue buckets for analytics charts (Aure: recognized month).
 */
import { state } from '../state.js';
import { getRevenueRecognizedMonth, isAureSchool as isAureSchoolAttr } from './revenueAttribution.js';
import { getRevenueChartLocale } from './revenueKpis.js';

/** Consistent Spanish short months (avoids English "sept" from some locales). */
const ES_MX_MONTH_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatRevenueMonthShort(date, lang) {
    const l = lang || state.language || 'en';
    if (l === 'es') return ES_MX_MONTH_SHORT[date.getMonth()] || '';
    const locale = getRevenueChartLocale(l);
    return new Intl.DateTimeFormat(locale, { month: 'short' }).format(date).replace(/\.$/, '').trim();
}

export function formatRevenueMonthAxisLabel(date, lang) {
    const l = lang || state.language || 'en';
    if (l === 'es') {
        const y = date.getFullYear() % 100;
        return `${formatRevenueMonthShort(date, l)} ${String(y).padStart(2, '0')}`;
    }
    const locale = getRevenueChartLocale(l);
    return date.toLocaleDateString(locale, { month: 'short', year: '2-digit' });
}

export function formatRevenueMonthTitle(date, lang) {
    const locale = getRevenueChartLocale(lang || state.language);
    return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

/** YYYY-MM from range end (filter month), or null for all-time. */
export function getRevenueHighlightMonthKey(range) {
    if (!range || range.allTime) return null;
    const end = range.dateEnd;
    if (!end || Number.isNaN(end.getTime())) return null;
    return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Last N calendar months of approved + pending amounts (ignores UI package/status filters).
 * @returns {{ buckets: object[], monthsWithData: number, useRecognized: boolean, filterYear: number }}
 */
export function computeRollingMonthlyRevenueSeries(paymentRequests, options = {}) {
    const monthCount = options.monthCount ?? 13;
    const school = options.school || state.currentSchool;
    const subscriptions = options.subscriptions || state.subscriptions || [];
    const lang = options.lang || state.language;
    const useRecognized = isAureSchoolAttr(school);

    const anchor = options.rangeEnd && !Number.isNaN(options.rangeEnd.getTime())
        ? new Date(options.rangeEnd)
        : new Date();
    const endMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12, 0, 0, 0);

    const buckets = [];
    for (let i = monthCount - 1; i >= 0; i--) {
        const d = new Date(endMonth.getFullYear(), endMonth.getMonth() - i, 1, 12, 0, 0, 0);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        buckets.push({
            key,
            label: formatRevenueMonthAxisLabel(d, lang),
            shortLabel: formatRevenueMonthShort(d, lang),
            title: formatRevenueMonthTitle(d, lang),
            collected: 0,
            pending: 0,
            approvedCount: 0,
            pendingCount: 0,
            momPct: null,
            isHighlight: false
        });
    }

    const highlightKey = options.highlightMonthKey || null;
    const bucketByKey = Object.fromEntries(buckets.map((b) => [b.key, b]));

    (paymentRequests || []).forEach((r) => {
        let monthKey;
        if (useRecognized) {
            const rec = getRevenueRecognizedMonth(r, subscriptions, school);
            if (!rec) return;
            monthKey = rec.slice(0, 7);
        } else {
            const created = new Date(r.created_at);
            if (Number.isNaN(created.getTime())) return;
            monthKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
        }
        const b = bucketByKey[monthKey];
        if (!b) return;
        const price = parseFloat(r.price) || 0;
        if (r.status === 'approved') {
            b.collected += price;
            b.approvedCount += 1;
        } else if (r.status === 'pending') {
            b.pending += price;
            b.pendingCount += 1;
        }
    });

    buckets.forEach((b, i) => {
        if (highlightKey && b.key === highlightKey) b.isHighlight = true;
        if (i === 0) {
            b.momPct = null;
            return;
        }
        const prev = buckets[i - 1].collected;
        if (prev > 0) {
            b.momPct = Math.round(((b.collected - prev) / prev) * 100);
        } else if (b.collected > 0) {
            b.momPct = null;
        } else {
            b.momPct = 0;
        }
    });

    const monthsWithData = buckets.filter(
        (b) => b.collected > 0 || b.pending > 0 || b.approvedCount > 0 || b.pendingCount > 0
    ).length;

    const filterYear = endMonth.getFullYear();
    return { buckets, monthsWithData, useRecognized, filterYear };
}

/** Cumulative collected within filterYear from monthly buckets. */
export function computeYtdCumulativeFromBuckets(buckets, year) {
    const y = String(year);
    let cumulative = 0;
    return (buckets || [])
        .filter((b) => b.key.startsWith(y))
        .map((b) => {
            cumulative += b.collected;
            return { ...b, cumulative };
        });
}
