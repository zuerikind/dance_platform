# Coding Conventions

**Analysis Date:** 2025-03-02

## Naming Patterns

**Files:**
- Source: lowercase, single word or descriptive name: `config.js`, `routing.js`, `state.js`, `auth.js`, `data.js`, `utils.js`, `locales.js`, `main.js`, `legacy.js`, `scanner.js`.
- Supabase Edge Functions: kebab-case directory per function: `export_calendar_ics/`, `send_clase_suelta_confirmation/`, `submit_review/`, `calendly-webhook/`. Entry file always `index.ts`.

**Functions:**
- camelCase: `parseHashRoute`, `fetchAllData`, `bootstrapAuth`, `getCapabilities`, `formatUtcForIcs`, `escapeIcsText`. Use descriptive verbs for actions.

**Variables:**
- camelCase: `currentView`, `supabaseClient`, `corsHeaders`, `authHeader`, `rangeDays`. Module-private use leading underscore where useful: `_lastFetchEndTime`, `_localesDict`, `_fetchScheduledTimer` (see `src/data.js`, `src/state.js`, `src/locales.js`).

**Constants:**
- UPPER_SNAKE_CASE: `AURE_SCHOOL_ID`, `SUPABASE_URL`, `SUPABASE_KEY`, `DISCOVERY_COUNTRIES_CITIES`, `CURRENCY_SYMBOLS`, `INACTIVITY_LIMIT`, `SESSION_IDENTITY_KEY`, `FETCH_THROTTLE_MS`, `RATE_LIMIT_PER_24H`, `BUFFER_SECONDS` (in `src/config.js`, `src/state.js`, `src/data.js`, `supabase/functions/submit_review/index.ts`, `supabase/functions/_shared/calendly.ts`).

**Types (TypeScript):**
- PascalCase: `ConnectionRow` in `supabase/functions/_shared/calendly.ts`. Inline types use camelCase for properties.

## Code Style

**Formatting:**
- No Prettier/ESLint/Biome config in repo. Indentation is 4 spaces in `src/` JS; 2 spaces in Supabase function `index.ts` files. Use double quotes in generated `app.js` (esbuild output); source uses single quotes for strings.

**Linting:**
- Not detected. No `eslint.config.*`, `.eslintrc*`, or lint scripts in `package.json`.

## Import Organization

**Order:**
1. External or ESM URLs: `import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';`
2. Same-layer modules: `import { state, saveState } from './state.js';` then `import { supabaseClient } from './config.js';`
3. Side-effect import last when used: `import './legacy.js';` in `src/main.js`

**Path Aliases:**
- None. All imports use relative paths: `./config.js`, `./state.js`, `./routing.js`, `../_shared/calendly.ts`.

## Error Handling

**Frontend (src/):**
- Async: wrap in `try/catch`; set loading/error state and call `renderView()` when applicable. Log with `console.error` for fetch/auth errors (e.g. `src/data.js` lines 39, 69, 476–479, 537–539; `src/auth.js` 43–44).
- Silent ignore: `catch (_)` or `catch (_) { /* ignore */ }` for non-critical failures (e.g. optional sessionStorage, per-call failures in `fetchAllData` in `src/data.js`).
- User-facing errors: store in state (e.g. `state.auth.error`, `state.schoolsLoadError`) and surface in UI; avoid throwing into global handlers.

**Supabase Edge Functions:**
- Validate input and return JSON error body with appropriate status: `401` (missing/invalid auth), `400` (bad request), `404` (not found). Pattern: `return new Response(JSON.stringify({ error: '...' }), { status: 4xx, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });` (see `supabase/functions/send_clase_suelta_confirmation/index.ts`, `supabase/functions/submit_review/index.ts`).
- Parse body safely: `await req.json().catch(() => ({}));` then check required fields.
- For shared logic, throw: `throw new Error('Calendly OAuth not configured');` in `supabase/functions/_shared/calendly.ts`; caller handles and returns response.

## Logging

**Framework:** `console` only.

**Patterns:**
- `console.error('...', err)` for operational errors (fetch, auth, discovery) in `src/data.js`, `src/auth.js`, `src/main.js`.
- `console.warn` for recoverable or session issues (e.g. inactivity logout in `src/state.js`, process_expired_registrations in `src/data.js`).
- No structured logger or log levels.

## Comments

**When to Comment:**
- File-level block comment describing the module’s role and what to change there (e.g. `src/config.js`: Supabase/project and discovery; `src/utils.js`: price/date formatting; `src/auth.js`: auth and capability checks).

**JSDoc/TSDoc:**
- Used for public or non-obvious APIs: `@param`, `@returns` in `src/auth.js` for `bootstrapAuth(supabaseClient)` and `getCapabilities(targetContext)`.

## Function Design

**Size:** No strict limit; `fetchAllData` in `src/data.js` and render logic in `src/legacy.js` are large. Prefer smaller, named helpers where it helps clarity.

**Parameters:** Prefer explicit arguments; options objects used where many optional params (e.g. Supabase function bodies read `body?.field`).

**Return Values:** Return meaningful values; async functions often return `void` when they only update state and trigger `renderView()`.

## Module Design

**Exports:** Named exports only: `export function fn`, `export async function fn`, `export const X`, `export let state`. No default exports in `src/` or Supabase functions.

**Barrel Files:** Not used. Consumers import from the concrete module (e.g. `./config.js`, `./state.js`).

---

*Convention analysis: 2025-03-02*
