# Architecture

**Analysis Date:** 2025-03-02

## Pattern Overview

**Overall:** Single-page application (SPA) with a single global state object, hash-based routing, and a monolithic UI layer that renders by view name. Backend is Supabase (Postgres + RLS + Edge Functions).

**Key Characteristics:**
- Frontend: one JS bundle (`app.js`) built from `src/main.js` (entry) and `src/legacy.js` (UI and handlers). No React/Vue; DOM updates via `innerHTML` and `document.getElementById('app-root')`.
- State: single mutable object in `src/state.js`, persisted to `localStorage` under key `dance_app_state`. No formal state machine; view is `state.currentView`.
- Data: Supabase client (anon key) in browser; all server access via Supabase REST/RPC from `src/data.js` and from Edge Functions for server-side actions (email, Calendly, reviews, etc.).
- School-specific behavior is gated by `AURE_SCHOOL_ID` in `src/config.js` and helpers like `isAureSchool(school)` / `isAureSubdomain()` so other schools are unaffected.

## Layers

**Shell / static:**
- Purpose: HTML skeleton, modals, nav, single script tag for app.
- Location: repo root — `index.html`, `404.html`, `style.css`, `favicon.png`, `logo.png`, `_headers`.
- Contains: One `<main id="app-root">` plus fixed navs and modals (scanner, payment, student, dev-login, etc.). Script loads: Lucide, QRCode, html5-qrcode, Supabase, Cropper.js, then `app.js`.
- Used by: Browser loads it; `app.js` replaces `#app-root` content per view.

**Entry / bootstrap:**
- Purpose: Create Supabase client, attach core API to `window`, run legacy, then bind DOM events and init (hash/query, saved state, auth, intervals).
- Location: `src/main.js`.
- Contains: Imports from `config.js`, `state.js`, `locales.js`, `utils.js`, `routing.js`, `auth.js`; assigns to `window` (e.g. `window.state`, `window.renderView`, `window.getCapabilities`); `import './legacy.js'`; then event listeners (lang, theme, logout, nav items, logo long-press, hashchange, popstate, click delegation for data-action), and async `init()` that restores state, parses route, calls `renderView()` and `fetchAllData()` / `fetchDiscoveryData()` where appropriate.
- Depends on: All core modules and legacy.
- Used by: Bundler (esbuild) uses it as the single entry point; nothing else imports main.js.

**Config / constants:**
- Purpose: Supabase URL/key, anon client, discovery country/city lists, Aure school id, XSS escape helper.
- Location: `src/config.js`.
- Contains: `SUPABASE_URL`, `SUPABASE_KEY`, `supabaseClient` (created only when `window.supabase` exists), `AURE_SCHOOL_ID`, `DISCOVERY_COUNTRIES_CITIES`, `DISCOVERY_COUNTRIES`, `escapeHtml()`.
- Used by: `data.js`, `legacy.js`, `main.js`, `scanner.js`, `auth.js` (indirectly via state/client).

**State:**
- Purpose: Single source of truth for UI and session; persistence and session-identity checks.
- Location: `src/state.js`.
- Contains: `state` object (currentUser, classes, students, schools, currentView, authMode, theme, isAdmin, paymentRequests, competition* fields, discovery fields, etc.), `saveState()` (writes to localStorage), `setSessionIdentity` / `clearSessionIdentity` / `sessionIdentityMatches`, `resetInactivityTimer`, `checkInactivity` (12h timeout, calls `window.logout`).
- Depends on: Nothing (pure module).
- Used by: All other `src` modules and legacy; HTML/init read from `localStorage` and merge into state in main.js init.

**Data:**
- Purpose: Fetch and normalize data from Supabase; update state and trigger re-render.
- Location: `src/data.js`.
- Contains: `fetchAllData()` (schools, students, classes, subscriptions, admins, payment requests, etc., with throttle), `fetchPlatformData()` (platform-dev), `fetchDiscoveryData()` (discovery list/detail), `refreshSingleStudent()`. Uses `state` and `saveState`; calls `window.renderView()` (and sometimes `window.checkExpirations`) after updates.
- Depends on: `config.js`, `state.js`.
- Used by: `main.js` init and intervals, `legacy.js` (via window), `scanner.js` (refreshSingleStudent).

**Auth (Discovery / Supabase Auth):**
- Purpose: Bootstrap Supabase session and profile into `state.auth`; capability checks for discovery actions (review, suggest).
- Location: `src/auth.js`.
- Contains: `bootstrapAuth(supabaseClient)` (getSession, profiles upsert, set `state.auth`), `getCapabilities(targetContext)` (isLoggedIn, canReview, canSuggestListing, etc.).
- Depends on: `state.js`.
- Used by: `main.js` init (after getSession); discovery UI in legacy uses `getCapabilities` for button gating.

