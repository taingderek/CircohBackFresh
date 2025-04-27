-- Add INSERT policy for profiles table
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Add a policy for service role operations
CREATE POLICY "Service can insert any profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role'); 