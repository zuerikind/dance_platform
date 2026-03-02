# Phase 1: Trial stability & support - Research

**Researched:** 2025-03-02
**Domain:** Trial stabilization, school-facing documentation, critical-flow reliability (existing stack)
**Confidence:** HIGH

## Summary

Phase 1 is operational: fix critical bugs (TRIAL-01), apply small UX/clarity/performance improvements (TRIAL-02), add documentation so schools can self-serve (TRIAL-03), and ensure trial reliability with no data loss and reliable attendance/payment flows (TRIAL-04). No new frameworks or runtimes are introduced; the stack remains vanilla JS, Supabase, and Markdown in `docs/`.

Research covered: (1) how to structure and write school-facing docs so they are task-oriented and scannable, aligned with the existing `docs/` style; (2) trial stabilization practices—severity-based bug triage, protecting critical paths, avoiding scope creep and RPC/regression pitfalls; (3) critical flows in the codebase (attendance via scanner + `deduct_student_classes`, payment via `create_payment_request` and related RPCs, data fetch) so planning can target verification and avoid fragile areas.

**Primary recommendation:** Use Markdown in `docs/` for school guides (admin, schedules, students, QR, packages) with task-based structure and a single index; fix bugs by severity with mandatory verification of attendance and payment flows after any change; never add RPC overloads—drop old signature then create new one in the same migration.

## Standard Stack

This phase does not introduce new application frameworks. The following are the standard choices for documentation and process.

### Core (documentation)

| Item | Purpose | Why Standard |
|------|---------|--------------|
| Markdown in `docs/` | School-facing guides (admin, schedules, students, QR, packages) | Already used (e.g. CALENDLY_SETUP.md, VERIFICATION_CHECKLIST.md); version-controlled, reviewable, no new tooling. |
| Single index (e.g. `docs/SCHOOL_GUIDE.md` or `docs/schools/README.md`) | Entry point for “how to use Bailadmin” | One place for schools to start; 5–8 top-level areas avoid overload. |
| Optional: same Markdown exported as PDF | Offline or print for schools | Can be added later; not required for TRIAL-03. |

### Supporting (process, no new installs)

| Item | Purpose | When to Use |
|------|---------|-------------|
| Severity-based triage | Prioritize bugs: critical (data loss, payment, attendance) first, then UX/clarity | TRIAL-01: fix critical before small improvements. |
| Existing `docs/VERIFICATION_CHECKLIST.md` | Post-change verification | After any fix touching auth, payments, or attendance. |
| Live-safety and migration rules (`.cursor/rules/`) | RPC and compatibility | Every migration and any change to payment/attendance RPCs. |

### Alternatives considered

| Instead of | Could use | Tradeoff |
|------------|-----------|----------|
| Markdown in repo | Docusaurus / MkDocs / Notion | Heavier setup and hosting; Phase 1 goal is “schools can self-serve” with minimal new tooling. Use static Markdown first. |
| Ad-hoc bug list | Full issue tracker integration | Out of scope for Phase 1; list/backlog in planning is enough. |

**Installation:** No new packages. Documentation is Markdown only; build remains `npm run build` (esbuild + Vercel copy).

## Architecture Patterns

### Recommended documentation structure

```
docs/
├── SCHOOL_GUIDE.md          # Index: links to Admin, Schedules, Students, QR, Packages
├── schools/
│   ├── admin.md             # How to use admin (school settings, admins, etc.)
│   ├── schedules.md         # Classes, calendar, private lessons
│   ├── students.md          # Adding/editing students, packages, signup
│   ├── qr.md                # QR scanner: check-in, attendance
│   └── packages.md           # Packages and payment requests
└── (existing) CALENDLY_SETUP.md, VERIFICATION_CHECKLIST.md, ...
```

Alternatively, keep a flat `docs/` with `SCHOOL_GUIDE.md` and `SCHOOL_ADMIN.md`, `SCHOOL_SCHEDULES.md`, etc., if preferred for simplicity.

### Pattern 1: Task-oriented school docs

**What:** Each doc answers “how do I do X?” with short intro, numbered steps, and minimal jargon.
**When:** All TRIAL-03 content (admin, schedules, students, QR, packages).
**Example (align with existing style):**

```markdown
# QR scanner and attendance

School staff use the QR scanner to check in students and record attendance. One class is deducted from the student’s package when you confirm.

## How to take attendance

1. Open the **QR** view (QR icon in the nav).
2. Allow camera access when prompted.
3. Student shows their QR code (student card or app).
4. After the scan, choose **Confirm attendance** (or confirm for the class shown for pre-registered).
5. You’ll see “Attendance confirmed!” when done.
```

Match the tone and structure of `docs/CALENDLY_SETUP.md`: clear headings, steps, optional tables, code or config only where needed.

### Pattern 2: Bug fix + critical-path verification

**What:** After any change that touches attendance, payment, or auth: run through the relevant part of `docs/VERIFICATION_CHECKLIST.md` or a short critical-path checklist (login → school → scanner confirm; create payment request → list/update status).
**When:** Every TRIAL-01 fix that touches `src/scanner.js`, `src/data.js`, payment RPCs, or `src/legacy.js` payment/attendance handlers.
**Example:** Fix in `scanner.js` → verify: open QR view, scan, confirm attendance, see success and one class deducted; no console errors.

