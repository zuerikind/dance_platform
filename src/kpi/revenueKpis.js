/**
 * Admin revenue (Ganancias) KPI aggregation — client-side with optional RPC merge.
 */
import { AURE_SCHOOL_ID } from '../config.js';
import { state } from '../state.js';
import { formatPrice } from '../utils.js';
import {
    getRevenueRecognizedMonth,
    isAureSchool as isAureSchoolAttr,
    paymentInRevenueRange
} from './revenueAttribution.js';

export function isAureSchool(school) {
    const id = school?.id || state.currentSchool?.id;
    return id === AURE_SCHOOL_ID;
}

/** @returns {{ allTime: boolean, dateStart: Date, dateEnd: Date, defaultStart: string, defaultEnd: string }} */
export function getAdminRevenueDateRange() {
    const now = new Date();
    const allTime = !!state.adminRevenueAllTime;
    if (allTime) {
        const dateEnd = new Date();
        dateEnd.setHours(23, 59, 59, 999);
        return { allTime: true, dateStart: new Date(0), dateEnd, defaultStart: '', defaultEnd: '' };
    }
    const defaultStart = state.adminRevenueDateStart || (typeof window.formatClassDate === 'function'
        ? window.formatClassDate(new Date(now.getFullYear(), now.getMonth(), 1))
        : '');
    const defaultEnd = state.adminRevenueDateEnd || (typeof window.formatClassDate === 'function'
        ? window.formatClassDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
        : '');
    const dateStart = state.adminRevenueDateStart
        ? new Date(state.adminRevenueDateStart + 'T00:00:00')
        : new Date(now.getFullYear(), now.getMonth(), 1);
    const dateEnd = state.adminRevenueDateEnd
        ? new Date(state.adminRevenueDateEnd + 'T23:59:59.999')
        : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { allTime: false, dateStart, dateEnd, defaultStart, defaultEnd };
}

export function buildAdminRevenueFilterHash() {
    const schoolId = state.currentSchool?.id || '';
    const parts = [
        schoolId,
        state.adminRevenueAllTime ? '1' : '0',
        state.adminRevenueDateStart || '',
        state.adminRevenueDateEnd || '',
        state.adminRevenuePackageFilter || '',
        state.adminRevenueStatusFilter || '',
        state.adminRevenueMethodFilter || ''
    ];
    return parts.join('|');
}

export function filterPaymentsForRevenue(paymentRequests, range, opts = {}) {
    const pkgFilter = opts.ignoreUiFilters ? null : state.adminRevenuePackageFilter;
    const statusFilter = opts.ignoreUiFilters ? null : state.adminRevenueStatusFilter;
    const methodFilter = opts.ignoreUiFilters ? null : state.adminRevenueMethodFilter;
    const { dateStart, dateEnd } = range;
    const school = opts.school || state.currentSchool;
    const subscriptions = opts.subscriptions || state.subscriptions || [];
    return (paymentRequests || []).filter((r) => {
        if (!paymentInRevenueRange(r, dateStart, dateEnd, subscriptions, school)) return false;
        if (pkgFilter && (r.sub_name || '').toLowerCase().trim() !== String(pkgFilter).toLowerCase().trim()) return false;
        if (statusFilter && r.status !== statusFilter) return false;
        if (methodFilter && r.payment_method !== methodFilter) return false;
        return true;
    });
}

/** All-time approved revenue (Aure: recognized month; others: created_at). Ignores UI filters. */
export function sumApprovedHistoricalRevenue(paymentRequests, school, subscriptions) {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const range = { allTime: true, dateStart: new Date(0), dateEnd: end };
    return filterPaymentsForRevenue(paymentRequests, range, {
        ignoreUiFilters: true,
        school,
        subscriptions
    })
        .filter((r) => r.status === 'approved')
        .reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0);
}

function sumPrices(rows) {
    return rows.reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0);
}

