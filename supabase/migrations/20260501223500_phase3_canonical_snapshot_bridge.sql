-- Phase 3 (start): compatibility bridge primitives.
-- Additive only: no existing legacy RPC signature is replaced in this migration.
-- This allows gradual wrapper/caller migration without breaking live flows.

CREATE OR REPLACE FUNCTION public.canonical_set_student_balances_snapshot(
  p_student_id text,
  p_school_id uuid,
  p_balance numeric,
  p_balance_private int,
  p_balance_events int,
  p_expected_updated_at timestamptz DEFAULT NULL,
  p_reason text DEFAULT 'legacy_snapshot_bridge',
  p_idempotency_key text DEFAULT NULL,
  p_source_ref text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.admin_set_student_balances(
    p_student_id := p_student_id,
    p_school_id := p_school_id,
    p_balance := p_balance,
    p_balance_private := p_balance_private,
    p_balance_events := p_balance_events,
    p_set_group := true,
    p_set_private := true,
    p_set_events := true,
    p_expected_updated_at := p_expected_updated_at,
    p_reason := p_reason,
    p_idempotency_key := p_idempotency_key,
    p_source_ref := p_source_ref,
    p_metadata := COALESCE(p_metadata, '{}'::jsonb)
      || jsonb_build_object('bridge', 'canonical_set_student_balances_snapshot')
  );
END;
$$;

COMMENT ON FUNCTION public.canonical_set_student_balances_snapshot(text, uuid, numeric, int, int, timestamptz, text, text, text, jsonb) IS
'Phase-3 bridge: set absolute canonical balances via admin_set_student_balances while preserving stale-write and ledger behavior.';

GRANT EXECUTE ON FUNCTION public.canonical_set_student_balances_snapshot(text, uuid, numeric, int, int, timestamptz, text, text, text, jsonb) TO authenticated;
