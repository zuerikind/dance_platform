/**
 * Chart.js mount/teardown for admin revenue analytics (vanilla, post-render).
 */
import { Chart, registerables } from 'chart.js';
import { formatPrice } from '../utils.js';
import { computeYtdCumulativeFromBuckets } from './revenueMonthlySeries.js';

Chart.register(...registerables);

let _chartInstances = [];

/** Theme tokens live on body (school + dark-mode); :root alone misses Aure overrides. */
function cssThemeEl() {
    if (typeof document === 'undefined') return null;
    return document.body || document.documentElement;
}

function readCssVar(name, fallback) {
    const el = cssThemeEl();
    if (!el) return fallback;
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fallback;
}

function isDarkChartTheme() {
    if (typeof document === 'undefined') return false;
    const body = document.body;
    const html = document.documentElement;
    return Boolean(
        body?.classList.contains('dark-mode')
        || html?.getAttribute('data-theme') === 'dark'
    );
}

function destroyCharts() {
    _chartInstances.forEach((c) => {
        try {
            c.destroy();
        } catch (_) { /* ignore */ }
    });
    _chartInstances = [];
}

function pushChart(canvas, config) {
    if (!canvas || typeof canvas.getContext !== 'function') return null;
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, config);
    _chartInstances.push(chart);
    return chart;
}

/** @param {Record<string, string>|((key: string) => string)} t */
function tr(t, key, fallback = '') {
    if (!t) return fallback;
    if (typeof t === 'function') {
        const v = t(key);
        return v && typeof v === 'string' && !v.startsWith('[') ? v : fallback;
    }
    return t[key] ?? fallback;
}

function baseChartOptions(t, currency) {
    const dark = isDarkChartTheme();
    const text = readCssVar('--text-primary', dark ? '#f5f5f7' : '#1c1c1e');
    const muted = readCssVar('--text-secondary', dark ? '#aeaeb2' : '#636366');
    const border = readCssVar('--border', dark ? 'rgba(255, 255, 255, 0.12)' : '#e5e5ea');
    const grid = readCssVar('--chart-grid', dark ? 'rgba(255, 255, 255, 0.12)' : border);
    const accent = readCssVar('--chart-bar', readCssVar('--accent', '#4c2f3c'));
    const barHighlight = readCssVar('--chart-bar-highlight', accent);
    const barDim = readCssVar('--chart-bar-dim', hexWithAlpha(accent, dark ? 0.78 : 0.52));
    const barZero = readCssVar('--chart-bar-zero', dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)');
    const tooltipBg = readCssVar('--chart-tooltip-bg', readCssVar('--bg-card', dark ? '#1c1c1e' : '#fff'));
    const tooltipBorder = readCssVar('--chart-tooltip-border', border);
    const positive = readCssVar('--chart-positive', readCssVar('--system-green', '#34c759'));
    const negative = readCssVar('--chart-negative', readCssVar('--system-orange', '#ff9500'));
    const volumeLine = readCssVar('--chart-volume-line', readCssVar('--system-blue', '#007aff'));
    const collected = readCssVar('--chart-collected', positive);
    const pending = readCssVar('--chart-pending', negative);
    const highlightStroke = readCssVar('--chart-highlight-stroke', barHighlight);

    return {
        dark,
        text,
        muted,
        border,
        grid,
        accent,
        barHighlight,
        barDim,
        barZero,
        positive,
        negative,
        volumeLine,
        collected,
        pending,
        highlightStroke,
        currency,
        common: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    labels: { color: muted, font: { size: 11, weight: '600' }, boxWidth: 12, padding: 14 }
                },
                tooltip: {
                    backgroundColor: tooltipBg,
                    titleColor: text,
                    bodyColor: muted,
                    borderColor: tooltipBorder,
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 10,
                    titleFont: { size: 13, weight: '700' },
                    bodyFont: { size: 12, weight: '500' }
                }
            },
            scales: {
                x: {
                    ticks: { color: muted, font: { size: 10, weight: '600' }, maxRotation: 45, minRotation: 0 },
                    grid: { display: false }
                },
                y: {
                    ticks: {
                        color: muted,
                        font: { size: 10, weight: '600' },
                        callback: (v) => formatPrice(v, currency)
                    },
                    grid: { color: grid, drawBorder: false }
                }
            }
        }
    };
}

