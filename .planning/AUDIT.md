# Bailadmin Security & Integrity Audit

**Date:** 2026-07-05
**Scope:** RLS/authorization, payments/packages, QR attendance, auth/signup, data integrity, Resend edge function.
**Method:** Read schema + all 180 migrations for the audited surfaces, then traced each candidate end-to-end through the live-effective function definition (latest `CREATE OR REPLACE`) and its grants. Findings below are traced to a concrete failure, not pattern-matched.
**Rule followed:** no code changed. This is report + fix plan only.

> **Production-state note.** Per the task brief, `202603*+` migrations are staged locally but not in production. Two findings below (**C1 balance-drain**, **H1 toggle**) do **not** depend on the pending set — the vulnerable grants and unguarded bodies were introduced in `202602*`, which is already in production. They are **live now**. The already-written fix `20260704120000_secure_balance_mutations_authorization.sql` is **untracked (uncommitted) and applied nowhere** — it is the remediation for C1, not evidence C1 is fixed.

---

## 1. Findings (ranked by severity)

| # | Sev | File:line | Defect (one sentence) | Exploit / failure scenario | School-facing feature |
|---|-----|-----------|-----------------------|----------------------------|-----------------------|
| **C1** | **Critical** | `20260218000000_private_classes_dual_count.sql:20,161` + `20260430180000_deduct_fifo_balance_from_pack_sum_only.sql:6` + `20260501234500_phase3_wrap_legacy_deduct_rpc.sql:4` + `20260604120000_reconcile_balance_from_active_packs.sql:175` + `20260502160000_attendance_deduct_before_registration_flag.sql:87` | Balance-mutating RPCs (`deduct_student_classes` 4-arg, `canonical_deduct_student_balances`, `process_expired_registrations`, `reconcile_student_balance_from_active_packs`) are `SECURITY DEFINER` with **no in-body authorization** and are **granted to `anon`** (canonical to `authenticated`). | Attacker with the public anon key calls `rpc('deduct_student_classes', {p_student_id:'STUD-1A2B', p_school_id:'<public school id>', p_count:999, p_class_type:'group'})` and zeroes any student's class credits at any school; or calls `process_expired_registrations({p_school_id})` with only the **public** school id to force school-wide no-show deductions. No login required. | Class balances / package credits / attendance — core money-equivalent asset. |
| **H1** | **High** | `20260214000000_class_registration.sql:89-114` | `toggle_class_registration_enabled(uuid, boolean)` has **no auth check** and is granted to `anon`; never re-guarded in any later migration. | Anon calls `rpc('toggle_class_registration_enabled', {p_school_id:'<any school>', p_enabled:false})` to silently disable (or enable) class registration for any school. Disabling also removes that school from the nightly no-show cron loop (edge fn filters `class_registration_enabled = true`). | Class registration feature toggle (per school). |
| **M1** | **Medium** | `20260524120000_canonical_deduct_sync_active_packs_fifo.sql:4` (upcoming) + `20260214000000_class_registration.sql:328` (past) | `get_student_upcoming_registrations` / `get_student_past_registrations(text, uuid)` are `SECURITY DEFINER`, **no owner/admin guard**, granted `anon`. | Anon who knows/guesses `student_id` (`STUD-`+4 hex ≈ 65k/school) + public `school_id` reads that student's class schedule, dates, and attendance history across any school. Cross-tenant PII/behavioral disclosure. Sibling RPCs (`get_student_registrations_for_today`, `get_class_registrations_for_date`) *were* guarded; these two were missed. | Student "my classes" history. |
| **M2** | **Medium** | `20260304100000_manual_payment_external_student.sql:23` / `20260523130000_revenue_recognized_month.sql:278` | `admin_create_manual_payment` has no idempotency; a double-submit inserts two `approved` `payment_requests` rows. | Admin double-clicks "record cash payment" → revenue counted twice in KPI / Ganancias until an admin manually deletes the duplicate. Admin-only, no double-credit (does not activate a package), correctable — hence Medium not High. | Manual payments + revenue dashboard. |
| **L1** | **Low** | `20260220130000_class_registration_rpc_auth.sql:52-61` | Capacity check (`count(*) … < max_capacity`) then `INSERT` is not serialized. | Two students registering concurrently for the last seat can both pass the check and both insert → class over capacity by 1+. `UNIQUE(class_id,student_id,class_date)` prevents *duplicate* seats but not overshoot. | Class registration capacity. |
| **L2** | **Low (defense-in-depth)** | `20260704120000_secure_balance_mutations_authorization.sql:88,412` | The fix's guard treats `auth.uid() IS NULL` as "trusted system/cron". This is safe **only** because the same migration revokes `anon`; a raw anon-key PostgREST request also has `auth.uid() IS NULL`. | If any *future* migration re-runs `GRANT … TO anon` on these functions, the guard silently re-opens completely (anon passes the `IS NULL` branch). The security depends on the grant, not the guard. | (Latent risk on the C1 fix.) |

