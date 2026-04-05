-- Update notification triggers for admin-only system (without groups)
-- This migration modifies the notification system to work with the admin-only architecture

-- Drop old triggers that reference groups
DROP TRIGGER IF EXISTS meeting_created_notification ON meetings;
DROP TRIGGER IF EXISTS group_member_added_notification ON group_members;
DROP TRIGGER IF EXISTS group_created_notification ON groups;
DROP TRIGGER IF EXISTS meeting_group_associated_notification ON meeting_groups;

-- Update notification constraints to remove group types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('action', 'meeting', 'mention', 'alert', 'info'));

-- Simplified trigger function for new meetings (admin-only)
CREATE OR REPLACE FUNCTION notify_meeting_created()
RETURNS TRIGGER AS $$
DECLARE
  meeting_title TEXT;
BEGIN
  meeting_title := COALESCE(NEW.title, 'New Meeting');

  -- Notify the admin/owner when a meeting is created
  PERFORM create_notification(
    NEW.user_id,
    'meeting',
    'Meeting Created',
    format('Meeting "%s" has been created successfully', meeting_title),
    '/meetings/' || NEW.id::TEXT
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger for meeting creation
CREATE TRIGGER meeting_created_notification
  AFTER INSERT ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION notify_meeting_created();

-- Update action item notification to work without assignee_user_id
-- Since we're storing assignee as a name string, not a user ID
CREATE OR REPLACE FUNCTION notify_action_created()
RETURNS TRIGGER AS $$
DECLARE
  meeting_title TEXT;
BEGIN
  -- Get meeting title
  SELECT title INTO meeting_title FROM meetings WHERE id = NEW.meeting_id;

  -- Notify the admin/meeting owner about new action item
  PERFORM create_notification(
    NEW.user_id,
    'action',
    'New Action Item Created',
    format('Action item "%s" has been created for %s in meeting "%s"',
      NEW.title,
      NEW.assignee,
      COALESCE(meeting_title, 'a meeting')
    ),
    '/actions'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Keep existing triggers for action items
-- (already created in previous migration)

-- Notification for action item completion
CREATE OR REPLACE FUNCTION notify_action_completed()
RETURNS TRIGGER AS $$
DECLARE
  meeting_title TEXT;
BEGIN
  -- Only notify when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get meeting title
    SELECT title INTO meeting_title FROM meetings WHERE id = NEW.meeting_id;

    -- Notify the admin
    PERFORM create_notification(
      NEW.user_id,
      'action',
      'Action Item Completed',
      format('Action item "%s" has been marked as completed',
        NEW.title
      ),
      '/actions'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for action item completion
DROP TRIGGER IF EXISTS action_completed_notification ON action_items;
CREATE TRIGGER action_completed_notification
  AFTER UPDATE ON action_items
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed')
  EXECUTE FUNCTION notify_action_completed();
