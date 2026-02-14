-- =============================================================================
-- Class Registration System
-- Allows schools to enable per-class registration with capacity limits,
-- student self-service cancel (up to 4h before), and automatic deduction.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) SCHEMA CHANGES
-- -----------------------------------------------------------------------------

-- 1a) schools: feature toggle
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS class_registration_enabled boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.schools.class_registration_enabled
  IS 'When true, students can register for specific class occurrences. Default off.';

-- 1b) classes: capacity per class
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS max_capacity int DEFAULT NULL;

COMMENT ON COLUMN public.classes.max_capacity
  IS 'Maximum students allowed per occurrence. NULL = unlimited / no cap.';

-- 1c) class_registrations table
CREATE TABLE IF NOT EXISTS public.class_registrations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id       bigint NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id     text NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id      uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_date     date NOT NULL,
  status         text NOT NULL DEFAULT 'registered'
                   CHECK (status IN ('registered','cancelled','attended','no_show')),
  deducted       boolean NOT NULL DEFAULT false,
  created_at     timestamptz DEFAULT now(),
  cancelled_at   timestamptz,
  UNIQUE(class_id, student_id, class_date)
);

CREATE INDEX IF NOT EXISTS idx_class_reg_school_date
  ON public.class_registrations(school_id, class_date);
CREATE INDEX IF NOT EXISTS idx_class_reg_student
  ON public.class_registrations(student_id, school_id);
CREATE INDEX IF NOT EXISTS idx_class_reg_class_date_status
  ON public.class_registrations(class_id, class_date, status);

-- -----------------------------------------------------------------------------
-- 2) RLS for class_registrations
-- -----------------------------------------------------------------------------

ALTER TABLE public.class_registrations ENABLE ROW LEVEL SECURITY;

-- Students: read/insert/update own registrations
DROP POLICY IF EXISTS "class_reg_student_select" ON public.class_registrations;
CREATE POLICY "class_reg_student_select" ON public.class_registrations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id::text = class_registrations.student_id AND s.user_id = auth.uid())
    OR public.is_school_admin(class_registrations.school_id)
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "class_reg_student_insert" ON public.class_registrations;
CREATE POLICY "class_reg_student_insert" ON public.class_registrations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id::text = class_registrations.student_id AND s.user_id = auth.uid())
    OR public.is_school_admin(class_registrations.school_id)
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "class_reg_student_update" ON public.class_registrations;
CREATE POLICY "class_reg_student_update" ON public.class_registrations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id::text = class_registrations.student_id AND s.user_id = auth.uid())
    OR public.is_school_admin(class_registrations.school_id)
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "class_reg_delete" ON public.class_registrations;
CREATE POLICY "class_reg_delete" ON public.class_registrations
  FOR DELETE USING (
    public.is_school_admin(class_registrations.school_id)
    OR public.is_platform_admin()
  );

