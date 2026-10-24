-- ============================================
-- hitschies Publisher -- Storage: media bucket
-- ============================================

-- Public bucket: the UI builds URLs via /storage/v1/object/public/media/...
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Mirrors public.media policies: admins/editors upload, admins delete.
-- Public read is served by the public bucket; this SELECT policy covers
-- authenticated API access (list, signed URLs).
CREATE POLICY "media_objects_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'media' AND auth.uid() IS NOT NULL);

CREATE POLICY "media_objects_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media'
    AND public.get_user_role() IN ('admin', 'editor')
  );

CREATE POLICY "media_objects_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media'
    AND public.get_user_role() IN ('admin', 'editor')
  );

CREATE POLICY "media_objects_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media'
    AND public.get_user_role() = 'admin'
  );
