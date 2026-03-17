# Plan: Private class balance deduction + student “remaining + scheduled” view

## Goal

1. **When a teacher accepts a private class request**, the student’s class count (package balance) goes down according to the duration (e.g. 2h = 2 classes).
2. **In the student’s private-teacher view**, show:
   - **Remaining classes** (e.g. “3 classes remaining”).
   - **Scheduled private classes** directly below, each with duration and “X classes of your package” (e.g. “Thursday 13:30 · 2h · 2 classes of your package”).

---

## Part A: Deduct balance when teacher accepts

### A1. Allowed durations and “classes” rule

- **Allowed durations are 1h, 2h, or 3h only** (60, 120, or 180 minutes). No 30 min, 45 min, or 90 min.
- **1 class = 1 hour.** So:
  - 60 min (1h) → 1 class  
  - 120 min (2h) → 2 classes  
  - 180 min (3h) → 3 classes  
- Formula: `classes = duration_minutes / 60` (only valid for 60, 120, 180). Backend can validate that `duration_minutes` is one of 60, 120, 180 and then use integer division.

**Product/UI:** Teacher availability settings and the student booking confirmation should only offer 1h, 2h, 3h (e.g. restrict `duration_minutes` options to 60, 120, 180 in admin and in the booking flow). Any existing 30/45/90 options can be removed or hidden for private teachers.

### A2. Backend: `teacher_respond_to_request`

**Current behaviour:** On accept it only creates a `private_lesson` and updates the request; it does **not** deduct from the student’s balance.

**Change (single migration):**

1. In `teacher_respond_to_request`, after inserting into `private_lessons` and updating `private_class_requests`:
   - Optionally validate `v_duration_minutes IN (60, 120, 180)` and raise if not (to enforce 1h/2h/3h only).
   - Compute `v_classes := v_duration_minutes / 60` (1, 2, or 3 for allowed durations).
   - Call `PERFORM deduct_student_classes(v_student_id, v_school_id, v_classes, 'private');`
2. Use existing `deduct_student_classes(p_student_id, p_school_id, p_count, p_class_type)` with `p_class_type = 'private'` so deduction uses `balance_private` / `active_packs` (private_count) as already implemented.
3. **Edge cases:**
   - If the student has no row in `students` for this school, `deduct_student_classes` is a no-op (it returns early). Optional: add a check before accept and raise a clear error if no enrollment.
   - If balance is insufficient, `deduct_student_classes` returns without changing (it checks effective balance first). Decide whether to block acceptance when balance is too low (e.g. raise in `teacher_respond_to_request` after checking) or allow accept and deduct only up to balance; product decision.

**File:** New migration, e.g. `supabase/migrations/YYYYMMDDHHMMSS_private_class_deduct_on_accept.sql`.

**Safety (live-safety / AGENTS.md):** Same function name and signature; only add a step inside the function. No new overloads.

---

## Part B: Student view – remaining count + scheduled classes with “X classes”

### B1. Data (already available)

- **Remaining classes:** From `state.allEnrollments` for the current school: `enrollment.balance_private` plus private counts from `enrollment.active_packs` (same logic as `deduct_student_classes` / shop). The app already has “effective private balance” patterns elsewhere; reuse or add a small helper that, for one school, returns the effective private class count (balance_private + sum of non-expired packs’ private_count, or 0 if none).
- **Scheduled classes:** Already in `state.studentPrivateLessons` (from `get_student_private_lessons`) with fallback to `state.studentPrivateClassRequests` (accepted). Each lesson has `start_at_utc`, `end_at_utc` → duration in minutes (60, 120, or 180) → `classes = duration_mins / 60`. For fallback requests, use `duration_minutes` from `private_class_requests` if present.

### B2. UI placement (teacher-booking view)

