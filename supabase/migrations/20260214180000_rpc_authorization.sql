-- =============================================================================
-- RPC authorization: require is_school_admin / is_platform_admin (or owner)
-- for all SECURITY DEFINER RPCs that were previously callable by anyone.
-- Does not change password storage (plain text remains per product decision).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) get_platform_all_data: only platform admin
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_platform_all_data()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RETURN '{}'::jsonb;
  END IF;
  RETURN (
    SELECT jsonb_build_object(
      'schools', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.schools ORDER BY name) t), '[]'::jsonb),
      'students', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.students) t), '[]'::jsonb),
      'admins', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.admins ORDER BY school_id, username) t), '[]'::jsonb),
      'classes', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.classes ORDER BY school_id, id) t), '[]'::jsonb),
      'subscriptions', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.subscriptions ORDER BY school_id, name) t), '[]'::jsonb),
      'payment_requests', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.payment_requests ORDER BY created_at DESC) t), '[]'::jsonb),
      'admin_settings', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.admin_settings) t), '[]'::jsonb),
      'platform_admins', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.platform_admins ORDER BY username) t), '[]'::jsonb)
    )
  );
END;
$$;

-- -----------------------------------------------------------------------------
-- 2) get_school_students, get_school_admins, get_school_classes, get_school_subscriptions
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_school_students(p_school_id uuid)
RETURNS SETOF public.students
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.* FROM public.students s
  WHERE s.school_id = p_school_id
    AND (public.is_school_admin(p_school_id) OR public.is_platform_admin())
  ORDER BY s.name;
$$;

CREATE OR REPLACE FUNCTION public.get_school_admins(p_school_id uuid)
RETURNS SETOF public.admins
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.* FROM public.admins a
  WHERE a.school_id = p_school_id
    AND (public.is_school_admin(p_school_id) OR public.is_platform_admin())
  ORDER BY a.username;
$$;

CREATE OR REPLACE FUNCTION public.get_school_classes(p_school_id uuid)
RETURNS SETOF public.classes
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.* FROM public.classes c
  WHERE c.school_id = p_school_id
    AND (public.is_school_admin(p_school_id) OR public.is_platform_admin())
  ORDER BY c.id;
$$;

CREATE OR REPLACE FUNCTION public.get_school_subscriptions(p_school_id uuid)
RETURNS SETOF public.subscriptions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sub.* FROM public.subscriptions sub
  WHERE sub.school_id = p_school_id
    AND (public.is_school_admin(p_school_id) OR public.is_platform_admin())
  ORDER BY sub.name;
$$;

-- -----------------------------------------------------------------------------
-- 3) get_school_admin_settings: admin, platform admin, or student of that school
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_school_admin_settings(p_school_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN public.is_school_admin(p_school_id) OR public.is_platform_admin()
      OR EXISTS (SELECT 1 FROM public.students s WHERE s.school_id = p_school_id AND s.user_id = auth.uid())
    THEN (SELECT COALESCE(jsonb_object_agg(key, value), '{}'::jsonb) FROM public.admin_settings WHERE school_id = p_school_id)
    ELSE '{}'::jsonb
  END;
$$;

-- -----------------------------------------------------------------------------
-- 4) get_school_payment_requests
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_school_payment_requests(p_school_id uuid)
RETURNS SETOF public.payment_requests
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pr.* FROM public.payment_requests pr
  WHERE pr.school_id = p_school_id
    AND (public.is_school_admin(p_school_id) OR public.is_platform_admin())
  ORDER BY pr.created_at DESC;
$$;

-- -----------------------------------------------------------------------------
-- 5) get_student_by_id: own row, or school/platform admin
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_student_by_id(p_student_id text, p_school_id uuid)
RETURNS SETOF public.students
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.* FROM public.students s
  WHERE s.id::text = p_student_id AND s.school_id = p_school_id
    AND (
      s.user_id = auth.uid()
      OR public.is_school_admin(p_school_id)
      OR public.is_platform_admin()
    )
  LIMIT 1;
$$;

-- -----------------------------------------------------------------------------
-- 6) get_student_by_user_id: own data or admin
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_student_by_user_id(p_user_id uuid, p_school_id uuid)
RETURNS SETOF public.students
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.* FROM public.students s
  WHERE s.user_id = p_user_id AND s.school_id = p_school_id
    AND (
      auth.uid() = p_user_id
      OR public.is_school_admin(p_school_id)
      OR public.is_platform_admin()
    )
  LIMIT 1;
