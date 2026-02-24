# Calendly integration for private teachers

Private teachers can connect their Calendly account and choose one event type for “Private class booking.” Students see live availability via an embedded Calendly widget and book directly; webhooks create bookings in Bailadmin and deduct/refund private credits idempotently.

## Flow (implemented)

1. **Teacher** → Settings → “Connect Calendly” (OAuth) → “Select event type” and save.
2. **Student** → Book Class (teacher-booking view) → sees embedded Calendly widget, books a slot.
3. **Calendly** sends `invitee.created` → Edge Function creates `private_bookings` and idempotent deduct (one pass_transactions row, one `deduct_student_classes` call).
4. **Calendly** sends `invitee.canceled` → booking status set to canceled, idempotent refund (one refund row, one `refund_student_private` call).

## Steps to enable Calendly

### 1. Create a Calendly OAuth application

- Go to [Calendly Developer](https://developer.calendly.com/) and sign in.
- Create an application (OAuth 2.0).
- Note your **Client ID** and **Client Secret**.

### 2. Configure redirect URI (callback URL)

You need one URL that tells Calendly where to send the user after they approve the connection. That URL is your **callback URL**.

**How to get your callback URL:**

1. Open your **Supabase Dashboard** and select your project.
2. Go to **Project Settings** (gear icon) → **API**.
3. Copy the **Project URL** (it looks like `https://abcdefgh.supabase.co`).
4. Add this to the end of it: `/functions/v1/calendly-oauth-callback`

**Example:** If your Project URL is `https://fziyybqhecfxhkagknvg.supabase.co`, then your callback URL is:
```text
https://fziyybqhecfxhkagknvg.supabase.co/functions/v1/calendly-oauth-callback
```

Use that **exact** URL in two places:
- In **Calendly**: in your app’s settings, set **Redirect URI** to this URL.
- In **Supabase**: set the `CALENDLY_REDIRECT_URI` secret to this same URL (see step 3).

### 3. Add Edge Function secrets (Supabase)

In **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**, add:

| Secret | Example | Purpose |
|--------|---------|---------|
| `CALENDLY_CLIENT_ID` | Your Calendly app Client ID | OAuth |
| `CALENDLY_CLIENT_SECRET` | Your Calendly app Client Secret | OAuth |
| `CALENDLY_REDIRECT_URI` | `https://<PROJECT_REF>.supabase.co/functions/v1/calendly-oauth-callback` | Must match exactly the value configured in the Calendly app |
| `CALENDLY_WEBHOOK_URL` | `https://<PROJECT_REF>.supabase.co/functions/v1/calendly-webhook` | Used by the OAuth callback to create the webhook subscription automatically. Must be the public URL of your calendly-webhook function. |
| `APP_ORIGIN` | See below | Your Bailadmin app’s URL (where users open the app). After OAuth, users are sent to `{APP_ORIGIN}/#/settings?calendly=connected`. No trailing slash. |
| `CALENDLY_WEBHOOK_SHARED_SECRET` | Recommended | If set, webhook requests must include header `x-bailadmin-secret` (or `calendly-webhook-secret`) with this value. Use a random string. |
| `CALENDLY_WEBHOOK_SECRET` | Optional (legacy) | Same as above; `CALENDLY_WEBHOOK_SHARED_SECRET` takes precedence. |

**What to put for `APP_ORIGIN`:** The root URL of your Bailadmin app—where teachers and students actually use the site. Examples: `https://bailadmin.lat`, `https://app.yourstudio.com`, or `http://localhost:5173` for local dev. No trailing slash. After connecting Calendly, users are redirected to this URL so they land back in your app’s Settings page.

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are usually set by Supabase for Edge Functions; ensure they are available.

### 4. Webhook subscription (automatic)

When a teacher completes OAuth, the **calendly-oauth-callback** function creates a Calendly webhook subscription (scope=user, events: `invitee.created`, `invitee.canceled`) pointing to `CALENDLY_WEBHOOK_URL`. No manual registration in Calendly is required. The subscription URI is stored in `calendly_connections.webhook_subscription_uri`. When the teacher clicks **Disconnect Calendly**, the subscription is deleted via the Calendly API and the connection row is removed.

### 5. Deploy Edge Functions

Deploy (or ensure they are deployed):

- `calendly-oauth-start`
- `calendly-oauth-callback`
- `calendly-list-event-types`
- `calendly-webhook`
- `calendly-disconnect`

**If the `supabase` command is not found:** use `npx supabase` instead (requires Node.js). Or install the CLI: `npm install -g supabase`.

```bash
npx supabase functions deploy calendly-oauth-start
npx supabase functions deploy calendly-oauth-callback
npx supabase functions deploy calendly-list-event-types
npx supabase functions deploy calendly-webhook
npx supabase functions deploy calendly-disconnect
```

**Important:**  
- The app calls these functions via **`supabaseClient.functions.invoke()`**, so the Supabase client sends the anon key and the signed-in user’s JWT automatically.  
- The project uses `supabase/config.toml` with `verify_jwt = false` for these four functions. After changing config or function code, **redeploy** so the gateway applies it:  
  `npx supabase functions deploy calendly-oauth-start` `npx supabase functions deploy calendly-oauth-callback` `npx supabase functions deploy calendly-list-event-types` `npx supabase functions deploy calendly-disconnect`  
- `calendly-oauth-start` and `calendly-list-event-types` accept **POST** with body `{ school_id }` (GET with query still works). Redeploy after pulling the latest code.

### 6. Run the migration

Apply the Calendly migration so the new tables and RPCs exist:

```bash
supabase db push
```

Or apply the migration file `supabase/migrations/20260227100000_calendly_private_bookings.sql` manually.

## Manual test checklist

- [ ] **Connect Calendly:** As a private teacher admin, open Settings → Calendly → “Connect Calendly”. Complete OAuth; you are redirected back with `?calendly=connected`. Settings show “Connected”. In DB, `calendly_connections` has `organization_uri` and `webhook_subscription_uri` set.
- [ ] **Event type:** “Select event type” dropdown loads; choose one and Save. Selection is persisted.
- [ ] **Student embed:** As a student with the same teacher school, open Book Class. The Calendly embed appears with the teacher’s scheduling URL (and prefill if logged in).
- [ ] **Booking:** Book a slot in Calendly. In Bailadmin, one row appears in `private_bookings` and one in `pass_transactions` (type `deduct`). Student’s private balance decreases by 1.
- [ ] **Idempotency:** Trigger the same webhook again (or resend). No duplicate `private_bookings` row; no second deduct (unique on `calendly_invitee_uri` and `(booking_id, type)`).
- [ ] **Cancel:** Cancel the event in Calendly. The booking status becomes `canceled`; one `pass_transactions` row (type `refund`) and student’s private balance increases by 1. Second cancel webhook does not double-refund.
- [ ] **RLS:** As another teacher, you cannot see the first teacher’s Calendly connection or tokens. Students never see tokens.

## Troubleshooting

- **Settings or event-type dropdown stuck on "Cargando..." / "Error: Failed to fetch" / CORS blocking `calendly-disconnect` or `calendly-list-event-types`:**  
  The browser sends an OPTIONS preflight before the real request. If the Supabase gateway still requires a JWT (`verify_jwt` true), it returns 401 for OPTIONS (no token is sent on preflight), so CORS fails and the UI never gets a response. Fix: ensure `supabase/config.toml` has `verify_jwt = false` for `calendly-disconnect` and `calendly-list-event-types`, then **redeploy both functions** so the gateway applies the config:  
  `npx supabase functions deploy calendly-disconnect` and `npx supabase functions deploy calendly-list-event-types`. Restart or refresh the app after deploy.
- **"Failed to start Calendly connection" (or HTTP 404/500 when clicking Connect Calendly):**  
  1. **Deploy the Edge Function:** `npx supabase functions deploy calendly-oauth-start`. If you get 404, the function is not deployed or the app’s `SUPABASE_URL` points to another project.  
  2. **HTTP 401 (Unauthorized):** The project uses `supabase/config.toml` with `verify_jwt = false` for `calendly-oauth-start` and `calendly-oauth-callback` (start validates the user JWT itself; callback has no JWT because Calendly redirects the browser). After adding or changing `config.toml`, redeploy both: `npx supabase functions deploy calendly-oauth-start` and `npx supabase functions deploy calendly-oauth-callback`.
  3. **Set Edge Function secrets:** In Supabase → Project Settings → Edge Functions → Secrets, set `CALENDLY_CLIENT_ID` and `CALENDLY_REDIRECT_URI`. If either is missing, the function returns 500 “Calendly OAuth not configured”.  
  4. **Private teacher + admin:** You must be signed in as an **admin** of a school whose **profile type** is “private_teacher”. If the school is a regular studio (not private teacher) or you’re not an admin, the function returns 403 “Not a private teacher admin”.  
  5. **Migrations applied:** The `calendly_oauth_state` table must exist (from migration `20260227100000_calendly_private_bookings.sql`). If it’s missing, the function returns 500 “Failed to create state”. Run `npx supabase db push` to apply migrations.
- **Calendly section or button not visible on deployed site:** The app needs the updated Content-Security-Policy (with `https://cdn.jsdelivr.net` in `style-src`, `font-src`, `connect-src`). Ensure the latest code is deployed: run `npm run build` (which copies `_headers` into `dist/`), then deploy. If your host uses headers from the repo root (e.g. Vercel with `vercel.json`), redeploy so the new headers are applied. Hard-refresh or clear cache after deploy.
- **Student booking shows "failed to load" or Calendly iframe is blocked:** The app must allow framing Calendly so students can see the embed. Ensure CSP includes `frame-src 'self' https://calendly.com` in `index.html`, `_headers`, and `vercel.json`. Without this, the browser blocks the iframe and students see a broken/failed view. Redeploy after adding it.
- **Console CSP errors on production (e.g. bailadmin.lat) blocking cdn.jsdelivr.net or fonts:** The live site must send a CSP that allows `https://cdn.jsdelivr.net` for `style-src`, `font-src`, and `connect-src`, and `data:` for `font-src` (for inline fonts). If the console shows a CSP *without* these, the deployment is using an old config or the host is not applying `vercel.json` / `_headers`. Fix: redeploy after pulling the latest code (so `vercel.json` and `dist/_headers` include the full CSP), or configure your host to use the CSP from this repo. The app also sets a CSP meta tag in `index.html` as a fallback when the server does not send CSP headers.
- **Event type dropdown shows an error message (e.g. "Failed to load event types") instead of list:** The app now shows the real error and a "Retry" button. Common causes: (1) Supabase Edge Functions not redeployed with `verify_jwt = false` (redeploy `calendly-list-event-types`), (2) invalid or expired session (sign out and sign in again), (3) Calendly not connected for this school (reconnect Calendly). Check the error text and retry after fixing.
- **Redirect after OAuth goes to wrong URL:** Set `APP_ORIGIN` to your SPA’s origin (e.g. `https://yourapp.com`) with no trailing slash. Callback redirects to `{APP_ORIGIN}/#/settings?calendly=connected`.
- **“Event type not linked to a teacher”:** The webhook looks up `calendly_event_type_selection` by the event type URI in the payload. Ensure the teacher has selected an event type in Settings and that the webhook event is for that same event type.
- **Webhook 401:** If `CALENDLY_WEBHOOK_SHARED_SECRET` (or `CALENDLY_WEBHOOK_SECRET`) is set, requests must include that value in the `x-bailadmin-secret` or `calendly-webhook-secret` header.
- **Short setup:** See [calendly.md](calendly.md) for a concise setup guide.
