import { escapeHtml } from '../config.js';
import { state } from '../state.js';
import { schoolHasDualGroupPrivateOffering } from '../utils.js';
import {
    buildAdminRevenueFilterHash,
    filterPaymentsForRevenue,
    getAdminRevenueDateRange
} from '../kpi/revenueKpis.js';
import {
    formatRevenueActivePeriodLabel,
    renderAdminRevenueFilterCard,
    renderAureRevenueAttributionInfoButton
} from '../kpi/revenueFiltersUi.js';
import {
    renderRevenueAnalyticsDashboard,
    renderRevenueAnalyticsSkeleton
} from '../kpi/revenueCharts.js';

function getRevenueSubsForFilters() {
    const settingsSchoolRev = (state.schools && state.currentSchool?.id && state.schools.find(s => s.id === state.currentSchool.id)) || state.currentSchool;
    const isPTRev = settingsSchoolRev?.profile_type === 'private_teacher';
    const hasDualRev = schoolHasDualGroupPrivateOffering(state.currentSchool, state.adminSettings);
    const hasEventsRev = state.currentSchool?.events_packages_enabled !== false && state.adminSettings?.events_offering_enabled === 'true';
    const hasPrivateInPlanRev = (s) => (s.limit_count_private != null && s.limit_count_private > 0);
    const hasEventsInPlanRev = (s) => (s.limit_count_events != null && s.limit_count_events > 0);
    let revenueSubs = (state.subscriptions || []).filter(s => {
        if (!hasEventsRev && hasEventsInPlanRev(s)) return false;
        if (!isPTRev && !hasDualRev && hasPrivateInPlanRev(s)) return false;
        return true;
    });
    const seenRevNames = new Set();
    revenueSubs = revenueSubs.filter(s => {
        const k = String(s.name || '').trim().toLowerCase();
        if (!k || seenRevNames.has(k)) return false;
        seenRevNames.add(k);
        return true;
    });
    let pkgFilter = state.adminRevenuePackageFilter;
    if (pkgFilter && !revenueSubs.some(s => String(s.name || '').trim() === String(pkgFilter).trim())) {
        state.adminRevenuePackageFilter = null;
        pkgFilter = null;
    }
    return { revenueSubs, pkgFilter };
}

export function renderAdminRevenueAnalytics(t) {
    const { revenueSubs, pkgFilter } = getRevenueSubsForFilters();
    const range = getAdminRevenueDateRange();
    const { defaultStart, defaultEnd } = range;
    const statusFilter = state.adminRevenueStatusFilter;
    const methodFilter = state.adminRevenueMethodFilter;
    const filtered = filterPaymentsForRevenue(state.paymentRequests || [], range);
    const loading = !!state.adminRevenueKpiLoading;
    const kpis = state.adminRevenueKpiResults;
    const err = state.adminRevenueKpiError;
    const filterChange = 'window.onAdminRevenueAnalyticsFilterChange()';
    const filtersExpanded = !!state.adminRevenueAnalyticsFiltersExpanded;
    const periodChip = escapeHtml(formatRevenueActivePeriodLabel(t, state.language));

    let body = '';
    if (loading) {
        body = renderRevenueAnalyticsSkeleton(t);
    } else if (err) {
        body = `
            <div class="rev-analytics-error" role="alert">
                <p>${escapeHtml(err)}</p>
                <button type="button" class="btn-secondary rev-analytics-retry" onclick="window.refreshAdminRevenueAnalytics(true)">
                    <i data-lucide="refresh-cw" size="16"></i> ${t.revenue_analytics_retry || 'Retry'}
                </button>
            </div>`;
    } else if (kpis) {
        body = renderRevenueAnalyticsDashboard(kpis, filtered, range, t, state.currentSchool?.currency || 'MXN');
    } else {
        body = renderRevenueAnalyticsSkeleton(t);
    }

    return `
        <div class="rev-analytics-page">
            <div class="ios-header rev-analytics-header" style="background: transparent;">
                <button type="button" class="rev-analytics-back" onclick="window.backToAdminRevenue()" aria-label="${t.revenue_analytics_back || 'Back'}">
                    <i data-lucide="chevron-left" size="22"></i>
                    <span>${t.revenue_analytics_back || 'Ganancias'}</span>
                </button>
                <div class="rev-analytics-title-row">
                    <div class="ios-large-title rev-analytics-title">${t.revenue_analytics_title || t.revenue_kpi_section_title || 'Indicators'}</div>
                    ${renderAureRevenueAttributionInfoButton(t)}
                </div>
                <p class="rev-analytics-subtitle">${t.revenue_analytics_subtitle || ''}</p>
            </div>

            <div class="rev-analytics-filters rev-analytics-filters-expandable ${filtersExpanded ? 'expanded' : ''}">
                <div class="revenue-filters-header rev-analytics-filters-header" onclick="toggleExpandableNoRender('revenueAnalyticsFilters')">
                    <span class="revenue-filters-header-label">${escapeHtml(t.filters_label || 'Filters')}</span>
                    <span class="rev-analytics-period-chip">${periodChip}</span>
                    <i data-lucide="chevron-down" size="18" class="expandable-chevron" aria-hidden="true"></i>
                </div>
                <div id="rev-analytics-filters-content" class="revenue-filters-content" style="display: ${filtersExpanded ? '' : 'none'};">
                    ${renderAdminRevenueFilterCard(t, {
                        defaultStart,
                        defaultEnd,
                        afterChange: filterChange,
                        revenueSubs,
                        pkgFilter,
                        statusFilter,
                        methodFilter,
                        paymentCount: filtered.length
                    })}
                    <p class="rev-filter-scope-note">${escapeHtml(t.revenue_filter_scope_note || '')}</p>
                </div>
            </div>

            <div class="rev-analytics-body">
                ${body}
            </div>
        </div>`;
}

export function shouldAutoLoadRevenueAnalytics() {
    if (state.currentView !== 'admin-revenue-analytics') return false;
    if (state.adminRevenueKpiLoading) return false;
    const hash = buildAdminRevenueFilterHash();
    const cached = state.adminRevenueKpiCache && state.adminRevenueKpiCache[hash];
    if (cached?.kpis) {
        state.adminRevenueKpiResults = cached.kpis;
        state.adminRevenueKpiError = null;
        return false;
    }
    return true;
}
