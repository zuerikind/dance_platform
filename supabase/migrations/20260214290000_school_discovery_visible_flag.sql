-- Second toggle: discovery_visible = whether school appears on discovery page.
-- active = on Bailadmin dropdown, discovery_visible = on discovery page.

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS discovery_visible boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.schools.discovery_visible IS 'When false, school is hidden from discovery page. Platform admin can toggle.';

CREATE INDEX IF NOT EXISTS idx_schools_discovery_visible ON public.schools(discovery_visible);

-- RPC: set school discovery visibility (platform admin only)
CREATE OR REPLACE FUNCTION public.school_set_discovery_visible(p_school_id uuid, p_visible boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RETURN;
  END IF;
  UPDATE public.schools SET discovery_visible = p_visible WHERE id = p_school_id;
END;
$$;

COMMENT ON FUNCTION public.school_set_discovery_visible(uuid, boolean) IS 'Show or hide school on discovery page. Only platform admin.';
GRANT EXECUTE ON FUNCTION public.school_set_discovery_visible(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_set_discovery_visible(uuid, boolean) TO anon;

-- discovery_list_schools: only schools with discovery_visible = true
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
      'currency', s.currency,
      'active', COALESCE(s.active, true)
    )
    ORDER BY s.name
  ), '[]'::jsonb)
  FROM public.schools s
  WHERE COALESCE(s.discovery_visible, true) = true;
$$;

-- discovery_school_detail: only return if discovery_visible = true
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
  WHERE discovery_slug = p_slug AND COALESCE(discovery_visible, true) = true
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
      'currency', s.currency,
      'active', COALESCE(s.active, true)
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
