-- Add correct_option to questions table
ALTER TABLE questions 
ADD COLUMN correct_option INTEGER;

-- Create messages table for chat
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    sender_name TEXT NOT NULL,
    sender_id TEXT NOT NULL, -- session_id or user.id
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone for a poll
CREATE POLICY "Anyone can read messages" ON messages
    FOR SELECT
    USING (true);

-- Allow insert access to everyone (could be tighter, but for now open)
CREATE POLICY "Anyone can insert messages" ON messages
    FOR INSERT
    WITH CHECK (true);

-- Realtime publication for messages (if not already enabled globally)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;
