-- Storage bucket for discovery: school logos, teacher photo, gallery.
-- Path format: {school_id}/logo, {school_id}/teacher, {school_id}/gallery/{filename}
-- Public read so discovery page can show images. School admin can upload for their school.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-discovery',
  'school-discovery',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- School admin or platform admin can INSERT under their school_id (first path segment)
DROP POLICY IF EXISTS "school_discovery_insert" ON storage.objects;
CREATE POLICY "school_discovery_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-discovery'
  AND (public.is_school_admin((split_part(name, '/', 1))::uuid) OR public.is_platform_admin())
);

DROP POLICY IF EXISTS "school_discovery_insert_anon" ON storage.objects;
CREATE POLICY "school_discovery_insert_anon"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'school-discovery'
  AND (public.is_school_admin((split_part(name, '/', 1))::uuid) OR public.is_platform_admin())
);

-- Public read (bucket is public)
DROP POLICY IF EXISTS "school_discovery_select" ON storage.objects;
CREATE POLICY "school_discovery_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-discovery');

-- School admin or platform admin can UPDATE/DELETE under their school_id (for replace/remove)
DROP POLICY IF EXISTS "school_discovery_update" ON storage.objects;
CREATE POLICY "school_discovery_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'school-discovery'
  AND (public.is_school_admin((split_part(name, '/', 1))::uuid) OR public.is_platform_admin())
)
WITH CHECK (
  bucket_id = 'school-discovery'
  AND (public.is_school_admin((split_part(name, '/', 1))::uuid) OR public.is_platform_admin())
);

DROP POLICY IF EXISTS "school_discovery_delete" ON storage.objects;
CREATE POLICY "school_discovery_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'school-discovery'
  AND (public.is_school_admin((split_part(name, '/', 1))::uuid) OR public.is_platform_admin())
);
