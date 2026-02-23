# Codebase & Security Analysis

**Date:** February 22, 2025  
**Scope:** Full codebase review for code quality, cleanliness, data security, and legacy vs modern auth.

---

## Executive summary

- **Code quality:** One very large monolithic file (`app.js` ~11.4k lines), repeated auth/signup patterns, ~174 `alert`/`console` usages, and some dead DB code. No critical bugs found; maintainability is the main concern.
- **Security:** RLS and most RPCs are in good shape. **Remaining gaps:** (1) three competition RPCs still lack caller-identity checks, (2) XSS in two payment-list views (studentName / req.sub_name not escaped), (3) plaintext passwords in DB and UI (documented product decision). Class registration and `auto_enroll_student` are already fixed.
- **Legacy login:** Used for **school admins** and **platform (god mode) admins** as a fallback when Supabase Auth has no user yet; the app then links Auth and migrates them to Auth-only on next login. **Students** have no legacy login in the app (DB has unused RPCs). **Recommendation:** Keep legacy admin login for migration/support; you can phase it out once all admins have logged in at least once. Student legacy login is not needed unless you need to support pre-Auth students in the UI.

---

## 1. Code quality & cleanliness

### 1.1 Architecture and structure

| Item | Finding |
|------|--------|
| **Monolith** | All app logic lives in **`app.js`** (~11,400 lines): state, routing, translations, every view, auth, and API. No components or modules; hard to navigate and refactor. |
| **Stack** | Vanilla JS SPA; Supabase (Postgres + Auth + Storage) from CDN; no React/Next. Build: `serve` + optional `build-vercel.js` → `dist/`. |
| **Routing** | No dedicated router. `state.currentView` is set in many `onclick` handlers and a few `history.pushState` / hash paths. Competition routes use `window.location.hash`. |

**Recommendation:** Consider splitting `app.js` into modules (e.g. `auth.js`, `views/*.js`, `state.js`, `api.js`) or introducing a minimal framework for structure. Even a few large files would improve navigation.

### 1.2 Duplication and repeated patterns

- **Auth flows:** Admin and platform login share the same pattern: try `signInWithPassword` → on failure call legacy RPC (`get_admin_by_email_credentials` / `get_platform_admin_by_credentials`) → then `signUp`/`signInWithPassword` and `link_*_auth`. This could be a shared helper with a small config object.
- **Student signup:** Fallback chain (insert → `create_student_with_auth` → `create_student_legacy`) appears in multiple places (signup screen and admin “add student”); logic could be centralized.
- **Payment/pending request UI:** Similar list item markup and `studentName` / `req.sub_name` usage in “pending requests” and “admin-revenue” views; both lack consistent escaping (see Security §2.2).

### 1.3 Dead or unused code

- **DB only, never called from app:**  
  - `get_student_by_credentials(name, password, school_id)`  
  - `get_student_by_username_credentials(username, password, school_id)`  
  The app only uses Supabase Auth for students (`signInWithPassword`); these RPCs are never invoked. Students without `user_id` cannot log in in the current UI.
- **Optional:** If you are sure you will never support legacy student login, you could drop or restrict these RPCs to reduce attack surface and confusion. If you might support it later, leave them but document that they are unused.

### 1.4 Error handling and UX

- **~174** usages of `alert(...)` / `console.log` / `console.warn` / `console.error` in `app.js`. Errors are often surfaced only via `alert()`; no central error reporting or user-friendly error boundaries.
- **Recommendation:** Introduce a small error-handling layer (e.g. `showError(message, options)`) and replace ad-hoc `alert`/`console` with it where appropriate; optionally add logging for production.

### 1.5 Configuration and magic values

- **Supabase:** `SUPABASE_URL` and `SUPABASE_KEY` (anon key) are **hardcoded** at the top of `app.js`. Documented in `SECURITY_REVIEW.md` as acceptable for a public client (security via RLS/RPC). For multiple environments, consider a single config object (e.g. from `window.__ENV__` or build-time env).
- **Discovery:** `DISCOVERY_COUNTRIES_CITIES` (lines 7–29) is a large inline object; could be moved to a JSON file or config module.
- **Pseudo-email domains:** `@admins.bailadmin.local`, `@platform.bailadmin.local`, `@students.bailadmin.local` appear as string literals in several places; consider constants.

### 1.6 Naming and consistency

- Mixed naming: e.g. `state._adminLoginLegacyOkAuthFailed`, `state._discoveryOnlyEdit`; some view IDs are long (e.g. `platform-dev-edit-discovery`). Not bugs, but a style guide would help.

---

## 2. Security

### 2.1 What is in good shape

