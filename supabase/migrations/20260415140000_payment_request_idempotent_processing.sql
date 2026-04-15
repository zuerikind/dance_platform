-- Idempotent processing for payment request approvals/rejections.
-- Keeps legacy RPCs for compatibility; frontend should call this function first.

CREATE OR REPLACE FUNCTION public.process_payment_request_once(
  p_request_id bigint,
  p_status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req public.payment_requests%ROWTYPE;
  v_next_status text;
  v_updated boolean := false;
  v_activated boolean := false;
BEGIN
  v_next_status := lower(trim(coalesce(p_status, '')));
  IF v_next_status NOT IN ('approved', 'rejected') THEN
    RETURN jsonb_build_object(
      'ok', false,
      'updated', false,
      'activated', false,
      'error', 'invalid_status'
    );
  END IF;

  SELECT *
  INTO v_req
  FROM public.payment_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'updated', false,
      'activated', false,
      'error', 'not_found'
    );
  END IF;

  IF NOT (public.is_school_admin(v_req.school_id) OR public.is_platform_admin()) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'updated', false,
      'activated', false,
      'error', 'unauthorized',
      'request_id', v_req.id,
      'previous_status', v_req.status,
      'current_status', v_req.status
    );
  END IF;

  -- Idempotency guard: only allow one transition from pending.
  IF coalesce(v_req.status, '') <> 'pending' THEN
    RETURN jsonb_build_object(
      'ok', true,
      'updated', false,
      'activated', false,
      'request_id', v_req.id,
      'previous_status', v_req.status,
      'current_status', v_req.status
    );
  END IF;

  UPDATE public.payment_requests
  SET status = v_next_status
  WHERE id = v_req.id;
  v_updated := true;

  IF v_next_status = 'approved'
     AND v_req.student_id IS NOT NULL
     AND coalesce(trim(v_req.sub_name), '') <> ''
  THEN
    PERFORM public.activate_package_for_student(
      v_req.student_id,
      v_req.sub_name,
      v_req.school_id
    );
    v_activated := true;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'updated', v_updated,
    'activated', v_activated,
    'request_id', v_req.id,
    'previous_status', 'pending',
    'current_status', v_next_status
  );
END;
$$;

COMMENT ON FUNCTION public.process_payment_request_once(bigint, text)
IS 'Idempotent payment request processor. Transitions pending->approved/rejected once; approval activates package atomically.';

GRANT EXECUTE ON FUNCTION public.process_payment_request_once(bigint, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_payment_request_once(bigint, text) TO anon;

