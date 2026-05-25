/**

 * Shared Ganancias / revenue analytics filter UI (month grid, Aure info popover).

 * Does not change revenue attribution logic.

 */

import { escapeHtml } from '../config.js';

import { state } from '../state.js';

import { isAureSchool } from './revenueKpis.js';



export function getRevenueFilterLocale(language) {

    if (language === 'es') return 'es-ES';

    if (language === 'de') return 'de-DE';

    return 'en-US';

}



function formatMonthChipLabel(year, month, locale) {

    const d = new Date(year, month, 1);

    return d.toLocaleDateString(locale, { month: 'short' });

}



function monthRangeIso(year, month) {

    const fmt = typeof window !== 'undefined' && typeof window.formatClassDate === 'function'

        ? window.formatClassDate.bind(window)

        : (d) => {

            const y = d.getFullYear();

            const m = String(d.getMonth() + 1).padStart(2, '0');

            const day = String(d.getDate()).padStart(2, '0');

            return `${y}-${m}-${day}`;

        };

    return {

        start: fmt(new Date(year, month, 1)),

        end: fmt(new Date(year, month + 1, 0))

    };

}



/** @returns {{ mode: 'allTime' } | { mode: 'month', year: number, month: number } | { mode: 'custom' }} */

export function getRevenueFilterSelection() {

    if (state.adminRevenueAllTime) return { mode: 'allTime' };



    const now = new Date();

    const start = state.adminRevenueDateStart;

    const end = state.adminRevenueDateEnd;



    if (!start && !end) {

        return { mode: 'month', year: now.getFullYear(), month: now.getMonth() };

    }



    if (start && end) {

        const dStart = new Date(start + 'T00:00:00');

        const dEnd = new Date(end + 'T00:00:00');

        if (!Number.isNaN(dStart.getTime()) && !Number.isNaN(dEnd.getTime())) {

            const y = dStart.getFullYear();

            const m = dStart.getMonth();

            const { start: expectedStart, end: expectedEnd } = monthRangeIso(y, m);

            if (

                start === expectedStart

                && end === expectedEnd

                && dStart.getMonth() === dEnd.getMonth()

                && dStart.getFullYear() === dEnd.getFullYear()

            ) {

                return { mode: 'month', year: y, month: m };

            }

        }

    }



    return { mode: 'custom' };

}



/** Calendar years shown in the period picker (previous + current). */

export function getRevenueFilterYears() {

    const endYear = new Date().getFullYear();

    return [endYear - 1, endYear];

}



/** Months 0..n available for selection in a given year (no future months). */

export function getSelectableMonthsForYear(year) {

    const now = new Date();

    if (year > now.getFullYear()) return [];

    const lastMonth = year === now.getFullYear() ? now.getMonth() : 11;

    const months = [];

    for (let m = 0; m <= lastMonth; m++) months.push(m);

    return months;

}



function resolveFilterViewYear(selection) {

    if (state.adminRevenueFilterViewYear != null) {

        return state.adminRevenueFilterViewYear;

    }

    if (selection.mode === 'month') return selection.year;

    if (selection.mode === 'custom' && state.adminRevenueDateStart) {

        const d = new Date(state.adminRevenueDateStart + 'T00:00:00');

        if (!Number.isNaN(d.getTime())) return d.getFullYear();

    }

    return new Date().getFullYear();

}



export function renderAureRevenueAttributionInfoButton(t, wrapClass = 'revenue-info-wrap') {

    if (!isAureSchool(state.currentSchool)) return '';

    const hint = escapeHtml(t.revenue_aure_attribution_hint || '');

    const label = escapeHtml(t.revenue_aure_attribution_info_label || t.revenue_aure_attribution_tooltip || 'Revenue attribution rules');

    return `

        <div class="${wrapClass}">

            <button

                type="button"

                class="revenue-info-btn"

                aria-label="${label}"

                aria-expanded="false"

                onclick="window.toggleRevenueAttributionPopover(event, this)"

            >

                <i data-lucide="info" size="16" aria-hidden="true"></i>

            </button>

            <div class="revenue-attribution-popover" role="dialog" aria-label="${label}" hidden>

                <p class="revenue-attribution-popover-text">${hint}</p>

                <button type="button" class="revenue-attribution-popover-close" onclick="window.closeRevenueAttributionPopover()">

                    ${escapeHtml(t.close || 'Close')}

                </button>

            </div>

        </div>`;

}



/**

 * @param {object} t — translations

 * @param {{ defaultStart: string, defaultEnd: string }} range

 * @param {string} [afterChange] — optional JS to run after updating state (e.g. analytics refresh)

 */

