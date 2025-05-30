-- Messages and Conversations Schema for CircohBack

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tone VARCHAR(50),
  generated BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  type VARCHAR(50) DEFAULT 'message',
  sentiment VARCHAR(50) DEFAULT 'neutral',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages" 
  ON messages FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages" 
  ON messages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" 
  ON messages FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
  ON messages FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS messages_contact_id_idx ON messages(contact_id);
CREATE INDEX IF NOT EXISTS messages_timestamp_idx ON messages(timestamp);

-- Contact memory prompts table
CREATE TABLE IF NOT EXISTS contact_memory_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'ai', 'system'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for contact memory prompts
ALTER TABLE contact_memory_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contact memory prompts" 
  ON contact_memory_prompts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contact memory prompts" 
  ON contact_memory_prompts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact memory prompts" 
  ON contact_memory_prompts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact memory prompts" 
  ON contact_memory_prompts FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS contact_memory_prompts_contact_id_idx ON contact_memory_prompts(contact_id);

-- Conversation statistics table for caching and performance
CREATE TABLE IF NOT EXISTS conversation_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  message_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  last_message_timestamp TIMESTAMP WITH TIME ZONE,
  circoh_back_score DECIMAL(3,1) DEFAULT 3.0,
  engagement_level VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contact_id)
);

-- Add RLS policies for conversation stats
ALTER TABLE conversation_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversation stats" 
  ON conversation_stats FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversation stats" 
  ON conversation_stats FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation stats" 
  ON conversation_stats FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS conversation_stats_contact_id_idx ON conversation_stats(contact_id);

-- Create function to update conversation stats when a message is created or updated
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert conversation stats
  INSERT INTO conversation_stats (user_id, contact_id, message_count, unread_count, last_message_timestamp)
  VALUES (
    NEW.user_id, 
    NEW.contact_id, 
    1, 
    CASE WHEN NEW.read = FALSE THEN 1 ELSE 0 END,
    NEW.timestamp
  )
  ON CONFLICT (user_id, contact_id) DO UPDATE SET
    message_count = conversation_stats.message_count + 1,
    unread_count = CASE 
      WHEN NEW.read = FALSE THEN conversation_stats.unread_count + 1 
      ELSE conversation_stats.unread_count
    END,
    last_message_timestamp = GREATEST(conversation_stats.last_message_timestamp, NEW.timestamp),
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation stats on message creation
CREATE TRIGGER trigger_update_conversation_stats
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_stats();

-- Create function to update conversation stats when a message is marked as read
CREATE OR REPLACE FUNCTION update_read_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if read status changed from false to true
  IF OLD.read = FALSE AND NEW.read = TRUE THEN
    -- Update conversation stats
    UPDATE conversation_stats
    SET unread_count = GREATEST(0, unread_count - 1),
        last_updated = NOW()
    WHERE user_id = NEW.user_id AND contact_id = NEW.contact_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation stats when a message is marked as read
CREATE TRIGGER trigger_update_read_status
AFTER UPDATE OF read ON messages
FOR EACH ROW
EXECUTE FUNCTION update_read_status(); 