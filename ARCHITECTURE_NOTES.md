# Bailadmin – Architecture Notes

Bailadmin is a **static SPA**: single `index.html` + `app.js` (built from `src/` with esbuild). No Next.js, no `/api` folder. Server-side logic uses **Supabase Edge Functions**, invoked from the SPA via `supabase.functions.invoke()`.

---

## 1. Supabase client and auth

- **Initialization:** [src/config.js](src/config.js) exports `SUPABASE_URL`, `SUPABASE_KEY`, and `supabaseClient` (created with `window.supabase.createClient()` when in browser). The same client is used app-wide.
- **Sessions:** Supabase Auth stores session in localStorage; the app calls `supabaseClient.auth.getSession()` on init and after sign-in/sign-up. Session is the single source of truth for “logged-in user.”
- **Student/school logins:** School students sign up or log in with email+password; the app then calls RPCs like `create_student_with_auth` or `get_student_by_user_id` and sets `state.currentUser` (with `id`, `school_id`, etc.). Admins sign in with email+password and `link_admin_auth`. Platform dev uses a separate dev login. **Discovery users** (Phase 1) sign up/log in the same way but have no school; they are identified by a `profiles` row with `origin='discovery'`.

---

## 2. Routing

- **State:** `state.currentView` drives the main app content (school-selection, auth, schedule, admin-students, etc.). `state.discoveryPath` is set when the URL path is `/discovery` or `/discovery/...` and causes the discovery UI to render instead of the normal view dispatcher.
- **URL handling:**
  - **Path:** On load and `popstate`, `window.location.pathname` is read. If it is `/discovery` or starts with `/discovery/`, `state.discoveryPath` is set (e.g. `/discovery`, `/discovery/register`, `/discovery/login`, `/discovery/some-slug`).
  - **Query:** Query params (e.g. `?view=verify-email&token=...`) can set `state.currentView` and `state.verifyEmailToken` so deep links work for email verification.
  - **Hash:** [src/routing.js](src/routing.js) parses `window.location.hash` for competition routes (e.g. `#/admin/schools/:id/competitions/jack-and-jill`, `#/student/competitions/:id/jack-and-jill`). Hash can also be used for `#/dashboard/profile` to show the unified dancer profile settings view.
- **Mapping (Phase 1):**
  - `/discovery/register` → discovery-register (form in discovery layout)
  - `/discovery/login` → discovery-login (form in discovery layout)
  - `?view=verify-email&token=...` or `#/verify-email?token=...` → verify-email view
  - `#/dashboard/profile` or path `/dashboard/profile` (if added) → dashboard-profile view

---

## 3. Where views are rendered

- **Entry:** [src/main.js](src/main.js) runs init, restores state from localStorage, syncs with Supabase session, then calls `window.renderView()`.
- **Dispatcher:** [src/legacy.js](src/legacy.js) defines `renderView()` → `_renderViewImpl()`. Logic:
  1. If `state.discoveryPath` is set, `window.renderDiscoveryView(state.discoveryPath)` is called and its HTML is injected into `#app-root`. Discovery list/detail/register/login are handled inside `renderDiscoveryView` based on the path.
  2. Otherwise, `state.currentView` is used in a large switch: school-selection, auth, platform-dev-dashboard, admin-*, schedule, shop, qr, etc. Each branch appends HTML to a container and assigns to `root.innerHTML`.
- **New views (Phase 1):** `discovery-register` and `discovery-login` are rendered inside `renderDiscoveryView` when path is `/discovery/register` or `/discovery/login`. `verify-email` and `dashboard-profile` are handled as new branches in `_renderViewImpl()` (or by setting `state.currentView` and rendering in the main container).

---

## 4. Where to add new views and components