export function computeRevenueKpisFromPayments(filtered) {
    const approved = filtered.filter((r) => r.status === 'approved');
    const pending = filtered.filter((r) => r.status === 'pending');
    const collected = sumPrices(approved);
    const pendingSum = sumPrices(pending);
    const approvedCount = approved.length;
    const avgTicket = approvedCount > 0 ? collected / approvedCount : 0;

    const byMethod = { cash: 0, transfer: 0 };
    approved.forEach((r) => {
        const m = r.payment_method === 'cash' ? 'cash' : (r.payment_method === 'transfer' ? 'transfer' : null);
        if (m) byMethod[m] += parseFloat(r.price) || 0;
    });
    const methodTotal = byMethod.cash + byMethod.transfer;
    const paymentMix = {
        cash: byMethod.cash,
        transfer: byMethod.transfer,
        cashPct: methodTotal > 0 ? Math.round((byMethod.cash / methodTotal) * 100) : 0,
        transferPct: methodTotal > 0 ? Math.round((byMethod.transfer / methodTotal) * 100) : 0
    };

    const pkgMap = {};
    approved.forEach((r) => {
        const name = (r.sub_name || '').trim() || '—';
        const key = name.toLowerCase();
        if (!pkgMap[key]) pkgMap[key] = { sub_name: name, total: 0, count: 0 };
        pkgMap[key].total += parseFloat(r.price) || 0;
        pkgMap[key].count += 1;
    });
    const topPackages = Object.values(pkgMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 8);

    return {
        collected,
        collectedCount: approvedCount,
        pendingSum,
        pendingCount: pending.length,
        avgTicket,
        paymentMix,
        topPackages,
        filteredCount: filtered.length
    };
}

export function countAurePendingSueltaInRegs(regs, range) {
    if (!Array.isArray(regs) || !range) return 0;
    const { dateStart, dateEnd } = range;
    return regs.filter((r) => {
        if (r.status !== 'pending') return false;
        if (r.is_monthly) return false;
        const d = r.class_date ? new Date(r.class_date + 'T12:00:00') : null;
        if (!d || Number.isNaN(d.getTime())) return true;
        return d >= range.dateStart && d <= range.dateEnd;
    }).length;
}

/** Merge RPC summary into client KPIs when RPC returns data. */
export function mergeRpcIntoRevenueKpis(clientKpis, rpc) {
    if (!rpc || typeof rpc !== 'object') return clientKpis;
    const out = { ...clientKpis, source: clientKpis.source || 'client' };
    if (rpc.revenue_approved != null) {
        out.collected = Number(rpc.revenue_approved) || 0;
        out.source = 'rpc';
    }
    if (rpc.revenue_pending != null) out.pendingSum = Number(rpc.revenue_pending) || 0;
    if (rpc.pending_count != null) out.pendingCount = Number(rpc.pending_count) || 0;
    if (rpc.approved_count != null) out.collectedCount = Number(rpc.approved_count) || 0;
    if (rpc.avg_ticket != null) out.avgTicket = Number(rpc.avg_ticket) || 0;
    if (rpc.by_method && typeof rpc.by_method === 'object') {
        const cash = Number(rpc.by_method.cash) || 0;
        const transfer = Number(rpc.by_method.transfer) || 0;
        const methodTotal = cash + transfer;
        out.paymentMix = {
            cash,
            transfer,
            cashPct: methodTotal > 0 ? Math.round((cash / methodTotal) * 100) : 0,
            transferPct: methodTotal > 0 ? Math.round((transfer / methodTotal) * 100) : 0
        };
    }
    if (Array.isArray(rpc.by_package) && rpc.by_package.length) {
        out.topPackages = rpc.by_package.slice(0, 8).map((p) => ({
            sub_name: p.sub_name || p.name || '—',
            total: Number(p.total) || 0,
            count: Number(p.count) || 0
        }));
    }
    if (rpc.registrations && rpc.registrations.pending_suelta_count != null) {
        out.aurePendingSuelta = Number(rpc.registrations.pending_suelta_count) || 0;
    }
    return out;
}

