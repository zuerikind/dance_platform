-- RPC for Edge Function to verify caller is school or platform admin.
-- Used when uploading competition logos via Edge Function (Storage RLS has auth.uid() bug).
CREATE OR REPLACE FUNCTION public.check_school_admin_for_upload(p_school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_school_admin(p_school_id) OR public.is_platform_admin();
$$;
GRANT EXECUTE ON FUNCTION public.check_school_admin_for_upload(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_school_admin_for_upload(uuid) TO anon;