- **New “view” identifier:** Add a string to the `state.currentView` set (e.g. `'dashboard-profile'`, `'verify-email'`). Ensure init and routing set it from URL (query or hash).
- **New discovery sub-pages:** In [src/legacy.js](src/legacy.js), inside `window.renderDiscoveryView`, add an `if (path === '/discovery/register')` (etc.) and return the corresponding HTML string. Use the same container styles as existing discovery (e.g. `discovery-page`, `auth-page-container`).
- **New non-discovery views:** In `_renderViewImpl()`, add `else if (view === 'dashboard-profile') { ... }` (and similar), build HTML, and set `html` or assign to `root.innerHTML`. Reuse existing patterns (e.g. `ios-list`, `btn-primary`, `auth-page-container`).
- **Global banner:** Render a fixed top banner (e.g. inside a dedicated div in `index.html` or prepended in the first container) when `state.userProfile?.origin === 'discovery'` and `!state.userProfile?.email_confirmed`. Update it in `renderView()` or in a small function called after profile load.

---

## 5. Data and RPCs

- **Existing:** Schools, students, classes, subscriptions, payment_requests, admins, platform_admins; RPCs like `create_student_with_auth`, `auto_enroll_student`, `get_student_by_user_id`, `link_student_auth`, discovery RPCs. Student identity for school-linked users comes from `students` + `student_profiles` (view `students_with_profile`).
- **Phase 1:** New table `profiles` (one row per auth user: id, email, role, origin, email_confirmed, first_name, last_name, etc.). New tables `email_verifications` and `profile_school_links`. The SPA reads/updates `profiles` for the unified profile settings page; Edge Functions use the service role for verification flows.

---

## 6. Consistency and style

- **i18n:** All user-facing strings go through `window.t(key)` or `t(key)`; keys are defined in [src/legacy.js](src/legacy.js) in `DANCE_LOCALES` (en, es, de). Add new keys for discovery register/login, verify-email, profile form, banner, and gating messages.
- **Styling:** Reuse existing classes from [style.css](style.css) (e.g. `btn-primary`, `ios-list`, `auth-page-container`, `discovery-*`). No new framework or CSS-in-JS.
- **Handlers:** Global handlers are attached to `window` in legacy.js (e.g. `window.signUpStudent`, `window.loginStudent`). Discovery register/login and “resend verification” should be similar: `window.discoveryRegister`, `window.discoveryLogin`, `window.resendVerificationEmail`, `window.verifyEmailWithToken`.

---

## 7. Phase 1 test plan

1. **Register on discovery → profile created origin=discovery → banner visible → email sent**
   - Open `/discovery/register`, enter email + password, submit.
   - Expect: redirect to `/discovery`, `profiles` row exists with `origin='discovery'`, `email_confirmed=false`; blue banner “Confirm your email to unlock reviews and adding schools” with Resend button; Edge Function `send_verification_email` was called (check Resend or logs if configured).

2. **Click verification link → verify view → email_confirmed flips true → banner disappears**
   - Open the link from the email (e.g. `/?view=verify-email&token=...`).
   - Expect: “Verifying...” then “Email confirmed!”; redirect or link to profile; after refresh or navigate to discovery, banner is gone; `profiles.email_confirmed=true` for that user.

3. **Unconfirmed user attempts review → blocked + resend CTA**
   - As a discovery user with `email_confirmed=false`, open a school detail page.
   - Expect: under the main CTA, message “Confirm your email to unlock reviews and adding schools” with Resend button; no active “Leave a review” / “Suggest a school” (or they are disabled / gated).

4. **Confirmed user attempts review → allowed**
   - As a discovery user with `email_confirmed=true`, open a school detail page.
   - Expect: “Leave a review” and “Suggest a school” placeholders visible (Phase 1 they can be disabled “Coming soon”; gating logic allows them).

5. **Login → dashboard-profile → edit profile → persists**
   - Log in (discovery or school), go to `#/dashboard/profile` or click Profile in bottom nav.
   - Expect: profile form with first name, last name, phone, city, country, Instagram; email and Verified/Not verified; Linked schools section. Change fields, Save; reload page and confirm values persisted.

6. **Existing school admin flows still work**
   - As admin: create student, view students, scan, manage memberships, etc.
   - Expect: no regressions; student creation and login at school auth unchanged.
