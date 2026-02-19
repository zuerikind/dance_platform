-- Allow password to be NULL on students for Auth-linked enrollments (e.g. auto_enroll_student).
-- When user_id is set, sign-in uses Supabase Auth; password in students is only for legacy rows.

ALTER TABLE public.students
  ALTER COLUMN password DROP NOT NULL;