export function renderAdminRevenueDateFilters(t, range, afterChange = 'renderView()') {

    const { defaultStart, defaultEnd } = range;

    const locale = getRevenueFilterLocale(state.language);

    const selection = getRevenueFilterSelection();

    const now = new Date();

    const years = getRevenueFilterYears();

    const viewYear = resolveFilterViewYear(selection);

    const months = getSelectableMonthsForYear(viewYear);



    const thisMonthActive = selection.mode === 'month'

        && selection.year === now.getFullYear()

        && selection.month === now.getMonth();

    const allTimeActive = selection.mode === 'allTime';

    const customActive = selection.mode === 'custom';

    const customExpanded = customActive || !!state.adminRevenueCustomRangeExpanded;



    const yearTabs = years.map((year) => {

        const active = viewYear === year;

        return `<button

            type="button"

            class="revenue-year-tab${active ? ' revenue-year-tab-active' : ''}"

            aria-pressed="${active ? 'true' : 'false'}"

            onclick="state.adminRevenueFilterViewYear=${year}; ${afterChange}"

        >${escapeHtml(String(year))}</button>`;

    }).join('');



    const monthChips = months.map((month) => {

        const active = selection.mode === 'month' && selection.year === viewYear && selection.month === month;

        const isCurrent = viewYear === now.getFullYear() && month === now.getMonth();

        const label = formatMonthChipLabel(viewYear, month, locale);

        const { start, end } = monthRangeIso(viewYear, month);

        const classes = [

            'revenue-month-chip',

            active ? 'revenue-month-chip-active' : '',

            isCurrent ? 'revenue-month-chip-current' : ''

        ].filter(Boolean).join(' ');

        return `<button

            type="button"

            class="${classes}"

            aria-pressed="${active ? 'true' : 'false'}"

            aria-current="${isCurrent ? 'date' : 'false'}"

            onclick="state.adminRevenueFilterViewYear=null; state.adminRevenueAllTime=false; state.adminRevenueCustomRangeExpanded=false; state.adminRevenueDateStart='${start}'; state.adminRevenueDateEnd='${end}'; ${afterChange}"

        >${escapeHtml(label)}</button>`;

    }).join('');



    const thisMonthBtn = `<button

        type="button"

        class="revenue-period-pill${thisMonthActive ? ' revenue-period-pill-active' : ''}"

        aria-pressed="${thisMonthActive ? 'true' : 'false'}"

        onclick="state.adminRevenueFilterViewYear=null; state.adminRevenueAllTime=false; state.adminRevenueCustomRangeExpanded=false; const n=new Date(); state.adminRevenueDateStart=window.formatClassDate(new Date(n.getFullYear(),n.getMonth(),1)); state.adminRevenueDateEnd=window.formatClassDate(new Date(n.getFullYear(),n.getMonth()+1,0)); ${afterChange}"

    >${escapeHtml(t.filter_this_month || 'This Month')}</button>`;



    const allTimeBtn = `<button

        type="button"

        class="revenue-period-pill${allTimeActive ? ' revenue-period-pill-active' : ''}"

        aria-pressed="${allTimeActive ? 'true' : 'false'}"

        onclick="state.adminRevenueFilterViewYear=null; state.adminRevenueAllTime=true; state.adminRevenueCustomRangeExpanded=false; state.adminRevenueDateStart=null; state.adminRevenueDateEnd=null; ${afterChange}"

    >${escapeHtml(t.filter_all_time || 'All time')}</button>`;



    const customToggleLabel = escapeHtml(t.revenue_filter_custom_range || t.revenue_filter_custom_dates || 'Custom range');

    const customToggle = `<button

        type="button"

        class="revenue-custom-toggle${customExpanded ? ' revenue-custom-toggle-open' : ''}${customActive ? ' revenue-custom-toggle-active' : ''}"

        aria-expanded="${customExpanded ? 'true' : 'false'}"

        onclick="state.adminRevenueCustomRangeExpanded=!state.adminRevenueCustomRangeExpanded; ${afterChange}"

    >${customToggleLabel}</button>`;



    const periodLabel = escapeHtml(t.revenue_filter_period || t.revenue_filter_months || 'Period');

    const customPanel = customExpanded ? `

        <div class="revenue-date-custom-panel" id="revenue-date-custom-panel">

            <div class="revenue-date-custom-inputs">

                <input type="date" class="filter-control filter-control-secondary" id="revenue-date-start" value="${defaultStart}" aria-label="${escapeHtml(t.revenue_filter_date_start || 'Start')}" onchange="state.adminRevenueAllTime=false; state.adminRevenueDateStart=this.value||null; ${afterChange}">

                <span class="revenue-date-custom-sep" aria-hidden="true">–</span>

                <input type="date" class="filter-control filter-control-secondary" value="${defaultEnd}" aria-label="${escapeHtml(t.revenue_filter_date_end || 'End')}" onchange="state.adminRevenueAllTime=false; state.adminRevenueDateEnd=this.value||null; ${afterChange}">

            </div>

        </div>` : '';



    return `

        <div class="revenue-date-filters">

            <div class="revenue-period-label">${periodLabel}</div>

            <div class="revenue-period-toolbar">

                <div class="revenue-year-tabs" role="tablist" aria-label="${periodLabel}">

                    ${yearTabs}

                </div>

                <div class="revenue-period-quick">

                    ${thisMonthBtn}

                    ${allTimeBtn}

                </div>

            </div>

            <div class="revenue-month-grid" role="group" aria-label="${escapeHtml(t.revenue_filter_months || 'Month')}">

                ${monthChips}

            </div>

            <div class="revenue-custom-row">

                ${customToggle}

            </div>

            ${customPanel}

        </div>`;

}



