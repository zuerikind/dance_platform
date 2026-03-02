# Technology Stack

**Analysis Date:** 2025-03-02

## Languages

**Primary:**
- JavaScript (ES2020+) - Frontend and build scripts; entry `src/main.js`, bundled to `app.js`
- TypeScript - Supabase Edge Functions only; e.g. `supabase/functions/send_verification_email/index.ts`, `supabase/functions/calendly-webhook/index.ts`

**Secondary:**
- SQL - Supabase migrations and RPCs in `supabase/migrations/*.sql`
- HTML/CSS - Static `index.html`, `style.css`; CSP and assets in `index.html`

## Runtime

**Environment:**
- Browser (frontend): ES modules, single bundle `app.js`; Supabase client loaded from CDN before app
- Node.js (build): Used for `build-js.js` and `build-vercel.js`; esbuild requires Node
- Deno (Supabase Edge Functions): All functions use `Deno.serve()` and `Deno.env.get()`

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (lockfileVersion 3)

## Frameworks

**Core:**
- None (vanilla JS) - No React/Vue/Svelte; state and UI in `src/state.js`, `src/legacy.js`, `src/data.js`
- Supabase JS client v2 - Auth, database (RPC + table access), Edge Function invocations; loaded via `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2` in `index.html`; app uses `window.supabase.createClient()` from `src/config.js`

**Testing:**
- Not detected (no Jest/Vitest config or test scripts in `package.json`)

**Build/Dev:**
- esbuild ^0.27.3 - Bundles `src/main.js` → `app.js` (IIFE, target es2020); see `build-js.js`
- Node script `build-vercel.js` - Copies `index.html`, `app.js`, `style.css`, assets into `dist/` for Vercel

## Key Dependencies

**Critical:**
- `@supabase/supabase-js@2` - Backend: DB, Auth, Functions; frontend: loaded from CDN, config in `src/config.js`
- `esbuild` ^0.27.3 - Single production bundle
- `supabase` ^2.0.0 (dev) - CLI for migrations and local functions

**Infrastructure:**
- No frontend framework or router package; routing via hash/query in `src/routing.js`

## Configuration

**Environment:**
- Frontend: Supabase URL and anon key are hardcoded in `src/config.js` (`SUPABASE_URL`, `SUPABASE_KEY`). No `process.env` or `import.meta.env` in frontend; `window.supabase` is expected to be set by the Supabase script in `index.html` before `app.js` runs.
- Edge Functions: All config via `Deno.env.get()` (Supabase injects `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.). No `.env` files in repo for functions; secrets in Supabase project settings.

**Build:**
- `package.json` scripts: `start` = `serve . -s`, `build:js` = `node build-js.js`, `build` = `node build-js.js && node build-vercel.js`
- No `tsconfig.json` in project root (TypeScript only in Supabase functions, which use Deno)

## Platform Requirements

**Development:**
- Node.js (esbuild engines typically Node >=18 per lockfile)
- Supabase CLI for migrations and local Edge Functions
- No `.nvmrc` or `.node-version` in repo

**Production:**
- Static hosting: Vercel (`vercel.json` → `outputDirectory: "dist"`, rewrites to `index.html`)
- Supabase project (hosted): PostgreSQL, Auth, Edge Functions, optional Storage

---

*Stack analysis: 2025-03-02*
