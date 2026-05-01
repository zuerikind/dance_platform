# Packages and balances

This document explains exactly how class credits work in production.

## Core model

- `students.balance` = canonical **group** credits
- `students.balance_private` = canonical **private** credits
- `students.balance_events` = canonical **event** credits
- `active_packs` = package history/provenance (what was bought and when), not the source of available credits

When there is a conflict, the `students.balance*` fields are the truth used for deduction and availability.

## What happens when a package is bought

1. A payment request is created and approved.
2. The student receives credits in the canonical balance fields.
3. Package metadata is stored in `active_packs` for history and audit.
4. A balance ledger event is written with before/after values.

## What happens when a class is deducted

1. Deduction reads canonical balance fields.
2. If enough credits exist, balances are decremented.
3. A ledger event is written with mutation type and before/after values.
4. The operation returns server-computed balances immediately.

If credits are insufficient, the deduction is rejected safely (no partial mutation).

## Manual admin edits

When an admin edits a student balance:

- The server updates canonical balances atomically.
- A ledger event is written.
- Optional stale-write protection can reject outdated edits if another admin changed the same student first.

## Idempotency and duplicate protection

For flows that can be retried (webhooks, scanner taps, retries), idempotency keys are used on canonical mutation RPCs so the same operation does not apply twice.

## Multi-package and expiry behavior

- A student can have multiple package rows in `active_packs`.
- Expired packages remain useful for history and audit.
- Availability and deduction still rely on canonical balances, not on summing pack rows.

This avoids race conditions where UI or background jobs recalculate and overwrite admin values.

## Operational rules

- Do not manually \"heal\" balances from package sums in frontend code.
- All balance mutations must go through server RPCs.
- Every mutation must be auditable in the balance ledger.
- School-specific behavior (for example Aure) must remain gated so other schools are unaffected.

---

*Back to [Bailadmin guide](../SCHOOL_GUIDE.md).*
