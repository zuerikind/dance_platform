-- =============================================================================
-- Auré admin "move class registration" audit trail.
-- Cancel + pending audit in ONE transaction. Caller then register_for_class +
-- admin_complete_class_move. Reusable table; RPCs gate on is_aure_school.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.admin_class_move_pending (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  initiated_by uuid NOT NULL,
  student_id text NOT NULL,
  cancelled_registration_id uuid NOT NULL REFERENCES public.class_registrations(id) ON DELETE CASCADE,
  intended_class_id bigint NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  intended_class_date date NOT NULL,
  student_name_snapshot text,
  old_class_name_snapshot text,
  old_class_date_snapshot date,
  intended_class_name_snapshot text,
  intended_class_time_snapshot text,
  status text NOT NULL DEFAULT 'pending_register'
    CHECK (status IN ('pending_register', 'completed', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_admin_class_move_pending_school_status
  ON public.admin_class_move_pending(school_id, status)
  WHERE status = 'pending_register';

COMMENT ON TABLE public.admin_class_move_pending IS
  'Incomplete admin moves: cancel succeeded; register may not have completed. Auré-first (RPC guard).';

ALTER TABLE public.admin_class_move_pending ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_class_move_pending_no_direct" ON public.admin_class_move_pending;
CREATE POLICY "admin_class_move_pending_no_direct" ON public.admin_class_move_pending
  FOR ALL USING (false) WITH CHECK (false);


CREATE OR REPLACE FUNCTION public.admin_begin_class_move(
  p_registration_id uuid,
  p_target_class_id bigint,
  p_target_class_date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg public.class_registrations%ROWTYPE;
  v_target public.classes%ROWTYPE;
  v_old_class public.classes%ROWTYPE;
  v_student_name text;
  v_audit_id uuid;
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;

  SELECT * INTO v_reg
  FROM public.class_registrations
  WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found.';
  END IF;

  IF NOT public.is_aure_school(v_reg.school_id) THEN
    RAISE EXCEPTION 'This action is only available for Auré.';
  END IF;

  IF NOT (public.is_school_admin(v_reg.school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied: only a school admin can move this registration.';
  END IF;

  IF v_reg.status IS DISTINCT FROM 'registered' THEN
    RAISE EXCEPTION 'Only an active registered class can be moved.';
  END IF;

  IF v_reg.class_id = p_target_class_id AND v_reg.class_date = p_target_class_date THEN
    RAISE EXCEPTION 'Choose a different class or date than the current registration.';
  END IF;

  SELECT * INTO v_target
  FROM public.classes
  WHERE id = p_target_class_id AND school_id = v_reg.school_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target class not found for this school.';
  END IF;

  SELECT * INTO v_old_class FROM public.classes WHERE id = v_reg.class_id;

  SELECT trim(COALESCE(s.name, '')) INTO v_student_name
  FROM public.students s
  WHERE s.id::text = v_reg.student_id AND s.school_id = v_reg.school_id;

  UPDATE public.class_registrations
  SET status = 'cancelled', cancelled_at = now()
  WHERE id = p_registration_id AND status = 'registered'
  RETURNING * INTO v_reg;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Could not cancel registration (it may have changed).';
  END IF;

  INSERT INTO public.admin_class_move_pending (
    school_id,
    initiated_by,
    student_id,
    cancelled_registration_id,
    intended_class_id,
    intended_class_date,
    student_name_snapshot,
    old_class_name_snapshot,
    old_class_date_snapshot,
    intended_class_name_snapshot,
    intended_class_time_snapshot,
    status
  ) VALUES (
    v_reg.school_id,
    v_uid,
    v_reg.student_id,
    p_registration_id,
    p_target_class_id,
    p_target_class_date,
    NULLIF(trim(COALESCE(v_student_name, '')), ''),
    COALESCE(v_old_class.name, ''),
    v_reg.class_date,
    COALESCE(v_target.name, ''),
    COALESCE(v_target.time::text, ''),
    'pending_register'
  )
  RETURNING id INTO v_audit_id;

  RETURN jsonb_build_object(
    'audit_id', v_audit_id,
    'student_id', v_reg.student_id,
    'school_id', v_reg.school_id,
    'intended_class_id', p_target_class_id,
    'intended_class_date', p_target_class_date
  );
END;
$$;

COMMENT ON FUNCTION public.admin_begin_class_move(uuid, bigint, date) IS
  'Auré admin: cancel registration and record pending move in one transaction.';

GRANT EXECUTE ON FUNCTION public.admin_begin_class_move(uuid, bigint, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_begin_class_move(uuid, bigint, date) TO anon;


CREATE OR REPLACE FUNCTION public.admin_complete_class_move(p_audit_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.admin_class_move_pending%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.admin_class_move_pending WHERE id = p_audit_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Audit record not found.';
  END IF;

  IF NOT (public.is_school_admin(v_row.school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied.';
  END IF;

  IF v_row.status IS DISTINCT FROM 'pending_register' THEN
    RETURN;
  END IF;

  UPDATE public.admin_class_move_pending
  SET status = 'completed', resolved_at = now()
  WHERE id = p_audit_id AND status = 'pending_register';
END;
$$;

COMMENT ON FUNCTION public.admin_complete_class_move(uuid) IS
  'Mark admin class move audit completed after successful register_for_class.';

GRANT EXECUTE ON FUNCTION public.admin_complete_class_move(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_complete_class_move(uuid) TO anon;


CREATE OR REPLACE FUNCTION public.admin_dismiss_class_move(p_audit_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.admin_class_move_pending%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.admin_class_move_pending WHERE id = p_audit_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Audit record not found.';
  END IF;

  IF NOT (public.is_school_admin(v_row.school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied.';
  END IF;

  IF v_row.status IS DISTINCT FROM 'pending_register' THEN
    RETURN;
  END IF;

  UPDATE public.admin_class_move_pending
  SET status = 'dismissed', resolved_at = now()
  WHERE id = p_audit_id AND status = 'pending_register';
END;
$$;

COMMENT ON FUNCTION public.admin_dismiss_class_move(uuid) IS
  'Dismiss pending move reminder after manual fix or false positive.';

GRANT EXECUTE ON FUNCTION public.admin_dismiss_class_move(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_dismiss_class_move(uuid) TO anon;


CREATE OR REPLACE FUNCTION public.admin_list_pending_class_moves(p_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb := '[]'::jsonb;
  v_row record;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied.';
  END IF;

  IF NOT public.is_aure_school(p_school_id) THEN
    RETURN '[]'::jsonb;
  END IF;

  FOR v_row IN
    SELECT m.id, m.student_id, m.intended_class_id, m.intended_class_date,
           m.student_name_snapshot, m.old_class_name_snapshot, m.old_class_date_snapshot,
           m.intended_class_name_snapshot, m.intended_class_time_snapshot, m.created_at
    FROM public.admin_class_move_pending m
    WHERE m.school_id = p_school_id AND m.status = 'pending_register'
    ORDER BY m.created_at DESC
  LOOP
    v_result := v_result || jsonb_build_object(
      'id', v_row.id,
      'student_id', v_row.student_id,
      'intended_class_id', v_row.intended_class_id,
      'intended_class_date', v_row.intended_class_date,
      'student_name_snapshot', v_row.student_name_snapshot,
      'old_class_name_snapshot', v_row.old_class_name_snapshot,
      'old_class_date_snapshot', v_row.old_class_date_snapshot,
      'intended_class_name_snapshot', v_row.intended_class_name_snapshot,
      'intended_class_time_snapshot', v_row.intended_class_time_snapshot,
      'created_at', v_row.created_at
    );
  END LOOP;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.admin_list_pending_class_moves(uuid) IS
  'List incomplete Auré admin class moves for dashboard banner.';

GRANT EXECUTE ON FUNCTION public.admin_list_pending_class_moves(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_pending_class_moves(uuid) TO anon;
