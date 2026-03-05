# Summary: 01-03 Small Improvements

**Status:** Complete
**Date:** 2026-03-06

## What was done

Applied TRIAL-02 improvements. Scope expanded beyond copy/label tweaks to include two user-value features requested during trial, plus infrastructure cleanup:

1. **Notifications** (Settings) — school admins can now email their students directly from the app (test send + bulk send with recipient filter). Built end-to-end: UI, Edge Function, DB log table, storage bucket for optional logo.

2. **External student in manual payments** — admins can record a manual payment for a student not in the system by entering a free-text name. Requires DB migration for the new column and updated RPC.

3. **Debug cleanup** — removed development-only telemetry fetch from routing.js.

## Build

`npm run build` passes with no errors.

## Artifacts

- `.planning/phases/01-trial-stability-support/SMALL_IMPROVEMENTS.md` — list of all improvements
- `supabase/functions/notifications_send/index.ts` — Edge Function
- `supabase/migrations/20260303160000_notifications_log.sql`
- `supabase/migrations/20260303170000_school_email_assets_bucket.sql`
- `supabase/migrations/20260304100000_manual_payment_external_student.sql`
- `supabase/migrations/20260304110000_fix_get_current_admin_school_email_fallback.sql`

## Next

Plan 01-04: Full verification and human sign-off (trial readiness).
