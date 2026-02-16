# Platform security review

Summary of a full pass over auth, RPCs, RLS, and client-side handling. **No code changes were made**; this is analysis and recommendations only.

---

## What is in good shape

### 1. RPC authorization (20260214180000)

- **get_platform_all_data**: platform admin only.
- **get_school_*** (students, admins, classes, subscriptions, payment_requests): school or platform admin; **get_school_classes** and **get_school_subscriptions** now also allow enrolled students (migration 20260214200000).
- **get_school_admin_settings**: admin or enrolled student (for payment modal).
- **get_student_by_id / get_student_by_user_id**: caller is that student (`user_id = auth.uid()`) or school/platform admin.
- **get_all_student_enrollments**: `auth.uid() = p_user_id` only.
- **create_payment_request**: admin, platform admin, or the student (own `student_id` + `user_id = auth.uid()`).
- **apply_student_package, deduct_student_classes, admin_delete_*, class_*, subscription_*, admin_setting_upsert, create_student_legacy, link_student_auth, process_expired_registrations, mark_registration_attended**: all gated by school or platform admin where intended.
- **get_student_registrations_for_today**: admin or the student (own row).
- **create_student_with_auth** (20260214170000): enforces `auth.uid() = p_user_id` before creating a row.

### 2. RLS

- **schools, students, admins, classes, subscriptions, payment_requests, admin_settings**: ENABLE ROW LEVEL SECURITY with policies that restrict SELECT/INSERT/UPDATE/DELETE by `is_school_admin(school_id)`, `is_platform_admin()`, or (for students) own row via `user_id = auth.uid()`.
- **classes / subscriptions**: students can SELECT only if enrolled at that school (`EXISTS (SELECT 1 FROM students WHERE school_id = ... AND user_id = auth.uid())`).
- **class_registrations, competitions, competition_registrations**: RLS limits access to own student context or admin.
- **schools_select_all** (20260214190000): only active schools for non–platform-admins.

### 3. Client-side (app.js)

- **escapeHtml()** exists and is used in many places (e.g. `renderAdminStudentCard`, student modal, platform school list).
- **Security headers**: `_headers` and `vercel.json` set `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy` with connect-src to Supabase, frame-ancestors 'none'.
- **Student view**: hash routing and checks prevent students from opening admin views on reload or shared URLs.

### 4. SQL injection

- RPCs use parameters (`p_school_id`, `p_student_id`, etc.); **class_update_field** / **subscription_update_field** use a fixed whitelist of column names. No string-concatenated SQL found.

---

## Findings and recommendations

### 1. **auto_enroll_student** – no caller check (medium)

- **Location**: `supabase/migrations/20260214170000_student_auth_email_only.sql`.
- **Issue**: Any authenticated user can call `auto_enroll_student(p_user_id, p_school_id)`. There is no check that `p_user_id = auth.uid()`. So user A could enroll user B at a school by passing B’s Auth UUID.
- **Impact**: Unwanted enrollment rows; possible confusion or abuse (e.g. creating enrollments in another user’s name).
- **Recommendation**: At the start of the function, add:
  - `IF auth.uid() IS DISTINCT FROM p_user_id THEN RETURN NULL; END IF;`
  - (and optionally require that the school exists and is active).

### 2. **competition_registration_submit** – no student-identity check (medium)

- **Location**: `supabase/migrations/20260210500000_competitions.sql` (and not redefined in 20260214180000).
- **Issue**: The RPC updates `competition_registrations` by `competition_id` and `p_student_id` only. It does not verify that the caller is that student (`user_id = auth.uid()` for that `student_id`).
- **Impact**: Any authenticated (or anon if still granted) caller can submit another student’s draft registration (DRAFT → SUBMITTED).
- **Recommendation**: Add a guard, e.g.:
  - `IF NOT EXISTS (SELECT 1 FROM public.students s WHERE s.id::text = p_student_id AND s.user_id = auth.uid()) THEN RETURN NULL; END IF;`
  - before the UPDATE.

### 3. **competition_registration_upsert_draft** – no caller check (low–medium)

