# Small Improvements — Trial (TRIAL-02)

Status: Applied. See 01-03-SUMMARY.md.

## Improvements applied in this run

### 1. Notifications (Settings > Notifications)
School admins can now send email campaigns to their students directly from Settings.
- Recipient modes: all students, or a selected subset (with search filter)
- Compose with subject and body; supports **bold** and [link](url) formatting
- Live preview panel showing how the email will look
- Optional school logo (upload or reuse discovery logo)
- Test-send to own email before sending to students
- Sends via Supabase Edge Function `notifications_send` (Resend API)
- Rate-limited (2 campaigns/school/minute) via `notifications_log` table
- Fully i18n: en / es / de

### 2. External student in manual payments
Manual payment requests can now be created for non-registered (external) students.
- Toggle between "registered student" and "external student" modes
- External mode: free-text name field; `student_id` set to NULL, `external_student_name` recorded
- Migration: `payment_requests.external_student_name` column + updated RPC `admin_create_manual_payment`
- i18n: en / es / de

### 3. Debug telemetry cleanup
Removed development-only `fetch` logging from `src/routing.js`; no user-visible change.

## Infrastructure
- Supabase package upgraded to `^2.76.16` with `tar >=7.5.10` override (security)
- New migrations:
  - `20260303160000_notifications_log.sql` — `get_current_admin_school` RPC + `notifications_log` table + RLS
  - `20260303170000_school_email_assets_bucket.sql` — `school-email-assets` storage bucket + policies
  - `20260304100000_manual_payment_external_student.sql` — external student column + updated RPC
  - `20260304110000_fix_get_current_admin_school_email_fallback.sql` — email fallback in RPC
- New Edge Function: `supabase/functions/notifications_send/index.ts`
