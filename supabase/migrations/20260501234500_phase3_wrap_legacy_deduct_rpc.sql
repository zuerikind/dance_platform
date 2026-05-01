-- Phase 3: wrap legacy deduct_student_classes signature to canonical mutation.
-- Keeps legacy signature/return type unchanged for existing callers.

CREATE OR REPLACE FUNCTION public.deduct_student_classes(
  p_student_id text,
  p_school_id uuid,
  p_count int,
  p_class_type text DEFAULT 'group'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Legacy behavior preserved: no exception on insufficient credits.
  -- Canonical mutation writes ledger + updates row balances atomically.
  SELECT public.canonical_deduct_student_balances(
    p_student_id := p_student_id,
    p_school_id := p_school_id,
    p_count := p_count,
    p_class_type := p_class_type,
    p_idempotency_key := NULL,
    p_source_ref := NULL,
    p_metadata := jsonb_build_object('legacy_rpc', 'deduct_student_classes')
  )
  INTO v_result;

  RETURN;
END;
$$;

COMMENT ON FUNCTION public.deduct_student_classes(text, uuid, int, text) IS
'Legacy-compatible wrapper: delegates to canonical_deduct_student_balances (row balances as source of truth, ledgered).';

GRANT EXECUTE ON FUNCTION public.deduct_student_classes(text, uuid, int, text) TO authenticated;
