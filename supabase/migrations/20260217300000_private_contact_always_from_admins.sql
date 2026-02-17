-- Fix: get_private_classes_contact must ALWAYS read from admins table (source of truth).
-- Clear any cached contact for this school first so we never return stale phone/name.

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
  -- Remove cached contact so we never return stale data (in case an older version wrote it)
  DELETE FROM public.admin_settings
  WHERE school_id = p_school_id AND key IN ('private_contact_name', 'private_contact_phone');

  SELECT trim(value) INTO v_admin_id
  FROM public.admin_settings
  WHERE school_id = p_school_id AND key = 'private_contact_admin_id'
  LIMIT 1;

  IF v_admin_id IS NULL OR v_admin_id = '' THEN
    RETURN NULL;
  END IF;

  -- Read current name/phone from admins only (source of truth). Match id as text (admins.id can be text or uuid)
  SELECT jsonb_build_object(
    'name', COALESCE(nullif(trim(a.display_name), ''), a.username),
    'phone', a.phone
  ) INTO v_result
  FROM public.admins a
  WHERE (a.id::text = v_admin_id OR trim(a.id::text) = v_admin_id)
    AND a.school_id = p_school_id
    AND a.phone IS NOT NULL
    AND trim(a.phone) != ''
  LIMIT 1;

  -- Repopulate cache for admin_update_profile/trigger logic
  IF v_result IS NOT NULL THEN
    INSERT INTO public.admin_settings (school_id, key, value)
    VALUES (p_school_id, 'private_contact_name', coalesce(v_result->>'name', ''))
    ON CONFLICT (school_id, key) DO UPDATE SET value = coalesce(v_result->>'name', '');
    INSERT INTO public.admin_settings (school_id, key, value)
    VALUES (p_school_id, 'private_contact_phone', coalesce(v_result->>'phone', ''))
    ON CONFLICT (school_id, key) DO UPDATE SET value = coalesce(v_result->>'phone', '');
  END IF;

  RETURN v_result;
END;
$$;