- **Location:** In the student’s teacher-booking view (`view === 'teacher-booking'` in `legacy.js`), add a block **above** the existing “My private classes” expandable section.
- **Content:**
  1. **Line 1:** “**X classes remaining**” (or “X clases restantes” etc.) using the effective private balance for this school. If no enrollment or 0, show “0 classes remaining” or “No package” depending on product preference.
  2. **Line 2 (below):** List of **upcoming** scheduled private classes (same list as “My private classes” but in this compact form):
     - For each: date (e.g. “Thu 18 Mar”), time (e.g. “13:30”), duration (e.g. “2h”), and “**2 classes of your package**” (or “1 class” for 1h).
     - Only show future (or today) lessons; optionally limit to next N or next 30 days.
- **Duration → “classes” for display:** Only 1h, 2h, 3h are used. From lesson: `durationMinutes = (end_at_utc - start_at_utc)` in minutes; `classes = durationMinutes / 60` (60→1, 120→2, 180→3). From request fallback: `duration_minutes` → same (60/120/180 only).

### B3. Implementation details (frontend)

1. **Helper: effective private balance for school**  
   In `legacy.js` (or a small util), add e.g. `getEffectivePrivateBalanceForSchool(schoolId)` that:
   - Finds `state.allEnrollments.find(e => e.school_id === schoolId)`.
   - Returns effective private count: if no enrollment then 0; else `balance_private` plus sum of non-expired `active_packs[].private_count` (mirror backend logic). Return a number.

2. **Helper: classes from lesson or request**  
   - Duration is only 1h, 2h, or 3h (60, 120, 180 min).  
   - Lesson: `(new Date(end_at_utc) - new Date(start_at_utc)) / (60 * 1000)` → minutes → `classes = mins / 60` (1, 2, or 3).
   - Request: `duration_minutes` (60, 120, or 180) → `classes = duration_minutes / 60`.

3. **Markup:** Add a small card or block at the top of the teacher-booking container (before the “My private classes” expandable):
   - Title/subtitle: “X classes remaining”.
   - List: `myClasses` (or same source as “My private classes”) filtered to future only, each row: date · time · duration (e.g. “2h”) · “N classes of your package”. Use existing i18n pattern; add keys like `classes_remaining`, `x_classes_of_package` (“{n} classes of your package” / “{n} clases de tu paquete”).

4. **Refreshing:** After teacher accepts, the student’s balance is updated in the DB; on next `fetchAllData` (or when returning to the view), `allEnrollments` and lessons will refresh. Optionally trigger a refetch after “request accepted” success so the new balance and new lesson appear without full reload.

### B4. i18n

- `classes_remaining`: “Classes remaining” / “Clases restantes” / “Verbleibende Klassen”.
- `x_classes_of_package`: “{n} class(es) of your package” / “{n} clase(s) de tu paquete” (handle n=1 vs n>1 if desired).
- Use duration labels for 1h, 2h, 3h only (no 30 min or 90 min in this flow).

---

## Part C: Order of work and testing

1. **Migration (Part A)**  
   Implement and run the new migration; verify that accepting a request deducts the correct number of private classes (e.g. 2h request → 2 deducted) and that balance_private / active_packs update as expected.

2. **Frontend (Part B)**  
   - Implement effective-private-balance helper and “classes from lesson/request” helper.
   - Add the “X classes remaining” + scheduled list block in teacher-booking view.
   - Add i18n and test in EN/ES (and DE if used).

3. **E2E check**  
   - Student has 5 private classes; books 2h; teacher accepts → student has 3 remaining; student sees “3 classes remaining” and the new lesson “2h · 2 classes of your package”.

---

## Summary

| Part | What | Where |
|------|------|--------|
| A    | On accept, deduct `duration_minutes/60` (1, 2, or 3) private classes via `deduct_student_classes(..., 'private')`. Durations only 1h, 2h, 3h (60/120/180 min). | New migration; alter `teacher_respond_to_request`; optionally restrict teacher/booking UI to 60, 120, 180 min |
| B    | Show “X classes remaining” and list of scheduled classes with “N classes of your package” per lesson | `legacy.js` teacher-booking view + small helpers + i18n |

No new RPCs required; only one function change (same signature) and frontend UI + helpers.
