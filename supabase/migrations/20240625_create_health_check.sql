-- Create a health_check table for connection testing
CREATE TABLE IF NOT EXISTS public.health_check (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'ok',
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  environment TEXT,
  version TEXT
);

-- Insert a default record
INSERT INTO public.health_check (status, environment, version)
VALUES ('ok', current_setting('app.environment', TRUE), '1.0.0')
ON CONFLICT DO NOTHING;

-- Create an index on status for fast queries
CREATE INDEX IF NOT EXISTS idx_health_check_status ON public.health_check(status);

-- Add RLS policies to allow anonymous read access
ALTER TABLE public.health_check ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to health_check" 
  ON public.health_check
  FOR SELECT 
  TO anon
  USING (true);

-- Disable insert/update/delete for non-authenticated users
CREATE POLICY "Prohibit anonymous write access to health_check" 
  ON public.health_check
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- Comment on table
COMMENT ON TABLE public.health_check IS 'Table used for health checks and connectivity testing'; 