-- Private classes dual count: separate group and private class balances.
-- balance/limit_count = group (0 = unlimited for group only)
-- balance_private/limit_count_private = private (always finite; 0 = zero)

-- 1) Schema: students.balance_private
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS balance_private int NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.students.balance_private IS 'Private classes remaining. Always finite; 0 = zero. Never unlimited.';

-- 2) Schema: subscriptions.limit_count_private
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS limit_count_private int NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.subscriptions.limit_count_private IS 'Private classes in package. 0 = none. Private classes are never unlimited.';

-- 3) deduct_student_classes: add p_class_type ('group' | 'private')
DROP FUNCTION IF EXISTS public.deduct_student_classes(text, uuid, int);

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
  v_deduct int;
  v_new_balance int;
  v_new_balance_private int;
  v_now timestamptz := now();
  v_expires_at timestamptz;
  v_is_private boolean;
BEGIN
  IF p_count IS NULL OR p_count < 1 THEN
    RETURN;
  END IF;
  v_is_private := (COALESCE(trim(lower(p_class_type)), 'group') = 'private');

  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id LIMIT 1;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_is_private THEN
    -- Private: balance_private is always finite
    IF COALESCE(v_student.balance_private, 0) < p_count THEN
      RETURN;
    END IF;
  ELSE
    -- Group: balance can be null (unlimited)
    IF v_student.balance IS NULL THEN
      RETURN;  /* unlimited: no deduction */
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
    ELSE
      v_new_balance := (SELECT COALESCE(SUM((elem->>'count')::int), 0)
        FROM jsonb_array_elements(v_new_packs) AS elem
        WHERE ((elem->>'expires_at')::timestamptz IS NULL OR (elem->>'expires_at')::timestamptz > v_now));
      -- For group unlimited: if any pack has count=null, balance stays null
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
    ELSE
      v_new_balance := (v_student.balance)::int - p_count;
      UPDATE public.students
      SET balance = v_new_balance
      WHERE id::text = p_student_id AND school_id = p_school_id;
    END IF;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.deduct_student_classes(text, uuid, int, text) IS 'Deduct group or private classes. p_class_type: group (default) or private.';

GRANT EXECUTE ON FUNCTION public.deduct_student_classes(text, uuid, int, text) TO anon;
GRANT EXECUTE ON FUNCTION public.deduct_student_classes(text, uuid, int, text) TO authenticated;

-- 4) mark_registration_attended: ensure it calls deduct with 'group'
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
BEGIN
  SELECT * INTO v_reg
  FROM public.class_registrations
  WHERE id = p_registration_id
    AND school_id = p_school_id
    AND status = 'registered';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found or not in registered status.';
  END IF;

  UPDATE public.class_registrations
  SET status = 'attended', deducted = true
  WHERE id = p_registration_id;

  PERFORM public.deduct_student_classes(v_reg.student_id, p_school_id, 1, 'group');
END;
$$;

-- 5) process_expired_registrations: ensure it calls deduct with 'group'
CREATE OR REPLACE FUNCTION public.process_expired_registrations(p_school_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg record;
  v_class_datetime timestamptz;
  v_processed int := 0;
BEGIN
  FOR v_reg IN
    SELECT cr.id, cr.student_id, cr.class_id, cr.class_date,
           c.time AS class_time
    FROM public.class_registrations cr
    JOIN public.classes c ON c.id = cr.class_id
    WHERE cr.school_id = p_school_id
      AND cr.status = 'registered'
      AND cr.deducted = false
  LOOP
    v_class_datetime := (v_reg.class_date || ' ' || coalesce(v_reg.class_time, '23:59'))::timestamptz;
    IF v_class_datetime <= now() THEN
      UPDATE public.class_registrations
      SET status = 'no_show', deducted = true
      WHERE id = v_reg.id;

      PERFORM public.deduct_student_classes(v_reg.student_id, p_school_id, 1, 'group');
      v_processed := v_processed + 1;
    END IF;
  END LOOP;
  RETURN v_processed;
END;
$$;

-- 6) apply_student_package: add p_balance_private (keep auth checks from rpc_authorization)
DROP FUNCTION IF EXISTS public.apply_student_package(text, numeric, jsonb, timestamptz, text, boolean);

