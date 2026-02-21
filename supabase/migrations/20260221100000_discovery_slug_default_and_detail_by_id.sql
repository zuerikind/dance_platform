-- Auto-generate default discovery slug from school name; discovery detail by id.
-- 1) slug_from_name(name): normalize name to URL-safe slug.
-- 2) default_discovery_slug_for_school(p_school_id): unique slug for school (from name, with _2, _3 if needed).
-- 3) Backfill discovery_visible schools with null/empty discovery_slug.
-- 4) Trigger: set discovery_slug when discovery_visible turns on and slug is null.
-- 5) discovery_school_detail_by_id(p_school_id): same shape as discovery_school_detail, for id-based routing.

-- -----------------------------------------------------------------------------
-- 1) slug_from_name
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.slug_from_name(name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    NULLIF(
      trim(
        lower(
          regexp_replace(
            regexp_replace(trim(COALESCE(name, '')), '[^a-zA-Z0-9\s\-]', '', 'g'),
            '\s+', '_', 'g'
          )
        )
      ),
      ''
    ),
    'school'
  );
$$;

COMMENT ON FUNCTION public.slug_from_name(text) IS 'Derive URL-safe slug from school name: lowercase, spaces to underscore, strip non-alphanumeric.';

-- -----------------------------------------------------------------------------
-- 2) default_discovery_slug_for_school
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.default_discovery_slug_for_school(p_school_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_base text;
  v_candidate text;
  v_suffix int;
BEGIN
  SELECT s.name INTO v_name FROM public.schools s WHERE s.id = p_school_id LIMIT 1;
  IF v_name IS NULL THEN
    RETURN 'school';
  END IF;
  v_base := public.slug_from_name(v_name);
  v_candidate := v_base;
  v_suffix := 0;
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.schools
      WHERE discovery_slug = v_candidate AND id <> p_school_id
    ) THEN
      RETURN v_candidate;
    END IF;
    v_suffix := v_suffix + 1;
    v_candidate := v_base || '_' || v_suffix;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.default_discovery_slug_for_school(uuid) IS 'Return a unique discovery slug for the school, derived from name; append _2, _3 if taken.';

-- -----------------------------------------------------------------------------
-- 3) Backfill
-- -----------------------------------------------------------------------------
UPDATE public.schools s
SET discovery_slug = public.default_discovery_slug_for_school(s.id)
WHERE COALESCE(s.discovery_visible, true) = true
  AND (s.discovery_slug IS NULL OR trim(s.discovery_slug) = '');

-- -----------------------------------------------------------------------------
-- 4) Trigger: set default slug when discovery_visible turns on
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_school_discovery_visible_set_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.discovery_visible = true AND (NEW.discovery_slug IS NULL OR trim(NEW.discovery_slug) = '') THEN
    NEW.discovery_slug := public.default_discovery_slug_for_school(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS school_discovery_visible_set_slug ON public.schools;
CREATE TRIGGER school_discovery_visible_set_slug
  BEFORE INSERT OR UPDATE OF discovery_visible, discovery_slug
  ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_school_discovery_visible_set_slug();

-- -----------------------------------------------------------------------------
-- 5) discovery_school_detail_by_id
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.discovery_school_detail_by_id(p_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school    jsonb;
  v_classes   jsonb;
  v_subs      jsonb;
BEGIN
  IF p_school_id IS NULL THEN
    RETURN NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.schools s
    WHERE s.id = p_school_id AND COALESCE(s.discovery_visible, true) = true
  ) THEN
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
  WHERE s.id = p_school_id;

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
  WHERE c.school_id = p_school_id;

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
  WHERE sub.school_id = p_school_id;

  RETURN v_school || jsonb_build_object('classes', v_classes, 'subscriptions', v_subs);
END;
$$;

COMMENT ON FUNCTION public.discovery_school_detail_by_id(uuid) IS 'Return discovery detail by school id; only for discovery_visible schools. Same shape as discovery_school_detail.';
GRANT EXECUTE ON FUNCTION public.discovery_school_detail_by_id(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.discovery_school_detail_by_id(uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 6) RLS: allow school admins to SELECT their own school when inactive (discovery-only edit)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "schools_select_all" ON public.schools;
CREATE POLICY "schools_select_all" ON public.schools
  FOR SELECT USING (
    active = true
    OR public.is_platform_admin()
    OR public.is_school_admin(id)
  );
