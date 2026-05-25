/**
 * Student analytics section for admin revenue / ganancia indicators page.
 */
import { escapeHtml } from '../config.js';
import { state } from '../state.js';
import { formatPrice } from '../utils.js';
import { isAureSchool } from './revenueKpis.js';

const TOP_LIMIT = 10;

function normalizeByLevel(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
        total: Number(src.total) || 0,
        principiante: Number(src.principiante) || 0,
        avanzada: Number(src.avanzada) || 0,
        unset: Number(src.unset) || 0
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
            byLevel: normalizeByLevel(s.by_level),
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
    const byLevel = { total: students.length, principiante: 0, avanzada: 0, unset: 0 };
    students.forEach((s) => {
        const lev = (s.level || '').trim();
        if (lev === 'principiante') byLevel.principiante += 1;
        else if (lev === 'avanzada') byLevel.avanzada += 1;
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

function buildLevelDistributionHtml(byLevel, t, aure) {
    const total = byLevel.total || 0;
    if (total <= 0) {
        return `<div class="rev-chart-empty" role="status">${escapeHtml(t.revenue_student_no_roster || t.no_data_msg || 'No students')}</div>`;
    }

    const segments = [
        { key: 'principiante', count: byLevel.principiante, className: 'principiante' },
        { key: 'avanzada', count: byLevel.avanzada, className: 'avanzada' },
        { key: 'unset', count: byLevel.unset, className: 'unset' }
    ].filter((s) => s.count > 0);

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

export function renderRevenueStudentAnalyticsSection(kpis, t, currency) {
    const analytics = kpis?.studentAnalytics;
    if (!analytics) return '';

    const aure = isAureSchool(state.currentSchool);
    const byLevel = analytics.byLevel || { total: 0, principiante: 0, avanzada: 0, unset: 0 };
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
            <div class="rev-student-summary-cards">
                <div class="rev-stat-card rev-stat-card-student">
                    <div class="rev-stat-label">${escapeHtml(t.revenue_student_total || 'Students')}</div>
                    <div class="rev-stat-value">${byLevel.total}</div>
                    <div class="rev-stat-meta">${escapeHtml(t.revenue_student_total_hint || 'Active roster')}</div>
                </div>
                <div class="rev-stat-card rev-stat-card-student">
                    <div class="rev-stat-label">${escapeHtml(levelLabel('principiante', t, aure))}</div>
                    <div class="rev-stat-value">${byLevel.principiante}</div>
                    <div class="rev-stat-meta">${byLevel.total ? `${Math.round((byLevel.principiante / byLevel.total) * 100)}%` : '—'}</div>
                </div>
                <div class="rev-stat-card rev-stat-card-student">
                    <div class="rev-stat-label">${escapeHtml(levelLabel('avanzada', t, aure))}</div>
                    <div class="rev-stat-value">${byLevel.avanzada}</div>
                    <div class="rev-stat-meta">${byLevel.total ? `${Math.round((byLevel.avanzada / byLevel.total) * 100)}%` : '—'}</div>
                </div>
                <div class="rev-stat-card rev-stat-card-student">
                    <div class="rev-stat-label">${escapeHtml(levelLabel('unset', t, aure))}</div>
                    <div class="rev-stat-value">${byLevel.unset}</div>
                    <div class="rev-stat-meta">${byLevel.total ? `${Math.round((byLevel.unset / byLevel.total) * 100)}%` : '—'}</div>
                </div>
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
            <div class="rev-student-summary-cards">
                <div class="rev-skeleton-block"></div>
                <div class="rev-skeleton-block"></div>
                <div class="rev-skeleton-block"></div>
                <div class="rev-skeleton-block"></div>
            </div>
            <div class="rev-student-panels">
                <div class="rev-skeleton-panel wide"></div>
                <div class="rev-skeleton-panel"></div>
                <div class="rev-skeleton-panel"></div>
            </div>
            <p class="rev-skeleton-label">${escapeHtml(t.revenue_student_loading || t.revenue_kpi_analyzing || 'Loading…')}</p>
        </section>`;
}
