# Codebase Structure

**Analysis Date:** 2025-03-02

## Directory Layout

```
dance_platform/
├── .cursor/                 # Cursor rules and plans
│   ├── plans/                # Plan markdown files
│   └── rules/                # live-safety.mdc, supabase-migrations.mdc
├── .planning/
│   └── codebase/             # GSD codebase docs (ARCHITECTURE.md, STRUCTURE.md, etc.)
├── docs/                     # Project docs (VERIFICATION_CHECKLIST.md, discovery, calendar, etc.)
├── public/                   # Optional; _headers may be at root
├── src/                      # Frontend source (ES modules)
│   ├── main.js               # Entry; attaches core to window, runs legacy, init
│   ├── legacy.js             # Monolithic UI: renderView, all views, window handlers
│   ├── config.js             # Supabase client, AURE_SCHOOL_ID, discovery constants, escapeHtml
│   ├── state.js              # state object, saveState, session identity, inactivity
│   ├── data.js               # fetchAllData, fetchPlatformData, fetchDiscoveryData, refreshSingleStudent
│   ├── auth.js               # bootstrapAuth, getCapabilities (Discovery)
│   ├── routing.js            # parseHashRoute, parseQueryAndHashForView, navigate* Jack & Jill
│   ├── locales.js            # setLocalesDict, t, updateI18n
│   ├── utils.js              # formatPrice, formatClassTime, currency helpers
│   └── scanner.js            # QR scanner and attendance confirmation
├── supabase/
│   ├── config.toml           # Function verify_jwt settings (e.g. calendly)
│   ├── functions/            # Edge Functions (TypeScript)
│   │   ├── _shared/          # Shared code (e.g. calendly.ts)
│   │   ├── send_verification_email/
│   │   ├── verify_email_token/
│   │   ├── invite_student_activation/
│   │   ├── accept_student_activation/
│   │   ├── admin-update-email/
│   │   ├── calendly-oauth-start/
│   │   ├── calendly-oauth-callback/
│   │   ├── calendly-disconnect/
│   │   ├── calendly-list-event-types/
│   │   ├── calendly-webhook/
│   │   ├── export_calendar_ics/
│   │   ├── process-expired-registrations/
│   │   ├── submit_review/
│   │   ├── submit_listing_suggestion/
│   │   ├── admin_review_listing_suggestion/
│   │   ├── notify_private_class_request/
│   │   └── send_clase_suelta_confirmation/
│   ├── migrations/           # SQL migrations (timestamp_name.sql)
│   └── tests/                # SQL tests (e.g. competitions_minimal_test.sql)
├── tests/                    # JS tests (e.g. ics-format.test.js)
├── index.html                # SPA shell and app-root
├── 404.html                  # Not-found page
├── style.css                 # Global styles
├── app.js                    # Built bundle (from src/main.js)
├── build-js.js               # esbuild script: src/main.js → app.js
├── build-vercel.js           # Copy static files to dist/
├── package.json              # Scripts: start, build:js, build
├── vercel.json               # SPA rewrite, headers, output directory
├── _headers                  # Optional static headers
├── favicon.png
├── logo.png
├── AGENTS.md                 # Agent rules (live-safety, migrations)
└── docs/                     # Additional documentation
```

## Directory Purposes

**`src/`:**
- Purpose: All frontend application logic; single entry is `main.js`.
- Contains: ES modules for config, state, data, auth, routing, locales, utils, scanner; and the large legacy UI module.
- Key files: `src/main.js`, `src/legacy.js`, `src/state.js`, `src/data.js`, `src/config.js`.

**`supabase/functions/`:**
- Purpose: Supabase Edge Functions (Deno/TypeScript) for server-side actions.
- Contains: One folder per function with `index.ts`; optional `_shared/` for code reused across functions.
- Key files: Each `supabase/functions/<name>/index.ts`; `supabase/functions/_shared/calendly.ts`.

**`supabase/migrations/`:**
- Purpose: Versioned SQL migrations for schema and RPCs (one signature per function name; drop before replace when changing signatures).
- Contains: Files named `YYYYMMDDHHMMSS_description.sql`.

**`tests/`:**
- Purpose: JavaScript tests (e.g. ICS format).
- Contains: `*.test.js` (or similar); run with Node or test runner.

**`docs/`:**
- Purpose: Project and feature documentation.
- Contains: Markdown files (VERIFICATION_CHECKLIST.md, discovery, calendar, STUDENTS_NULL_NAMES_ANALYSIS.md, etc.).

**`.cursor/rules/`:**
- Purpose: Always-applied rules (live-safety.mdc, supabase-migrations.mdc) for backward compatibility and migration discipline.

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis docs consumed by plan/execute phases.
- Contains: ARCHITECTURE.md, STRUCTURE.md, and optionally STACK.md, CONVENTIONS.md, TESTING.md, CONCERNS.md.

