-- Packages (subscriptions) can be hidden from students while keeping them for admin / reactivation.
-- student_visible: when false, excluded from student RPC, discovery, and student payment requests.

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS student_visible boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.subscriptions.student_visible
  IS 'When false, plan is hidden from student shop, discovery, and student-initiated payment requests. School admins still see and edit it.';

-- Students (enrolled at school, not admin) only see visible plans; admins and platform admins see all.
CREATE OR REPLACE FUNCTION public.get_school_subscriptions(p_school_id uuid)
RETURNS SETOF public.subscriptions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sub.* FROM public.subscriptions sub
  WHERE sub.school_id = p_school_id
    AND (
      public.is_school_admin(p_school_id)
      OR public.is_platform_admin()
      OR (
        EXISTS (SELECT 1 FROM public.students s WHERE s.school_id = p_school_id AND s.user_id = auth.uid())
        AND COALESCE(sub.student_visible, true) = true
      )
    )
  ORDER BY sub.name;
$$;

-- Toggle visibility from admin UI
CREATE OR REPLACE FUNCTION public.subscription_update_field(p_id text, p_field text, p_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
BEGIN
  SELECT school_id INTO v_school_id FROM public.subscriptions WHERE id::text = p_id LIMIT 1;
  IF v_school_id IS NULL THEN
    RETURN;
  END IF;
  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;
  IF p_field = 'name' THEN
    UPDATE public.subscriptions SET name = p_value WHERE id::text = p_id;
  ELSIF p_field = 'price' THEN
    UPDATE public.subscriptions SET price = (p_value::numeric) WHERE id::text = p_id;
  ELSIF p_field = 'limit_count' THEN
    UPDATE public.subscriptions SET limit_count = (p_value::int) WHERE id::text = p_id;
  ELSIF p_field = 'limit_count_private' THEN
    UPDATE public.subscriptions SET limit_count_private = (p_value::int) WHERE id::text = p_id;
  ELSIF p_field = 'limit_count_events' THEN
    UPDATE public.subscriptions SET limit_count_events = (p_value::int) WHERE id::text = p_id;
  ELSIF p_field = 'validity_days' THEN
    UPDATE public.subscriptions SET validity_days = (p_value::int) WHERE id::text = p_id;
  ELSIF p_field = 'expiry_date' THEN
    IF p_value IS NULL OR trim(p_value) = '' THEN
      UPDATE public.subscriptions SET expiry_date = NULL WHERE id::text = p_id;
    ELSE
      UPDATE public.subscriptions SET expiry_date = (p_value::date) WHERE id::text = p_id;
    END IF;
  ELSIF p_field = 'student_visible' THEN
    UPDATE public.subscriptions
    SET student_visible = lower(trim(coalesce(p_value, ''))) IN ('true', '1', 't', 'yes')
    WHERE id::text = p_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.subscription_update_field(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.subscription_update_field(text, text, text) TO authenticated;

-- Block student payment requests for hidden packages (admins may still create on behalf of students).
CREATE OR REPLACE FUNCTION public.create_payment_request(
  p_student_id text,
  p_sub_id text,
  p_sub_name text,
  p_price numeric,
  p_payment_method text,
  p_school_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.is_school_admin(p_school_id)
    OR public.is_platform_admin()
    OR (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id::text = p_student_id AND s.school_id = p_school_id AND s.user_id = auth.uid()
    ))
  ) THEN
    RETURN;
  END IF;
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.subscriptions sub
      WHERE sub.id::text = p_sub_id
        AND sub.school_id = p_school_id
        AND COALESCE(sub.student_visible, true) = true
    ) THEN
      RETURN;
    END IF;
  END IF;
  INSERT INTO public.payment_requests (student_id, sub_id, sub_name, price, payment_method, school_id, status)
  VALUES (p_student_id, p_sub_id, p_sub_name, p_price, p_payment_method, p_school_id, 'pending');
END;
$$;

COMMENT ON FUNCTION public.create_payment_request(text, text, text, numeric, text, uuid) IS 'Create payment request; student (own id) or admin. Students cannot request hidden packages.';
GRANT EXECUTE ON FUNCTION public.create_payment_request(text, text, text, numeric, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_payment_request(text, text, text, numeric, text, uuid) TO anon;

-- Public discovery: only visible packages
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
  WHERE sub.school_id = v_school_id
    AND COALESCE(sub.student_visible, true) = true;

  RETURN v_school || jsonb_build_object('classes', v_classes, 'subscriptions', v_subs);
END;
$$;

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
  WHERE sub.school_id = p_school_id
    AND COALESCE(sub.student_visible, true) = true;

  RETURN v_school || jsonb_build_object('classes', v_classes, 'subscriptions', v_subs);
END;
$$;

COMMENT ON FUNCTION public.discovery_school_detail_by_id(uuid) IS 'Return discovery detail by school id; only for discovery_visible schools. Subscriptions list excludes student-hidden plans.';
