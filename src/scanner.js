/**
 * QR scanner and attendance: startScanner, stopScanner, handleScan, confirmAttendance, updateStickyFooterVisibility.
 * Effective balance logic mirrors backend deduct_student_classes (effective = max(balance, sum(non-expired pack counts))).
 */
import { supabaseClient } from './config.js';
import { escapeHtml } from './config.js';
import { state, saveState } from './state.js';
import { refreshSingleStudent } from './data.js';

let html5QrCode;

/**
 * Compute effective balances for group/private/event to match backend deduct_student_classes.
 * Returns { group, groupUnlimited, private: number, event: number }.
 * groupUnlimited: true if balance is null or any non-expired pack has null/undefined count.
 */
export function getEffectiveBalances(student, now = new Date()) {
    const packs = student?.active_packs || [];
    const activePacks = packs.filter(p => {
        const exp = p.expires_at ? new Date(p.expires_at) : null;
        return !exp || exp > now;
    });
    const hasUnlimitedPack = activePacks.some(p => p.count == null || p.count === 'null');
    const groupUnlimited = student?.balance === null || student?.balance === undefined || hasUnlimitedPack;
    const sumGroup = activePacks.reduce((s, p) => s + (parseInt(p.count, 10) || 0), 0);
    const group = groupUnlimited ? null : Math.max(student?.balance ?? 0, sumGroup);
    const sumPrivate = activePacks.reduce((s, p) => s + (p.private_count || 0), 0);
    const privateBal = Math.max(student?.balance_private ?? 0, sumPrivate);
    const sumEvents = activePacks.reduce((s, p) => s + (p.event_count || 0), 0);
    const eventBal = Math.max(student?.balance_events ?? 0, sumEvents);
    return { group, groupUnlimited, private: privateBal, event: eventBal };
}

export async function startScanner() {
    try {
        const modal = document.getElementById('scanner-modal');
        modal.classList.remove('hidden');
        document.getElementById('inline-scan-result').innerHTML = '';
        const scanHint = document.getElementById('scan-align-hint');
        if (scanHint) scanHint.style.display = '';

        if (html5QrCode) {
            try {
                await html5QrCode.stop();
            } catch (e) {
                console.warn("Error stopping existing scanner:", e);
            }
            html5QrCode = null;
        }

        const config = {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        const scanSuccess = (id) => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.pause(false);
            }
            handleScan(id);
        };

        const constraints = [
            { facingMode: "environment" },
            { facingMode: "user" },
            { video: true }
        ];
        let lastErr;
        for (const c of constraints) {
            try {
                html5QrCode = new Html5Qrcode("reader");
                await html5QrCode.start(c, config, scanSuccess, () => { });
                return;
            } catch (err) {
                console.warn("Scanner start attempt failed:", c, err);
                lastErr = err;
                if (html5QrCode) {
                    try { await html5QrCode.stop(); } catch (_) {}
                    html5QrCode = null;
                }
            }
        }
        const msg = (lastErr?.message || String(lastErr)).toLowerCase();
        const friendlyMsg = msg.includes("not found") || msg.includes("notfound")
            ? (typeof window.t === 'function' ? window.t('camera_not_found') : "No camera found. Please connect a camera or use a device with a built-in camera.")
            : msg.includes("permission") || msg.includes("denied")
                ? (typeof window.t === 'function' ? window.t('camera_permission_denied') : "Camera access denied. Please allow camera in your browser settings.")
                : "Camera error: " + (lastErr?.message || lastErr);
        alert(friendlyMsg);
    } catch (err) {
        console.error("Scanner setup error:", err);
        alert("Camera access denied or error: " + err);
    }
}

export async function stopScanner() {
    document.getElementById('scanner-modal').classList.add('hidden');
    if (html5QrCode) {
        try {
            if (html5QrCode.isScanning) {
                await html5QrCode.stop();
            }
        } catch (err) {
            console.error("Error stopping scanner:", err);
        } finally {
            html5QrCode = null;
        }
    }
}

