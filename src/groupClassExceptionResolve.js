/**
 * Mirrors public.group_class_exception_resolve semantics for registration gating.
 * exception_kind 'info' is display-only: does NOT block self-serve registration (matches SQL).
 */

export function registrationClosedFromExceptionKind(kind) {
    const k = String(kind || '').trim().toLowerCase();
    return k === 'cancelled' || k === 'special';
}

/**
 * Client-side resolution matching SQL order: class-specific row first, then whole-school-day (class_id null).
 * @param {string|number} classId
 * @param {string} occurrenceDate YYYY-MM-DD
 * @param {Array<{ class_id?: number|string|null, occurrence_date: string|Date, exception_kind?: string, message?: string, display_title?: string, display_time?: string }>} rows
 */
export function resolveScheduleGroupExceptionFromRows(classId, occurrenceDate, rows) {
    if (!Array.isArray(rows) || !occurrenceDate) return null;
    const want = String(occurrenceDate).slice(0, 10);
    const idStr = String(classId);
    const sameDay = (d) => {
        if (d == null || !want) return false;
        if (d instanceof Date && !isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}` === want;
        }
        const s = String(d).slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s === want;
        return false;
    };
    const forClass = rows.find((e) => e.class_id != null && String(e.class_id) === idStr && sameDay(e.occurrence_date));
    if (forClass) return forClass;
    return rows.find((e) => e.class_id == null && sameDay(e.occurrence_date)) || null;
}
