-- Calendly integration for private teachers: connections, event type selection,
-- private_bookings (Calendly-originated), pass_transactions (idempotent deduct/refund),
-- OAuth state, RLS, and refund_student_private.

-- 1) calendly_connections
CREATE TABLE IF NOT EXISTS public.calendly_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  calendly_user_uri text NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id),
  UNIQUE(calendly_user_uri)
);

COMMENT ON TABLE public.calendly_connections IS 'OAuth connection per private teacher (school). One row per school.';

ALTER TABLE public.calendly_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "calendly_conn_select" ON public.calendly_connections;
CREATE POLICY "calendly_conn_select" ON public.calendly_connections
  FOR SELECT USING (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "calendly_conn_insert" ON public.calendly_connections;
CREATE POLICY "calendly_conn_insert" ON public.calendly_connections
  FOR INSERT WITH CHECK (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "calendly_conn_update" ON public.calendly_connections;
CREATE POLICY "calendly_conn_update" ON public.calendly_connections
  FOR UPDATE USING (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "calendly_conn_delete" ON public.calendly_connections;
CREATE POLICY "calendly_conn_delete" ON public.calendly_connections
  FOR DELETE USING (public.is_school_admin(school_id) OR public.is_platform_admin());

-- 2) calendly_event_type_selection
CREATE TABLE IF NOT EXISTS public.calendly_event_type_selection (
  school_id uuid PRIMARY KEY REFERENCES public.schools(id) ON DELETE CASCADE,
  calendly_event_type_uri text NOT NULL,
  calendly_event_type_name text,
  scheduling_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.calendly_event_type_selection IS 'Selected Calendly event type per private teacher for student booking embed.';

ALTER TABLE public.calendly_event_type_selection ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "calendly_ets_select" ON public.calendly_event_type_selection;
CREATE POLICY "calendly_ets_select" ON public.calendly_event_type_selection
  FOR SELECT USING (
    public.is_school_admin(school_id)
    OR public.is_platform_admin()
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.school_id = calendly_event_type_selection.school_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "calendly_ets_insert" ON public.calendly_event_type_selection;
CREATE POLICY "calendly_ets_insert" ON public.calendly_event_type_selection
  FOR INSERT WITH CHECK (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "calendly_ets_update" ON public.calendly_event_type_selection;
CREATE POLICY "calendly_ets_update" ON public.calendly_event_type_selection
  FOR UPDATE USING (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "calendly_ets_delete" ON public.calendly_event_type_selection;
CREATE POLICY "calendly_ets_delete" ON public.calendly_event_type_selection
  FOR DELETE USING (public.is_school_admin(school_id) OR public.is_platform_admin());

-- 3) private_bookings (Calendly-originated only; idempotent by calendly_invitee_uri)
CREATE TABLE IF NOT EXISTS public.private_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id text,
  student_email text,
  student_name text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'canceled')),
  source text NOT NULL DEFAULT 'calendly',
  calendly_event_uri text,
  calendly_invitee_uri text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(calendly_invitee_uri),
  UNIQUE(school_id, start_time)
);

COMMENT ON TABLE public.private_bookings IS 'Bookings created via Calendly webhook. Idempotent by calendly_invitee_uri.';

CREATE INDEX IF NOT EXISTS idx_private_bookings_school_start ON public.private_bookings(school_id, start_time);
CREATE INDEX IF NOT EXISTS idx_private_bookings_invitee ON public.private_bookings(calendly_invitee_uri);
CREATE INDEX IF NOT EXISTS idx_private_bookings_student ON public.private_bookings(school_id, student_id) WHERE student_id IS NOT NULL;

ALTER TABLE public.private_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pb_select_teacher" ON public.private_bookings;
CREATE POLICY "pb_select_teacher" ON public.private_bookings
  FOR SELECT USING (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "pb_select_student" ON public.private_bookings;
CREATE POLICY "pb_select_student" ON public.private_bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.school_id = private_bookings.school_id AND s.user_id = auth.uid() AND (s.id::text = private_bookings.student_id OR (private_bookings.student_email IS NOT NULL AND LOWER(trim(s.email)) = LOWER(trim(private_bookings.student_email)))))
  );

-- No INSERT/UPDATE policy: only service role (webhook) can write, via RLS bypass.

-- 4) pass_transactions (idempotency ledger for deduct/refund)
CREATE TABLE IF NOT EXISTS public.pass_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES public.private_bookings(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deduct', 'refund')),
  amount int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(booking_id, type)
);

