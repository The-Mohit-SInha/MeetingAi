-- Add notification types for groups
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('action', 'meeting', 'mention', 'alert', 'info', 'group_invite', 'group_member_added', 'group_created'));

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link, is_read)
  VALUES (p_user_id, p_type, p_title, p_message, p_link, FALSE)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for new meetings
CREATE OR REPLACE FUNCTION notify_meeting_created()
RETURNS TRIGGER AS $$
DECLARE
  group_member RECORD;
  meeting_title TEXT;
BEGIN
  meeting_title := COALESCE(NEW.title, 'New Meeting');

  -- Notify all members of associated groups
  FOR group_member IN
    SELECT DISTINCT gm.user_id, g.name as group_name
    FROM meeting_groups mg
    JOIN group_members gm ON mg.group_id = gm.group_id
    JOIN groups g ON mg.group_id = g.id
    WHERE mg.meeting_id = NEW.id AND gm.user_id != NEW.user_id
  LOOP
    PERFORM create_notification(
      group_member.user_id,
      'meeting',
      'New Meeting Created',
      format('A new meeting "%s" has been scheduled in %s', meeting_title, group_member.group_name),
      '/meetings/' || NEW.id::TEXT
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for meeting creation
DROP TRIGGER IF EXISTS meeting_created_notification ON meetings;
CREATE TRIGGER meeting_created_notification
  AFTER INSERT ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION notify_meeting_created();

-- Trigger function for new action items
CREATE OR REPLACE FUNCTION notify_action_created()
RETURNS TRIGGER AS $$
DECLARE
  meeting_title TEXT;
  assigner_name TEXT;
BEGIN
  -- Only notify if there's an assignee and they're not the creator
  IF NEW.assignee_user_id IS NOT NULL AND NEW.assignee_user_id != NEW.user_id THEN
    -- Get meeting title
    SELECT title INTO meeting_title FROM meetings WHERE id = NEW.meeting_id;

    -- Get assigner name if available
    IF NEW.assigned_by_user_id IS NOT NULL THEN
      SELECT name INTO assigner_name FROM users WHERE id = NEW.assigned_by_user_id;
    END IF;

    PERFORM create_notification(
      NEW.assignee_user_id,
      'action',
      'New Action Item Assigned',
      format('You have been assigned a new action: "%s" in %s%s',
        NEW.title,
        COALESCE(meeting_title, 'a meeting'),
        CASE WHEN assigner_name IS NOT NULL THEN format(' by %s', assigner_name) ELSE '' END
      ),
      '/meetings/' || NEW.meeting_id::TEXT
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for action item creation
DROP TRIGGER IF EXISTS action_created_notification ON action_items;
CREATE TRIGGER action_created_notification
  AFTER INSERT ON action_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_action_created();

-- Trigger function for action item reassignment
CREATE OR REPLACE FUNCTION notify_action_reassigned()
RETURNS TRIGGER AS $$
DECLARE
  meeting_title TEXT;
  assigner_name TEXT;
BEGIN
  -- Only notify if assignee changed and there's a new assignee
  IF NEW.assignee_user_id IS NOT NULL AND
     OLD.assignee_user_id IS DISTINCT FROM NEW.assignee_user_id AND
     NEW.assignee_user_id != NEW.user_id THEN

    -- Get meeting title
    SELECT title INTO meeting_title FROM meetings WHERE id = NEW.meeting_id;

    -- Get assigner name if available
    IF NEW.assigned_by_user_id IS NOT NULL THEN
      SELECT name INTO assigner_name FROM users WHERE id = NEW.assigned_by_user_id;
    END IF;

    PERFORM create_notification(
      NEW.assignee_user_id,
      'action',
      'Action Item Reassigned to You',
      format('You have been assigned an action: "%s" in %s%s',
        NEW.title,
        COALESCE(meeting_title, 'a meeting'),
        CASE WHEN assigner_name IS NOT NULL THEN format(' by %s', assigner_name) ELSE '' END
      ),
      '/meetings/' || NEW.meeting_id::TEXT
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for action item updates
DROP TRIGGER IF EXISTS action_reassigned_notification ON action_items;
CREATE TRIGGER action_reassigned_notification
  AFTER UPDATE ON action_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_action_reassigned();

-- Trigger function for new group members
CREATE OR REPLACE FUNCTION notify_group_member_added()
RETURNS TRIGGER AS $$
DECLARE
  group_name TEXT;
  owner_name TEXT;
  other_member RECORD;
BEGIN
  -- Get group info
  SELECT g.name, u.name INTO group_name, owner_name
  FROM groups g
  LEFT JOIN users u ON g.owner_id = u.id
  WHERE g.id = NEW.group_id;

  -- Notify the new member
  PERFORM create_notification(
    NEW.user_id,
    'group_member_added',
    'Added to Group',
    format('You have been added to the group "%s"%s',
      group_name,
      CASE WHEN owner_name IS NOT NULL THEN format(' by %s', owner_name) ELSE '' END
    ),
    '/groups'
  );

  -- Notify other members of the group
  FOR other_member IN
    SELECT gm.user_id, u.name as member_name
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = NEW.group_id AND gm.user_id != NEW.user_id
  LOOP
    PERFORM create_notification(
      other_member.user_id,
      'group_member_added',
      'New Group Member',
      format('A new member has joined "%s"', group_name),
      '/groups'
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for group member addition
DROP TRIGGER IF EXISTS group_member_added_notification ON group_members;
CREATE TRIGGER group_member_added_notification
  AFTER INSERT ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION notify_group_member_added();

-- Trigger function for new groups
CREATE OR REPLACE FUNCTION notify_group_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify the owner
  PERFORM create_notification(
    NEW.owner_id,
    'group_created',
    'Group Created',
    format('Your group "%s" has been created successfully', NEW.name),
    '/groups'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for group creation
DROP TRIGGER IF EXISTS group_created_notification ON groups;
CREATE TRIGGER group_created_notification
  AFTER INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION notify_group_created();

-- Trigger function for meeting-group associations
CREATE OR REPLACE FUNCTION notify_meeting_group_associated()
RETURNS TRIGGER AS $$
DECLARE
  group_member RECORD;
  meeting_info RECORD;
  group_name TEXT;
BEGIN
  -- Get meeting info
  SELECT m.title, m.user_id, g.name INTO meeting_info
  FROM meetings m
  JOIN groups g ON g.id = NEW.group_id
  WHERE m.id = NEW.meeting_id;

  -- Get group name
  SELECT name INTO group_name FROM groups WHERE id = NEW.group_id;

  -- Notify all group members except the meeting creator
  FOR group_member IN
    SELECT DISTINCT gm.user_id
    FROM group_members gm
    WHERE gm.group_id = NEW.group_id
    AND gm.user_id != meeting_info.user_id
  LOOP
    PERFORM create_notification(
      group_member.user_id,
      'meeting',
      'Meeting Shared with Group',
      format('A meeting "%s" has been shared with your group "%s"',
        COALESCE(meeting_info.title, 'Untitled Meeting'),
        group_name
      ),
      '/meetings/' || NEW.meeting_id::TEXT
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for meeting-group associations
DROP TRIGGER IF EXISTS meeting_group_associated_notification ON meeting_groups;
CREATE TRIGGER meeting_group_associated_notification
  AFTER INSERT ON meeting_groups
  FOR EACH ROW
  EXECUTE FUNCTION notify_meeting_group_associated();
