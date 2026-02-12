-- Add currency column to schools. Default MXN (Mexican Pesos).
-- Options: MXN, CHF, USD, COP.

ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'MXN'
CHECK (currency IN ('MXN', 'CHF', 'USD', 'COP'));

COMMENT ON COLUMN public.schools.currency IS 'School currency for plan prices. MXN, CHF, USD, or COP.';

-- RPC to update school currency (platform admin only)
CREATE OR REPLACE FUNCTION public.school_update_currency_by_platform(p_school_id uuid, p_currency text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.schools%ROWTYPE;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Permission denied: only platform admin can update school currency.';
  END IF;
  IF p_currency IS NULL OR trim(p_currency) NOT IN ('MXN', 'CHF', 'USD', 'COP') THEN
    RAISE EXCEPTION 'Invalid currency. Must be MXN, CHF, USD, or COP.';
  END IF;
  UPDATE public.schools SET currency = trim(p_currency) WHERE id = p_school_id
  RETURNING * INTO v_row;
  IF v_row IS NULL THEN
    RAISE EXCEPTION 'School not found.';
  END IF;
  RETURN to_jsonb(v_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.school_update_currency_by_platform(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_update_currency_by_platform(uuid, text) TO anon;
