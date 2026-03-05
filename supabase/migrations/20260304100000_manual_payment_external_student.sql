-- Manual payments: allow "external student" (not in students list) with a free-text name.
-- 1) Add column to store external student name when student_id is NULL.
ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS external_student_name text;

COMMENT ON COLUMN public.payment_requests.external_student_name IS 'When set, student_id is NULL: manual payment for a non-registered (external) student.';

-- 2) Allow student_id to be NULL for external-student payments.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payment_requests' AND column_name = 'student_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.payment_requests ALTER COLUMN student_id DROP NOT NULL;
  END IF;
END $$;

-- 3) Replace admin_create_manual_payment: add optional p_external_student_name (one signature only).
DROP FUNCTION IF EXISTS public.admin_create_manual_payment(uuid, text, text, numeric, text, timestamptz);

CREATE OR REPLACE FUNCTION public.admin_create_manual_payment(
  p_school_id uuid,
  p_student_id text,
  p_sub_name text,
  p_price numeric,
  p_payment_method text DEFAULT 'cash',
  p_created_at timestamptz DEFAULT now(),
  p_external_student_name text DEFAULT NULL
)
RETURNS public.payment_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.payment_requests;
  v_external_name text;
  v_use_external boolean;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;
  IF p_price IS NULL OR p_price < 0 THEN
    RETURN NULL;
  END IF;

  v_external_name := nullif(trim(p_external_student_name), '');
  v_use_external := (v_external_name IS NOT NULL AND v_external_name <> '');

  IF v_use_external THEN
    -- External student: no student_id, require name.
    NULL; -- validated
  ELSIF p_student_id IS NULL OR trim(p_student_id) = '' THEN
    RETURN NULL;
  ELSIF NOT EXISTS (SELECT 1 FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id LIMIT 1) THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.payment_requests (
    student_id,
    external_student_name,
    sub_id,
    sub_name,
    price,
    payment_method,
    school_id,
    status,
    created_at
  )
  VALUES (
    CASE WHEN v_use_external THEN NULL ELSE p_student_id END,
    CASE WHEN v_use_external THEN v_external_name ELSE NULL END,
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

COMMENT ON FUNCTION public.admin_create_manual_payment(uuid, text, text, numeric, text, timestamptz, text) IS 'Admin-only: create an approved manual payment. Use p_external_student_name for payments from non-registered (external) students.';

GRANT EXECUTE ON FUNCTION public.admin_create_manual_payment(uuid, text, text, numeric, text, timestamptz, text) TO authenticated;