function hexWithAlpha(hex, alpha) {
    const h = String(hex || '').trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(h)) return h;
    const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255).toString(16).padStart(2, '0');
    return `${h}${a}`;
}

function momTooltipLabel(b, t) {
    if (b.momPct == null) return tr(t, 'revenue_chart_mom_new', 'No prior month');
    const sign = b.momPct > 0 ? '+' : b.momPct < 0 ? '−' : '';
    return tr(t, 'revenue_chart_tooltip_mom', 'MoM: {sign}{pct}%')
        .replace('{sign}', sign)
        .replace('{pct}', String(Math.abs(b.momPct)));
}

function monthlyBarColor(b, theme) {
    if ((Number(b.collected) || 0) <= 0) return theme.barZero;
    return b.isHighlight ? theme.barHighlight : theme.barDim;
}

function mountMonthlyTrend(canvas, series, t, theme) {
    const buckets = series.buckets || [];
    const labels = buckets.map((b) => b.label);
    const collected = buckets.map((b) => b.collected);
    const highlightIdx = buckets.findIndex((b) => b.isHighlight);
    const barColors = buckets.map((b) => monthlyBarColor(b, theme));
    const dashWidth = theme.dark ? 2.5 : 2;

    pushChart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: tr(t, 'revenue_chart_monthly_collected', 'Collected'),
                data: collected,
                backgroundColor: barColors,
                borderRadius: 6,
                borderSkipped: false,
                maxBarThickness: 42
            }]
        },
        options: {
            ...theme.common,
            plugins: {
                ...theme.common.plugins,
                legend: { display: false },
                tooltip: {
                    ...theme.common.plugins.tooltip,
                    callbacks: {
                        title: (items) => {
                            const i = items[0]?.dataIndex;
                            return buckets[i]?.title || items[0]?.label || '';
                        },
                        label: (ctx) => formatPrice(ctx.parsed.y, theme.currency),
                        afterLabel: (ctx) => {
                            const b = buckets[ctx.dataIndex];
                            const lines = [
                                tr(t, 'revenue_chart_tooltip_approved', 'Approved payments: {count}')
                                    .replace('{count}', String(b.approvedCount || 0)),
                                momTooltipLabel(b, t)
                            ];
                            if (b.isHighlight) lines.push(tr(t, 'revenue_chart_filter_month', 'Selected filter month'));
                            return lines;
                        }
                    }
                }
            },
            scales: {
                ...theme.common.scales,
                y: { ...theme.common.scales.y, beginAtZero: true }
            }
        },
        plugins: highlightIdx >= 0 ? [{
            id: 'highlightMonth',
            afterDatasetsDraw(chart) {
                const meta = chart.getDatasetMeta(0);
                const el = meta.data[highlightIdx];
                if (!el) return;
                const { ctx } = chart;
                ctx.save();
                ctx.strokeStyle = theme.highlightStroke;
                ctx.lineWidth = dashWidth;
                ctx.setLineDash(theme.dark ? [5, 4] : [4, 3]);
                const x = el.x;
                const top = chart.chartArea.top;
                const bottom = chart.chartArea.bottom;
                ctx.beginPath();
                ctx.moveTo(x, top);
                ctx.lineTo(x, bottom);
                ctx.stroke();
                ctx.restore();
            }
        }] : []
    });
}

