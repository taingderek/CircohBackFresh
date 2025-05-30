-- Streak Tracking Tables for CircohBack
-- Creates tables for tracking user streaks, relationship streaks, and streak events

-- Enum for streak status
CREATE TYPE streak_status AS ENUM ('active', 'at_risk', 'broken');

-- Table for user streaks (overall app engagement streaks)
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak_days INTEGER NOT NULL DEFAULT 0,
  current_multiplier DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  total_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  points_to_next_level INTEGER NOT NULL DEFAULT 100,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Each user can only have one streak record
  UNIQUE(user_id)
);

-- Table for relationship streaks
CREATE TABLE IF NOT EXISTS relationship_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL, -- Reference to contacts table
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_contact_due_date TIMESTAMP WITH TIME ZONE,
  grace_period_ends TIMESTAMP WITH TIME ZONE,
  streak_status streak_status NOT NULL DEFAULT 'active',
  contact_frequency_days INTEGER NOT NULL DEFAULT 7, -- How often contact should be made
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Each user-contact pair can only have one streak record
  UNIQUE(user_id, contact_id)
);

-- Table for tracking all streak-relevant activities
CREATE TABLE IF NOT EXISTS streak_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID, -- Optional, only for relationship streak events
  event_type VARCHAR(50) NOT NULL, -- e.g., 'app_login', 'contact_message', 'contact_call'
  event_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_earned INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for streak milestones and rewards
CREATE TABLE IF NOT EXISTS streak_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID, -- Optional, for relationship milestones
  milestone_type VARCHAR(50) NOT NULL, -- e.g., 'streak_7_days', 'streak_30_days'
  streak_days INTEGER NOT NULL,
  reward_type VARCHAR(50), -- e.g., 'points', 'streak_freeze', 'premium_feature'
  reward_amount INTEGER,
  is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for streak recovery items
CREATE TABLE IF NOT EXISTS streak_recovery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- e.g., 'streak_freeze', 'streak_saver'
  quantity INTEGER NOT NULL DEFAULT 1,
  is_premium BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for security
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_recovery_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_streaks
CREATE POLICY "Users can view their own streak data" 
  ON user_streaks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all streak data" 
  ON user_streaks 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS policies for relationship_streaks
CREATE POLICY "Users can view their own relationship streaks" 
  ON relationship_streaks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all relationship streaks" 
  ON relationship_streaks 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_streaks_user_id ON relationship_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_streaks_contact_id ON relationship_streaks(contact_id);
CREATE INDEX IF NOT EXISTS idx_relationship_streaks_streak_status ON relationship_streaks(streak_status);
CREATE INDEX IF NOT EXISTS idx_streak_events_user_id ON streak_events(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_events_contact_id ON streak_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_streak_events_event_date ON streak_events(event_date);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update the updated_at timestamp
CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON user_streaks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relationship_streaks_updated_at
BEFORE UPDATE ON relationship_streaks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streak_recovery_items_updated_at
BEFORE UPDATE ON streak_recovery_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create a view for at-risk relationships
CREATE OR REPLACE VIEW at_risk_relationships AS
SELECT rs.*
FROM relationship_streaks rs
WHERE rs.streak_status = 'at_risk'
ORDER BY rs.grace_period_ends ASC;

-- Create a view for active streaks summary
CREATE OR REPLACE VIEW active_streaks_summary AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE streak_status = 'active') AS active_streaks_count,
  COUNT(*) FILTER (WHERE streak_status = 'at_risk') AS at_risk_streaks_count,
  COUNT(*) FILTER (WHERE streak_status = 'broken') AS broken_streaks_count,
  AVG(current_streak) FILTER (WHERE streak_status = 'active') AS avg_active_streak_length,
  MAX(current_streak) AS max_current_streak
FROM relationship_streaks
GROUP BY user_id; 