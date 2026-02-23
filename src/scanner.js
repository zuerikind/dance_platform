/**
 * QR scanner and attendance: startScanner, stopScanner, handleScan, confirmAttendance, updateStickyFooterVisibility.
 */
import { supabaseClient } from './config.js';
import { escapeHtml } from './config.js';
import { state, saveState } from './state.js';
import { fetchAllData } from './data.js';

let html5QrCode;

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
    const student = state.students.find(s => s.id === id || s.user_id === id);
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

    const packs = student.active_packs || [];
    const now = new Date();
    const activePacks = packs.filter(p => new Date(p.expires_at) > now);
    const hasUnlimitedPack = activePacks.some(p => p.count == null || p.count === 'null');
    const isUnlimitedGroup = student.balance === null || hasUnlimitedPack;
    const isPT = state.currentSchool?.profile_type === 'private_teacher';
    const hasDualScanMode = isPT || (state.currentSchool?.private_packages_enabled !== false && state.adminSettings?.private_classes_offering_enabled === 'true');
    const hasEventsEnabled = state.currentSchool?.events_packages_enabled !== false && state.adminSettings?.events_offering_enabled === 'true';
    const effectivePrivate = Math.max(student.balance_private ?? 0, activePacks.reduce((s, p) => s + (p.private_count || 0), 0));
    const effectiveEvents = Math.max(student.balance_events ?? 0, activePacks.reduce((s, p) => s + (p.event_count || 0), 0));
    const hasGroupLeft = isUnlimitedGroup || (student.balance != null && student.balance > 0) || activePacks.some(p => (parseInt(p.count, 10) || 0) > 0);
    const hasPrivateLeft = effectivePrivate > 0;
    const hasEventsLeft = effectiveEvents > 0;
    if (!state.scanDeductionType || (state.scanDeductionType !== 'group' && state.scanDeductionType !== 'private' && state.scanDeductionType !== 'event')) {
        state.scanDeductionType = isPT ? 'private' : 'group';
    }
    const hasValidPass = student.paid && (hasGroupLeft || (hasDualScanMode && hasPrivateLeft) || (hasEventsEnabled && hasEventsLeft));
    const hasNoClasses = student.paid && !hasGroupLeft && !hasPrivateLeft && !hasEventsLeft;

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
            <button class="btn-primary w-full" onclick="window.confirmRegisteredAttendance('${escapeHtml(r.id)}')" style="padding: 0.5rem 0.65rem; font-size: 0.8rem; margin-bottom: 0.35rem;">
                <i data-lucide="check" size="14" style="margin-right: 6px;"></i> ${t('confirm_attendance_registered')} – ${escapeHtml(r.class_name)}
            </button>
        `).join('');

        const privateLessonSection = todaysPrivateLessons.length > 0
            ? todaysPrivateLessons.map((l) => {
                const timeStr = new Date(l.start_at_utc).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                const checkedIn = l.status === 'attended';
                const checkInBtn = !checkedIn && l.status === 'confirmed'
                    ? `<button class="btn-primary w-full" onclick="window.markPrivateLessonAttended('${escapeHtml(l.id)}'); window.cancelAttendance();" style="padding: 0.5rem 0.65rem; font-size: 0.8rem; margin-bottom: 0.35rem;"><i data-lucide="check" size="14" style="margin-right: 6px;"></i> ${t('check_in_btn') || 'Check in'} – Private lesson ${timeStr}</button>`
                    : checkedIn
                        ? `<div style="background: rgba(52, 199, 89, 0.1); border: 1px solid var(--secondary); border-radius: 12px; padding: 0.5rem 0.8rem; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--secondary);"><i data-lucide="check-circle" size="14" style="vertical-align: middle; margin-right: 6px;"></i>${t('checked_in') || 'Checked in'} – Private lesson ${timeStr}</div>`
                        : '';
                return checkInBtn;
            }).join('')
            : '';

        const regBalanceLabel = hasDualScanMode
            ? `${t('group_classes_remaining') || 'Group'}: ${student.balance === null ? t('unlimited') : student.balance} | ${t('private_classes_remaining') || 'Private'}: ${effectivePrivate}${hasEventsEnabled ? ' | ' + (t('events_remaining') || 'Events') + ': ' + effectiveEvents : ''}`
            : `${t('remaining_classes')}: ${student.balance === null ? t('unlimited') : student.balance}${hasEventsEnabled ? ' | ' + (t('events_remaining') || 'Events') + ': ' + effectiveEvents : ''}`;
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
        const maxDeductGroup = (student.balance === null || student.balance === undefined) ? 99 : Math.max(1, student.balance);
        const maxDeductPrivate = Math.max(1, effectivePrivate);
        const balanceLabelDual = `${t('group_classes_remaining') || 'Group'}: ${student.balance === null ? t('unlimited') : student.balance} | ${t('private_classes_remaining') || 'Private'}: ${effectivePrivate}${hasEventsEnabled ? ' | ' + (t('events_remaining') || 'Events') + ': ' + effectiveEvents : ''}`;
        const balanceLabelSingle = `${t('remaining_classes')}: ${student.balance === null ? t('unlimited') : student.balance}${hasEventsEnabled ? ' | ' + (t('events_remaining') || 'Events') + ': ' + effectiveEvents : ''}`;
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
                    ? `<div style="margin-top: 0.5rem;"><div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.25rem;">${t('private_lesson') || 'Private lesson'} ${timeStr}</div><button class="btn-primary w-full" onclick="window.markPrivateLessonAttended('${escapeHtml(l.id)}'); window.cancelAttendance();" style="padding: 0.5rem 0.65rem; font-size: 0.8rem;"><i data-lucide="check" size="14" style="margin-right: 6px;"></i> ${t('check_in_btn') || 'Check in'}</button></div>`
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

