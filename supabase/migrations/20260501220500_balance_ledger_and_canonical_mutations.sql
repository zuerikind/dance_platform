-- Phase 1 + Phase 2 (Option 2):
-- 1) Add append-only ledger table for every balance mutation.
-- 2) Add canonical mutation RPCs that treat students.balance* as source of truth.
--
-- Backward compatibility:
-- - Existing RPCs are untouched in this migration.
-- - New RPCs are additive and can be adopted gradually.

CREATE TABLE IF NOT EXISTS public.student_balance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id text NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  mutation text NOT NULL CHECK (mutation IN ('admin_set', 'package_apply', 'deduct', 'refund', 'correction')),
  class_type text NULL CHECK (class_type IN ('group', 'private', 'event')),
  actor_type text NOT NULL DEFAULT 'system' CHECK (actor_type IN ('admin', 'system', 'student', 'platform')),
  actor_user_id uuid NULL,
  idempotency_key text NULL,
  source_ref text NULL,
  reason text NULL,
  before_balance numeric NULL,
  before_balance_private int NULL,
  before_balance_events int NULL,
  after_balance numeric NULL,
  after_balance_private int NULL,
  after_balance_events int NULL,
  delta_balance numeric NULL,
  delta_balance_private int NULL,
  delta_balance_events int NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_student_balance_events_student_created
  ON public.student_balance_events (school_id, student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_balance_events_mutation_created
  ON public.student_balance_events (mutation, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_balance_events_source_ref
  ON public.student_balance_events (source_ref)
  WHERE source_ref IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_student_balance_events_idempotency
  ON public.student_balance_events (school_id, student_id, mutation, COALESCE(class_type, ''), idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE public.student_balance_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_balance_events_select_school_admin" ON public.student_balance_events;
CREATE POLICY "student_balance_events_select_school_admin"
ON public.student_balance_events
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin()
  OR public.is_school_admin(school_id)
);

COMMENT ON TABLE public.student_balance_events IS 'Append-only balance mutation ledger. Canonical balance truth is students.balance/balance_private/balance_events.';

CREATE OR REPLACE FUNCTION public.student_has_usable_class_credits_canonical(
  p_balance numeric,
  p_balance_private int,
  p_balance_events int
)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    (p_balance IS NULL) -- NULL group balance means unlimited in current product semantics
    OR COALESCE(p_balance, 0) > 0
    OR COALESCE(p_balance_private, 0) > 0
    OR COALESCE(p_balance_events, 0) > 0;
$$;

COMMENT ON FUNCTION public.student_has_usable_class_credits_canonical(numeric, int, int) IS 'Canonical paid/credit check from row balances only (no active_packs influence).';

CREATE OR REPLACE FUNCTION public.log_student_balance_event(
  p_school_id uuid,
  p_student_id text,
  p_mutation text,
  p_class_type text DEFAULT NULL,
  p_actor_type text DEFAULT 'system',
  p_actor_user_id uuid DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL,
  p_source_ref text DEFAULT NULL,
  p_reason text DEFAULT NULL,
  p_before_balance numeric DEFAULT NULL,
  p_before_balance_private int DEFAULT NULL,
  p_before_balance_events int DEFAULT NULL,
  p_after_balance numeric DEFAULT NULL,
  p_after_balance_private int DEFAULT NULL,
  p_after_balance_events int DEFAULT NULL,
  p_delta_balance numeric DEFAULT NULL,
  p_delta_balance_private int DEFAULT NULL,
  p_delta_balance_events int DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO public.student_balance_events (
    school_id,
    student_id,
    mutation,
    class_type,
    actor_type,
    actor_user_id,
    idempotency_key,
    source_ref,
    reason,
    before_balance,
    before_balance_private,
    before_balance_events,
    after_balance,
    after_balance_private,
    after_balance_events,
    delta_balance,
    delta_balance_private,
    delta_balance_events,
    metadata
  )
  VALUES (
    p_school_id,
    p_student_id,
    p_mutation,
    p_class_type,
    p_actor_type,
    p_actor_user_id,
    p_idempotency_key,
    p_source_ref,
    p_reason,
    p_before_balance,
    p_before_balance_private,
    p_before_balance_events,
    p_after_balance,
    p_after_balance_private,
    p_after_balance_events,
    p_delta_balance,
    p_delta_balance_private,
    p_delta_balance_events,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

COMMENT ON FUNCTION public.log_student_balance_event(uuid, text, text, text, text, uuid, text, text, text, numeric, int, int, numeric, int, int, numeric, int, int, jsonb) IS 'Internal helper to append one balance ledger event.';

-- Canonical admin mutation: set balances directly (optionally per field) with stale-write protection.
CREATE OR REPLACE FUNCTION public.admin_set_student_balances(
  p_student_id text,
  p_school_id uuid,
  p_balance numeric DEFAULT NULL,
  p_balance_private int DEFAULT NULL,
  p_balance_events int DEFAULT NULL,
  p_set_group boolean DEFAULT false,
  p_set_private boolean DEFAULT false,
  p_set_events boolean DEFAULT false,
  p_expected_updated_at timestamptz DEFAULT NULL,
  p_reason text DEFAULT 'manual_set',
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
  v_actor uuid := auth.uid();
BEGIN
  IF p_student_id IS NULL OR p_school_id IS NULL THEN
    RAISE EXCEPTION 'Missing student or school id';
  END IF;
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT *
    INTO v_existing
    FROM public.student_balance_events
    WHERE school_id = p_school_id
      AND student_id = p_student_id
      AND mutation = 'admin_set'
      AND COALESCE(class_type, '') = ''
      AND idempotency_key = p_idempotency_key
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'ok', true,
        'idempotent_replay', true,
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

  IF p_expected_updated_at IS NOT NULL AND v_student.updated_at IS DISTINCT FROM p_expected_updated_at THEN
    RAISE EXCEPTION 'Student was updated by another session. Please refresh and try again.';
  END IF;

  v_new_balance := CASE WHEN p_set_group THEN p_balance ELSE v_student.balance END;
  v_new_balance_private := CASE WHEN p_set_private THEN COALESCE(p_balance_private, 0) ELSE COALESCE(v_student.balance_private, 0) END;
  v_new_balance_events := CASE WHEN p_set_events THEN COALESCE(p_balance_events, 0) ELSE COALESCE(v_student.balance_events, 0) END;
  v_paid := public.student_has_usable_class_credits_canonical(v_new_balance, v_new_balance_private, v_new_balance_events);

  UPDATE public.students
  SET
    balance = v_new_balance,
    balance_private = v_new_balance_private,
    balance_events = v_new_balance_events,
    paid = v_paid,
    updated_at = now()
  WHERE id = p_student_id
    AND school_id = p_school_id;

  v_event_id := public.log_student_balance_event(
    p_school_id := p_school_id,
    p_student_id := p_student_id,
    p_mutation := 'admin_set',
    p_class_type := NULL,
    p_actor_type := CASE WHEN public.is_platform_admin() THEN 'platform' ELSE 'admin' END,
    p_actor_user_id := v_actor,
    p_idempotency_key := p_idempotency_key,
    p_source_ref := p_source_ref,
    p_reason := p_reason,
    p_before_balance := v_student.balance,
    p_before_balance_private := COALESCE(v_student.balance_private, 0),
    p_before_balance_events := COALESCE(v_student.balance_events, 0),
    p_after_balance := v_new_balance,
    p_after_balance_private := v_new_balance_private,
    p_after_balance_events := v_new_balance_events,
    p_delta_balance := CASE WHEN v_new_balance IS NULL OR v_student.balance IS NULL THEN NULL ELSE (v_new_balance - v_student.balance) END,
    p_delta_balance_private := v_new_balance_private - COALESCE(v_student.balance_private, 0),
    p_delta_balance_events := v_new_balance_events - COALESCE(v_student.balance_events, 0),
    p_metadata := COALESCE(p_metadata, '{}'::jsonb)
  );

  RETURN jsonb_build_object(
    'ok', true,
    'idempotent_replay', false,
    'event_id', v_event_id,
    'student_id', p_student_id,
    'school_id', p_school_id,
    'balance', v_new_balance,
    'balance_private', v_new_balance_private,
    'balance_events', v_new_balance_events,
    'paid', v_paid
  );
END;
$$;

COMMENT ON FUNCTION public.admin_set_student_balances(text, uuid, numeric, int, int, boolean, boolean, boolean, timestamptz, text, text, text, jsonb) IS 'Canonical admin balance set with stale-write protection and ledger event.';

-- Canonical package apply: adjust canonical balances by deltas; active_packs is provenance only.
CREATE OR REPLACE FUNCTION public.canonical_apply_student_package(
  p_student_id text,
  p_school_id uuid,
  p_group_delta numeric DEFAULT 0,
  p_private_delta int DEFAULT 0,
  p_event_delta int DEFAULT 0,
  p_package_name text DEFAULT NULL,
  p_package_expires_at timestamptz DEFAULT NULL,
  p_pack_provenance jsonb DEFAULT NULL,
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
  v_actor uuid := auth.uid();
  v_new_packs jsonb;
BEGIN
  IF p_student_id IS NULL OR p_school_id IS NULL THEN
    RAISE EXCEPTION 'Missing student or school id';
  END IF;
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  IF COALESCE(p_group_delta, 0) < 0 OR COALESCE(p_private_delta, 0) < 0 OR COALESCE(p_event_delta, 0) < 0 THEN
    RAISE EXCEPTION 'Package deltas must be non-negative';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT *
    INTO v_existing
    FROM public.student_balance_events
    WHERE school_id = p_school_id
      AND student_id = p_student_id
      AND mutation = 'package_apply'
      AND COALESCE(class_type, '') = ''
      AND idempotency_key = p_idempotency_key
    ORDER BY created_at DESC
    LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'ok', true,
        'idempotent_replay', true,
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

  v_new_balance := CASE
    WHEN v_student.balance IS NULL THEN NULL
    ELSE COALESCE(v_student.balance, 0) + COALESCE(p_group_delta, 0)
  END;
  v_new_balance_private := COALESCE(v_student.balance_private, 0) + COALESCE(p_private_delta, 0);
  v_new_balance_events := COALESCE(v_student.balance_events, 0) + COALESCE(p_event_delta, 0);
  v_paid := public.student_has_usable_class_credits_canonical(v_new_balance, v_new_balance_private, v_new_balance_events);

  v_new_packs := COALESCE(v_student.active_packs, '[]'::jsonb);
  IF p_pack_provenance IS NOT NULL THEN
    v_new_packs := v_new_packs || jsonb_build_array(p_pack_provenance);
  END IF;

  UPDATE public.students
  SET
    balance = v_new_balance,
    balance_private = v_new_balance_private,
    balance_events = v_new_balance_events,
    package = COALESCE(p_package_name, package),
    package_expires_at = COALESCE(p_package_expires_at, package_expires_at),
    active_packs = v_new_packs,
    paid = v_paid,
    updated_at = now()
  WHERE id = p_student_id
    AND school_id = p_school_id;

  v_event_id := public.log_student_balance_event(
    p_school_id := p_school_id,
    p_student_id := p_student_id,
    p_mutation := 'package_apply',
    p_class_type := NULL,
    p_actor_type := CASE WHEN public.is_platform_admin() THEN 'platform' ELSE 'admin' END,
    p_actor_user_id := v_actor,
    p_idempotency_key := p_idempotency_key,
    p_source_ref := p_source_ref,
    p_reason := 'package_apply',
    p_before_balance := v_student.balance,
    p_before_balance_private := COALESCE(v_student.balance_private, 0),
    p_before_balance_events := COALESCE(v_student.balance_events, 0),
    p_after_balance := v_new_balance,
    p_after_balance_private := v_new_balance_private,
    p_after_balance_events := v_new_balance_events,
    p_delta_balance := COALESCE(p_group_delta, 0),
    p_delta_balance_private := COALESCE(p_private_delta, 0),
    p_delta_balance_events := COALESCE(p_event_delta, 0),
    p_metadata := COALESCE(p_metadata, '{}'::jsonb)
      || jsonb_build_object('package_name', p_package_name, 'package_expires_at', p_package_expires_at)
  );

  RETURN jsonb_build_object(
    'ok', true,
    'idempotent_replay', false,
    'event_id', v_event_id,
    'student_id', p_student_id,
    'school_id', p_school_id,
    'balance', v_new_balance,
    'balance_private', v_new_balance_private,
    'balance_events', v_new_balance_events,
    'paid', v_paid
  );
END;
$$;

COMMENT ON FUNCTION public.canonical_apply_student_package(text, uuid, numeric, int, int, text, timestamptz, jsonb, text, text, jsonb) IS 'Canonical package apply using row balances as source of truth and ledger logging.';

-- Canonical deduction: consume canonical balances only, never pack sums.
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

  v_paid := public.student_has_usable_class_credits_canonical(v_new_balance, v_new_balance_private, v_new_balance_events);

  UPDATE public.students
  SET
    balance = v_new_balance,
    balance_private = v_new_balance_private,
    balance_events = v_new_balance_events,
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

COMMENT ON FUNCTION public.canonical_deduct_student_balances(text, uuid, int, text, text, text, jsonb) IS 'Canonical deduction (group/private/event) from row balances only, with idempotency and ledger logging.';

GRANT SELECT ON public.student_balance_events TO authenticated;
GRANT EXECUTE ON FUNCTION public.student_has_usable_class_credits_canonical(numeric, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_student_balances(text, uuid, numeric, int, int, boolean, boolean, boolean, timestamptz, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.canonical_apply_student_package(text, uuid, numeric, int, int, text, timestamptz, jsonb, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.canonical_apply_student_package(text, uuid, numeric, int, int, text, timestamptz, jsonb, text, text, jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.canonical_deduct_student_balances(text, uuid, int, text, text, text, jsonb) TO authenticated;
