-- Notifications log table and RPC for Edge Function to resolve current admin's school.
-- Used by Settings Notifications (send email to students via Resend).

-- RPC: return current admin's school_id and email (for use in Edge Function with user JWT).
CREATE OR REPLACE FUNCTION public.get_current_admin_school()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'school_id', a.school_id,
    'email', a.email
  )
  FROM public.admins a
  WHERE a.user_id = auth.uid()
  LIMIT 1;
$$;
COMMENT ON FUNCTION public.get_current_admin_school() IS 'Returns school_id and email for the current auth user (admin). Used by notifications_send Edge Function.';
GRANT EXECUTE ON FUNCTION public.get_current_admin_school() TO authenticated;

-- Table: notifications_log
CREATE TABLE IF NOT EXISTS public.notifications_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id),
  admin_user_id uuid,
  mode text NOT NULL,
  subject text NOT NULL,
  body_raw text,
  logo_url text,
  recipient_count int NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  status text,
  resend_batch_id text
);
COMMENT ON TABLE public.notifications_log IS 'Log of notification campaigns sent from Settings (test / all / selected students).';

ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;

-- RLS: school admin of that school or platform admin can SELECT and INSERT
DROP POLICY IF EXISTS "notifications_log_select" ON public.notifications_log;
CREATE POLICY "notifications_log_select"
ON public.notifications_log FOR SELECT
TO authenticated
USING (
  public.is_school_admin(school_id) OR public.is_platform_admin()
);

DROP POLICY IF EXISTS "notifications_log_insert" ON public.notifications_log;
CREATE POLICY "notifications_log_insert"
ON public.notifications_log FOR INSERT
TO authenticated
WITH CHECK (
  public.is_school_admin(school_id) OR public.is_platform_admin()
);
