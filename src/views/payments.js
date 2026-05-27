import { escapeHtml } from '../config.js';
import { state } from '../state.js';
import { formatPrice, schoolHasDualGroupPrivateOffering } from '../utils.js';
import { getEffectiveBalances } from '../scanner.js';
import {
    aureRevenueMonthDiffersFromPaymentDate,
    formatRecognizedMonthShort,
    getRevenueRecognizedMonth
} from '../kpi/revenueAttribution.js';
import {
    filterPaymentsForRevenue,
    getAdminRevenueDateRange,
    isAureSchool,
    sumApprovedHistoricalRevenue
} from '../kpi/revenueKpis.js';
import {
    renderAdminRevenueFilterCard,
    renderAureRevenueAttributionInfoButton
} from '../kpi/revenueFiltersUi.js';

function formatMembershipDate(iso, locale) {
    const ts = iso ? Date.parse(iso) : NaN;
    return Number.isFinite(ts)
        ? new Date(ts).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
        : '—';
}

function aureLevelLabel(level, t) {
    const lev = (level || '').trim() || 'principiante';
    if (lev === 'avanzada') return t.aure_level_avanzada || 'Avanzada';
    return t.aure_level_principiante || 'Principiante';
}

export function renderAdminMemberships(t) {
    const pending = state.paymentRequests.filter(r => r.status === 'pending');
    const showAureLevel = isAureSchool(state.currentSchool);
    const latestApprovedByStudent = (state.paymentRequests || []).reduce((acc, r) => {
        if (r.status !== 'approved' || !r.student_id || !r.created_at) return acc;
        const key = String(r.student_id);
        const ts = Date.parse(r.created_at);
        if (!Number.isFinite(ts)) return acc;
        if (!acc[key] || ts > acc[key]) acc[key] = ts;
        return acc;
    }, {});
    return `
        <div class="ios-header" style="background: transparent;">
            <div class="ios-large-title">${t.nav_memberships}</div>
        </div>

        <div style="padding: 0 1.2rem; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">${t.pending_payments}</span>
            <button type="button" onclick="fetchAllData()" style="background: var(--system-gray6); border: none; border-radius: 10px; padding: 8px 12px; font-size: 12px; font-weight: 600; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 6px;" title="${t.refresh_btn}">
                <i data-lucide="refresh-cw" size="14"></i> ${t.refresh_btn}
            </button>
        </div>
        <div class="ios-list">
            ${pending.length > 0 ? pending.map(req => {
        const studentName = req.external_student_name || (req.students && req.students.name) || (state.students.find(s => s.id === req.student_id)?.name) || t.unknown_student;
        const student = req.student_id ? (state.students || []).find(s => String(s.id) === String(req.student_id)) : null;
        const isPtSchool = state.currentSchool?.profile_type === 'private_teacher';
        const hasDualScanMode = schoolHasDualGroupPrivateOffering(state.currentSchool, state.adminSettings);
        const effective = student ? getEffectiveBalances(student, new Date()) : null;
        const currentClasses = effective
            ? (isPtSchool && !hasDualScanMode ? String(effective.private ?? 0) : (effective.groupUnlimited ? '∞' : String(effective.group ?? 0)))
            : '—';
        const latestApprovedTs = req.student_id ? latestApprovedByStudent[String(req.student_id)] : null;
        const appLocale = state.language === 'es' ? 'es-ES' : (state.language === 'de' ? 'de-DE' : 'en-US');
        const requestDate = formatMembershipDate(req.created_at, appLocale);
        const lastApprovedDate = latestApprovedTs
            ? formatMembershipDate(new Date(latestApprovedTs).toISOString(), appLocale)
            : (t.memberships_never_approved || 'Never');
        const levelBadgeHtml = showAureLevel && student
            ? `<div style="font-size: 10px; background: rgba(48, 176, 199, 0.15); padding: 2px 8px; border-radius: 6px; color: var(--system-teal, #30b0c7); font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 4px;">
                                        ${escapeHtml(aureLevelLabel(student.level, t))}
                                    </div>`
            : '';
        const payActionId = state.paymentRequestActionId;
        const payActionStatus = state.paymentRequestActionStatus;
        const isThisProcessing = payActionId === req.id;
        const isApproving = isThisProcessing && payActionStatus === 'approved';
        const isRejecting = isThisProcessing && payActionStatus === 'rejected';
        const payLoading = isApproving || isRejecting;
        return `
                    <div class="ios-list-item ${payLoading ? 'admin-reg-request-card-loading' : ''}" style="flex-direction: column; align-items: stretch; gap: 14px; padding: 20px;">
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <div style="width: 40px; height: 40px; background: var(--system-gray6); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--text-secondary);">
                                ${escapeHtml(studentName).charAt(0).toUpperCase()}
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; font-size: 17px;">${escapeHtml(studentName)}</div>
                                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                    <div style="font-size: 13px; color: var(--text-secondary);">${escapeHtml(req.sub_name)} • ${formatPrice(req.price, state.currentSchool?.currency || 'MXN')}</div>
                                    <div style="font-size: 10px; background: var(--system-gray6); padding: 2px 8px; border-radius: 6px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 4px;">
                                        <i data-lucide="${req.payment_method === 'cash' ? 'banknote' : 'send'}" size="10"></i> ${t[req.payment_method] || req.payment_method}
                                    </div>
                                    ${levelBadgeHtml}
                                </div>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; background: var(--system-gray6); border-radius: 10px; padding: 10px 12px;">
                            <div style="min-width: 0;">
                                <div style="font-size: 10px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">${t.memberships_current_classes || 'Current classes'}</div>
                                <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${currentClasses}</div>
                            </div>
                            <div style="min-width: 0;">
                                <div style="font-size: 10px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">${t.memberships_requested_date || 'Requested'}</div>
                                <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${requestDate}</div>
                            </div>
                            <div style="min-width: 0;">
                                <div style="font-size: 10px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">${t.memberships_last_approved_date || 'Last approved'}</div>
                                <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${lastApprovedDate}</div>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            ${payLoading ? `<span class="admin-reg-request-loading" style="grid-column: 1 / -1; display: flex; align-items: center; justify-content: center; gap: 8px;"><i data-lucide="loader-2" size="16" class="spin"></i> ${isApproving ? (t.aure_accepting || 'Accepting…') : (t.aure_rejecting || 'Rejecting…')}</span>` : `
                            <button class="btn-secondary" onclick="processPaymentRequest(${req.id}, 'rejected')" style="background: rgba(255, 59, 48, 0.1); color: var(--system-red); border-radius: 12px; border: none; font-size: 14px; min-height: 48px; display: flex; align-items: center; justify-content: center; width: 100%;">
                                ${t.reject}
                            </button>
                            <button class="btn-primary" onclick="processPaymentRequest(${req.id}, 'approved')" style="background: var(--system-green); color: white; border-radius: 12px; border: none; font-size: 14px; min-height: 48px; display: flex; align-items: center; justify-content: center; width: 100%;">
                                ${t.approve}
                            </button>`}
                        </div>
                    </div>
                `;
    }).join('') : `<div class="ios-list-item" style="color: var(--text-secondary); text-align: center; justify-content: center; padding: 2.5rem; flex-direction: column; gap: 12px;">
                <i data-lucide="check-circle" size="32" style="opacity: 0.2;"></i>
                <span style="font-size: 15px; font-weight: 500; opacity: 0.6;">${t.no_pending_msg}</span>
            </div>`}
        </div>
    `;
}

