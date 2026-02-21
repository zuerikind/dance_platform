-- discovery_list_schools: include profile_type so discovery page can show Schools vs Private teachers tabs.
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
      'active', COALESCE(s.active, true),
      'profile_type', COALESCE(NULLIF(trim(s.profile_type), ''), 'school')
    )
    ORDER BY s.name
  ), '[]'::jsonb)
  FROM public.schools s
  WHERE COALESCE(s.discovery_visible, true) = true;
$$;
