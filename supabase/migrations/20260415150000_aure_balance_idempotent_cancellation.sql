-- Harden class count integrity for live flows:
-- 1) idempotent attendance/no_show deductions
-- 2) safer deduction reconciliation when balance and active_packs drift
-- 3) allow cancelling pending registrations (Aure switching days)

CREATE OR REPLACE FUNCTION public.cancel_class_registration(
  p_registration_id uuid,
  p_student_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg public.class_registrations%ROWTYPE;
  v_class public.classes%ROWTYPE;
  v_class_datetime_tz timestamptz;
  v_class_datetime_local timestamp;
  v_now_local timestamp;
BEGIN
  SELECT * INTO v_reg
  FROM public.class_registrations
  WHERE id = p_registration_id
    AND student_id = p_student_id
    AND status IN ('registered', 'pending');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found or already cancelled.';
  END IF;

  IF NOT (
    public.is_school_admin(v_reg.school_id)
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id::text = v_reg.student_id
        AND s.school_id = v_reg.school_id
        AND s.user_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Permission denied: only the student or a school admin can cancel.';
  END IF;

  SELECT * INTO v_class FROM public.classes WHERE id = v_reg.class_id;

  IF public.is_aure_school(v_reg.school_id) THEN
    v_now_local := now() AT TIME ZONE 'America/Mexico_City';
    v_class_datetime_local := (v_reg.class_date || ' ' || COALESCE(v_class.time, '23:59'))::timestamp;
    IF v_class_datetime_local - interval '4 hours' <= v_now_local THEN
      RAISE EXCEPTION 'Cannot cancel less than 4 hours before class.';
    END IF;
  ELSE
    v_class_datetime_tz := (v_reg.class_date || ' ' || COALESCE(v_class.time, '23:59'))::timestamptz;
    IF v_class_datetime_tz - interval '4 hours' <= now() THEN
      RAISE EXCEPTION 'Cannot cancel less than 4 hours before class.';
    END IF;
  END IF;

  UPDATE public.class_registrations
  SET status = 'cancelled', cancelled_at = now()
  WHERE id = p_registration_id
    AND status IN ('registered', 'pending');
END;
$$;

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
BEGIN
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
    UPDATE public.class_registrations
    SET status = 'no_show', deducted = true
    WHERE id = v_reg.id
      AND status = 'registered'
      AND deducted = false
    RETURNING student_id INTO v_student_id;

    IF FOUND THEN
      PERFORM public.deduct_student_classes(v_student_id, p_school_id, 1, 'group');
      v_processed := v_processed + 1;
    END IF;
  END LOOP;

  RETURN v_processed;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_registration_attended(
  p_registration_id uuid,
  p_school_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg public.class_registrations%ROWTYPE;
  v_student_id text;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;

  -- If this row was previously marked no_show and already deducted, only flip status.
  UPDATE public.class_registrations
  SET status = 'attended'
  WHERE id = p_registration_id
    AND school_id = p_school_id
    AND status = 'no_show'
    AND deducted = true;
  IF FOUND THEN
    RETURN;
  END IF;

  -- Atomic transition from undeducted registration-like states.
  UPDATE public.class_registrations
  SET status = 'attended', deducted = true
  WHERE id = p_registration_id
    AND school_id = p_school_id
    AND deducted = false
    AND (
      status = 'registered'
      OR (
        public.is_aure_school(p_school_id)
        AND status = 'pending'
      )
    )
  RETURNING student_id INTO v_student_id;

  IF FOUND THEN
    PERFORM public.deduct_student_classes(v_student_id, p_school_id, 1, 'group');
    RETURN;
  END IF;

  SELECT *
  INTO v_reg
  FROM public.class_registrations
  WHERE id = p_registration_id
    AND school_id = p_school_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found.';
  END IF;
  IF v_reg.status = 'attended' THEN
    RETURN;
  END IF;
  IF v_reg.status IN ('registered', 'pending') AND COALESCE(v_reg.deducted, false) THEN
    UPDATE public.class_registrations
    SET status = 'attended'
    WHERE id = p_registration_id;
    RETURN;
  END IF;

  RAISE EXCEPTION 'Registration not found or not in a scannable status.';
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_registration_attendance(
  p_registration_id uuid,
  p_school_id uuid,
  p_present boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg public.class_registrations%ROWTYPE;
  v_student_id text;
BEGIN
  SELECT *
  INTO v_reg
  FROM public.class_registrations
  WHERE id = p_registration_id
    AND school_id = p_school_id
    AND status IN ('registered', 'attended', 'no_show', 'pending');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found or status cannot be updated.';
  END IF;

  IF p_present THEN
    -- no_show already deducted: mark attended without another deduction.
    UPDATE public.class_registrations
    SET status = 'attended'
    WHERE id = p_registration_id
      AND school_id = p_school_id
      AND status = 'no_show'
      AND deducted = true;
    IF FOUND THEN
      RETURN;
    END IF;

    -- Undeducted attendance path (idempotent CAS).
    UPDATE public.class_registrations
    SET status = 'attended', deducted = true
    WHERE id = p_registration_id
      AND school_id = p_school_id
      AND deducted = false
      AND (
        status IN ('registered', 'attended')
        OR (
          public.is_aure_school(p_school_id)
          AND status = 'pending'
        )
      )
    RETURNING student_id INTO v_student_id;

    IF FOUND THEN
      PERFORM public.deduct_student_classes(v_student_id, p_school_id, 1, 'group');
      RETURN;
    END IF;

    IF v_reg.status = 'attended' THEN
      RETURN;
    END IF;
    IF v_reg.status IN ('registered', 'pending') AND COALESCE(v_reg.deducted, false) THEN
      UPDATE public.class_registrations
      SET status = 'attended'
      WHERE id = p_registration_id
        AND school_id = p_school_id;
      RETURN;
    END IF;
    RETURN;
  END IF;

  -- Mark absent/no_show.
  UPDATE public.class_registrations
  SET status = 'no_show', deducted = true
  WHERE id = p_registration_id
    AND school_id = p_school_id
    AND deducted = false
    AND (
      status IN ('registered', 'attended')
      OR (
        public.is_aure_school(p_school_id)
        AND status = 'pending'
      )
      OR status = 'no_show'
    )
  RETURNING student_id INTO v_student_id;

  IF FOUND THEN
    PERFORM public.deduct_student_classes(v_student_id, p_school_id, 1, 'group');
    RETURN;
  END IF;

  IF v_reg.status = 'no_show' AND COALESCE(v_reg.deducted, false) THEN
    RETURN;
  END IF;
END;
$$;

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
  v_student public.students%ROWTYPE;
  v_active_packs jsonb;
  v_new_packs jsonb := '[]'::jsonb;
  v_remaining int;
  v_elem jsonb;
  v_cnt int;
  v_cnt_priv int;
  v_cnt_event int;
  v_deduct int;
  v_new_balance int;
  v_new_balance_private int;
  v_new_balance_events int;
  v_now timestamptz := now();
  v_expires_at timestamptz;
  v_is_private boolean;
  v_is_event boolean;
  v_effective_private int;
  v_effective_events int;
  v_effective_group int;
  v_target_balance_after int;
BEGIN
  IF p_count IS NULL OR p_count < 1 THEN
    RETURN;
  END IF;
  v_is_private := (COALESCE(trim(lower(p_class_type)), 'group') = 'private');
  v_is_event := (COALESCE(trim(lower(p_class_type)), 'group') = 'event');

  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id LIMIT 1;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_is_private THEN
    v_effective_private := COALESCE(v_student.balance_private, 0);
    IF jsonb_array_length(COALESCE(v_student.active_packs, '[]'::jsonb)) > 0 THEN
      v_effective_private := GREATEST(v_effective_private, (SELECT COALESCE(SUM((elem->>'private_count')::int), 0)
        FROM jsonb_array_elements(v_student.active_packs) AS elem
        WHERE (elem->>'expires_at')::timestamptz IS NULL OR (elem->>'expires_at')::timestamptz > v_now));
    END IF;
    IF v_effective_private < p_count THEN
      RETURN;
    END IF;
  ELSIF v_is_event THEN
    v_effective_events := COALESCE(v_student.balance_events, 0);
    IF jsonb_array_length(COALESCE(v_student.active_packs, '[]'::jsonb)) > 0 THEN
      v_effective_events := GREATEST(v_effective_events, (SELECT COALESCE(SUM((elem->>'event_count')::int), 0)
        FROM jsonb_array_elements(v_student.active_packs) AS elem
        WHERE (elem->>'expires_at')::timestamptz IS NULL OR (elem->>'expires_at')::timestamptz > v_now));
    END IF;
    IF v_effective_events < p_count THEN
      RETURN;
    END IF;
  ELSE
    IF v_student.balance IS NULL THEN
      RETURN;
    END IF;
    v_effective_group := COALESCE(v_student.balance, 0);
    IF jsonb_array_length(COALESCE(v_student.active_packs, '[]'::jsonb)) > 0 THEN
      v_effective_group := GREATEST(v_effective_group, (SELECT COALESCE(SUM((elem->>'count')::int), 0)
        FROM jsonb_array_elements(v_student.active_packs) AS elem
        WHERE (elem->>'expires_at')::timestamptz IS NULL OR (elem->>'expires_at')::timestamptz > v_now));
    END IF;
    IF v_effective_group < p_count THEN
      RETURN;
    END IF;
  END IF;

  v_active_packs := COALESCE(v_student.active_packs, '[]'::jsonb);
  v_remaining := p_count;

  IF jsonb_array_length(v_active_packs) > 0 THEN
    FOR v_elem IN
      SELECT elem FROM jsonb_array_elements(v_active_packs) AS elem
      ORDER BY (elem->>'expires_at')::timestamptz NULLS LAST
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

      IF v_is_private THEN
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
      ELSIF v_is_event THEN
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

    IF v_is_private THEN
      v_new_balance_private := (SELECT COALESCE(SUM((elem->>'private_count')::int), 0)
        FROM jsonb_array_elements(v_new_packs) AS elem
        WHERE ((elem->>'expires_at')::timestamptz IS NULL OR (elem->>'expires_at')::timestamptz > v_now));
      v_target_balance_after := GREATEST(COALESCE(v_student.balance_private, 0) - p_count, 0);
      v_new_balance_private := GREATEST(v_new_balance_private, v_target_balance_after);
      UPDATE public.students
      SET balance_private = v_new_balance_private,
          active_packs = v_new_packs
      WHERE id::text = p_student_id AND school_id = p_school_id;
    ELSIF v_is_event THEN
      v_new_balance_events := (SELECT COALESCE(SUM((elem->>'event_count')::int), 0)
        FROM jsonb_array_elements(v_new_packs) AS elem
        WHERE ((elem->>'expires_at')::timestamptz IS NULL OR (elem->>'expires_at')::timestamptz > v_now));
      v_target_balance_after := GREATEST(COALESCE(v_student.balance_events, 0) - p_count, 0);
      v_new_balance_events := GREATEST(v_new_balance_events, v_target_balance_after);
      UPDATE public.students
      SET balance_events = v_new_balance_events,
          active_packs = v_new_packs
      WHERE id::text = p_student_id AND school_id = p_school_id;
    ELSE
      v_new_balance := (SELECT COALESCE(SUM((elem->>'count')::int), 0)
        FROM jsonb_array_elements(v_new_packs) AS elem
        WHERE ((elem->>'expires_at')::timestamptz IS NULL OR (elem->>'expires_at')::timestamptz > v_now));
      IF (SELECT COUNT(*) FROM jsonb_array_elements(v_new_packs) AS elem
          WHERE ((elem->>'expires_at')::timestamptz IS NULL OR (elem->>'expires_at')::timestamptz > v_now)
            AND (elem->>'count') IS NULL) > 0 THEN
        v_new_balance := NULL;
      ELSE
        v_target_balance_after := GREATEST(COALESCE(v_student.balance, 0) - p_count, 0);
        v_new_balance := GREATEST(v_new_balance, v_target_balance_after);
      END IF;
      UPDATE public.students
      SET balance = v_new_balance,
          active_packs = v_new_packs
      WHERE id::text = p_student_id AND school_id = p_school_id;
    END IF;
  ELSE
    IF v_is_private THEN
      v_new_balance_private := COALESCE(v_student.balance_private, 0) - p_count;
      UPDATE public.students
      SET balance_private = v_new_balance_private
      WHERE id::text = p_student_id AND school_id = p_school_id;
    ELSIF v_is_event THEN
      v_new_balance_events := COALESCE(v_student.balance_events, 0) - p_count;
      UPDATE public.students
      SET balance_events = v_new_balance_events
      WHERE id::text = p_student_id AND school_id = p_school_id;
    ELSE
      v_new_balance := (v_student.balance)::int - p_count;
      UPDATE public.students
      SET balance = v_new_balance
      WHERE id::text = p_student_id AND school_id = p_school_id;
    END IF;
  END IF;

  UPDATE public.students
  SET paid = public.student_has_usable_class_credits(balance, COALESCE(balance_private, 0), COALESCE(balance_events, 0), active_packs)
  WHERE id::text = p_student_id AND school_id = p_school_id;
END;
$$;

