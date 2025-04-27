-- Enable PostGIS extension for location data
CREATE OR REPLACE FUNCTION public.enable_postgis()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS postgis;
END;
$$;

-- Create contacts table
CREATE OR REPLACE FUNCTION public.create_contacts_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    birthday DATE,
    relationship TEXT,
    location GEOGRAPHY(POINT),
    notes TEXT,
    importance INTEGER CHECK (importance BETWEEN 1 AND 5),
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_contact_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    avatar_url TEXT,
    contact_frequency TEXT,
    is_favorite BOOLEAN DEFAULT false
  );
  
  -- Create index on user_id for faster queries
  CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON public.contacts (user_id);
  
  -- Add row level security
  ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
  
  -- Create policy to allow users to only see their own contacts
  DROP POLICY IF EXISTS contacts_policy ON public.contacts;
  CREATE POLICY contacts_policy ON public.contacts
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
    
  -- Create trigger to update the updated_at timestamp
  DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
  CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
END;
$$;

-- Create reminders table
CREATE OR REPLACE FUNCTION public.create_reminders_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT,
    priority INTEGER CHECK (priority BETWEEN 1 AND 3),
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    notification_sent BOOLEAN DEFAULT false,
    snoozed_until TIMESTAMP WITH TIME ZONE
  );
  
  -- Create indexes for faster queries
  CREATE INDEX IF NOT EXISTS reminders_user_id_idx ON public.reminders (user_id);
  CREATE INDEX IF NOT EXISTS reminders_contact_id_idx ON public.reminders (contact_id);
  CREATE INDEX IF NOT EXISTS reminders_date_idx ON public.reminders (reminder_date);
  
  -- Add row level security
  ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
  
  -- Create policy to allow users to only see their own reminders
  DROP POLICY IF EXISTS reminders_policy ON public.reminders;
  CREATE POLICY reminders_policy ON public.reminders
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
    
  -- Create trigger to update the updated_at timestamp
  DROP TRIGGER IF EXISTS update_reminders_updated_at ON public.reminders;
  CREATE TRIGGER update_reminders_updated_at
    BEFORE UPDATE ON public.reminders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
END;
$$;

-- Create travel plans table
CREATE OR REPLACE FUNCTION public.create_travel_plans_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.travel_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    destination_coords GEOGRAPHY(POINT),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
  );
  
  -- Create join table for contacts associated with travel plans
  CREATE TABLE IF NOT EXISTS public.travel_plan_contacts (
    travel_plan_id UUID REFERENCES public.travel_plans(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (travel_plan_id, contact_id)
  );
  
  -- Create indexes for faster queries
  CREATE INDEX IF NOT EXISTS travel_plans_user_id_idx ON public.travel_plans (user_id);
  CREATE INDEX IF NOT EXISTS travel_plans_date_idx ON public.travel_plans (start_date, end_date);
  
  -- Add row level security
  ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.travel_plan_contacts ENABLE ROW LEVEL SECURITY;
  
  -- Create policies to allow users to only see their own travel plans
  DROP POLICY IF EXISTS travel_plans_policy ON public.travel_plans;
  CREATE POLICY travel_plans_policy ON public.travel_plans
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
    
  -- Create policy for travel_plan_contacts
  DROP POLICY IF EXISTS travel_plan_contacts_policy ON public.travel_plan_contacts;
  CREATE POLICY travel_plan_contacts_policy ON public.travel_plan_contacts
    USING (EXISTS (
      SELECT 1 FROM public.travel_plans
      WHERE travel_plans.id = travel_plan_contacts.travel_plan_id
      AND travel_plans.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.travel_plans
      WHERE travel_plans.id = travel_plan_contacts.travel_plan_id
      AND travel_plans.user_id = auth.uid()
    ));
    
  -- Create trigger to update the updated_at timestamp
  DROP TRIGGER IF EXISTS update_travel_plans_updated_at ON public.travel_plans;
  CREATE TRIGGER update_travel_plans_updated_at
    BEFORE UPDATE ON public.travel_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
END;
$$;

-- Function to set up triggers for automatic reminders
CREATE OR REPLACE FUNCTION public.setup_reminder_triggers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Helper function to create birthday reminders
  CREATE OR REPLACE FUNCTION public.create_birthday_reminder()
  RETURNS TRIGGER AS $$
  BEGIN
    -- Only create reminder if birthday is set and it's a new contact or birthday changed
    IF NEW.birthday IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.birthday IS NULL OR NEW.birthday <> OLD.birthday) THEN
      -- Calculate next birthday
      DECLARE
        next_birthday TIMESTAMP WITH TIME ZONE;
      BEGIN
        -- Set next birthday this year or next year if already passed
        IF (EXTRACT(MONTH FROM NEW.birthday), EXTRACT(DAY FROM NEW.birthday)) > 
           (EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(DAY FROM CURRENT_DATE)) THEN
          next_birthday := make_timestamptz(
            EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
            EXTRACT(MONTH FROM NEW.birthday)::INTEGER,
            EXTRACT(DAY FROM NEW.birthday)::INTEGER,
            0, 0, 0
          );
        ELSE
          next_birthday := make_timestamptz(
            EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 1,
            EXTRACT(MONTH FROM NEW.birthday)::INTEGER,
            EXTRACT(DAY FROM NEW.birthday)::INTEGER,
            0, 0, 0
          );
        END IF;
        
        -- Insert birthday reminder
        INSERT INTO public.reminders (
          user_id, contact_id, title, description, reminder_date, 
          is_recurring, recurrence_pattern, priority
        ) VALUES (
          NEW.user_id, 
          NEW.id, 
          'Birthday: ' || NEW.full_name, 
          'Birthday celebration for ' || NEW.full_name, 
          next_birthday - INTERVAL '1 week',
          TRUE,
          'YEARLY',
          1
        );
      END;
    END IF;
    
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Create or replace the trigger
  DROP TRIGGER IF EXISTS contact_birthday_reminder_trigger ON public.contacts;
  CREATE TRIGGER contact_birthday_reminder_trigger
    AFTER INSERT OR UPDATE OF birthday ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.create_birthday_reminder();
    
  -- Helper function to maintain updated_at column
  CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
END;
$$; 