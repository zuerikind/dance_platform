# Confirm-email setup with Resend

The app already sends verification emails via **Resend** from the Supabase Edge Function `send_verification_email`. You only need to add your Resend API key and optional env vars in Supabase.

## Flow (already implemented)

1. **Discovery user signs up** → a row is created in `profiles` with `origin = 'discovery'`, `email_confirmed = false`.
2. **First signup or "Resend verification email"** → the SPA calls the Edge Function `send_verification_email` (with the user’s JWT).
3. **Edge Function** generates a one-time token, stores its hash in `email_verifications`, and sends an email via Resend with a link like:  
   `https://yoursite.com/?view=verify-email&token=...`
4. **User clicks the link** → SPA opens the verify-email view and calls `verify_email_token` with the token. The function marks the token as used and sets `profiles.email_confirmed = true`.

## Steps to enable Resend

### 1. Get your Resend API key

- Log in at [resend.com](https://resend.com).
- Go to **API Keys** and create a new key (e.g. “Bailadmin production”).
- Copy the key (starts with `re_`); you won’t see it again.

### 2. Add the secret in Supabase

- Open your project: [Supabase Dashboard](https://supabase.com/dashboard) → your project.
- Go to **Settings** → **Edge Functions** (or **Project Settings** → **Edge Functions**).
- Under **Secrets**, add:
  - **Name:** `RESEND_API_KEY`
  - **Value:** your Resend API key (e.g. `re_xxxxxxxx`).

Save. The Edge Function will then use this when sending verification emails.

### 3. (Optional) Set sender and site URL

By default the function uses:

- **From:** `Bailadmin <noreply@bailadmin.lat>`
- **Site URL:** `https://bailadmin.lat` (used for the link in the email)

To override, add these as Edge Function secrets (same place as above):

| Secret            | Example                               | Purpose                          |
|-------------------|---------------------------------------|----------------------------------|
| `EMAIL_FROM`      | `Bailadmin <onboarding@yourdomain.com>` | Sender address in Resend         |
| `PUBLIC_SITE_URL` | `https://yourapp.com`                 | Base URL for the verify link     |

**Important:** In Resend, the “From” domain (or the Resend sandbox domain) must be allowed. If you use your own domain, add and verify it in Resend (Domains).

### 4. Resend: domain and sending

- **Testing:** You can send to your own email first; Resend’s free tier allows this.
- **Your domain:** In Resend go to **Domains**, add your domain (e.g. `yourdomain.com`), and add the DNS records they show (SPF, DKIM, etc.). After verification, use that domain in `EMAIL_FROM` (e.g. `noreply@yourdomain.com`).
- **Sandbox:** If you don’t verify a domain, Resend may restrict who you can send to; check Resend’s docs for current sandbox limits.

### 5. Deploy the Edge Function (if you changed code)

If you only added secrets, no redeploy is needed. If you changed the function (e.g. CORS), you need to deploy from your machine using the **Supabase CLI**.

**If `supabase` is not recognized**, use the CLI via this project (no global install):

1. **Install dependencies** (includes Supabase CLI as dev dependency):
   ```bash
   npm install
   ```
2. **Log in and link** (one-time; your project ref is in the Supabase URL, e.g. `fziyybqhecfxhkagknvg` from `https://fziyybqhecfxhkagknvg.supabase.co`):
   ```bash
   npx supabase login
   npx supabase link --project-ref fziyybqhecfxhkagknvg
   ```
   Replace `fziyybqhecfxhkagknvg` with your own project ref if different.
3. **Deploy both Edge Functions** (use `--no-verify-jwt` so the gateway forwards requests; the functions validate input themselves):
   ```bash
   npx supabase functions deploy send_verification_email --no-verify-jwt
   npx supabase functions deploy verify_email_token --no-verify-jwt
   ```
   The verify link in the email will only work after `verify_email_token` is deployed with `--no-verify-jwt`.

**Alternative (global CLI on Windows):** [Scoop](https://scoop.sh): `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git` then `scoop install supabase`. Then you can run `supabase` instead of `npx supabase`.

### 6. Fix "bailadmin.lat domain is not verified"

Add the secret **EMAIL_FROM** = `Bailadmin <onboarding@resend.dev>` in Supabase → Settings → Edge Functions → Secrets. Resend allows this sender without domain verification. No redeploy needed; try Resend again. For production, verify `bailadmin.lat` at [resend.com/domains](https://resend.com/domains) instead.

### 7. Test the flow

1. Open your app and register a new discovery user (email + password).
2. In Profile (or the confirm banner), click **Resend verification email**.
3. Check the inbox (and spam) for the “Confirm your email – Bailadmin” message.
4. Click **Confirm my email** in the email; you should see “Email confirmed!” and the profile should show “Verified”.

If the email doesn’t arrive:

- **502 Bad Gateway** means the function ran but Resend’s API failed. The app shows Resend’s error when the function returns it; also check Edge Function logs.
- In Supabase, check **Edge Functions** → **Logs** for `send_verification_email` and any Resend error.
- In Resend, check **Logs** for failed or blocked sends.
- Ensure `RESEND_API_KEY` is set and that `EMAIL_FROM` (if set) uses a verified domain or Resend’s sandbox (e.g. `onboarding@resend.dev` for testing).

### CORS errors from localhost (e.g. `http://localhost:3000`)

If the browser console shows **CORS policy** blocking requests to `send_verification_email` or **FunctionsFetchError**:

1. **Redeploy the Edge Function** so it uses the updated CORS response (preflight returns `204` with `Access-Control-Allow-Methods` and `Access-Control-Allow-Origin: *`):
   ```bash
   supabase functions deploy send_verification_email
   ```
2. Ensure the function is deployed and not failing on cold start (check **Edge Functions** → **Logs** in the Supabase dashboard).
3. The function allows any origin (`*`). For production you can restrict this in the function code if needed.

## Summary

| What                    | Where / How                                      |
|-------------------------|--------------------------------------------------|
| Resend API key          | Resend dashboard → API Keys → create → copy       |
| Supabase secret         | Project → Settings → Edge Functions → Secrets   |
| Secret name             | `RESEND_API_KEY`                                 |
| Optional: sender        | Secret `EMAIL_FROM` (e.g. `Bailadmin <noreply@yourdomain.com>`) |
| Optional: link base URL | Secret `PUBLIC_SITE_URL` (e.g. `https://yourapp.com`) |
| Verify link format      | `{PUBLIC_SITE_URL}/?view=verify-email&token=...` |

Once `RESEND_API_KEY` is set, the existing confirm-email process runs end-to-end with Resend.
