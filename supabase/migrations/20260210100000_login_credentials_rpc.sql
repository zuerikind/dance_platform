-- =============================================================================
-- Login fallback: check credentials against students/admins tables when
-- Supabase Auth has no user (e.g. existing rows without user_id).
-- Run in Supabase SQL Editor after the main security migration.
-- =============================================================================

-- Student login: return the student row if name + password + school_id match.
CREATE OR REPLACE FUNCTION public.get_student_by_credentials(
  p_name text,
  p_password text,
  p_school_id uuid
)
RETURNS SETOF public.students
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.students
  WHERE school_id = p_school_id
    AND LOWER(TRIM(name)) = LOWER(TRIM(p_name))
    AND password = p_password
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_student_by_credentials IS 'Legacy login: validate student name+password for a school. Used when Auth user does not exist.';

-- Admin login: return the admin row if username + password + school_id match.
CREATE OR REPLACE FUNCTION public.get_admin_by_credentials(
  p_username text,
  p_password text,
  p_school_id uuid
)
RETURNS SETOF public.admins
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.admins
  WHERE school_id = p_school_id
    AND TRIM(username) = TRIM(p_username)
    AND password = p_password
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_admin_by_credentials IS 'Legacy login: validate admin username+password for a school. Used when Auth user does not exist.';

