-- Fix: school_update_discovery silently did nothing when caller was not a school admin.
-- The client received no error and showed "Saved!" while the DB was not updated.
-- Now we RAISE so the client gets an error and can show it to the user.
CREATE OR REPLACE FUNCTION public.school_update_discovery(
  p_school_id uuid,
  p_discovery_slug text,
  p_country text,
  p_city text,
  p_address text,
  p_discovery_description text,
  p_discovery_genres jsonb,
  p_discovery_levels jsonb,
  p_logo_url text,
  p_teacher_photo_url text,
  p_gallery_urls jsonb,
  p_discovery_locations jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Not authorized to update discovery profile for this school.'
      USING ERRCODE = 'P0001';
  END IF;
  UPDATE public.schools
  SET
    discovery_slug = nullif(trim(p_discovery_slug), ''),
    country = nullif(trim(p_country), ''),
    city = nullif(trim(p_city), ''),
    address = nullif(trim(p_address), ''),
    discovery_description = nullif(trim(p_discovery_description), ''),
    discovery_genres = COALESCE(p_discovery_genres, '[]'::jsonb),
    discovery_levels = COALESCE(p_discovery_levels, '[]'::jsonb),
    logo_url = nullif(trim(p_logo_url), ''),
    teacher_photo_url = nullif(trim(p_teacher_photo_url), ''),
    gallery_urls = COALESCE(p_gallery_urls, '[]'::jsonb),
    discovery_locations = COALESCE(p_discovery_locations, discovery_locations, '[]'::jsonb)
  WHERE id = p_school_id;
END;
$$;

COMMENT ON FUNCTION public.school_update_discovery(uuid, text, text, text, text, text, jsonb, jsonb, text, text, jsonb, jsonb) IS 'Update school discovery profile. Raises if caller is not school admin or platform admin.';