export function getRevenueKpiPresetOptions(t, aure) {
    const opts = [
        { value: 'summary', label: t.revenue_kpi_preset_summary || 'Full summary' },
        { value: 'collected', label: t.revenue_kpi_collected || 'Collected revenue' },
        { value: 'pending', label: t.revenue_kpi_pending || 'To collect' },
        { value: 'avg_ticket', label: t.revenue_kpi_avg_ticket || 'Average ticket' },
        { value: 'payment_mix', label: t.revenue_kpi_payment_mix || 'Cash / transfer mix' },
        { value: 'top_packages', label: t.revenue_kpi_top_packages || 'Top packages' }
    ];
    if (aure) {
        opts.push({
            value: 'aure_pending_suelta',
            label: t.revenue_kpi_aure_pending_suelta || 'Pending clase suelta requests'
        });
    }
    return opts;
}

function cardsForPreset(preset, kpis, t, currency) {
    const all = [
        { key: 'collected', show: true },
        { key: 'pending', show: true },
        { key: 'avg_ticket', show: true },
        { key: 'payment_mix', show: true },
        { key: 'top_packages', show: true },
        { key: 'aure_pending_suelta', show: kpis.aurePendingSuelta != null }
    ];
    if (preset === 'summary') {
        return all.filter((c) => c.key !== 'aure_pending_suelta' || kpis.aurePendingSuelta != null);
    }
    return all.filter((c) => c.key === preset && (c.key !== 'aure_pending_suelta' || kpis.aurePendingSuelta != null));
}

export function renderRevenueKpiResults(kpis, preset, t) {
    if (!kpis) return '';
    const currency = state.currentSchool?.currency || 'MXN';
    const cards = cardsForPreset(preset, kpis, t, currency);
    if (!cards.length) return '';

    const blocks = cards.map(({ key }) => {
        if (key === 'collected') {
            return `
                <div class="revenue-kpi-card">
                    <div class="revenue-kpi-card-label">${t.revenue_kpi_collected || 'Collected revenue'}</div>
                    <div class="revenue-kpi-card-value">${formatPrice(kpis.collected, currency)}</div>
                    <div class="revenue-kpi-card-meta">${(t.revenue_kpi_approved_count || '{count} approved').replace('{count}', String(kpis.collectedCount || 0))}</div>
                </div>`;
        }
        if (key === 'pending') {
            return `
                <div class="revenue-kpi-card">
                    <div class="revenue-kpi-card-label">${t.revenue_kpi_pending || 'To collect'}</div>
                    <div class="revenue-kpi-card-value">${formatPrice(kpis.pendingSum, currency)}</div>
                    <div class="revenue-kpi-card-meta">${(t.revenue_kpi_pending_count || '{count} pending').replace('{count}', String(kpis.pendingCount || 0))}</div>
                </div>`;
        }
        if (key === 'avg_ticket') {
            return `
                <div class="revenue-kpi-card">
                    <div class="revenue-kpi-card-label">${t.revenue_kpi_avg_ticket || 'Average ticket'}</div>
                    <div class="revenue-kpi-card-value">${formatPrice(kpis.avgTicket, currency)}</div>
                    <div class="revenue-kpi-card-meta">${t.revenue_kpi_avg_ticket_hint || 'Per approved payment in period'}</div>
                </div>`;
        }
        if (key === 'payment_mix') {
            const mix = kpis.paymentMix || {};
            return `
                <div class="revenue-kpi-card revenue-kpi-card-wide">
                    <div class="revenue-kpi-card-label">${t.revenue_kpi_payment_mix || 'Cash / transfer mix'}</div>
                    <div class="revenue-kpi-mix-bars">
                        <div class="revenue-kpi-mix-row"><span>${t.cash || 'Cash'}</span><span>${formatPrice(mix.cash, currency)} · ${mix.cashPct || 0}%</span></div>
                        <div class="revenue-kpi-mix-bar"><div class="revenue-kpi-mix-fill cash" style="width:${mix.cashPct || 0}%"></div></div>
                        <div class="revenue-kpi-mix-row"><span>${t.transfer || 'Transfer'}</span><span>${formatPrice(mix.transfer, currency)} · ${mix.transferPct || 0}%</span></div>
                        <div class="revenue-kpi-mix-bar"><div class="revenue-kpi-mix-fill transfer" style="width:${mix.transferPct || 0}%"></div></div>
                    </div>
                </div>`;
        }
        if (key === 'top_packages') {
            const rows = (kpis.topPackages || []).length
                ? (kpis.topPackages || []).map((p, i) => `
                    <div class="revenue-kpi-top-row">
                        <span class="revenue-kpi-top-rank">${i + 1}</span>
                        <span class="revenue-kpi-top-name">${String(p.sub_name || '').replace(/</g, '&lt;')}</span>
                        <span class="revenue-kpi-top-amt">${formatPrice(p.total, currency)}</span>
                    </div>`).join('')
                : `<div class="revenue-kpi-card-meta">${t.no_data_msg || 'No data'}</div>`;
            return `
                <div class="revenue-kpi-card revenue-kpi-card-wide">
                    <div class="revenue-kpi-card-label">${t.revenue_kpi_top_packages || 'Top packages'}</div>
                    <div class="revenue-kpi-top-list">${rows}</div>
                </div>`;
        }
        if (key === 'aure_pending_suelta') {
            return `
                <div class="revenue-kpi-card">
                    <div class="revenue-kpi-card-label">${t.revenue_kpi_aure_pending_suelta || 'Pending clase suelta'}</div>
                    <div class="revenue-kpi-card-value">${kpis.aurePendingSuelta ?? 0}</div>
                    <div class="revenue-kpi-card-meta">${t.revenue_kpi_aure_pending_suelta_hint || 'Requests awaiting approval in period'}</div>
                </div>`;
        }
        return '';
    }).join('');

    const analyzedAt = kpis.analyzedAt
        ? new Date(kpis.analyzedAt).toLocaleString(state.language === 'es' ? 'es-ES' : (state.language === 'de' ? 'de-DE' : 'en-US'))
        : '';
    const sourceNote = kpis.source === 'rpc'
        ? (t.revenue_kpi_source_rpc || 'Server summary')
        : (t.revenue_kpi_source_client || 'Calculated on device');

    return `
        <div class="revenue-kpi-results-meta">
            <span>${(t.revenue_kpi_payments_in_scope || '{count} payments in scope').replace('{count}', String(kpis.filteredCount || 0))}</span>
            ${analyzedAt ? `<span> · ${analyzedAt}</span>` : ''}
            <span class="revenue-kpi-source-tag">${sourceNote}</span>
        </div>
        <div class="revenue-kpi-grid">${blocks}</div>
    `;
}