## Key File Locations

**Entry points:**
- `index.html`: SPA shell; loads `app.js` and CDN scripts.
- `src/main.js`: JS entry; bundled into `app.js` by esbuild.
- `build-js.js`: Build script; entryPoints `['src/main.js']`, outfile `app.js`.

**Configuration:**
- `src/config.js`: Supabase URL/key, anon client, AURE_SCHOOL_ID, discovery constants.
- `package.json`: Scripts (start, build:js, build); devDependencies (esbuild, supabase).
- `vercel.json`: Rewrites to index.html, headers, output directory (e.g. dist).
- `supabase/config.toml`: Function-level settings (e.g. verify_jwt for Calendly).

**Core logic:**
- `src/state.js`: State shape and persistence.
- `src/data.js`: All Supabase-backed data fetching.
- `src/legacy.js`: View dispatch and UI (very large; add new views here or split when refactoring).

**Routing and auth:**
- `src/routing.js`: Hash/query parsing and competition URL helpers.
- `src/auth.js`: Discovery Supabase Auth bootstrap and capability checks.

**Testing:**
- `tests/ics-format.test.js`: Example JS test.
- `supabase/tests/`: SQL tests.

## Naming Conventions

**Files:**
- Frontend JS: lowercase with hyphens avoided; `main.js`, `legacy.js`, `config.js`, `state.js`, `data.js`, `auth.js`, `routing.js`, `locales.js`, `utils.js`, `scanner.js`.
- Migrations: `YYYYMMDDHHMMSS_short_description.sql` (e.g. `20260228136000_auto_enroll_name_fallback.sql`).
- Edge Functions: folder name matches function name, lowercase with hyphens (e.g. `calendly-oauth-callback`).

**Directories:**
- `src/`: source; no nested feature folders.
- `supabase/functions/<name>/`: one folder per function.
- `supabase/migrations/`: flat list of migration files.
- `docs/`: flat or minimal nesting.

**Exports:**
- Config/state: named exports (`export const state`, `export function saveState`).
- Data/auth/routing: named exports (functions and constants).
- Legacy: assigns to `window` and has `export {}` at end (no consumer imports legacy except main.js side-effect).

## Where to Add New Code

**New view (e.g. new student or admin screen):**
- Add a branch in `_renderViewImpl()` in `src/legacy.js` (e.g. `if (view === 'my-new-view' && root) { ... }`).
- Set `state.currentView = 'my-new-view'` where the view is opened (nav, link, or init).
- Optionally add a nav button in the appropriate nav (student or admin) in the same file; ensure `data-view="my-new-view"` and that main.js nav click handler already supports it (it uses `data-view` to set `state.currentView`).
- If the view needs new RPCs or tables, add migrations in `supabase/migrations/` (one function name = one signature; drop old before create when changing).

**New Supabase Edge Function:**
- Create `supabase/functions/<function-name>/index.ts` with the HTTP handler.
- If it shares logic with other functions, add or use `supabase/functions/_shared/<name>.ts` and import it.
- Configure `verify_jwt` or other options in `supabase/config.toml` if needed.

**New RPC or schema change:**
- Add a new migration file in `supabase/migrations/` with timestamp and descriptive name.
- Follow `.cursor/rules/supabase-migrations.mdc` and `live-safety.mdc`: no new overloads without dropping the old signature; prefer optional params with DEFAULT for backward compatibility.

**New data fetch or API call from frontend:**
- Add the async function in `src/data.js` (or in legacy if it is view-specific and should stay there for now). Use `supabaseClient` from `src/config.js`; update `state` and call `window.renderView()` (or `saveState()`) when appropriate.

**New shared utility or constant:**
- Pure helpers/constants: `src/utils.js` or a new small module in `src/` if it grows. Use named exports and import where needed.

**New school-specific behavior (e.g. another “Aure-like” school):**
- Prefer a generic flag or capability (e.g. on `schools` table) and gate in code by that flag so other schools are unaffected. If a single-school constant is needed, centralize it (e.g. in `config.js`) and gate with a comment and helper (e.g. `isAureSchool(school)`).

## Special Directories

**`dist/`:**
- Purpose: Vercel build output (copied by `build-vercel.js` from root files).
- Generated: Yes, by `npm run build`.
- Committed: Typically no; often in `.gitignore`.

**`node_modules/`:**
- Purpose: npm dependencies.
- Generated: Yes, by `npm install`.
- Committed: No.

**`supabase/.temp/`:**
- Purpose: Supabase CLI temporary files (e.g. project-ref).
- Generated: Yes, by Supabase CLI.
- Committed: No (or only as needed for tooling).

---

*Structure analysis: 2025-03-02*
