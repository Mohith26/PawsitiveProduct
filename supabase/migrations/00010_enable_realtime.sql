-- Enable Supabase Realtime for chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Set REPLICA IDENTITY FULL so realtime can send full row data
ALTER TABLE chat_messages REPLICA IDENTITY FULL;
