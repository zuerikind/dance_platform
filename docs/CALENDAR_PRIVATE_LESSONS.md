# Calendar & Private Lesson Deduction Rules

## When credits are **not** deducted

- **On accept**: When the teacher accepts a private class request, a `private_lesson` row is created with status `confirmed`. **No credit is deducted** at this point.

## When one private credit **is** deducted

1. **Check-in at class**: The teacher scans the student (QR check-in) and uses **Check in** for that private lesson. This calls `mark_private_lesson_attended`, which sets `attended_at` and `credit_deducted = true`, and runs `deduct_student_classes` for one private class.
2. **Late cancellation**: The student cancels **less than 4 hours** before the lesson start (configurable via `teacher_availability_settings.late_cancel_minutes`, default 240). The RPC `student_cancel_private_lesson` deducts one private credit and sets `credit_deducted = true`.
3. **No-show**: The teacher marks the lesson as no-show (past lesson, status `confirmed`). This calls `mark_private_lesson_no_show`, which deducts one private credit and sets `credit_deducted = true`.

## Idempotency

- **mark_private_lesson_attended**: If the lesson is already `attended` or `credit_deducted` is true, the RPC does not deduct again.
- **mark_private_lesson_no_show**: Same guard: no double deduction if already deducted or attended.

## How to verify locally

1. **4h rule**: Create a private lesson in the future. Call `student_cancel_private_lesson` with `p_lesson_id`:
   - More than 4 hours before start → lesson becomes `cancelled`, **no** deduction (check student’s private balance or `credit_deducted` on the lesson).
   - Less than 4 hours before start → lesson becomes `cancelled`, **one** private credit deducted and `credit_deducted = true`.
2. **Check-in**: As teacher, use the scanner and **Check in** for a student’s private lesson (or the list/calendar **Check in**). Confirm one private credit is deducted and the lesson shows as attended. Run Check in again → no second deduction.
3. **No-show**: As teacher, **Mark no-show** for a past confirmed lesson. Confirm one credit deducted. Mark no-show again → no second deduction.
4. **ICS export**: As teacher or student, use **Export .ics**, open the downloaded `schedule.ics` in a calendar app or run `node tests/ics-format.test.js` to validate ICS structure.

## Related code

- Migration: `supabase/migrations/20260224100000_calendar_availability_private_lessons.sql`
- RPCs: `teacher_respond_to_request`, `student_cancel_private_lesson`, `mark_private_lesson_attended`, `mark_private_lesson_no_show`
- Edge Function: `supabase/functions/export_calendar_ics/index.ts`
- UI: `src/legacy.js` (teacher/student private views), `src/scanner.js` (check-in)
