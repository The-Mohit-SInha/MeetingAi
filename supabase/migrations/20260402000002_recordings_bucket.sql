-- Create the 'recordings' storage bucket for uploaded audio blobs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recordings',
  'recordings',
  true,
  104857600,  -- 100 MB limit
  ARRAY['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mpeg', 'audio/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for the recordings bucket

-- Allow authenticated users to upload their own recordings (path must start with their user ID)
CREATE POLICY "Users can upload their own recordings"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own recordings
CREATE POLICY "Users can read their own recordings"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access (since bucket is public, for playback / edge function access)
CREATE POLICY "Public read access for recordings"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'recordings');

-- Allow authenticated users to update (upsert) their own recordings
CREATE POLICY "Users can update their own recordings"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own recordings
CREATE POLICY "Users can delete their own recordings"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow service role full access (for edge functions)
CREATE POLICY "Service role full access to recordings"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'recordings')
  WITH CHECK (bucket_id = 'recordings');