export async function handleScan(scannedId) {
    const id = (scannedId || '').trim();
    let student = state.students.find(s => s.id === id || s.user_id === id);
    const resultEl = document.getElementById('inline-scan-result');
    const scanHint = document.getElementById('scan-align-hint');
    if (scanHint) scanHint.style.display = 'none';
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });

    if (!student) {
        resultEl.innerHTML = `
            <div class="card" style="border-color: var(--danger); background: rgba(251, 113, 133, 0.1); padding: 1rem;">
                <h2 style="color: var(--danger); font-size: 1rem;">${t('scan_fail')}</h2>
                <p style="margin-top:0.3rem">${t('not_found_msg')}: [${escapeHtml(id.substring(0, 8))}...]</p>
                <button class="btn-primary mt-2 w-full" onclick="window.cancelAttendance()">${t('close')}</button>
            </div>
        `;
        return;
    }

    const schoolId = state.currentSchool?.id;
    if (schoolId && supabaseClient) {
        await refreshSingleStudent(student.id, schoolId);
        student = state.students.find(s => String(s.id) === String(student.id)) || student;
    }
    const regEnabled = state.currentSchool?.class_registration_enabled;

    let todayRegs = [];
    if (regEnabled && supabaseClient && schoolId) {
        try {
            await supabaseClient.rpc('process_expired_registrations', { p_school_id: schoolId });
            const { data, error } = await supabaseClient.rpc('get_student_registrations_for_today', {
                p_student_id: String(id),
                p_school_id: schoolId
            });
            if (!error && data) {
                todayRegs = Array.isArray(data) ? data : (typeof data === 'string' ? JSON.parse(data) : []);
            }
        } catch (e) { console.warn('Error checking registrations:', e); }
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const todaysPrivateLessons = (state.privateLessons || []).filter(
        (l) => String(l.student_id) === String(student.id) && new Date(l.start_at_utc) >= todayStart && new Date(l.start_at_utc) < todayEnd && (l.status === 'confirmed' || l.status === 'attended')
    );

    const now = new Date();
    const eff = getEffectiveBalances(student, now);
    const isPT = state.currentSchool?.profile_type === 'private_teacher';
    const hasDualScanMode = isPT || (state.currentSchool?.private_packages_enabled !== false && state.adminSettings?.private_classes_offering_enabled === 'true');
    const hasEventsEnabled = state.currentSchool?.events_packages_enabled !== false && state.adminSettings?.events_offering_enabled === 'true';
    const hasGroupLeft = eff.groupUnlimited || (eff.group != null && eff.group > 0);
    const hasPrivateLeft = eff.private > 0;
    const hasEventsLeft = eff.event > 0;
    const effectivePrivate = eff.private;
    const effectiveEvents = eff.event;
    if (!state.scanDeductionType || (state.scanDeductionType !== 'group' && state.scanDeductionType !== 'private' && state.scanDeductionType !== 'event')) {
        state.scanDeductionType = isPT ? 'private' : 'group';
    }
    const hasAnyBalance = hasGroupLeft || (hasDualScanMode && hasPrivateLeft) || (hasEventsEnabled && hasEventsLeft);
    const hasValidPass = hasAnyBalance;
    const hasNoClasses = !hasAnyBalance;

    if (todayRegs.length > 0 && hasValidPass) {
        const regsHtml = todayRegs.map(r => `
            <div style="background: rgba(52, 199, 89, 0.1); border: 1px solid var(--secondary); border-radius: 12px; padding: 0.6rem 0.8rem; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                    <i data-lucide="check-circle" size="14" style="color: var(--secondary);"></i>
                    <span style="font-size: 0.85rem; font-weight: 700; color: var(--secondary);">${t('student_registered_for')}</span>
                </div>
                <div style="font-size: 0.95rem; font-weight: 600;">${escapeHtml(r.class_name)} <span class="text-muted">@ ${escapeHtml(r.class_time)}</span></div>
            </div>
        `).join('');

        const regBtns = todayRegs.map(r => `
            <button class="btn-primary w-full" onclick="window.confirmRegisteredAttendance('${escapeHtml(r.id)}', '${escapeHtml(student.id)}')" style="padding: 0.5rem 0.65rem; font-size: 0.8rem; margin-bottom: 0.35rem;">
                <i data-lucide="check" size="14" style="margin-right: 6px;"></i> ${t('confirm_attendance_registered')} – ${escapeHtml(r.class_name)}
            </button>
        `).join('');

        const privateLessonSection = todaysPrivateLessons.length > 0
            ? todaysPrivateLessons.map((l) => {
                const timeStr = new Date(l.start_at_utc).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                const checkedIn = l.status === 'attended';
                const checkInBtn = !checkedIn && l.status === 'confirmed'
                    ? `<button class="btn-primary w-full" onclick="window.handleScannerPrivateCheckIn('${escapeHtml(l.id)}')" style="padding: 0.5rem 0.65rem; font-size: 0.8rem; margin-bottom: 0.35rem;"><i data-lucide="check" size="14" style="margin-right: 6px;"></i> ${t('check_in_btn') || 'Check in'} – Private lesson ${timeStr}</button>`
                    : checkedIn
                        ? `<div style="background: rgba(52, 199, 89, 0.1); border: 1px solid var(--secondary); border-radius: 12px; padding: 0.5rem 0.8rem; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--secondary);"><i data-lucide="check-circle" size="14" style="vertical-align: middle; margin-right: 6px;"></i>${t('checked_in') || 'Checked in'} – Private lesson ${timeStr}</div>`
                        : '';
                return checkInBtn;
            }).join('')
            : '';

        const regBalanceLabel = hasDualScanMode
            ? `${t('group_classes_remaining') || 'Group'}: ${eff.groupUnlimited ? t('unlimited') : (eff.group ?? student.balance ?? 0)} | ${t('private_classes_remaining') || 'Private'}: ${effectivePrivate}${hasEventsEnabled ? ' | ' + (t('events_remaining') || 'Events') + ': ' + effectiveEvents : ''}`
            : `${t('remaining_classes')}: ${eff.groupUnlimited ? t('unlimited') : (eff.group ?? student.balance ?? 0)}${hasEventsEnabled ? ' | ' + (t('events_remaining') || 'Events') + ': ' + effectiveEvents : ''}`;
        resultEl.innerHTML = `
            <div class="card" style="border-radius: 16px; padding: 0.85rem; text-align: left; border: 2px solid var(--secondary); background: var(--background);">
                <h3 style="font-size: 0.95rem; margin:0 0 0.4rem;">${escapeHtml(student.name)}</h3>
                <div style="font-size: 0.8rem; font-weight: 600; color: var(--secondary); margin-bottom: 0.6rem;">
                    ${regBalanceLabel}
                </div>
                ${regsHtml}
                ${privateLessonSection ? `<div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin: 0.5rem 0 0.25rem;">${t('private_lesson') || 'Private lesson'}</div>${privateLessonSection}` : ''}
                <div style="font-size: 0.7rem; color: var(--text-secondary); text-align: center; margin: 0.4rem 0;">
                    <i data-lucide="info" size="12" style="vertical-align: middle; margin-right: 4px;"></i>${t('class_will_deduct')}
                </div>
                ${regBtns}
                <div style="border-top: 1px solid var(--border); margin-top: 0.4rem; padding-top: 0.4rem;">
                    <div style="font-size: 0.7rem; color: var(--text-secondary); text-align: center; margin-bottom: 0.25rem;">${t('no_manual_deduction')}</div>
                </div>
                <div style="text-align: center; margin-top: 0.5rem;">
                    <button type="button" onclick="window.cancelAttendance()" style="background: none; border: none; color: var(--text-secondary); font-size: 0.75rem; padding: 0.25rem 0.5rem; cursor: pointer; opacity: 0.8;">${t('cancel')}</button>
                </div>
            </div>
        `;
    } else if (hasNoClasses) {
        resultEl.innerHTML = `
            <div class="card" style="border-color: var(--system-orange); background: rgba(255, 149, 0, 0.1); padding: 1rem; text-align: center;">
                <h3 style="font-size: 1rem; margin:0;">${escapeHtml(student.name)}</h3>
                <p style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin: 0.75rem 0;">${t('no_classes_buy_package')}</p>
                <button class="btn-primary mt-2 w-full" onclick="window.cancelAttendance()">${t('close')}</button>
            </div>
        `;
    } else if (hasValidPass) {
        const maxDeductGroup = eff.groupUnlimited ? 99 : Math.max(1, eff.group ?? 0);
        const maxDeductPrivate = Math.max(1, effectivePrivate);
        const balanceLabelDual = `${t('group_classes_remaining') || 'Group'}: ${eff.groupUnlimited ? t('unlimited') : (eff.group ?? 0)} | ${t('private_classes_remaining') || 'Private'}: ${effectivePrivate}${hasEventsEnabled ? ' | ' + (t('events_remaining') || 'Events') + ': ' + effectiveEvents : ''}`;
        const balanceLabelSingle = `${t('remaining_classes')}: ${eff.groupUnlimited ? t('unlimited') : (eff.group ?? 0)}${hasEventsEnabled ? ' | ' + (t('events_remaining') || 'Events') + ': ' + effectiveEvents : ''}`;
        const balanceLabel = hasDualScanMode ? balanceLabelDual : balanceLabelSingle;

        const groupRow = hasGroupLeft ? `
                <div style="margin-bottom: ${hasDualScanMode ? '0.75rem' : '0'};">
                    ${hasDualScanMode ? `<div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">${t('deduct_group_classes') || 'Deduct group classes'}</div>` : ''}
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-top: 0.2rem;">
                        <button class="btn-primary" onclick="window.confirmAttendance('${escapeHtml(student.id)}', 1, 'group')" style="padding: 0.5rem 0.65rem; font-size: 0.8rem;">${t('one_class')}</button>
                        <button class="btn-secondary" onclick="window.confirmAttendance('${escapeHtml(student.id)}', 2, 'group')" style="padding: 0.5rem 0.65rem; font-size: 0.8rem;">${t('two_classes')}</button>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem; margin-top: 0.4rem;">
                        <label style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); white-space: nowrap;">${t('custom_classes_label')}:</label>
                        <input type="number" id="scan-custom-count-group" min="1" max="${maxDeductGroup}" placeholder="0" style="flex:1; max-width: 70px; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-size: 0.85rem; font-weight: 600; box-sizing: border-box;" inputmode="numeric">
                        <button class="btn-primary" onclick="var el = document.getElementById('scan-custom-count-group'); var n = parseInt(el && el.value ? el.value : 0, 10); if (n >= 1) window.confirmAttendance('${escapeHtml(student.id)}', n, 'group'); else alert(window.t('deduct_invalid_amount'));" style="padding: 0.4rem 0.7rem; font-size: 0.8rem;">${t('deduct_btn')}</button>
                    </div>
                </div>` : '';

        const privateRow = (hasDualScanMode && hasPrivateLeft) ? `
                <details style="border-top: 1px solid var(--border); padding-top: 0.75rem; margin-top: 0.4rem;">
                    <summary class="scan-private-summary" style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); cursor: pointer; list-style: none; display: flex; align-items: center; gap: 6px; padding: 0.35rem 0;">
                        <span class="scan-private-arrow" style="opacity: 0.7; display: inline-block; transition: transform 0.2s;">▶</span> ${t('deduct_private_classes') || 'Deduct private classes'}
                    </summary>
                    <div style="margin-top: 0.4rem;">
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 0.4rem;">
                            <button class="btn-primary" onclick="window.confirmAttendance('${escapeHtml(student.id)}', 1, 'private')" style="padding: 0.5rem 0.65rem; font-size: 0.8rem;">${t('one_class')}</button>
                            <button class="btn-secondary" onclick="window.confirmAttendance('${escapeHtml(student.id)}', 2, 'private')" style="padding: 0.5rem 0.65rem; font-size: 0.8rem;">${t('two_classes')}</button>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.4rem; margin-top: 0.4rem;">
                            <label style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); white-space: nowrap;">${t('custom_classes_label')}:</label>
                            <input type="number" id="scan-custom-count-private" min="1" max="${maxDeductPrivate}" placeholder="0" style="flex:1; max-width: 70px; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--text-primary); font-size: 0.85rem; font-weight: 600; box-sizing: border-box;" inputmode="numeric">
                            <button class="btn-primary" onclick="var el = document.getElementById('scan-custom-count-private'); var n = parseInt(el && el.value ? el.value : 0, 10); if (n >= 1) window.confirmAttendance('${escapeHtml(student.id)}', n, 'private'); else alert(window.t('deduct_invalid_amount'));" style="padding: 0.4rem 0.7rem; font-size: 0.8rem;">${t('deduct_btn')}</button>
                        </div>
                    </div>
                </details>` : '';

        const eventRow = (hasEventsEnabled && hasEventsLeft) ? `
                <details style="border-top: 1px solid var(--border); padding-top: 0.75rem; margin-top: 0.4rem;">
                    <summary class="scan-event-summary" style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); cursor: pointer; list-style: none; display: flex; align-items: center; gap: 6px; padding: 0.35rem 0;">
                        <span class="scan-event-arrow" style="opacity: 0.7; display: inline-block; transition: transform 0.2s;">▶</span> ${t('deduct_one_event') || 'Deduct event'}
                    </summary>
                    <div style="margin-top: 0.4rem;">
                        <button class="btn-primary w-full" onclick="window.confirmAttendance('${escapeHtml(student.id)}', 1, 'event')" style="padding: 0.5rem 0.65rem; font-size: 0.8rem;">${t('deduct_one_event') || 'Deduct 1 event'}</button>
                    </div>
                </details>` : '';

        const privateLessonBlock = todaysPrivateLessons.length > 0
            ? todaysPrivateLessons.map((l) => {
                const timeStr = new Date(l.start_at_utc).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                const checkedIn = l.status === 'attended';
                return !checkedIn && l.status === 'confirmed'
                    ? `<div style="margin-top: 0.5rem;"><div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.25rem;">${t('private_lesson') || 'Private lesson'} ${timeStr}</div><button class="btn-primary w-full" onclick="window.handleScannerPrivateCheckIn('${escapeHtml(l.id)}')" style="padding: 0.5rem 0.65rem; font-size: 0.8rem;"><i data-lucide="check" size="14" style="margin-right: 6px;"></i> ${t('check_in_btn') || 'Check in'}</button></div>`
                    : checkedIn
                        ? `<div style="margin-top: 0.5rem; background: rgba(52, 199, 89, 0.1); border: 1px solid var(--secondary); border-radius: 12px; padding: 0.5rem 0.8rem; font-size: 0.85rem; color: var(--secondary);"><i data-lucide="check-circle" size="14" style="vertical-align: middle; margin-right: 6px;"></i>${t('checked_in') || 'Checked in'} – Private lesson ${timeStr}</div>`
                        : '';
            }).join('')
            : '';

        resultEl.innerHTML = `
            <div class="card" style="border-radius: 16px; padding: 0.85rem; text-align: left; border: 2px solid var(--secondary); background: var(--background);">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div>
                        <h3 style="font-size: 0.95rem; margin:0;">${escapeHtml(student.name)}</h3>
                        <div style="font-size: 0.85rem; font-weight: 700; color: var(--secondary);">
                            ${balanceLabel}
                        </div>
                    </div>
                </div>
                ${privateLessonBlock}
                ${groupRow}
                ${privateRow}
                ${eventRow}
            </div>
        `;
    } else {
        resultEl.innerHTML = `
            <div class="card" style="border-color: var(--danger); background: rgba(251, 113, 133, 0.1); padding: 1rem;">
                <h2 style="color: var(--danger); font-size: 1rem;">${t('scan_fail')}</h2>
                <p style="margin-top:0.3rem">${escapeHtml(student.name)}</p>
                <p style="font-size:0.75rem; color:var(--danger)">${t('inactive')}</p>
                <button class="btn-primary mt-2 w-full" onclick="window.cancelAttendance()">${t('close')}</button>
            </div>
        `;
    }
    if (window.lucide) window.lucide.createIcons();
}

