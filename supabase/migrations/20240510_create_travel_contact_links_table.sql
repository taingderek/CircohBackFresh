-- Create travel_contact_links table
CREATE TABLE IF NOT EXISTS public.travel_contact_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_plan_id UUID NOT NULL REFERENCES public.travel_plans(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  notify BOOLEAN DEFAULT true,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.travel_contact_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own travel contact links"
  ON public.travel_contact_links
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans
      WHERE travel_plans.id = travel_contact_links.travel_plan_id
      AND travel_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own travel contact links"
  ON public.travel_contact_links
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.travel_plans
      WHERE travel_plans.id = travel_contact_links.travel_plan_id
      AND travel_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own travel contact links"
  ON public.travel_contact_links
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans
      WHERE travel_plans.id = travel_contact_links.travel_plan_id
      AND travel_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own travel contact links"
  ON public.travel_contact_links
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans
      WHERE travel_plans.id = travel_contact_links.travel_plan_id
      AND travel_plans.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX travel_contact_links_travel_plan_id_idx ON public.travel_contact_links (travel_plan_id);
CREATE INDEX travel_contact_links_contact_id_idx ON public.travel_contact_links (contact_id);

-- Create unique constraint to prevent duplicates
CREATE UNIQUE INDEX travel_contact_links_unique_idx ON public.travel_contact_links (travel_plan_id, contact_id); 