### Pattern 3: RPC and migration safety

**What:** One signature per function name. When changing an RPC: in the same migration (or immediate next), `DROP FUNCTION IF EXISTS public.<name>(<old_arg_types>);` then `CREATE OR REPLACE FUNCTION public.<name>(<new_args>...)`. Use optional parameters with `DEFAULT NULL` when extending.
**When:** Any change to `create_payment_request`, `get_school_payment_requests`, `update_payment_request_status`, `delete_payment_request`, or `deduct_student_classes`.
**Reference:** `.cursor/rules/supabase-migrations.mdc`, `.cursor/rules/live-safety.mdc`, `.planning/codebase/CONCERNS.md` (RPC overloads).

### Anti-patterns to avoid

- **Docs by feature/internal structure:** Don’t mirror `legacy.js` views or DB schema. Structure by school tasks (e.g. “How to add a student”, “How to record attendance”).
- **Fixing non-critical before critical:** Don’t do TRIAL-02 polish before TRIAL-01 critical bugs are fixed.
- **Adding an RPC overload:** Never add a new signature (e.g. 7-param `create_payment_request`) without dropping the old one first; Postgres cannot choose between overloads and callers break.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| School documentation | Custom CMS or doc generator | Markdown in `docs/` with index and task-based pages | Repo already uses Markdown; versioning and reviews; no new infra. |
| Bug triage workflow | New issue tracker or custom tooling | Severity-ordered list (critical → high → medium) and existing checklist | Phase 1 scope is “fix and verify”; lightweight is enough. |
| Regression verification | Ad-hoc only | `docs/VERIFICATION_CHECKLIST.md` + explicit “verify attendance/payment” in task | Checklist already exists; planner can reference it in verification steps. |

**Key insight:** Trial stability is achieved by fixing known issues and verifying critical flows, not by introducing new tooling. Documentation is “good enough to self-serve” with clear Markdown, not a full docs portal.

## Common Pitfalls

### Pitfall 1: Scope creep on TRIAL-02

**What goes wrong:** “Small improvements” turn into redesigns or new features, delaying trial stability and conversion.
**Why it happens:** Unclear boundary between “small UX/clarity/performance” and “new feature.”
**How to avoid:** Define TRIAL-02 as: copy/feedback tweaks, one-off clarity (labels, messages), or low-risk performance tweaks. No new flows or large refactors. Defer “nice to have” to later phases.
**Warning signs:** Task adds new views, new RPCs, or multi-file UI refactors under TRIAL-02.

### Pitfall 2: RPC overload breaks all schools

**What goes wrong:** Adding a new parameter to `create_payment_request` (or similar) without dropping the old function causes “Could not choose the best candidate function” and breaks payment (and optionally other schools).
**Why it happens:** Creating a second signature for the same function name; Postgres and Supabase client don’t pick one deterministically.
**How to avoid:** Same migration (or next): `DROP FUNCTION IF EXISTS public.create_payment_request(...);` then `CREATE OR REPLACE FUNCTION public.create_payment_request(...)` with the new signature. Prefer optional params (`DEFAULT NULL`) so existing callers keep working.
**Warning signs:** Migration only has `CREATE OR REPLACE` and adds parameters; no `DROP FUNCTION` for old signature.

### Pitfall 3: Documentation for developers, not schools

**What goes wrong:** Docs explain schema, RPCs, or internal flows; school staff can’t find “how to do X.”
**Why it happens:** Writing from a developer mindset; organizing by system instead of by task.
**How to avoid:** Use end-user language; structure by school tasks (admin, schedules, students, QR, packages); short steps and outcomes; avoid jargon. Mirror the “how to” style of `docs/CALENDLY_SETUP.md` for setup, not the technical depth of `VERIFICATION_CHECKLIST.md` (which is for deploy verification).
**Warning signs:** Docs mention `state.currentView`, RPC names, or migration files without a clear “as a school admin, you…” narrative.

### Pitfall 4: Regressions in attendance or payment

**What goes wrong:** A fix for one bug breaks scanner check-in or payment request creation; trial schools see data or flow failures.
**Why it happens:** No verification step after changes to `scanner.js`, `data.js`, or payment/attendance paths in `legacy.js`; or changes to RPCs without testing both Aure and non-Aure if relevant.
**How to avoid:** Every task that touches these areas must include an explicit verification step: e.g. “Confirm: scan QR → confirm attendance → success and class deducted” and “Create payment request → appears in list → update status.” Use `docs/VERIFICATION_CHECKLIST.md` where it applies. For school-gated logic, test at least one Aure and one non-Aure path (see CONCERNS.md).
**Warning signs:** Task modifies `deduct_student_classes` call sites, `create_payment_request` call, or `get_school_payment_requests`/payment UI with no “verify” step.

### Pitfall 5: Empty catch blocks and lost errors

