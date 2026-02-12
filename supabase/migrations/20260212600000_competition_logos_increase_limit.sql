-- Increase competition-logos bucket limit for large screenshots (e.g. high-DPI displays)
-- Also add image/x-png in case some systems use it for screenshots
UPDATE storage.buckets
SET
  file_size_limit = 15728640,  -- 15 MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/x-png', 'image/gif', 'image/webp']::text[]
WHERE id = 'competition-logos';
