-- Discovery: platform-level toggle. Only platform admin can read/write.
-- Public RPC discovery_is_enabled() for landing and discovery page (anon can call).

-- -----------------------------------------------------------------------------
-- 1) platform_settings table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key   text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT 'null'
);

COMMENT ON TABLE public.platform_settings IS 'Platform-wide settings (e.g. discovery_enabled). Only platform admin can modify.';

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only platform admin can SELECT or UPDATE
DROP POLICY IF EXISTS "platform_settings_select" ON public.platform_settings;
CREATE POLICY "platform_settings_select" ON public.platform_settings
  FOR SELECT USING (public.is_platform_admin());

DROP POLICY IF EXISTS "platform_settings_update" ON public.platform_settings;
CREATE POLICY "platform_settings_update" ON public.platform_settings
  FOR ALL USING (public.is_platform_admin());

-- Seed discovery_enabled = false (jsonb boolean)
INSERT INTO public.platform_settings (key, value)
VALUES ('discovery_enabled', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2) RPCs: platform admin get/set; anon can only check discovery_is_enabled
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.platform_setting_get(p_key text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT value FROM public.platform_settings WHERE key = p_key AND public.is_platform_admin() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.platform_setting_set(p_key text, p_value jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RETURN;
  END IF;
  INSERT INTO public.platform_settings (key, value) VALUES (p_key, COALESCE(p_value, 'null'))
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
END;
$$;

-- Public: anon and authenticated can call; returns true only if discovery_enabled is true
CREATE OR REPLACE FUNCTION public.discovery_is_enabled()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((value = 'true'::jsonb), false) FROM public.platform_settings WHERE key = 'discovery_enabled' LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.platform_setting_get(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.platform_setting_set(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.discovery_is_enabled() TO anon;
GRANT EXECUTE ON FUNCTION public.discovery_is_enabled() TO authenticated;
