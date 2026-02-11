-- Allow admin to change decision for APPROVED/DECLINED (not just SUBMITTED)
CREATE OR REPLACE FUNCTION public.competition_registration_decide(
  p_registration_id uuid,
  p_status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
  v_row public.competition_registrations;
BEGIN
  IF p_status NOT IN ('APPROVED', 'DECLINED') THEN
    RETURN NULL;
  END IF;
  SELECT r.school_id INTO v_school_id FROM public.competition_registrations r WHERE r.id = p_registration_id;
  IF v_school_id IS NULL OR NOT (public.is_school_admin(v_school_id) OR public.is_platform_admin()) THEN
    RETURN NULL;
  END IF;
  UPDATE public.competition_registrations
  SET status = p_status, decided_at = now(), updated_at = now()
  WHERE id = p_registration_id
    AND status IN ('SUBMITTED', 'APPROVED', 'DECLINED')
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;
