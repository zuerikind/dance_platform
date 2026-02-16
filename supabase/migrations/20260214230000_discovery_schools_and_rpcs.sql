-- Discovery: add school profile columns and public RPCs for discovery page.
-- discovery_slug is unique (URL path, e.g. royal_latin). Detail RPC looks up by slug.

-- -----------------------------------------------------------------------------
-- 1) Schools: discovery columns
-- -----------------------------------------------------------------------------
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS discovery_slug text DEFAULT NULL;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS country text DEFAULT NULL;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS city text DEFAULT NULL;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS address text DEFAULT NULL;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS discovery_description text DEFAULT NULL;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS discovery_genres jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS discovery_levels jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS logo_url text DEFAULT NULL;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS teacher_photo_url text DEFAULT NULL;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS gallery_urls jsonb DEFAULT '[]'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_discovery_slug ON public.schools(discovery_slug) WHERE discovery_slug IS NOT NULL;

COMMENT ON COLUMN public.schools.discovery_slug IS 'URL slug for discovery page (e.g. royal_latin). Unique. Set in Ajustes.';
COMMENT ON COLUMN public.schools.discovery_genres IS 'Genres offered (e.g. [Salsa, Bachata]).';
COMMENT ON COLUMN public.schools.discovery_levels IS 'Levels offered (e.g. [Beginner, Intermediate]).';

-- -----------------------------------------------------------------------------
-- 2) discovery_list_schools(): public list for overview (anon)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.discovery_list_schools()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'discovery_slug', s.discovery_slug,
      'country', s.country,
      'city', s.city,
      'discovery_description', s.discovery_description,
      'discovery_genres', COALESCE(s.discovery_genres, '[]'::jsonb),
      'discovery_levels', COALESCE(s.discovery_levels, '[]'::jsonb),
      'logo_url', s.logo_url,
      'teacher_photo_url', s.teacher_photo_url,
      'currency', s.currency
    )
    ORDER BY s.name
  ), '[]'::jsonb)
  FROM public.schools s
  WHERE s.active = true;
$$;

GRANT EXECUTE ON FUNCTION public.discovery_list_schools() TO anon;
GRANT EXECUTE ON FUNCTION public.discovery_list_schools() TO authenticated;

-- -----------------------------------------------------------------------------
-- 3) discovery_school_detail(p_slug): public detail by slug (anon)
-- -----------------------------------------------------------------------------
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

GRANT EXECUTE ON FUNCTION public.discovery_school_detail(text) TO anon;
GRANT EXECUTE ON FUNCTION public.discovery_school_detail(text) TO authenticated;

-- -----------------------------------------------------------------------------
-- 4) school_update_discovery: school admin updates own school discovery profile
-- -----------------------------------------------------------------------------
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
  p_gallery_urls jsonb
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
    gallery_urls = COALESCE(p_gallery_urls, '[]'::jsonb)
  WHERE id = p_school_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.school_update_discovery(uuid, text, text, text, text, text, jsonb, jsonb, text, text, jsonb) TO authenticated;
