-- RPC: toggle paywall_enabled on a school. Platform admin only.
-- The stripe-webhook edge function writes billing_status; this RPC
-- controls whether billing_status is checked before granting app access.

CREATE OR REPLACE FUNCTION public.school_set_paywall_enabled(p_school_id uuid, p_enabled boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Permission denied: only platform admin can update paywall settings.';
  END IF;
  UPDATE public.schools SET paywall_enabled = p_enabled WHERE id = p_school_id;
END;
$$;

COMMENT ON FUNCTION public.school_set_paywall_enabled(uuid, boolean) IS
  'Enable or disable paywall enforcement for a school. Only platform admin.';

GRANT EXECUTE ON FUNCTION public.school_set_paywall_enabled(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_set_paywall_enabled(uuid, boolean) TO anon;
