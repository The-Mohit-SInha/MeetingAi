-- ==================== GROUPS SYSTEM ====================

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(100),
  hierarchy_level INTEGER NOT NULL DEFAULT 0, -- 0 is lowest, higher numbers = higher authority
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Meeting-Group association (multiple groups can be associated with a meeting)
CREATE TABLE IF NOT EXISTS meeting_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, group_id)
);

-- Update action_items to include assignee user reference
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS assignee_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS assigned_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Meeting attendance tracking
CREATE TABLE IF NOT EXISTS meeting_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_name VARCHAR(255) NOT NULL,
  attended BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

-- ==================== INDEXES ====================

CREATE INDEX idx_groups_owner_id ON groups(owner_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_hierarchy ON group_members(group_id, hierarchy_level);
CREATE INDEX idx_meeting_groups_meeting_id ON meeting_groups(meeting_id);
CREATE INDEX idx_meeting_groups_group_id ON meeting_groups(group_id);
CREATE INDEX idx_action_items_assignee_user_id ON action_items(assignee_user_id);
CREATE INDEX idx_meeting_attendance_meeting_id ON meeting_attendance(meeting_id);
CREATE INDEX idx_meeting_attendance_user_id ON meeting_attendance(user_id);

-- ==================== RLS POLICIES ====================

-- Groups policies
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view groups they own or are members of"
  ON groups FOR SELECT
  USING (
    auth.uid() = owner_id OR
    auth.uid() IN (SELECT user_id FROM group_members WHERE group_id = groups.id)
  );

CREATE POLICY "Users can create their own groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Group owners can update their groups"
  ON groups FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Group owners can delete their groups"
  ON groups FOR DELETE
  USING (auth.uid() = owner_id);

-- Group members policies
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  USING (
    group_id IN (
      SELECT id FROM groups WHERE owner_id = auth.uid()
      UNION
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Group owners can add members"
  ON group_members FOR INSERT
  WITH CHECK (
    group_id IN (SELECT id FROM groups WHERE owner_id = auth.uid())
  );

CREATE POLICY "Group owners can update members"
  ON group_members FOR UPDATE
  USING (
    group_id IN (SELECT id FROM groups WHERE owner_id = auth.uid())
  );

CREATE POLICY "Group owners can remove members"
  ON group_members FOR DELETE
  USING (
    group_id IN (SELECT id FROM groups WHERE owner_id = auth.uid())
  );

-- Meeting groups policies
ALTER TABLE meeting_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meeting groups for their meetings"
  ON meeting_groups FOR SELECT
  USING (
    meeting_id IN (SELECT id FROM meetings WHERE user_id = auth.uid())
  );

CREATE POLICY "Meeting owners can associate groups"
  ON meeting_groups FOR INSERT
  WITH CHECK (
    meeting_id IN (SELECT id FROM meetings WHERE user_id = auth.uid())
  );

CREATE POLICY "Meeting owners can remove group associations"
  ON meeting_groups FOR DELETE
  USING (
    meeting_id IN (SELECT id FROM meetings WHERE user_id = auth.uid())
  );

-- Meeting attendance policies
ALTER TABLE meeting_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attendance for meetings they have access to"
  ON meeting_attendance FOR SELECT
  USING (
    meeting_id IN (
      SELECT m.id FROM meetings m
      LEFT JOIN meeting_groups mg ON m.id = mg.meeting_id
      LEFT JOIN group_members gm ON mg.group_id = gm.group_id
      WHERE m.user_id = auth.uid() OR gm.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create attendance records"
  ON meeting_attendance FOR INSERT
  WITH CHECK (true);

-- ==================== TRIGGERS ====================

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================== FUNCTIONS ====================

-- Function to get user's hierarchy level in a group
CREATE OR REPLACE FUNCTION get_user_hierarchy_level(p_user_id UUID, p_group_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(hierarchy_level, -1)
  FROM group_members
  WHERE user_id = p_user_id AND group_id = p_group_id;
$$ LANGUAGE SQL STABLE;

-- Function to check if user can edit another user's action items
CREATE OR REPLACE FUNCTION can_edit_action_item(p_editor_id UUID, p_assignee_id UUID, p_meeting_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  editor_level INTEGER;
  assignee_level INTEGER;
  common_group_id UUID;
BEGIN
  -- Find a common group between editor and assignee for this meeting
  SELECT mg.group_id INTO common_group_id
  FROM meeting_groups mg
  WHERE mg.meeting_id = p_meeting_id
  AND mg.group_id IN (
    SELECT group_id FROM group_members WHERE user_id = p_editor_id
  )
  AND mg.group_id IN (
    SELECT group_id FROM group_members WHERE user_id = p_assignee_id
  )
  LIMIT 1;

  IF common_group_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get hierarchy levels
  SELECT hierarchy_level INTO editor_level
  FROM group_members
  WHERE user_id = p_editor_id AND group_id = common_group_id;

  SELECT hierarchy_level INTO assignee_level
  FROM group_members
  WHERE user_id = p_assignee_id AND group_id = common_group_id;

  -- Editor can edit if they have higher hierarchy level
  RETURN editor_level > assignee_level;
END;
$$ LANGUAGE plpgsql STABLE;
