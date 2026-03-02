# Phase 01 Plan 02: School documentation (TRIAL-03) Summary

**One-liner:** Task-oriented school docs (SCHOOL_GUIDE + 5 pages) so staff can self-serve for admin, schedules, students, QR, and packages.

---

## Frontmatter

| Field | Value |
|-------|--------|
| phase | 01-trial-stability-support |
| plan | 02 |
| subsystem | Documentation / TRIAL-03 |
| tags | docs, school-guide, self-serve, markdown |

## Dependency graph

- **requires:** Phase 01 research (doc structure and pattern); existing docs style (CALENDLY_SETUP).
- **provides:** Single entry point (SCHOOL_GUIDE.md) and five task-oriented pages under docs/schools/.
- **affects:** Future phases may extend or link to these docs; no code or API changes.

## Tech tracking

- **tech-stack.added:** None (Markdown only).
- **tech-stack.patterns:** Task-oriented school docs (intro + numbered steps, end-user language; no RPC/state in copy).

## File tracking

- **key-files.created:** docs/SCHOOL_GUIDE.md, docs/schools/admin.md, docs/schools/schedules.md, docs/schools/students.md, docs/schools/qr.md, docs/schools/packages.md.
- **key-files.modified:** None.

## Decisions made

- Entry point is docs/SCHOOL_GUIDE.md with five sections linking to docs/schools/*.md (no flat SCHOOL_ADMIN.md etc.).
- Each school doc follows Pattern 1 from 01-RESEARCH: “how do I do X?” with short intro and numbered steps.
- Schedules doc links to CALENDLY_SETUP.md for private-teacher Calendly setup; no RPC or internal names in any user-facing copy.

## Metrics

- **duration:** Single session.
- **completed:** 2025-03-03.

## Task summary

| Task | Name | Commit | Key files |
|------|------|--------|-----------|
| 1 | Create SCHOOL_GUIDE index and docs/schools structure | da6d75a | docs/SCHOOL_GUIDE.md |
| 2 | Write task-oriented school pages | 69c553b | docs/schools/admin.md, schedules.md, students.md, qr.md, packages.md |

## Deviations from plan

None – plan executed as written.

## Verification

- SCHOOL_GUIDE.md exists and links to all five docs/schools/*.md.
- Each school doc is task-oriented with steps; no developer-only jargon (no state.currentView, RPC names, or legacy/DB mirroring).
- SCHOOL_GUIDE links verified (admin, schedules, students, qr, packages).

## Next phase readiness

- TRIAL-03 deliverable complete: schools have one place to start (SCHOOL_GUIDE) and can self-serve for admin, schedules, students, QR, and packages.
- No blockers. Optional follow-up: PDF export or hosted doc site in a later phase if requested.
