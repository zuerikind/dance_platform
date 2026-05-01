-- Phase 3: wrap legacy balance mutation RPCs to canonical internals.
-- Safety goals:
-- - Keep legacy signatures unchanged for existing live callers.
-- - Route balance writes through canonical mutation RPCs so ledger is written.
-- - Preserve non-balance legacy fields (profile/password/package/provenance updates).

-- -----------------------------------------------------------------------------
-- Legacy signature wrapper: update_student_details(...)
-- -----------------------------------------------------------------------------
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
  v_balance_updated jsonb;
  v_set_group boolean := p_balance IS NOT NULL;
  v_set_private boolean := p_balance_private IS NOT NULL;
  v_set_events boolean := p_balance_events IS NOT NULL;
BEGIN
  IF v_sid IS NULL OR p_school_id IS NULL THEN
    RETURN NULL;
  END IF;
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;

  SELECT user_id
  INTO v_user_id
  FROM public.students
  WHERE id = v_sid
    AND school_id = p_school_id
  LIMIT 1;

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
    WHERE id = v_sid
      AND school_id = p_school_id;
  END IF;

  -- Canonical balance mutation + ledger.
  IF v_set_group OR v_set_private OR v_set_events THEN
    SELECT public.admin_set_student_balances(
      p_student_id := v_sid,
      p_school_id := p_school_id,
      p_balance := p_balance,
      p_balance_private := p_balance_private,
      p_balance_events := p_balance_events,
      p_set_group := v_set_group,
      p_set_private := v_set_private,
      p_set_events := v_set_events,
      p_expected_updated_at := NULL,
      p_reason := 'legacy_update_student_details',
      p_idempotency_key := NULL,
      p_source_ref := NULL,
      p_metadata := jsonb_build_object('legacy_rpc', 'update_student_details')
    ) INTO v_balance_updated;
  END IF;

  UPDATE public.students
  SET
    package_expires_at = COALESCE(p_package_expires_at, package_expires_at),
    password = CASE WHEN p_password IS NOT NULL AND p_password <> '' THEN p_password ELSE password END,
    active_packs = CASE WHEN p_active_packs IS NOT NULL THEN p_active_packs ELSE active_packs END,
    paid = public.student_has_usable_class_credits_canonical(balance, COALESCE(balance_private, 0), COALESCE(balance_events, 0))
  WHERE id = v_sid
    AND school_id = p_school_id;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    RETURN NULL;
  END IF;

  SELECT to_jsonb(v.*)
  INTO v_updated
  FROM public.students_with_profile v
  WHERE v.id = v_sid
    AND v.school_id = p_school_id
  LIMIT 1;

  RETURN v_updated;
END;
$$;

COMMENT ON FUNCTION public.update_student_details(text, uuid, text, text, text, text, numeric, timestamptz, int, int, jsonb) IS
'Legacy-compatible wrapper: profile/pack fields update plus canonical balance mutation with ledger via admin_set_student_balances.';

-- -----------------------------------------------------------------------------
-- Legacy signature wrapper: apply_student_package(...)
-- -----------------------------------------------------------------------------
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
  SELECT school_id
  INTO v_school_id
  FROM public.students
  WHERE id::text = p_student_id
  LIMIT 1;

  IF v_school_id IS NULL THEN
    RETURN;
  END IF;
  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;

  PERFORM public.canonical_set_student_balances_snapshot(
    p_student_id := p_student_id,
    p_school_id := v_school_id,
    p_balance := p_balance,
    p_balance_private := COALESCE(p_balance_private, 0),
    p_balance_events := COALESCE(p_balance_events, 0),
    p_expected_updated_at := NULL,
    p_reason := 'legacy_apply_student_package',
    p_idempotency_key := NULL,
    p_source_ref := p_package_name,
    p_metadata := jsonb_build_object('legacy_rpc', 'apply_student_package')
  );

  -- Keep legacy package provenance fields.
  UPDATE public.students
  SET
    active_packs = COALESCE(p_active_packs, '[]'::jsonb),
    package_expires_at = p_package_expires_at,
    package = p_package_name,
    paid = public.student_has_usable_class_credits_canonical(balance, COALESCE(balance_private, 0), COALESCE(balance_events, 0))
  WHERE id = p_student_id;
END;
$$;

COMMENT ON FUNCTION public.apply_student_package(text, numeric, jsonb, timestamptz, text, boolean, int, int) IS
'Legacy-compatible wrapper: canonical snapshot balance set (ledgered) plus package provenance fields.';

GRANT EXECUTE ON FUNCTION public.update_student_details(text, uuid, text, text, text, text, numeric, timestamptz, int, int, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_student_package(text, numeric, jsonb, timestamptz, text, boolean, int, int) TO anon;
GRANT EXECUTE ON FUNCTION public.apply_student_package(text, numeric, jsonb, timestamptz, text, boolean, int, int) TO authenticated;
