-- Events in packages: same concept as private classes.
-- balance_events / limit_count_events / active_packs[].event_count;
-- deduct_student_classes accepts p_class_type = 'event'.

-- 1) Schema: students.balance_events
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS balance_events int NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.students.balance_events IS 'Event tokens remaining. Always finite; 0 = zero.';

-- 2) Schema: subscriptions.limit_count_events
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS limit_count_events int NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.subscriptions.limit_count_events IS 'Event tokens in package. 0 = none.';

-- 3) deduct_student_classes: extend p_class_type to 'group' | 'private' | 'event'
DROP FUNCTION IF EXISTS public.deduct_student_classes(text, uuid, int, text);

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
        IF v_cnt > 0 THEN
          v_new_packs := v_new_packs || jsonb_set(v_elem, '{count}', to_jsonb(v_cnt));
        ELSE
          v_new_packs := v_new_packs || v_elem;
        END IF;
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
END;
$$;

COMMENT ON FUNCTION public.deduct_student_classes(text, uuid, int, text) IS 'Deduct group, private, or event. p_class_type: group (default), private, or event.';

GRANT EXECUTE ON FUNCTION public.deduct_student_classes(text, uuid, int, text) TO anon;
GRANT EXECUTE ON FUNCTION public.deduct_student_classes(text, uuid, int, text) TO authenticated;

-- 4) apply_student_package: add p_balance_events
DROP FUNCTION IF EXISTS public.apply_student_package(text, numeric, jsonb, timestamptz, text, boolean, int);

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
BEGIN
  SELECT school_id INTO v_school_id FROM public.students WHERE id::text = p_student_id LIMIT 1;
  IF v_school_id IS NULL THEN
    RETURN;
  END IF;
  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;
  UPDATE public.students
  SET
    balance = p_balance,
    balance_private = COALESCE(p_balance_private, 0),
    balance_events = COALESCE(p_balance_events, 0),
    active_packs = COALESCE(p_active_packs, '[]'::jsonb),
    package_expires_at = p_package_expires_at,
    package = p_package_name,
    paid = COALESCE(p_paid, false)
  WHERE id = p_student_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_student_package(text, numeric, jsonb, timestamptz, text, boolean, int, int) TO anon;
GRANT EXECUTE ON FUNCTION public.apply_student_package(text, numeric, jsonb, timestamptz, text, boolean, int, int) TO authenticated;

-- 5) activate_package_for_student: handle limit_count_events
CREATE OR REPLACE FUNCTION public.activate_package_for_student(
  p_student_id text,
  p_sub_name text,
  p_school_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student public.students%ROWTYPE;
  v_sub public.subscriptions%ROWTYPE;
  v_school public.schools%ROWTYPE;
  v_limit_group int;
  v_limit_private int;
  v_limit_events int;
  v_is_unlimited_group boolean := false;
  v_days int;
  v_new_balance numeric;
  v_new_balance_private int;
  v_new_balance_events int;
  v_active_packs jsonb;
  v_new_pack jsonb;
  v_expiry timestamptz;
BEGIN
  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id LIMIT 1;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT * INTO v_sub FROM public.subscriptions
  WHERE school_id = p_school_id AND LOWER(TRIM(name)) = LOWER(TRIM(p_sub_name))
  LIMIT 1;

  SELECT * INTO v_school FROM public.schools WHERE id = p_school_id LIMIT 1;

  IF FOUND THEN
    v_limit_group := COALESCE((v_sub.limit_count)::int, 0);
    v_limit_private := COALESCE((v_sub.limit_count_private)::int, 0);
    v_limit_events := COALESCE((v_sub.limit_count_events)::int, 0);
    v_days := COALESCE((v_sub.validity_days)::int, 30);

    IF v_school.profile_type = 'private_teacher' THEN
      v_limit_group := 0;
      IF v_limit_private <= 0 THEN
        v_limit_private := COALESCE((v_sub.limit_count)::int, 1);
      END IF;
    ELSE
      -- Unlimited group only when 0 group AND 0 private AND 0 events. Events-only plans must not grant unlimited group/private.
      IF v_limit_group <= 0 AND v_limit_private <= 0 AND v_limit_events <= 0 THEN
        v_is_unlimited_group := true;
      END IF;
    END IF;
  ELSE
    v_limit_group := COALESCE((regexp_match(p_sub_name, '\d+'))[1]::int, 1);
    v_limit_private := 0;
    v_limit_events := 0;
    v_days := 30;
    IF v_limit_group <= 0 THEN
      v_limit_group := 1;
    END IF;
  END IF;

  -- Nothing to add (group+private+events all 0)
  IF v_limit_group <= 0 AND v_limit_private <= 0 AND v_limit_events <= 0 THEN
    RETURN;
  END IF;

  v_expiry := now() + (v_days || ' days')::interval;
  v_active_packs := COALESCE(v_student.active_packs, '[]'::jsonb);

  IF v_is_unlimited_group THEN
    v_new_pack := jsonb_build_object(
      'id', 'PACK-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)),
      'name', COALESCE(v_sub.name, p_sub_name),
      'count', NULL,
      'private_count', v_limit_private,
      'event_count', v_limit_events,
      'expires_at', v_expiry,
      'created_at', now()
    );
    v_new_balance := NULL;
  ELSE
    v_new_pack := jsonb_build_object(
      'id', 'PACK-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)),
      'name', COALESCE(v_sub.name, p_sub_name),
      'count', v_limit_group,
      'private_count', v_limit_private,
      'event_count', v_limit_events,
      'expires_at', v_expiry,
      'created_at', now()
    );
    v_new_balance := COALESCE(v_student.balance, 0) + v_limit_group;
  END IF;

  v_new_balance_private := COALESCE(v_student.balance_private, 0) + v_limit_private;
  v_new_balance_events := COALESCE(v_student.balance_events, 0) + v_limit_events;
  v_active_packs := v_active_packs || v_new_pack;

  UPDATE public.students
  SET
    balance = v_new_balance,
    balance_private = v_new_balance_private,
    balance_events = v_new_balance_events,
    active_packs = v_active_packs,
    package_expires_at = v_expiry,
    package = COALESCE(v_sub.name, p_sub_name),
    paid = true
  WHERE id::text = p_student_id AND school_id = p_school_id;
END;
$$;

COMMENT ON FUNCTION public.activate_package_for_student(text, text, uuid) IS 'Activate package. Group, private, events. event_count in pack; balance_events always finite.';

-- 6) subscription_insert_for_school: add p_limit_count_events
DROP FUNCTION IF EXISTS public.subscription_insert_for_school(uuid, text, numeric, int, int, int);

