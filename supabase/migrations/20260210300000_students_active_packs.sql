-- Ensure students have active_packs and package_expires_at for package/expiry display.
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS active_packs jsonb DEFAULT '[]';

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS package_expires_at timestamptz;
