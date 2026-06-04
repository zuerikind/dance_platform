-- Self-heal students.balance* when packs expire.
--
-- System invariant (when a student holds packs): students.balance* == sum of NON-expired pack counts.
-- All write paths maintain it: activate_package_for_student sums non-expired packs, canonical_deduct
-- decrements balance + pack counts (FIFO), and admin edits re-sync non-expired pack counts to the saved
-- balance. The single gap is time-based expiry: when a pack crosses expires_at, balance is not re-derived,
-- so credits from the lapsed pack linger until the next mutation (the widespread "phantom count" drift).
--
-- This RPC re-derives balance/balance_private/balance_events from the NON-expired packs, restoring the
-- invariant. It is idempotent: a student already at the correct value is left untouched. Students with NO
-- packs at all are never modified (their balance is legacy / manually-granted credit with no backing pack).
-- A 'correction' ledger event is written whenever a value actually changes.

CREATE OR REPLACE FUNCTION public.reconcile_student_balance_from_active_packs(
  p_student_id text,
  p_school_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student public.students%ROWTYPE;
  v_now timestamptz := now();
  v_had_pack boolean := false;
  v_any_active boolean := false;
  v_has_unlimited_active boolean := false;
  v_active_group int := 0;
  v_active_private int := 0;
  v_active_events int := 0;
  v_fully_expired boolean := false;
  v_new_balance numeric;
  v_new_private int;
  v_new_events int;
  v_paid boolean;
  v_event_id uuid;
BEGIN
  IF p_student_id IS NULL OR p_school_id IS NULL THEN
    RAISE EXCEPTION 'Missing student or school id';
  END IF;

  SELECT * INTO v_student
  FROM public.students
  WHERE id = p_student_id AND school_id = p_school_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  WITH packs AS (
    SELECT
      elem,
      (
        (elem->>'expires_at') IS NOT NULL
        AND trim(coalesce(elem->>'expires_at', '')) <> ''
        AND (elem->>'expires_at')::timestamptz <= v_now
      ) AS is_expired,
      (elem->>'count' IS NULL OR lower(trim(coalesce(elem->>'count', ''))) = 'null') AS is_unlimited_count
    FROM jsonb_array_elements(COALESCE(v_student.active_packs, '[]'::jsonb)) AS elem
  )
  SELECT
    COUNT(*) > 0,
    COUNT(*) FILTER (WHERE NOT is_expired) > 0,
    COALESCE(bool_or(NOT is_expired AND is_unlimited_count), false),
    COALESCE(SUM(CASE WHEN NOT is_expired AND NOT is_unlimited_count
                      THEN COALESCE(NULLIF(trim(elem->>'count'), '')::int, 0) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN NOT is_expired
                      THEN COALESCE(NULLIF(trim(elem->>'private_count'), '')::int, 0) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN NOT is_expired
                      THEN COALESCE(NULLIF(trim(elem->>'event_count'), '')::int, 0) ELSE 0 END), 0)
  INTO v_had_pack, v_any_active, v_has_unlimited_active, v_active_group, v_active_private, v_active_events
  FROM packs;

  -- Never touch pack-less students: their balance is legacy / manual credit with no pack to derive from.
  IF NOT v_had_pack THEN
    RETURN jsonb_build_object(
      'ok', true,
      'changed', false,
      'reason', 'no_packs',
      'balance', v_student.balance,
      'balance_private', COALESCE(v_student.balance_private, 0),
      'balance_events', COALESCE(v_student.balance_events, 0)
    );
  END IF;

  v_fully_expired := NOT v_any_active;

  -- group
  IF v_fully_expired THEN
    v_new_balance := 0;
  ELSIF v_has_unlimited_active THEN
    v_new_balance := NULL; -- unlimited
  ELSE
    v_new_balance := v_active_group;
  END IF;

  -- private / events
  IF v_fully_expired THEN
    v_new_private := 0;
    v_new_events := 0;
  ELSE
    v_new_private := v_active_private;
    v_new_events := v_active_events;
  END IF;

  IF v_student.balance IS NOT DISTINCT FROM v_new_balance
     AND COALESCE(v_student.balance_private, 0) = v_new_private
     AND COALESCE(v_student.balance_events, 0) = v_new_events THEN
    RETURN jsonb_build_object(
      'ok', true,
      'changed', false,
      'balance', v_student.balance,
      'balance_private', COALESCE(v_student.balance_private, 0),
      'balance_events', COALESCE(v_student.balance_events, 0)
    );
  END IF;

  v_paid := public.student_has_usable_class_credits_canonical(v_new_balance, v_new_private, v_new_events);

  UPDATE public.students
  SET
    balance = v_new_balance,
    balance_private = v_new_private,
    balance_events = v_new_events,
    paid = v_paid,
    updated_at = now()
  WHERE id = p_student_id AND school_id = p_school_id;

  v_event_id := public.log_student_balance_event(
    p_school_id := p_school_id,
    p_student_id := p_student_id,
    p_mutation := 'correction',
    p_class_type := NULL,
    p_actor_type := 'system',
    p_actor_user_id := auth.uid(),
    p_reason := 'reconcile_expired_packs',
    p_before_balance := v_student.balance,
    p_before_balance_private := COALESCE(v_student.balance_private, 0),
    p_before_balance_events := COALESCE(v_student.balance_events, 0),
    p_after_balance := v_new_balance,
    p_after_balance_private := v_new_private,
    p_after_balance_events := v_new_events,
    p_delta_balance := CASE
      WHEN v_student.balance IS NULL OR v_new_balance IS NULL THEN NULL
      ELSE v_new_balance - v_student.balance
    END,
    p_delta_balance_private := v_new_private - COALESCE(v_student.balance_private, 0),
    p_delta_balance_events := v_new_events - COALESCE(v_student.balance_events, 0),
    p_metadata := jsonb_build_object(
      'source', 'reconcile_student_balance_from_active_packs',
      'active_group', v_active_group,
      'active_private', v_active_private,
      'active_events', v_active_events
    )
  );

  RETURN jsonb_build_object(
    'ok', true,
    'changed', true,
    'event_id', v_event_id,
    'balance', v_new_balance,
    'balance_private', v_new_private,
    'balance_events', v_new_events,
    'paid', v_paid
  );
END;
$$;

COMMENT ON FUNCTION public.reconcile_student_balance_from_active_packs(text, uuid) IS
  'Re-derive canonical balances from NON-expired active_packs (restores balance == non-expired pack sum); idempotent; logs a correction ledger event when changed; never touches pack-less students.';

GRANT EXECUTE ON FUNCTION public.reconcile_student_balance_from_active_packs(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_student_balance_from_active_packs(text, uuid) TO anon;

-- One-time backfill: heal every student that currently holds packs (only changed rows are touched/logged).
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT id, school_id
    FROM public.students
    WHERE active_packs IS NOT NULL
      AND jsonb_typeof(active_packs) = 'array'
      AND jsonb_array_length(active_packs) > 0
  LOOP
    PERFORM public.reconcile_student_balance_from_active_packs(r.id, r.school_id);
  END LOOP;
END $$;
