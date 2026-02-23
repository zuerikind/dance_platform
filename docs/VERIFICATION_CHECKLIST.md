# Verification checklist – make sure everything works

Use this list after deploying migrations, Edge Functions, or making config changes. Tick off each item as you verify it.

---

## 1. Setup and deploy

- [ ] **Migrations applied**  
  All Supabase migrations have been pushed: `npx supabase db push --yes` (or already applied). No failed migrations.

- [ ] **Edge Functions deployed**  
  - `send_verification_email` – with `--no-verify-jwt`  
  - `verify_email_token` – with `--no-verify-jwt`  
  - `invite_student_activation` – default (JWT verified)  
  - `accept_student_activation` – with `--no-verify-jwt`  
  - `submit_review` – with `--no-verify-jwt` (so browser preflight works; function still validates JWT for POST)  
  - `submit_listing_suggestion` (if implemented)  
  - `admin_review_listing_suggestion` (if implemented)

- [ ] **Secrets in Supabase**  
  - `RESEND_API_KEY`  
  - Optional: `EMAIL_FROM`, `PUBLIC_SITE_URL` (verify link and invite link base URL)

- [ ] **App build**  
  - `npm run build` (or `node build-js.js`) runs without errors.  
  - `dist/app.js` is used by `index.html` (or you serve from `src/` in dev).

---

## 2. Auth and profile

- [ ] **Discovery register**  
  Open `/discovery/register`, sign up with email + password. User is created in `profiles` with `origin = 'discovery'`, `email_confirmed = false`. Redirect works (e.g. to `/discovery` or profile).

- [ ] **Discovery login**  
  Open `/discovery/login`, sign in. Session restored; profile loaded; no console errors.

- [ ] **Confirm-email banner**  
  As an unconfirmed discovery user, a banner (e.g. “Confirm your email…”) is visible. No banner for confirmed users.

- [ ] **Resend verification email**  
  Click “Resend verification email”. Request succeeds; email arrives (check inbox/spam). Link in email points to `PUBLIC_SITE_URL` (or your app URL) with `?view=verify-email&token=...`.

- [ ] **Verify email link**  
  Open the link from the email. App shows verify-email view, calls `verify_email_token`. Result: “Email confirmed!” and `profiles.email_confirmed = true`; banner disappears after refresh or navigate.

- [ ] **Profile settings persist**  
  Go to Profile (e.g. `#/dashboard/profile` or from discovery). Edit name, city, country, Instagram, etc. Save. Reload or re-open profile; changes are still there.

- [ ] **afterLogin / afterVerify return**  
  Logged out, click “Leave a review” on a school → redirected to login. After login, user is taken to the review-create form for that school.  
  Same idea for “Suggest a school”: after login, user is taken to listing-suggest.  
  If blocked by “confirm email”, after verifying via link, user is returned to the intended action (review-create or listing-suggest) or sees buttons enabled.

---

## 3. Reviews

- [ ] **Leave a review – capability gating**  
  Logged out: “Leave a review” sends to login (or shows login CTA).  
  Logged in, unconfirmed discovery user: blocked with confirm-email CTA (or disabled).  
  Logged in, confirmed: “Leave a review” opens review-create form.

- [ ] **Submit review – verified (linked to school)**  
  User has a link to the school (e.g. `profile_school_links` or `profile_student_links`). Submit a review for that school. In DB or API response, `trust_level = 'verified'`.

- [ ] **Submit review – community (not linked)**  
  User has no link to the school. Submit a review for that school. In DB or API response, `trust_level = 'community'`.

- [ ] **Rate limit**  
  Submit 3 reviews (any targets) within 24h from the same profile. Fourth submit returns 429 or a “Rate limit” message.

- [ ] **Duplicate review**  
  Submit a second review for the same (profile, target_type, target_id). Response 409 or “You have already reviewed this”.

- [ ] **Review visible on discovery**  
  After submitting, the review appears on the school’s discovery detail (if the UI shows reviews).

---

## 4. Listing suggestions

