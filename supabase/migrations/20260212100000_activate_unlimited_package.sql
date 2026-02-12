-- When limit_count is 0, treat as unlimited (balance = null, pack count = null).
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
  v_incoming_limit int;
  v_is_unlimited boolean := false;
  v_days int;
  v_new_balance numeric;
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

  IF FOUND THEN
    v_incoming_limit := COALESCE((v_sub.limit_count)::int, 0);
    v_days := COALESCE((v_sub.validity_days)::int, 30);
    IF v_incoming_limit <= 0 THEN
      v_is_unlimited := true;
    END IF;
  ELSE
    v_incoming_limit := COALESCE((regexp_match(p_sub_name, '\d+'))[1]::int, 1);
    v_days := 30;
    IF v_incoming_limit <= 0 THEN
      v_incoming_limit := 1;
    END IF;
  END IF;

  /* Subscription not found and no valid limit: skip */
  IF NOT FOUND AND v_incoming_limit <= 0 THEN
    RETURN;
  END IF;

  v_expiry := now() + (v_days || ' days')::interval;
  v_active_packs := COALESCE(v_student.active_packs, '[]'::jsonb);

  IF v_is_unlimited THEN
    v_new_balance := NULL;
    v_new_pack := jsonb_build_object(
      'id', 'PACK-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)),
      'name', COALESCE(v_sub.name, p_sub_name),
      'count', NULL,
      'expires_at', v_expiry,
      'created_at', now()
    );
  ELSE
    v_new_pack := jsonb_build_object(
      'id', 'PACK-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)),
      'name', COALESCE(v_sub.name, p_sub_name),
      'count', v_incoming_limit,
      'expires_at', v_expiry,
      'created_at', now()
    );
    IF v_student.balance IS NULL THEN
      v_new_balance := v_incoming_limit;
    ELSE
      v_new_balance := v_student.balance + v_incoming_limit;
    END IF;
  END IF;

  v_active_packs := v_active_packs || v_new_pack;

  UPDATE public.students
  SET
    balance = v_new_balance,
    active_packs = v_active_packs,
    package_expires_at = v_expiry,
    package = COALESCE(v_sub.name, p_sub_name),
    paid = true
  WHERE id::text = p_student_id;
END;
$$;

COMMENT ON FUNCTION public.activate_package_for_student(text, text, uuid) IS 'Activate package for student. limit_count=0 means unlimited (balance null).';