export function renderAdminRevenue(t) {
    const allTime = !!state.adminRevenueAllTime;
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
    const range = getAdminRevenueDateRange();
    const { defaultStart, defaultEnd, dateStart, dateEnd } = range;
    const statusFilter = state.adminRevenueStatusFilter;
    const methodFilter = state.adminRevenueMethodFilter;

    let filteredPayments = filterPaymentsForRevenue(state.paymentRequests || [], range);
    filteredPayments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const periodTotal = filteredPayments.filter(r => r.status === 'approved').reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0);
    const totalHistorical = sumApprovedHistoricalRevenue(
        state.paymentRequests || [],
        state.currentSchool,
        state.subscriptions || []
    );
    const showAureBadges = isAureSchool(state.currentSchool);
    const isCurrentMonth = !allTime && !state.adminRevenueDateStart && !state.adminRevenueDateEnd;
    const revenueSummaryTitle = allTime
        ? (t.revenue_total_all_time || 'All-time total')
        : (isCurrentMonth && !pkgFilter ? (t.monthly_total || 'This Month Total') : (t.period_total || 'Total for period'));

    const aureAttributionInfo = renderAureRevenueAttributionInfoButton(t);

    return `
        <div class="ios-header admin-revenue-header" style="background: transparent;">
            <div class="admin-revenue-header-row" style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <div class="admin-revenue-title-wrap">
                    <div class="ios-large-title">${t.nav_revenue}</div>
                    ${aureAttributionInfo}
                </div>
                <button
                    type="button"
                    class="btn-primary admin-revenue-add-btn"
                    onclick="window.openManualPaymentModal()"
                    style="padding: 0.55rem 1.1rem; font-size: 13px; font-weight: 650; border-radius: 999px; display: inline-flex; align-items: center; gap: 6px; box-shadow: var(--shadow-sm); white-space: nowrap;"
                >
                    <i data-lucide="plus" size="16"></i>
                    <span>${t.add_manual_payment || 'Add manual payment'}</span>
                </button>
            </div>
        </div>

        <div class="revenue-filters-expandable ${state.adminRevenueFiltersExpanded ? 'expanded' : ''}">
            <div class="revenue-filters-header" onclick="toggleExpandableNoRender('revenueFilters')">
                <span class="revenue-filters-header-label">${t.filters_label || 'Filters'}</span>
                <i data-lucide="chevron-down" size="18" class="expandable-chevron" aria-hidden="true"></i>
            </div>
            <div id="revenue-filters-content" class="revenue-filters-content" style="display: ${state.adminRevenueFiltersExpanded ? '' : 'none'};">
                ${renderAdminRevenueFilterCard(t, {
                    defaultStart,
                    defaultEnd,
                    afterChange: 'renderView();',
                    revenueSubs,
                    pkgFilter,
                    statusFilter,
                    methodFilter,
                    paymentCount: filteredPayments.length
                })}
            </div>
        </div>

        <div class="admin-revenue-page">
        <div class="admin-revenue-summary-wrap" style="padding: 0 1.2rem; margin-bottom: 2rem;">
            <div class="admin-revenue-summary-card" style="background: var(--text-primary); padding: 2rem; border-radius: 24px; color: var(--bg-body); box-shadow: 0 15px 35px rgba(0,0,0,0.15); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; width: 120px; height: 120px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
                <div style="opacity: 0.7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.8rem;">${revenueSummaryTitle}</div>
                <div class="admin-revenue-summary-total" style="font-size: 48px; font-weight: 800; letter-spacing: -2px; margin-bottom: 1.5rem;">${formatPrice(periodTotal, state.currentSchool?.currency || 'MXN')}</div>

                <div style="display: flex; flex-direction: column; gap: 6px; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="bar-chart-3" size="14" style="opacity: 0.6;"></i>
                        <span style="font-size: 13px; font-weight: 500; opacity: 0.8;">${t.historical_total_label}: ${formatPrice(totalHistorical, state.currentSchool?.currency || 'MXN')} </span>
                    </div>
                    ${showAureBadges && t.revenue_historical_attribution_hint ? `<span style="font-size: 11px; font-weight: 500; opacity: 0.55; line-height: 1.35;">${escapeHtml(t.revenue_historical_attribution_hint)}</span>` : ''}
                </div>
            </div>
        </div>

        <div class="admin-revenue-analytics-cta-wrap" style="padding: 0 1.2rem; margin-bottom: 1.5rem;">
            <button
                type="button"
                class="admin-revenue-analytics-cta"
                onclick="window.openAdminRevenueAnalytics()"
            >
                <span class="admin-revenue-analytics-cta-icon"><i data-lucide="line-chart" size="22"></i></span>
                <span class="admin-revenue-analytics-cta-text">
                    <span class="admin-revenue-analytics-cta-title">${t.revenue_analytics_cta || 'View indicators dashboard'}</span>
                    <span class="admin-revenue-analytics-cta-desc">${t.revenue_analytics_cta_desc || ''}</span>
                </span>
                <i data-lucide="chevron-right" size="20" class="admin-revenue-analytics-cta-chevron"></i>
            </button>
        </div>

        <div class="admin-revenue-list-label" style="padding: 0 1.2rem; margin-bottom: 0.5rem; text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary);">
            ${t.all_payments}
        </div>
        <div class="ios-list admin-revenue-list">
            ${state.loading && state.paymentRequests.length === 0 ? `
                <div style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                    <div class="spin" style="margin-bottom: 1rem; color: var(--system-blue);"><i data-lucide="loader-2" size="32"></i></div>
                    <p style="font-size: 15px; font-weight: 500;">${t.loading || 'Loading...'}</p>
                </div>
            ` : (filteredPayments.length > 0 ? filteredPayments.map(req => {
        const studentName = req.external_student_name || (req.students && req.students.name) || (state.students.find(s => s.id === req.student_id)?.name) || t.unknown_student;
        const statusColor = req.status === 'approved' ? 'var(--system-green)' : (req.status === 'rejected' ? 'var(--system-red)' : 'var(--system-blue)');
        const statusLabel = t[req.status] || req.status;
        const recMonth = showAureBadges
            ? getRevenueRecognizedMonth(req, state.subscriptions || [], state.currentSchool)
            : null;
        const accountingShort = recMonth ? formatRecognizedMonthShort(recMonth, state.language) : '';
        const accountingShifted = showAureBadges
            && aureRevenueMonthDiffersFromPaymentDate(req, state.subscriptions || [], state.currentSchool);
        const accountingBadge = accountingShort
            ? `<span class="admin-revenue-accounting-badge${accountingShifted ? ' admin-revenue-accounting-badge-shifted' : ''}" title="${escapeHtml(t.revenue_accounting_badge_tooltip || '')}">${escapeHtml((t.revenue_accounting_badge || 'Contab. {month}').replace('{month}', accountingShort))}</span>`
            : '';
        return `
                    <div class="ios-list-item admin-revenue-item" style="padding: 16px; align-items: center;">
                        <div class="admin-revenue-item-main" style="flex: 1;">
                            <div class="admin-revenue-item-name" style="font-weight: 600; font-size: 17px; margin-bottom: 4px;">${escapeHtml(studentName)}</div>
                            <div class="admin-revenue-item-meta" style="font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                ${escapeHtml(req.sub_name)} • ${new Date(req.created_at).toLocaleDateString()}
                                <span style="font-size: 9px; opacity: 0.6; text-transform: uppercase; font-weight: 700; background: var(--system-gray6); padding: 1px 6px; border-radius: 4px;">${t[req.payment_method] || req.payment_method}</span>
                                ${accountingBadge}
                            </div>
                        </div>
                        <div class="admin-revenue-item-amount-wrap" style="text-align: right; margin-right: 12px;">
                            <div class="admin-revenue-item-amount" style="font-weight: 700; font-size: 17px; margin-bottom: 4px;">${formatPrice(req.price, state.currentSchool?.currency || 'MXN')}</div>
                            <div style="font-size: 10px; font-weight: 800; color: ${statusColor}; text-transform: uppercase; letter-spacing: 0.02em;">${statusLabel}</div>
                        </div>
                        <button onclick="window.removePaymentRequest('${req.id}')" style="background: none; border: none; color: var(--system-red); padding: 8px; opacity: 0.6;" title="${t.delete_payment_confirm || 'Delete'}">
                            <i data-lucide="trash-2" size="18"></i>
                        </button>
                    </div>
                `;
    }).join('') : `<div class="ios-list-item" style="color: var(--text-secondary); text-align: center; justify-content: center; padding: 2rem;">${t.no_data_msg}</div>`)}
        </div>
        </div>
    `;
}