---

## 2. Fix plan (Critical / High)

### C1 — Balance-mutating RPCs open to anon
**The fix already exists**, fully written, as the untracked file `supabase/migrations/20260704120000_secure_balance_mutations_authorization.sql`. It:
- adds an in-body guard (`is_school_admin OR is_platform_admin OR auth.uid() IS NULL OR own-row`) to `canonical_deduct_student_balances`, `process_expired_registrations`, `reconcile_student_balance_from_active_packs`;
- `REVOKE EXECUTE … FROM PUBLIC, anon` on all four deduct entrypoints (incl. the `deduct_student_classes` 4-arg wrapper);
- `GRANT … TO authenticated, service_role` only.

I traced every legitimate caller and the fix preserves them all:
- Admin QR scanner → `deduct_student_classes` / `reconcile` as authenticated admin ⇒ `is_school_admin` passes.
- Student late-cancel penalty path → `own-row` branch passes.
- Nightly cron → `process-expired-registrations` edge fn authenticates with the **service-role key** (`index.ts:35`) and calls as service_role (`auth.uid()` NULL) ⇒ `IS NULL` branch passes.

**Minimal action:** commit and apply `20260704120000` to production. **No new code needed.** Smallest change; DB-level (grants + guards) exactly as the ladder prefers.
**Files changed:** the one migration (already written).
**New migration needed:** it *is* the new migration — just needs committing + `supabase db push` to prod.
**Ordering dependency:** none against the pending `202603*+` set — it only `CREATE OR REPLACE`s functions that already exist in prod and revokes grants. It is safe to apply to prod **before** the rest of the pending batch, and should be (it is the live-exposure fix). Apply it first.

### H1 — `toggle_class_registration_enabled` open to anon
**Minimal fix:** add the standard guard as the first statement and drop the anon grant, in a new tiny migration (or fold into the C1 migration since both are "lock down anon RPCs"):
```sql
CREATE OR REPLACE FUNCTION public.toggle_class_registration_enabled(p_school_id uuid, p_enabled boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.schools%ROWTYPE;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  UPDATE public.schools SET class_registration_enabled = p_enabled WHERE id = p_school_id RETURNING * INTO v_row;
  IF v_row IS NULL THEN RAISE EXCEPTION 'School not found.'; END IF;
  RETURN to_jsonb(v_row);
END; $$;
REVOKE EXECUTE ON FUNCTION public.toggle_class_registration_enabled(uuid, boolean) FROM anon, PUBLIC;
```
**Files changed:** one new migration.
**Ordering:** independent; apply alongside or right after C1.

### M1 — student-registration read RPCs open to anon (recommended, borderline High for privacy)
**Minimal fix:** prepend the owner/admin guard used by every sibling and drop the anon grant, for both functions:
```sql
IF NOT (
  public.is_school_admin(p_school_id) OR public.is_platform_admin()
  OR EXISTS (SELECT 1 FROM public.students s
             WHERE s.id::text = p_student_id AND s.school_id = p_school_id AND s.user_id = auth.uid())
) THEN RETURN '[]'::jsonb; END IF;
-- ...existing body...
REVOKE EXECUTE ON FUNCTION public.get_student_upcoming_registrations(text, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_student_past_registrations(text, uuid) FROM anon, PUBLIC;
```
Note: the student client calls these authenticated, so revoking `anon` is safe. One new migration; independent ordering.

### M2 / L1 — lower priority, Phase 2
- **M2:** add an idempotency guard to `admin_create_manual_payment` (e.g. a unique dedupe key, or a short-window "same school+student+price+sub_name+minute" check), or debounce the button. Not trial-blocking.
- **L1:** move the capacity check + insert under a row lock (`SELECT … FOR UPDATE` on the class row, or a partial unique/exclusion approach). Rare, self-correcting; Phase 2.

### L2 — harden the C1 fix against future re-grants (Phase 2 hygiene)
Consider replacing the bare `auth.uid() IS NULL` "system" branch with an explicit role check (`current_setting('request.jwt.claim.role', true) = 'service_role'` or `current_user = 'service_role'`) so a stray future `GRANT … anon` cannot silently reopen these. Not required to close C1; documents intent.

---

## 3. Recommended execution order

