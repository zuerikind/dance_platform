# Codebase Concerns

**Analysis Date:** 2025-03-02

## Tech Debt

**Monolithic legacy UI (legacy.js):**
- Issue: `src/legacy.js` is ~12,590 lines and contains almost all UI rendering, routing, admin/student flows, discovery, competitions, Calendly, payments, and settings. Single file is hard to navigate, test, or change safely.
- Files: `src/legacy.js`
- Impact: High risk of regressions when editing; long load and parse time; difficult code reviews.
- Fix approach: Incrementally extract views or domains into separate modules (e.g. auth, schedule, shop, admin-students) and import from legacy until legacy is a thin orchestrator; add tests for extracted modules first.

**Hardcoded Supabase config in source:**
- Issue: Supabase URL and anon key are hardcoded in `src/config.js`. Build output `app.js` (from `build-js.js`) inlines these values. No environment-based config for different deployments.
- Files: `src/config.js`, `app.js` (generated)
- Impact: Cannot point the same codebase at staging/production Supabase without code change; anon key is public by design but project identity is fixed in repo.
- Fix approach: Use build-time env vars (e.g. `process.env.SUPABASE_URL`) in config and inject via build script; keep anon key in env for deploy, optional fallback for local dev.

**Outdated cursor rule for RPC migrations:**
- Issue: `.cursor/rules/supabase-migrations.mdc` states that "drop the 6-param version so only the 7-param version (with p_slot_id) remains". In reality, `supabase/migrations/20260229000000_revert_aure_package_slots.sql` reverted to the 6-parameter `create_payment_request` only; the 7-param version no longer exists.
- Files: `.cursor/rules/supabase-migrations.mdc`
- Impact: Developers following the rule might try to drop a 6-param overload that is now the only version, or expect a 7-param RPC that does not exist.
- Fix approach: Update the rule to say the current state is a single 6-param `create_payment_request` and that any future signature change must DROP the old signature then CREATE the new one in the same migration.

**Empty catch blocks swallowing errors:**
- Issue: Several `try { ... } catch (_) {}` or `catch (_) {}` blocks hide failures and make debugging harder. Examples: sessionStorage in `src/state.js` (lines 144, 150, 162); student signup RPC in `src/legacy.js` (line 8919); session fetch in `src/legacy.js` (line 10497); scanner stop in `src/scanner.js` (line 56); schools fetch in `src/main.js` (line 209).
- Files: `src/state.js`, `src/legacy.js`, `src/scanner.js`, `src/main.js`
- Impact: User may see generic "Unexpected signup error" or silent failure; session/export fallbacks can mask auth or network issues.
- Fix approach: Prefer at least `console.warn` or a single central logger in catch; for critical paths (e.g. signup), surface or rethrow after fallback so monitoring can see failures.

## Known Bugs

**Student signup error message loss:**
- Symptoms: If the signup RPC fails after the try block, the catch at line 8919 in `src/legacy.js` swallows the error; the user then sees "Unexpected signup error: Try again." because the real error is never passed to the alert.
- Files: `src/legacy.js` (around 8919)
- Trigger: Signup when RPC returns error or throws (e.g. validation, duplicate email).
- Workaround: Check browser console or Supabase logs for actual error.

## Security Considerations

**Supabase anon key in repository:**
- Risk: Anon key and project URL are committed in `src/config.js`. Supabase anon key is intended for client use and is restricted by RLS; exposure in repo is common but ties the repo to one project and can confuse multi-tenant or multi-env setups.
- Files: `src/config.js`
- Current mitigation: RLS and SECURITY DEFINER RPCs enforce server-side authorization; no service_role key in frontend.
- Recommendations: Move URL/key to build-time env for production; document that anon key is public but must match the project with correct RLS.

