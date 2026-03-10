# Agent and contributor guidelines

**The product is live.** All changes must keep existing functionality working for every school and every user.

## Must follow

1. **`.cursor/rules/live-safety.mdc`** (always applied)
   - Never break backward compatibility.
   - No RPC/function overloads without dropping the old signature first.
   - School-specific features (e.g. Aure) must be gated so other schools are unaffected.

2. **`.cursor/rules/supabase-migrations.mdc`** (when editing `supabase/migrations/**/*.sql`)
   - One signature per function name; drop old before adding new signature.
   - Prefer optional parameters (`DEFAULT NULL`) when extending RPCs.

3. **Production is live and used daily** — before every change, ask: could this affect a different school or user than the one being worked on? Cross-school data leakage (wrong admin email, wrong school data shown) is a critical bug and must be caught before deploying.
   - Never let stale in-memory state from a previous session bleed into a new login.
   - `state._adminEmail` must always reflect the currently authenticated user, not a DB row that may belong to a different admin.
   - When fixing a bug, verify the fix does not regress other schools or user types (admin, student, platform dev).

## Why this matters

Introducing a new overload of `create_payment_request` (with `p_slot_id`) without dropping the old 6-parameter version caused "Could not choose the best candidate function" and broke payment requests for **all schools** (including clase suelta at non-Aure schools). This must not happen again.
