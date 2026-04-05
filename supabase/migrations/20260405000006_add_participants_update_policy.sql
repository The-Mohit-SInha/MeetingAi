-- Add UPDATE policy for meeting_participants table
-- This allows users to update participants in their own meetings

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
