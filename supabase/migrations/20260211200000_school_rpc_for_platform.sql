-- Platform admin only: insert school and delete school (bypass RLS via SECURITY DEFINER).
-- Used when direct table INSERT/DELETE is blocked because platform_admins.user_id is not yet linked.

-- Insert a new school (platform admin only)
CREATE OR REPLACE FUNCTION public.school_insert_by_platform(p_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.schools%ROWTYPE;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Permission denied: only platform admin can create schools.';
  END IF;
  INSERT INTO public.schools (name) VALUES (trim(p_name))
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;

COMMENT ON FUNCTION public.school_insert_by_platform(text) IS 'Insert school; platform admin only. Bypasses RLS.';
GRANT EXECUTE ON FUNCTION public.school_insert_by_platform(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_insert_by_platform(text) TO anon;

-- Delete a school and all related data (platform admin only)
CREATE OR REPLACE FUNCTION public.school_delete_by_platform(p_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count int;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Permission denied: only platform admin can delete schools.';
  END IF;
  -- Delete children first (order matters for FKs; competitions CASCADEs to competition_registrations)
  DELETE FROM public.competitions WHERE school_id = p_school_id;
  DELETE FROM public.payment_requests WHERE school_id = p_school_id;
  DELETE FROM public.classes WHERE school_id = p_school_id;
  DELETE FROM public.subscriptions WHERE school_id = p_school_id;
  DELETE FROM public.students WHERE school_id = p_school_id;
  DELETE FROM public.admins WHERE school_id = p_school_id;
  -- Then the school
  DELETE FROM public.schools WHERE id = p_school_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN jsonb_build_object('deleted', v_deleted_count > 0);
END;
$$;

COMMENT ON FUNCTION public.school_delete_by_platform(uuid) IS 'Delete school and related data; platform admin only. Bypasses RLS.';
GRANT EXECUTE ON FUNCTION public.school_delete_by_platform(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.school_delete_by_platform(uuid) TO anon;
