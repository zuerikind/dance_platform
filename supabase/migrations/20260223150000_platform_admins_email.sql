-- Add email to platform_admins for notifications (e.g. flagged review alerts).
ALTER TABLE public.platform_admins
  ADD COLUMN IF NOT EXISTS email text;

COMMENT ON COLUMN public.platform_admins.email IS 'Email for platform admin notifications (e.g. flagged review alert).';

-- Set the single current platform admin to the given address (only one row expected).
UPDATE public.platform_admins
SET email = 'omid.shams@gmx.ch'
WHERE id = (SELECT id FROM public.platform_admins ORDER BY created_at ASC NULLS LAST, id ASC LIMIT 1);
