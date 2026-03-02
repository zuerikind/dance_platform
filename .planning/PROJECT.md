# Bailadmin

## What This Is

Bailadmin is a web app for dance schools and private teachers to manage their students and class packages. Schools keep their schedules on the platform; private teachers use their calendar on the platform to see free slots for classes. Students use the same platform to find schools, leave reviews, and buy or renew classes from multiple schools in one place. Paying customers are the schools and private teachers; students are the network effect. Both the administrative side and the student-facing side are live; two schools are on a trial run this month.

## Core Value

Dance schools have a tool to better manage and control their students and revenue; students have a platform to have all their schools and packages of classes in one place.

## Requirements

### Validated

<!-- Shipped and in use. Inferred from existing codebase. -->

- ✓ Schools have schedules on the platform — existing
- ✓ Private teachers have calendar on platform (Calendly integration) for free slots — existing
- ✓ QR-code-based attendance / class usage tracking — existing
- ✓ Student management (students, subscriptions, classes) — existing
- ✓ Packages offered by schools; students buy/renew classes there — existing
- ✓ Discovery: students find schools — existing
- ✓ Reviews: students can review schools — existing
- ✓ Multi-school support; school-specific behavior gated (e.g. Aure) — existing
- ✓ Payments / payment requests and related flows — existing
- ✓ Auth (Supabase), i18n, hash routing, SPA on Vercel + Supabase — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] Stabilize and support the trial: fixes, small improvements, docs
- [ ] Successful trial: students and schools happy, no critical bugs, smooth operation, schools start paying month by month
- [ ] Grow beyond trial: onboard more schools, scale
- [ ] New features: specific admin and student features (to be detailed in requirements)

### Out of Scope

<!-- Explicit boundaries. -->

- (None specified yet — add as scope is refined.)

## Context

- Two schools are using the administrative platform this month as a trial run.
- Both admin and student sides are already live (SPA + Supabase; see `.planning/codebase/`).
- Product is live; backward compatibility and no breaking changes for existing schools are mandatory (see AGENTS.md / live-safety).
- Success for the trial = students happy, schools happy, no bugs, smooth experience, schools convert to month-by-month payment.

## Constraints

- **Compatibility**: All changes must remain backward compatible; no breaking API/RPC/database signatures without coordinated migration (live-safety).
- **Multi-tenant**: School- or feature-specific logic (e.g. Aure) must be gated so other schools are unaffected.
- **Stack**: Current stack is fixed for this planning (Supabase, vanilla JS SPA, Vercel); no stack rewrite in scope.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Trial with 2 schools first | Validate product and operations before scaling | — Pending |
| Prioritize trial stability then growth then new features | Near-term goals stated by product owner | — Pending |

---
*Last updated: 2025-03-02 after GSD new-project initialization*
