-- Create contact_reminders table
CREATE TABLE IF NOT EXISTS public.contact_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_complete BOOLEAN DEFAULT false,
  frequency TEXT, -- 'one-time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.contact_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contact reminders"
  ON public.contact_reminders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contact reminders"
  ON public.contact_reminders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact reminders"
  ON public.contact_reminders
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact reminders"
  ON public.contact_reminders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX contact_reminders_contact_id_idx ON public.contact_reminders (contact_id);
CREATE INDEX contact_reminders_user_id_idx ON public.contact_reminders (user_id);
CREATE INDEX contact_reminders_reminder_date_idx ON public.contact_reminders (reminder_date); 