-- Admin-only: create a manual payment (e.g. cash received) and insert as approved.
-- Does not overload create_payment_request; separate RPC for admin manual entry.
CREATE OR REPLACE FUNCTION public.admin_create_manual_payment(
  p_school_id uuid,
  p_student_id text,
  p_sub_name text,
  p_price numeric,
  p_payment_method text DEFAULT 'cash',
  p_created_at timestamptz DEFAULT now()
)
RETURNS public.payment_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.payment_requests;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;
  IF p_student_id IS NULL OR trim(p_student_id) = '' OR p_price IS NULL OR p_price < 0 THEN
    RETURN NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id LIMIT 1) THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.payment_requests (
    student_id,
    sub_id,
    sub_name,
    price,
    payment_method,
    school_id,
    status,
    created_at
  )
  VALUES (
    p_student_id,
    NULL,
    COALESCE(nullif(trim(p_sub_name), ''), 'Manual payment'),
    p_price,
    COALESCE(nullif(trim(lower(p_payment_method)), ''), 'cash'),
    p_school_id,
    'approved',
    COALESCE(p_created_at, now())
  )
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

COMMENT ON FUNCTION public.admin_create_manual_payment(uuid, text, text, numeric, text, timestamptz) IS 'Admin-only: create an approved manual payment (e.g. cash).';

GRANT EXECUTE ON FUNCTION public.admin_create_manual_payment(uuid, text, text, numeric, text, timestamptz) TO authenticated;