- [ ] **Suggest a school – capability gating**  
  Same as reviews: logged out → login; unconfirmed → confirm email; confirmed → can open listing-suggest form.

- [ ] **Submit suggestion**  
  Fill name, type (school/teacher), city, country, styles, Instagram, website, notes. Submit. Success message; no console errors.

- [ ] **Pending in admin**  
  As platform admin, open “Listing suggestions” (e.g. from platform dev dashboard). Pending list shows the new suggestion.

- [ ] **Approve suggestion**  
  In Listing suggestions admin, approve a pending suggestion. A new school row is created (or existing one updated); it can appear in discovery (e.g. after setting `discovery_visible`).

- [ ] **Duplicate detection**  
  Submit a suggestion with same Instagram as an existing suggestion, or same name+city as an existing school. Response indicates duplicate (e.g. `duplicate: true` or `matches`); no duplicate row; user is informed.

---

## 5. Phase 2 – Account linking (school student ⇄ profile)

- [ ] **Admin sends invite**  
  As school admin, open Students, pick a student with email. Click “Invite to activate”. Student shows “Invited”; no duplicate invite for same student without using the first link.

- [ ] **Open invite link logged out**  
  Open invite link (e.g. `/?view=activate&token=...`). Page shows “Link your account” with school name and masked email (e.g. `j***n@example.com`). Sign in / Sign up buttons; no full email or PII.

- [ ] **Sign in then link**  
  Click Sign in, complete login. Redirect back to activate view; link completes: “Account linked!” then redirect to dashboard (or profile).

- [ ] **Profile shows linked school**  
  In Profile, “Linked schools” lists the school you just linked (from `profile_student_links`).

- [ ] **One student → one profile**  
  Use the same invite link with a different logged-in user. Second link fails with “This student is already linked to an account” (or similar).

- [ ] **Activation status in students list**  
  In admin Students list, “Invited” / “Linked” (or similar) status is correct for each student.

---

## 6. School admin and existing flows (no regressions)

- [ ] **School admin login**  
  Admin can log in and see school dashboard.

- [ ] **Students list**  
  Students load; create student, edit student, view student still work.

- [ ] **Student login (school)**  
  Student can log in at school auth; `get_student_by_user_id` / `students_with_profile` work.

- [ ] **Check-in / packages / QR**  
  Check-in, package management, and QR flows work as before.

- [ ] **Discovery list and detail**  
  Discovery list shows schools (discovery_visible, slug, etc.). Opening a school by slug or ID shows correct detail.

- [ ] **Platform dev / platform admin**  
  Platform dev dashboard and platform admin actions (if you use them) still work; listing suggestions admin is accessible.

---

## 7. Config and environment

- [ ] **Supabase URL and anon key**  
  `src/config.js` (or build-time env) has correct `SUPABASE_URL` and `SUPABASE_KEY` for the environment you’re testing.

- [ ] **Resend / email**  
  If using Resend: domain or sandbox configured; no 502 from Edge Function; emails not blocked as spam for test addresses.

- [ ] **CORS**  
  If calling Edge Functions from a different origin (e.g. localhost), no CORS errors in console; functions return proper CORS headers.

---

## Quick reference

| Area           | Main docs                          |
|----------------|------------------------------------|
| Email verify   | [RESEND_EMAIL_SETUP.md](RESEND_EMAIL_SETUP.md) |
| Account linking| [PHASE2_ACCOUNT_LINKING.md](PHASE2_ACCOUNT_LINKING.md) |
| Discovery actions | [discovery-actions-audit.md](discovery-actions-audit.md) |
| Architecture   | [../ARCHITECTURE_NOTES.md](../ARCHITECTURE_NOTES.md) |

**Where reviews go:** Submissions from "Leave a review" are sent to the Edge Function `submit_review`, which inserts into the **`reviews`** table (columns: `target_type`, `target_id`, `author_profile_id`, `rating_overall`, `ratings`, `comment`, `trust_level`, `status`, etc.). Platform admins can list and delete reviews from the **Reviews** tab in the Platform Developer dashboard (RPCs: `get_reviews_platform_admin`, `delete_review_platform_admin`).
