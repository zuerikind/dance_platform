# Phase 2: Account linking (school student ⇄ auth profile)

Phase 2 lets a school-created student "activate" and link to one auth profile (discovery or school) so one dancer identity can be both independent and school-linked.

## Deploy Edge Functions

1. **invite_student_activation**  
   Called by school admins with a valid JWT. Deploy with default JWT verification:
   ```bash
   npx supabase functions deploy invite_student_activation
   ```

2. **accept_student_activation**  
   Must accept unauthenticated requests to return `requires_login` (no PII). Deploy with **no JWT verification**:
   ```bash
   npx supabase functions deploy accept_student_activation --no-verify-jwt
   ```
   The function validates the token and only returns school name + masked email when the user is not logged in.

## Secrets

Same as [RESEND_EMAIL_SETUP.md](RESEND_EMAIL_SETUP.md): `RESEND_API_KEY`, optional `EMAIL_FROM` and `PUBLIC_SITE_URL`. The invite email uses `PUBLIC_SITE_URL/?view=activate&token=...`.

## Migrations

Run the Phase 2 migrations in order:

- `20260222100000_phase2_account_linking.sql` (profile_student_links, student_activation_invites, account_link_audit, normalized_email, create_student_activation_invite RPC)
- `20260222110000_get_school_students_activation_status.sql` (RPC for admin students list)

## Test checklist

1. **Admin sends invite**  
   As a school admin, open **Students**, find a student with an email. Click **Invite to activate**. Confirm the student shows status "Invited" and no second invite is sent for the same student without using the first link.

2. **Open link logged out**  
   Open the invite link from the email (or `/?view=activate&token=<raw_token>`). You should see "Link your account" with the school name and a masked email (e.g. `j***n@example.com`), and **Sign in** / **Sign up** buttons. No full email or other PII.

3. **Sign in then link**  
   Click **Sign in**, complete discovery login. You should be redirected back to the activate view and the link should complete: "Account linked!" then redirect to the dashboard.

4. **Profile shows linked school**  
   In **Profile** (dashboard or discovery), the **Linked schools** section should list the school you just linked (from `profile_student_links`).

5. **One student → one profile**  
   Use the same invite link with a different logged-in user; the second link should fail with "This student is already linked to an account" (or similar). Same student cannot link to two profiles.

6. **Existing flows unchanged**  
   Check-in, packages, and student list still work for students who have not activated; no regressions.
