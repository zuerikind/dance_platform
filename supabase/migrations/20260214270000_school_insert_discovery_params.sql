-- Extend school_insert_by_platform to accept optional discovery params.
-- This ensures discovery data is saved atomically during school creation
-- (avoids session/auth context issues between separate RPC calls).

DROP FUNCTION IF EXISTS public.school_insert_by_platform(text);

CREATE OR REPLACE FUNCTION public.school_insert_by_platform(
  p_name text,
  p_discovery_slug text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_discovery_description text DEFAULT NULL,
  p_discovery_genres jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.schools%ROWTYPE;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Permission denied: only platform admin can create schools.';
  END IF;
  INSERT INTO public.schools (
    name,
    discovery_slug,
    country,
    city,
    discovery_description,
    discovery_genres
  ) VALUES (
    trim(p_name),
    nullif(trim(p_discovery_slug), ''),
    nullif(trim(p_country), ''),
    nullif(trim(p_city), ''),
    nullif(trim(p_discovery_description), ''),
    COALESCE(p_discovery_genres, '[]'::jsonb)
  )
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;

COMMENT ON FUNCTION public.school_insert_by_platform(text, text, text, text, text, jsonb) IS 'Insert school with optional discovery fields; platform admin only.';
GRANT EXECUTE ON FUNCTION public.school_insert_by_platform(text, text, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_insert_by_platform(text, text, text, text, text, jsonb) TO anon;
