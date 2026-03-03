---
phase: 01-trial-stability-support
plan: "01"
subsystem: trial-stability
tags:
  - critical-bugs
  - signup
  - error-handling
  - verification
requires: []
provides:
  - CRITICAL_BUGS.md with addressed items
  - Student signup error message surfaced to user
  - 01-01-VERIFY.md for §2 and §6 checklist
affects: []
tech-stack:
  added: []
  patterns:
    - Safe error surfacing in catch (console.warn + user-visible sanitized message)
key-files:
  created:
    - .planning/phases/01-trial-stability-support/CRITICAL_BUGS.md
    - .planning/phases/01-trial-stability-support/01-01-VERIFY.md
  modified:
    - src/legacy.js
decisions: []
metrics:
  duration: ""
  completed: "2025-03-03"
---

# Phase 01 Plan 01: Trial critical bugs fix — Summary

**One-liner:** Student signup error message loss fixed; critical bug list and verification checklist artifacts added; no RPC overloads; build and verification doc in place.

## What was done

- **CRITICAL_BUGS.md** created and seeded with the known trial bug from CONCERNS: student signup error message loss in `src/legacy.js` (~8919).
- **Bug fix:** The signup flow’s inner `catch (_) {}` was replaced with:
  - `console.warn` for the fallback `create_student_legacy` failure.
  - Capture of fallback RPC error and thrown exception.
  - User-visible alert showing a sanitized message (fallback RPC error, inner exception, or outer exception, max 200 chars) instead of the generic "Unexpected signup error: Try again."
- **Verification:** `01-01-VERIFY.md` added with VERIFICATION_CHECKLIST §2 (Auth and profile) and §6 (School admin) items; build verified; §2/§6 and attendance/payment flows documented as pending manual run (no code changes to those paths in this plan).

## Dependency graph

- **requires:** None.
- **provides:** CRITICAL_BUGS.md, signup error surfacing, 01-01-VERIFY.md.
- **affects:** Future trial support work (same checklist and bug list).

## Tech tracking

- **Added:** None.
- **Patterns:** Catch blocks that surface errors: at least `console.warn` and, for user-facing paths, a sanitized message (no raw stack, length cap).

## File tracking

- **Created:** `.planning/phases/01-trial-stability-support/CRITICAL_BUGS.md`, `.planning/phases/01-trial-stability-support/01-01-VERIFY.md`.
- **Modified:** `src/legacy.js` (signup catch block only).

## Decisions made

- None; plan executed as written.

## Deviations from plan

None — plan executed as written. Single listed bug fixed; no RPC or migration changes; verification doc created with §2 and §6 and attendance/payment noted.

## Next phase readiness

- **Blockers:** None.
- **Recommendation:** Run manual verification for VERIFICATION_CHECKLIST §2 and §6 (and attendance/payment flows) when the app is deployed or run locally.
