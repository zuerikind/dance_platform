-- Ensure private classes contact always returns fresh data (admin phone updates).
-- 1) Use VOLATILE so the function is never cached.
-- 2) Add optional p_bust param so the client can send a unique value per request and avoid any HTTP/cache reuse.

DROP FUNCTION IF EXISTS public.get_private_classes_contact(uuid);

CREATE OR REPLACE FUNCTION public.get_private_classes_contact(p_school_id uuid, p_bust bigint DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id text;
  v_result jsonb;
BEGIN
  SELECT value INTO v_admin_id
  FROM public.admin_settings
  WHERE school_id = p_school_id AND key = 'private_contact_admin_id'
  LIMIT 1;

  IF v_admin_id IS NULL OR trim(v_admin_id) = '' THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'name', COALESCE(nullif(trim(a.display_name), ''), a.username),
    'phone', a.phone
  ) INTO v_result
  FROM public.admins a
  WHERE a.id = v_admin_id
    AND a.school_id = p_school_id
    AND a.phone IS NOT NULL
    AND trim(a.phone) != '';

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_private_classes_contact(uuid, bigint) IS 'Returns the selected private classes contact (name, phone). VOLATILE and optional p_bust so students always see the latest admin phone after updates.';

-- Keep existing single-arg grant; add grant for two-arg form (Supabase may resolve by name)
GRANT EXECUTE ON FUNCTION public.get_private_classes_contact(uuid, bigint) TO anon;
GRANT EXECUTE ON FUNCTION public.get_private_classes_contact(uuid, bigint) TO authenticated;