function mountMomDelta(canvas, series, t, theme) {
    const buckets = series.buckets || [];
    const labels = buckets.map((b) => b.shortLabel);
    const values = buckets.map((b) => (b.momPct == null ? null : b.momPct));
    const colors = buckets.map((b) => {
        if (b.momPct == null) return 'transparent';
        if (b.momPct > 0) return theme.positive;
        if (b.momPct < 0) return theme.negative;
        return theme.muted;
    });

    pushChart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: tr(t, 'revenue_chart_mom_title', 'Month-over-month %'),
                data: values,
                backgroundColor: colors,
                borderRadius: 5,
                maxBarThickness: 36
            }]
        },
        options: {
            ...theme.common,
            plugins: {
                ...theme.common.plugins,
                legend: { display: false },
                tooltip: {
                    ...theme.common.plugins.tooltip,
                    callbacks: {
                        title: (items) => {
                            const i = items[0]?.dataIndex;
                            return buckets[i]?.title || items[0]?.label || '';
                        },
                        label: (ctx) => {
                            const b = buckets[ctx.dataIndex];
                            if (b.momPct == null) return tr(t, 'revenue_chart_mom_na', '—');
                            const sign = b.momPct > 0 ? '+' : b.momPct < 0 ? '−' : '';
                            return tr(t, 'revenue_chart_tooltip_mom_pct', 'Change vs prior month: {sign}{pct}%')
                                .replace('{sign}', sign)
                                .replace('{pct}', String(Math.abs(b.momPct)));
                        },
                        afterLabel: (ctx) => {
                            const b = buckets[ctx.dataIndex];
                            const prev = buckets[ctx.dataIndex - 1];
                            const lines = [
                                tr(t, 'revenue_chart_tooltip_mom_amount', 'This month: {amount}')
                                    .replace('{amount}', formatPrice(b.collected, theme.currency)),
                                tr(t, 'revenue_chart_tooltip_approved', 'Approved payments: {count}')
                                    .replace('{count}', String(b.approvedCount || 0))
                            ];
                            if (prev) {
                                lines.splice(1, 0,
                                    tr(t, 'revenue_chart_tooltip_mom_prev', 'Prior month: {amount}')
                                        .replace('{amount}', formatPrice(prev.collected, theme.currency))
                                );
                            }
                            return lines;
                        }
                    }
                }
            },
            scales: {
                x: theme.common.scales.x,
                y: {
                    ...theme.common.scales.y,
                    ticks: {
                        ...theme.common.scales.y.ticks,
                        callback: (v) => `${v}%`
                    },
                    grid: theme.common.scales.y.grid
                }
            }
        }
    });
}

