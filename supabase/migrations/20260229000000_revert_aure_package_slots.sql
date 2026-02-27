-- Revert Aure package slots: remove package_slots, slot_id, and related RPCs.
-- Restore create_payment_request to 6 params. Remove admin cancel RPCs used only by Aure delete flow.

-- 1) Clear slot references before dropping table
UPDATE public.payment_requests SET slot_id = NULL WHERE slot_id IS NOT NULL;

-- 2) Drop package_slots (CASCADE drops FK from payment_requests)
DROP TABLE IF EXISTS public.package_slots CASCADE;

-- 3) Drop slot_id column
ALTER TABLE public.payment_requests DROP COLUMN IF EXISTS slot_id;

-- 4) Restore create_payment_request to 6 params (no p_slot_id)
DROP FUNCTION IF EXISTS public.create_payment_request(text, text, text, numeric, text, uuid, uuid);

CREATE OR REPLACE FUNCTION public.create_payment_request(
  p_student_id text,
  p_sub_id text,
  p_sub_name text,
  p_price numeric,
  p_payment_method text,
  p_school_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.is_school_admin(p_school_id)
    OR public.is_platform_admin()
    OR (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id::text = p_student_id AND s.school_id = p_school_id AND s.user_id = auth.uid()
    ))
  ) THEN
    RETURN;
  END IF;
  INSERT INTO public.payment_requests (student_id, sub_id, sub_name, price, payment_method, school_id, status)
  VALUES (p_student_id, p_sub_id, p_sub_name, p_price, p_payment_method, p_school_id, 'pending');
END;
$$;

COMMENT ON FUNCTION public.create_payment_request(text, text, text, numeric, text, uuid) IS 'Create payment request; student (own id) or admin.';
GRANT EXECUTE ON FUNCTION public.create_payment_request(text, text, text, numeric, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_payment_request(text, text, text, numeric, text, uuid) TO anon;

-- 5) Drop get_package_slots
DROP FUNCTION IF EXISTS public.get_package_slots(uuid, text);

-- 6) Drop admin RPCs (only used by removed Aure delete-registration flow)
DROP FUNCTION IF EXISTS public.admin_record_cancelled_registration(bigint, text, uuid, date);
DROP FUNCTION IF EXISTS public.admin_cancel_class_registration(uuid);