export async function handleScannerPrivateCheckIn(lessonId) {
    if (state.scanDeductionLoading) return;
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    const resultEl = document.getElementById('inline-scan-result');

    state.scanDeductionLoading = true;
    resultEl.innerHTML = `
        <div class="card" style="border-radius: 16px; padding: 1rem; text-align: center; border: 2px solid var(--secondary); background: var(--background);">
            <div class="spin" style="color: var(--secondary); margin: 0 auto 0.6rem;"><i data-lucide="loader-2" size="32"></i></div>
            <div style="font-weight: 600; font-size: 0.9rem;">${t('scan_deducting')}</div>
        </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
        await window.markPrivateLessonAttended(lessonId);
        cancelAttendance();
    } catch (e) {
        console.error('Error checking in private lesson:', e);
        resultEl.innerHTML = `
            <div class="card" style="border-color: var(--danger); background: rgba(251, 113, 133, 0.1); padding: 1rem;">
                <p style="color: var(--danger);">${escapeHtml(e.message || t('error_confirming_attendance'))}</p>
                <button class="btn-primary mt-2 w-full" onclick="window.cancelAttendance()">${t('close')}</button>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    } finally {
        state.scanDeductionLoading = false;
    }
}

export function cancelAttendance() {
    state.scanDeductionLoading = false;
    document.getElementById('inline-scan-result').innerHTML = '';
    const scanHint = document.getElementById('scan-align-hint');
    if (scanHint) scanHint.style.display = '';
    if (html5QrCode) {
        try {
            html5QrCode.resume();
        } catch (e) {
            console.warn("Could not resume scanner:", e);
        }
    }
}