**Before applying the pending `202603*+` migrations to production:**
1. **C1** — commit + apply `20260704120000_secure_balance_mutations_authorization.sql` to prod **first**. This closes the live, unauthenticated balance-drain / no-show-forcing exposure that exists in prod today. It is a superset-safe `CREATE OR REPLACE` + `REVOKE`; no dependency on the rest of the batch.
2. **H1** — apply the `toggle_class_registration_enabled` guard (live anon write to any school's feature flag).
3. **M1** — apply the two registration-read guards (live cross-tenant read).

These three are independent of each other and of the `202603*+` feature batch; they can ship as one small "lock down anon RPCs" migration if preferred. Do them, then proceed with the normal `202603*+` production rollout.

**Can wait for Phase 2:** M2 (manual-payment idempotency), L1 (capacity race), L2 (guard hardening).

**Interaction with the pending batch:** none of the pending `202603*+` migrations *reintroduce* an anon grant on the C1/H1/M1 functions (verified: the only `GRANT … anon` reappearing later is on already-guarded functions such as `process_payment_request_once`, `register_for_class`, `get_class_registrations_for_date`, which reject non-admins in-body). So applying the fixes first and the batch second does not re-open anything.

---

## 4. Checked — found nothing (coverage)

**RLS / core tables**
- `schools`, `students`, `admins`, `classes`, `subscriptions`, `payment_requests`, `admin_settings`, `platform_admins` — all have RLS enabled with school-scoped policies keyed on `is_school_admin()` / `is_platform_admin()` / own `user_id` (`20260210000000`). No cross-school read/write via direct PostgREST on these tables.
- Student→admin escalation: `admins` INSERT is platform-admin-only; UPDATE/DELETE is same-school-admin only. A student's JWT satisfies none. No escalation path found.
- `students_with_profile` view — previously an RLS-bypass leak; fixed with `security_invoker = true` + a school-admin SELECT policy on `student_profiles` (`20260228135000`). Confirmed applied in local set.
- `student_profiles`, `profiles`, `profile_school_links`, `class_registrations`, `competitions`, `reviews`, `private_*`, `calendly_*`, `notifications_log`, `student_balance_events` — all RLS-enabled with owner/school-scoped policies.

**Authorization on RPCs (verified guarded, latest definition):**
- `register_for_class`, `register_for_class_monthly`, `cancel_class_registration` — owner-or-admin guard survives all redefinitions incl. the Aure/force-register/monthly variants (`20260220130000`, `20260309120000`, `20260503120000`).
- `get_class_registrations_for_date`, `get_student_registrations_for_today`, `admin_set_registration_attendance`, `mark_registration_attended`, `process_payment_request_once`, `update/delete_payment_request`, `apply_student_package`, `activate_package_for_student`, `admin_create_manual_payment`, `get_school_*` bulk readers, `deduct_student_classes` (3-arg legacy) — all carry `is_school_admin/is_platform_admin` (and owner where relevant) checks.
- `link_student_auth` — only links when caller's JWT email matches the student email, or caller is admin.

**Payments & packages**
- `process_payment_request_once` — `FOR UPDATE` + pending-only transition ⇒ idempotent; concurrent double-approve cannot double-activate.
- `canonical_deduct_student_balances` — carries an `idempotency_key` for registration-driven deducts; replay returns the prior event.
- External-student manual payment (`student_id` NULL): revenue/KPI functions (`get_school_kpi_summary`, `payment_in_revenue_range`) aggregate `payment_requests` **without** joining `students`, so NULL `student_id` rows are **not** dropped from revenue — no undercount. (Note: `admin_create_manual_payment` price is validated `>= 0`; no client-trusted amount bypass.)

**QR attendance**
- Double-scan: `mark_registration_attended` requires `status='registered'`; a second scan finds the row `attended` ⇒ `NOT FOUND` ⇒ no second deduct. `deducted` flag also blocks cron re-deduction.
- Replay / wrong-school: attendance is admin-initiated from the authenticated scanner; the QR encodes only the student id, and `deduct`/`mark` verify the student belongs to `p_school_id`. No student-side replay path. (The *underlying* anon-callable deduct is C1, already flagged.)

**Auth / signup**
- Signup error surfacing (`src/legacy.js` ~8919) — inner catch logs and surfaces a sanitized message; not re-swallowed (matches CRITICAL_BUGS 01-01 resolution).
- Admin-only queries route through `is_school_admin`-guarded RPCs, not raw table reads.

**Edge functions**
- `stripe-webhook` — verifies signature via `constructEventAsync` before any processing, writes only with service role, all writes idempotent UPDATEs. No finding.
- `process-expired-registrations` (cron) — requires `Authorization: Bearer <service_role_key>`; rejects otherwise. No finding.
- `notifications_send` (Resend) — verifies the caller is an admin **of the target school** (via `admins` lookup on `user_id`/verified email) before sending; a student JWT ⇒ 403. Recipients filtered by `school_id` (and `selected` mode additionally intersects), so **no cross-school email leak**. Rate-limited to 2 campaigns/school/minute. *Minor, not filed:* the rate-limit read→send→log sequence has a small TOCTOU window (two concurrent requests could both pass); worst case a handful of extra emails, not a spam vector.

---

### Summary
One **live, unauthenticated Critical** (C1: anyone with the anon key can drain balances / force school-wide no-shows) whose fix is already written but uncommitted and unapplied — **commit and push it to production first.** One live **High** (H1: anon can toggle any school's registration flag) and one live **Medium** (M1: anon can read any student's attendance history) share the same one-line-guard remedy. Everything else audited (RLS, payment idempotency, QR double-scan, Stripe, notifications, cron auth) held up.