-- -----------------------------------------------------------------------------
-- 3) RPC: toggle_class_registration_enabled
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.toggle_class_registration_enabled(
  p_school_id uuid,
  p_enabled boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.schools%ROWTYPE;
BEGIN
  UPDATE public.schools
  SET class_registration_enabled = p_enabled
  WHERE id = p_school_id
  RETURNING * INTO v_row;

  IF v_row IS NULL THEN
    RAISE EXCEPTION 'School not found.';
  END IF;
  RETURN to_jsonb(v_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_class_registration_enabled(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_class_registration_enabled(uuid, boolean) TO anon;

-- -----------------------------------------------------------------------------
-- 4) Extend class_update_field to support max_capacity
-- -----------------------------------------------------------------------------

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
  ELSIF p_field = 'max_capacity' THEN
    IF p_value IS NULL OR trim(p_value) = '' THEN
      UPDATE public.classes SET max_capacity = NULL WHERE id = p_id;
    ELSE
      UPDATE public.classes SET max_capacity = (p_value::int) WHERE id = p_id;
    END IF;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.class_update_field(bigint, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.class_update_field(bigint, text, text) TO authenticated;

-- -----------------------------------------------------------------------------
-- 5) RPC: register_for_class
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.register_for_class(
  p_student_id text,
  p_class_id bigint,
  p_school_id uuid,
  p_class_date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_class public.classes%ROWTYPE;
  v_student public.students%ROWTYPE;
  v_count int;
  v_row public.class_registrations%ROWTYPE;
BEGIN
  -- Validate class exists and belongs to school
  SELECT * INTO v_class FROM public.classes WHERE id = p_class_id AND school_id = p_school_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Class not found.';
  END IF;

  -- Validate student exists and belongs to school
  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found.';
  END IF;

  -- Check student has an active package (paid with balance > 0 or unlimited)
  IF NOT v_student.paid THEN
    RAISE EXCEPTION 'No active membership. Please purchase a plan first.';
  END IF;

  -- Check capacity (only count currently registered)
  IF v_class.max_capacity IS NOT NULL THEN
    SELECT count(*) INTO v_count
    FROM public.class_registrations
    WHERE class_id = p_class_id
      AND class_date = p_class_date
      AND status = 'registered';

    IF v_count >= v_class.max_capacity THEN
      RAISE EXCEPTION 'Class is full. No spots available.';
    END IF;
  END IF;

  -- Re-use existing row if student previously cancelled (allows sign up again after cancel)
  SELECT * INTO v_row
  FROM public.class_registrations
  WHERE class_id = p_class_id AND student_id = p_student_id AND class_date = p_class_date;

  IF FOUND THEN
    IF v_row.status = 'registered' THEN
      RAISE EXCEPTION 'Already registered for this class.';
    END IF;
    UPDATE public.class_registrations
    SET status = 'registered', cancelled_at = NULL
    WHERE id = v_row.id
    RETURNING * INTO v_row;
  ELSE
    INSERT INTO public.class_registrations (class_id, student_id, school_id, class_date, status)
    VALUES (p_class_id, p_student_id, p_school_id, p_class_date, 'registered')
    RETURNING * INTO v_row;
  END IF;

  RETURN to_jsonb(v_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_for_class(text, bigint, uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_for_class(text, bigint, uuid, date) TO anon;

-- -----------------------------------------------------------------------------
-- 6) RPC: cancel_class_registration
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.cancel_class_registration(
  p_registration_id uuid,
  p_student_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg public.class_registrations%ROWTYPE;
  v_class public.classes%ROWTYPE;
  v_class_datetime timestamptz;
BEGIN
  SELECT * INTO v_reg
  FROM public.class_registrations
  WHERE id = p_registration_id AND student_id = p_student_id AND status = 'registered';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found or already cancelled.';
  END IF;

  -- Get class time to check 4h deadline
  SELECT * INTO v_class FROM public.classes WHERE id = v_reg.class_id;

  -- Build full datetime: class_date + class time
  v_class_datetime := (v_reg.class_date || ' ' || coalesce(v_class.time, '23:59'))::timestamptz;

  IF v_class_datetime - interval '4 hours' <= now() THEN
    RAISE EXCEPTION 'Cannot cancel less than 4 hours before class.';
  END IF;

  UPDATE public.class_registrations
  SET status = 'cancelled', cancelled_at = now()
  WHERE id = p_registration_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_class_registration(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_class_registration(uuid, text) TO anon;

-- -----------------------------------------------------------------------------
-- 7) RPC: get_class_availability (spots per class for a given date)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_class_availability(
  p_school_id uuid,
  p_class_date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb := '[]'::jsonb;
  v_class record;
  v_count int;
BEGIN
  FOR v_class IN
    SELECT c.id, c.name, c.day, c.time, c.max_capacity
    FROM public.classes c
    WHERE c.school_id = p_school_id
  LOOP
    SELECT count(*) INTO v_count
    FROM public.class_registrations cr
    WHERE cr.class_id = v_class.id
      AND cr.class_date = p_class_date
      AND cr.status = 'registered';

    v_result := v_result || jsonb_build_object(
      'class_id', v_class.id,
      'class_name', v_class.name,
      'day', v_class.day,
      'time', v_class.time,
      'max_capacity', v_class.max_capacity,
      'registered_count', v_count,
      'spots_left', CASE
        WHEN v_class.max_capacity IS NULL THEN NULL
        ELSE GREATEST(v_class.max_capacity - v_count, 0)
      END
    );
  END LOOP;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_class_availability(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_class_availability(uuid, date) TO anon;

-- -----------------------------------------------------------------------------
-- 8) RPC: get_student_upcoming_registrations
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_student_upcoming_registrations(
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
  FOR v_row IN
    SELECT cr.id, cr.class_id, cr.class_date, cr.status, cr.created_at, cr.cancelled_at, cr.deducted,
           c.name AS class_name, c.day, c.time, c.location, c.tag
    FROM public.class_registrations cr
    JOIN public.classes c ON c.id = cr.class_id
    WHERE cr.student_id = p_student_id
      AND cr.school_id = p_school_id
      AND cr.class_date >= CURRENT_DATE
    ORDER BY cr.class_date, c.time
  LOOP
    v_result := v_result || jsonb_build_object(
      'id', v_row.id,
      'class_id', v_row.class_id,
      'class_date', v_row.class_date,
      'status', v_row.status,
      'created_at', v_row.created_at,
      'cancelled_at', v_row.cancelled_at,
      'deducted', v_row.deducted,
      'class_name', v_row.class_name,
      'day', v_row.day,
      'time', v_row.time,
      'location', v_row.location,
      'tag', v_row.tag
    );
  END LOOP;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_upcoming_registrations(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_upcoming_registrations(text, uuid) TO anon;

-- -----------------------------------------------------------------------------
-- 9) RPC: get_student_past_registrations
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_student_past_registrations(
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
  FOR v_row IN
    SELECT cr.id, cr.class_id, cr.class_date, cr.status, cr.created_at, cr.cancelled_at, cr.deducted,
           c.name AS class_name, c.day, c.time, c.location, c.tag
    FROM public.class_registrations cr
    JOIN public.classes c ON c.id = cr.class_id
    WHERE cr.student_id = p_student_id
      AND cr.school_id = p_school_id
      AND cr.class_date < CURRENT_DATE
    ORDER BY cr.class_date DESC, c.time DESC
    LIMIT 50
  LOOP
    v_result := v_result || jsonb_build_object(
      'id', v_row.id,
      'class_id', v_row.class_id,
      'class_date', v_row.class_date,
      'status', v_row.status,
      'created_at', v_row.created_at,
      'cancelled_at', v_row.cancelled_at,
      'deducted', v_row.deducted,
      'class_name', v_row.class_name,
      'day', v_row.day,
      'time', v_row.time,
      'location', v_row.location,
      'tag', v_row.tag
    );
  END LOOP;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_past_registrations(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_past_registrations(text, uuid) TO anon;

-- -----------------------------------------------------------------------------
-- 10) RPC: get_class_registrations_for_date (admin view / scanner)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_class_registrations_for_date(
  p_school_id uuid,
  p_class_date date
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
  FOR v_row IN
    SELECT cr.id, cr.class_id, cr.student_id, cr.class_date, cr.status, cr.deducted,
           c.name AS class_name, c.time AS class_time,
           s.name AS student_name
    FROM public.class_registrations cr
    JOIN public.classes c ON c.id = cr.class_id
    JOIN public.students s ON s.id::text = cr.student_id
    WHERE cr.school_id = p_school_id
      AND cr.class_date = p_class_date
    ORDER BY c.time, s.name
  LOOP
    v_result := v_result || jsonb_build_object(
      'id', v_row.id,
      'class_id', v_row.class_id,
      'student_id', v_row.student_id,
      'class_date', v_row.class_date,
      'status', v_row.status,
      'deducted', v_row.deducted,
      'class_name', v_row.class_name,
      'class_time', v_row.class_time,
      'student_name', v_row.student_name
    );
  END LOOP;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_class_registrations_for_date(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_class_registrations_for_date(uuid, date) TO anon;

-- -----------------------------------------------------------------------------
-- 11) RPC: process_expired_registrations (lazy auto-deduction)
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
  FOR v_reg IN
    SELECT cr.id, cr.student_id, cr.class_id, cr.class_date,
           c.time AS class_time
    FROM public.class_registrations cr
    JOIN public.classes c ON c.id = cr.class_id
    WHERE cr.school_id = p_school_id
      AND cr.status = 'registered'
      AND cr.deducted = false
  LOOP
    -- Build the class datetime
    v_class_datetime := (v_reg.class_date || ' ' || coalesce(v_reg.class_time, '23:59'))::timestamptz;

    -- Only process if class time has passed
    IF v_class_datetime <= now() THEN
      -- Mark as no_show and deduct
      UPDATE public.class_registrations
      SET status = 'no_show', deducted = true
      WHERE id = v_reg.id;

      -- Deduct one class from student package
      PERFORM public.deduct_student_classes(v_reg.student_id, p_school_id, 1);

      v_processed := v_processed + 1;
    END IF;
  END LOOP;

  RETURN v_processed;
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_expired_registrations(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_expired_registrations(uuid) TO anon;

-- -----------------------------------------------------------------------------
-- 12) RPC: mark_registration_attended (used by QR scanner)
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
  SELECT * INTO v_reg
  FROM public.class_registrations
  WHERE id = p_registration_id
    AND school_id = p_school_id
    AND status = 'registered';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found or not in registered status.';
  END IF;

  -- Mark attended and deducted
  UPDATE public.class_registrations
  SET status = 'attended', deducted = true
  WHERE id = p_registration_id;

  -- Deduct one class from student package
  PERFORM public.deduct_student_classes(v_reg.student_id, p_school_id, 1);
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_registration_attended(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_registration_attended(uuid, uuid) TO anon;

-- -----------------------------------------------------------------------------
-- 13) RPC: get_student_registrations_for_today (used by QR scanner)
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

GRANT EXECUTE ON FUNCTION public.get_student_registrations_for_today(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_registrations_for_today(text, uuid) TO anon;
