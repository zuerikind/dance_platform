# Research: confirmation emails (Auré clase suelta + private teachers)

## What “confirmation email” means in the app

| Flow | Trigger | Edge function | Resend |
|------|---------|---------------|--------|
| **Auré – clase suelta requested** | Student submits request → `request_clase_suelta` RPC | `notify_clase_suelta_request` (→ school admin(s)) | Yes |
| **Auré – clase suelta approved** | Admin taps Approve → `admin_approve_clase_suelta` RPC | `send_clase_suelta_confirmation` (→ student) | Yes |
| **Private teacher – lesson accepted** | Teacher accepts request → `teacher_respond_to_request` | `send_private_lesson_confirmation` | Yes |
| **Discovery – verify email** | User taps resend / after register | `send_verification_email` | Yes |

All three need **`RESEND_API_KEY`** (and usually **`EMAIL_FROM`** verified in Resend) on the Supabase project’s Edge Function secrets.

---

## Root causes found (why mail “still does not work”)

### 1. Missing `apikey` header on `fetch` to Edge Functions

Supabase’s gateway expects:

- `Authorization: Bearer <user_jwt>`
- **`apikey: <anon_key>`**

The app called:

```http
POST /functions/v1/send_clase_suelta_confirmation
Authorization: Bearer …
```

**without** `apikey`. Depending on project/version, the request can fail at the edge (401 / JWT invalid) so the function body never runs reliably.

**Fix (implemented):** central `postEdgeFunction()` sends both headers; Auré approve + private accept use it. `resendVerificationEmail` fetch also sends `apikey`.

### 2. Auré admin with no Supabase Auth session

`approveClaseSuelta` only called the email function **if** `getSession()` returned a JWT.

Admins who log in via **legacy path only** (DB password, Auth sign-in never succeeds) have `state.isAdmin === true` but **no** `supabaseClient.auth` session → **email send was silently skipped**.

**Fix (implemented):** try `getSession` → `refreshSession` → fallback `state.auth.session`; if still no token, show a clear message in the admin banner (localized) telling them to sign in with linked email/password.

### 3. Student has no email on `students` / `profiles`

Both functions resolve recipient from `students.email`, then `profiles.email` by `user_id`. Empty → 200/400 with “no email” → no mail.

**Mitigation:** UI now surfaces this where possible (banner / alert).

### 4. Resend / domain

- No `RESEND_API_KEY` → 503 “Email service not configured”.
- Unverified `from` domain → Resend API error (502 with message).

Check Supabase Dashboard → Edge Functions → Secrets: `RESEND_API_KEY`, `EMAIL_FROM`, `PUBLIC_SITE_URL` (verification flow only).

### 5. Private lesson “not accepted” race (minor)

Email function requires `private_class_requests.status === 'accepted'`. In theory the row might not be visible immediately after RPC; **one retry after ~700ms** was added.

---

## How to verify in production

1. **Secrets:** Dashboard → ensure `RESEND_API_KEY` and `EMAIL_FROM` are set; Resend domain verified.
2. **Auré:** Approve a clase suelta as an admin who signed in with **email + password** (Supabase session). Check student inbox + spam.
3. **Private teacher:** Accept a request with the same session requirement; confirm student has email.
4. **If banner says “sign in with linked admin email”:** use Settings / full email login so `getSession()` returns a JWT, or run **admin-auth-sync** flow once from login.

---

## Aure clase suelta: HTTP 401 on `send_clase_suelta_confirmation`

**Cause (common):** The deployed Edge Function used `auth.getUser(token)` before any other logic. That call can return 401 while the same JWT still works for `is_school_admin` (same pattern as `send_private_lesson_confirmation`).

**Fix:** Redeploy the function after pulling the repo change that removes the `getUser` gate and authorizes via `is_school_admin` only:

**Do not use** `npm install -g supabase` — it is **not supported** and will fail.

**Option A – project CLI (after `npm install` in repo):**

```bash
cd C:\dev\dance_platform
npm install
npx supabase functions deploy send_clase_suelta_confirmation
```

**Option B – Scoop (Windows, recommended by Supabase):**

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
supabase functions deploy send_clase_suelta_confirmation
```

**Option C – Chocolatey (admin):** `choco install supabase`

See: https://github.com/supabase/cli#install-the-cli

Client already sends `apikey` + refreshed session; optional second attempt after 401.

## Files touched

- `src/legacy.js` – `postEdgeFunction`, `getAccessTokenForEdgeFunctions`, approve + private flows, verification resend `apikey`
- `supabase/functions/send_clase_suelta_confirmation/index.ts` – auth aligned with private-lesson confirmation
- `style.css` – admin feedback layout for multi-line message

Rebuild client: `npm run build:js` (updates `app.js` if you deploy the bundle).