-- Allow anon and authenticated to call these (they only return one row when credentials match).
GRANT EXECUTE ON FUNCTION public.get_student_by_credentials(text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_student_by_credentials(text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_by_credentials(text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_admin_by_credentials(text, text, uuid) TO authenticated;

-- Student profile refresh: return one student by id and school (for legacy students whose direct select is RLS-blocked).
CREATE OR REPLACE FUNCTION public.get_student_by_id(
  p_student_id text,
  p_school_id uuid
)
RETURNS SETOF public.students
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_student_by_id(text, uuid) IS 'Return student row by id and school; used so legacy students can refresh balance/packs after approval.';
GRANT EXECUTE ON FUNCTION public.get_student_by_id(text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_student_by_id(text, uuid) TO authenticated;

-- Platform dev login: return platform_admin row if username + password match (legacy, no Auth user).
CREATE OR REPLACE FUNCTION public.get_platform_admin_by_credentials(
  p_username text,
  p_password text
)
RETURNS SETOF public.platform_admins
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.platform_admins
  WHERE TRIM(username) = TRIM(p_username)
    AND password = p_password
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_platform_admin_by_credentials(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_platform_admin_by_credentials(text, text) TO authenticated;

-- Schedule/shop for students: return classes and subscriptions for a school.
-- Used when student has no Auth session (legacy login) so RLS would block direct select.
CREATE OR REPLACE FUNCTION public.get_school_classes(p_school_id uuid)
RETURNS SETOF public.classes
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.classes WHERE school_id = p_school_id ORDER BY id;
$$;

CREATE OR REPLACE FUNCTION public.get_school_subscriptions(p_school_id uuid)
RETURNS SETOF public.subscriptions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.subscriptions WHERE school_id = p_school_id ORDER BY name;
$$;

GRANT EXECUTE ON FUNCTION public.get_school_classes(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_school_classes(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_school_subscriptions(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_school_subscriptions(uuid) TO authenticated;

-- Admins: list students for a school (RLS blocks direct select for legacy admins).
CREATE OR REPLACE FUNCTION public.get_school_students(p_school_id uuid)
RETURNS SETOF public.students
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.students WHERE school_id = p_school_id ORDER BY name;
$$;

GRANT EXECUTE ON FUNCTION public.get_school_students(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_school_students(uuid) TO authenticated;

-- Admins: list admins for a school (RLS blocks direct select for legacy admins).
CREATE OR REPLACE FUNCTION public.get_school_admins(p_school_id uuid)
RETURNS SETOF public.admins
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.admins WHERE school_id = p_school_id ORDER BY username;
$$;

GRANT EXECUTE ON FUNCTION public.get_school_admins(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_school_admins(uuid) TO authenticated;

-- Create student without Auth (e.g. when Auth rate limit or signUp fails). Lets signup always succeed.
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
  new_id := 'STUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  INSERT INTO public.students (id, name, email, phone, password, paid, package, balance, school_id, created_at)
  VALUES (new_id, trim(p_name), nullif(trim(p_email), ''), nullif(trim(p_phone), ''), p_password, false, null, 0, p_school_id, now())
  RETURNING * INTO new_row;
  RETURN to_jsonb(new_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_student_legacy(text, text, text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.create_student_legacy(text, text, text, text, uuid) TO authenticated;

-- Student creates a payment request (RLS only allows admins to insert; this runs as definer).
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
  INSERT INTO public.payment_requests (student_id, sub_id, sub_name, price, payment_method, school_id, status)
  VALUES (p_student_id, p_sub_id, p_sub_name, p_price, p_payment_method, p_school_id, 'pending');
END;
$$;

COMMENT ON FUNCTION public.create_payment_request IS 'Allows students to submit a payment request; RLS blocks direct insert.';

GRANT EXECUTE ON FUNCTION public.create_payment_request(text, text, text, numeric, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.create_payment_request(text, text, text, numeric, text, uuid) TO authenticated;

-- Bank details for payment modal (students cannot read admin_settings via RLS).
CREATE OR REPLACE FUNCTION public.get_school_admin_settings(p_school_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_object_agg(key, value), '{}'::jsonb)
  FROM public.admin_settings
  WHERE school_id = p_school_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_school_admin_settings(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_school_admin_settings(uuid) TO authenticated;

-- Payment requests for a school (legacy admins cannot read via RLS; this runs as definer).
CREATE OR REPLACE FUNCTION public.get_school_payment_requests(p_school_id uuid)
RETURNS SETOF public.payment_requests
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.payment_requests
  WHERE school_id = p_school_id
  ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_school_payment_requests(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_school_payment_requests(uuid) TO authenticated;

-- Legacy admin: update/delete payment_requests (RLS requires auth.uid()).
-- id may be int4 (serial) or int8; use bigint to accept both.
CREATE OR REPLACE FUNCTION public.update_payment_request_status(p_request_id bigint, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.payment_requests SET status = p_status WHERE id = p_request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_payment_request(p_request_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.payment_requests WHERE id = p_request_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_payment_request_status(bigint, text) TO anon;
GRANT EXECUTE ON FUNCTION public.update_payment_request_status(bigint, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_payment_request(bigint) TO anon;
GRANT EXECUTE ON FUNCTION public.delete_payment_request(bigint) TO authenticated;

-- Dev dashboard: return all platform data (schools, students, admins, classes, subscriptions, payment_requests, admin_settings, platform_admins). SECURITY DEFINER bypasses RLS.
CREATE OR REPLACE FUNCTION public.get_platform_all_data()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'schools', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.schools ORDER BY name) t), '[]'::jsonb),
    'students', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.students) t), '[]'::jsonb),
    'admins', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.admins ORDER BY school_id, username) t), '[]'::jsonb),
    'classes', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.classes ORDER BY school_id, id) t), '[]'::jsonb),
    'subscriptions', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.subscriptions ORDER BY school_id, name) t), '[]'::jsonb),
    'payment_requests', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.payment_requests ORDER BY created_at DESC) t), '[]'::jsonb),
    'admin_settings', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.admin_settings) t), '[]'::jsonb),
    'platform_admins', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM public.platform_admins ORDER BY username) t), '[]'::jsonb)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_platform_all_data() TO anon;
GRANT EXECUTE ON FUNCTION public.get_platform_all_data() TO authenticated;

-- Apply package to student (e.g. when admin approves payment). Bypasses RLS so it always works.
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
BEGIN
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

GRANT EXECUTE ON FUNCTION public.apply_student_package(text, numeric, jsonb, timestamptz, text, boolean) TO anon;
GRANT EXECUTE ON FUNCTION public.apply_student_package(text, numeric, jsonb, timestamptz, text, boolean) TO authenticated;

-- One-shot: activate package for a student by name (used when admin approves). Does not depend on client state.
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