CREATE OR REPLACE FUNCTION public.subscription_insert_for_school(
  p_school_id uuid,
  p_name text DEFAULT 'New Plan',
  p_price numeric DEFAULT 0,
  p_limit_count int DEFAULT 10,
  p_validity_days int DEFAULT 30,
  p_limit_count_private int DEFAULT 0,
  p_limit_count_events int DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.subscriptions%ROWTYPE;
  v_id text;
BEGIN
  v_id := 'S' || floor(extract(epoch from now()) * 1000)::bigint::text;
  INSERT INTO public.subscriptions (id, school_id, name, price, limit_count, validity_days, limit_count_private, limit_count_events)
  VALUES (v_id, p_school_id, coalesce(nullif(trim(p_name), ''), 'New Plan'), coalesce(p_price, 0),
          coalesce(p_limit_count, 10), coalesce(p_validity_days, 30), coalesce(p_limit_count_private, 0), coalesce(p_limit_count_events, 0))
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.subscription_insert_for_school(uuid, text, numeric, int, int, int, int) TO anon;
GRANT EXECUTE ON FUNCTION public.subscription_insert_for_school(uuid, text, numeric, int, int, int, int) TO authenticated;

-- 7) subscription_update_field: add limit_count_events
CREATE OR REPLACE FUNCTION public.subscription_update_field(p_id text, p_field text, p_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
BEGIN
  SELECT school_id INTO v_school_id FROM public.subscriptions WHERE id::text = p_id LIMIT 1;
  IF v_school_id IS NULL THEN
    RETURN;
  END IF;
  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;
  IF p_field = 'name' THEN
    UPDATE public.subscriptions SET name = p_value WHERE id::text = p_id;
  ELSIF p_field = 'price' THEN
    UPDATE public.subscriptions SET price = (p_value::numeric) WHERE id::text = p_id;
  ELSIF p_field = 'limit_count' THEN
    UPDATE public.subscriptions SET limit_count = (p_value::int) WHERE id::text = p_id;
  ELSIF p_field = 'limit_count_private' THEN
    UPDATE public.subscriptions SET limit_count_private = (p_value::int) WHERE id::text = p_id;
  ELSIF p_field = 'limit_count_events' THEN
    UPDATE public.subscriptions SET limit_count_events = (p_value::int) WHERE id::text = p_id;
  ELSIF p_field = 'validity_days' THEN
    UPDATE public.subscriptions SET validity_days = (p_value::int) WHERE id::text = p_id;
  END IF;
END;
$$;