function mountPaymentVolume(canvas, series, t, theme) {
    const buckets = series.buckets || [];
    const lineColor = theme.volumeLine;
    pushChart(canvas, {
        type: 'line',
        data: {
            labels: buckets.map((b) => b.shortLabel),
            datasets: [{
                label: tr(t, 'revenue_chart_volume_title', 'Payment volume'),
                data: buckets.map((b) => b.approvedCount),
                borderColor: lineColor,
                backgroundColor: hexWithAlpha(lineColor, theme.dark ? 0.28 : 0.15),
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: lineColor,
                pointBorderColor: theme.dark ? readCssVar('--bg-card', '#1c1c1e') : '#fff',
                pointBorderWidth: theme.dark ? 1.5 : 2
            }]
        },
        options: {
            ...theme.common,
            plugins: {
                ...theme.common.plugins,
                legend: { display: false },
                tooltip: {
                    ...theme.common.plugins.tooltip,
                    callbacks: {
                        title: (items) => {
                            const i = items[0]?.dataIndex;
                            return buckets[i]?.title || items[0]?.label || '';
                        },
                        label: (ctx) => tr(t, 'revenue_chart_tooltip_approved', 'Approved payments: {count}')
                            .replace('{count}', String(Math.round(ctx.parsed.y ?? 0)))
                    }
                }
            },
            scales: {
                x: theme.common.scales.x,
                y: {
                    ...theme.common.scales.y,
                    ticks: {
                        color: theme.muted,
                        font: { size: 10, weight: '600' },
                        stepSize: 1,
                        precision: 0
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function mountCollectionHealth(canvas, series, t, theme) {
    const buckets = series.buckets || [];
    pushChart(canvas, {
        type: 'bar',
        data: {
            labels: buckets.map((b) => b.shortLabel),
            datasets: [
                {
                    label: tr(t, 'revenue_chart_legend_collected', 'Collected'),
                    data: buckets.map((b) => b.collected),
                    backgroundColor: theme.collected,
                    borderRadius: { topLeft: 4, topRight: 4 },
                    stack: 'stack0',
                    maxBarThickness: 40
                },
                {
                    label: tr(t, 'revenue_chart_legend_pending', 'To collect'),
                    data: buckets.map((b) => b.pending),
                    backgroundColor: theme.pending,
                    borderRadius: { topLeft: 4, topRight: 4 },
                    stack: 'stack0',
                    maxBarThickness: 40
                }
            ]
        },
        options: {
            ...theme.common,
            plugins: {
                ...theme.common.plugins,
                legend: {
                    ...theme.common.plugins.legend,
                    display: true
                },
                tooltip: {
                    ...theme.common.plugins.tooltip,
                    callbacks: {
                        title: (items) => {
                            const i = items[0]?.dataIndex;
                            return buckets[i]?.title || items[0]?.label || '';
                        },
                        label: (ctx) => {
                            const label = ctx.dataset.label || '';
                            return `${label}: ${formatPrice(ctx.parsed.y, theme.currency)}`;
                        }
                    }
                }
            },
            scales: {
                x: { ...theme.common.scales.x, stacked: true },
                y: { ...theme.common.scales.y, stacked: true, beginAtZero: true }
            }
        }
    });
}

function mountYtdCumulative(canvas, series, year, t, theme) {
    const ytd = computeYtdCumulativeFromBuckets(series.buckets, year);
    if (ytd.length < 2) return;

    const lineColor = theme.barHighlight;
    pushChart(canvas, {
        type: 'line',
        data: {
            labels: ytd.map((b) => b.shortLabel),
            datasets: [{
                label: tr(t, 'revenue_chart_ytd_title', 'Cumulative {year}').replace('{year}', String(year)),
                data: ytd.map((b) => b.cumulative),
                borderColor: lineColor,
                backgroundColor: hexWithAlpha(lineColor, theme.dark ? 0.22 : 0.12),
                fill: true,
                tension: 0.25,
                pointRadius: 3,
                pointBackgroundColor: lineColor,
                pointBorderColor: theme.dark ? readCssVar('--bg-card', '#1c1c1e') : '#fff',
                pointBorderWidth: theme.dark ? 1.5 : 2
            }]
        },
        options: {
            ...theme.common,
            plugins: {
                ...theme.common.plugins,
                legend: { display: true },
                tooltip: {
                    ...theme.common.plugins.tooltip,
                    callbacks: {
                        title: (items) => {
                            const i = items[0]?.dataIndex;
                            return ytd[i]?.title || items[0]?.label || '';
                        },
                        label: (ctx) => formatPrice(ctx.parsed.y, theme.currency)
                    }
                }
            },
            scales: {
                x: theme.common.scales.x,
                y: { ...theme.common.scales.y, beginAtZero: true }
            }
        }
    });
}

/**
 * Mount all analytics charts from data-* payloads on canvas elements.
 * @param {Record<string, string>|((key: string) => string)} t — i18n dict or t(key)
 * @param {string} currency
 * @param {{ buckets: object[], monthsWithData: number, filterYear: number }} series
 * @param {{ showYtd?: boolean, filterYear?: number }} opts
 */
export function mountRevenueAnalyticsCharts(t, currency, series, opts = {}) {
    destroyCharts();
    if (!series || !series.buckets?.length) return;

    const theme = baseChartOptions(t, currency);

    const trend = document.getElementById('rev-chart-monthly-trend');
    const mom = document.getElementById('rev-chart-mom-delta');
    const volume = document.getElementById('rev-chart-payment-volume');
    const health = document.getElementById('rev-chart-collection-health');
    const ytd = document.getElementById('rev-chart-ytd-cumulative');

    if (trend) mountMonthlyTrend(trend, series, t, theme);
    if (mom) mountMomDelta(mom, series, t, theme);
    if (volume) mountPaymentVolume(volume, series, t, theme);
    if (health) mountCollectionHealth(health, series, t, theme);
    if (ytd && opts.showYtd) mountYtdCumulative(ytd, series, opts.filterYear || series.filterYear, t, theme);
}

export function destroyRevenueAnalyticsCharts() {
    destroyCharts();
}
