# Calendly setup (private teachers)

Short guide to enable Calendly OAuth and webhooks for Bailadmin. Webhook subscriptions are **created automatically** when a teacher connects their Calendly account.

## 1. Create a Calendly OAuth app

- Go to [Calendly Developer](https://developer.calendly.com/) and sign in.
- Create an **OAuth 2.0** application.
- Save your **Client ID** and **Client Secret**.

## 2. Set redirect URI in Calendly

Redirect URI must be your Supabase Edge Function callback URL:

- **Supabase Dashboard** → your project → **Project Settings** → **API** → copy **Project URL** (e.g. `https://xyz.supabase.co`).
- **Callback URL** = Project URL + `/functions/v1/calendly-oauth-callback`  
  Example: `https://xyz.supabase.co/functions/v1/calendly-oauth-callback`
- In your Calendly app settings, set **Redirect URI** to that exact URL (no trailing slash).

## 3. Supabase Edge Function env vars

**Project Settings** → **Edge Functions** → **Secrets**. Add:

| Secret | Required | Description |
|--------|----------|-------------|
| `CALENDLY_CLIENT_ID` | Yes | From Calendly app |
| `CALENDLY_CLIENT_SECRET` | Yes | From Calendly app |
| `CALENDLY_REDIRECT_URI` | Yes | Same as redirect URI in Calendly (e.g. `https://<PROJECT_REF>.supabase.co/functions/v1/calendly-oauth-callback`) |
| `CALENDLY_WEBHOOK_URL` | Yes | Your webhook receiver URL: `https://<PROJECT_REF>.supabase.co/functions/v1/calendly-webhook` (used when creating the subscription after OAuth) |
| `CALENDLY_WEBHOOK_SHARED_SECRET` | Recommended | Random string; webhook requests must send it in header `x-bailadmin-secret` (or `calendly-webhook-secret`). If Calendly supports signing, use that instead when available. |
| `APP_ORIGIN` | Yes | Your Bailadmin app URL (e.g. `https://bailadmin.lat`). No trailing slash. |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set by Supabase by default.

## 4. Deploy functions and migrations

```bash
npx supabase functions deploy calendly-oauth-start
npx supabase functions deploy calendly-oauth-callback
npx supabase functions deploy calendly-list-event-types
npx supabase functions deploy calendly-webhook
npx supabase functions deploy calendly-disconnect
npx supabase db push
```

## 5. Test connection and webhook creation

1. As a **private teacher** admin, open **Settings** → **Calendly** → **Connect Calendly**.
2. Complete Calendly OAuth; you should be redirected back to your app with `?calendly=connected` and see “Connected”.
3. **Confirm webhook subscription:** In Supabase, check table `calendly_connections` for your school: column `webhook_subscription_uri` should be set (a Calendly API URI). If it is, the subscription was created automatically.
4. **Disconnect:** Click **Disconnect Calendly**; the row should be removed and the subscription deleted in Calendly.

If `webhook_subscription_uri` stays null after connecting, check Edge Function logs for `calendly-oauth-callback` (e.g. “Calendly webhook create error”). Ensure `CALENDLY_WEBHOOK_URL` is set and matches your deployed `calendly-webhook` URL.

For full flow, manual test checklist, and troubleshooting, see [CALENDLY_SETUP.md](CALENDLY_SETUP.md).

### Migration errors when pushing

- **"relation \"calendly_connections\" does not exist"**  
  The Calendly base migration has not been applied. Apply migrations in order: run `npx supabase db push` so that `20260227100000_calendly_private_bookings.sql` runs before `20260228100000_calendly_webhook_subscription.sql`. If you use the Supabase dashboard, run the migrations in timestamp order.

- **"column already exists"**  
  The column was added manually or by a previous run. The migration uses `ADD COLUMN IF NOT EXISTS`, so this usually means an older version of the migration ran. You can mark the migration as applied (e.g. insert into supabase_migrations.schema_migrations) or add the missing columns manually and then re-push.

- **Permission or RLS errors**  
  Run migrations as a user that can create tables and alter the `public` schema (e.g. Supabase dashboard SQL or `supabase db push` with the project linked).
