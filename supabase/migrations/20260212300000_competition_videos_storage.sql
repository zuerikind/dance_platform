-- Storage bucket for competition registration videos.
-- Path format: {school_id}/{competition_id}/{student_id}/{uuid}.mp4
-- RLS: Students can upload to their own path; school/platform admins can read.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'competition-videos',
  'competition-videos',
  false,
  52428800,
  ARRAY['video/mp4', 'video/quicktime', 'video/webm']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS: Allow INSERT when path matches current student's school/competition/student_id
CREATE POLICY "competition_videos_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'competition-videos'
  AND EXISTS (
    SELECT 1 FROM public.get_current_student_context() ctx
    WHERE ctx.school_id::text = split_part(name, '/', 1)
      AND ctx.student_id = split_part(name, '/', 3)
  )
);

-- Allow anon for legacy clients that may use anon key with session
CREATE POLICY "competition_videos_insert_anon"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'competition-videos'
  AND EXISTS (
    SELECT 1 FROM public.get_current_student_context() ctx
    WHERE ctx.school_id::text = split_part(name, '/', 1)
      AND ctx.student_id = split_part(name, '/', 3)
  )
);

-- RLS: Allow SELECT for school admins (school_id from path) or platform admins
CREATE POLICY "competition_videos_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'competition-videos'
  AND (
    public.is_school_admin((split_part(name, '/', 1))::uuid)
    OR public.is_platform_admin()
  )
);

CREATE POLICY "competition_videos_select_anon"
ON storage.objects FOR SELECT
TO anon
USING (
  bucket_id = 'competition-videos'
  AND (
    public.is_school_admin((split_part(name, '/', 1))::uuid)
    OR public.is_platform_admin()
  )
);
