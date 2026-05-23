-- Sync active_packs on canonical deduct (FIFO) and exclude cancelled from upcoming registrations.

-- 1) Upcoming registrations: only active holds (matches register_for_class capacity logic).
CREATE OR REPLACE FUNCTION public.get_student_upcoming_registrations(
  p_student_id text,
  p_school_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb := '[]'::jsonb;
  v_row record;
BEGIN
  FOR v_row IN
    SELECT cr.id, cr.class_id, cr.class_date, cr.status, cr.created_at, cr.cancelled_at, cr.deducted,
           cr.is_monthly,
           c.name AS class_name, c.day, c.time, c.location, c.tag
    FROM public.class_registrations cr
    JOIN public.classes c ON c.id = cr.class_id
    WHERE cr.student_id = p_student_id
      AND cr.school_id = p_school_id
      AND cr.class_date >= CURRENT_DATE
      AND cr.status IN ('registered', 'pending')
    ORDER BY cr.class_date, c.time
  LOOP
    v_result := v_result || jsonb_build_object(
      'id', v_row.id,
      'class_id', v_row.class_id,
      'class_date', v_row.class_date,
      'status', v_row.status,
      'created_at', v_row.created_at,
      'cancelled_at', v_row.cancelled_at,
      'deducted', v_row.deducted,
      'is_monthly', v_row.is_monthly,
      'class_name', v_row.class_name,
      'day', v_row.day,
      'time', v_row.time,
      'location', v_row.location,
      'tag', v_row.tag
    );
  END LOOP;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_student_upcoming_registrations(text, uuid) IS
  'Future class registrations for a student (registered/pending only; excludes cancelled).';

GRANT EXECUTE ON FUNCTION public.get_student_upcoming_registrations(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_upcoming_registrations(text, uuid) TO anon;

-- 2) Canonical deduct: row balances + FIFO active_packs in one transaction.
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
  'Canonical deduction (group/private/event) from row balances with FIFO active_packs sync, idempotency, and ledger logging.';

GRANT EXECUTE ON FUNCTION public.canonical_deduct_student_balances(text, uuid, int, text, text, text, jsonb) TO authenticated;
