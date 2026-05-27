/**
 * Student analytics section for admin revenue / ganancia indicators page.
 */
import { escapeHtml } from '../config.js';
import { state } from '../state.js';
import { formatPrice } from '../utils.js';
import { isAureSchool } from './revenueKpis.js';

const TOP_LIMIT = 10;
const LEVEL_COLORS = {
    principiante: 'var(--system-teal, #30b0c7)',
    avanzada: 'var(--system-blue, #007aff)',
    unset: 'var(--system-gray3, #c7c7cc)'
};

function escapeSvgText(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function normalizeByLevel(raw, aure = false) {
    const src = raw && typeof raw === 'object' ? raw : {};
    let principiante = Number(src.principiante) || 0;
    let avanzada = Number(src.avanzada) || 0;
    let unset = Number(src.unset) || 0;
    if (aure && unset > 0) {
        principiante += unset;
        unset = 0;
    }
    return {
        total: Number(src.total) || 0,
        principiante,
        avanzada,
        unset
    };
}

function normalizeLeaderboard(rows, mapRow) {
    if (!Array.isArray(rows)) return [];
    return rows.slice(0, TOP_LIMIT).map(mapRow).filter(Boolean);
}

/** Merge RPC `students` block into KPI object. */
export function mergeStudentAnalyticsIntoKpis(kpis, rpc) {
    if (!kpis || !rpc?.students || typeof rpc.students !== 'object') return kpis;
    const s = rpc.students;
    return {
        ...kpis,
        studentAnalytics: {
            byLevel: normalizeByLevel(s.by_level, isAureSchool(state.currentSchool)),
            topPackBuyers: normalizeLeaderboard(s.top_pack_buyers, (r) => ({
                student_id: r.student_id,
                name: r.name || r.student_id || '—',
                purchase_count: Number(r.purchase_count) || 0,
                total_spent: Number(r.total_spent) || 0
            })),
            topNoShows: normalizeLeaderboard(s.top_no_shows, (r) => ({
                student_id: r.student_id,
                name: r.name || r.student_id || '—',
                no_show_count: Number(r.no_show_count) || 0
            })),
            source: 'rpc'
        }
    };
}

/** Client fallback when RPC has no students block (pre-migration or empty). */
export function computeStudentAnalyticsFallback(filtered, range) {
    const schoolId = state.currentSchool?.id;
    if (!schoolId) return null;

    const students = (state.students || []).filter((s) => s.school_id === schoolId || !s.school_id);
    const aure = isAureSchool(state.currentSchool);
    const byLevel = { total: students.length, principiante: 0, avanzada: 0, unset: 0 };
    students.forEach((s) => {
        const lev = (s.level || '').trim();
        if (lev === 'principiante' || (aure && !lev)) byLevel.principiante += 1;
        else if (lev === 'avanzada') byLevel.avanzada += 1;
        else if (aure) byLevel.principiante += 1;
        else byLevel.unset += 1;
    });

    const buyerMap = {};
    (filtered || [])
        .filter((r) => r.status === 'approved' && r.student_id)
        .forEach((r) => {
            const sid = String(r.student_id);
            if (!buyerMap[sid]) {
                const st = students.find((s) => String(s.id) === sid);
                buyerMap[sid] = {
                    student_id: sid,
                    name: st?.name || sid,
                    purchase_count: 0,
                    total_spent: 0
                };
            }
            buyerMap[sid].purchase_count += 1;
            buyerMap[sid].total_spent += parseFloat(r.price) || 0;
        });

    const topPackBuyers = Object.values(buyerMap)
        .sort((a, b) => b.purchase_count - a.purchase_count || b.total_spent - a.total_spent)
        .slice(0, TOP_LIMIT);

    return {
        byLevel,
        topPackBuyers,
        topNoShows: [],
        source: 'client'
    };
}

function levelLabel(key, t, aure) {
    if (key === 'principiante') return aure ? (t.aure_level_principiante || 'Principiante') : (t.revenue_student_level_beginner || 'Beginner');
    if (key === 'avanzada') return aure ? (t.aure_level_avanzada || 'Avanzada') : (t.revenue_student_level_advanced || 'Advanced');
    if (key === 'unset') return aure ? (t.aure_level_not_set || 'Not set') : (t.revenue_student_level_unset || 'Not set');
    return key;
}

export function buildStudentLevelDonutSvg(byLevel, t, aure, size = 120) {
    const total = byLevel.total || 0;
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.34;
    const stroke = size * 0.13;
    const circ = 2 * Math.PI * r;
    const emptyLabel = escapeSvgText(t.revenue_student_no_roster || '—');

    if (total <= 0) {
        return `<svg class="rev-chart-donut rev-student-snapshot-donut" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--system-gray6)" stroke-width="${stroke}"/>
            <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="var(--text-secondary)" font-size="11" font-weight="600">${emptyLabel}</text>
        </svg>`;
    }

    const segmentDefs = [
        { key: 'principiante', count: byLevel.principiante, color: LEVEL_COLORS.principiante },
        { key: 'avanzada', count: byLevel.avanzada, color: LEVEL_COLORS.avanzada },
        ...(aure ? [] : [{ key: 'unset', count: byLevel.unset, color: LEVEL_COLORS.unset }])
    ];
    const segments = segmentDefs.filter((s) => s.count > 0);

    let offset = circ * 0.25;
    const arcs = segments.map((seg) => {
        const len = (seg.count / total) * circ;
        const arc = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="${stroke}"
            stroke-dasharray="${len} ${circ - len}" stroke-dashoffset="${offset}" stroke-linecap="round"/>`;
        offset -= len;
        return arc;
    }).join('');

    const topSeg = segments.reduce((a, b) => (b.count > (a?.count || 0) ? b : a), segments[0]);
    const topPct = topSeg ? Math.round((topSeg.count / total) * 100) : 0;
    const centerLabel = escapeSvgText(levelLabel(topSeg?.key || 'principiante', t, aure));

    return `<svg class="rev-chart-donut rev-student-snapshot-donut" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${escapeSvgText(t.revenue_student_level_chart_aria || 'Student levels')}">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--system-gray6)" stroke-width="${stroke}" opacity="0.35"/>
        ${arcs}
        <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="var(--text-primary)" font-size="9" font-weight="700">${centerLabel}</text>
        <text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="var(--text-primary)" font-size="16" font-weight="800">${topPct}%</text>
    </svg>`;
}

function buildLevelChipsHtml(byLevel, t, aure) {
    const total = byLevel.total || 0;
    if (total <= 0) return '';
    const keys = aure ? ['principiante', 'avanzada'] : ['principiante', 'avanzada', 'unset'];
    return `<div class="rev-student-level-chips">
        ${keys.map((key) => {
            const count = byLevel[key] || 0;
            if (count <= 0) return '';
            const pct = Math.round((count / total) * 100);
            return `<span class="rev-student-level-chip rev-student-level-chip--${key}">
                <span class="rev-student-level-dot rev-student-level-dot--${key}" aria-hidden="true"></span>
                <span class="rev-student-level-chip-label">${escapeHtml(levelLabel(key, t, aure))}</span>
                <span class="rev-student-level-chip-value">${count} · ${pct}%</span>
            </span>`;
        }).join('')}
    </div>`;
}

/** Compact roster snapshot for the top of the indicators dashboard. */
export function renderStudentRosterSnapshot(analytics, t) {
    if (!analytics) return '';
    const aure = isAureSchool(state.currentSchool);
    const byLevel = normalizeByLevel(analytics.byLevel, aure);
    const levelNote = aure
        ? (t.revenue_student_level_note_aure || 'Current roster by Aure level (not filtered by period).')
        : (t.revenue_student_level_note || 'Current roster by assigned level tag.');

    return `
        <section class="rev-snapshot-card rev-student-snapshot" aria-labelledby="rev-student-snapshot-heading">
            <div class="rev-snapshot-card-head">
                <h2 id="rev-student-snapshot-heading" class="rev-snapshot-title">${escapeHtml(t.revenue_student_snapshot_title || 'Students')}</h2>
                <p class="rev-snapshot-sub">${escapeHtml(t.revenue_student_snapshot_sub || 'Roster by level')}</p>
            </div>
            <div class="rev-student-snapshot-body">
                <div class="rev-student-snapshot-metric">
                    <span class="rev-student-snapshot-total-label">${escapeHtml(t.revenue_student_total || 'Students')}</span>
                    <span class="rev-student-snapshot-total-value">${byLevel.total}</span>
                </div>
                <div class="rev-student-snapshot-visual">
                    ${buildStudentLevelDonutSvg(byLevel, t, aure, 120)}
                    ${buildLevelChipsHtml(byLevel, t, aure)}
                </div>
            </div>
            <p class="rev-snapshot-footnote">${escapeHtml(levelNote)}</p>
        </section>`;
}

function buildLevelDistributionHtml(byLevel, t, aure) {
    const total = byLevel.total || 0;
    if (total <= 0) {
        return `<div class="rev-chart-empty" role="status">${escapeHtml(t.revenue_student_no_roster || t.no_data_msg || 'No students')}</div>`;
    }

    const segmentDefs = [
        { key: 'principiante', count: byLevel.principiante, className: 'principiante' },
        { key: 'avanzada', count: byLevel.avanzada, className: 'avanzada' },
        ...(aure ? [] : [{ key: 'unset', count: byLevel.unset, className: 'unset' }])
    ];
    const segments = segmentDefs.filter((s) => s.count > 0);

    const stacked = segments.map((seg) => {
        const pct = Math.round((seg.count / total) * 100);
        return `<div class="rev-student-level-seg rev-student-level-seg--${seg.className}" style="width:${pct}%" title="${escapeHtml(levelLabel(seg.key, t, aure))}: ${seg.count}"></div>`;
    }).join('');

    const legend = segments.map((seg) => {
        const pct = Math.round((seg.count / total) * 100);
        return `
            <div class="rev-student-level-legend-item">
                <span class="rev-student-level-dot rev-student-level-dot--${seg.className}" aria-hidden="true"></span>
                <span class="rev-student-level-legend-label">${escapeHtml(levelLabel(seg.key, t, aure))}</span>
                <span class="rev-student-level-legend-value">${seg.count} · ${pct}%</span>
            </div>`;
    }).join('');

    return `
        <div class="rev-student-level-stack" role="img" aria-label="${escapeHtml(t.revenue_student_level_chart_aria || 'Student levels')}">
            ${stacked || `<div class="rev-student-level-seg rev-student-level-seg--unset" style="width:100%"></div>`}
        </div>
        <div class="rev-student-level-legend">${legend}</div>`;
}

function buildRankedTableHtml(rows, t, currency, mode) {
    if (!rows.length) {
        const emptyKey = mode === 'noshow'
            ? 'revenue_student_no_noshows'
            : 'revenue_student_no_buyers';
        return `<div class="rev-chart-empty" role="status">${escapeHtml(t[emptyKey] || t.no_data_msg || 'No data')}</div>`;
    }

    return `<ol class="rev-student-rank-list">
        ${rows.map((row, i) => {
            const rank = i + 1;
            const name = escapeHtml((row.name || '—').trim());
            let meta;
            if (mode === 'noshow') {
                const n = row.no_show_count || 0;
                meta = escapeHtml(
                    (t.revenue_student_noshow_meta || '{count} no-shows').replace('{count}', String(n))
                );
            } else {
                const packs = row.purchase_count || 0;
                const spent = formatPrice(row.total_spent || 0, currency);
                meta = escapeHtml(
                    (t.revenue_student_packs_meta || '{count} packs · {amount}')
                        .replace('{count}', String(packs))
                        .replace('{amount}', spent)
                );
            }
            return `
                <li class="rev-student-rank-row">
                    <span class="rev-student-rank-num">${rank}</span>
                    <span class="rev-student-rank-body">
                        <span class="rev-student-rank-name">${name}</span>
                        <span class="rev-student-rank-meta">${meta}</span>
                    </span>
                </li>`;
        }).join('')}
    </ol>`;
}

/** Deep-dive student panels (no duplicate summary stat cards). */
export function renderRevenueStudentAnalyticsSection(kpis, t, currency, opts = {}) {
    const analytics = kpis?.studentAnalytics;
    if (!analytics) return '';

    const aure = isAureSchool(state.currentSchool);
    const byLevel = normalizeByLevel(analytics.byLevel, aure);
    const levelNote = aure
        ? (t.revenue_student_level_note_aure || 'Current roster by Aure level (not filtered by period).')
        : (t.revenue_student_level_note || 'Current roster by assigned level tag.');

    const periodNote = t.revenue_student_period_note || 'Pack purchases and no-shows use your selected date range.';

    return `
        <section class="rev-student-analytics" aria-labelledby="rev-student-analytics-heading">
            <div class="rev-student-analytics-header">
                <h2 id="rev-student-analytics-heading" class="rev-section-heading">${escapeHtml(t.revenue_student_section_title || 'Student analysis')}</h2>
                <p class="rev-student-analytics-sub">${escapeHtml(t.revenue_student_section_subtitle || 'Roster levels, top pack buyers, and attendance risk in this period.')}</p>
            </div>
            <p class="rev-student-period-note">${escapeHtml(periodNote)}</p>
            <div class="rev-student-panels">
                <section class="rev-chart-panel rev-chart-panel-wide">
                    <h3 class="rev-chart-title">${escapeHtml(t.revenue_student_level_title || 'Level distribution')}</h3>
                    <p class="rev-chart-desc">${escapeHtml(levelNote)}</p>
                    <div class="rev-chart-panel-body rev-chart-plot">${buildLevelDistributionHtml(byLevel, t, aure)}</div>
                </section>
                <section class="rev-chart-panel">
                    <h3 class="rev-chart-title">${escapeHtml(t.revenue_student_top_buyers_title || 'Top pack buyers')}</h3>
                    <p class="rev-chart-desc">${escapeHtml(t.revenue_student_top_buyers_desc || 'Approved package purchases in the selected period.')}</p>
                    <div class="rev-chart-panel-body rev-chart-plot">${buildRankedTableHtml(analytics.topPackBuyers || [], t, currency, 'buyers')}</div>
                </section>
                <section class="rev-chart-panel">
                    <h3 class="rev-chart-title">${escapeHtml(t.revenue_student_top_noshows_title || 'Most no-shows')}</h3>
                    <p class="rev-chart-desc">${escapeHtml(t.revenue_student_top_noshows_desc || 'Class registrations marked no-show in the selected period.')}</p>
                    <div class="rev-chart-panel-body rev-chart-plot">${buildRankedTableHtml(analytics.topNoShows || [], t, currency, 'noshow')}</div>
                </section>
            </div>
        </section>`;
}

export function renderRevenueStudentAnalyticsSkeleton(t) {
    return `
        <section class="rev-student-analytics rev-student-analytics--skeleton" aria-busy="true">
            <div class="rev-skeleton-line wide" style="height:18px;margin-bottom:8px"></div>
            <div class="rev-student-panels">
                <div class="rev-skeleton-panel wide"></div>
                <div class="rev-skeleton-panel"></div>
                <div class="rev-skeleton-panel"></div>
            </div>
            <p class="rev-skeleton-label">${escapeHtml(t.revenue_student_loading || t.revenue_kpi_analyzing || 'Loading…')}</p>
        </section>`;
}
