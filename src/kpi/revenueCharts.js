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
    getRevenueChartLocale
} from './revenueKpis.js';
import {
    computeRollingMonthlyRevenueSeries,
    getRevenueHighlightMonthKey
} from './revenueMonthlySeries.js';
import { renderRevenueStudentAnalyticsSection } from './revenueStudentAnalytics.js';

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

    const narrativeBlock = narrative.headline ? `
        <div class="rev-narrative">
            <p class="rev-narrative-headline-label">${escapeHtml(t.revenue_narrative_in_one_sentence || 'In one sentence')}</p>
            <p class="rev-narrative-headline">${escapeHtml(narrative.headline)}</p>
            ${(narrative.paragraphs || []).map((p) => `<p class="rev-narrative-p">${escapeHtml(p)}</p>`).join('')}
        </div>` : '';

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

    if (!narrativeBlock && !bulletsBlock) return '';

    return `
        <section class="rev-insights-panel" aria-labelledby="rev-insights-heading">
            <h2 id="rev-insights-heading" class="rev-section-heading">${escapeHtml(t.revenue_insights_title || t.revenue_kpi_preset_summary || 'Executive summary')}</h2>
            ${narrativeBlock}
            ${bulletsBlock ? `<h3 class="rev-insights-bullets-label">${escapeHtml(t.revenue_insights_bullets || 'Key points')}</h3>${bulletsBlock}` : ''}
        </section>`;
}

function chartDescHtml(t, key, fallback) {
    const text = t[key] || fallback;
    if (!text) return '';
    return `<p class="rev-chart-desc">${escapeHtml(text)}</p>`;
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
                ${chartDescHtml(t, 'revenue_chart_desc_ytd', 'Running total of collected revenue within the selected calendar year.')}
                <div class="rev-chart-panel-body rev-chart-plot rev-chart-plot--canvas">
                    <div class="rev-canvas-wrap"><canvas id="rev-chart-ytd-cumulative" aria-label="${escapeHtml(t.revenue_chart_ytd_title || 'YTD')}"></canvas></div>
                </div>
            </section>` : '';

    return `
        <div class="rev-analytics-monthly-block">
            <section class="rev-chart-panel rev-chart-panel-hero" aria-labelledby="rev-monthly-trend-heading">
                <h3 id="rev-monthly-trend-heading" class="rev-chart-title">${escapeHtml(t.revenue_chart_monthly_title || 'Monthly collected revenue')}</h3>
                ${chartDescHtml(t, 'revenue_chart_desc_monthly', 'Approved payment totals by month for the last 13 months. Each bar is collected revenue; hover for payment count and change vs the prior month.')}
                <p class="rev-chart-subtitle">${escapeHtml(t.revenue_chart_monthly_subtitle || 'Last 13 months · hover or tap a bar for details')}</p>
                <div class="rev-chart-panel-body rev-chart-plot rev-chart-plot--canvas rev-chart-plot--hero">
                    <div class="rev-canvas-wrap rev-canvas-wrap--hero"><canvas id="rev-chart-monthly-trend" aria-label="${escapeHtml(t.revenue_chart_monthly_title || 'Monthly revenue')}"></canvas></div>
                </div>
                ${aureNote}
            </section>
            <div class="rev-analytics-secondary-charts">
                <section class="rev-chart-panel rev-chart-panel-half" aria-labelledby="rev-mom-heading">
                    <h3 id="rev-mom-heading" class="rev-chart-title">${escapeHtml(t.revenue_chart_mom_title || 'Month-over-month change')}</h3>
                    ${chartDescHtml(t, 'revenue_chart_desc_mom', 'Percent change in collected revenue vs the previous month. Green is growth, orange is decline.')}
                    <div class="rev-chart-panel-body rev-chart-plot rev-chart-plot--canvas">
                        <div class="rev-canvas-wrap"><canvas id="rev-chart-mom-delta" aria-label="${escapeHtml(t.revenue_chart_mom_title || 'MoM')}"></canvas></div>
                    </div>
                </section>
                <section class="rev-chart-panel rev-chart-panel-half" aria-labelledby="rev-volume-heading">
                    <h3 id="rev-volume-heading" class="rev-chart-title">${escapeHtml(t.revenue_chart_volume_title || 'Payment volume')}</h3>
                    ${chartDescHtml(t, 'revenue_chart_desc_volume', 'Number of approved payments per month, regardless of amount.')}
                    <div class="rev-chart-panel-body rev-chart-plot rev-chart-plot--canvas">
                        <div class="rev-canvas-wrap"><canvas id="rev-chart-payment-volume" aria-label="${escapeHtml(t.revenue_chart_volume_title || 'Volume')}"></canvas></div>
                    </div>
                </section>
                <section class="rev-chart-panel rev-chart-panel-half" aria-labelledby="rev-health-heading">
                    <h3 id="rev-health-heading" class="rev-chart-title">${escapeHtml(t.revenue_chart_health_title || 'Collection health by month')}</h3>
                    ${chartDescHtml(t, 'revenue_chart_desc_health', 'Stacked collected (approved) vs pending amounts per month.')}
                    <div class="rev-chart-panel-body rev-chart-plot rev-chart-plot--canvas">
                        <div class="rev-canvas-wrap"><canvas id="rev-chart-collection-health" aria-label="${escapeHtml(t.revenue_chart_health_title || 'Health')}"></canvas></div>
                    </div>
                </section>
                ${ytdSection}
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

    const aureCard = kpis.aurePendingSuelta != null
        ? `<div class="rev-stat-card rev-stat-card-aure">
            <div class="rev-stat-label">${escapeHtml(t.revenue_kpi_aure_pending_suelta || 'Pending clase suelta')}</div>
            <div class="rev-stat-value">${kpis.aurePendingSuelta ?? 0}</div>
            <div class="rev-stat-meta">${escapeHtml(t.revenue_kpi_aure_pending_suelta_hint || '')}</div>
        </div>`
        : '';

    const analyzedAt = kpis.analyzedAt
        ? new Date(kpis.analyzedAt).toLocaleString(getRevenueChartLocale(state.language), { dateStyle: 'short', timeStyle: 'short' })
        : '';
    const sourceNote = kpis.source === 'rpc'
        ? (t.revenue_kpi_source_rpc || 'Server summary')
        : (t.revenue_kpi_source_client || 'Calculated on device');

    return `
        <div class="rev-analytics-hero">
            <div class="rev-stat-card">
                <div class="rev-stat-label">${escapeHtml(t.revenue_kpi_collected || 'Collected')}</div>
                <div class="rev-stat-value">${escapeHtml(formatPrice(kpis.collected, currency))}</div>
                <div class="rev-stat-meta">${escapeHtml((t.revenue_kpi_approved_count || '{count} approved').replace('{count}', String(kpis.collectedCount || 0)))}</div>
            </div>
            <div class="rev-stat-card">
                <div class="rev-stat-label">${escapeHtml(t.revenue_kpi_pending || 'To collect')}</div>
                <div class="rev-stat-value rev-stat-value-warn">${escapeHtml(formatPrice(kpis.pendingSum, currency))}</div>
                <div class="rev-stat-meta">${escapeHtml((t.revenue_kpi_pending_count || '{count} pending').replace('{count}', String(kpis.pendingCount || 0)))}</div>
            </div>
            <div class="rev-stat-card">
                <div class="rev-stat-label">${escapeHtml(t.revenue_kpi_avg_ticket || 'Avg ticket')}</div>
                <div class="rev-stat-value">${escapeHtml(formatPrice(kpis.avgTicket, currency))}</div>
                <div class="rev-stat-meta">${escapeHtml(t.revenue_kpi_avg_ticket_hint || '')}</div>
            </div>
            ${aureCard}
        </div>
        <div class="rev-analytics-meta">
            <span>${escapeHtml((t.revenue_kpi_payments_in_scope || '{count} payments').replace('{count}', String(kpis.filteredCount || 0)))}</span>
            ${analyzedAt ? `<span> · ${escapeHtml(analyzedAt)}</span>` : ''}
            <span class="rev-analytics-source">${escapeHtml(sourceNote)}</span>
        </div>
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
        </div>`;
}

