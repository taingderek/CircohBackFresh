// Direct SQL execution to set up initial database functions and tables
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupInitialDb() {
  console.log('Setting up initial database components...');
  
  try {
    // Create profiles table if it doesn't exist
    console.log('Creating profiles table...');
    const profilesTableSql = `
      -- Create profiles table if it doesn't exist
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        username TEXT UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        email TEXT,
        bio TEXT,
        updated_at TIMESTAMP WITH TIME ZONE
      );
      
      -- Enable RLS
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      
      -- Create policy to only allow users to access their own profile
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile'
        ) THEN
          CREATE POLICY "Users can view their own profile"
            ON public.profiles
            FOR SELECT
            USING (auth.uid() = id);
        END IF;
      END $$;
      
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
        ) THEN
          CREATE POLICY "Users can update their own profile"
            ON public.profiles
            FOR UPDATE
            USING (auth.uid() = id);
        END IF;
      END $$;
      
      -- Create index on id
      CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);
    `;
    
    const { error: profilesError } = await supabase.rpc('exec_sql', { sql: profilesTableSql });
    
    if (profilesError) {
      // Create exec_sql function first
      console.log('Creating exec_sql function...');
      const execSqlFunctionSql = `
        -- Create function to execute SQL directly
        CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
        RETURNS VOID
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$;
      `;
      
      // Use direct SQL execution via REST API instead of querying a nonexistent table
      const { error: execSqlError } = await supabase.rest.sql(execSqlFunctionSql);
      
      if (execSqlError) {
        console.error('Error creating exec_sql function:', execSqlError);
        console.log('Please execute the SQL commands manually using the Supabase SQL Editor as described in manual-migration-steps.md');
        process.exit(1);
      }
      
      // Try creating profiles table again
      const { error: profilesRetryError } = await supabase.rpc('exec_sql', { sql: profilesTableSql });
      
      if (profilesRetryError) {
        console.error('Error creating profiles table:', profilesRetryError);
        console.log('Please execute the SQL commands manually using the Supabase SQL Editor as described in manual-migration-steps.md');
        process.exit(1);
      }
    }
    
    // Create get_user_profile function
    console.log('Creating get_user_profile function...');
    const getUserProfileSql = `
      -- Create the function to get a user's profile
      CREATE OR REPLACE FUNCTION public.get_user_profile(p_user_id UUID)
      RETURNS SETOF public.profiles
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      BEGIN
        -- Return the user's profile record
        RETURN QUERY
        SELECT *
        FROM public.profiles
        WHERE id = p_user_id;
        
        -- If no profile found, check if user exists and create a default profile
        IF NOT FOUND THEN
          -- Check if user exists in auth.users
          IF EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
            -- Insert a default profile
            INSERT INTO public.profiles (id, username, full_name, avatar_url, email, bio, updated_at)
            SELECT 
              id,
              SPLIT_PART(email, '@', 1), -- Use part before @ as username
              COALESCE(raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1)), -- Use name from metadata if available
              NULL, -- No avatar
              email,
              NULL, -- No bio
              NOW()
            FROM auth.users
            WHERE id = p_user_id
            RETURNING *;
            
            -- Return the newly created profile
            RETURN QUERY
            SELECT *
            FROM public.profiles
            WHERE id = p_user_id;
          END IF;
        END IF;
        
        RETURN;
      END;
      $$;
    `;
    
    const { error: profileFunctionError } = await supabase.rpc('exec_sql', { sql: getUserProfileSql });
    
    if (profileFunctionError) {
      console.error('Error creating get_user_profile function:', profileFunctionError);
      console.log('Please execute the SQL commands manually using the Supabase SQL Editor as described in manual-migration-steps.md');
      process.exit(1);
    }
    
    console.log('Initial database setup completed successfully.');
    console.log('You can now run the app and sign in.');
    
  } catch (err) {
    console.error('Unexpected error during setup:', err);
    console.log('Please execute the SQL commands manually using the Supabase SQL Editor as described in manual-migration-steps.md');
  }
}

// Run the setup
setupInitialDb(); 