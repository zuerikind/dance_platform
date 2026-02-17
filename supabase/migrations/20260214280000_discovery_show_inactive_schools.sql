-- Discovery: show ALL schools (active + inactive). Include 'active' in response.
-- Inactive = hidden from Bailadmin dropdown but visible on discovery (with "not on app" message).

-- 1) discovery_list_schools: remove active filter, add active to response
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
  FROM public.schools s;
$$;

-- 2) discovery_school_detail: remove active filter, add active to response
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
  WHERE discovery_slug = p_slug
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
