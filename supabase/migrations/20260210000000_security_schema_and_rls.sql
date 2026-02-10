-- =============================================================================
-- Bailadmin / Dance Platform – Security schema and RLS
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Run in order: 1) Schema changes, 2) RLS policies.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) SCHEMA CHANGES
-- -----------------------------------------------------------------------------

-- 1.1) students: add user_id (links to Supabase Auth)
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_school_user ON public.students(school_id, user_id);

COMMENT ON COLUMN public.students.user_id IS 'Supabase Auth user; used for login and RLS. Null for admin-created students until they set a password.';

-- 1.2) admins: add user_id (links to Supabase Auth)
ALTER TABLE public.admins
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_school_user ON public.admins(school_id, user_id);

COMMENT ON COLUMN public.admins.user_id IS 'Supabase Auth user; used for login and RLS.';

-- 1.3) platform_admins: table for platform developers (restricts who can use God Mode)
CREATE TABLE IF NOT EXISTS public.platform_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.platform_admins IS 'Auth users who can access platform-dev dashboard and see all schools. Add user_id after creating the user in Auth.';

-- Optional: stop exposing password in APIs (do not drop yet if app still uses it for legacy admin creation)
-- ALTER TABLE public.students DROP COLUMN IF EXISTS password;
-- ALTER TABLE public.admins DROP COLUMN IF EXISTS password;


-- -----------------------------------------------------------------------------
-- 2) ENABLE RLS ON ALL RELEVANT TABLES
-- -----------------------------------------------------------------------------

ALTER TABLE public.schools          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins  ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------------------------------
-- 3) HELPER: is platform admin
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid());
$$;


-- -----------------------------------------------------------------------------
-- 4) SCHOOLS
-- -----------------------------------------------------------------------------

-- Anyone can list schools (for school-selection screen)
DROP POLICY IF EXISTS "schools_select_all" ON public.schools;
CREATE POLICY "schools_select_all" ON public.schools
  FOR SELECT USING (true);

-- Only platform admins can create/update/delete schools
DROP POLICY IF EXISTS "schools_insert_platform" ON public.schools;
CREATE POLICY "schools_insert_platform" ON public.schools
  FOR INSERT WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "schools_update_platform" ON public.schools;
CREATE POLICY "schools_update_platform" ON public.schools
  FOR UPDATE USING (public.is_platform_admin());

DROP POLICY IF EXISTS "schools_delete_platform" ON public.schools;
CREATE POLICY "schools_delete_platform" ON public.schools
  FOR DELETE USING (public.is_platform_admin());


-- -----------------------------------------------------------------------------
-- 5) STUDENTS
-- -----------------------------------------------------------------------------

