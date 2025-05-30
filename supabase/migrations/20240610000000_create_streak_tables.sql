-- Create user_streaks table
CREATE TABLE IF NOT EXISTS public.user_streaks (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak_days INTEGER DEFAULT 0 NOT NULL,
    longest_streak_days INTEGER DEFAULT 0 NOT NULL,
    current_multiplier INTEGER DEFAULT 1 NOT NULL,
    last_activity_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    level INTEGER DEFAULT 1 NOT NULL,
    total_points INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create relationship_streaks table
CREATE TABLE IF NOT EXISTS public.relationship_streaks (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    last_contact_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    streak_status TEXT DEFAULT 'active' NOT NULL CHECK (streak_status IN ('active', 'at_risk', 'broken', 'frozen')),
    optimal_frequency INTEGER DEFAULT 7, -- Default suggestion of weekly contact
    next_contact_due TIMESTAMPTZ,
    grace_period_ends TIMESTAMPTZ,
    freeze_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, contact_id)
);

-- Create streak_events table
CREATE TABLE IF NOT EXISTS public.streak_events (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'message_sent', 
        'call_logged', 
        'meeting_logged', 
        'reminder_completed', 
        'streak_frozen', 
        'streak_unfrozen', 
        'streak_recovered',
        'streak_saver_used',
        'daily_engagement'
    )),
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create streak_milestones table for rewards
CREATE TABLE IF NOT EXISTS public.streak_milestones (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    days INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('points', 'feature', 'badge')),
    reward_value TEXT NOT NULL,
    is_premium_only BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create streak_insights table
CREATE TABLE IF NOT EXISTS public.streak_insights (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('achievement', 'tip', 'correlation', 'warning')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    action_text TEXT,
    action_data TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create streak_recovery_options table
CREATE TABLE IF NOT EXISTS public.streak_recovery_options (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('grace_period', 'streak_saver', 'challenge')),
    description TEXT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    expires_at TIMESTAMPTZ,
    requirements TEXT[],
    cost_type TEXT CHECK (cost_type IN ('free', 'premium', 'points')),
    cost INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_streaks_user_id_idx ON public.user_streaks (user_id);
CREATE INDEX IF NOT EXISTS relationship_streaks_user_id_idx ON public.relationship_streaks (user_id);
CREATE INDEX IF NOT EXISTS relationship_streaks_contact_id_idx ON public.relationship_streaks (contact_id);
CREATE INDEX IF NOT EXISTS relationship_streaks_status_idx ON public.relationship_streaks (streak_status);
CREATE INDEX IF NOT EXISTS relationship_streaks_next_contact_due_idx ON public.relationship_streaks (next_contact_due);
CREATE INDEX IF NOT EXISTS streak_events_user_id_idx ON public.streak_events (user_id);
CREATE INDEX IF NOT EXISTS streak_events_contact_id_idx ON public.streak_events (contact_id);
CREATE INDEX IF NOT EXISTS streak_events_type_idx ON public.streak_events (event_type);
CREATE INDEX IF NOT EXISTS streak_events_timestamp_idx ON public.streak_events (timestamp);

-- Create function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at columns
CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_relationship_streaks_updated_at
BEFORE UPDATE ON public.relationship_streaks
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_streak_milestones_updated_at
BEFORE UPDATE ON public.streak_milestones
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_streak_recovery_options_updated_at
BEFORE UPDATE ON public.streak_recovery_options
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Add Row Level Security (RLS) policies
-- Users can only see and modify their own streak data

-- User streaks policies
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_streaks_select_policy ON public.user_streaks
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY user_streaks_insert_policy ON public.user_streaks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_streaks_update_policy ON public.user_streaks
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Relationship streaks policies
ALTER TABLE public.relationship_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY relationship_streaks_select_policy ON public.relationship_streaks
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY relationship_streaks_insert_policy ON public.relationship_streaks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY relationship_streaks_update_policy ON public.relationship_streaks
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Streak events policies
ALTER TABLE public.streak_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY streak_events_select_policy ON public.streak_events
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY streak_events_insert_policy ON public.streak_events
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Streak insights policies
ALTER TABLE public.streak_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY streak_insights_select_policy ON public.streak_insights
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY streak_insights_update_policy ON public.streak_insights
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Streak recovery options policies
ALTER TABLE public.streak_recovery_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY streak_recovery_options_select_policy ON public.streak_recovery_options
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY streak_recovery_options_insert_policy ON public.streak_recovery_options
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY streak_recovery_options_update_policy ON public.streak_recovery_options
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Insert default streak milestones
INSERT INTO public.streak_milestones (days, title, description, reward_type, reward_value, is_premium_only)
VALUES
    (7, '1 Week Streak', 'You maintained a streak for 7 days straight! Keep up the momentum.', 'points', '50', FALSE),
    (30, '1 Month Streak', 'Amazing! You've kept your streak going for 30 days.', 'points', '200', FALSE),
    (60, '2 Month Streak', '60 days of consistent connection! You're becoming a relationship pro.', 'points', '500', FALSE),
    (100, '100 Day Streak', 'Wow! 100 days is a true achievement in relationship management.', 'badge', 'century_club', FALSE),
    (180, '6 Month Streak', 'Half a year of dedication! You've earned a special power-up.', 'feature', 'streak_freeze', TRUE),
    (365, '1 Year Streak', 'Incredible! A full year of consistent relationship building.', 'badge', 'year_of_connection', FALSE); 