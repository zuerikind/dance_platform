# Discovery actions audit

Audit of Bailadmin codebase and Supabase schema for Discovery (reviews + suggest listing). Used to implement central auth/bootstrap, reviews system, and listing-suggestions pipeline.

## A) Codebase audit

| Area | Finding |
|------|--------|
| **Supabase client** | `src/config.js`: `supabaseClient` created with `SUPABASE_URL` and anon key (or `window.supabase.createClient`). No `supabase.functions.invoke` for reviews/suggestions yet. |
| **Auth/session** | `src/main.js` init: reads `supabaseClient.auth.getSession()`, restores `state.currentUser`, `state.isAdmin`, `state.isPlatformDev` from localStorage; if session exists but no local user, sets `state.currentUser` and calls `fetchUserProfile()`. Session is not stored in a single `state.auth` object. |
| **Profile load** | `src/legacy.js`: `fetchUserProfile()` loads `profiles` row by `auth.uid()`, then `profile_school_links` and `profile_student_links`, merges into `state.userProfile` and `state.profileLinkedSchools`. Dashboard profile view creates profile via upsert if missing (idempotent). |
| **Discovery UI – buttons** | **Profile (linked schools):** `src/legacy.js` ~2113–2116 in `buildDashboardProfileHtml()`: "Review a school" runs `goDiscovery` (navigate to `/discovery`); "Ask to add a new school" opens `mailto:?subject=Suggest a school for Bailadmin`. **Discovery detail:** ~2220–2222 in `renderDiscoveryView()`: "Leave a review" and "Suggest a school" are **mailto** links when allowed. Gating: `needLogin` / `needConfirm` (origin=discovery && !email_confirmed). |
| **Review-related code** | No `reviews` table, no review RPCs, no Edge Function for submitting reviews. Locale keys exist (`discovery_leave_review`, `profile_review_school`, etc.). |
| **Listing submission** | No `listing_suggestions` table, no moderation queue, no Edge Function. "Suggest" is currently mailto only. |

## B) Supabase audit

| Table / concept | Exists | Notes |
|----------------|--------|--------|
| **profiles** | Yes | `20260222000000_profiles_email_verifications_profile_school_links.sql`: `id` (auth.users), `email`, `role`, `origin` (discovery/school/admin), `email_confirmed`, first_name, last_name, etc. RLS: select/update/insert own. |
| **profile_school_links** | Yes | Same migration; links profile to school. |
| **profile_student_links** | Yes | `20260222100000_phase2_account_linking.sql`: profile ↔ school student; used for "verified" link to school. |
| **listings** | No separate table | Discovery uses **schools** with `discovery_visible`, `discovery_slug`, etc. `discovery_list_schools()` returns schools. |
| **reviews** | No | Not present in any migration. |
| **listing_suggestions** | No | Not present. |
| **RPCs** | N/A | No RPCs for reviews or suggestions. |
| **Edge Functions** | Partial | `supabase/functions`: `send_verification_email`, `verify_email_token`, `invite_student_activation`, `accept_student_activation`, `admin-update-email`. No `submit_review` or `submit_listing_suggestion`. |

## What exists

- Supabase client in `src/config.js`; auth/session read in `main.js` init and `fetchUserProfile()` in legacy.
- `profiles`, `profile_school_links`, `profile_student_links`, `email_verifications`; RLS on profiles and link tables.
- Discovery list/detail from `schools` (discovery_visible, discovery_slug); `discovery_list_schools()`, `discovery_school_detail(slug)`, `discovery_school_detail_by_id(id)`.
- Discovery UI: profile page with "Review a school" (goes to /discovery) and "Ask to add a new school" (mailto); detail page with "Leave a review" and "Suggest a school" (mailto). Gating by login and discovery email confirmation.
- Edge Functions for verification and activation; no review or suggestion submission.

## What is missing

- **Central auth:** No `state.auth`; no single `getCapabilities(targetContext)` used by all action buttons.
- **Reviews:** No `reviews` table, no `submit_review` Edge Function, no `review-create` / `review-success` views; buttons use mailto.
- **Listing suggestions:** No `listing_suggestions` table, no `submit_listing_suggestion` or `admin_review_listing_suggestion` Edge Functions, no `listing-suggest` or `listing-suggestions-admin` views.
- **Return flow:** No `state.afterLogin` / `state.afterVerify` to return user to review-create or listing-suggest after login/verify.

## What needs refactor (minimal)

- Add `state.auth` and bootstrap in `main.js`; implement `getCapabilities()` and use it for all Discovery action buttons.
- Replace mailto "Leave review" / "Suggest school" with navigation to `review-create` and `listing-suggest` with capability gating.
- After discovery login and after email verification, check `state.afterLogin` / `state.afterVerify` and redirect to the intended view.

---

## Test checklist (Step 5)

**Auth / Profile**

1. **Logged out → Write review → login → return**  
   Logged out, open discovery, open a school detail, click "Leave a review". Redirected to discovery login. Sign in. After login, user is taken to the review-create form for that school.

2. **Discovery user unverified → Write review blocked → verify → return**  
   Discovery user with unconfirmed email clicks "Leave a review". Blocked with confirm-email CTA (or redirected to profile). Resend verification, open link and verify. After verify, user is taken to review-create (or profile with buttons enabled).

3. **Profile settings persist**  
   Edit profile (name, city, etc.), save. Reload or re-open profile; changes are still there.

**Reviews**

4. **Verified review (linked school)**  
   User has a profile_school_links or profile_student_links row for school X. Submit a review for school X via review-create. Response or DB shows `trust_level = 'verified'`.

5. **Community review (unlinked)**  
   User has no link to school Y. Submit a review for school Y. Response or DB shows `trust_level = 'community'`.

6. **Rate limit**  
   Submit 3 reviews (any targets) within 24h from the same profile. Fourth submit returns 429 or "Rate limit" message.

7. **Duplicate constraint**  
   Submit a review for the same (profile, target_type, target_id) again. Response 409 or "You have already reviewed this".

**Listing suggestions**

8. **Submit suggestion → pending in admin**  
   Submit a listing suggestion (name, type, city, etc.) via listing-suggest. As platform admin, open Listing suggestions (dev dashboard). Pending list shows the new suggestion.

9. **Approve suggestion → school in discovery**  
   In Listing suggestions admin, click Approve on a pending suggestion. A new school row exists; it appears in discovery list (or can be made visible by toggling discovery_visible).

10. **Duplicate detection**  
    Submit a suggestion with same instagram as an existing suggestion, or same name+city as an existing school. Response includes `duplicate: true` and optionally `matches`; no new row or user is informed.