**What goes wrong:** Errors are swallowed; users see generic “Try again” and real cause is only in console or logs.
**Why it happens:** Existing `catch (_) {}` or `catch (_) { /* generic message */ }` in signup, session, or scanner paths (see CONCERNS.md).
**How to avoid:** When fixing bugs in those paths, replace empty or generic catches with at least `console.warn` and, for user-facing errors, surface the actual message (sanitized) or a clearer fallback. Don’t add new empty catches.
**Warning signs:** New or modified `catch` that doesn’t log or show a specific error.

## Code Examples

### Critical flows to preserve (reference for verification tasks)

**Attendance (scanner):**
- `src/scanner.js`: `confirmAttendance`, `confirmRegisteredAttendance` → call `supabaseClient.rpc('deduct_student_classes', { p_student_id, p_school_id, p_count })` (and class/event registration updates as applicable). Success UI: “Attendance confirmed!”
- Entry: QR view → camera → scan → confirm button.

**Payment:**
- Create: `src/legacy.js` calls `supabaseClient.rpc('create_payment_request', { p_student_id, p_sub_id, p_sub_name, p_price, p_payment_method, p_school_id })` (6 params; 7-param version was reverted per CONCERNS).
- List: `src/data.js` uses `get_school_payment_requests(p_school_id)` and merges into state; admin sees payment requests in UI.
- Update/delete: `update_payment_request_status`, `delete_payment_request` from legacy.

**Data fetch:**
- `src/data.js` `fetchAllData()`: schools, students, classes, subscriptions, payment_requests (via RPC when needed), etc. Throttled; triggers `renderView()`.

### School doc structure (example)

```markdown
# Bailadmin – Guide for schools

Short intro: what Bailadmin is and who this is for.

## Admin
Link or inline: school settings, managing admins, platform settings if relevant.

## Schedules
Classes, calendar, private lessons (and Calendly if you use it).

## Students
Adding and editing students, linking to accounts, packages.

## QR and attendance
Using the QR scanner to check in students and record attendance.

## Packages and payments
Creating packages, payment requests, and marking them paid.
```

Keep each section task-oriented and step-by-step; link to existing technical docs (e.g. CALENDLY_SETUP) where appropriate.

## State of the Art

| Old approach | Current approach | Impact |
|--------------|------------------|--------|
| Two overloads of `create_payment_request` | Single 6-parameter function only (7-param reverted) | All callers must use same signature; no overloads. |
| Docs only for devs/setup | Add school-facing “how to use” docs (TRIAL-03) | Schools self-serve; reduce support and confusion. |
| Trial = keep building features | Trial stabilization = fix critical, small UX, docs, verify | Clear phase goal: smooth trial and conversion. |

**Deprecated/outdated:**
- 7-parameter `create_payment_request(p_slot_id)` and `.cursor/rules/supabase-migrations.mdc` text that says “drop 6-param so only 7-param remains”—reverted; rule should describe current state (single 6-param) and “drop then create” for any future change.

## Open Questions

1. **Where will school docs be published?**
   - Known: Deliver as Markdown in `docs/` (and optionally `docs/schools/`). No decision yet on PDF export or a separate hosted site.
   - Recommendation: Ship Markdown and a single index (SCHOOL_GUIDE.md); add “export to PDF” or link to hosted copy in a later phase if schools ask.

2. **Non-Aure vs Aure testing**
   - Known: CONCERNS.md states that school-specific (Aure) logic must be gated and that both Aure and non-Aure should be tested when changing gated code.
   - Planner should include “if change touches school-gated logic, verify for both Aure and non-Aure” in verification steps where relevant.

## Sources

### Primary (HIGH confidence)
- `.planning/codebase/ARCHITECTURE.md` – data flow, scanner, payment, state
- `.planning/codebase/CONCERNS.md` – RPC overloads, fragile areas, empty catches, testing gaps
- `.planning/codebase/STRUCTURE.md` – where docs live, where to add code
- `docs/CALENDLY_SETUP.md`, `docs/VERIFICATION_CHECKLIST.md` – existing doc style and verification checklist
- `.cursor/rules/live-safety.mdc`, `AGENTS.md` – RPC and backward compatibility
- Codebase: `src/scanner.js`, `src/data.js`, `src/legacy.js` (payment/attendance), `supabase/migrations` (create_payment_request, deduct_student_classes)

### Secondary (MEDIUM confidence)
- WebSearch + Docsie end-user documentation best practices (task-oriented, end-user language, 5–8 top-level categories)
- WebSearch: trial/beta stabilization (severity-based defect fixing, multi-layer testing, scope control)

### Tertiary (LOW confidence)
- General “Markdown docs 2025” and “beta bug triage” articles; used only to reinforce structure and triage order, not as sole authority.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH – no new stack; Markdown and existing checklist are in-repo and confirmed.
- Architecture: HIGH – patterns and critical flows taken from codebase and CONCERNS/ARCHITECTURE.
- Pitfalls: HIGH – RPC and trial pitfalls come from CONCERNS, live-safety rules, and REQUIREMENTS.

**Research date:** 2025-03-02
**Valid until:** 30 days (stable domain; update if RPC or doc strategy changes).
