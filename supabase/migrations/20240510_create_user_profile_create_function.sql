-- Create a function to insert a new user profile with service role privileges
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  username TEXT,
  full_name TEXT,
  user_email TEXT,
  user_avatar TEXT DEFAULT NULL,
  user_bio TEXT DEFAULT NULL
) 
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function execute with the privileges of the creator (typically the service role)
SET search_path = public
AS $$
DECLARE
  new_profile profiles;
BEGIN
  -- Check if profile already exists
  SELECT * INTO new_profile FROM profiles WHERE id = user_id;
  
  IF found THEN
    RETURN new_profile;
  END IF;
  
  -- Insert the new profile
  INSERT INTO profiles (
    id, 
    username,
    full_name,
    avatar_url,
    email,
    bio,
    updated_at
  )
  VALUES (
    user_id,
    username,
    full_name,
    user_avatar,
    user_email,
    user_bio,
    NOW()
  )
  RETURNING * INTO new_profile;
  
  RETURN new_profile;
END;
$$; 