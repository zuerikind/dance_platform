-- Manual staging checks after 20260524120000_canonical_deduct_sync_active_packs_fifo.sql
-- Run on staging only. Replace placeholders before each block.

-- 1) Upcoming RPC excludes cancelled
-- SELECT public.get_student_upcoming_registrations('<student_id>', '<school_id>'::uuid);
-- Expect: no rows with status = 'cancelled'

-- 2) After one group deduct: balance and pack sum should match
-- SELECT id, balance, active_packs,
--   (SELECT COALESCE(SUM((e->>'count')::int), 0)
--    FROM jsonb_array_elements(COALESCE(active_packs, '[]')) e
--    WHERE (e->>'expires_at') IS NULL OR (e->>'expires_at')::timestamptz > now()) AS pack_sum
-- FROM students WHERE id = '<student_id>' AND school_id = '<school_id>'::uuid;

-- 3) Idempotency replay (same key twice → same balance, one ledger row)
-- SELECT public.canonical_deduct_student_balances(
--   '<student_id>', '<school_id>'::uuid, 1, 'group',
--   'staging-test-key-1', 'staging-verify', '{}'::jsonb);
-- Run twice; second call should return idempotent_replay = true.

-- 4) Insufficient balance must not mutate packs
-- Pick student with balance 0 and non-empty active_packs; deduct should return ok=false, applied=false.
