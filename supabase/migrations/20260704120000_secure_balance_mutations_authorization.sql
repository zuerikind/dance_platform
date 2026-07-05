-- =============================================================================
-- SECURITY FIX: restore authorization on balance-mutating RPCs.
--
-- Regression history: the admin guard that once lived in deduct_student_classes
-- (20260214180000_rpc_authorization.sql) was dropped in the 20260430180000 FIFO
-- rewrite and never restored. The canonical engine it now delegates to
-- (canonical_deduct_student_balances) has no authorization check and is granted
-- to authenticated; deduct_student_classes and process_expired_registrations are
-- additionally granted to anon. Net effect on the live DB: any authenticated user
-- (and, for the two anon-granted entrypoints, any unauthenticated request) can
-- drain any student's balance in any school, or trigger no-show deductions for a
-- whole school.
--
-- This migration:
--   * adds an in-body authorization guard to canonical_deduct_student_balances,
--     process_expired_registrations, and reconcile_student_balance_from_active_packs;
--   * revokes EXECUTE from PUBLIC and anon on every deduct entrypoint;
--   * keeps authenticated (admin scanner) and service_role (nightly cron).
--
-- Allowed callers (guard): school admin, platform admin, the student acting on
-- their OWN row, or a system/cron call with no user JWT (auth.uid() IS NULL).
-- Every legitimate path is preserved:
--   - admin QR scanner (deduct_student_classes / reconcile)  -> is_school_admin
--   - student late-cancel penalty (student_cancel_private_lesson -> deduct) -> own row
--   - nightly cron (process-expired-registrations edge fn, service_role) -> auth.uid() IS NULL
-- Internal SECURITY DEFINER callers run as owner and preserve auth.uid(), so their
-- guard evaluates against the real end user.
--
-- Function bodies below are copied verbatim from the latest definitions
-- (canonical: 20260524120000, process_expired: 20260502160000,
--  reconcile: 20260604120000) with ONLY the guard block inserted.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) canonical_deduct_student_balances  (+ authorization guard)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.canonical_deduct_student_balances(
  p_student_id text,
  p_school_id uuid,
  p_count int,
  p_class_type text DEFAULT 'group',
  p_idempotency_key text DEFAULT NULL,
  p_source_ref text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student public.students%ROWTYPE;
  v_new_balance numeric;
  v_new_balance_private int;
  v_new_balance_events int;
  v_paid boolean;
  v_event_id uuid;
  v_existing public.student_balance_events%ROWTYPE;
  v_class_type text := COALESCE(trim(lower(p_class_type)), 'group');
  v_actor uuid := auth.uid();
  v_active_packs jsonb;
  v_new_packs jsonb := '[]'::jsonb;
  v_remaining int;
  v_elem jsonb;
  v_cnt int;
  v_cnt_priv int;
  v_cnt_event int;
  v_deduct int;
  v_expires_at timestamptz;
  v_now timestamptz := now();
  v_sync_packs boolean := false;
BEGIN
  IF p_student_id IS NULL OR p_school_id IS NULL THEN
    RAISE EXCEPTION 'Missing student or school id';
  END IF;
  IF p_count IS NULL OR p_count < 1 THEN
    RAISE EXCEPTION 'p_count must be >= 1';
  END IF;
  IF v_class_type NOT IN ('group', 'private', 'event') THEN
    RAISE EXCEPTION 'Invalid class type %', p_class_type;
  END IF;

  -- Authorization: admin/platform, the student on their own row, or system/cron (no user JWT).
  -- SECURITY DEFINER preserves auth.uid(), so internal callers evaluate against the real end user.
  IF NOT (
    public.is_school_admin(p_school_id)
    OR public.is_platform_admin()
    OR auth.uid() IS NULL
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = p_student_id AND s.school_id = p_school_id AND s.user_id = auth.uid()
    )
  ) THEN
    RETURN jsonb_build_object('ok', false, 'applied', false, 'reason', 'not_authorized');
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT *
    INTO v_existing
    FROM public.student_balance_events
    WHERE school_id = p_school_id
      AND student_id = p_student_id
      AND mutation = 'deduct'
      AND COALESCE(class_type, '') = v_class_type
      AND idempotency_key = p_idempotency_key
    ORDER BY created_at DESC
    LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'ok', true,
        'idempotent_replay', true,
        'applied', true,
        'event_id', v_existing.id,
        'balance', v_existing.after_balance,
        'balance_private', v_existing.after_balance_private,
        'balance_events', v_existing.after_balance_events
      );
    END IF;
  END IF;

  SELECT *
  INTO v_student
  FROM public.students
  WHERE id = p_student_id
    AND school_id = p_school_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found in school';
  END IF;

  v_new_balance := v_student.balance;
  v_new_balance_private := COALESCE(v_student.balance_private, 0);
  v_new_balance_events := COALESCE(v_student.balance_events, 0);

  IF v_class_type = 'group' THEN
    IF v_new_balance IS NULL THEN
      NULL; -- unlimited: no decrement
    ELSIF v_new_balance < p_count THEN
      RETURN jsonb_build_object(
        'ok', false,
        'applied', false,
        'reason', 'insufficient_balance',
        'balance', v_new_balance,
        'balance_private', v_new_balance_private,
        'balance_events', v_new_balance_events
      );
    ELSE
      v_new_balance := v_new_balance - p_count;
    END IF;
  ELSIF v_class_type = 'private' THEN
    IF v_new_balance_private < p_count THEN
      RETURN jsonb_build_object(
        'ok', false,
        'applied', false,
        'reason', 'insufficient_balance',
        'balance', v_new_balance,
        'balance_private', v_new_balance_private,
        'balance_events', v_new_balance_events
      );
    END IF;
    v_new_balance_private := v_new_balance_private - p_count;
  ELSE
    IF v_new_balance_events < p_count THEN
      RETURN jsonb_build_object(
        'ok', false,
        'applied', false,
        'reason', 'insufficient_balance',
        'balance', v_new_balance,
        'balance_private', v_new_balance_private,
        'balance_events', v_new_balance_events
      );
    END IF;
    v_new_balance_events := v_new_balance_events - p_count;
  END IF;

  -- FIFO consume from active_packs when packs exist (skip unlimited group deduct).
  v_active_packs := COALESCE(v_student.active_packs, '[]'::jsonb);
  IF jsonb_array_length(v_active_packs) > 0
     AND NOT (v_class_type = 'group' AND v_student.balance IS NULL)
  THEN
    v_remaining := p_count;
    v_new_packs := '[]'::jsonb;
    FOR v_elem IN
      SELECT elem FROM jsonb_array_elements(v_active_packs) AS elem
      ORDER BY
        (elem->>'expires_at')::timestamptz ASC NULLS LAST,
        COALESCE((elem->>'created_at')::timestamptz, to_timestamp(0)) ASC
    LOOP
      v_expires_at := (v_elem->>'expires_at')::timestamptz;
      IF v_expires_at IS NOT NULL AND v_expires_at <= v_now THEN
        v_new_packs := v_new_packs || v_elem;
        CONTINUE;
      END IF;
      IF v_remaining <= 0 THEN
        v_new_packs := v_new_packs || v_elem;
        CONTINUE;
      END IF;

      IF v_class_type = 'private' THEN
        v_cnt_priv := COALESCE((v_elem->>'private_count')::int, 0);
        IF v_cnt_priv <= 0 THEN
          v_new_packs := v_new_packs || v_elem;
          CONTINUE;
        END IF;
        v_deduct := LEAST(v_cnt_priv, v_remaining);
        v_remaining := v_remaining - v_deduct;
        v_cnt_priv := v_cnt_priv - v_deduct;
        v_new_packs := v_new_packs || jsonb_set(
          COALESCE(v_elem - 'private_count', v_elem),
          '{private_count}',
          to_jsonb(GREATEST(0, v_cnt_priv))
        );
      ELSIF v_class_type = 'event' THEN
        v_cnt_event := COALESCE((v_elem->>'event_count')::int, 0);
        IF v_cnt_event <= 0 THEN
          v_new_packs := v_new_packs || v_elem;
          CONTINUE;
        END IF;
        v_deduct := LEAST(v_cnt_event, v_remaining);
        v_remaining := v_remaining - v_deduct;
        v_cnt_event := v_cnt_event - v_deduct;
        v_new_packs := v_new_packs || jsonb_set(
          COALESCE(v_elem - 'event_count', v_elem),
          '{event_count}',
          to_jsonb(GREATEST(0, v_cnt_event))
        );
      ELSE
        v_cnt := COALESCE((v_elem->>'count')::int, 0);
        IF v_cnt <= 0 THEN
          v_new_packs := v_new_packs || v_elem;
          CONTINUE;
        END IF;
        v_deduct := LEAST(v_cnt, v_remaining);
        v_remaining := v_remaining - v_deduct;
        v_cnt := v_cnt - v_deduct;
        v_new_packs := v_new_packs || jsonb_set(v_elem, '{count}', to_jsonb(GREATEST(0, v_cnt)));
      END IF;
    END LOOP;
    v_sync_packs := true;
  END IF;

  v_paid := public.student_has_usable_class_credits_canonical(v_new_balance, v_new_balance_private, v_new_balance_events);

  UPDATE public.students
  SET
    balance = v_new_balance,
    balance_private = v_new_balance_private,
    balance_events = v_new_balance_events,
    active_packs = CASE WHEN v_sync_packs THEN v_new_packs ELSE active_packs END,
    paid = v_paid,
    updated_at = now()
  WHERE id = p_student_id
    AND school_id = p_school_id;

  v_event_id := public.log_student_balance_event(
    p_school_id := p_school_id,
    p_student_id := p_student_id,
    p_mutation := 'deduct',
    p_class_type := v_class_type,
    p_actor_type := CASE WHEN public.is_platform_admin() THEN 'platform' ELSE 'admin' END,
    p_actor_user_id := v_actor,
    p_idempotency_key := p_idempotency_key,
    p_source_ref := p_source_ref,
    p_reason := 'deduct_' || v_class_type,
    p_before_balance := v_student.balance,
    p_before_balance_private := COALESCE(v_student.balance_private, 0),
    p_before_balance_events := COALESCE(v_student.balance_events, 0),
    p_after_balance := v_new_balance,
    p_after_balance_private := v_new_balance_private,
    p_after_balance_events := v_new_balance_events,
    p_delta_balance := CASE
      WHEN v_class_type = 'group' AND v_student.balance IS NOT NULL THEN -p_count
      ELSE NULL
    END,
    p_delta_balance_private := CASE WHEN v_class_type = 'private' THEN -p_count ELSE 0 END,
    p_delta_balance_events := CASE WHEN v_class_type = 'event' THEN -p_count ELSE 0 END,
    p_metadata := COALESCE(p_metadata, '{}'::jsonb)
  );

  RETURN jsonb_build_object(
    'ok', true,
    'applied', true,
    'idempotent_replay', false,
    'event_id', v_event_id,
    'student_id', p_student_id,
    'school_id', p_school_id,
    'class_type', v_class_type,
    'count', p_count,
    'balance', v_new_balance,
    'balance_private', v_new_balance_private,
    'balance_events', v_new_balance_events,
    'paid', v_paid
  );
