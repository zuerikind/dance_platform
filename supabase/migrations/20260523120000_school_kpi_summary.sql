-- School admin KPI summary for Ganancias tab (revenue + optional Aure registrations).
-- Single signature; no overloads.

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
    AND (p_start IS NULL OR pr.created_at::date >= p_start)
    AND (p_end IS NULL OR pr.created_at::date <= p_end);

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
        AND (p_start IS NULL OR pr.created_at::date >= p_start)
        AND (p_end IS NULL OR pr.created_at::date <= p_end)
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
    AND (p_start IS NULL OR pr.created_at::date >= p_start)
    AND (p_end IS NULL OR pr.created_at::date <= p_end);

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
  IS 'Admin KPI aggregates for a school: approved/pending revenue, top packages, payment mix; optional Aure pending clase suelta count.';

GRANT EXECUTE ON FUNCTION public.get_school_kpi_summary(uuid, date, date, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_school_kpi_summary(uuid, date, date, boolean) TO anon;