- **Location**: Same migrations.
- **Issue**: The RPC checks that the student exists at the school but does not require `s.user_id = auth.uid()`. So one could create or update a draft registration for another student at that school.
- **Recommendation**: Add the same “caller is this student” check: `EXISTS (SELECT 1 FROM public.students s WHERE s.id::text = p_student_id AND s.school_id = p_school_id AND s.user_id = auth.uid())`.

### 4. **competition_get_for_student** – no caller check (low)

- **Location**: `20260211400000_competition_get_for_student_relaxed.sql` / `20260210500000_competitions.sql`; not redefined in the auth migration.
- **Issue**: It only checks that a student row exists for `(p_student_id, p_school_id)`, not that the caller is that student. So any user could query “competition for student X at school Y.”
- **Impact**: Information disclosure (e.g. that a school has an active Jack & Jill competition). Less critical than submit/upsert.
- **Recommendation**: Restrict to the owning student: e.g. require `EXISTS (SELECT 1 FROM public.students s WHERE s.id::text = p_student_id AND s.school_id = p_school_id AND s.user_id = auth.uid())`.

### 5. **XSS – payment request list (admin)** (low)

- **Location**: `app.js` around 3489–3499 and 3625–3633.
- **Issue**: In the admin memberships/revenue views, `studentName` and `req.sub_name` are interpolated into HTML without `escapeHtml()`. If a student or subscription name contained `<script>` or event handlers, it could run in the admin context.
- **Recommendation**: Use `escapeHtml(studentName)` and `escapeHtml(req.sub_name)` (and any other user/DB-derived strings) in those templates.

### 6. **Passwords in DB and UI** (known / product decision)

- **Location**: Migrations and app.js (e.g. platform dashboard showing `pa.password`, `a.password`, `s.password`; legacy admin check using `state.currentUser?.password`).
- **Issue**: Student and admin passwords are stored in plaintext (documented in 20260214180000 as a product decision). Platform/school admin UIs display passwords.
- **Impact**: If the DB or client state is compromised, credentials are exposed. No hashing in DB.
- **Recommendation**: Leave as-is if this is an explicit product choice; otherwise plan a move to hashing (and stop returning/displaying passwords in API and UI).

### 7. **get_platform_all_data returns full rows** (low)

- **Location**: `20260214180000_rpc_authorization.sql` – returns `SELECT *` from `platform_admins` (and others). Only callable by platform admin.
- **Issue**: Platform admin passwords are included in the JSON response.
- **Recommendation**: If possible, exclude sensitive columns (e.g. `password`) from the aggregated JSON for `platform_admins`, or restrict to columns needed for the dashboard.

### 8. **Supabase anon key in repo** (informational)

- **Location**: `app.js` – Supabase URL and anon key are in source.
- **Note**: This is normal for a public/frontend Supabase client. Security relies on RLS and RPC authorization, not key secrecy. Key rotation is still recommended if the key is ever exposed or rotated for other reasons.

---

## Checklist summary

| Area                    | Status | Notes                                                                 |
|-------------------------|--------|-----------------------------------------------------------------------|
| RPC auth (school/admin) | OK     | 20260214180000 and 20260214200000 (student read classes/subs).        |
| create_student_with_auth| OK     | Enforces `auth.uid() = p_user_id`.                                   |
| auto_enroll_student     | Fix    | Add `p_user_id = auth.uid()`.                                        |
| competition submit/upsert| Fix    | Enforce caller is the student for registration RPCs.                  |
| competition_get_for_student | Fix | Restrict to caller being that student.                               |
| RLS on main tables      | OK     | students, classes, subscriptions, etc.                               |
| RLS schools             | OK     | Active-flag policy in place.                                         |
| XSS (general)           | OK     | escapeHtml used in many places.                                     |
| XSS (payment list)      | Fix    | Escape studentName and req.sub_name in admin views.                  |
| CSP / headers           | OK     | _headers and vercel.json.                                             |
| Passwords               | Known  | Plaintext by design; optional hardening (hash, hide in API/UI).       |

Implementing the “Fix” items (auto_enroll_student, competition RPCs, XSS in payment list) would strengthen the platform without changing product behavior for normal users.
