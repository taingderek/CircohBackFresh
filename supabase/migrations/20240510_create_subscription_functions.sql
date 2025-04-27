-- Function to upgrade a user to premium
CREATE OR REPLACE FUNCTION public.upgrade_to_premium(
  user_id UUID,
  tier TEXT DEFAULT 'premium',
  duration_days INTEGER DEFAULT 30
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate end date based on current date and duration
  end_date := NOW() + (duration_days || ' days')::INTERVAL;
  
  -- Check if there's an existing subscription
  IF EXISTS (
    SELECT 1 FROM public.user_subscriptions 
    WHERE user_id = upgrade_to_premium.user_id
  ) THEN
    -- Update existing subscription
    UPDATE public.user_subscriptions
    SET 
      tier = upgrade_to_premium.tier,
      status = 'active',
      start_date = NOW(),
      end_date = end_date,
      is_premium = TRUE,
      updated_at = NOW()
    WHERE user_id = upgrade_to_premium.user_id;
  ELSE
    -- Create new subscription
    INSERT INTO public.user_subscriptions (
      user_id, tier, status, start_date, end_date, is_premium
    ) VALUES (
      upgrade_to_premium.user_id,
      upgrade_to_premium.tier,
      'active',
      NOW(),
      end_date,
      TRUE
    );
  END IF;
END;
$$;

-- Function to cancel a user's subscription
CREATE OR REPLACE FUNCTION public.cancel_subscription(
  user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the subscription status
  UPDATE public.user_subscriptions
  SET 
    status = 'canceled',
    is_premium = FALSE,
    updated_at = NOW()
  WHERE user_id = cancel_subscription.user_id;
  
  -- If no rows were affected, the user doesn't have a subscription
  IF NOT FOUND THEN
    -- Create a canceled subscription record
    INSERT INTO public.user_subscriptions (
      user_id, tier, status, start_date, end_date, is_premium
    ) VALUES (
      cancel_subscription.user_id,
      'free',
      'inactive',
      NOW(),
      NOW(),
      FALSE
    );
  END IF;
END;
$$; 