-- Extend get_school_kpi_summary with school-scoped student analytics (levels, top buyers, no-shows).
-- Same signature; no overload. Aggregates in SQL for admin revenue analytics page.

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
  v_students jsonb;
  v_by_level jsonb;
  v_top_buyers jsonb := '[]'::jsonb;
  v_top_no_shows jsonb := '[]'::jsonb;
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

  -- Student roster level breakdown (current snapshot, not date-filtered).
  SELECT jsonb_build_object(
    'total', COUNT(*)::int,
    'principiante', COUNT(*) FILTER (WHERE s.level = 'principiante')::int,
    'avanzada', COUNT(*) FILTER (WHERE s.level = 'avanzada')::int,
    'unset', COUNT(*) FILTER (WHERE s.level IS NULL OR trim(COALESCE(s.level, '')) = '')::int
  )
  INTO v_by_level
  FROM public.students s
  WHERE s.school_id = p_school_id;

  SELECT COALESCE(jsonb_agg(row ORDER BY (row->>'purchase_count')::int DESC, (row->>'total_spent')::numeric DESC), '[]'::jsonb)
  INTO v_top_buyers
  FROM (
    SELECT jsonb_build_object(
      'student_id', student_id,
      'name', name,
      'purchase_count', purchase_count,
      'total_spent', total_spent
    ) AS row
    FROM (
      SELECT
        pr.student_id,
        COALESCE(NULLIF(trim(MAX(s.name)), ''), pr.student_id, '—') AS name,
        COUNT(*)::int AS purchase_count,
        round(SUM(pr.price)::numeric, 2) AS total_spent
      FROM public.payment_requests pr
      LEFT JOIN public.students s
        ON s.school_id = pr.school_id AND s.id::text = pr.student_id
      WHERE pr.school_id = p_school_id
        AND pr.status = 'approved'
        AND pr.student_id IS NOT NULL
        AND trim(COALESCE(pr.student_id, '')) <> ''
        AND public.payment_in_revenue_range(
          pr.school_id,
          pr.revenue_recognized_month,
          pr.sub_id,
          pr.sub_name,
          pr.created_at,
          p_start,
          p_end
        )
      GROUP BY pr.student_id
      ORDER BY purchase_count DESC, total_spent DESC
      LIMIT 10
    ) ranked
  ) buyers_wrapped;

  SELECT COALESCE(jsonb_agg(row ORDER BY (row->>'no_show_count')::int DESC), '[]'::jsonb)
  INTO v_top_no_shows
  FROM (
    SELECT jsonb_build_object(
      'student_id', student_id,
      'name', name,
      'no_show_count', no_show_count
    ) AS row
    FROM (
      SELECT
        cr.student_id,
        COALESCE(NULLIF(trim(MAX(s.name)), ''), cr.student_id, '—') AS name,
        COUNT(*)::int AS no_show_count
      FROM public.class_registrations cr
      LEFT JOIN public.students s
        ON s.school_id = cr.school_id AND s.id::text = cr.student_id
      WHERE cr.school_id = p_school_id
        AND cr.status = 'no_show'
        AND (p_start IS NULL OR cr.class_date >= p_start)
        AND (p_end IS NULL OR cr.class_date <= p_end)
      GROUP BY cr.student_id
      ORDER BY no_show_count DESC
      LIMIT 10
    ) ranked
  ) noshow_wrapped;

  v_students := jsonb_build_object(
    'by_level', COALESCE(v_by_level, jsonb_build_object('total', 0, 'principiante', 0, 'avanzada', 0, 'unset', 0)),
    'top_pack_buyers', v_top_buyers,
    'top_no_shows', v_top_no_shows
  );

  v_result := jsonb_build_object(
    'revenue_approved', v_approved,
    'revenue_pending', v_pending,
    'approved_count', v_approved_count,
    'pending_count', v_pending_count,
    'avg_ticket', CASE WHEN v_approved_count > 0 THEN round(v_approved / v_approved_count, 2) ELSE 0 END,
    'by_package', v_by_package,
    'by_method', jsonb_build_object('cash', v_cash, 'transfer', v_transfer),
    'registrations', jsonb_build_object('pending_suelta_count', v_pending_suelta),
    'students', v_students
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_school_kpi_summary(uuid, date, date, boolean)
  IS 'Admin KPI aggregates: revenue, Aure pending suelta (optional), and student analytics (levels, top pack buyers, top no-shows).';