**XSS via innerHTML with unsanitized data:**
- Risk: Many `innerHTML` assignments in `src/legacy.js` and `src/scanner.js` interpolate data (e.g. school name, student name, API content). `src/config.js` provides `escapeHtml` and it is used in `src/scanner.js` and in some `src/legacy.js` paths (e.g. student cards, admin student list), but numerous other `innerHTML` usages in `src/legacy.js` use only `t()` (translations) or literals. If any user-controlled or API-supplied string (e.g. discovery description, school name, review text) is ever interpolated without `escapeHtml`, it could lead to XSS.
- Files: `src/legacy.js` (many lines, e.g. 2533, 3525, 3609, 7920, 8222, 10126, 10553, 10798, 10809, 10906, 11034, 11169, 12318, 12364), `src/scanner.js` (multiple resultEl.innerHTML with escapeHtml used for some values)
- Current mitigation: `escapeHtml` used for student names, IDs, and error messages in scanner and in several legacy card/modal paths; some legacy paths use `.replace(/</g, '&lt;')` for single fields.
- Recommendations: Audit every `innerHTML` that includes dynamic content and ensure all such content is passed through `escapeHtml` (or equivalent); consider a small helper that returns sanitized HTML for common patterns to avoid omissions.

**SECURITY DEFINER functions:**
- Risk: Many RPCs use `SECURITY DEFINER` and set `search_path = public`. If any such function does not enforce `is_school_admin`, `is_platform_admin`, or auth.uid() checks, it could allow privilege escalation.
- Files: `supabase/migrations/` (e.g. `20260214150000_global_student_accounts.sql`, `20260214000000_class_registration.sql`, `20260210100000_login_credentials_rpc.sql`)
- Current mitigation: RPCs typically call `is_school_admin(p_school_id)` or `is_platform_admin()` or check `auth.uid()`; RLS is enabled on core tables.
- Recommendations: Before adding or changing any SECURITY DEFINER function, verify it restricts by school/platform admin or user id; avoid adding RPCs that take a school_id and perform actions without an explicit admin/owner check.

## Performance Bottlenecks

**Single large JS bundle:**
- Problem: Entire app is one bundle (`app.js` from `src/main.js` via esbuild). `src/legacy.js` (~12.5k lines) is included on every load.
- Files: `build-js.js`, `src/main.js`, `src/legacy.js`
- Cause: No code splitting; single entry point pulls in legacy and all views.
- Improvement path: Introduce route- or role-based code splitting (e.g. admin vs student, discovery vs dashboard) so initial load only fetches the first view; lazy-load legacy or split legacy into chunks per section.

**No frontend caching strategy for API data:**
- Problem: Data is fetched into in-memory `state` and re-fetched on throttle (e.g. `FETCH_THROTTLE_MS` in `src/data.js`). No caching layer or cache headers strategy documented for Supabase responses.
- Files: `src/data.js`, `src/state.js`
- Cause: Design choice to keep state in one object and refresh via full or partial fetches.
- Improvement path: Consider short-lived caching or ETag/If-None-Match for heavy reads (e.g. classes, subscriptions) if latency or load becomes an issue.

## Fragile Areas

**RPC signature overloads (create_payment_request):**
- Files: `supabase/migrations/20260227220000_drop_old_create_payment_request.sql`, `supabase/migrations/20260229000000_revert_aure_package_slots.sql`, `AGENTS.md`, `.cursor/rules/live-safety.mdc`
- Why fragile: Postgres cannot choose between two overloads of the same function when the client sends a fixed argument list; this previously broke payment requests for all schools. Current state is a single 6-parameter `create_payment_request`.
- Safe modification: When changing any RPC signature: in the same migration (or the next), `DROP FUNCTION IF EXISTS public.<name>(<old_arg_types>);` then `CREATE OR REPLACE FUNCTION public.<name>(<new_args>...)` so exactly one version exists. Prefer optional parameters with `DEFAULT NULL` when extending.
- Test coverage: No automated tests for RPCs; regression risk is high for any migration that adds an overload without dropping the old one.

