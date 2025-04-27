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