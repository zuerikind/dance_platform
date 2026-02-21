-- Monthly class registration feature.
-- Allows students to sign up for all remaining occurrences of a class
-- within the current month (available during the first 2 weeks).

-- 1) Platform-level toggle on schools
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS monthly_registration_enabled boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.schools.monthly_registration_enabled
  IS 'When true, school can offer monthly class registration (school admin can toggle in Settings).';

-- 2) RPC for platform admin to toggle
CREATE OR REPLACE FUNCTION public.school_update_monthly_registration_enabled(
  p_school_id uuid,
  p_enabled boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.schools%ROWTYPE;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Permission denied: only platform admin can update school features.';
  END IF;
  UPDATE public.schools SET monthly_registration_enabled = p_enabled WHERE id = p_school_id
  RETURNING * INTO v_row;
  IF v_row IS NULL THEN
    RAISE EXCEPTION 'School not found.';
  END IF;
  RETURN to_jsonb(v_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.school_update_monthly_registration_enabled(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_update_monthly_registration_enabled(uuid, boolean) TO anon;

-- 3) Add is_monthly flag to class_registrations
ALTER TABLE public.class_registrations
  ADD COLUMN IF NOT EXISTS is_monthly boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.class_registrations.is_monthly
  IS 'True when registration was created via monthly batch signup.';

-- 4) Optional fixed expiry date on subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS expiry_date date DEFAULT NULL;

COMMENT ON COLUMN public.subscriptions.expiry_date
  IS 'When set, overrides validity_days for new purchases (fixed expiry).';

-- 5) Allow subscription_update_field to handle expiry_date
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
  ELSIF p_field = 'expiry_date' THEN
    IF p_value IS NULL OR trim(p_value) = '' THEN
      UPDATE public.subscriptions SET expiry_date = NULL WHERE id::text = p_id;
    ELSE
      UPDATE public.subscriptions SET expiry_date = (p_value::date) WHERE id::text = p_id;
    END IF;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.subscription_update_field(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.subscription_update_field(text, text, text) TO authenticated;

-- 6) Update activate_package_for_student to respect expiry_date
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
  v_days int;
  v_expiry timestamptz;
  v_active_packs jsonb;
  v_new_pack jsonb;
  v_new_balance numeric;
  v_new_balance_private int;
  v_new_balance_events int;
  v_is_unlimited_group boolean := false;
BEGIN
  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT * INTO v_sub FROM public.subscriptions WHERE name = p_sub_name AND school_id = p_school_id LIMIT 1;

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

  IF v_limit_group <= 0 AND v_limit_private <= 0 AND v_limit_events <= 0 THEN
    RETURN;
  END IF;

  -- Use fixed expiry_date if set, otherwise compute from validity_days
  IF v_sub.expiry_date IS NOT NULL THEN
    v_expiry := (v_sub.expiry_date::text || ' 23:59:59')::timestamptz;
  ELSE
    v_expiry := now() + (v_days || ' days')::interval;
  END IF;

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

COMMENT ON FUNCTION public.activate_package_for_student(text, text, uuid) IS 'Activate package. Respects expiry_date if set on subscription.';

