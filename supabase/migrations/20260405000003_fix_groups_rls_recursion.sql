-- Fix infinite recursion in RLS policies

-- Drop all problematic policies
DROP POLICY IF EXISTS "Users can view groups they own or are members of" ON groups;
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
DROP POLICY IF EXISTS "Users can view attendance for meetings they have access to" ON meeting_attendance;

-- Create security definer functions to bypass RLS and prevent infinite recursion

-- Function to get user's accessible groups
CREATE OR REPLACE FUNCTION get_user_accessible_groups(p_user_id UUID)
RETURNS TABLE(group_id UUID) AS $$
  SELECT id FROM groups WHERE owner_id = p_user_id
  UNION
  SELECT gm.group_id FROM group_members gm WHERE gm.user_id = p_user_id;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to check if user is member of a group
CREATE OR REPLACE FUNCTION is_group_member(p_user_id UUID, p_group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM group_members WHERE user_id = p_user_id AND group_id = p_group_id
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Recreate groups policy
CREATE POLICY "Users can view groups they own or are members of"
  ON groups FOR SELECT
  USING (
    auth.uid() = owner_id OR
    is_group_member(auth.uid(), id)
  );

-- Recreate group_members policy
CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  USING (
    group_id IN (SELECT * FROM get_user_accessible_groups(auth.uid()))
  );

-- Recreate meeting_attendance policy
CREATE POLICY "Users can view attendance for meetings they have access to"
  ON meeting_attendance FOR SELECT
  USING (
    meeting_id IN (
      SELECT m.id FROM meetings m
      LEFT JOIN meeting_groups mg ON m.id = mg.meeting_id
      WHERE m.user_id = auth.uid() OR mg.group_id IN (SELECT * FROM get_user_accessible_groups(auth.uid()))
    )
  );
