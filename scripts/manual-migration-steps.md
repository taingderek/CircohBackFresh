# Manual Migration Steps

To set up the database for the CircohBack application, follow these steps:

## 1. Create the exec_sql Function

Execute the following SQL in the Supabase SQL Editor:

```sql
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
```

## 2. Create the Profiles Table (if not exists)

Execute the following SQL in the Supabase SQL Editor:

```sql
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
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create index on id
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);
```

## 3. Create the get_user_profile Function

Execute the following SQL in the Supabase SQL Editor:

```sql
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
```

## 4. Run the Migration Script

After completing the manual steps above, run the migration script to apply all other migrations:

```
node scripts/apply-migrations.js
```

This will set up all the tables, functions, and data needed for the CircohBack application. 