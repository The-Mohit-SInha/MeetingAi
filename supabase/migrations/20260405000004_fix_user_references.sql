-- Fix foreign key references to use public.users instead of auth.users

-- Drop existing foreign key constraints
ALTER TABLE groups DROP CONSTRAINT IF EXISTS groups_owner_id_fkey;
ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;
ALTER TABLE meeting_attendance DROP CONSTRAINT IF EXISTS meeting_attendance_user_id_fkey;
ALTER TABLE action_items DROP CONSTRAINT IF EXISTS action_items_assignee_user_id_fkey;
ALTER TABLE action_items DROP CONSTRAINT IF EXISTS action_items_assigned_by_user_id_fkey;

-- Recreate foreign key constraints pointing to public.users
ALTER TABLE groups
  ADD CONSTRAINT groups_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE group_members
  ADD CONSTRAINT group_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE meeting_attendance
  ADD CONSTRAINT meeting_attendance_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE action_items
  ADD CONSTRAINT action_items_assignee_user_id_fkey
  FOREIGN KEY (assignee_user_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE action_items
  ADD CONSTRAINT action_items_assigned_by_user_id_fkey
  FOREIGN KEY (assigned_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