-- Select: own row (student), or any student in a school where current user is admin, or platform admin
DROP POLICY IF EXISTS "students_select" ON public.students;
CREATE POLICY "students_select" ON public.students
  FOR SELECT USING (
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = students.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

-- Insert: own row (user_id = auth.uid()) when signing up, or admin inserting in their school, or platform admin
DROP POLICY IF EXISTS "students_insert" ON public.students;
CREATE POLICY "students_insert" ON public.students
  FOR INSERT WITH CHECK (
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = students.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

-- Update: same as select
DROP POLICY IF EXISTS "students_update" ON public.students;
CREATE POLICY "students_update" ON public.students
  FOR UPDATE USING (
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = students.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

-- Delete: only admins of that school or platform admin
DROP POLICY IF EXISTS "students_delete" ON public.students;
CREATE POLICY "students_delete" ON public.students
  FOR DELETE USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = students.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );


-- -----------------------------------------------------------------------------
-- 6) ADMINS
-- -----------------------------------------------------------------------------

-- Select: admins of the same school (so an admin can see co-admins), or platform admin
DROP POLICY IF EXISTS "admins_select" ON public.admins;
CREATE POLICY "admins_select" ON public.admins
  FOR SELECT USING (
    (user_id = auth.uid())
    OR (EXISTS (SELECT 1 FROM public.admins a2 WHERE a2.school_id = admins.school_id AND a2.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

-- Insert: only platform admin (e.g. when creating a new school + first admin)
DROP POLICY IF EXISTS "admins_insert" ON public.admins;
CREATE POLICY "admins_insert" ON public.admins
  FOR INSERT WITH CHECK (public.is_platform_admin());

-- Update/Delete: same school admin or platform admin
DROP POLICY IF EXISTS "admins_update" ON public.admins;
CREATE POLICY "admins_update" ON public.admins
  FOR UPDATE USING (
    (EXISTS (SELECT 1 FROM public.admins a2 WHERE a2.school_id = admins.school_id AND a2.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "admins_delete" ON public.admins;
CREATE POLICY "admins_delete" ON public.admins
  FOR DELETE USING (
    (EXISTS (SELECT 1 FROM public.admins a2 WHERE a2.school_id = admins.school_id AND a2.user_id = auth.uid()))
    OR public.is_platform_admin()
  );


-- -----------------------------------------------------------------------------
-- 7) CLASSES, SUBSCRIPTIONS, PAYMENT_REQUESTS, ADMIN_SETTINGS, PAYMENTS
--    Access by school: user is admin of that school or platform admin.
-- -----------------------------------------------------------------------------

-- Classes: admins + platform can manage; students of that school can read (schedule/shop)
DROP POLICY IF EXISTS "classes_select" ON public.classes;
CREATE POLICY "classes_select" ON public.classes
  FOR SELECT USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = classes.school_id AND a.user_id = auth.uid()))
    OR (EXISTS (SELECT 1 FROM public.students s WHERE s.school_id = classes.school_id AND s.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "classes_insert" ON public.classes;
CREATE POLICY "classes_insert" ON public.classes
  FOR INSERT WITH CHECK (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = classes.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "classes_update" ON public.classes;
CREATE POLICY "classes_update" ON public.classes
  FOR UPDATE USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = classes.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "classes_delete" ON public.classes;
CREATE POLICY "classes_delete" ON public.classes
  FOR DELETE USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = classes.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

-- Subscriptions: admins + platform can manage; students of that school can read (shop)
DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;
CREATE POLICY "subscriptions_select" ON public.subscriptions
  FOR SELECT USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = subscriptions.school_id AND a.user_id = auth.uid()))
    OR (EXISTS (SELECT 1 FROM public.students s WHERE s.school_id = subscriptions.school_id AND s.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "subscriptions_insert" ON public.subscriptions;
CREATE POLICY "subscriptions_insert" ON public.subscriptions
  FOR INSERT WITH CHECK (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = subscriptions.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "subscriptions_update" ON public.subscriptions;
CREATE POLICY "subscriptions_update" ON public.subscriptions
  FOR UPDATE USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = subscriptions.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "subscriptions_delete" ON public.subscriptions;
CREATE POLICY "subscriptions_delete" ON public.subscriptions
  FOR DELETE USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = subscriptions.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

-- Payment requests
DROP POLICY IF EXISTS "payment_requests_select" ON public.payment_requests;
CREATE POLICY "payment_requests_select" ON public.payment_requests
  FOR SELECT USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = payment_requests.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "payment_requests_insert" ON public.payment_requests;
CREATE POLICY "payment_requests_insert" ON public.payment_requests
  FOR INSERT WITH CHECK (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = payment_requests.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "payment_requests_update" ON public.payment_requests;
CREATE POLICY "payment_requests_update" ON public.payment_requests
  FOR UPDATE USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = payment_requests.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "payment_requests_delete" ON public.payment_requests;
CREATE POLICY "payment_requests_delete" ON public.payment_requests
  FOR DELETE USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = payment_requests.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

-- Admin settings
DROP POLICY IF EXISTS "admin_settings_select" ON public.admin_settings;
CREATE POLICY "admin_settings_select" ON public.admin_settings
  FOR SELECT USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = admin_settings.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "admin_settings_insert" ON public.admin_settings;
CREATE POLICY "admin_settings_insert" ON public.admin_settings
  FOR INSERT WITH CHECK (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = admin_settings.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "admin_settings_update" ON public.admin_settings;
CREATE POLICY "admin_settings_update" ON public.admin_settings
  FOR UPDATE USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = admin_settings.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "admin_settings_delete" ON public.admin_settings;
CREATE POLICY "admin_settings_delete" ON public.admin_settings
  FOR DELETE USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = admin_settings.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

-- Payments
DROP POLICY IF EXISTS "payments_select" ON public.payments;
CREATE POLICY "payments_select" ON public.payments
  FOR SELECT USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = payments.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "payments_insert" ON public.payments;
CREATE POLICY "payments_insert" ON public.payments
  FOR INSERT WITH CHECK (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = payments.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "payments_update" ON public.payments;
CREATE POLICY "payments_update" ON public.payments
  FOR UPDATE USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = payments.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "payments_delete" ON public.payments;
CREATE POLICY "payments_delete" ON public.payments
  FOR DELETE USING (
    (EXISTS (SELECT 1 FROM public.admins a WHERE a.school_id = payments.school_id AND a.user_id = auth.uid()))
    OR public.is_platform_admin()
  );

-- Platform admins: only platform admins can read (and only service role should manage the list)
DROP POLICY IF EXISTS "platform_admins_select" ON public.platform_admins;
CREATE POLICY "platform_admins_select" ON public.platform_admins
  FOR SELECT USING (auth.uid() = user_id OR public.is_platform_admin());


-- -----------------------------------------------------------------------------
-- 8) STUDENTS: allow read for students of same school (schedule/shop)
--    Right now schedule/shop use state.classes and state.subscriptions loaded
--    when user is admin. For student view, app only fetches own student row.
--    So no extra policy needed for “student can read classes/subs of their school”
--    unless you add that later. If you do, add a policy that allows SELECT on
--    classes/subscriptions where school_id = (student’s school_id) and
--    user is that student. For now, students don’t query classes/subs by RLS
--    (they use in-memory state from after login). So we leave classes/subs
--    as admin-only above. If your app loads classes/subs for the school before
--    login (e.g. on school selection), you’ll need a policy that allows
--    anon or authenticated to read classes/subscriptions for a given school.
--    Example (optional):
--
--    DROP POLICY IF EXISTS "classes_select_school_public" ON public.classes;
--    CREATE POLICY "classes_select_school_public" ON public.classes
--      FOR SELECT USING (true);  -- or restrict by school_id in app
--
--    Only add if you need public schedule/shop per school.
-- -----------------------------------------------------------------------------


-- =============================================================================
-- POST-MIGRATION STEPS (do manually in Supabase Dashboard)
-- =============================================================================
--
-- 1) Auth users for students: created automatically on signup (app calls
--    auth.signUp with pseudo-email and then inserts students with user_id).
--
-- 2) Auth users for admins: when you create a new admin (e.g. in “Create
--    school”), you must create an Auth user and set admins.user_id:
--    - In Supabase Auth → Users → Add user (or use auth.signUp from app)
--    - Email: {username}+{school_id}@admins.bailadmin.local
--    - Set password.
--    - Copy the new user’s id (uuid) and run:
--        UPDATE public.admins SET user_id = '<that-uuid>' WHERE school_id = '<school_id>' AND username = '<username>';
--
-- 3) Platform developers: create Auth user (email + password), then add to
--    platform_admins:
--        INSERT INTO public.platform_admins (user_id) VALUES ('<auth-user-uuid>');
--
-- 4) Existing students: if you have existing rows without user_id, either
--    leave them (they won’t be able to log in with new flow until you
--    create Auth users and set user_id) or run a one-off script that
--    creates Auth users and sets user_id.
--
-- =============================================================================