END;
$$;

COMMENT ON FUNCTION public.canonical_deduct_student_balances(text, uuid, int, text, text, text, jsonb) IS
  'Canonical deduction (group/private/event) from row balances with FIFO active_packs sync, idempotency, ledger logging. Authorized to school/platform admin, the student on their own row, or system/cron (no user JWT).';

-- -----------------------------------------------------------------------------
-- 2) process_expired_registrations  (+ authorization guard)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_expired_registrations(p_school_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg record;
  v_processed int := 0;
  v_cutoff date;
  v_student_id text;
  v_deduct_result jsonb;
  v_deduct_key text;
BEGIN
  -- Only admins/platform or a system/cron call (no user JWT) may drive school-wide no-show processing.
  IF NOT (
    public.is_school_admin(p_school_id)
    OR public.is_platform_admin()
    OR auth.uid() IS NULL
  ) THEN
    RETURN 0;
  END IF;

  IF public.is_aure_school(p_school_id) THEN
    v_cutoff := (now() AT TIME ZONE 'America/Mexico_City')::date;
  ELSE
    v_cutoff := CURRENT_DATE;
  END IF;

  FOR v_reg IN
    SELECT cr.id, cr.student_id
    FROM public.class_registrations cr
    WHERE cr.school_id = p_school_id
      AND cr.status = 'registered'
      AND cr.deducted = false
      AND cr.class_date < v_cutoff
  LOOP
    v_deduct_key := 'class_registration:' || v_reg.id::text || ':first_deduct';
    SELECT public.canonical_deduct_student_balances(
      p_student_id := v_reg.student_id,
      p_school_id := p_school_id,
      p_count := 1,
      p_class_type := 'group',
      p_idempotency_key := v_deduct_key,
      p_source_ref := v_reg.id::text,
      p_metadata := jsonb_build_object(
        'flow', 'process_expired_registrations',
        'registration_id', v_reg.id
      )
    ) INTO v_deduct_result;

    IF coalesce((v_deduct_result->>'ok')::boolean, false) THEN
      UPDATE public.class_registrations
      SET status = 'no_show', deducted = true
      WHERE id = v_reg.id
        AND status = 'registered'
        AND deducted = false
      RETURNING student_id INTO v_student_id;

      IF FOUND THEN
        v_processed := v_processed + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN v_processed;
END;
$$;

COMMENT ON FUNCTION public.process_expired_registrations(uuid) IS
'Overdue registered rows: deduct once (canonical, idempotent) then mark no_show+deducted; skips row if deduct fails. Authorized to school/platform admin or system/cron (no user JWT).';

-- -----------------------------------------------------------------------------
-- 3) reconcile_student_balance_from_active_packs  (+ authorization guard)
-- -----------------------------------------------------------------------------
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

  -- Authorization: admin/platform, the student on their own row, or system/cron (no user JWT).
  IF NOT (
    public.is_school_admin(p_school_id)
    OR public.is_platform_admin()
    OR auth.uid() IS NULL
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = p_student_id AND s.school_id = p_school_id AND s.user_id = auth.uid()
    )
  ) THEN
    RETURN jsonb_build_object('ok', false, 'changed', false, 'reason', 'not_authorized');
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
  'Re-derive canonical balances from NON-expired active_packs; idempotent; logs a correction event when changed; never touches pack-less students. Authorized to school/platform admin, the student on their own row, or system/cron (no user JWT).';

-- -----------------------------------------------------------------------------
-- 4) Lock down EXECUTE: remove PUBLIC/anon; keep authenticated + service_role.
--    deduct_student_classes(4-arg) delegates to the now-guarded canonical engine;
--    it stays authenticated-callable for the admin QR scanner.
-- -----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.canonical_deduct_student_balances(text, uuid, int, text, text, text, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.deduct_student_classes(text, uuid, int, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.process_expired_registrations(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reconcile_student_balance_from_active_packs(text, uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.canonical_deduct_student_balances(text, uuid, int, text, text, text, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.deduct_student_classes(text, uuid, int, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.process_expired_registrations(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reconcile_student_balance_from_active_packs(text, uuid) TO authenticated, service_role;
