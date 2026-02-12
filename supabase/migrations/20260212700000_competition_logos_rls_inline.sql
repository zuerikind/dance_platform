-- Fix: Storage RLS policy fails because is_school_admin() uses auth.uid(), which
-- returns NULL in Storage INSERT context (Supabase bug: JWT not available in RLS).
-- Inline the admin check and use auth.jwt()->>'sub' per Storage docs.

DROP POLICY IF EXISTS "competition_logos_insert" ON storage.objects;
DROP POLICY IF EXISTS "competition_logos_insert_anon" ON storage.objects;

CREATE POLICY "competition_logos_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'competition-logos'
  AND (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.school_id = ((storage.foldername(name))[1])::uuid
        AND a.user_id = COALESCE(auth.uid(), (NULLIF(TRIM(auth.jwt()->>'sub'), ''))::uuid)
    )
    OR EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = COALESCE(auth.uid(), (NULLIF(TRIM(auth.jwt()->>'sub'), ''))::uuid)
    )
  )
);

CREATE POLICY "competition_logos_insert_anon"
ON storage.objects FOR INSERT TO anon
WITH CHECK (
  bucket_id = 'competition-logos'
  AND (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.school_id = ((storage.foldername(name))[1])::uuid
        AND a.user_id = (NULLIF(TRIM(auth.jwt()->>'sub'), ''))::uuid
    )
    OR EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = (NULLIF(TRIM(auth.jwt()->>'sub'), ''))::uuid
    )
  )
);