$$;

-- -----------------------------------------------------------------------------
-- 7) get_all_student_enrollments: only own enrollments
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_all_student_enrollments(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN '[]'::jsonb;
  END IF;
  SELECT jsonb_agg(
    to_jsonb(e.*) || jsonb_build_object('school_name', COALESCE(s.name, 'Unknown'))
    ORDER BY e.created_at ASC
  )
  INTO v_result
  FROM public.students e
  LEFT JOIN public.schools s ON s.id = e.school_id
  WHERE e.user_id = p_user_id;
  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- -----------------------------------------------------------------------------
-- 8) update_payment_request_status: admin of request's school
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_payment_request_status(p_request_id bigint, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
BEGIN
  SELECT school_id INTO v_school_id FROM public.payment_requests WHERE id = p_request_id LIMIT 1;
  IF v_school_id IS NULL THEN
    RETURN;
  END IF;
  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;
  UPDATE public.payment_requests SET status = p_status WHERE id = p_request_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 9) delete_payment_request: admin of request's school
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_payment_request(p_request_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
BEGIN
  SELECT school_id INTO v_school_id FROM public.payment_requests WHERE id = p_request_id LIMIT 1;
  IF v_school_id IS NULL THEN
    RETURN;
  END IF;
  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;
  DELETE FROM public.payment_requests WHERE id = p_request_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 10) create_payment_request: student (own id) or admin
-- -----------------------------------------------------------------------------
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
  INSERT INTO public.payment_requests (student_id, sub_id, sub_name, price, payment_method, school_id, status)
  VALUES (p_student_id, p_sub_id, p_sub_name, p_price, p_payment_method, p_school_id, 'pending');
END;
$$;