CREATE OR REPLACE FUNCTION public.apply_student_package(
  p_student_id text,
  p_balance numeric,
  p_active_packs jsonb,
  p_package_expires_at timestamptz,
  p_package_name text,
  p_paid boolean,
  p_balance_private int DEFAULT 0
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
    active_packs = COALESCE(p_active_packs, '[]'::jsonb),
    package_expires_at = p_package_expires_at,
    package = p_package_name,
    paid = COALESCE(p_paid, false)
  WHERE id = p_student_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_student_package(text, numeric, jsonb, timestamptz, text, boolean, int) TO anon;
GRANT EXECUTE ON FUNCTION public.apply_student_package(text, numeric, jsonb, timestamptz, text, boolean, int) TO authenticated;

-- 7) activate_package_for_student: handle limit_count and limit_count_private
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
  v_is_unlimited_group boolean := false;
  v_days int;
  v_new_balance numeric;
  v_new_balance_private int;
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
    v_days := COALESCE((v_sub.validity_days)::int, 30);

    -- Private teacher: use limit_count_private only; limit_count ignored
    IF v_school.profile_type = 'private_teacher' THEN
      v_limit_group := 0;
      IF v_limit_private <= 0 THEN
        v_limit_private := COALESCE((v_sub.limit_count)::int, 1);
      END IF;
    ELSE
      IF v_limit_group <= 0 AND v_limit_private <= 0 THEN
        v_limit_group := 1;
      END IF;
      IF v_limit_group <= 0 THEN
        v_is_unlimited_group := true;
      END IF;
    END IF;
  ELSE
    v_limit_group := COALESCE((regexp_match(p_sub_name, '\d+'))[1]::int, 1);
    v_limit_private := 0;
    v_days := 30;
    IF v_limit_group <= 0 THEN
      v_limit_group := 1;
    END IF;
  END IF;

  IF v_limit_group <= 0 AND v_limit_private <= 0 THEN
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
      'expires_at', v_expiry,
      'created_at', now()
    );
    v_new_balance := COALESCE(v_student.balance, 0) + v_limit_group;
  END IF;

  v_new_balance_private := COALESCE(v_student.balance_private, 0) + v_limit_private;
  v_active_packs := v_active_packs || v_new_pack;

  UPDATE public.students
  SET
    balance = v_new_balance,
    balance_private = v_new_balance_private,
    active_packs = v_active_packs,
    package_expires_at = v_expiry,
    package = COALESCE(v_sub.name, p_sub_name),
    paid = true
  WHERE id::text = p_student_id AND school_id = p_school_id;
END;
$$;

COMMENT ON FUNCTION public.activate_package_for_student(text, text, uuid) IS 'Activate package. Group: limit_count=0 means unlimited. Private: limit_count_private always finite.';

-- 8) subscription_insert_for_school: add limit_count_private
DROP FUNCTION IF EXISTS public.subscription_insert_for_school(uuid, text, numeric, int, int);

CREATE OR REPLACE FUNCTION public.subscription_insert_for_school(
  p_school_id uuid,
  p_name text DEFAULT 'New Plan',
  p_price numeric DEFAULT 0,
  p_limit_count int DEFAULT 10,
  p_validity_days int DEFAULT 30,
  p_limit_count_private int DEFAULT 0
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
  BEGIN
    INSERT INTO public.subscriptions (id, school_id, name, price, limit_count, validity_days, limit_count_private)
    VALUES (v_id, p_school_id, coalesce(nullif(trim(p_name), ''), 'New Plan'), coalesce(p_price, 0),
            coalesce(p_limit_count, 10), coalesce(p_validity_days, 30), coalesce(p_limit_count_private, 0))
    RETURNING * INTO v_row;
  EXCEPTION
    WHEN undefined_column THEN
      INSERT INTO public.subscriptions (school_id, name, price, limit_count, validity_days)
      VALUES (p_school_id, coalesce(nullif(trim(p_name), ''), 'New Plan'), coalesce(p_price, 0),
              coalesce(p_limit_count, 10), coalesce(p_validity_days, 30))
      RETURNING * INTO v_row;
  END;
  RETURN to_jsonb(v_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.subscription_insert_for_school(uuid, text, numeric, int, int, int) TO anon;
GRANT EXECUTE ON FUNCTION public.subscription_insert_for_school(uuid, text, numeric, int, int, int) TO authenticated;

-- 9) subscription_update_field: add limit_count_private
CREATE OR REPLACE FUNCTION public.subscription_update_field(p_id text, p_field text, p_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_field = 'name' THEN
    UPDATE public.subscriptions SET name = p_value WHERE id::text = p_id;
  ELSIF p_field = 'price' THEN
    UPDATE public.subscriptions SET price = (p_value::numeric) WHERE id::text = p_id;
  ELSIF p_field = 'limit_count' THEN
    UPDATE public.subscriptions SET limit_count = (p_value::int) WHERE id::text = p_id;
  ELSIF p_field = 'limit_count_private' THEN
    UPDATE public.subscriptions SET limit_count_private = (p_value::int) WHERE id::text = p_id;
  ELSIF p_field = 'validity_days' THEN
    UPDATE public.subscriptions SET validity_days = (p_value::int) WHERE id::text = p_id;
  END IF;
END;
$$;

-- 10) Backfill: private teachers - set limit_count_private from limit_count
UPDATE public.subscriptions s
SET limit_count_private = s.limit_count, limit_count = 0
FROM public.schools sc
WHERE s.school_id = sc.id AND sc.profile_type = 'private_teacher'
  AND (s.limit_count_private IS NULL OR s.limit_count_private = 0)
  AND (s.limit_count IS NOT NULL AND s.limit_count > 0);
