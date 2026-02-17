-- Private Teacher profile type: add profile_type to schools, teacher_availability, private_class_requests.

-- 1) Add profile_type to schools
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS profile_type text NOT NULL DEFAULT 'school';

COMMENT ON COLUMN public.schools.profile_type IS 'school or private_teacher';

-- 2) teacher_availability: recurring weekly availability for private teachers
CREATE TABLE IF NOT EXISTS public.teacher_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Mon','Tue','Wed','Thu','Fri','Sat','Sun')),
  start_time text NOT NULL,
  end_time text NOT NULL,
  location text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_avail_school ON public.teacher_availability(school_id);

COMMENT ON TABLE public.teacher_availability IS 'Recurring weekly availability for private teachers. Expanded into 30-min slots at query time.';

-- RLS
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_avail_select" ON public.teacher_availability;
CREATE POLICY "teacher_avail_select" ON public.teacher_availability
  FOR SELECT USING (
    public.is_school_admin(school_id)
    OR public.is_platform_admin()
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.school_id = teacher_availability.school_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "teacher_avail_insert" ON public.teacher_availability;
CREATE POLICY "teacher_avail_insert" ON public.teacher_availability
  FOR INSERT WITH CHECK (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "teacher_avail_update" ON public.teacher_availability;
CREATE POLICY "teacher_avail_update" ON public.teacher_availability
  FOR UPDATE USING (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "teacher_avail_delete" ON public.teacher_availability;
CREATE POLICY "teacher_avail_delete" ON public.teacher_availability
  FOR DELETE USING (public.is_school_admin(school_id) OR public.is_platform_admin());

-- 3) private_class_requests: student requests for private classes
CREATE TABLE IF NOT EXISTS public.private_class_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id text NOT NULL,
  requested_date date NOT NULL,
  requested_time text NOT NULL,
  location text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_pcr_school ON public.private_class_requests(school_id);
CREATE INDEX IF NOT EXISTS idx_pcr_student ON public.private_class_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_pcr_date ON public.private_class_requests(school_id, requested_date);

COMMENT ON TABLE public.private_class_requests IS 'Student requests for private classes with a teacher. Teacher accepts or declines.';

-- RLS
ALTER TABLE public.private_class_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pcr_select_admin" ON public.private_class_requests;
CREATE POLICY "pcr_select_admin" ON public.private_class_requests
  FOR SELECT USING (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "pcr_select_student" ON public.private_class_requests;
CREATE POLICY "pcr_select_student" ON public.private_class_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = private_class_requests.student_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "pcr_insert" ON public.private_class_requests;
CREATE POLICY "pcr_insert" ON public.private_class_requests
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.students s WHERE s.school_id = private_class_requests.school_id AND s.user_id = auth.uid())
    OR public.is_school_admin(school_id)
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "pcr_update" ON public.private_class_requests;
CREATE POLICY "pcr_update" ON public.private_class_requests
  FOR UPDATE USING (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "pcr_delete" ON public.private_class_requests;
CREATE POLICY "pcr_delete" ON public.private_class_requests
  FOR DELETE USING (public.is_school_admin(school_id) OR public.is_platform_admin());

-- 4) RPCs

-- get_teacher_availability: returns availability rows for a school
CREATE OR REPLACE FUNCTION public.get_teacher_availability(p_school_id uuid)
RETURNS SETOF public.teacher_availability
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.teacher_availability WHERE school_id = p_school_id ORDER BY
    CASE day_of_week WHEN 'Mon' THEN 1 WHEN 'Tue' THEN 2 WHEN 'Wed' THEN 3 WHEN 'Thu' THEN 4 WHEN 'Fri' THEN 5 WHEN 'Sat' THEN 6 WHEN 'Sun' THEN 7 END,
    start_time;
$$;
GRANT EXECUTE ON FUNCTION public.get_teacher_availability(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_teacher_availability(uuid) TO anon;

-- upsert_teacher_availability: add or update an availability slot
CREATE OR REPLACE FUNCTION public.upsert_teacher_availability(
  p_school_id uuid,
  p_day_of_week text,
  p_start_time text,
  p_end_time text,
  p_location text DEFAULT NULL,
  p_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_row public.teacher_availability%ROWTYPE;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  IF p_id IS NOT NULL THEN
    UPDATE public.teacher_availability
    SET day_of_week = p_day_of_week, start_time = p_start_time, end_time = p_end_time, location = nullif(trim(p_location), '')
    WHERE id = p_id AND school_id = p_school_id
    RETURNING * INTO v_row;
  ELSE
    INSERT INTO public.teacher_availability (school_id, day_of_week, start_time, end_time, location)
    VALUES (p_school_id, p_day_of_week, p_start_time, p_end_time, nullif(trim(p_location), ''))
    RETURNING * INTO v_row;
  END IF;
  RETURN to_jsonb(v_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.upsert_teacher_availability(uuid, text, text, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_teacher_availability(uuid, text, text, text, text, uuid) TO anon;

-- delete_teacher_availability
CREATE OR REPLACE FUNCTION public.delete_teacher_availability(p_id uuid, p_school_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  DELETE FROM public.teacher_availability WHERE id = p_id AND school_id = p_school_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.delete_teacher_availability(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_teacher_availability(uuid, uuid) TO anon;

-- create_private_class_request: student requests a class
CREATE OR REPLACE FUNCTION public.create_private_class_request(
  p_school_id uuid,
  p_student_id text,
  p_requested_date date,
  p_requested_time text,
  p_location text DEFAULT NULL,
  p_message text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_row public.private_class_requests%ROWTYPE;
BEGIN
  -- Only the student themselves or school admin can create a request
  IF NOT (
    public.is_school_admin(p_school_id)
    OR public.is_platform_admin()
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = p_student_id AND s.school_id = p_school_id AND s.user_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'Permission denied: only the student or admin can create a request';
  END IF;
  INSERT INTO public.private_class_requests (school_id, student_id, requested_date, requested_time, location, message)
  VALUES (p_school_id, p_student_id, p_requested_date, p_requested_time, nullif(trim(p_location), ''), nullif(trim(p_message), ''))
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_private_class_request(uuid, text, date, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_private_class_request(uuid, text, date, text, text, text) TO anon;

-- teacher_respond_to_request: accept or decline
CREATE OR REPLACE FUNCTION public.teacher_respond_to_request(p_request_id uuid, p_accept boolean)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
  v_row public.private_class_requests%ROWTYPE;
BEGIN
  SELECT school_id INTO v_school_id FROM public.private_class_requests WHERE id = p_request_id;
  IF v_school_id IS NULL THEN RAISE EXCEPTION 'Request not found'; END IF;
  IF NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  UPDATE public.private_class_requests
  SET status = CASE WHEN p_accept THEN 'accepted' ELSE 'declined' END,
      responded_at = now()
  WHERE id = p_request_id
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;
GRANT EXECUTE ON FUNCTION public.teacher_respond_to_request(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.teacher_respond_to_request(uuid, boolean) TO anon;

-- get_private_class_requests_for_school: admin view
CREATE OR REPLACE FUNCTION public.get_private_class_requests_for_school(p_school_id uuid)
RETURNS SETOF public.private_class_requests
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.private_class_requests
  WHERE school_id = p_school_id
  ORDER BY created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.get_private_class_requests_for_school(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_private_class_requests_for_school(uuid) TO anon;

-- get_available_slots_for_week: expand availability into 30-min slots, mark blocked ones
CREATE OR REPLACE FUNCTION public.get_available_slots_for_week(p_school_id uuid, p_week_start date)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_day record;
  v_result jsonb := '[]'::jsonb;
  v_day_date date;
  v_day_name text;
  v_day_idx int;
  v_slots jsonb;
  v_slot_time time;
  v_end_time time;
  v_start time;
  v_avail record;
  v_blocked boolean;
  v_day_names text[] := ARRAY['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
BEGIN
  FOR v_day_idx IN 0..6 LOOP
    v_day_date := p_week_start + v_day_idx;
    v_day_name := v_day_names[v_day_idx + 1];
    v_slots := '[]'::jsonb;
    FOR v_avail IN
      SELECT start_time, end_time, location FROM public.teacher_availability
      WHERE school_id = p_school_id AND day_of_week = v_day_name
      ORDER BY start_time
    LOOP
      v_start := v_avail.start_time::time;
      v_end_time := v_avail.end_time::time;
      v_slot_time := v_start;
      WHILE v_slot_time < v_end_time LOOP
        v_blocked := EXISTS (
          SELECT 1 FROM public.private_class_requests
          WHERE school_id = p_school_id
            AND requested_date = v_day_date
            AND requested_time = to_char(v_slot_time, 'HH24:MI')
            AND status IN ('pending', 'accepted')
        );
        v_slots := v_slots || jsonb_build_object(
          'time', to_char(v_slot_time, 'HH24:MI'),
          'available', NOT v_blocked,
          'location', coalesce(v_avail.location, '')
        );
        v_slot_time := v_slot_time + interval '30 minutes';
      END LOOP;
    END LOOP;
    v_result := v_result || jsonb_build_array(jsonb_build_object(
      'date', to_char(v_day_date, 'YYYY-MM-DD'),
      'dayName', v_day_name,
      'dayNumber', extract(day from v_day_date)::int,
      'hasAvailability', jsonb_array_length(v_slots) > 0,
      'slots', v_slots
    ));
  END LOOP;
  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_available_slots_for_week(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_slots_for_week(uuid, date) TO anon;

-- 5) Extend school_insert_by_platform to accept p_profile_type
DROP FUNCTION IF EXISTS public.school_insert_by_platform(text, text, text, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.school_insert_by_platform(
  p_name text,
  p_discovery_slug text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_discovery_description text DEFAULT NULL,
  p_discovery_genres jsonb DEFAULT NULL,
  p_profile_type text DEFAULT 'school'
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_row public.schools%ROWTYPE;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Permission denied: only platform admin can create schools.';
  END IF;
  INSERT INTO public.schools (name, discovery_slug, country, city, discovery_description, discovery_genres, profile_type)
  VALUES (
    trim(p_name),
    nullif(trim(p_discovery_slug), ''),
    nullif(trim(p_country), ''),
    nullif(trim(p_city), ''),
    nullif(trim(p_discovery_description), ''),
    COALESCE(p_discovery_genres, '[]'::jsonb),
    COALESCE(nullif(trim(p_profile_type), ''), 'school')
  )
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;

COMMENT ON FUNCTION public.school_insert_by_platform(text, text, text, text, text, jsonb, text) IS 'Insert school/teacher with optional discovery fields and profile_type; platform admin only.';
GRANT EXECUTE ON FUNCTION public.school_insert_by_platform(text, text, text, text, text, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_insert_by_platform(text, text, text, text, text, jsonb, text) TO anon;