/**

 * Package / status / method row + payment count (shared by Ganancias + analytics).

 */

export function renderAdminRevenueSecondaryFilters(t, {

    revenueSubs,

    pkgFilter,

    statusFilter,

    methodFilter,

    paymentCount,

    afterChange = 'renderView();'

}) {

    return `

        <div class="revenue-filters-secondary filter-bar">

            <span class="filter-select-wrap">

                <select class="filter-control" onchange="state.adminRevenuePackageFilter=this.value||null; ${afterChange}">

                    <option value="">${t.filter_all || 'All'} ${(t.filter_package_type || 'packages').toLowerCase()}</option>

                    ${revenueSubs.map(sub => `<option value="${(sub.name || '').replace(/"/g, '&quot;')}" ${String(pkgFilter || '').trim() === String(sub.name || '').trim() ? 'selected' : ''}>${(sub.name || '').replace(/</g, '&lt;')}</option>`).join('')}

                </select>

                <i data-lucide="chevron-down" size="18" class="filter-select-chevron"></i>

            </span>

            <span class="filter-select-wrap">

                <select class="filter-control" onchange="state.adminRevenueStatusFilter=this.value||null; ${afterChange}">

                    <option value="" ${!statusFilter ? 'selected' : ''}>${t.filter_all || 'All'} ${(t.filter_status || 'status').toLowerCase()}</option>

                    <option value="approved" ${statusFilter === 'approved' ? 'selected' : ''}>${t.approved}</option>

                    <option value="rejected" ${statusFilter === 'rejected' ? 'selected' : ''}>${t.rejected}</option>

                    <option value="pending" ${statusFilter === 'pending' ? 'selected' : ''}>${t.pending}</option>

                </select>

                <i data-lucide="chevron-down" size="18" class="filter-select-chevron"></i>

            </span>

            <span class="filter-select-wrap">

                <select class="filter-control" onchange="state.adminRevenueMethodFilter=this.value||null; ${afterChange}">

                    <option value="" ${!methodFilter ? 'selected' : ''}>${t.filter_all || 'All'} ${(t.filter_method || 'method').toLowerCase()}</option>

                    <option value="transfer" ${methodFilter === 'transfer' ? 'selected' : ''}>${t.transfer}</option>

                    <option value="cash" ${methodFilter === 'cash' ? 'selected' : ''}>${t.cash}</option>

                </select>

                <i data-lucide="chevron-down" size="18" class="filter-select-chevron"></i>

            </span>

            <span class="revenue-filter-count filter-count">${(t.filter_result_payments || '{count} payments').replace('{count}', paymentCount)}</span>

        </div>`;

}



/** Full filter card: period row + secondary filters (single source of truth). */

export function renderAdminRevenueFilterCard(t, {

    defaultStart,

    defaultEnd,

    afterChange,

    revenueSubs,

    pkgFilter,

    statusFilter,

    methodFilter,

    paymentCount

}) {

    return `

        <div class="revenue-filters-card">

            ${renderAdminRevenueDateFilters(t, { defaultStart, defaultEnd }, afterChange)}

            ${renderAdminRevenueSecondaryFilters(t, {

                revenueSubs,

                pkgFilter,

                statusFilter,

                methodFilter,

                paymentCount,

                afterChange

            })}

        </div>`;

}



let revenuePopoverDocListener = null;



export function closeRevenueAttributionPopover() {

    if (typeof document === 'undefined') return;

    document.querySelectorAll('.revenue-info-wrap .revenue-attribution-popover').forEach((el) => {

        el.hidden = true;

    });

    document.querySelectorAll('.revenue-info-btn[aria-expanded="true"]').forEach((btn) => {

        btn.setAttribute('aria-expanded', 'false');

    });

    if (revenuePopoverDocListener) {

        document.removeEventListener('click', revenuePopoverDocListener, true);

        revenuePopoverDocListener = null;

    }

}



export function toggleRevenueAttributionPopover(event, btn) {

    if (event) {

        event.preventDefault();

        event.stopPropagation();

    }

    const wrap = btn?.closest('.revenue-info-wrap');

    const popover = wrap?.querySelector('.revenue-attribution-popover');

    if (!popover) return;



    const isOpen = !popover.hidden;

    closeRevenueAttributionPopover();

    if (isOpen) return;



    popover.hidden = false;

    btn.setAttribute('aria-expanded', 'true');

    if (typeof window !== 'undefined' && typeof window.lucide !== 'undefined') {

        window.lucide.createIcons();

    }



    revenuePopoverDocListener = (e) => {

        if (wrap.contains(e.target)) return;

        closeRevenueAttributionPopover();

    };

    setTimeout(() => {

        if (revenuePopoverDocListener) {

            document.addEventListener('click', revenuePopoverDocListener, true);

        }

    }, 0);

}