-- -----------------------------------------------------------------------------
-- 11) apply_student_package: admin of student's school
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_student_package(
  p_student_id text,
  p_balance numeric,
  p_active_packs jsonb,
  p_package_expires_at timestamptz,
  p_package_name text,
  p_paid boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
BEGIN
  SELECT school_id INTO v_school_id FROM public.students WHERE id::text = p_student_id LIMIT 1;
  IF v_school_id IS NULL THEN
    RETURN;
  END IF;
  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;
  UPDATE public.students
  SET
    balance = p_balance,
    active_packs = COALESCE(p_active_packs, '[]'::jsonb),
    package_expires_at = p_package_expires_at,
    package = p_package_name,
    paid = COALESCE(p_paid, false)
  WHERE id = p_student_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 12) activate_package_for_student
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.activate_package_for_student(
  p_student_id text,
  p_sub_name text,
  p_school_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student public.students%ROWTYPE;
  v_sub public.subscriptions%ROWTYPE;
  v_incoming_limit int;
  v_days int;
  v_new_balance numeric;
  v_active_packs jsonb;
  v_new_pack jsonb;
  v_expiry timestamptz;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;
  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id LIMIT 1;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  SELECT * INTO v_sub FROM public.subscriptions
  WHERE school_id = p_school_id AND LOWER(TRIM(name)) = LOWER(TRIM(p_sub_name))
  LIMIT 1;
  IF FOUND THEN
    v_incoming_limit := COALESCE((v_sub.limit_count)::int, 0);
    v_days := COALESCE((v_sub.validity_days)::int, 30);
  ELSE
    v_incoming_limit := COALESCE((regexp_match(p_sub_name, '\d+'))[1]::int, 1);
    v_days := 30;
  END IF;
  IF v_incoming_limit <= 0 THEN
    RETURN;
  END IF;
  v_expiry := now() + (v_days || ' days')::interval;
  v_active_packs := COALESCE(v_student.active_packs, '[]'::jsonb);
  v_new_pack := jsonb_build_object(
    'id', 'PACK-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)),
    'name', COALESCE(v_sub.name, p_sub_name),
    'count', v_incoming_limit,
    'expires_at', v_expiry,
    'created_at', now()
  );
  v_active_packs := v_active_packs || v_new_pack;
  IF v_student.balance IS NULL THEN
    v_new_balance := v_incoming_limit;
  ELSE
    v_new_balance := v_student.balance + v_incoming_limit;
  END IF;
  UPDATE public.students
  SET
    balance = v_new_balance,
    active_packs = v_active_packs,
    package_expires_at = v_expiry,
    package = COALESCE(v_sub.name, p_sub_name),
    paid = true
  WHERE id::text = p_student_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 13) deduct_student_classes
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.deduct_student_classes(
  p_student_id text,
  p_school_id uuid,
  p_count int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student public.students%ROWTYPE;
  v_active_packs jsonb;
  v_new_packs jsonb := '[]'::jsonb;
  v_remaining int;
  v_elem jsonb;
  v_cnt int;
  v_deduct int;
  v_new_balance int;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;
  IF p_count IS NULL OR p_count < 1 THEN
    RETURN;
  END IF;
  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id LIMIT 1;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  IF v_student.balance IS NULL THEN
    RETURN;
  END IF;
  IF v_student.balance < p_count THEN
    RETURN;
  END IF;
  v_active_packs := COALESCE(v_student.active_packs, '[]'::jsonb);
  v_remaining := p_count;
  IF jsonb_array_length(v_active_packs) > 0 THEN
    FOR v_elem IN
      SELECT elem FROM jsonb_array_elements(v_active_packs) AS elem
      ORDER BY (elem->>'expires_at')::timestamptz NULLS LAST
    LOOP
      IF v_remaining <= 0 THEN
        v_new_packs := v_new_packs || v_elem;
        CONTINUE;
      END IF;
      v_cnt := COALESCE((v_elem->>'count')::int, 0);
      IF v_cnt <= 0 THEN
        v_new_packs := v_new_packs || v_elem;
        CONTINUE;
      END IF;
      v_deduct := LEAST(v_cnt, v_remaining);
      v_remaining := v_remaining - v_deduct;
      v_cnt := v_cnt - v_deduct;
      IF v_cnt > 0 THEN
        v_new_packs := v_new_packs || jsonb_set(v_elem, '{count}', to_jsonb(v_cnt));
      END IF;
    END LOOP;
    v_new_balance := (SELECT COALESCE(SUM((elem->>'count')::int), 0) FROM jsonb_array_elements(v_new_packs) AS elem);
  ELSE
    v_new_balance := (v_student.balance)::int - p_count;
  END IF;
  UPDATE public.students
  SET
    balance = v_new_balance,
    active_packs = CASE WHEN jsonb_array_length(v_active_packs) > 0 THEN v_new_packs ELSE active_packs END
  WHERE id::text = p_student_id AND school_id = p_school_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 14) admin_delete_for_school: admin of that admin's school
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_delete_for_school(p_admin_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
BEGIN
  SELECT school_id INTO v_school_id FROM public.admins WHERE id = p_admin_id LIMIT 1;
  IF v_school_id IS NULL THEN
    RETURN;
  END IF;
  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;
  DELETE FROM public.admins WHERE id = p_admin_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 15) class_insert_for_school
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.class_insert_for_school(
  p_school_id uuid,
  p_name text DEFAULT 'New Class',
  p_day text DEFAULT 'Mon',
  p_time text DEFAULT '09:00',
  p_price numeric DEFAULT 0,
  p_tag text DEFAULT '',
  p_location text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.classes%ROWTYPE;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;
  BEGIN
    INSERT INTO public.classes (school_id, name, day, time, price, tag, location)
    VALUES (p_school_id, coalesce(nullif(trim(p_name), ''), 'New Class'), coalesce(nullif(trim(p_day), ''), 'Mon'),
            coalesce(nullif(trim(p_time), ''), '09:00'), coalesce(p_price, 0), coalesce(trim(p_tag), ''),
            coalesce(trim(p_location), ''))
    RETURNING * INTO v_row;
  EXCEPTION
    WHEN undefined_column THEN
      INSERT INTO public.classes (school_id, name, day, time, price)
      VALUES (p_school_id, coalesce(nullif(trim(p_name), ''), 'New Class'), coalesce(nullif(trim(p_day), ''), 'Mon'),
              coalesce(nullif(trim(p_time), ''), '09:00'), coalesce(p_price, 0))
      RETURNING * INTO v_row;
  END;
  RETURN to_jsonb(v_row);
END;
$$;

-- -----------------------------------------------------------------------------
-- 16) class_update_field: admin of class's school
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.class_update_field(p_id bigint, p_field text, p_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
BEGIN
  SELECT school_id INTO v_school_id FROM public.classes WHERE id = p_id LIMIT 1;
  IF v_school_id IS NULL THEN
    RETURN;
  END IF;
  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;
  IF p_field = 'name' THEN
    UPDATE public.classes SET name = p_value WHERE id = p_id;
  ELSIF p_field = 'day' THEN
    UPDATE public.classes SET day = p_value WHERE id = p_id;
  ELSIF p_field = 'time' THEN
    UPDATE public.classes SET time = p_value WHERE id = p_id;
  ELSIF p_field = 'price' THEN
    UPDATE public.classes SET price = (p_value::numeric) WHERE id = p_id;
  ELSIF p_field = 'tag' THEN
    UPDATE public.classes SET tag = p_value WHERE id = p_id;
  ELSIF p_field = 'location' THEN
    UPDATE public.classes SET location = p_value WHERE id = p_id;
  ELSIF p_field = 'max_capacity' THEN
    IF p_value IS NULL OR trim(p_value) = '' THEN
      UPDATE public.classes SET max_capacity = NULL WHERE id = p_id;
    ELSE
      UPDATE public.classes SET max_capacity = (p_value::int) WHERE id = p_id;
    END IF;
  END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- 17) class_delete_for_school
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.class_delete_for_school(p_class_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
BEGIN
  SELECT school_id INTO v_school_id FROM public.classes WHERE id = p_class_id LIMIT 1;
  IF v_school_id IS NULL THEN
    RETURN;
  END IF;
  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;
  DELETE FROM public.classes WHERE id = p_class_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 18) subscription_insert_for_school
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.subscription_insert_for_school(
  p_school_id uuid,
  p_name text DEFAULT 'New Plan',
  p_price numeric DEFAULT 0,
  p_limit_count int DEFAULT 10,
  p_validity_days int DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.subscriptions%ROWTYPE;
  v_id text;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;
  v_id := 'S' || floor(extract(epoch from now()) * 1000)::bigint::text;
  BEGIN
    INSERT INTO public.subscriptions (id, school_id, name, price, limit_count, validity_days)
    VALUES (v_id, p_school_id, coalesce(nullif(trim(p_name), ''), 'New Plan'), coalesce(p_price, 0),
            coalesce(p_limit_count, 10), coalesce(p_validity_days, 30))
    RETURNING * INTO v_row;
  EXCEPTION
    WHEN undefined_column THEN
      INSERT INTO public.subscriptions (school_id, name, price, limit_count, validity_days)
      VALUES (p_school_id, coalesce(nullif(trim(p_name), ''), 'New Plan'), coalesce(p_price, 0),
              coalesce(p_limit_count, 10), coalesce(p_validity_days, 30))
      RETURNING * INTO v_row;
  END;
  RETURN to_jsonb(v_row);
END;
$$;

-- -----------------------------------------------------------------------------
-- 19) subscription_update_field
-- -----------------------------------------------------------------------------
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
  ELSIF p_field = 'validity_days' THEN
    UPDATE public.subscriptions SET validity_days = (p_value::int) WHERE id::text = p_id;
  END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- 20) subscription_delete_for_school
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.subscription_delete_for_school(p_sub_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
BEGIN
  SELECT school_id INTO v_school_id FROM public.subscriptions WHERE id::text = p_sub_id LIMIT 1;
  IF v_school_id IS NULL THEN
    RETURN;
  END IF;
  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;
  DELETE FROM public.subscriptions WHERE id::text = p_sub_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 21) admin_setting_upsert
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_setting_upsert(p_school_id uuid, p_key text, p_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;
  INSERT INTO public.admin_settings (school_id, key, value)
  VALUES (p_school_id, p_key, coalesce(p_value, ''))
  ON CONFLICT (school_id, key) DO UPDATE SET value = coalesce(p_value, '');
END;
$$;

-- -----------------------------------------------------------------------------
-- 22) create_student_legacy: only school or platform admin (signup fallback then requires Auth)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_student_legacy(
  p_name text,
  p_email text,
  p_phone text,
  p_password text,
  p_school_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id text;
  new_row public.students;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;
  new_id := 'STUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  INSERT INTO public.students (id, name, email, phone, password, paid, package, balance, active_packs, package_expires_at, school_id, created_at)
  VALUES (new_id, trim(p_name), nullif(trim(p_email), ''), nullif(trim(p_phone), ''), p_password, false, null, 0, '[]'::jsonb, null, p_school_id, now())
  RETURNING * INTO new_row;
  RETURN to_jsonb(new_row);
END;
$$;
COMMENT ON FUNCTION public.create_student_legacy(text, text, text, text, uuid) IS 'Create student without Auth; only school/platform admin. For signup use create_student_with_auth.';

-- -----------------------------------------------------------------------------
-- 23) link_student_auth: only if student email matches auth user, or school/platform admin
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.link_student_auth(p_student_id text, p_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated public.students;
  v_student public.students%ROWTYPE;
  v_auth_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id AND user_id IS NULL LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  v_auth_email := lower(trim(auth.jwt()->>'email'));
  IF v_auth_email IS NULL OR v_auth_email = '' THEN
    v_auth_email := '';
  END IF;
  IF NOT (
    (v_student.email IS NOT NULL AND lower(trim(v_student.email)) = v_auth_email)
    OR public.is_school_admin(p_school_id)
    OR public.is_platform_admin()
  ) THEN
    RETURN NULL;
  END IF;
  UPDATE public.students
  SET user_id = auth.uid()
  WHERE id::text = p_student_id AND school_id = p_school_id AND user_id IS NULL
  RETURNING * INTO updated;
  RETURN to_jsonb(updated);
END;
$$;
COMMENT ON FUNCTION public.link_student_auth(text, uuid) IS 'Set user_id = auth.uid() on student row; only if caller email matches student email or caller is admin.';

-- -----------------------------------------------------------------------------
-- 24) process_expired_registrations
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_expired_registrations(p_school_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg record;
  v_class_datetime timestamptz;
  v_processed int := 0;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN 0;
  END IF;
  FOR v_reg IN
    SELECT cr.id, cr.student_id, cr.class_id, cr.class_date,
           c.time AS class_time
    FROM public.class_registrations cr
    JOIN public.classes c ON c.id = cr.class_id
    WHERE cr.school_id = p_school_id
      AND cr.status = 'registered'
      AND cr.deducted = false
  LOOP
    v_class_datetime := (v_reg.class_date || ' ' || coalesce(v_reg.class_time, '23:59'))::timestamptz;
    IF v_class_datetime <= now() THEN
      UPDATE public.class_registrations SET status = 'no_show', deducted = true WHERE id = v_reg.id;
      PERFORM public.deduct_student_classes(v_reg.student_id, p_school_id, 1);
      v_processed := v_processed + 1;
    END IF;
  END LOOP;
  RETURN v_processed;
END;
$$;

-- -----------------------------------------------------------------------------
-- 25) mark_registration_attended
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_registration_attended(
  p_registration_id uuid,
  p_school_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg public.class_registrations%ROWTYPE;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN;
  END IF;
  SELECT * INTO v_reg
  FROM public.class_registrations
  WHERE id = p_registration_id
    AND school_id = p_school_id
    AND status = 'registered';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found or not in registered status.';
  END IF;
  UPDATE public.class_registrations
  SET status = 'attended', deducted = true
  WHERE id = p_registration_id;
  PERFORM public.deduct_student_classes(v_reg.student_id, p_school_id, 1);
END;
$$;

-- -----------------------------------------------------------------------------
-- 26) get_student_registrations_for_today: admin or the student (own id)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_student_registrations_for_today(
  p_student_id text,
  p_school_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb := '[]'::jsonb;
  v_row record;
BEGIN
  IF NOT (
    public.is_school_admin(p_school_id)
    OR public.is_platform_admin()
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.id::text = p_student_id AND s.school_id = p_school_id AND s.user_id = auth.uid())
  ) THEN
    RETURN v_result;
  END IF;
  FOR v_row IN
    SELECT cr.id, cr.class_id, cr.class_date, cr.status, cr.deducted,
           c.name AS class_name, c.time AS class_time
    FROM public.class_registrations cr
    JOIN public.classes c ON c.id = cr.class_id
    WHERE cr.student_id = p_student_id
      AND cr.school_id = p_school_id
      AND cr.class_date = CURRENT_DATE
      AND cr.status = 'registered'
    ORDER BY c.time
  LOOP
    v_result := v_result || jsonb_build_object(
      'id', v_row.id,
      'class_id', v_row.class_id,
      'class_date', v_row.class_date,
      'status', v_row.status,
      'deducted', v_row.deducted,
      'class_name', v_row.class_name,
      'class_time', v_row.class_time
    );
  END LOOP;
  RETURN v_result;
END;
$$;
