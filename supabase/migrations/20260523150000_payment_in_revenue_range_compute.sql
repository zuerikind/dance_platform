-- Ganancias period filter: always use live CDMX rules for Aure (ignore stale stored month).
-- Re-backfill revenue_recognized_month for approved Aure payments (idempotent).

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
      public.compute_aure_revenue_recognized_month(p_school_id, p_sub_id, p_sub_name, p_created_at) IS NOT NULL
      AND (p_start IS NULL OR (
        public.compute_aure_revenue_recognized_month(p_school_id, p_sub_id, p_sub_name, p_created_at)
        + interval '1 month' - interval '1 day'
      )::date >= p_start)
      AND (p_end IS NULL OR public.compute_aure_revenue_recognized_month(
        p_school_id, p_sub_id, p_sub_name, p_created_at
      ) <= p_end)
    )
    ELSE (
      (p_start IS NULL OR p_created_at::date >= p_start)
      AND (p_end IS NULL OR p_created_at::date <= p_end)
    )
  END;
$$;

UPDATE public.payment_requests pr
SET revenue_recognized_month = public.compute_aure_revenue_recognized_month(
  pr.school_id,
  pr.sub_id,
  pr.sub_name,
  pr.created_at
)
WHERE pr.school_id = '38e570f9-5ca0-435e-8e99-70ebb5ae3b64'::uuid
  AND pr.status = 'approved';
