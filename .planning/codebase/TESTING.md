# Testing Patterns

**Analysis Date:** 2025-03-02

## Test Framework

**Runner:**
- No test runner (Jest, Vitest, Mocha) is configured. The only test asset is a standalone script.

**Assertion Library:**
- Custom minimal assert: in `tests/ics-format.test.js`, a local `assert(cond, msg)` that throws if `cond` is false.

**Run Commands:**
```bash
node tests/ics-format.test.js   # Run ICS format validation
```
No `test` or `spec` scripts in `package.json`.

## Test File Organization

**Location:**
- Tests live under `tests/` at repo root. The only file is `tests/ics-format.test.js`.

**Naming:**
- `*.test.js` for the single existing test file; no `.spec.*` files.

**Structure:**
```
tests/
└── ics-format.test.js   # ICS format validation (VCALENDAR/VEVENT/DTSTART/DTEND)
```

## Test Structure

**Suite Organization:**
- No `describe`/`it`/`test` blocks. The file defines helpers (`formatUtcForIcs`, `buildSampleIcs`, `parseIcs`), a local `assert(cond, msg)`, and a `run()` that runs a fixed sequence of assertions, then `run();` at the end.

**Patterns:**
- Inline helpers that mirror production logic (ICS formatting/parsing) and a single synchronous `run()` that:
  - Builds sample ICS with `buildSampleIcs()`
  - Parses with `parseIcs(ics)`
  - Asserts calendar wrapper, at least one VEVENT, DTSTART/DTEND UTC and format, SUMMARY
  - Logs pass count: `console.log('ICS format tests: ' + ok + ' passed');`

## Mocking

**Framework:** None. No Jest/Vitest or other mocking in the repo.

**Patterns:** Not applicable; the only test is self-contained and does not mock Supabase or browser APIs.

**What to Mock:** N/A.

**What NOT to Mock:** N/A.

## Fixtures and Factories

**Test Data:**
- Sample ICS is built in-code in `tests/ics-format.test.js` via `buildSampleIcs()` (fixed date 2026-02-25, one VEVENT). No external fixture files.

**Location:**
- Inline in the same file; no `fixtures/` or `factories/` directory.

## Coverage

**Requirements:** None. No coverage tool or thresholds configured.

**View Coverage:** Not applicable.

## Test Types

**Unit Tests:**
- Only the ICS test exists; it validates format/structure of a built ICS string (no Edge function or DOM). No other unit tests for `src/` or Supabase functions.

**Integration Tests:**
- None. No tests against Supabase or real APIs.

**E2E Tests:**
- Not used. No Playwright, Cypress, or similar.

## Common Patterns

**Async Testing:** Not used; the current test is fully synchronous.

**Error Testing:** The assert helper throws on failure; there are no tests that expect thrown errors or specific error messages.

**Running the existing test:**
```bash
node tests/ics-format.test.js
```
Success: console prints `ICS format tests: N passed` and process exits 0. Failure: `assert` throws and process exits non-zero.

---

*Testing analysis: 2025-03-02*
