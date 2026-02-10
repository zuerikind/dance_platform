-- Add email column to students (for signup and profile).
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS email text;

COMMENT ON COLUMN public.students.email IS 'Student email address; used for Auth and contact.';