- **RLS:** Enabled on main tables (schools, students, admins, classes, subscriptions, payment_requests, admin_settings, payments, platform_admins, class_registrations, competitions, discovery, etc.) with policies using `is_school_admin(school_id)`, `is_platform_admin()`, or `user_id = auth.uid()` for students. `schools_select_all` restricted to active schools for non–platform-admins.
- **RPC authorization (20260214180000 and later):** Most school/student/platform RPCs are gated correctly. **Class registration** was fixed in **20260220130000**: `register_for_class`, `cancel_class_registration`, and `get_class_registrations_for_date` enforce “caller is the student or school/platform admin.”
- **auto_enroll_student:** Fixed in **20260220110000**: enforces `auth.uid() = p_user_id`.
- **create_student_with_auth:** Enforces `auth.uid() = p_user_id` before creating a row.
- **SQL injection:** RPCs use parameters; no string-concatenated SQL found. `class_update_field` / `subscription_update_field` use a whitelist of column names.
- **Headers:** `_headers` and `vercel.json` set `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and a strict Content-Security-Policy (connect-src to Supabase, frame-ancestors 'none', etc.).
- **XSS (general):** `escapeHtml()` exists and is used in many places; the main gap is the payment list (below).

### 2.2 Gaps to fix

#### A) Competition RPCs – no caller-identity check (medium)

Defined in **`20260210500000_competitions.sql`** (and relaxed in **20260211400000** for `competition_get_for_student`). **No later migration adds `auth.uid()` checks.**

| RPC | Issue | Risk |
|-----|--------|-----|
| `competition_registration_submit(p_competition_id, p_student_id)` | Updates registration to SUBMITTED without verifying caller is that student. | Any authenticated user can submit another student’s draft. |
| `competition_registration_upsert_draft(...)` | Checks student exists at school but not `s.user_id = auth.uid()`. | Can create/update draft for another student at that school. |
| `competition_get_for_student(p_student_id, p_school_id)` | Only checks student row exists, not ownership. | Information disclosure (e.g. who has Jack & Jill at a school). |

**Recommendation:** Add at the start of each function (or in a single migration that replaces them):

- For **submit** and **upsert_draft:**  
  `IF NOT EXISTS (SELECT 1 FROM public.students s WHERE s.id::text = p_student_id AND s.school_id = p_school_id AND s.user_id = auth.uid()) THEN RETURN NULL; END IF;`  
  (For submit, derive `p_school_id` from the competition if needed.)
- For **competition_get_for_student:**  
  Same condition: require `s.user_id = auth.uid()` for the given `p_student_id` and `p_school_id`.

#### B) XSS in payment request list (low)

- **Locations:** `app.js`  
  - Pending requests (admin): ~5420–5430 – `studentName` and `req.sub_name` interpolated into HTML without `escapeHtml`.  
  - Admin revenue list: ~5556–5564 – same.
- **Risk:** If a student or subscription name contained `<script>` or event handlers, they could run in the admin context.
- **Fix:** Use `escapeHtml(studentName)` and `escapeHtml(req.sub_name)` (and any other user/DB-derived strings) in those two templates.

#### C) Edge Function `admin-update-email`

- **Behavior:** Accepts JWT + new email; updates **that user’s** Auth email (by `payload.sub`). Only the authenticated user’s email can be changed.
- **Usage:** Invoked only from the admin profile save flow in the app (when an admin changes email in Settings). A student could still call the function directly and change their **own** email, which is normal “update my email” behavior.
- **Conclusion:** No change required. If the product intent is “only admins may use this from the app,” that’s already true in the UI; the function is not over-privileged.

### 2.3 Known / accepted (no code change required for this analysis)

- **Plaintext passwords:** Student and admin passwords are stored in plaintext (documented product decision). Platform/school admin UIs show passwords. If you later want to harden: hash in DB, stop returning/displaying passwords in API and UI.
- **Supabase anon key in repo:** Normal for a public frontend; security relies on RLS and RPC. Key rotation remains recommended if the key is ever exposed.
- **`get_platform_all_data`:** Returns full rows including platform admin passwords; only callable by platform admin. Optional: exclude `password` from the JSON for dashboard display.

---

## 3. Legacy login – do you need it?

### 3.1 Current usage

| Role | Auth flow | Legacy usage |
|------|-----------|--------------|
| **Student** | Email + password → **Supabase Auth only** (`signInWithPassword`). Then `get_student_by_user_id` or `auto_enroll_student`. | **None in the app.** DB has `get_student_by_credentials` and `get_student_by_username_credentials` but they are **never called**. |
| **School admin** | 1) Try `signInWithPassword(email, password)`. 2) If that fails, call `get_admin_by_email_credentials(email, password, school_id)`. 3) If DB says valid, create/link Auth user and call `link_admin_auth(school_id)`. | **Yes.** Used when the admin has a row in `admins` with email+password but no Auth user yet (e.g. created before Auth was used). After first successful legacy login, `user_id` is set and future logins are Auth-only. |
| **Platform (god) admin** | 1) If input looks like email, try `signInWithPassword`. 2) Else call `get_platform_admin_by_credentials(username, password)` and then sign in with pseudo-email `username@platform.bailadmin.local` and `link_platform_admin_auth(username, password)`. | **Yes.** Same idea: migrate legacy platform admins to Auth and link `user_id`. |

### 3.2 Recommendation

- **Keep legacy login for school and platform admins** for now:  
  - Allows existing admins (created before Auth or with only DB credentials) to log in once and be migrated to Auth.  
  - No need to force a “reset password via email” or manual DB update for every legacy admin.
- **You do not need legacy login for students** in the current app: students without `user_id` cannot log in anyway; the app never calls the legacy student RPCs. If you need to support such students in the UI later, you could add a fallback that calls `get_student_by_credentials` or `get_student_by_username_credentials` when Auth fails (and ensure those RPCs stay restricted by `school_id`).
- **Phasing out legacy admin login later:**  
  - Once all admins have logged in at least once (so all have `user_id` set), you could remove the legacy fallback in the app and, if desired, drop or restrict `get_admin_by_email_credentials` and `get_platform_admin_by_credentials` (or make them internal-only). You could run a one-off script to check for admins with `user_id` NULL and either migrate them or notify them to use “forgot password” (if you add that flow).

### 3.3 Summary table

| Question | Answer |
|----------|--------|
| Is legacy login needed for **students**? | **No** in the current app. DB RPCs exist but are unused. Add only if you need to support students without Auth in the UI. |
| Is legacy login needed for **school admins**? | **Yes, for migration/support.** Keep until you’re ready to require Auth-only and handle any remaining NULL `user_id` admins. |
| Is legacy login needed for **platform admins**? | **Yes, same as school admins.** Keep for migration; can remove once all have `user_id`. |
| Can we “not rely” on legacy logins? | You can **prefer** Auth for everyone. Legacy should be a **fallback** only. New admins should be created with Auth from the start so they never need the legacy path. |

---

## 4. Checklist (actionable)

| Priority | Item | Action |
|----------|------|--------|
| High | Competition RPCs | Add `auth.uid()` = owning student check to `competition_registration_submit`, `competition_registration_upsert_draft`, and `competition_get_for_student` in a new migration. |
| Medium | XSS in payment list | Use `escapeHtml(studentName)` and `escapeHtml(req.sub_name)` in the two payment/pending-request list views in `app.js` (~5420–5430 and ~5556–5564). |
| Low | Dead student RPCs | Optionally drop or restrict `get_student_by_credentials` and `get_student_by_username_credentials` if you will never support legacy student login; or document as unused. |
| Low | Code structure | Consider splitting `app.js` into modules and centralizing auth/signup fallback logic. |
| Low | Error handling | Replace ad-hoc `alert`/`console` with a small error layer and consistent user messaging. |
| Optional | Config | Move Supabase URL/key and discovery countries to config; use constants for pseudo-email domains. |
| Optional | Passwords | If product allows, plan move to hashed passwords and stop returning/displaying them in API/UI. |

---

## 5. File reference

| Topic | Paths |
|--------|------|
| App entry, config, escapeHtml | `app.js` lines 1–80 |
| Student signup / login | `app.js` ~7274–7350 (signup), ~7393–7443 (loginStudent) |
| Admin login (with legacy) | `app.js` ~7468–7568 (loginAdminWithCreds) |
| Platform dev login | `app.js` ~7705–7784 |
| Legacy/link RPCs | `supabase/migrations/20260216000000_admin_email_login.sql`, `20260210900000_link_platform_admin_auth.sql`, `20260214170000_student_auth_email_only.sql` |
| RLS base | `supabase/migrations/20260210000000_security_schema_and_rls.sql` |
| Class reg auth | `supabase/migrations/20260220130000_class_registration_rpc_auth.sql` |
| Auto-enroll fix | `supabase/migrations/20260220110000_auto_enroll_student_fix.sql` |
| Competition RPCs (unfixed) | `supabase/migrations/20260210500000_competitions.sql`, `20260211400000_competition_get_for_student_relaxed.sql` |
| Edge Function | `supabase/functions/admin-update-email/index.ts` |
| Security docs | `SECURITY_REVIEW.md`, `supabase/STUDENT_SECURITY_REVIEW.md`, `supabase/STUDENT_IDS.md` |

---

If you want, next steps can be: (1) a single migration that adds caller checks to the three competition RPCs, and (2) a small patch in `app.js` to escape `studentName` and `req.sub_name` in the two payment list views.
