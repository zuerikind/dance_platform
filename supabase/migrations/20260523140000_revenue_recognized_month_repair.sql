-- Idempotent repair: recompute revenue_recognized_month for all Aure approved payments.
-- Safe to run after 20260523130000 even if backfill partially applied or rules were corrected.

UPDATE public.payment_requests pr
SET revenue_recognized_month = public.compute_aure_revenue_recognized_month(
  pr.school_id,
  pr.sub_id,
  pr.sub_name,
  pr.created_at
)
WHERE pr.school_id = '38e570f9-5ca0-435e-8e99-70ebb5ae3b64'::uuid
  AND pr.status = 'approved';