export async function confirmRegisteredAttendance(registrationId, studentId) {
    const schoolId = state.currentSchool?.id;
    if (!schoolId || !supabaseClient) return;
    if (state.scanDeductionLoading) return;
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    const resultEl = document.getElementById('inline-scan-result');

    state.scanDeductionLoading = true;
    resultEl.innerHTML = `
        <div class="card" style="border-radius: 16px; padding: 1rem; text-align: center; border: 2px solid var(--secondary); background: var(--background);">
            <div class="spin" style="color: var(--secondary); margin: 0 auto 0.6rem;"><i data-lucide="loader-2" size="32"></i></div>
            <div style="font-weight: 600; font-size: 0.9rem;">${t('scan_deducting')}</div>
        </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
        const { error } = await supabaseClient.rpc('mark_registration_attended', {
            p_registration_id: registrationId,
            p_school_id: schoolId
        });
        if (error) throw error;
        if (studentId) {
            await refreshSingleStudent(studentId, schoolId);
        }

        resultEl.innerHTML = `
            <div class="card" style="border-radius: 20px; padding: 1.5rem; text-align: center; border: 2px solid var(--secondary); background: var(--background);">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--secondary); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.8rem;">
                    <i data-lucide="check" size="24" style="color: white;"></i>
                </div>
                <h3 style="font-size: 1rem; color: var(--secondary); margin: 0;">${t('attendance_success')}</h3>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.3rem 0 1rem;">${t('auto_deducted')}</p>
                <button class="btn-primary w-full" onclick="window.cancelAttendance()" style="padding: 0.8rem;">${t('close')}</button>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    } catch (e) {
        console.error('Error confirming registered attendance:', e);
        resultEl.innerHTML = `
            <div class="card" style="border-color: var(--danger); background: rgba(251, 113, 133, 0.1); padding: 1rem;">
                <p style="color: var(--danger);">${escapeHtml(e.message || t('error_confirming_attendance'))}</p>
                <button class="btn-primary mt-2 w-full" onclick="window.cancelAttendance()">${t('close')}</button>
            </div>
        `;
    } finally {
        state.scanDeductionLoading = false;
    }
}

