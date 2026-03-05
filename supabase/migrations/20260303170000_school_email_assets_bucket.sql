-- Storage bucket for optional email logo (fallback when school has no discovery logo).
-- Path: {school_id}/logo.{ext}. Public read for email img src.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-email-assets',
  'school-email-assets',
  true,
  1048576,
  ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- School admin or platform admin can INSERT/UPDATE/DELETE under their school_id (first path segment)
DROP POLICY IF EXISTS "school_email_assets_insert" ON storage.objects;
CREATE POLICY "school_email_assets_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-email-assets'
  AND (public.is_school_admin((split_part(name, '/', 1))::uuid) OR public.is_platform_admin())
);

DROP POLICY IF EXISTS "school_email_assets_select" ON storage.objects;
CREATE POLICY "school_email_assets_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-email-assets');

DROP POLICY IF EXISTS "school_email_assets_update" ON storage.objects;
CREATE POLICY "school_email_assets_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'school-email-assets'
  AND (public.is_school_admin((split_part(name, '/', 1))::uuid) OR public.is_platform_admin())
)
WITH CHECK (
  bucket_id = 'school-email-assets'
  AND (public.is_school_admin((split_part(name, '/', 1))::uuid) OR public.is_platform_admin())
);

DROP POLICY IF EXISTS "school_email_assets_delete" ON storage.objects;
CREATE POLICY "school_email_assets_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'school-email-assets'
  AND (public.is_school_admin((split_part(name, '/', 1))::uuid) OR public.is_platform_admin())
);
