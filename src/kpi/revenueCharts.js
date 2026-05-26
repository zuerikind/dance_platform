/**
 * SVG/HTML chart builders and dashboard layout for admin revenue analytics.
 */
import { escapeHtml } from '../config.js';
import { state } from '../state.js';
import { formatPrice } from '../utils.js';
import {
    buildAnalystNarrative,
    buildRevenueInsights,
    computeRevenueTimeSeries,
    filterPaymentsForRevenue,
    getPreviousRevenueRange,
    getRevenueChartLocale
} from './revenueKpis.js';
import {
    computeRollingMonthlyRevenueSeries,
    getRevenueHighlightMonthKey
} from './revenueMonthlySeries.js';
import {
    renderRevenueStudentAnalyticsSection,
    renderStudentRosterSnapshot
} from './revenueStudentAnalytics.js';

const CHART_ACCENT = 'var(--accent, #4c2f3c)';
const CHART_ACCENT_SOFT = 'color-mix(in srgb, var(--accent, #4c2f3c) 72%, var(--text-secondary))';
const CHART_CASH = 'var(--system-green, #34c759)';
const CHART_TRANSFER = 'var(--system-blue, #007aff)';
const CHART_MUTED = 'var(--text-secondary, #636366)';
const CHART_AXIS = 'color-mix(in srgb, var(--text-primary) 55%, var(--text-secondary))';

