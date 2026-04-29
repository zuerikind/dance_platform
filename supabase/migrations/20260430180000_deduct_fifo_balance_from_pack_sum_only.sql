-- deduct_student_classes: consume one FIFO chain of packs (soonest expires_at first, then created_at),
-- then set balance / balance_* ONLY from the sum of non-expired pack rows — never GREATEST() against
-- (old_balance - p_count), which could exceed the FIFO pack sum and make Math.max(balance, sumPacks)
-- look like "both packages" lost a class when only active_packs changed.

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
      UPDATE public.students
      SET balance_private = v_new_balance_private,
          active_packs = v_new_packs
      WHERE id::text = p_student_id AND school_id = p_school_id;
    ELSIF v_is_event THEN
      v_new_balance_events := (SELECT COALESCE(SUM((elem->>'event_count')::int), 0)
        FROM jsonb_array_elements(v_new_packs) AS elem
        WHERE ((elem->>'expires_at')::timestamptz IS NULL OR (elem->>'expires_at')::timestamptz > v_now));
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

COMMENT ON FUNCTION public.deduct_student_classes(text, uuid, int, text) IS 'Deduct group/private/event: FIFO by expires_at then created_at; balances mirror non-expired pack sums only.';