GRANT EXECUTE ON FUNCTION public.activate_package_for_student(text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.activate_package_for_student(text, text, uuid) TO authenticated;

-- Deduct classes from a student (attendance). Bypasses RLS so legacy admins can update.
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
  IF p_count IS NULL OR p_count < 1 THEN
    RETURN;
  END IF;
  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id LIMIT 1;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  IF v_student.balance IS NULL THEN
    RETURN;  /* unlimited: no deduction */
  END IF;
  IF v_student.balance < p_count THEN
    RETURN;  /* not enough */
  END IF;

  v_active_packs := COALESCE(v_student.active_packs, '[]'::jsonb);
  v_remaining := p_count;

  IF jsonb_array_length(v_active_packs) > 0 THEN
    FOR v_elem IN
      SELECT elem FROM jsonb_array_elements(v_active_packs) AS elem
      ORDER BY (elem->>'expires_at')::timestamptz
    LOOP
      EXIT WHEN v_remaining <= 0;
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

COMMENT ON FUNCTION public.deduct_student_classes(text, uuid, int) IS 'Deduct classes for attendance; used when admin scans QR. Bypasses RLS.';
GRANT EXECUTE ON FUNCTION public.deduct_student_classes(text, uuid, int) TO anon;
GRANT EXECUTE ON FUNCTION public.deduct_student_classes(text, uuid, int) TO authenticated;

-- =============================================================================
-- Admin management (bypass RLS for legacy admins who have no auth.uid())
-- =============================================================================

CREATE OR REPLACE FUNCTION public.admin_insert_for_school(
  p_school_id uuid,
  p_username text,
  p_password text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id text;
  v_row public.admins%ROWTYPE;
BEGIN
  v_id := 'ADM-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  INSERT INTO public.admins (id, username, password, school_id)
  VALUES (v_id, trim(p_username), p_password, p_school_id)
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_insert_for_school(uuid, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_insert_for_school(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_delete_for_school(p_admin_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.admins WHERE id = p_admin_id;
$$;
GRANT EXECUTE ON FUNCTION public.admin_delete_for_school(text) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_for_school(text) TO authenticated;

-- Classes: insert, update single field, delete (SECURITY DEFINER so legacy admins can add classes)
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
GRANT EXECUTE ON FUNCTION public.class_insert_for_school(uuid, text, text, text, numeric, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.class_insert_for_school(uuid, text, text, text, numeric, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.class_update_field(p_id bigint, p_field text, p_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.class_update_field(bigint, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.class_update_field(bigint, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.class_delete_for_school(p_class_id bigint)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.classes WHERE id = p_class_id;
$$;
GRANT EXECUTE ON FUNCTION public.class_delete_for_school(bigint) TO anon;
GRANT EXECUTE ON FUNCTION public.class_delete_for_school(bigint) TO authenticated;

-- Subscriptions (plans): insert, update single field, delete (SECURITY DEFINER for legacy admins)
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
GRANT EXECUTE ON FUNCTION public.subscription_insert_for_school(uuid, text, numeric, int, int) TO anon;
GRANT EXECUTE ON FUNCTION public.subscription_insert_for_school(uuid, text, numeric, int, int) TO authenticated;

CREATE OR REPLACE FUNCTION public.subscription_update_field(p_id text, p_field text, p_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
GRANT EXECUTE ON FUNCTION public.subscription_update_field(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.subscription_update_field(text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.subscription_delete_for_school(p_sub_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.subscriptions WHERE id::text = p_sub_id;
$$;
GRANT EXECUTE ON FUNCTION public.subscription_delete_for_school(text) TO anon;
GRANT EXECUTE ON FUNCTION public.subscription_delete_for_school(text) TO authenticated;

-- Admin settings (transfer/bank details): upsert one key
CREATE OR REPLACE FUNCTION public.admin_setting_upsert(p_school_id uuid, p_key text, p_value text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.admin_settings (school_id, key, value)
  VALUES (p_school_id, p_key, coalesce(p_value, ''))
  ON CONFLICT (school_id, key) DO UPDATE SET value = coalesce(p_value, '');
$$;
GRANT EXECUTE ON FUNCTION public.admin_setting_upsert(uuid, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_setting_upsert(uuid, text, text) TO authenticated;
