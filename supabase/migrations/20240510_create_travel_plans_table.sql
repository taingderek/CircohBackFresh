-- Create travel_plans table
CREATE TABLE IF NOT EXISTS public.travel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  destination_coords GEOGRAPHY(POINT),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  notify_contacts BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own travel plans"
  ON public.travel_plans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own travel plans"
  ON public.travel_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel plans"
  ON public.travel_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travel plans"
  ON public.travel_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX travel_plans_user_id_idx ON public.travel_plans (user_id);
CREATE INDEX travel_plans_date_idx ON public.travel_plans (start_date, end_date); 