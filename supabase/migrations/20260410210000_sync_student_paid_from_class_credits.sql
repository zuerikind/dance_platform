-- Keep students.paid aligned with "has usable class credits" (group / private / event),
-- matching frontend getEffectiveBalances (incl. all packs expired => ignore stale balances).

CREATE OR REPLACE FUNCTION public.student_has_usable_class_credits(
  p_balance numeric,
  p_balance_private int,
  p_balance_events int,
  p_active_packs jsonb
) RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_elem jsonb;
  v_had_any boolean := false;
  v_active_rows int := 0;
  v_exp timestamptz;
  v_cnt text;
  v_has_unlimited boolean := false;
  v_sum_group int := 0;
  v_sum_priv int := 0;
  v_sum_ev int := 0;
  v_packs_fully_expired boolean;
  v_group_unlimited boolean;
BEGIN
  IF p_active_packs IS NOT NULL AND jsonb_typeof(p_active_packs) = 'array' THEN
    FOR v_elem IN SELECT value FROM jsonb_array_elements(p_active_packs) AS t(value)
    LOOP
      v_had_any := true;
      v_exp := NULL;
      IF v_elem->>'expires_at' IS NOT NULL AND trim(v_elem->>'expires_at') <> '' THEN
        BEGIN
          v_exp := (v_elem->>'expires_at')::timestamptz;
        EXCEPTION WHEN OTHERS THEN
          v_exp := NULL;
        END;
      END IF;
      IF v_exp IS NOT NULL AND v_exp <= v_now THEN
        CONTINUE;
      END IF;

      v_active_rows := v_active_rows + 1;
      v_cnt := v_elem->>'count';
      IF v_cnt IS NULL OR lower(trim(v_cnt)) = 'null' OR trim(v_cnt) = '' THEN
        v_has_unlimited := true;
      ELSE
        v_sum_group := v_sum_group + COALESCE(v_cnt::int, 0);
      END IF;
      v_sum_priv := v_sum_priv + COALESCE(NULLIF(trim(v_elem->>'private_count'), '')::int, 0);
      v_sum_ev := v_sum_ev + COALESCE(NULLIF(trim(v_elem->>'event_count'), '')::int, 0);
    END LOOP;
  END IF;

  v_packs_fully_expired := v_had_any AND v_active_rows = 0;

  v_group_unlimited := NOT v_packs_fully_expired AND (p_balance IS NULL OR v_has_unlimited);
  IF v_group_unlimited THEN
    RETURN true;
  END IF;

  IF v_packs_fully_expired THEN
    RETURN false;
  END IF;

  IF GREATEST(COALESCE(p_balance, 0), v_sum_group::numeric) > 0 THEN
    RETURN true;
  END IF;
  IF GREATEST(COALESCE(p_balance_private, 0), v_sum_priv) > 0 THEN
    RETURN true;
  END IF;
  IF GREATEST(COALESCE(p_balance_events, 0), v_sum_ev) > 0 THEN
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

COMMENT ON FUNCTION public.student_has_usable_class_credits(numeric, int, int, jsonb) IS 'True if student has unlimited group or any positive effective group/private/event credits (non-expired packs; stale balances ignored when all packs expired).';

GRANT EXECUTE ON FUNCTION public.student_has_usable_class_credits(numeric, int, int, jsonb) TO authenticated;

-- update_student_details: set paid after profile + student field updates
DROP FUNCTION IF EXISTS public.update_student_details(text, uuid, text, text, text, text, numeric, timestamptz, int, int, jsonb);

