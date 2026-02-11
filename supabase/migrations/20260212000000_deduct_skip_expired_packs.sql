-- Deduct classes: only use active (non-expired) packs. Keep expired packs for display.
CREATE OR REPLACE FUNCTION public.deduct_student_classes(
  p_student_id text,
  p_school_id uuid,
  p_count int
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
  v_deduct int;
  v_new_balance int;
  v_now timestamptz := now();
  v_expires_at timestamptz;
BEGIN
  IF p_count IS NULL OR p_count < 1 THEN
    RETURN;
  END IF;
  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id LIMIT 1;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  IF v_student.balance IS NULL THEN
    RETURN;  /* unlimited: no deduction */
  END IF;
  IF v_student.balance < p_count THEN
    RETURN;  /* not enough */
  END IF;

  v_active_packs := COALESCE(v_student.active_packs, '[]'::jsonb);
  v_remaining := p_count;

  IF jsonb_array_length(v_active_packs) > 0 THEN
    /* Consume p_count from active packs only (expires_at > now). Soonest-expiring first. Keep expired for display. */
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
      END IF;
    END LOOP;
    v_new_balance := (SELECT COALESCE(SUM((elem->>'count')::int), 0)
      FROM jsonb_array_elements(v_new_packs) AS elem
      WHERE ((elem->>'expires_at')::timestamptz IS NULL OR (elem->>'expires_at')::timestamptz > v_now));
  ELSE
    v_new_balance := (v_student.balance)::int - p_count;
  END IF;

  UPDATE public.students
  SET
    balance = v_new_balance,
    active_packs = CASE WHEN jsonb_array_length(v_active_packs) > 0 THEN v_new_packs ELSE active_packs END
  WHERE id::text = p_student_id AND school_id = p_school_id;
END;
$$;

COMMENT ON FUNCTION public.deduct_student_classes(text, uuid, int) IS 'Deduct classes from active (non-expired) packs only; used when admin scans QR.';
