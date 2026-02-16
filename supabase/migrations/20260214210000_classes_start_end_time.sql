-- Classes: add end_time so each class has both start (time) and end time.
-- Existing 'time' column remains the start time.

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS end_time text DEFAULT NULL;

COMMENT ON COLUMN public.classes.end_time IS 'End time (HH:MM). When set, class is shown as start–end.';

-- Backfill: set end_time = time so existing rows have both (admin can edit later).
UPDATE public.classes SET end_time = time WHERE end_time IS NULL AND time IS NOT NULL;

-- class_update_field: allow updating end_time
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
  ELSIF p_field = 'end_time' THEN
    UPDATE public.classes SET end_time = nullif(trim(p_value), '') WHERE id = p_id;
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

-- class_insert_for_school: add optional end_time (defaults to start time so both are set)
CREATE OR REPLACE FUNCTION public.class_insert_for_school(
  p_school_id uuid,
  p_name text DEFAULT 'New Class',
  p_day text DEFAULT 'Mon',
  p_time text DEFAULT '09:00',
  p_price numeric DEFAULT 0,
  p_tag text DEFAULT '',
  p_location text DEFAULT '',
  p_end_time text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.classes%ROWTYPE;
  v_end text := coalesce(nullif(trim(p_end_time), ''), p_time);
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;
  BEGIN
    INSERT INTO public.classes (school_id, name, day, time, end_time, price, tag, location)
    VALUES (p_school_id, coalesce(nullif(trim(p_name), ''), 'New Class'), coalesce(nullif(trim(p_day), ''), 'Mon'),
            coalesce(nullif(trim(p_time), ''), '09:00'), v_end, coalesce(p_price, 0), coalesce(trim(p_tag), ''),
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
