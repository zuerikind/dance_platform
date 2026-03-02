# External Integrations

**Analysis Date:** 2025-03-02

## APIs & External Services

**Calendly:**
- OAuth (authorize, token, user me), webhook subscriptions, event types list. Used for private lesson booking and syncing with Calendly.
- SDK/Client: `fetch()` to `https://auth.calendly.com/oauth/token`, `https://api.calendly.com/...`; shared helpers in `supabase/functions/_shared/calendly.ts`
- Auth: Edge Function env vars `CALENDLY_CLIENT_ID`, `CALENDLY_CLIENT_SECRET`, `CALENDLY_REDIRECT_URI`, `CALENDLY_WEBHOOK_URL`; webhook secret `CALENDLY_WEBHOOK_SHARED_SECRET` or `CALENDLY_WEBHOOK_SECRET`
- Functions: `calendly-oauth-start`, `calendly-oauth-callback`, `calendly-disconnect`, `calendly-list-event-types`, `calendly-webhook`; frontend invokes start/list/disconnect via `supabaseClient.functions.invoke()` in `src/legacy.js`

**Resend (email):**
- Transactional email: verification emails, student activation invites, clase suelta confirmations, private class request notifications, review submission notifications.
- Client: `fetch('https://api.resend.com/emails', ...)` from Edge Functions
- Auth: `RESEND_API_KEY` in Supabase Edge Function secrets
- Optional env: `EMAIL_FROM` (default `Bailadmin <noreply@bailadmin.lat>`), `PUBLIC_SITE_URL` (default `https://bailadmin.lat`)
- Functions: `send_verification_email`, `invite_student_activation`, `send_clase_suelta_confirmation`, `notify_private_class_request`, `submit_review` (optional email); see `supabase/functions/send_verification_email/index.ts`, `supabase/functions/invite_student_activation/index.ts`, etc.

**Supabase (backend-as-a-service):**
- Database (PostgreSQL), Auth, Edge Functions, Storage (discovery); client used for all data and auth in app
- Connection: Frontend uses `SUPABASE_URL` and anon key from `src/config.js`; Edge Functions use `Deno.env.get('SUPABASE_URL')`, `SUPABASE_SERVICE_ROLE_KEY`, and sometimes `SUPABASE_ANON_KEY`
- RPCs and tables used throughout `src/data.js`, `src/scanner.js`, `src/legacy.js`; migrations in `supabase/migrations/`

## Data Storage

**Databases:**
- PostgreSQL (Supabase). All app data: schools, students, classes, subscriptions, class_registrations, payment_requests, calendly_connections, private_bookings, discovery, etc.
- Connection: Via Supabase client (anon key in browser; service role in Edge Functions). No direct connection string in repo.

**File Storage:**
- Supabase Storage - Used for discovery (e.g. `supabase/migrations/20260214240000_discovery_storage.sql`). No other object-storage usage detected.

**Caching:**
- None (no Redis or cache layer referenced)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Email/password; `auth.users` linked to `students.user_id`, `admins.user_id`, `platform_admins.user_id`
- Implementation: Frontend uses `supabaseClient.auth.getSession()`, `signInWithPassword`, `signUp`, `signOut`, `refreshSession`, `setSession` in `src/legacy.js` and `src/auth.js`; Edge Functions validate JWT via `adminClient.auth.getUser(token)` (and some functions have `verify_jwt = false` in `supabase/config.toml` for callback/webhook flows)
- No third-party OAuth for user login (Calendly OAuth is for Calendly API access per school, not user identity)

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry or similar in codebase)

**Logs:**
- Console in Edge Functions; no centralized logging service referenced

## CI/CD & Deployment

**Hosting:**
- Vercel - Static site from `dist/`; config in `vercel.json` (outputDirectory, rewrites, security headers, CSP)
- Supabase - Hosted project for DB, Auth, Edge Functions, Storage

**CI Pipeline:**
- Not detected (no GitHub Actions or other CI config in repo)

## Environment Configuration

**Required env vars (Supabase Edge Functions):**
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` - All functions
- `SUPABASE_ANON_KEY` - Some functions (e.g. `invite_student_activation`, `send_clase_suelta_confirmation`)
- `RESEND_API_KEY` - Email-sending functions (optional for non-email flows)
- Calendly: `CALENDLY_CLIENT_ID`, `CALENDLY_CLIENT_SECRET`, `CALENDLY_REDIRECT_URI`, `CALENDLY_WEBHOOK_URL`; webhook: `CALENDLY_WEBHOOK_SHARED_SECRET` or `CALENDLY_WEBHOOK_SECRET`
- Optional: `EMAIL_FROM`, `PUBLIC_SITE_URL`, `APP_ORIGIN`

**Secrets location:**
- Supabase project: Dashboard → Project Settings → Edge Functions → secrets (or equivalent). No `.env` committed for functions.

**Frontend:**
- No env vars; Supabase URL and anon key in `src/config.js` (committed).

## Webhooks & Callbacks

**Incoming:**
- Calendly webhook - POST to Edge Function `calendly-webhook`; events `invitee.created`, `invitee.canceled`; optional verification via header `x-bailadmin-secret` or `calendly-webhook-secret` matching `CALENDLY_WEBHOOK_SHARED_SECRET` / `CALENDLY_WEBHOOK_SECRET`. See `supabase/functions/calendly-webhook/index.ts`
- Calendly OAuth callback - GET to `calendly-oauth-callback` (no JWT; state validated from DB)

**Outgoing:**
- Frontend invokes Edge Functions via `supabaseClient.functions.invoke()`: `send_verification_email`, `calendly-oauth-start`, `calendly-list-event-types`, `calendly-disconnect`, `notify_private_class_request`, `admin-update-email` (see `src/legacy.js`)
- Edge Functions call Calendly API and Resend API as above
- No outbound webhooks to other systems (e.g. no Stripe; payment_requests are in-DB only)

---

*Integration audit: 2025-03-02*
