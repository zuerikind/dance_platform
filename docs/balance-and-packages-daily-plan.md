# Balance & packages — daily plan (today / tomorrow)

Short operational plan so package sales and class workflows stay stable. Canonical balances and ledger work are described in `docs/schools/packages.md`.

---

## Today (before first purchases)

Do these in order; stop and fix if any step fails.

### Progress (started 2026-05-02)

| Step | Status |
|------|--------|
| 1. Database — `supabase migration list` | **Done:** all May 2026 balance migrations + `20260502103000` are **local = remote** on the linked project. `db push` ran; Postgres reported `updated_at` **already existed** (manual SQL earlier); migration is now **recorded** in remote history. |
| 2. Dry run (purchase → book → admin save) | **You:** run manually on staging or prod with a test student (see below). |
| 3. Deploy / rollback note | **You:** one line in team chat with last good commit / how to revert. |
| 4. Support | **You:** confirm one owner knows `student_balance_events` + `students.updated_at`. |

Optional SQL checks (Supabase **SQL Editor** on the same project the app uses):

```sql
-- Column exists and is populated
SELECT attname, attnotnull
FROM pg_attribute
WHERE attrelid = 'public.students'::regclass AND attname = 'updated_at' AND NOT attisdropped;

SELECT count(*) FILTER (WHERE updated_at IS NULL) AS null_updated_at_rows FROM public.students;

-- Key functions exist
SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace
  AND proname IN (
    'admin_set_student_balances',
    'canonical_deduct_student_balances',
    'canonical_set_student_balances_snapshot',
    'update_student_details'
  )
ORDER BY 1;
```

### 1. Database

- [x] Confirm **production** (and any DB the live app uses) has migration **`20260502103000_students_updated_at_column.sql`** applied (`students.updated_at` exists, backfilled, `NOT NULL`). *(Verified via CLI: remote migration row present; column may have been added earlier by hand.)*
- [x] Confirm earlier balance migrations are applied on the **same** project the app points to (ledger + canonical RPCs + legacy wrappers). *(CLI: `20260501220500` … `20260502000500` matched local/remote.)*

### 2. One full dry run on the real environment

Use staging if you have it; otherwise production with a **test student** and reversible data.

1. [ ] **Purchase / assign package** — same path real customers use (payment + `apply_student_package` or equivalent).
2. [ ] Check **`students`** row: `balance`, `balance_private`, `balance_events`, `paid`, `active_packs`, `package`, `package_expires_at`.
3. [ ] Check **`student_balance_events`** for a row that matches the action (e.g. `admin_set` from snapshot bridge).
4. [ ] **Book or register** for a class (minimal step after purchase).
5. [ ] **Admin edit “clases restantes”** (if you use it) — save should succeed; ledger `admin_set` optional sanity check.

**Rollback if dry run fails:** fix forward (preferred) or restore DB backup; app rollback = redeploy previous Vercel/hosting build. Do not leave prod without `students.updated_at` if canonical balance RPCs are deployed.

### 3. Deploy discipline

- [ ] Avoid merging unrelated DB migrations or large refactors **today** unless they are part of the dry run above.
- [ ] Note **rollback**: last known-good app commit + how to revert a bad migration (Supabase dashboard / CLI), even one line in team chat.

### 4. Support readiness

- [ ] One person knows where to look: **`student_balance_events`** + **`students.updated_at`** for “save failed” or “balance wrong” reports.

**Definition of done for today:** dry run 1–5 passes with no errors; `students.updated_at` present on prod.

---

## Tomorrow (and the days right after)

Continue the larger hardening plan **without** blocking sales, unless something from today failed.

### Priority 1 — This week

- [ ] Fix **`syncActivePacksFieldSumToTarget`** vs **expired packs** and get **`npm test`** fully green (`tests/admin-pack-expiry-save.test.mjs`). Clarify product rule: admin “sync total” should or should not ignore expired packs; align code + tests.
- [ ] Optional: add **`p_expected_updated_at`** to **`update_student_details`** and pass **`students.updated_at`** from the admin UI for optimistic concurrency (two-admin safety).

### Priority 2 — Following weeks

- [ ] Inventory every **`deduct_student_classes`** / deduct caller; add **idempotency keys** where retries or double-submit are possible (attendance path already uses `class_registration:…:first_deduct`).
- [ ] Decide **ledger policy** for saves that only change **`active_packs`** (no balance args) — document and implement if required for audit.
- [ ] **Read-path audit:** remove or gate hybrid `max(balance, pack sum)` logic so UI matches canonical row balances (see full roadmap in prior planning).

### Reference

- Ledger + RPCs: `supabase/migrations/20260501220500_balance_ledger_and_canonical_mutations.sql`
- Legacy wrappers: `20260501233000_phase3_wrap_legacy_balance_rpcs.sql`, `20260501234500_phase3_wrap_legacy_deduct_rpc.sql`
- Attendance idempotent deduct: `20260502000500_phase4a_attendance_idempotent_canonical.sql`
- `updated_at` column: `20260502103000_students_updated_at_column.sql`

---

*Last updated: 2026-05-02 — DB sync verified via `supabase migration list` + `db push`; complete dry run checkboxes when done.*
