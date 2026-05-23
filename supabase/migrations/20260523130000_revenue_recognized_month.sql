-- Aure Ganancias: revenue recognized month (America/Mexico_City last-7-days rule for group packages).
-- Non-Aure: column stays NULL; KPI RPC keeps filtering by created_at.

ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS revenue_recognized_month date;

COMMENT ON COLUMN public.payment_requests.revenue_recognized_month IS
  'First day of calendar month when revenue counts in Ganancias (Aure). Set on approve/manual insert; NULL for other schools.';

-- Match subscription by sub_id or sub_name for classification.
CREATE OR REPLACE FUNCTION public.compute_aure_revenue_recognized_month(
  p_school_id uuid,
  p_sub_id text,
  p_sub_name text,
  p_created_at timestamptz
)
RETURNS date
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_aure_id uuid := '38e570f9-5ca0-435e-8e99-70ebb5ae3b64'::uuid;
  v_mx_date date;
  v_day int;
  v_dim int;
  v_y int;
  v_m int;
  v_sub public.subscriptions%ROWTYPE;
  v_name text;
  v_is_suelta boolean := false;
  v_is_private_only boolean := false;
  v_shift boolean := false;
BEGIN
  IF p_school_id IS DISTINCT FROM v_aure_id OR p_created_at IS NULL THEN
    RETURN NULL;
  END IF;

  v_mx_date := (p_created_at AT TIME ZONE 'America/Mexico_City')::date;
  v_y := EXTRACT(YEAR FROM v_mx_date)::int;
  v_m := EXTRACT(MONTH FROM v_mx_date)::int;
  v_day := EXTRACT(DAY FROM v_mx_date)::int;
  v_dim := EXTRACT(DAY FROM (date_trunc('month', v_mx_date::timestamp) + interval '1 month' - interval '1 day'))::int;

  v_name := lower(trim(coalesce(p_sub_name, '')));

  IF p_sub_id IS NOT NULL AND trim(p_sub_id) <> '' THEN
    SELECT * INTO v_sub
    FROM public.subscriptions s
    WHERE s.school_id = p_school_id AND s.id::text = trim(p_sub_id)
    LIMIT 1;
  END IF;

  IF NOT FOUND AND v_name <> '' THEN
    SELECT * INTO v_sub
    FROM public.subscriptions s
    WHERE s.school_id = p_school_id AND lower(trim(s.name)) = v_name
    LIMIT 1;
  END IF;

  IF FOUND THEN
    v_is_suelta := (v_sub.limit_count = 1);
    v_is_private_only := (
      coalesce(v_sub.limit_count_private, 0) > 0
      AND coalesce(v_sub.limit_count, 0) = 0
    );
  END IF;

  IF NOT v_is_suelta AND v_name <> '' THEN
    v_is_suelta := (
      v_name ~ '(^|\s)1\s*clase'
      OR v_name ~ 'clase\s*suelta'
      OR v_name ~ 'single\s*class'
    );
  END IF;

  IF NOT v_is_suelta AND NOT v_is_private_only THEN
    v_shift := (v_day > v_dim - 7);
  END IF;

  IF v_shift THEN
    RETURN (date_trunc('month', v_mx_date) + interval '1 month')::date;
  END IF;

  RETURN date_trunc('month', v_mx_date)::date;
END;
$$;

COMMENT ON FUNCTION public.compute_aure_revenue_recognized_month(uuid, text, text, timestamptz)
  IS 'Aure only: Ganancias month from CDMX created_at + package type (last 7 days of month shifts group packages to next month).';

-- Effective date for KPI range: Aure uses recognized month; others use created_at::date.
CREATE OR REPLACE FUNCTION public.payment_revenue_effective_date(
  p_school_id uuid,
  p_revenue_recognized_month date,
  p_sub_id text,
  p_sub_name text,
  p_created_at timestamptz
)
RETURNS date
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_school_id = '38e570f9-5ca0-435e-8e99-70ebb5ae3b64'::uuid THEN
      coalesce(
        p_revenue_recognized_month,
        public.compute_aure_revenue_recognized_month(p_school_id, p_sub_id, p_sub_name, p_created_at)
      )
    ELSE p_created_at::date
  END;
