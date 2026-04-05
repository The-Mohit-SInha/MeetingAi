-- Run this SQL in your Supabase SQL Editor to enable participant updates
-- Navigate to: Supabase Dashboard → SQL Editor → New Query
-- Copy and paste this, then click "Run"

-- Add UPDATE policy for meeting_participants table
CREATE POLICY "Users can update participants in their meetings"
  ON meeting_participants FOR UPDATE
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
    )
  );

-- Verify the policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'meeting_participants';