COMMENT ON TABLE public.pass_transactions IS 'Idempotent ledger for Calendly booking deduct/refund. Prevents double deduct or double refund.';

CREATE INDEX IF NOT EXISTS idx_pass_transactions_booking ON public.pass_transactions(booking_id);

ALTER TABLE public.pass_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pt_select_teacher" ON public.pass_transactions;
CREATE POLICY "pt_select_teacher" ON public.pass_transactions
  FOR SELECT USING (public.is_school_admin(school_id) OR public.is_platform_admin());

DROP POLICY IF EXISTS "pt_select_student" ON public.pass_transactions;
CREATE POLICY "pt_select_student" ON public.pass_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id::text = pass_transactions.student_id AND s.school_id = pass_transactions.school_id AND s.user_id = auth.uid())
  );

-- No INSERT policy: only service role (webhook) can insert, via RLS bypass.

-- 5) refund_student_private: increment balance_private for a school/student (called from webhook after inserting refund row)
CREATE OR REPLACE FUNCTION public.refund_student_private(
  p_school_id uuid,
  p_student_id text,
  p_count int DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student public.students%ROWTYPE;
  v_new_balance int;
BEGIN
  IF p_count IS NULL OR p_count < 1 THEN
    RETURN;
  END IF;
  SELECT * INTO v_student FROM public.students WHERE id::text = p_student_id AND school_id = p_school_id LIMIT 1;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  v_new_balance := COALESCE(v_student.balance_private, 0) + p_count;
  UPDATE public.students
  SET balance_private = v_new_balance
  WHERE id::text = p_student_id AND school_id = p_school_id;
END;
$$;

COMMENT ON FUNCTION public.refund_student_private(uuid, text, int) IS 'Refund private credits to student. Called from webhook after idempotent pass_transactions refund insert.';

-- 6) calendly_oauth_state (CSRF for OAuth callback)
CREATE TABLE IF NOT EXISTS public.calendly_oauth_state (
  state text PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);

COMMENT ON TABLE public.calendly_oauth_state IS 'Temporary state for Calendly OAuth; validate and delete on callback.';

-- No policies: only Edge Function (service role) reads/inserts/deletes via RLS bypass.
ALTER TABLE public.calendly_oauth_state ENABLE ROW LEVEL SECURITY;

-- 7) RPC: upsert_calendly_event_type_selection (teacher stores selected event type + scheduling_url)
CREATE OR REPLACE FUNCTION public.upsert_calendly_event_type_selection(
  p_school_id uuid,
  p_calendly_event_type_uri text,
  p_calendly_event_type_name text DEFAULT NULL,
  p_scheduling_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_row public.calendly_event_type_selection%ROWTYPE;
BEGIN
  IF NOT (public.is_school_admin(p_school_id) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  INSERT INTO public.calendly_event_type_selection (school_id, calendly_event_type_uri, calendly_event_type_name, scheduling_url, updated_at)
  VALUES (
    p_school_id,
    nullif(trim(p_calendly_event_type_uri), ''),
    nullif(trim(p_calendly_event_type_name), ''),
    nullif(trim(p_scheduling_url), ''),
    now()
  )
  ON CONFLICT (school_id) DO UPDATE SET
    calendly_event_type_uri = nullif(trim(p_calendly_event_type_uri), ''),
    calendly_event_type_name = COALESCE(nullif(trim(p_calendly_event_type_name), ''), calendly_event_type_selection.calendly_event_type_name),
    scheduling_url = COALESCE(nullif(trim(p_scheduling_url), ''), calendly_event_type_selection.scheduling_url),
    updated_at = now()
  RETURNING * INTO v_row;
  RETURN to_jsonb(v_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_calendly_event_type_selection(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_calendly_event_type_selection(uuid, text, text, text) TO anon;

COMMENT ON FUNCTION public.upsert_calendly_event_type_selection(uuid, text, text, text) IS 'Teacher selects Calendly event type for private booking.';

-- 8) RPC: get_calendly_event_type_selection (public for embed: returns uri + scheduling_url for a school; no tokens)
CREATE OR REPLACE FUNCTION public.get_calendly_event_type_selection(p_school_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'calendly_event_type_uri', calendly_event_type_uri,
    'calendly_event_type_name', calendly_event_type_name,
    'scheduling_url', scheduling_url
  )
  FROM public.calendly_event_type_selection
  WHERE school_id = p_school_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_calendly_event_type_selection(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_calendly_event_type_selection(uuid) TO anon;

COMMENT ON FUNCTION public.get_calendly_event_type_selection(uuid) IS 'Return selected event type and scheduling URL for embed (no tokens).';
