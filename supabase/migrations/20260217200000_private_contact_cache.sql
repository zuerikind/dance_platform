-- Denormalize private classes contact into admin_settings so students always see the latest
-- phone/name. Refresh cache when: (1) admin saves profile, (2) school changes the selected contact.

-- 1. admin_update_profile: after updating admins, refresh cache for all schools where this admin is the contact
CREATE OR REPLACE FUNCTION public.admin_update_profile(
  p_admin_id text,
  p_phone text,
  p_display_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
  v_name text;
  v_phone text;
  v_affected_school uuid;
BEGIN
  SELECT school_id INTO v_school_id FROM public.admins WHERE id = p_admin_id;

  IF v_school_id IS NULL THEN
    RAISE EXCEPTION 'Admin not found';
  END IF;

  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  UPDATE public.admins
  SET phone = coalesce(nullif(trim(p_phone), ''), NULL),
      display_name = coalesce(nullif(trim(p_display_name), ''), NULL)
  WHERE id = p_admin_id;

  -- Refresh contact cache for any school where this admin is the private contact
  v_name := coalesce(nullif(trim(p_display_name), ''), (SELECT username FROM public.admins WHERE id = p_admin_id LIMIT 1));
  v_phone := coalesce(nullif(trim(p_phone), ''), NULL);
  FOR v_affected_school IN
    SELECT school_id FROM public.admin_settings
    WHERE key = 'private_contact_admin_id' AND trim(value) = trim(p_admin_id)
  LOOP
    INSERT INTO public.admin_settings (school_id, key, value)
    VALUES (v_affected_school, 'private_contact_name', coalesce(v_name, ''))
    ON CONFLICT (school_id, key) DO UPDATE SET value = coalesce(v_name, '');
    INSERT INTO public.admin_settings (school_id, key, value)
    VALUES (v_affected_school, 'private_contact_phone', coalesce(v_phone, ''))
    ON CONFLICT (school_id, key) DO UPDATE SET value = coalesce(v_phone, '');
  END LOOP;
END;
$$;

-- 2. get_private_classes_contact: read from cache first; fallback to admins and populate cache
DROP FUNCTION IF EXISTS public.get_private_classes_contact(uuid, bigint);
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
  v_name text;
  v_phone text;
  v_result jsonb;
BEGIN
  SELECT value INTO v_admin_id
  FROM public.admin_settings
  WHERE school_id = p_school_id AND key = 'private_contact_admin_id'
  LIMIT 1;

  IF v_admin_id IS NULL OR trim(v_admin_id) = '' THEN
    RETURN NULL;
  END IF;

  -- Try cache first (denormalized, updated when admin saves)
  SELECT
    (SELECT value FROM public.admin_settings WHERE school_id = p_school_id AND key = 'private_contact_name' LIMIT 1),
    (SELECT value FROM public.admin_settings WHERE school_id = p_school_id AND key = 'private_contact_phone' LIMIT 1)
  INTO v_name, v_phone;
  IF v_phone IS NOT NULL AND trim(v_phone) != '' THEN
    RETURN jsonb_build_object(
      'name', coalesce(nullif(trim(v_name), ''), 'Contact'),
      'phone', trim(v_phone)
    );
  END IF;

  -- Fallback: read from admins and populate cache
  SELECT jsonb_build_object(
    'name', COALESCE(nullif(trim(a.display_name), ''), a.username),
    'phone', a.phone
  ) INTO v_result
  FROM public.admins a
  WHERE a.id = v_admin_id
    AND a.school_id = p_school_id
    AND a.phone IS NOT NULL
    AND trim(a.phone) != '';

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

GRANT EXECUTE ON FUNCTION public.get_private_classes_contact(uuid, bigint) TO anon;
GRANT EXECUTE ON FUNCTION public.get_private_classes_contact(uuid, bigint) TO authenticated;

-- 3. Trigger: when private_contact_admin_id changes, refresh cache from admins
CREATE OR REPLACE FUNCTION public._refresh_private_contact_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_phone text;
BEGIN
  IF NEW.key != 'private_contact_admin_id' THEN
    RETURN NEW;
  END IF;
  IF NEW.value IS NULL OR trim(NEW.value) = '' THEN
    DELETE FROM public.admin_settings WHERE school_id = NEW.school_id AND key IN ('private_contact_name', 'private_contact_phone');
    RETURN NEW;
  END IF;
  SELECT COALESCE(nullif(trim(a.display_name), ''), a.username), a.phone
  INTO v_name, v_phone
  FROM public.admins a
  WHERE a.id = trim(NEW.value) AND a.school_id = NEW.school_id;
  IF v_name IS NOT NULL OR v_phone IS NOT NULL THEN
    INSERT INTO public.admin_settings (school_id, key, value)
    VALUES (NEW.school_id, 'private_contact_name', coalesce(v_name, ''))
    ON CONFLICT (school_id, key) DO UPDATE SET value = coalesce(v_name, '');
    INSERT INTO public.admin_settings (school_id, key, value)
    VALUES (NEW.school_id, 'private_contact_phone', coalesce(v_phone, ''))
    ON CONFLICT (school_id, key) DO UPDATE SET value = coalesce(v_phone, '');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS refresh_private_contact_cache_trigger ON public.admin_settings;
CREATE TRIGGER refresh_private_contact_cache_trigger
  AFTER INSERT OR UPDATE OF value ON public.admin_settings
  FOR EACH ROW
  WHEN (NEW.key = 'private_contact_admin_id')
  EXECUTE FUNCTION public._refresh_private_contact_cache();

-- 4. One-time backfill: populate cache for existing schools that have private_contact_admin_id
INSERT INTO public.admin_settings (school_id, key, value)
SELECT s.school_id, 'private_contact_name', coalesce(nullif(trim(a.display_name), ''), a.username)
FROM public.admin_settings s
JOIN public.admins a ON a.id = trim(s.value) AND a.school_id = s.school_id
WHERE s.key = 'private_contact_admin_id' AND trim(s.value) != ''
  AND NOT EXISTS (SELECT 1 FROM public.admin_settings x WHERE x.school_id = s.school_id AND x.key = 'private_contact_name')
ON CONFLICT (school_id, key) DO NOTHING;

INSERT INTO public.admin_settings (school_id, key, value)
SELECT s.school_id, 'private_contact_phone', coalesce(a.phone, '')
FROM public.admin_settings s
JOIN public.admins a ON a.id = trim(s.value) AND a.school_id = s.school_id
WHERE s.key = 'private_contact_admin_id' AND trim(s.value) != ''
  AND a.phone IS NOT NULL AND trim(a.phone) != ''
  AND NOT EXISTS (SELECT 1 FROM public.admin_settings x WHERE x.school_id = s.school_id AND x.key = 'private_contact_phone')
ON CONFLICT (school_id, key) DO NOTHING;