$$;

-- Aure: payment counts in [p_start, p_end] when recognized month overlaps the filter window.
CREATE OR REPLACE FUNCTION public.payment_in_revenue_range(
  p_school_id uuid,
  p_revenue_recognized_month date,
  p_sub_id text,
  p_sub_name text,
  p_created_at timestamptz,
  p_start date,
  p_end date
)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_start IS NULL AND p_end IS NULL THEN true
    WHEN p_school_id = '38e570f9-5ca0-435e-8e99-70ebb5ae3b64'::uuid THEN (
      coalesce(
        p_revenue_recognized_month,
        public.compute_aure_revenue_recognized_month(p_school_id, p_sub_id, p_sub_name, p_created_at)
      ) IS NOT NULL
      AND (p_start IS NULL OR (
        coalesce(
          p_revenue_recognized_month,
          public.compute_aure_revenue_recognized_month(p_school_id, p_sub_id, p_sub_name, p_created_at)
        ) + interval '1 month' - interval '1 day'
      )::date >= p_start)
      AND (p_end IS NULL OR coalesce(
        p_revenue_recognized_month,
        public.compute_aure_revenue_recognized_month(p_school_id, p_sub_id, p_sub_name, p_created_at)
      ) <= p_end)
    )
    ELSE (
      (p_start IS NULL OR p_created_at::date >= p_start)
      AND (p_end IS NULL OR p_created_at::date <= p_end)
    )
  END;
$$;

-- Backfill Aure approved payments.
UPDATE public.payment_requests pr
SET revenue_recognized_month = public.compute_aure_revenue_recognized_month(
  pr.school_id,
  pr.sub_id,
  pr.sub_name,
  pr.created_at
)
WHERE pr.school_id = '38e570f9-5ca0-435e-8e99-70ebb5ae3b64'::uuid
  AND pr.status = 'approved'
  AND pr.revenue_recognized_month IS NULL;

-- Idempotent approve: set recognized month on Aure approval.
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
  v_recognized date;
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

  v_recognized := NULL;
  IF v_next_status = 'approved'
     AND v_req.school_id = '38e570f9-5ca0-435e-8e99-70ebb5ae3b64'::uuid
  THEN
    v_recognized := public.compute_aure_revenue_recognized_month(
      v_req.school_id,
      v_req.sub_id,
      v_req.sub_name,
      v_req.created_at
    );
  END IF;

  UPDATE public.payment_requests
  SET
    status = v_next_status,
    revenue_recognized_month = CASE
      WHEN v_recognized IS NOT NULL THEN v_recognized
      ELSE revenue_recognized_month
    END
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

-- Manual payment: set recognized month for Aure on insert.
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
  v_created timestamptz;
  v_recognized date;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;
  IF p_price IS NULL OR p_price < 0 THEN
    RETURN NULL;
  END IF;

  v_external_name := nullif(trim(p_external_student_name), '');
  v_use_external := (v_external_name IS NOT NULL AND v_external_name <> '');
  v_created := coalesce(p_created_at, now());

  IF v_use_external THEN
    NULL;
  ELSIF p_student_id IS NULL OR trim(p_student_id) = '' THEN
    RETURN NULL;
  ELSIF NOT EXISTS (SELECT 1 FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id LIMIT 1) THEN
    RETURN NULL;
  END IF;

  v_recognized := public.compute_aure_revenue_recognized_month(
    p_school_id,
    NULL,
    p_sub_name,
    v_created
  );

  INSERT INTO public.payment_requests (
    student_id,
    external_student_name,
    sub_id,
    sub_name,
    price,
    payment_method,
    school_id,
    status,
    created_at,
    revenue_recognized_month
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
    v_created,
    v_recognized
  )
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