-- 7) RPC: register_for_class_monthly (batch registration)
CREATE OR REPLACE FUNCTION public.register_for_class_monthly(
  p_student_id text,
  p_class_id bigint,
  p_school_id uuid,
  p_dates date[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_class public.classes%ROWTYPE;
  v_student public.students%ROWTYPE;
  v_count int;
  v_date date;
  v_effective_balance int;
  v_num_dates int;
  v_row public.class_registrations%ROWTYPE;
  v_results jsonb := '[]'::jsonb;
  v_pack jsonb;
  v_pack_count int;
BEGIN
  v_num_dates := array_length(p_dates, 1);
  IF v_num_dates IS NULL OR v_num_dates = 0 THEN
    RAISE EXCEPTION 'No dates provided.';
  END IF;

  SELECT * INTO v_class FROM public.classes WHERE id = p_class_id AND school_id = p_school_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Class not found.';
  END IF;

  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found.';
  END IF;

  IF NOT v_student.paid THEN
    RAISE EXCEPTION 'No active membership. Please purchase a plan first.';
  END IF;

  -- Check effective balance (group classes): student.balance + sum of active pack counts
  IF v_student.balance IS NOT NULL THEN
    v_effective_balance := COALESCE(v_student.balance, 0);
    -- Also count from active packs
    IF v_student.active_packs IS NOT NULL THEN
      FOR v_pack IN SELECT * FROM jsonb_array_elements(v_student.active_packs)
      LOOP
        IF (v_pack->>'expires_at')::timestamptz > now() THEN
          v_pack_count := COALESCE((v_pack->>'count')::int, 0);
          IF v_pack->>'count' IS NULL OR v_pack->>'count' = 'null' THEN
            v_effective_balance := NULL; -- unlimited
            EXIT;
          END IF;
        END IF;
      END LOOP;
    END IF;

    IF v_effective_balance IS NOT NULL AND v_effective_balance < v_num_dates THEN
      RAISE EXCEPTION 'Insufficient classes. You need % but only have %.', v_num_dates, v_effective_balance;
    END IF;
  END IF;
  -- balance IS NULL means unlimited, no check needed

  -- Check capacity and insert for each date
  FOREACH v_date IN ARRAY p_dates
  LOOP
    IF v_class.max_capacity IS NOT NULL THEN
      SELECT count(*) INTO v_count
      FROM public.class_registrations
      WHERE class_id = p_class_id
        AND class_date = v_date
        AND status = 'registered';

      IF v_count >= v_class.max_capacity THEN
        RAISE EXCEPTION 'Class is full on %. No spots available.', v_date;
      END IF;
    END IF;

    -- Re-use existing row if previously cancelled
    SELECT * INTO v_row
    FROM public.class_registrations
    WHERE class_id = p_class_id AND student_id = p_student_id AND class_date = v_date;

    IF FOUND THEN
      IF v_row.status = 'registered' THEN
        -- Already registered, skip
        v_results := v_results || to_jsonb(v_row);
        CONTINUE;
      END IF;
      UPDATE public.class_registrations
      SET status = 'registered', cancelled_at = NULL, is_monthly = true
      WHERE id = v_row.id
      RETURNING * INTO v_row;
    ELSE
      INSERT INTO public.class_registrations (class_id, student_id, school_id, class_date, status, is_monthly)
      VALUES (p_class_id, p_student_id, p_school_id, v_date, 'registered', true)
      RETURNING * INTO v_row;
    END IF;

    v_results := v_results || to_jsonb(v_row);
  END LOOP;

  RETURN v_results;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_for_class_monthly(text, bigint, uuid, date[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_for_class_monthly(text, bigint, uuid, date[]) TO anon;

-- 8) Update get_class_registrations_for_date to include is_monthly
CREATE OR REPLACE FUNCTION public.get_class_registrations_for_date(
  p_school_id uuid,
  p_class_date date
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
    SELECT cr.id, cr.class_id, cr.student_id, cr.class_date, cr.status, cr.deducted,
           cr.is_monthly,
           c.name AS class_name, c.time AS class_time,
           s.name AS student_name
    FROM public.class_registrations cr
    JOIN public.classes c ON c.id = cr.class_id
    JOIN public.students s ON s.id::text = cr.student_id
    WHERE cr.school_id = p_school_id
      AND cr.class_date = p_class_date
    ORDER BY c.time, s.name
  LOOP
    v_result := v_result || jsonb_build_object(
      'id', v_row.id,
      'class_id', v_row.class_id,
      'student_id', v_row.student_id,
      'class_date', v_row.class_date,
      'status', v_row.status,
      'deducted', v_row.deducted,
      'is_monthly', v_row.is_monthly,
      'class_name', v_row.class_name,
      'class_time', v_row.class_time,
      'student_name', v_row.student_name
    );
  END LOOP;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_class_registrations_for_date(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_class_registrations_for_date(uuid, date) TO anon;

-- 9) Update get_student_upcoming_registrations to include is_monthly
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

GRANT EXECUTE ON FUNCTION public.get_student_upcoming_registrations(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_upcoming_registrations(text, uuid) TO anon;