export function renderRevenueAnalyticsSkeleton(t) {
    return `
        <div class="rev-analytics-skeleton" aria-busy="true" aria-live="polite">
            <div class="rev-skeleton-hero">
                <div class="rev-skeleton-block"></div>
                <div class="rev-skeleton-block"></div>
                <div class="rev-skeleton-block"></div>
            </div>
            <div class="rev-skeleton-monthly">
                <div class="rev-skeleton-panel rev-skeleton-panel-hero"></div>
                <div class="rev-skeleton-secondary">
                    <div class="rev-skeleton-panel"></div>
                    <div class="rev-skeleton-panel"></div>
                </div>
            </div>
            <div class="rev-skeleton-insights">
                <div class="rev-skeleton-insight-card"><div class="rev-skeleton-line wide"></div><div class="rev-skeleton-line"></div></div>
                <div class="rev-skeleton-insight-card"><div class="rev-skeleton-line wide"></div><div class="rev-skeleton-line"></div></div>
                <div class="rev-skeleton-insight-card"><div class="rev-skeleton-line wide"></div><div class="rev-skeleton-line"></div></div>
            </div>
            <div class="rev-skeleton-student">
                <div class="rev-skeleton-line wide"></div>
                <div class="rev-skeleton-hero" style="grid-template-columns:repeat(4,1fr)">
                    <div class="rev-skeleton-block"></div>
                    <div class="rev-skeleton-block"></div>
                    <div class="rev-skeleton-block"></div>
                    <div class="rev-skeleton-block"></div>
                </div>
            </div>
            <div class="rev-skeleton-charts">
                <div class="rev-skeleton-panel"></div>
                <div class="rev-skeleton-panel"></div>
                <div class="rev-skeleton-panel wide"></div>
            </div>
            <p class="rev-skeleton-label"><i data-lucide="loader-2" size="18" class="spin"></i> ${escapeHtml(t.revenue_kpi_analyzing || 'Loading…')}</p>
        </div>`;
}
