-- Aure school: package slot options (admin-defined) and slot choice on payment request.
-- Used only for school "Aure" to offer 4/8 class packages with fixed slot selection.

-- 1) package_slots: admin-defined options per subscription (e.g. "8 clases" -> "Domingos 2h", "Martes 1h + Jueves 1h")
CREATE TABLE IF NOT EXISTS public.package_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subscription_id text REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  sub_name text,
  label text NOT NULL,
  definition jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.package_slots IS 'Aure: options students can choose when buying a slot package (e.g. 8 clases -> Domingos 2h).';
COMMENT ON COLUMN public.package_slots.definition IS 'e.g. [{"class_id": 1, "day": "Sun", "time": "10:00", "duration_minutes": 120}] or recurring rule.';

CREATE INDEX IF NOT EXISTS idx_package_slots_school ON public.package_slots(school_id);
CREATE INDEX IF NOT EXISTS idx_package_slots_sub ON public.package_slots(school_id, subscription_id);

ALTER TABLE public.package_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "package_slots_school_admin"
  ON public.package_slots FOR ALL
  USING (public.is_school_admin(school_id))
  WITH CHECK (public.is_school_admin(school_id));

-- 2) payment_requests: optional slot_id (set when student chooses a package option at Aure)
ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS slot_id uuid REFERENCES public.package_slots(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.payment_requests.slot_id IS 'Aure: chosen package_slots.id when student buys a slot package.';

-- 3) create_payment_request: optional p_slot_id
CREATE OR REPLACE FUNCTION public.create_payment_request(
  p_student_id text,
  p_sub_id text,
  p_sub_name text,
  p_price numeric,
  p_payment_method text,
  p_school_id uuid,
  p_slot_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.payment_requests (student_id, sub_id, sub_name, price, payment_method, school_id, status, slot_id)
  VALUES (p_student_id, p_sub_id, p_sub_name, p_price, p_payment_method, p_school_id, 'pending', p_slot_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_payment_request(text, text, text, numeric, text, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_payment_request(text, text, text, numeric, text, uuid, uuid) TO anon;

-- 4) get_package_slots: list slots for a school (and optionally for a subscription)
CREATE OR REPLACE FUNCTION public.get_package_slots(p_school_id uuid, p_subscription_id text DEFAULT NULL)
RETURNS SETOF public.package_slots
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.package_slots
  WHERE school_id = p_school_id
    AND (p_subscription_id IS NULL OR subscription_id = p_subscription_id OR (subscription_id IS NULL AND sub_name IS NOT NULL))
  ORDER BY sub_name, sort_order, label;
$$;

GRANT EXECUTE ON FUNCTION public.get_package_slots(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_package_slots(uuid, text) TO anon;