/** Month YYYY-MM aligned to filter end (or current month). */
export function monthStrForRevenueKpiRegistrations(range) {
    const d = range.dateEnd && !Number.isNaN(range.dateEnd.getTime()) ? range.dateEnd : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

/** Locale string for chart axis labels (matches app language). */
export function getRevenueChartLocale(lang) {
    const l = lang || state.language || 'en';
    return l === 'es' ? 'es-MX' : l === 'de' ? 'de-DE' : 'en-US';
}

/** Prior period with same duration as current filter (for MoM-style comparison). */
export function getPreviousRevenueRange(range) {
    if (!range || range.allTime) return null;
    const { dateStart, dateEnd } = range;
    if (!dateStart || !dateEnd || Number.isNaN(dateStart.getTime()) || Number.isNaN(dateEnd.getTime())) return null;
    const prevEnd = new Date(dateStart.getTime() - 1);
    prevEnd.setHours(23, 59, 59, 999);
    const spanMs = dateEnd.getTime() - dateStart.getTime() + 1;
    const prevStart = new Date(prevEnd.getTime() - spanMs + 1);
    prevStart.setHours(0, 0, 0, 0);
    return { allTime: false, dateStart: prevStart, dateEnd: prevEnd };
}

/** Bucket approved revenue by week (≤93d) or month. */
export function computeRevenueTimeSeries(filtered, range, lang) {
    const approved = (filtered || []).filter((r) => r.status === 'approved');
    if (!approved.length) return { buckets: [], mode: 'week' };

    const locale = getRevenueChartLocale(lang);
    const start = range.dateStart && !Number.isNaN(range.dateStart.getTime()) ? range.dateStart : new Date(0);
    const end = range.dateEnd && !Number.isNaN(range.dateEnd.getTime()) ? range.dateEnd : new Date();
    const spanDays = Math.max(1, Math.ceil((end - start) / 86400000));
    const mode = spanDays > 93 ? 'month' : 'week';

    const school = state.currentSchool;
    const subscriptions = state.subscriptions || [];
    const useRecognizedMonth = isAureSchoolAttr(school);

    const bucketMap = {};
    approved.forEach((r) => {
        let d;
        if (useRecognizedMonth && mode === 'month') {
            const rec = getRevenueRecognizedMonth(r, subscriptions, school);
            if (!rec) return;
            d = new Date(rec + 'T12:00:00');
        } else {
            d = new Date(r.created_at);
        }
        if (Number.isNaN(d.getTime())) return;
        let key;
        let label;
        let title;
        if (mode === 'month') {
            key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const bucketDate = new Date(d.getFullYear(), d.getMonth(), 1);
            label = bucketDate.toLocaleDateString(locale, { month: 'short' });
            title = bucketDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
        } else {
            const day = new Date(r.created_at);
            day.setHours(0, 0, 0, 0);
            const dow = (day.getDay() + 6) % 7;
            day.setDate(day.getDate() - dow);
            key = day.toISOString().slice(0, 10);
            if (typeof window !== 'undefined' && typeof window.formatShortDate === 'function') {
                label = window.formatShortDate(day, lang || state.language);
                title = label;
            } else {
                label = day.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
                title = label;
            }
        }
        if (!bucketMap[key]) bucketMap[key] = { key, label, title, total: 0, count: 0 };
        bucketMap[key].total += parseFloat(r.price) || 0;
        bucketMap[key].count += 1;
    });

    const buckets = Object.values(bucketMap).sort((a, b) => a.key.localeCompare(b.key));
    return { buckets, mode };
}

/**
 * Auto-generated executive insights (client-side, no AI).
 * @param {object} kpis
 * @param {{ filtered: object[], range: object, paymentRequests?: object[] }} filters
 * @param {object} t
 * @returns {{ icon: string, text: string, tone: 'positive'|'neutral'|'warning' }[]}
 */
export function buildRevenueInsights(kpis, filters, t) {
    if (!kpis) return [];
    const insights = [];
    const currency = state.currentSchool?.currency || 'MXN';
    const { filtered = [], range, paymentRequests = [] } = filters || {};
    const collected = Number(kpis.collected) || 0;
    const pendingSum = Number(kpis.pendingSum) || 0;

    const prevRange = getPreviousRevenueRange(range);
    if (prevRange && paymentRequests.length) {
        const prevFiltered = filterPaymentsForRevenue(paymentRequests, prevRange);
        const prevCollected = sumPrices(prevFiltered.filter((r) => r.status === 'approved'));
        if (prevCollected > 0) {
            const pct = Math.round(((collected - prevCollected) / prevCollected) * 100);
            const sign = pct > 0 ? '+' : pct < 0 ? '−' : '';
            const tone = pct > 5 ? 'positive' : pct < -5 ? 'warning' : 'neutral';
            insights.push({
                icon: pct >= 0 ? 'trending-up' : 'trending-down',
                tone,
                text: (t.revenue_insight_mom || 'Collected revenue {sign}{pct}% vs the previous period ({prev}).')
                    .replace('{sign}', sign)
                    .replace('{pct}', String(Math.abs(pct)))
                    .replace('{prev}', formatPrice(prevCollected, currency))
            });
        } else if (collected > 0) {
            insights.push({
                icon: 'sparkles',
                tone: 'positive',
                text: t.revenue_insight_mom_new || 'First collected revenue in this comparison window — no prior period baseline.'
            });
        }
    }

    const top = (kpis.topPackages || [])[0];
    if (top && collected > 0) {
        const share = Math.round((top.total / collected) * 100);
        insights.push({
            icon: 'package',
            tone: share >= 50 ? 'neutral' : 'neutral',
            text: (t.revenue_insight_top_package || 'Top package “{name}” accounts for {pct}% of collected revenue ({amount}).')
                .replace('{name}', top.sub_name || '—')
                .replace('{pct}', String(share))
                .replace('{amount}', formatPrice(top.total, currency))
        });
    }

    const pipeline = collected + pendingSum;
    if (pipeline > 0 && pendingSum > 0) {
        const pendingPct = Math.round((pendingSum / pipeline) * 100);
        insights.push({
            icon: 'clock',
            tone: pendingPct >= 35 ? 'warning' : pendingPct >= 20 ? 'neutral' : 'positive',
            text: (t.revenue_insight_pending_risk || 'Pending payments are {pct}% of collected + pending ({amount}) — collection exposure.')
                .replace('{pct}', String(pendingPct))
                .replace('{amount}', formatPrice(pendingSum, currency))
        });
    }

    const mix = kpis.paymentMix || {};
    const methodTotal = (Number(mix.cash) || 0) + (Number(mix.transfer) || 0);
    if (methodTotal > 0) {
        const cashPct = mix.cashPct || 0;
        const transferPct = mix.transferPct || 0;
        if (cashPct !== transferPct) {
            const dominant = cashPct > transferPct ? (t.cash || 'Cash') : (t.transfer || 'Transfer');
            const domPct = Math.max(cashPct, transferPct);
            insights.push({
                icon: dominant === (t.cash || 'Cash') ? 'banknote' : 'landmark',
                tone: 'neutral',
                text: (t.revenue_insight_dominant_method || '{method} is the dominant payment method ({pct}% of approved volume).')
                    .replace('{method}', dominant)
                    .replace('{pct}', String(domPct))
            });
        }
    }

    const timeSeries = computeRevenueTimeSeries(filtered, range, state.language);
    const best = (timeSeries.buckets || []).reduce((a, b) => ((b.total || 0) > (a?.total || 0) ? b : a), null);
    if (best && best.total > 0) {
        const periodLabel = timeSeries.mode === 'month'
            ? (t.revenue_insight_best_month || 'month')
            : (t.revenue_insight_best_week || 'week');
        insights.push({
            icon: 'calendar-range',
            tone: 'positive',
            text: (t.revenue_insight_best_period || 'Best {period} in range: {label} with {amount} ({count} payments).')
                .replace('{period}', periodLabel)
                .replace('{label}', best.title || best.label || '—')
                .replace('{amount}', formatPrice(best.total, currency))
                .replace('{count}', String(best.count || 0))
        });
    }

    const rejected = filtered.filter((r) => r.status === 'rejected');
    const approvedN = filtered.filter((r) => r.status === 'approved').length;
    if (rejected.length > 0) {
        const decided = approvedN + rejected.length;
        const rate = decided > 0 ? Math.round((approvedN / decided) * 100) : 0;
        insights.push({
            icon: rate >= 80 ? 'badge-check' : 'alert-circle',
            tone: rate >= 80 ? 'positive' : 'warning',
            text: (t.revenue_insight_approval_rate || 'Approval rate {pct}% ({approved} approved, {rejected} rejected in period).')
                .replace('{pct}', String(rate))
                .replace('{approved}', String(approvedN))
                .replace('{rejected}', String(rejected.length))
        });
    }

    if (kpis.aurePendingSuelta != null && isAureSchool(state.currentSchool)) {
        const n = Number(kpis.aurePendingSuelta) || 0;
        insights.push({
            icon: 'user-plus',
            tone: n > 0 ? 'warning' : 'positive',
            text: n > 0
                ? (t.revenue_insight_aure_suelta || '{count} pending clase suelta registration(s) in this period — review before class day.')
                    .replace('{count}', String(n))
                : (t.revenue_insight_aure_suelta_none || 'No pending clase suelta registrations in this period.')
        });
    }

    return insights.slice(0, 6);
}

/**
 * Plain-language analyst narrative for the filtered period (no AI).
 * @returns {{ headline: string, paragraphs: string[] }}
 */
export function buildAnalystNarrative(kpis, filters, t) {
    const empty = { headline: '', paragraphs: [] };
    if (!kpis) return empty;

    const currency = state.currentSchool?.currency || 'MXN';
    const { filtered = [], range, paymentRequests = [] } = filters || {};
    const collected = Number(kpis.collected) || 0;
    const pendingSum = Number(kpis.pendingSum) || 0;
    const approvedN = Number(kpis.collectedCount) || 0;
    const paragraphs = [];

    const locale = getRevenueChartLocale(state.language);
    let periodLabel = t.revenue_narrative_period_all || 'this period';
    if (range && !range.allTime && range.dateStart && range.dateEnd) {
        const startStr = range.dateStart.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
        const endStr = range.dateEnd.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
        periodLabel = (t.revenue_narrative_period_range || '{start} – {end}')
            .replace('{start}', startStr)
            .replace('{end}', endStr);
    }

    let headline;
    if (collected <= 0 && pendingSum <= 0) {
        headline = t.revenue_narrative_headline_empty || 'No collected revenue in this period yet.';
        paragraphs.push(t.revenue_narrative_p_empty || 'Adjust the date range or approve pending payments to see trends here.');
        return { headline, paragraphs };
    }

    const prevRange = getPreviousRevenueRange(range);
    let prevCollected = 0;
    if (prevRange && paymentRequests.length) {
        const prevFiltered = filterPaymentsForRevenue(paymentRequests, prevRange);
        prevCollected = sumPrices(prevFiltered.filter((r) => r.status === 'approved'));
    }

    if (prevCollected > 0) {
        const pct = Math.round(((collected - prevCollected) / prevCollected) * 100);
        const signWord = pct > 0
            ? (t.revenue_narrative_up || 'up')
            : pct < 0
                ? (t.revenue_narrative_down || 'down')
                : (t.revenue_narrative_flat || 'unchanged');
        headline = (t.revenue_narrative_headline_mom || 'You collected {amount} in the period — {sign} {pct}% vs the previous period.')
            .replace('{amount}', formatPrice(collected, currency))
            .replace('{sign}', signWord)
            .replace('{pct}', String(Math.abs(pct)));
        paragraphs.push(
            (t.revenue_narrative_p_mom || 'Compared with the previous period ({prev}), net collected revenue moved {sign} {pct}%. That change is driven by how many payments were approved and their average size.')
                .replace('{prev}', formatPrice(prevCollected, currency))
                .replace('{sign}', signWord)
                .replace('{pct}', String(Math.abs(pct)))
        );
    } else if (collected > 0) {
        headline = (t.revenue_narrative_headline_first || 'You collected {amount} in the period — a new baseline for this window.')
            .replace('{amount}', formatPrice(collected, currency));
        paragraphs.push(t.revenue_narrative_p_first || 'There was little or no collected revenue in the immediately prior period, so month-over-month comparison is limited.');
    } else {
        headline = (t.revenue_narrative_headline_pending || '{amount} still pending in the period.')
            .replace('{amount}', formatPrice(pendingSum, currency));
    }

    if (approvedN > 0) {
        const avg = collected / approvedN;
        paragraphs.push(
            (t.revenue_narrative_p_ticket || 'Across {count} approved payments, the average ticket was {avg}. Use the monthly chart above to see whether volume or ticket size moved revenue.')
                .replace('{count}', String(approvedN))
                .replace('{avg}', formatPrice(avg, currency))
        );
    }

    if (pendingSum > 0) {
        const pipeline = collected + pendingSum;
        const pendingPct = pipeline > 0 ? Math.round((pendingSum / pipeline) * 100) : 0;
        paragraphs.push(
            (t.revenue_narrative_p_pending || 'You still have {amount} pending ({pct}% of collected + pending). Approving those payments will increase collected totals for {period}.')
                .replace('{amount}', formatPrice(pendingSum, currency))
                .replace('{pct}', String(pendingPct))
                .replace('{period}', periodLabel)
        );
    }

    const top = (kpis.topPackages || [])[0];
    if (top && collected > 0 && paragraphs.length < 3) {
        const share = Math.round((top.total / collected) * 100);
        paragraphs.push(
            (t.revenue_narrative_p_top || '“{name}” led sales with {share}% of collected revenue ({amount}).')
                .replace('{name}', top.sub_name || '—')
                .replace('{share}', String(share))
                .replace('{amount}', formatPrice(top.total, currency))
        );
    }

    return {
        headline,
        paragraphs: paragraphs.slice(0, 3)
    };
}
