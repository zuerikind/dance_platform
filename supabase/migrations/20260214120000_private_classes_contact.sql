-- Private classes contact: admins get phone/display_name, school picks which admin is the contact.
-- Students see name + phone in a modal with WhatsApp link.

-- 1.1 Extend admins table
ALTER TABLE public.admins
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS display_name text;

COMMENT ON COLUMN public.admins.phone IS 'Phone number for WhatsApp (private classes contact)';
COMMENT ON COLUMN public.admins.display_name IS 'Display name shown to students (fallback: username)';

-- 1.2 RPC: Students get the private classes contact (name + phone only)
-- admin_settings stores value as text (admin id)
CREATE OR REPLACE FUNCTION public.get_private_classes_contact(p_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
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

GRANT EXECUTE ON FUNCTION public.get_private_classes_contact(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_private_classes_contact(uuid) TO authenticated;

-- 1.3 RPC: Admin updates their profile (phone, display_name)
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
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_profile(text, text, text) TO authenticated;

-- 1.4 RPC: Admin changes password (requires current password)
CREATE OR REPLACE FUNCTION public.admin_change_password(
  p_admin_id text,
  p_current_password text,
  p_new_password text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
  v_stored_password text;
  v_is_self boolean;
  v_is_coadmin boolean;
BEGIN
  IF p_new_password IS NULL OR length(trim(p_new_password)) < 4 THEN
    RAISE EXCEPTION 'New password must be at least 4 characters';
  END IF;

  SELECT school_id, password INTO v_school_id, v_stored_password
  FROM public.admins WHERE id = p_admin_id;

  IF v_school_id IS NULL THEN
    RAISE EXCEPTION 'Admin not found';
  END IF;

  IF v_stored_password IS DISTINCT FROM p_current_password THEN
    RAISE EXCEPTION 'Current password is incorrect';
  END IF;

  v_is_self := EXISTS (SELECT 1 FROM public.admins WHERE id = p_admin_id AND user_id = auth.uid());
  v_is_coadmin := public.is_school_admin(v_school_id) OR public.is_platform_admin();

  IF NOT (v_is_self OR v_is_coadmin) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  UPDATE public.admins SET password = trim(p_new_password) WHERE id = p_admin_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_change_password(text, text, text) TO authenticated;
