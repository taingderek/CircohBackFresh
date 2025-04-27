-- Check if the policy already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
    ) THEN
        -- Add INSERT policy for profiles table
        CREATE POLICY "Users can insert their own profile"
          ON profiles FOR INSERT
          WITH CHECK (auth.uid() = id);
    END IF;
END
$$;

-- Add a service role policy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Service can insert any profile'
    ) THEN
        CREATE POLICY "Service can insert any profile"
          ON profiles FOR INSERT
          WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END
$$; 