**School-specific logic (Aure):**
- Files: `src/config.js` (AURE_SCHOOL_ID), `src/data.js` (isAureSubdomain, AURE_SCHOOL_ID), `src/legacy.js` (multiple `state.currentSchool?.id === AURE_SCHOOL_ID`), `src/main.js` (AURE_SCHOOL_ID)
- Why fragile: Aure-specific behavior is gated by school id checks in shared code paths. Adding or changing a feature for Aure can accidentally affect other schools if the gate is wrong or a shared path is modified without testing non-Aure flows.
- Safe modification: Gate any Aure-only behavior with `state.currentSchool?.id === AURE_SCHOOL_ID` (or a shared `isAureSchool(school)` helper); test school-selection and at least one non-Aure school after changes.
- Test coverage: No automated tests; manual testing required for both Aure and non-Aure.

**Global window coupling:**
- Files: `src/legacy.js`, `src/main.js`, `src/data.js`
- Why fragile: Code relies on `window.renderView`, `window.fetchAllData`, `window.supabase`, `window.t`, and other globals. Refactoring or renaming can break without compile-time errors.
- Safe modification: Prefer explicit imports and dependency injection for new code; when touching legacy, search for `window.` usages of the symbol you change.

## Scaling Limits

**Single Supabase project:**
- Current capacity: One project (URL and anon key in config); multi-tenant by school_id within the same DB.
- Limit: All schools share the same DB and Edge Functions; no per-school or per-region isolation.
- Scaling path: For isolation or regional scaling, would require multi-project or per-tenant config and deployment; not currently designed.

**No rate limiting on Edge Functions:**
- Current: Supabase Edge Functions (e.g. `export_calendar_ics`, `send_clase_suelta_confirmation`) do not show application-level rate limiting in the codebase.
- Limit: Abuse or burst traffic could hit Supabase/Resend limits or increase cost.
- Scaling path: Add rate limiting (e.g. by auth.uid() or IP) in critical functions if needed.

## Dependencies at Risk

**Minimal lockfile and few dependencies:**
- package.json lists only `esbuild` and `supabase` (dev). `package-lock.json` exists. No pinned minor/patch for supabase CLI.
- Risk: `supabase ^2.0.0` can pull breaking changes on minor updates.
- Impact: Local or CI migrations might behave differently after upgrade.
- Migration plan: Pin exact versions or narrow ranges for CI; test migrations after Supabase CLI upgrades.

## Missing Critical Features

**No structured error tracking or monitoring:**
- Problem: Errors are logged to console or shown via alert; no integration with Sentry or similar.
- Blocks: Proactive detection of production errors; aggregation by school or user.

**No E2E or integration tests for critical flows:**
- Problem: Only `tests/ics-format.test.js` exists (ICS format validation). No tests for login, signup, payment request, class registration, or admin flows.
- Blocks: Safe refactoring of legacy.js and RPC contract changes; regression detection.

## Test Coverage Gaps

**Frontend and data layer:**
- What's not tested: Auth flows, data fetching (`fetchAllData`, `fetchPlatformData`, `fetchDiscoveryData`), routing, any UI in `src/legacy.js`, scanner flow, state persistence.
- Files: `src/auth.js`, `src/data.js`, `src/state.js`, `src/legacy.js`, `src/scanner.js`, `src/main.js`, `src/routing.js`
- Risk: Regressions in login, school selection, payments, or class registration can reach production without automated signal.
- Priority: High for payment and registration paths; medium for discovery and admin settings.

**Supabase RPCs and migrations:**
- What's not tested: No in-repo tests that call Supabase RPCs or assert migration state (e.g. that only one `create_payment_request` signature exists).
- Files: `supabase/migrations/*.sql`, `supabase/functions/**/*.ts`
- Risk: RPC overload or policy change can break all schools; Edge Function changes can break calendaring or emails.
- Priority: High for RPCs used by payment and registration; medium for Edge Functions.

---

*Concerns audit: 2025-03-02*