CREATE OR REPLACE FUNCTION public.update_student_details(
  p_student_id text,
  p_school_id uuid,
  p_name text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_password text DEFAULT NULL,
  p_balance numeric DEFAULT NULL,
  p_package_expires_at timestamptz DEFAULT NULL,
  p_balance_private int DEFAULT NULL,
  p_balance_events int DEFAULT NULL,
  p_active_packs jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_sid text := nullif(trim(p_student_id), '');
  v_updated jsonb;
  v_rows int;
BEGIN
  IF v_sid IS NULL OR p_school_id IS NULL THEN
    RETURN NULL;
  END IF;
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;

  SELECT user_id INTO v_user_id FROM public.students WHERE id = v_sid AND school_id = p_school_id LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF v_user_id IS NOT NULL THEN
    UPDATE public.student_profiles
    SET
      name = COALESCE(nullif(trim(p_name), ''), name),
      email = CASE WHEN p_email IS NOT NULL THEN nullif(trim(p_email), '') ELSE email END,
      phone = COALESCE(p_phone, phone),
      updated_at = now()
    WHERE user_id = v_user_id;
  ELSE
    UPDATE public.students
    SET
      name = COALESCE(nullif(trim(p_name), ''), name),
      email = CASE WHEN p_email IS NOT NULL THEN nullif(trim(p_email), '') ELSE email END,
      phone = COALESCE(p_phone, phone)
    WHERE id = v_sid AND school_id = p_school_id;
  END IF;

  UPDATE public.students
  SET
    balance = CASE WHEN p_balance IS NOT NULL THEN p_balance::numeric ELSE balance END,
    package_expires_at = COALESCE(p_package_expires_at, package_expires_at),
    password = CASE WHEN p_password IS NOT NULL AND p_password <> '' THEN p_password ELSE password END,
    balance_private = CASE WHEN p_balance_private IS NOT NULL THEN p_balance_private ELSE balance_private END,
    balance_events = CASE WHEN p_balance_events IS NOT NULL THEN p_balance_events ELSE balance_events END,
    active_packs = CASE WHEN p_active_packs IS NOT NULL THEN p_active_packs ELSE active_packs END
  WHERE id = v_sid AND school_id = p_school_id;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    RETURN NULL;
  END IF;

  UPDATE public.students
  SET paid = public.student_has_usable_class_credits(balance, COALESCE(balance_private, 0), COALESCE(balance_events, 0), active_packs)
  WHERE id = v_sid AND school_id = p_school_id;

  SELECT to_jsonb(v.*) INTO v_updated
  FROM public.students_with_profile v
  WHERE v.id = v_sid AND v.school_id = p_school_id
  LIMIT 1;
  RETURN v_updated;
END;
$$;

COMMENT ON FUNCTION public.update_student_details(text, uuid, text, text, text, text, numeric, timestamptz, int, int, jsonb) IS 'Update student details; syncs paid from class credits; optional p_active_packs.';

GRANT EXECUTE ON FUNCTION public.update_student_details(text, uuid, text, text, text, text, numeric, timestamptz, int, int, jsonb) TO authenticated;

-- apply_student_package: paid follows credits, not client flag
CREATE OR REPLACE FUNCTION public.apply_student_package(
  p_student_id text,
  p_balance numeric,
  p_active_packs jsonb,
  p_package_expires_at timestamptz,
  p_package_name text,
  p_paid boolean,
  p_balance_private int DEFAULT 0,
  p_balance_events int DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
  v_paid boolean;
BEGIN
  SELECT school_id INTO v_school_id FROM public.students WHERE id::text = p_student_id LIMIT 1;
  IF v_school_id IS NULL THEN
    RETURN;
  END IF;
  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;

  v_paid := public.student_has_usable_class_credits(
    p_balance,
    COALESCE(p_balance_private, 0),
    COALESCE(p_balance_events, 0),
    COALESCE(p_active_packs, '[]'::jsonb)
  );

  UPDATE public.students
  SET
    balance = p_balance,
    balance_private = COALESCE(p_balance_private, 0),
    balance_events = COALESCE(p_balance_events, 0),
    active_packs = COALESCE(p_active_packs, '[]'::jsonb),
    package_expires_at = p_package_expires_at,
    package = p_package_name,
    paid = v_paid
  WHERE id = p_student_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_student_package(text, numeric, jsonb, timestamptz, text, boolean, int, int) TO anon;
GRANT EXECUTE ON FUNCTION public.apply_student_package(text, numeric, jsonb, timestamptz, text, boolean, int, int) TO authenticated;

-- deduct_student_classes: sync paid after deduction
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
    IF v_student.balance < p_count THEN
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

COMMENT ON FUNCTION public.deduct_student_classes(text, uuid, int, text) IS 'Deduct group, private, or event; syncs paid from remaining credits.';

-- One-time backfill
UPDATE public.students s
SET paid = public.student_has_usable_class_credits(s.balance, COALESCE(s.balance_private, 0), COALESCE(s.balance_events, 0), s.active_packs);
