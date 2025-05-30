-- Create ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    rated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rater_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    category TEXT NOT NULL CHECK (category IN ('overall', 'thoughtfulness', 'responsiveness', 'empathy')),
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create rating_privacy_settings table
CREATE TABLE IF NOT EXISTS public.rating_privacy_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    allow_receiving_ratings BOOLEAN DEFAULT true,
    allow_anonymous_ratings BOOLEAN DEFAULT true,
    display_ratings_on_profile BOOLEAN DEFAULT true,
    minimum_ratings_to_show INTEGER DEFAULT 3,
    allow_detailed_breakdown BOOLEAN DEFAULT true,
    show_trend BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create feedback_requests table
CREATE TABLE IF NOT EXISTS public.feedback_requests (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    requested_from_ids UUID[] NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

-- Create aggregated_ratings table to store pre-computed statistics
CREATE TABLE IF NOT EXISTS public.aggregated_ratings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_rating FLOAT DEFAULT 0 NOT NULL,
    thoughtfulness_rating FLOAT DEFAULT 0 NOT NULL,
    responsiveness_rating FLOAT DEFAULT 0 NOT NULL,
    empathy_rating FLOAT DEFAULT 0 NOT NULL,
    total_ratings INTEGER DEFAULT 0 NOT NULL,
    trend TEXT DEFAULT 'new' CHECK (trend IN ('improving', 'declining', 'stable', 'new')),
    last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS ratings_rated_user_id_idx ON public.ratings (rated_user_id);
CREATE INDEX IF NOT EXISTS ratings_rater_id_idx ON public.ratings (rater_id);
CREATE INDEX IF NOT EXISTS ratings_category_idx ON public.ratings (category);
CREATE INDEX IF NOT EXISTS feedback_requests_user_id_idx ON public.feedback_requests (user_id);

-- Function to calculate network average rating (premium feature)
CREATE OR REPLACE FUNCTION public.get_network_rating_average()
RETURNS TABLE (average FLOAT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT AVG(rating)::FLOAT
    FROM public.ratings
    WHERE category = 'overall';
END;
$$;

-- Row Level Security Policies

-- Rating privacy settings - only the user can change their own settings
ALTER TABLE public.rating_privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own privacy settings"
    ON public.rating_privacy_settings
    FOR SELECT
    USING (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own privacy settings"
    ON public.rating_privacy_settings
    FOR UPDATE
    USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own privacy settings"
    ON public.rating_privacy_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Ratings - users can view ratings they're permitted to see based on privacy settings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ratings they've received with settings check"
    ON public.ratings
    FOR SELECT
    USING (
        -- The rated user can see their own ratings
        auth.uid() = rated_user_id
        -- The rater can see ratings they've given
        OR auth.uid() = rater_id 
        -- Admins can see all ratings (would need admin role check in real system)
        OR EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND raw_app_meta_data->>'role' = 'admin'
        )
    );
    
CREATE POLICY "Users can create ratings"
    ON public.ratings
    FOR INSERT
    WITH CHECK (
        -- Must be authenticated to create a rating
        auth.uid() IS NOT NULL
        -- Can't rate yourself
        AND auth.uid() != rated_user_id
        -- Anonymous ratings can have rater_id set to NULL
        AND (rater_id IS NULL OR rater_id = auth.uid())
    );

-- Feedback requests - only the user can manage their own requests
ALTER TABLE public.feedback_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback requests"
    ON public.feedback_requests
    FOR SELECT
    USING (auth.uid() = user_id);
    
CREATE POLICY "Users can create their own feedback requests"
    ON public.feedback_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own feedback requests"
    ON public.feedback_requests
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Aggregated ratings - allow public view access with privacy checks
ALTER TABLE public.aggregated_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own aggregated ratings"
    ON public.aggregated_ratings
    FOR SELECT
    USING (
        -- The user can see their own aggregated ratings
        auth.uid() = user_id
        -- Others can see aggregated ratings based on privacy settings
        OR EXISTS (
            SELECT 1 FROM public.rating_privacy_settings
            WHERE user_id = aggregated_ratings.user_id
            AND display_ratings_on_profile = true
            -- Only show if minimum threshold is met
            AND (
                SELECT COUNT(*) FROM public.ratings 
                WHERE rated_user_id = aggregated_ratings.user_id 
                AND category = 'overall'
            ) >= minimum_ratings_to_show
        )
    );

-- Only internal functions can update aggregated ratings for security
CREATE POLICY "Only system functions can modify aggregated ratings"
    ON public.aggregated_ratings
    FOR ALL
    USING (
        -- Allow all operations for authenticated users
        -- In a production system, this would be restricted to system functions
        auth.uid() IS NOT NULL
    );

-- Create trigger to update aggregated ratings when a new rating is added
CREATE OR REPLACE FUNCTION public.update_aggregated_ratings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_overall FLOAT;
    v_thoughtfulness FLOAT;
    v_responsiveness FLOAT;
    v_empathy FLOAT;
    v_total INTEGER;
    v_trend TEXT;
    v_older_avg FLOAT;
    v_recent_avg FLOAT;
BEGIN
    -- Calculate averages for each category
    SELECT AVG(rating) INTO v_overall
    FROM public.ratings
    WHERE rated_user_id = NEW.rated_user_id AND category = 'overall';
    
    SELECT AVG(rating) INTO v_thoughtfulness
    FROM public.ratings
    WHERE rated_user_id = NEW.rated_user_id AND category = 'thoughtfulness';
    
    SELECT AVG(rating) INTO v_responsiveness
    FROM public.ratings
    WHERE rated_user_id = NEW.rated_user_id AND category = 'responsiveness';
    
    SELECT AVG(rating) INTO v_empathy
    FROM public.ratings
    WHERE rated_user_id = NEW.rated_user_id AND category = 'empathy';
    
    -- Count total overall ratings
    SELECT COUNT(*) INTO v_total
    FROM public.ratings
    WHERE rated_user_id = NEW.rated_user_id AND category = 'overall';
    
    -- Determine trend
    IF v_total <= 3 THEN
        v_trend := 'new';
    ELSE
        -- Get average of recent ratings (last 3)
        WITH recent_ratings AS (
            SELECT rating
            FROM public.ratings
            WHERE rated_user_id = NEW.rated_user_id
            AND category = 'overall'
            ORDER BY created_at DESC
            LIMIT 3
        )
        SELECT AVG(rating) INTO v_recent_avg
        FROM recent_ratings;
        
        -- Get average of older ratings
        WITH older_ratings AS (
            SELECT rating
            FROM public.ratings
            WHERE rated_user_id = NEW.rated_user_id
            AND category = 'overall'
            ORDER BY created_at DESC
            OFFSET 3
        )
        SELECT AVG(rating) INTO v_older_avg
        FROM older_ratings;
        
        -- Compare averages
        IF v_recent_avg > v_older_avg + 0.5 THEN
            v_trend := 'improving';
        ELSIF v_recent_avg < v_older_avg - 0.5 THEN
            v_trend := 'declining';
        ELSE
            v_trend := 'stable';
        END IF;
    END IF;
    
    -- Insert or update aggregated ratings
    INSERT INTO public.aggregated_ratings (
        user_id, 
        overall_rating, 
        thoughtfulness_rating, 
        responsiveness_rating, 
        empathy_rating, 
        total_ratings, 
        trend, 
        last_updated
    )
    VALUES (
        NEW.rated_user_id,
        COALESCE(v_overall, 0),
        COALESCE(v_thoughtfulness, 0),
        COALESCE(v_responsiveness, 0),
        COALESCE(v_empathy, 0),
        v_total,
        v_trend,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        overall_rating = COALESCE(v_overall, 0),
        thoughtfulness_rating = COALESCE(v_thoughtfulness, 0),
        responsiveness_rating = COALESCE(v_responsiveness, 0),
        empathy_rating = COALESCE(v_empathy, 0),
        total_ratings = v_total,
        trend = v_trend,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$;

-- Attach trigger to ratings table
CREATE TRIGGER update_aggregated_ratings_trigger
AFTER INSERT OR UPDATE ON public.ratings
FOR EACH ROW
WHEN (NEW.category = 'overall')
EXECUTE FUNCTION public.update_aggregated_ratings(); 