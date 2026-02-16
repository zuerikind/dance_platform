-- Discovery: salon/teaching locations (name, address, description, images) instead of only gallery URLs.
-- Each location: { "name": "...", "address": "...", "description": "...", "image_urls": ["url1", ...] }
-- address is required when saving from the form.

ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS discovery_locations jsonb DEFAULT '[]'::jsonb;
COMMENT ON COLUMN public.schools.discovery_locations IS 'Teaching locations/salons: [{ name, address, description, image_urls [] }].';

-- discovery_school_detail: include discovery_locations in school payload
CREATE OR REPLACE FUNCTION public.discovery_school_detail(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
  v_school    jsonb;
  v_classes   jsonb;
  v_subs      jsonb;
BEGIN
  SELECT id INTO v_school_id
  FROM public.schools
  WHERE discovery_slug = p_slug AND active = true
  LIMIT 1;
  IF v_school_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT to_jsonb(
    jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'discovery_slug', s.discovery_slug,
      'country', s.country,
      'city', s.city,
      'address', s.address,
      'discovery_description', s.discovery_description,
      'discovery_genres', COALESCE(s.discovery_genres, '[]'::jsonb),
      'discovery_levels', COALESCE(s.discovery_levels, '[]'::jsonb),
      'logo_url', s.logo_url,
      'teacher_photo_url', s.teacher_photo_url,
      'gallery_urls', COALESCE(s.gallery_urls, '[]'::jsonb),
      'discovery_locations', COALESCE(s.discovery_locations, '[]'::jsonb),
      'currency', s.currency
    )
  ) INTO v_school
  FROM public.schools s
  WHERE s.id = v_school_id;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'day', c.day,
      'time', c.time,
      'end_time', c.end_time,
      'tag', c.tag,
      'location', c.location
    )
    ORDER BY c.day, c.time
  ), '[]'::jsonb) INTO v_classes
  FROM public.classes c
  WHERE c.school_id = v_school_id;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', sub.id,
      'name', sub.name,
      'price', sub.price,
      'limit_count', sub.limit_count,
      'validity_days', sub.validity_days
    )
    ORDER BY sub.name
  ), '[]'::jsonb) INTO v_subs
  FROM public.subscriptions sub
  WHERE sub.school_id = v_school_id;

  RETURN v_school || jsonb_build_object('classes', v_classes, 'subscriptions', v_subs);
END;
$$;

-- school_update_discovery: add p_discovery_locations
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
    RETURN;
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

-- Grant with new signature (one more argument)
GRANT EXECUTE ON FUNCTION public.school_update_discovery(uuid, text, text, text, text, text, jsonb, jsonb, text, text, jsonb, jsonb) TO authenticated;
