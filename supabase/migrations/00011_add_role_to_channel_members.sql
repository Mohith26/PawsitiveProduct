-- Add role column to chat_channel_members table
ALTER TABLE chat_channel_members
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

-- Add comment
COMMENT ON COLUMN chat_channel_members.role IS 'User role in channel: admin, moderator, member';
