/**
 * Admin revenue analytics navigation, KPI load, and Chart.js mount (window handlers).
 */
import { state, saveState } from '../state.js';
import { fetchAdminRegistrationsForMonth, fetchSchoolKpiSummary } from '../data.js';
import { shouldAutoLoadRevenueAnalytics } from '../views/revenueAnalytics.js';
import {
    buildAdminRevenueFilterHash,
    computeRevenueKpisFromPayments,
    countAurePendingSueltaInRegs,
    filterPaymentsForRevenue,
    getAdminRevenueDateRange,
    isAureSchool,
    mergeRpcIntoRevenueKpis,
    monthStrForRevenueKpiRegistrations
} from './revenueKpis.js';
import { mountRevenueAnalyticsCharts, destroyRevenueAnalyticsCharts } from './revenueChartMount.js';
import { computeRollingMonthlyRevenueSeries, getRevenueHighlightMonthKey } from './revenueMonthlySeries.js';
import { computeStudentAnalyticsFallback } from './revenueStudentAnalytics.js';

function revenueAnalyticsErrorMessage() {
    const msg = typeof window !== 'undefined' && typeof window.t === 'function'
        ? window.t('revenue_kpi_error')
        : '';
    return msg && !String(msg).startsWith('[') ? msg : 'Could not load indicators.';
}

function mountChartsAfterAnalyticsRender() {
    if (state.currentView !== 'admin-revenue-analytics') return;
    if (state.adminRevenueKpiLoading || !state.adminRevenueKpiResults) return;

    const range = getAdminRevenueDateRange();
    const currency = state.currentSchool?.currency || 'MXN';
    const monthlySeries = computeRollingMonthlyRevenueSeries(state.paymentRequests || [], {
        monthCount: 13,
        lang: state.language,
        rangeEnd: range?.dateEnd,
        highlightMonthKey: getRevenueHighlightMonthKey(range)
    });
    const filterYear = range?.dateEnd?.getFullYear() || new Date().getFullYear();
    const showYtd = !range.allTime && (monthlySeries.monthsWithData || 0) >= 2;
    const t = typeof window !== 'undefined' && typeof window.t === 'function' ? window.t : (key) => key;

    requestAnimationFrame(() => {
        mountRevenueAnalyticsCharts(t, currency, monthlySeries, { showYtd, filterYear });
        if (typeof window !== 'undefined' && window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    });
}

async function refreshAdminRevenueAnalytics(forceRefresh = false) {
    if (state.currentView !== 'admin-revenue-analytics') return;

    const hash = buildAdminRevenueFilterHash();
    if (!forceRefresh) {
        const cached = state.adminRevenueKpiCache && state.adminRevenueKpiCache[hash];
        if (cached?.kpis) {
            state.adminRevenueKpiResults = cached.kpis;
            state.adminRevenueKpiError = null;
            state.adminRevenueKpiLoading = false;
            if (typeof window.renderView === 'function') window.renderView();
            return;
        }
    }

    if (state.adminRevenueKpiLoading) return;

    state.adminRevenueKpiLoading = true;
    state.adminRevenueKpiError = null;
    if (typeof window.renderView === 'function') window.renderView();

    try {
        const range = getAdminRevenueDateRange();
        const filtered = filterPaymentsForRevenue(state.paymentRequests || [], range);
        let kpis = computeRevenueKpisFromPayments(filtered);
        kpis.filteredCount = filtered.length;
        kpis.analyzedAt = new Date().toISOString();

        const schoolId = state.currentSchool?.id;
        const startDate = range.allTime ? null : (state.adminRevenueDateStart || null);
        const endDate = range.allTime ? null : (state.adminRevenueDateEnd || null);
        const aure = isAureSchool(state.currentSchool);

        const rpc = schoolId
            ? await fetchSchoolKpiSummary(schoolId, startDate, endDate, aure)
            : null;
        kpis = mergeRpcIntoRevenueKpis(kpis, rpc);

        if (!kpis.studentAnalytics) {
            const fallback = computeStudentAnalyticsFallback(filtered, range);
            if (fallback) kpis.studentAnalytics = fallback;
        }

        if (aure && kpis.aurePendingSuelta == null && schoolId) {
            const monthStr = monthStrForRevenueKpiRegistrations(range);
            const regs = await fetchAdminRegistrationsForMonth(schoolId, monthStr);
            kpis.aurePendingSuelta = countAurePendingSueltaInRegs(regs, range);
        }

        if (!state.adminRevenueKpiCache) state.adminRevenueKpiCache = {};
        state.adminRevenueKpiCache[hash] = { kpis, at: Date.now() };
        state.adminRevenueKpiResults = kpis;
        state.adminRevenueKpiError = null;
    } catch (e) {
        console.warn('refreshAdminRevenueAnalytics', e);
        state.adminRevenueKpiError = revenueAnalyticsErrorMessage();
        state.adminRevenueKpiResults = null;
    } finally {
        state.adminRevenueKpiLoading = false;
        if (typeof window.renderView === 'function') window.renderView();
    }
}

export function attachRevenueAnalyticsNav() {
    if (typeof window === 'undefined') return;

    window.openAdminRevenueAnalytics = () => {
        state.currentView = 'admin-revenue-analytics';
        saveState();
        if (typeof window.renderView === 'function') window.renderView();
        window.scrollTo(0, 0);
    };

    window.backToAdminRevenue = () => {
        destroyRevenueAnalyticsCharts();
        state.currentView = 'admin-revenue';
        saveState();
        if (typeof window.renderView === 'function') window.renderView();
        window.scrollTo(0, 0);
    };

    window.refreshAdminRevenueAnalytics = (force) => refreshAdminRevenueAnalytics(!!force);
    window.onAdminRevenueAnalyticsFilterChange = () => {
        saveState();
        refreshAdminRevenueAnalytics(true);
    };
}

export function afterRevenueAnalyticsRender(view, viewChanged) {
    if (view !== 'admin-revenue-analytics') {
        if (viewChanged) destroyRevenueAnalyticsCharts();
        return;
    }
    if (shouldAutoLoadRevenueAnalytics()) {
        refreshAdminRevenueAnalytics(false);
    } else {
        mountChartsAfterAnalyticsRender();
    }
}
