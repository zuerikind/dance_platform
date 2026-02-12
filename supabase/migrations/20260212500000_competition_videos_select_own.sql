-- Allow students to SELECT objects in their own path (for upsert pre-checks or viewing own uploads)
CREATE POLICY "competition_videos_select_own"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'competition-videos'
  AND EXISTS (
    SELECT 1 FROM public.get_current_student_context() ctx
    WHERE ctx.school_id::text = split_part(name, '/', 1)
      AND ctx.student_id = split_part(name, '/', 3)
  )
);

CREATE POLICY "competition_videos_select_own_anon"
ON storage.objects FOR SELECT
TO anon
USING (
  bucket_id = 'competition-videos'
  AND EXISTS (
    SELECT 1 FROM public.get_current_student_context() ctx
    WHERE ctx.school_id::text = split_part(name, '/', 1)
      AND ctx.student_id = split_part(name, '/', 3)
  )
);
