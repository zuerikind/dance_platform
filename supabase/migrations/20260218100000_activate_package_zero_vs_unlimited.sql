-- Fix: 0 group = unlimited only when plan has no private classes (0 group + 0 private).
-- When plan has 0 group + N private (N>0), treat as private-only: grant 0 group, N private (no unlimited group).

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
      -- Unlimited group only when 0 group AND 0 private. 0 group + N private = private-only (no unlimited).
      IF v_limit_group <= 0 AND v_limit_private <= 0 THEN
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

COMMENT ON FUNCTION public.activate_package_for_student(text, text, uuid) IS 'Activate package. Group: limit_count=0 means unlimited only when limit_count_private=0; else 0 group = zero group (private-only). Private: limit_count_private always finite.';