export async function confirmAttendance(studentId, count, classType) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;
    if (state.scanDeductionLoading) return;
    if (classType !== 'group' && classType !== 'private' && classType !== 'event') classType = (state.scanDeductionType === 'private') ? 'private' : (state.scanDeductionType === 'event') ? 'event' : 'group';
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    const countNum = typeof count === 'number' ? count : parseInt(count, 10);
    if (!Number.isInteger(countNum) || countNum < 1) {
        alert(t('deduct_invalid_amount'));
        return;
    }
    const resultEl = document.getElementById('inline-scan-result');

    const now = new Date();
    const eff = getEffectiveBalances(student, now);
    const checkBalance = classType === 'private'
        ? (eff.private < countNum)
        : classType === 'event'
        ? (eff.event < countNum)
        : (!eff.groupUnlimited && (eff.group == null || eff.group < countNum));
    if (checkBalance) {
        alert(t('not_enough_balance'));
        return;
    }

    state.scanDeductionLoading = true;
    resultEl.innerHTML = `
        <div class="card" style="border-radius: 16px; padding: 1rem; text-align: center; border: 2px solid var(--secondary); background: var(--background);">
            <div class="spin" style="color: var(--secondary); margin: 0 auto 0.6rem;"><i data-lucide="loader-2" size="32"></i></div>
            <div style="font-weight: 600; font-size: 0.9rem;">${t('scan_deducting')}</div>
        </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    const schoolId = student.school_id || state.currentSchool?.id;
    try {
        if (!supabaseClient || !schoolId) {
            throw new Error(t('error_confirming_attendance') || 'Cannot deduct: no connection');
        }
        const { error: rpcError } = await supabaseClient.rpc('deduct_student_classes', {
            p_student_id: String(studentId),
            p_school_id: schoolId,
            p_count: countNum,
            p_class_type: classType
        });
        if (rpcError) {
            throw new Error(rpcError.message || t('error_confirming_attendance'));
        }
        await refreshSingleStudent(studentId, schoolId);
        const updatedStudent = state.students.find(s => String(s.id) === String(studentId)) || student;
        const effAfter = getEffectiveBalances(updatedStudent, new Date());
        const newRemaining = classType === 'private'
            ? effAfter.private
            : classType === 'event'
            ? effAfter.event
            : (effAfter.groupUnlimited ? t('unlimited') : (effAfter.group ?? 0));
        const unitLabel = classType === 'event'
            ? (countNum === 1 ? t('event_unit') : t('events_unit'))
            : (countNum === 1 ? t('class_unit') : t('classes_unit'));
        const remainingLabel = classType === 'event'
            ? t('events_remaining')
            : classType === 'private'
            ? t('private_classes_remaining')
            : t('remaining_classes');
        resultEl.innerHTML = `
        <div class="card" style="border-color: var(--secondary); background: rgba(45, 212, 191, 0.1); padding: 1rem; text-align:center;">
             <i data-lucide="check-circle" size="32" style="color: var(--secondary)"></i>
             <div style="font-weight:700; color:var(--secondary)">${t('attendance_success')}</div>
             <div style="font-size:0.9rem; margin-top:0.25rem">${(updatedStudent && updatedStudent.name) || student.name} &minus;${countNum} ${unitLabel}</div>
             <div style="font-size:0.85rem; font-weight:600; color:var(--text-secondary); margin-top:0.5rem">${remainingLabel}: ${newRemaining}</div>
        </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => {
            resultEl.innerHTML = '';
            const scanHint = document.getElementById('scan-align-hint');
            if (scanHint) scanHint.style.display = '';
            if (html5QrCode) {
                try {
                    html5QrCode.resume();
                } catch (e) {
                    console.warn("Could not resume scanner:", e);
                }
            }
        }, 800);
    } catch (e) {
        console.error('Error confirming attendance:', e);
        resultEl.innerHTML = `
            <div class="card" style="border-color: var(--danger); background: rgba(251, 113, 133, 0.1); padding: 1rem;">
                <p style="color: var(--danger);">${escapeHtml(e.message || t('error_confirming_attendance'))}</p>
                <button class="btn-primary mt-2 w-full" onclick="window.cancelAttendance()">${t('close')}</button>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    } finally {
        state.scanDeductionLoading = false;
    }
}

export function updateStickyFooterVisibility() {
    const el = document.querySelector('.sticky-footer-inner');
    if (!el) return;
    const threshold = 80;
    const scrollHeight = document.documentElement.scrollHeight;
    const atBottom = window.scrollY + window.innerHeight >= scrollHeight - threshold;
    const noScroll = scrollHeight <= window.innerHeight + threshold;
    el.classList.toggle('sticky-footer-visible', atBottom || noScroll);
}