**Routing:**
- Purpose: Map URL (query and hash) to `state.currentView` and competition/dashboard params.
- Location: `src/routing.js`.
- Contains: `parseQueryAndHashForView()` (view=verify-email, view=activate, #/dashboard/profile), `parseHashRoute()` (verify-email, activate, dashboard/profile, admin/schools/:id/competitions/jack-and-jill), `navigateToAdminJackAndJill()`, `navigateToStudentJackAndJill()`.
- Depends on: `state.js`.
- Used by: `main.js` (init and hashchange); legacy uses navigate* for links.

**UI / legacy:**
- Purpose: All view rendering and global handlers (login, logout, signup, fetchAllData, renderView, scanner, modals, etc.).
- Location: `src/legacy.js`.
- Contains: Large view dispatch in `_renderViewImpl()` keyed by `state.currentView` (auth, schedule, shop, qr, admin-students, admin-settings, discovery*, platform-dev*, review-create, etc.); translations object `DANCE_LOCALES`; assigns to `window` (e.g. `window.renderView`, `window.fetchAllData`, `window.logout`, `window.signUpStudent`, `window.loginStudent`). Uses `requestAnimationFrame` and a `renderView()` wrapper to debounce re-renders.
- Depends on: `config.js`, `state.js`, `locales.js`, `utils.js`, `routing.js`, `data.js`, `scanner.js`.
- Used by: main.js (after attaching core to window); DOM and data layer call `window.renderView()`.

**Locales:**
- Purpose: i18n dictionary and current language; update labels in DOM.
- Location: `src/locales.js`.
- Contains: `setLocalesDict(d)`, `t(key)`, `updateI18n()` (querySelector `[data-i18n]` and set textContent).
- Depends on: `state.js` (state.language).
- Used by: main.js, legacy (via window.t and DANCE_LOCALES in legacy for inline strings).

**Utils:**
- Purpose: Formatting and small helpers.
- Location: `src/utils.js`.
- Contains: `formatPrice`, `formatClassTime`, `getPlanExpiryUseFixedDate`, `CURRENCY_LABELS`, `CURRENCY_SYMBOLS`.
- Used by: legacy, main (via window).

**Scanner:**
- Purpose: QR scan UI and attendance confirmation (group/private, deduct classes/events).
- Location: `src/scanner.js`.
- Contains: `startScanner`, `stopScanner`, `handleScan`, `handleScannerPrivateCheckIn`, `cancelAttendance`, `confirmRegisteredAttendance`, `confirmAttendance`, `updateStickyFooterVisibility`. Calls `refreshSingleStudent` and Supabase RPCs.
- Depends on: `config.js`, `state.js`, `data.js`.
- Used by: legacy (via window) and main (close-scanner click).

**Supabase Edge Functions:**
- Purpose: Server-side actions that need secrets or server-side APIs (email, Calendly OAuth, webhooks, cron).
- Location: `supabase/functions/` — each function in its own folder with `index.ts`; shared code in `supabase/functions/_shared/calendly.ts`.
- Contains: `send_verification_email`, `verify_email_token`, `invite_student_activation`, `accept_student_activation`, `admin-update-email`, `calendly-oauth-start`, `calendly-oauth-callback`, `calendly-disconnect`, `calendly-list-event-types`, `calendly-webhook`, `export_calendar_ics`, `process-expired-registrations`, `submit_review`, `submit_listing_suggestion`, `admin_review_listing_suggestion`, `notify_private_class_request`, `send_clase_suelta_confirmation`.
- Depends on: Supabase project env (e.g. CALENDLY_CLIENT_ID/SECRET); some use Deno fetch to Supabase Auth or DB.
- Used by: Frontend (invoke via Supabase client or HTTP), Calendly (webhook), cron (process-expired-registrations).

**Database / RLS:**
- Purpose: Persist schools, students, classes, subscriptions, admins, payment_requests, competitions, discovery, profiles, etc.; enforce row-level security.
- Location: Schema and RPCs defined in `supabase/migrations/*.sql`.
- Used by: Frontend via Supabase client (from/data.rpc); Edge Functions via Supabase client.

## Data Flow

**Page load:**
1. Browser loads `index.html`, then `app.js` (bundle of main + legacy + deps).
2. `main.js` attaches core to `window`, then runs `import './legacy.js'` so `window.renderView`, `window.fetchAllData`, etc. exist.
3. main.js registers DOM listeners; async `init()` runs: read `localStorage` → merge into `state`, apply `parseQueryAndHashForView()` and subdomain/saved state, then `renderView()`.
4. If path is `/discovery` or `/discovery/*`, `state.discoveryPath` is set and later `fetchDiscoveryData()` runs; otherwise `fetchAllData()` is called (and on 120s interval when appropriate).
5. Supabase `getSession()` and `bootstrapAuth()` run; if session exists, `state.auth` and profile are set; init may call `fetchUserProfile` and `renderView` again.
6. `hashchange` and `popstate` call `parseHashRoute()` and `renderView()` (and optionally fetch).

**View rendering:**
1. Something sets `state.currentView` (nav click, hash, or init).
2. Code calls `window.renderView()` (or `renderView()` inside legacy).
3. `renderView()` schedules `_renderViewImpl()` on `requestAnimationFrame` (debounced).
4. `_renderViewImpl()` in `src/legacy.js` reads `state.currentView`, syncs nav/global UI (logout visibility, student/admin nav, active tab), then a long `if (view === '...')` chain renders that view by setting `root.innerHTML` (and sometimes calling async helpers that later set innerHTML again, e.g. dashboard-profile).

**State Management:**
- Mutable global `state`; updates are in-place then `saveState()` to persist. No immutable updates or subscriptions; UI refresh is explicit via `window.renderView()` or re-fetch callbacks that call `renderView()`.

## Key Abstractions

**State object:** Single tree in `src/state.js` (currentUser, currentSchool, currentView, classes, students, schools, paymentRequests, competition*., discovery*, auth, etc.). Any module may read/write; persistence is centralized in `saveState()`.

**View dispatch:** One function `_renderViewImpl()` in `src/legacy.js`; branch per `state.currentView` (e.g. auth, schedule, shop, qr, admin-students, admin-settings, discovery-profile-only, platform-dev-dashboard). New views require a new branch and often new `window.*` handlers attached in legacy.

**Supabase client:** Created once in `src/config.js` when `window.supabase` exists; used by `data.js`, legacy (RPC/from calls), and auth. Edge Functions use their own Supabase client (service role where needed).

**Window globals:** Bridge for HTML onclick and cross-module calls without importing legacy: `window.renderView`, `window.fetchAllData`, `window.logout`, `window.signUpStudent`, `window.loginStudent`, `window.getCapabilities`, etc. Defined in main.js (core) or legacy.js (rest).

**School gating:** `AURE_SCHOOL_ID` in `src/config.js`; `isAureSubdomain()` in `src/data.js`; checks like `state.currentSchool?.id === AURE_SCHOOL_ID` or `isAureSchool(school)` in migrations/backend. Used to enable Aure-only flows (e.g. custom registration, clase suelta) without affecting other schools.

## Entry Points

**Browser (SPA):**
- Location: `index.html` (loads `app.js`).
- Triggers: User opens the app URL (or Vercel rewrite serves index.html).
- Responsibilities: Load scripts and static assets; `app.js` runs main.js then legacy, then init and listeners.

**Build:**
- Location: `build-js.js` (Node).
- Triggers: `npm run build:js` or `npm run build`.
- Responsibilities: esbuild bundle `src/main.js` → `app.js` (IIFE, ES2020).

**Vercel build:**
- Location: `build-vercel.js` (Node).
- Triggers: `npm run build` (after build:js).
- Responsibilities: Copy `index.html`, `404.html`, `app.js`, `style.css`, `favicon.png`, `logo.png`, `_headers` into `dist/`. Vercel deploys `dist` (or configured output directory).

**Supabase Edge Function:**
- Location: Each `supabase/functions/<name>/index.ts`; handler is the default export or request handler.
- Triggers: HTTP request to project’s function URL (from frontend, Calendly webhook, or cron).
- Responsibilities: Validate auth if required, call Supabase/APIs, return JSON or redirect.

## Error Handling

**Strategy:** Try/catch in async flows; log to console; often leave state as-is and call `renderView()` so user sees current state. No global error boundary.

**Patterns:**
- `data.js`: try/catch around Supabase calls; on error log and sometimes set `state.schoolsLoadError` or similar; then `window.renderView()`.
- `main.js` init: try/catch when parsing `localStorage` (fallback to `{}`); catch around getSession/signOut.
- legacy: `_renderViewImpl()` wrapped in try; individual view branches may not catch (errors surface as unhandled rejections or blank view).
- Edge Functions: Return 4xx/5xx with JSON body on failure; caller checks response.ok or catches.

## Cross-Cutting Concerns

**Logging:** `console.log` / `console.error` in places; no structured logger or log level.

**Validation:** Inline checks (e.g. required fields in signup); Supabase RLS and RPCs enforce server-side rules. No shared validation schema layer in frontend.

**Authentication:** School app: username/password or admin credentials stored in state and validated via RPC (no Supabase Auth for school users). Discovery: Supabase Auth (session + profiles); `auth.js` bootstraps session into `state.auth` and provides `getCapabilities()`. Edge Functions that need auth use `getUser(JWT)` or similar.

---

*Architecture analysis: 2025-03-02*