-- KPI summary: Aure filters by recognized month overlap; others unchanged.
CREATE OR REPLACE FUNCTION public.get_school_kpi_summary(
  p_school_id uuid,
  p_start date DEFAULT NULL,
  p_end date DEFAULT NULL,
  p_include_registrations boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_approved numeric := 0;
  v_pending numeric := 0;
  v_approved_count int := 0;
  v_pending_count int := 0;
  v_by_package jsonb := '[]'::jsonb;
  v_cash numeric := 0;
  v_transfer numeric := 0;
  v_pending_suelta int := 0;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN '{}'::jsonb;
  END IF;

  SELECT
    COALESCE(SUM(CASE WHEN pr.status = 'approved' THEN pr.price ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN pr.status = 'pending' THEN pr.price ELSE 0 END), 0),
    COUNT(*) FILTER (WHERE pr.status = 'approved'),
    COUNT(*) FILTER (WHERE pr.status = 'pending')
  INTO v_approved, v_pending, v_approved_count, v_pending_count
  FROM public.payment_requests pr
  WHERE pr.school_id = p_school_id
    AND public.payment_in_revenue_range(
      pr.school_id,
      pr.revenue_recognized_month,
      pr.sub_id,
      pr.sub_name,
      pr.created_at,
      p_start,
      p_end
    );

  SELECT COALESCE(jsonb_agg(row ORDER BY (row->>'total')::numeric DESC), '[]'::jsonb)
  INTO v_by_package
  FROM (
    SELECT jsonb_build_object(
      'sub_name', sub_name,
      'total', total,
      'count', cnt
    ) AS row
    FROM (
      SELECT COALESCE(NULLIF(trim(pr.sub_name), ''), '—') AS sub_name,
             SUM(pr.price) AS total,
             COUNT(*)::int AS cnt
      FROM public.payment_requests pr
      WHERE pr.school_id = p_school_id
        AND pr.status = 'approved'
        AND public.payment_in_revenue_range(
          pr.school_id,
          pr.revenue_recognized_month,
          pr.sub_id,
          pr.sub_name,
          pr.created_at,
          p_start,
          p_end
        )
      GROUP BY COALESCE(NULLIF(trim(pr.sub_name), ''), '—')
      ORDER BY total DESC
      LIMIT 3
    ) top3
  ) wrapped;

  SELECT
    COALESCE(SUM(CASE WHEN pr.payment_method = 'cash' AND pr.status = 'approved' THEN pr.price ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN pr.payment_method = 'transfer' AND pr.status = 'approved' THEN pr.price ELSE 0 END), 0)
  INTO v_cash, v_transfer
  FROM public.payment_requests pr
  WHERE pr.school_id = p_school_id
    AND pr.status = 'approved'
    AND public.payment_in_revenue_range(
      pr.school_id,
      pr.revenue_recognized_month,
      pr.sub_id,
      pr.sub_name,
      pr.created_at,
      p_start,
      p_end
    );

  IF p_include_registrations AND p_school_id = '38e570f9-5ca0-435e-8e99-70ebb5ae3b64'::uuid THEN
    SELECT COUNT(*)::int INTO v_pending_suelta
    FROM public.class_registrations cr
    WHERE cr.school_id = p_school_id
      AND cr.status = 'pending'
      AND COALESCE(cr.is_monthly, false) = false
      AND (p_start IS NULL OR cr.class_date >= p_start)
      AND (p_end IS NULL OR cr.class_date <= p_end);
  END IF;

  v_result := jsonb_build_object(
    'revenue_approved', v_approved,
    'revenue_pending', v_pending,
    'approved_count', v_approved_count,
    'pending_count', v_pending_count,
    'avg_ticket', CASE WHEN v_approved_count > 0 THEN round(v_approved / v_approved_count, 2) ELSE 0 END,
    'by_package', v_by_package,
    'by_method', jsonb_build_object('cash', v_cash, 'transfer', v_transfer),
    'registrations', jsonb_build_object('pending_suelta_count', v_pending_suelta)
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_school_kpi_summary(uuid, date, date, boolean)
  IS 'Admin KPI aggregates: Aure Ganancias uses revenue_recognized_month (CDMX rules); other schools use created_at.';

GRANT EXECUTE ON FUNCTION public.compute_aure_revenue_recognized_month(uuid, text, text, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.payment_in_revenue_range(uuid, date, text, text, timestamptz, date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_payment_request_once(bigint, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_payment_request_once(bigint, text) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_create_manual_payment(uuid, text, text, numeric, text, timestamptz, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_school_kpi_summary(uuid, date, date, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_school_kpi_summary(uuid, date, date, boolean) TO anon;
