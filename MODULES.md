# Module map – where to look for what

This app is split into modules under `src/`. The bundle is built with `npm run build:js` and written to `app.js`. **index.html** loads a single `app.js`; no behavior change for users.

---

## Current modules (implemented)

| Module | Path | Responsibility |
|--------|------|----------------|
| **config** | `src/config.js` | Supabase URL/key, client, discovery constants (`DISCOVERY_COUNTRIES_CITIES`, `DISCOVERY_COUNTRIES`), `escapeHtml`. Change Supabase project, discovery countries, or XSS escaping here. |
| **state** | `src/state.js` | Single app state object `state`, `saveState()`, session identity, inactivity timeout, `APP_VERSION`. Change persisted state, session timeout, or version here. |
| **locales** | `src/locales.js` | `setLocalesDict()`, `t(key)`, `updateI18n()`. DANCE_LOCALES is still in `legacy.js` and passed to `setLocalesDict`. Add or edit UI strings in legacy’s DANCE_LOCALES (or move to locales later). |
| **utils** | `src/utils.js` | `formatPrice`, `formatClassTime`, `CURRENCY_LABELS`, `CURRENCY_SYMBOLS`, `getPlanExpiryUseFixedDate` (stub). Change price/date formatting or currency here. |
| **routing** | `src/routing.js` | `parseHashRoute()`, `navigateToAdminJackAndJill()`, `navigateToStudentJackAndJill()`. Change competition or other hash-based routing here. |
| **data** | `src/data.js` | `fetchAllData()`, `fetchPlatformData()`, `fetchDiscoveryData()`, `resetFetchThrottle()`. Loads schools, students, classes, subscriptions, payment requests, discovery, platform data from Supabase. |
| **scanner** | `src/scanner.js` | `startScanner`, `stopScanner`, `handleScan`, `cancelAttendance`, `confirmRegisteredAttendance`, `confirmAttendance`, `updateStickyFooterVisibility`. QR scan flow and attendance confirmation. |
| **legacy** | `src/legacy.js` | Discovery UI (`renderDiscoveryView`, `slugFromName`, `navigateDiscovery`), auth, school, students, schedule, classes, payments, settings, and `_renderViewImpl()` (dispatcher + view render functions). Attaches data, scanner, and core to `window`. |

---

## Entry point

| Module | Path | Responsibility |
|--------|------|----------------|
| **main** | `src/main.js` | Imports config, state, locales, utils, routing; attaches their exports to `window`; imports `legacy.js` (which registers renderView, fetchAllData, etc.); then runs event listeners and `init()` (restore state, Supabase session, routing, fetch data, background refresh, inactivity). |

---

## Build

- **Bundle:** `npm run build:js` → runs `node build-js.js` → esbuild bundles `src/main.js` into `app.js`.
- **Full build:** `npm run build` → runs build:js then `build-vercel.js` (copies files to `dist/`).
- **Dev:** Run `npm run build:js` then `npm run start`; open the app and use the single `app.js` as today.

---

## Planned modules (from plan, not yet split)

When you continue the split, the plan is:

- **data.js** – ✅ Implemented.
- **auth.js** – Student signup/login, admin login (including legacy fallback), platform dev login, logout, auth modals.
- **discovery.js** – `renderDiscoveryView`, `navigateDiscovery`, `slugFromName`, discovery handlers (upload, save profile, etc.).
- **competition.js** – All competition create/edit/copy/delete, autosave, questions, registrations, student draft/submit, video upload.
- **school.js** – School selection, platform school management, dropdown, create school, clearSchoolData, etc.
- **students.js** – createNewStudent, deleteStudent, filters, renderAdminStudentCard, updateStudentPrompt, add-admin modal, removeAdmin.
- **schedule.js** – Schedule view helpers, class registration, formatClassDate, loadClassAvailability, register/cancel, modals.
- **classes.js** – Class and plan CRUD (admin): updateClass, addClass, removeClass, saveAllPlans, updateSub, addSubscription, removeSubscription.
- **scanner.js** – ✅ Implemented.
- **payments.js** – activatePackage, openPaymentModal, submitPaymentRequest, processPaymentRequest, removePaymentRequest.
- **private-classes.js** – Teacher availability, loadBookingWeek, submitBookingRequest, respondToPrivateClassRequest, etc.
- **settings.js** – saveBankSettings, updateAdminSetting, saveAdminProfile, changeAdminPassword, toggles.
- **views** – `_renderViewImpl()` in legacy is a dispatcher that calls one function per view (e.g. `renderSchoolSelection()`). The first view is extracted as `renderSchoolSelection()`; remaining branches can be extracted the same way or moved to a single `views.js` later.
- **main.js (full)** – Move init and all event listeners from legacy into main; legacy then only exports handlers and view logic.

See the plan file for the full module map and dependency order.