export function cancelAttendance() {
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

export async function confirmRegisteredAttendance(registrationId) {
    const schoolId = state.currentSchool?.id;
    if (!schoolId || !supabaseClient) return;
    const t = new Proxy(window.t, {
        get: (target, prop) => typeof prop === 'string' ? target(prop) : target[prop]
    });
    const resultEl = document.getElementById('inline-scan-result');

    try {
        const { error } = await supabaseClient.rpc('mark_registration_attended', {
            p_registration_id: registrationId,
            p_school_id: schoolId
        });
        if (error) throw error;

        if (supabaseClient && schoolId) {
            const { data: freshStudents } = await supabaseClient.rpc('get_school_students', { p_school_id: schoolId });
            if (freshStudents) state.students = freshStudents;
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
    }
}

export async function confirmAttendance(studentId, count, classType) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;
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

    const packs = student.active_packs || [];
    const now = new Date();
    const activePacks = packs.filter(p => new Date(p.expires_at) > now);
    const hasUnlimitedPack = activePacks.some(p => p.count == null || p.count === 'null');
    const isUnlimited = student.balance === null || hasUnlimitedPack;
    const effectivePrivate = Math.max(student.balance_private ?? 0, activePacks.reduce((s, p) => s + (p.private_count || 0), 0));
    const effectiveEvents = Math.max(student.balance_events ?? 0, activePacks.reduce((s, p) => s + (p.event_count || 0), 0));

    const checkBalance = classType === 'private'
        ? (effectivePrivate < countNum)
        : classType === 'event'
        ? (effectiveEvents < countNum)
        : (!isUnlimited && student.balance !== null && student.balance < countNum);
    if (checkBalance) {
        alert(t('not_enough_balance'));
        return;
    }

    const shouldDeduct = classType === 'private' ? (effectivePrivate >= countNum) : classType === 'event' ? (effectiveEvents >= countNum) : (!isUnlimited && student.balance !== null);
    if (shouldDeduct) {
        const schoolId = student.school_id || state.currentSchool?.id;
        let updated = false;

        if (supabaseClient && schoolId) {
            const { error: rpcError } = await supabaseClient.rpc('deduct_student_classes', {
                p_student_id: String(studentId),
                p_school_id: schoolId,
                p_count: countNum,
                p_class_type: classType
            });
            if (!rpcError) {
                updated = true;
                const now = new Date();
                const packs = student.active_packs.slice().sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));
                let remaining = countNum;
                for (const pack of packs) {
                    if (remaining <= 0) break;
                    if (new Date(pack.expires_at) <= now) continue;
                    if (classType === 'private') {
                        const c = pack.private_count ?? 0;
                        const deduct = Math.min(c, remaining);
                        pack.private_count = c - deduct;
                        remaining -= deduct;
                    } else if (classType === 'event') {
                        const c = pack.event_count ?? 0;
                        const deduct = Math.min(c, remaining);
                        pack.event_count = c - deduct;
                        remaining -= deduct;
                    } else {
                        const c = (pack.count || 0);
                        const deduct = Math.min(c, remaining);
                        pack.count = c - deduct;
                        remaining -= deduct;
                    }
                }
                student.active_packs = packs.filter(p => (classType === 'private' ? (p.private_count || 0) : classType === 'event' ? (p.event_count || 0) : (p.count || 0)) > 0 || new Date(p.expires_at) <= now);
                if (classType === 'private') {
                    student.balance_private = Math.max(0, (student.balance_private ?? 0) - countNum);
                } else if (classType === 'event') {
                    student.balance_events = student.active_packs.filter(p => new Date(p.expires_at) > now).reduce((s, p) => s + (p.event_count || 0), 0);
                } else {
                    student.balance = (student.balance || 0) - countNum;
                }
            }
        }

        if (!updated && classType === 'group') {
            const now = new Date();
            const allPacks = Array.isArray(student.active_packs) ? [...student.active_packs] : [];
            const activePacks = allPacks.filter(p => new Date(p.expires_at) > now).sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));
            let remainingToDeduct = countNum;

            if (activePacks.length > 0) {
                for (let i = 0; i < activePacks.length && remainingToDeduct > 0; i++) {
                    const pack = activePacks[i];
                    const c = pack.count || 0;
                    if (c >= remainingToDeduct) {
                        pack.count = c - remainingToDeduct;
                        remainingToDeduct = 0;
                    } else {
                        remainingToDeduct -= c;
                        pack.count = 0;
                    }
                }
                const expiredPacks = allPacks.filter(p => new Date(p.expires_at) <= now);
                const updatedPacks = [...activePacks.filter(p => (p.count || 0) > 0), ...expiredPacks];
                const newBalance = updatedPacks.filter(p => new Date(p.expires_at) > now).reduce((sum, p) => sum + (parseInt(p.count) || 0), 0);
                if (supabaseClient) {
                    const { error } = await supabaseClient.from('students').update({ balance: newBalance, active_packs: updatedPacks }).eq('id', studentId);
                    if (error) { alert("Error updating balance: " + error.message); return; }
                }
                student.balance = newBalance;
                student.active_packs = updatedPacks;
            } else {
                const newBalance = student.balance - countNum;
                if (supabaseClient) {
                    const { error } = await supabaseClient.from('students').update({ balance: newBalance }).eq('id', studentId);
                    if (error) { alert("Error updating balance: " + error.message); return; }
                }
                student.balance = newBalance;
            }
        }

        saveState();
        await fetchAllData();
    }

    const newRemaining = classType === 'private'
        ? (student.balance_private ?? 0)
        : classType === 'event'
        ? (student.balance_events ?? 0)
        : (isUnlimited ? t('unlimited') : (student.balance ?? 0));
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
             <div style="font-size:0.9rem; margin-top:0.25rem">${student.name} &minus;${countNum} ${unitLabel}</div>
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
    }, 2000);
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