function escapeSvgText(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function chartEmptyMessage(t) {
    return escapeHtml(t.revenue_chart_no_data || t.no_data_msg || 'No data for this period');
}

function formatDeltaPct(pct) {
    if (pct == null || Number.isNaN(Number(pct))) return null;
    const n = Math.round(Number(pct));
    if (!Number.isFinite(n)) return null;
    if (n === 0) return { sign: '', abs: 0, tone: 'neutral' };
    return { sign: n > 0 ? '+' : '−', abs: Math.abs(n), tone: n > 0 ? 'positive' : 'warning' };
}

function buildSparklineSvg(values, opts = {}) {
    const w = opts.w ?? 92;
    const h = opts.h ?? 28;
    const pad = opts.pad ?? 2.5;
    const stroke = opts.stroke ?? 'color-mix(in srgb, var(--accent, #4c2f3c) 70%, var(--text-secondary))';
    const fill = opts.fill ?? 'color-mix(in srgb, var(--accent, #4c2f3c) 18%, transparent)';
    const v = Array.isArray(values) ? values.map((x) => Number(x) || 0) : [];
    if (v.length < 2) {
        return `<svg class="rev-spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"></svg>`;
    }
    const min = Math.min(...v);
    const max = Math.max(...v);
    const span = Math.max(1e-9, max - min);
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;
    const step = innerW / (v.length - 1);
    const pts = v.map((val, i) => {
        const x = pad + i * step;
        const y = pad + (1 - (val - min) / span) * innerH;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
    const area = `${pad},${h - pad} ${pts} ${w - pad},${h - pad}`;
    return `<svg class="rev-spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
        <polygon points="${area}" fill="${fill}"></polygon>
        <polyline points="${pts}" fill="none" stroke="${stroke}" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"></polyline>
    </svg>`;
}

function computePeriodComparison(kpis, range) {
    const out = {
        collectedDelta: null,
        collectedPrev: null,
        approvedDelta: null,
        approvedPrev: null,
        pendingPctOfTotal: null
    };
    if (!kpis || !range || range.allTime) return out;
    const prevRange = getPreviousRevenueRange(range);
    if (!prevRange || !Array.isArray(state.paymentRequests) || !state.paymentRequests.length) return out;

    const prevFiltered = filterPaymentsForRevenue(state.paymentRequests, prevRange);
    const prevApproved = prevFiltered.filter((r) => r.status === 'approved');
    const prevCollected = prevApproved.reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0);
    const prevCount = prevApproved.length;

    const collected = Number(kpis.collected) || 0;
    const approvedCount = Number(kpis.collectedCount) || 0;

    out.collectedPrev = prevCollected;
    out.approvedPrev = prevCount;
    out.collectedDelta = prevCollected > 0 ? ((collected - prevCollected) / prevCollected) * 100 : null;
    out.approvedDelta = prevCount > 0 ? ((approvedCount - prevCount) / prevCount) * 100 : null;

    const pendingSum = Number(kpis.pendingSum) || 0;
    const denom = collected + pendingSum;
    out.pendingPctOfTotal = denom > 0 ? Math.round((pendingSum / denom) * 100) : null;
    return out;
}

function deltaPill(tone, text) {
    if (!text) return '';
    return `<span class="rev-delta rev-delta--${tone}">${escapeHtml(text)}</span>`;
}

function buildPeriodDeltaTexts(compare, t) {
    const vsPrev = t.revenue_vs_previous_period || 'vs previous period';
    const collectedDelta = formatDeltaPct(compare?.collectedDelta);
    const approvedDelta = formatDeltaPct(compare?.approvedDelta);
    const collectedDeltaText = collectedDelta
        ? `${collectedDelta.sign}${collectedDelta.abs}% ${vsPrev}`
        : (compare?.collectedPrev != null && compare.collectedPrev <= 0
            ? (t.revenue_no_prior_baseline || 'no prior baseline')
            : '');
    const approvedDeltaText = approvedDelta ? `${approvedDelta.sign}${approvedDelta.abs}% ${vsPrev}` : '';
    return { collectedDelta, approvedDelta, collectedDeltaText, approvedDeltaText };
}

function renderMetricCard({ icon, label, value, meta, deltaTone, deltaText, valueClass = '' }) {
    return `
        <div class="rev-metric-card">
            <span class="rev-metric-icon" aria-hidden="true"><i data-lucide="${escapeHtml(icon)}" size="20"></i></span>
            <div class="rev-metric-label">${escapeHtml(label)}</div>
            <div class="rev-metric-value${valueClass ? ` ${valueClass}` : ''}">${value}</div>
            ${meta || deltaText ? `<div class="rev-metric-meta">${meta ? `<span>${meta}</span>` : ''}${deltaPill(deltaTone || 'neutral', deltaText)}</div>` : ''}
        </div>`;
}

function renderAtAGlanceMetrics(kpis, compare, analytics, currency, t) {
    if (!kpis) return '';
    const { collectedDelta, approvedDelta, collectedDeltaText, approvedDeltaText } = buildPeriodDeltaTexts(compare, t);
    const pendingPct = compare?.pendingPctOfTotal;
    const pendingTone = pendingPct != null && pendingPct >= 35 ? 'warning' : 'neutral';
    const studentTotal = analytics?.byLevel?.total ?? 0;

    const cards = [
        renderMetricCard({
            icon: 'wallet',
            label: t.revenue_kpi_collected || 'Collected',
            value: escapeHtml(formatPrice(kpis.collected, currency)),
            meta: escapeHtml((t.revenue_kpi_approved_count || '{count} approved').replace('{count}', String(kpis.collectedCount || 0))),
            deltaTone: collectedDelta?.tone || 'neutral',
            deltaText: collectedDeltaText
        }),
        renderMetricCard({
            icon: 'clock',
            label: t.revenue_kpi_pending || 'To collect',
            value: escapeHtml(formatPrice(kpis.pendingSum, currency)),
            meta: escapeHtml((t.revenue_kpi_pending_count || '{count} pending').replace('{count}', String(kpis.pendingCount || 0))),
            deltaTone: pendingTone,
            deltaText: pendingPct != null ? `${pendingPct}% ${t.revenue_pending_of_total || 'of total in scope'}` : '',
            valueClass: 'rev-metric-value-warn'
        }),
        renderMetricCard({
            icon: 'users',
            label: t.revenue_student_total || 'Students',
            value: escapeHtml(String(studentTotal)),
            meta: escapeHtml(t.revenue_student_total_hint || 'On roster')
        }),
        renderMetricCard({
            icon: 'receipt',
            label: t.revenue_kpi_avg_ticket || 'Avg ticket',
            value: escapeHtml(formatPrice(kpis.avgTicket, currency)),
            meta: escapeHtml(t.revenue_kpi_avg_ticket_hint || '')
        }),
        renderMetricCard({
            icon: 'bar-chart-2',
            label: t.revenue_kpi_volume || t.revenue_chart_volume_title || 'Payment volume',
            value: escapeHtml(String(kpis.collectedCount || 0)),
            meta: escapeHtml(t.revenue_kpi_approved_only || 'approved payments'),
            deltaTone: approvedDelta?.tone || 'neutral',
            deltaText: approvedDeltaText
        })
    ];

    if (kpis.aurePendingSuelta != null) {
        cards.push(renderMetricCard({
            icon: 'calendar-clock',
            label: t.revenue_kpi_aure_pending_suelta || 'Pending clase suelta',
            value: escapeHtml(String(kpis.aurePendingSuelta ?? 0)),
            meta: escapeHtml(t.revenue_kpi_aure_pending_suelta_hint || '')
        }));
    }

    return `
        <section class="rev-zone-at-a-glance" aria-labelledby="rev-at-a-glance-heading">
            <h2 id="rev-at-a-glance-heading" class="rev-zone-heading">${escapeHtml(t.revenue_zone_at_a_glance || 'At a glance')}</h2>
            <div class="rev-at-a-glance">${cards.join('')}</div>
        </section>`;
}

function renderRevenuePeriodSnapshot(kpis, compare, monthlySeries, narrativeHeadline, t, currency) {
    if (!kpis) return '';
    const sparkVals = (monthlySeries?.buckets || []).map((b) => Number(b.collected) || 0).slice(-12);
    const spark = buildSparklineSvg(sparkVals, { w: 120, h: 32 });
    const { collectedDelta, collectedDeltaText } = buildPeriodDeltaTexts(compare, t);
    const momPill = collectedDelta && collectedDelta.abs > 0
        ? deltaPill(collectedDelta.tone, `${collectedDelta.sign}${collectedDelta.abs}%`)
        : (collectedDelta && collectedDelta.abs === 0
            ? deltaPill('neutral', t.revenue_narrative_flat || 'unchanged')
            : '');

    const insightLine = narrativeHeadline
        ? `<p class="rev-snapshot-insight">${escapeHtml(narrativeHeadline)}</p>`
        : '';

    return `
        <section class="rev-snapshot-card rev-revenue-snapshot" aria-labelledby="rev-revenue-snapshot-heading">
            <div class="rev-snapshot-card-head">
                <h2 id="rev-revenue-snapshot-heading" class="rev-snapshot-title">${escapeHtml(t.revenue_snapshot_revenue_title || 'Revenue this period')}</h2>
                <p class="rev-snapshot-sub">${escapeHtml(t.revenue_snapshot_revenue_sub || 'Collected for your selected filters')}</p>
            </div>
            <div class="rev-revenue-snapshot-row">
                <div class="rev-revenue-snapshot-main">
                    <div class="rev-revenue-snapshot-amount">${escapeHtml(formatPrice(kpis.collected, currency))}</div>
                    <div class="rev-revenue-snapshot-pills">
                        ${momPill}
                        ${!collectedDelta && collectedDeltaText ? deltaPill('neutral', collectedDeltaText) : ''}
                    </div>
                </div>
                <div class="rev-revenue-snapshot-spark" aria-hidden="true">${spark}</div>
            </div>
            ${insightLine}
            <a class="rev-snapshot-jump" href="#rev-deep-dive">${escapeHtml(t.revenue_scroll_to_charts || 'View detailed charts')}</a>
        </section>`;
}

function renderZoneDivider(t) {
    return `
        <div id="rev-deep-dive" class="rev-zone-divider" role="separator" aria-label="${escapeHtml(t.revenue_zone_deep_dive || 'Detailed analysis')}">
            <span class="rev-zone-divider-text">${escapeHtml(t.revenue_zone_deep_dive || 'Detailed analysis')}</span>
        </div>`;
}

export function buildPaymentMixDonutSvg(mix, t, size = 200) {
    const cash = Number(mix?.cash) || 0;
    const transfer = Number(mix?.transfer) || 0;
    const total = cash + transfer;
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.34;
    const stroke = size * 0.13;
    const circ = 2 * Math.PI * r;
    const emptyLabel = escapeSvgText(t.revenue_chart_mix_empty || '—');

    if (total <= 0) {
        return `<svg class="rev-chart-donut" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--system-gray6)" stroke-width="${stroke}"/>
            <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="${CHART_MUTED}" font-size="13" font-weight="600">${emptyLabel}</text>
        </svg>`;
    }

    const cashLen = (cash / total) * circ;
    const cashPct = Math.round((cash / total) * 100);
    const transferPct = 100 - cashPct;
    const centerLabel = cashPct >= transferPct ? (t.cash || 'Cash') : (t.transfer || 'Transfer');
    const centerPct = Math.max(cashPct, transferPct);

    return `<svg class="rev-chart-donut" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${escapeSvgText(centerLabel)} ${centerPct}%">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--system-gray6)" stroke-width="${stroke}" opacity="0.4"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${CHART_CASH}" stroke-width="${stroke}"
            stroke-dasharray="${cashLen} ${circ - cashLen}" stroke-dashoffset="${circ * 0.25}" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${CHART_TRANSFER}" stroke-width="${stroke}"
            stroke-dasharray="${circ - cashLen} ${cashLen}" stroke-dashoffset="${circ * 0.25 - cashLen}" stroke-linecap="round"/>
        <text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="var(--text-primary)" font-size="11" font-weight="700">${escapeSvgText(centerLabel)}</text>
        <text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="var(--text-primary)" font-size="20" font-weight="800">${centerPct}%</text>
    </svg>`;
}

export function buildPaymentMixLegendHtml(mix, currency, t) {
    const cash = Number(mix?.cash) || 0;
    const transfer = Number(mix?.transfer) || 0;
    const total = cash + transfer;
    if (total <= 0) {
        return `<p class="rev-mix-legend-empty">${chartEmptyMessage(t)}</p>`;
    }
    const items = [
        { key: 'cash', label: t.cash || 'Cash', amount: cash, pct: mix.cashPct || 0, dotClass: 'cash' },
        { key: 'transfer', label: t.transfer || 'Transfer', amount: transfer, pct: mix.transferPct || 0, dotClass: 'transfer' }
    ];
    return `<div class="rev-mix-legend" role="list">
        ${items.map((item) => `
            <div class="rev-mix-legend-item" role="listitem">
                <span class="rev-mix-dot ${item.dotClass}" aria-hidden="true"></span>
                <span class="rev-mix-legend-text">
                    <span class="rev-mix-legend-name">${escapeHtml(item.label)}</span>
                    <span class="rev-mix-legend-detail">${escapeHtml(formatPrice(item.amount, currency))} · ${item.pct}%</span>
                </span>
            </div>`).join('')}
    </div>`;
}

export function buildHorizontalBarChartHtml(items, currency, t, opts = {}) {
    const maxBars = opts.maxBars ?? 8;
    const rows = (items || []).slice(0, maxBars);
    const maxVal = Math.max(...rows.map((r) => Number(r.total) || 0), 1);

    if (!rows.length) {
        return `<div class="rev-chart-empty" role="status">${chartEmptyMessage(t)}</div>`;
    }

    return `<div class="rev-hbar-list" role="list">
        ${rows.map((row) => {
            const val = Number(row.total) || 0;
            const pct = Math.round((val / maxVal) * 100);
            const name = escapeHtml((row.sub_name || '—').trim());
            const amt = escapeHtml(formatPrice(val, currency));
            const title = `${(row.sub_name || '—').trim()} — ${formatPrice(val, currency)}`;
            return `
            <div class="rev-hbar-row" role="listitem" title="${escapeHtml(title)}">
                <div class="rev-hbar-label" title="${escapeHtml(title)}">${name}</div>
                <div class="rev-hbar-track-wrap">
                    <div class="rev-hbar-track">
                        <div class="rev-hbar-fill" style="width:${pct}%"></div>
                    </div>
                    <span class="rev-hbar-value">${amt}</span>
                </div>
            </div>`;
        }).join('')}
    </div>`;
}

export function buildTimeSeriesBarSvg(series, currency, t) {
    const buckets = series?.buckets || [];
    const w = 360;
    const chartH = 132;
    const padB = 36;
    const padT = 28;
    const h = chartH + padB + padT;
    const emptyMsg = chartEmptyMessage(t);

    if (!buckets.length) {
        return `<div class="rev-chart-empty rev-chart-empty--tall" role="status">${emptyMsg}</div>`;
    }

    const maxVal = Math.max(...buckets.map((b) => b.total), 1);
    const n = buckets.length;
    const gap = n > 10 ? 4 : 6;
    const barW = Math.max(10, (w - 28 - gap * (n - 1)) / n);
    const originY = padT + chartH;
    const gridSteps = 4;

    const gridLines = Array.from({ length: gridSteps }, (_, i) => {
        const y = padT + (chartH / gridSteps) * i;
        return `<line x1="14" y1="${y}" x2="${w - 14}" y2="${y}" stroke="var(--border)" stroke-width="1" stroke-dasharray="3 4" opacity="0.85"/>`;
    }).join('');

    const bars = buckets.map((b, i) => {
        const val = Number(b.total) || 0;
        const bh = Math.max(val > 0 ? 6 : 2, (val / maxVal) * (chartH - 12));
        const x = 14 + i * (barW + gap);
        const y = originY - bh;
        const label = escapeSvgText(b.label || '');
        const tip = escapeSvgText(`${b.title || b.label || ''}: ${formatPrice(val, currency)} (${b.count || 0})`);
        const showVal = val > 0 && bh >= 22;
        const valLabel = escapeSvgText(formatPrice(val, currency));
        return `
            <g class="rev-ts-bar-group">
                <title>${tip}</title>
                <rect x="${x}" y="${y}" width="${barW}" height="${bh}" rx="6" fill="${CHART_ACCENT}" opacity="0.95"/>
                <rect x="${x}" y="${y}" width="${barW}" height="${Math.min(8, bh)}" rx="6" fill="${CHART_ACCENT_SOFT}" opacity="0.35"/>
                ${showVal ? `<text x="${x + barW / 2}" y="${y - 5}" text-anchor="middle" fill="var(--text-primary)" font-size="9" font-weight="700">${valLabel}</text>` : ''}
                <text x="${x + barW / 2}" y="${originY + 22}" text-anchor="middle" fill="${CHART_AXIS}" font-size="10" font-weight="600">${label}</text>
            </g>`;
    }).join('');

    return `<svg class="rev-chart-timeseries" viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="xMinYMin meet" role="img" aria-label="${escapeSvgText(t.revenue_chart_timeline_title || 'Revenue over time')}">
        ${gridLines}
        <line x1="14" y1="${originY}" x2="${w - 14}" y2="${originY}" stroke="var(--border)" stroke-width="1.5"/>
        ${bars}
    </svg>`;
}

function renderRevenueInsightsSection(kpis, filtered, range, t) {
    const narrative = buildAnalystNarrative(kpis, {
        filtered,
        range,
        paymentRequests: state.paymentRequests || []
    }, t);
    const insights = buildRevenueInsights(kpis, {
        filtered,
        range,
        paymentRequests: state.paymentRequests || []
    }, t);

    const paragraphs = (narrative.paragraphs || []).filter(Boolean);
    const narrativeExpand = paragraphs.length
        ? `<details class="rev-narrative-expand">
            <summary class="rev-narrative-expand-summary">${escapeHtml(t.revenue_narrative_read_more || 'Read full summary')}</summary>
            ${paragraphs.map((p) => `<p class="rev-narrative-p">${escapeHtml(p)}</p>`).join('')}
        </details>`
        : '';

    const items = insights.map((ins) => {
        const tone = ins.tone || 'neutral';
        const icon = ins.icon || 'lightbulb';
        return `
            <li class="rev-insight rev-insight--${tone}">
                <span class="rev-insight-icon" aria-hidden="true"><i data-lucide="${escapeHtml(icon)}" size="18"></i></span>
                <span class="rev-insight-text">${escapeHtml(ins.text)}</span>
            </li>`;
    }).join('');

    const bulletsBlock = insights.length
        ? `<ul class="rev-insights-list">${items}</ul>`
        : '';

    if (!bulletsBlock && !narrativeExpand) return '';

    return `
        <section class="rev-insights-panel" aria-labelledby="rev-insights-heading">
            <h2 id="rev-insights-heading" class="rev-section-heading">${escapeHtml(t.revenue_insights_title || t.revenue_kpi_preset_summary || 'Executive summary')}</h2>
            ${bulletsBlock ? `<h3 class="rev-insights-bullets-label">${escapeHtml(t.revenue_insights_bullets || 'Key points')}</h3>${bulletsBlock}` : ''}
            ${narrativeExpand}
        </section>`;
}

function chartDescDetailsHtml(t, key, fallback) {
    const text = t[key] || fallback;
    if (!text) return '';
    const summary = t.revenue_chart_why_label || 'Why this chart?';
    return `<details class="rev-chart-desc-details">
        <summary class="rev-chart-desc-summary">${escapeHtml(summary)}</summary>
        <p class="rev-chart-desc">${escapeHtml(text)}</p>
    </details>`;
}

function renderMonthlyTrendHero(series, range, t, currency) {
    const monthsWithData = series?.monthsWithData ?? 0;
    const aureNote = series?.useRecognized
        ? `<p class="rev-chart-note">${escapeHtml(t.revenue_chart_aure_footnote || t.revenue_chart_aure_month_note || 'Months follow Aure accounting (recognized month), not payment date.')}</p>`
        : '';

    if (monthsWithData < 2) {
        return `
            <section class="rev-chart-panel rev-chart-panel-hero" aria-labelledby="rev-monthly-trend-heading">
                <h3 id="rev-monthly-trend-heading" class="rev-chart-title">${escapeHtml(t.revenue_chart_monthly_title || 'Monthly collected revenue')}</h3>
                <div class="rev-chart-panel-body rev-chart-plot rev-chart-plot--canvas">
                    <div class="rev-chart-empty rev-chart-empty--tall" role="status">${escapeHtml(t.revenue_chart_monthly_need_more || 'Need at least two months of payment history to show trends.')}</div>
                </div>
                ${aureNote}
            </section>`;
    }

    const highlightKey = getRevenueHighlightMonthKey(range);
    const showYtd = !range?.allTime && highlightKey && highlightKey.startsWith(String(series.filterYear));
    const ytdSection = showYtd ? `
            <section class="rev-chart-panel rev-chart-panel-half" aria-labelledby="rev-ytd-heading">
                <h3 id="rev-ytd-heading" class="rev-chart-title">${escapeHtml((t.revenue_chart_ytd_title || 'Cumulative {year}').replace('{year}', String(series.filterYear)))}</h3>
                ${chartDescDetailsHtml(t, 'revenue_chart_desc_ytd', 'Running total of collected revenue within the selected calendar year.')}
                <div class="rev-chart-panel-body rev-chart-plot rev-chart-plot--canvas">
                    <div class="rev-canvas-wrap"><canvas id="rev-chart-ytd-cumulative" aria-label="${escapeHtml(t.revenue_chart_ytd_title || 'YTD')}"></canvas></div>
                </div>
            </section>` : '';

    return `
        <div class="rev-analytics-monthly-block">
            <section class="rev-chart-panel rev-chart-panel-hero" aria-labelledby="rev-monthly-trend-heading">
                <h3 id="rev-monthly-trend-heading" class="rev-chart-title">${escapeHtml(t.revenue_chart_monthly_title || 'Monthly collected revenue')}</h3>
                ${chartDescDetailsHtml(t, 'revenue_chart_desc_monthly', 'Approved payment totals by month for the last 13 months. Each bar is collected revenue; hover for payment count and change vs the prior month.')}
                <p class="rev-chart-subtitle">${escapeHtml(t.revenue_chart_monthly_subtitle || 'Last 13 months · hover or tap a bar for details')}</p>
                <div class="rev-chart-panel-body rev-chart-plot rev-chart-plot--canvas rev-chart-plot--hero">
                    <div class="rev-canvas-wrap rev-canvas-wrap--hero"><canvas id="rev-chart-monthly-trend" aria-label="${escapeHtml(t.revenue_chart_monthly_title || 'Monthly revenue')}"></canvas></div>
                </div>
                ${aureNote}
            </section>
            <div class="rev-analytics-secondary-charts">
                <section class="rev-chart-panel rev-chart-panel-half" aria-labelledby="rev-mom-heading">
                    <h3 id="rev-mom-heading" class="rev-chart-title">${escapeHtml(t.revenue_chart_mom_title || 'Month-over-month change')}</h3>
                    ${chartDescDetailsHtml(t, 'revenue_chart_desc_mom', 'Percent change in collected revenue vs the previous month. Green is growth, orange is decline.')}
                    <div class="rev-chart-panel-body rev-chart-plot rev-chart-plot--canvas">
                        <div class="rev-canvas-wrap"><canvas id="rev-chart-mom-delta" aria-label="${escapeHtml(t.revenue_chart_mom_title || 'MoM')}"></canvas></div>
                    </div>
                </section>
                <section class="rev-chart-panel rev-chart-panel-half" aria-labelledby="rev-volume-heading">
                    <h3 id="rev-volume-heading" class="rev-chart-title">${escapeHtml(t.revenue_chart_volume_title || 'Payment volume')}</h3>
                    ${chartDescDetailsHtml(t, 'revenue_chart_desc_volume', 'Number of approved payments per month, regardless of amount.')}
                    <div class="rev-chart-panel-body rev-chart-plot rev-chart-plot--canvas">
                        <div class="rev-canvas-wrap"><canvas id="rev-chart-payment-volume" aria-label="${escapeHtml(t.revenue_chart_volume_title || 'Volume')}"></canvas></div>
                    </div>
                </section>
                <section class="rev-chart-panel rev-chart-panel-half" aria-labelledby="rev-health-heading">
                    <h3 id="rev-health-heading" class="rev-chart-title">${escapeHtml(t.revenue_chart_health_title || 'Collection health by month')}</h3>
                    ${chartDescDetailsHtml(t, 'revenue_chart_desc_health', 'Stacked collected (approved) vs pending amounts per month.')}
                    <div class="rev-chart-panel-body rev-chart-plot rev-chart-plot--canvas">
                        <div class="rev-canvas-wrap"><canvas id="rev-chart-collection-health" aria-label="${escapeHtml(t.revenue_chart_health_title || 'Health')}"></canvas></div>
                    </div>
                </section>
                ${ytdSection}
            </div>
        </div>`;
}

function renderDeepDiveSection(kpis, filtered, range, monthlySeries, mix, topPackages, timeSeries, t, currency) {
    return `
        <div class="rev-deep-dive">
            ${renderMonthlyTrendHero(monthlySeries, range, t, currency)}
            ${renderRevenueInsightsSection(kpis, filtered, range, t)}
            ${renderRevenueStudentAnalyticsSection(kpis, t, currency)}
            <div class="rev-analytics-charts">
                <section class="rev-chart-panel">
                    <h3 class="rev-chart-title">${escapeHtml(t.revenue_chart_mix_title || t.revenue_kpi_payment_mix || 'Payment mix')}</h3>
                    <div class="rev-chart-panel-body rev-chart-mix-body rev-chart-plot">
                        ${buildPaymentMixDonutSvg(mix, t)}
                        ${buildPaymentMixLegendHtml(mix, currency, t)}
                    </div>
                </section>
                <section class="rev-chart-panel">
                    <h3 class="rev-chart-title">${escapeHtml(t.revenue_chart_packages_title || t.revenue_kpi_top_packages || 'Top packages')}</h3>
                    <div class="rev-chart-panel-body rev-chart-plot">${buildHorizontalBarChartHtml(topPackages, currency, t)}</div>
                </section>
                <section class="rev-chart-panel rev-chart-panel-wide">
                    <h3 class="rev-chart-title">${escapeHtml(t.revenue_chart_timeline_title || 'Revenue over time')}</h3>
                    <div class="rev-chart-panel-body rev-chart-plot rev-chart-plot--timeline">${buildTimeSeriesBarSvg(timeSeries, currency, t)}</div>
                </section>
            </div>
        </div>`;
}

export function renderRevenueAnalyticsDashboard(kpis, filtered, range, t, currency) {
    if (!kpis) return '';
    const mix = kpis.paymentMix || {};
    const topPackages = (kpis.topPackages || []).slice(0, 8);
    const timeSeries = computeRevenueTimeSeries(filtered, range, state.language);
    const monthlySeries = computeRollingMonthlyRevenueSeries(state.paymentRequests || [], {
        monthCount: 13,
        lang: state.language,
        rangeEnd: range?.dateEnd,
        highlightMonthKey: getRevenueHighlightMonthKey(range)
    });
    const compare = computePeriodComparison(kpis, range);
    const analytics = kpis.studentAnalytics || null;

    const narrative = buildAnalystNarrative(kpis, {
        filtered,
        range,
        paymentRequests: state.paymentRequests || []
    }, t);

    const analyzedAt = kpis.analyzedAt
        ? new Date(kpis.analyzedAt).toLocaleString(getRevenueChartLocale(state.language), { dateStyle: 'short', timeStyle: 'short' })
        : '';
    const sourceNote = kpis.source === 'rpc'
        ? (t.revenue_kpi_source_rpc || 'Server summary')
        : (t.revenue_kpi_source_client || 'Calculated on device');

    const snapshotsRow = `
        <div class="rev-snapshots-row">
            ${renderRevenuePeriodSnapshot(kpis, compare, monthlySeries, narrative.headline, t, currency)}
            ${renderStudentRosterSnapshot(analytics, t)}
        </div>`;

    return `
        ${renderAtAGlanceMetrics(kpis, compare, analytics, currency, t)}
        <div class="rev-analytics-meta">
            <span>${escapeHtml((t.revenue_kpi_payments_in_scope || '{count} payments').replace('{count}', String(kpis.filteredCount || 0)))}</span>
            ${analyzedAt ? `<span> · ${escapeHtml(analyzedAt)}</span>` : ''}
            <span class="rev-analytics-source">${escapeHtml(sourceNote)}</span>
        </div>
        ${snapshotsRow}
        ${renderZoneDivider(t)}
        ${renderDeepDiveSection(kpis, filtered, range, monthlySeries, mix, topPackages, timeSeries, t, currency)}`;
}

export function renderRevenueAnalyticsSkeleton(t) {
    return `
        <div class="rev-analytics-skeleton" aria-busy="true" aria-live="polite">
            <div class="rev-skeleton-zone-label"></div>
            <div class="rev-skeleton-at-a-glance">
                <div class="rev-skeleton-block"></div>
                <div class="rev-skeleton-block"></div>
                <div class="rev-skeleton-block"></div>
                <div class="rev-skeleton-block"></div>
            </div>
            <div class="rev-skeleton-snapshots">
                <div class="rev-skeleton-panel"></div>
                <div class="rev-skeleton-panel"></div>
            </div>
            <div class="rev-skeleton-divider"></div>
            <div class="rev-skeleton-monthly">
                <div class="rev-skeleton-panel rev-skeleton-panel-hero"></div>
                <div class="rev-skeleton-secondary">
                    <div class="rev-skeleton-panel"></div>
                    <div class="rev-skeleton-panel"></div>
                </div>
            </div>
            <div class="rev-skeleton-student">
                <div class="rev-skeleton-line wide"></div>
                <div class="rev-student-panels">
                    <div class="rev-skeleton-panel wide"></div>
                    <div class="rev-skeleton-panel"></div>
                </div>
            </div>
            <p class="rev-skeleton-label"><i data-lucide="loader-2" size="18" class="spin"></i> ${escapeHtml(t.revenue_kpi_analyzing || 'Loading…')}</p>
        </div>`;
}
