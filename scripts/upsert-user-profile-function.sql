-- Function to upsert user profile data
-- This function handles both inserting new profiles and updating existing ones

CREATE OR REPLACE FUNCTION upsert_user_profile(
  p_user_id UUID,
  p_bio TEXT DEFAULT NULL,
  p_profile_image_url TEXT DEFAULT NULL,
  p_investment_experience VARCHAR(50) DEFAULT 'beginner',
  p_risk_tolerance VARCHAR(20) DEFAULT 'moderate',
  p_preferred_sectors TEXT[] DEFAULT '{}',
  p_investment_goals TEXT[] DEFAULT '{}',
  p_portfolio_size_range VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
  profile_id UUID,
  user_id UUID,
  bio TEXT,
  profile_image_url TEXT,
  investment_experience VARCHAR(50),
  risk_tolerance VARCHAR(20),
  preferred_sectors TEXT[],
  investment_goals TEXT[],
  portfolio_size_range VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  action_performed VARCHAR(10)
) AS $$
DECLARE
  v_profile_id UUID;
  v_action VARCHAR(10);
  v_user_exists BOOLEAN;
BEGIN
  -- Validate input parameters
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;

  -- Validate investment_experience
  IF p_investment_experience NOT IN ('beginner', 'intermediate', 'advanced', 'expert') THEN
    RAISE EXCEPTION 'Invalid investment_experience: %', p_investment_experience;
  END IF;

  -- Validate risk_tolerance
  IF p_risk_tolerance NOT IN ('conservative', 'moderate', 'aggressive') THEN
    RAISE EXCEPTION 'Invalid risk_tolerance: %', p_risk_tolerance;
  END IF;

  -- Check if user exists in users table
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = p_user_id) INTO v_user_exists;
  
  IF NOT v_user_exists THEN
    RAISE EXCEPTION 'User with ID % does not exist', p_user_id;
  END IF;

  -- Check if profile already exists
  SELECT id INTO v_profile_id 
  FROM public.user_profiles 
  WHERE user_id = p_user_id;

  IF v_profile_id IS NOT NULL THEN
    -- Update existing profile
    UPDATE public.user_profiles 
    SET 
      bio = COALESCE(p_bio, bio),
      profile_image_url = COALESCE(p_profile_image_url, profile_image_url),
      investment_experience = COALESCE(p_investment_experience, investment_experience),
      risk_tolerance = COALESCE(p_risk_tolerance, risk_tolerance),
      preferred_sectors = COALESCE(p_preferred_sectors, preferred_sectors),
      investment_goals = COALESCE(p_investment_goals, investment_goals),
      portfolio_size_range = COALESCE(p_portfolio_size_range, portfolio_size_range),
      updated_at = NOW()
    WHERE user_id = p_user_id;
    
    v_action := 'updated';
  ELSE
    -- Insert new profile
    INSERT INTO public.user_profiles (
      user_id,
      bio,
      profile_image_url,
      investment_experience,
      risk_tolerance,
      preferred_sectors,
      investment_goals,
      portfolio_size_range
    ) VALUES (
      p_user_id,
      p_bio,
      p_profile_image_url,
      p_investment_experience,
      p_risk_tolerance,
      p_preferred_sectors,
      p_investment_goals,
      p_portfolio_size_range
    ) RETURNING id INTO v_profile_id;
    
    v_action := 'inserted';
  END IF;

  -- Return the profile data
  RETURN QUERY
  SELECT 
    up.id as profile_id,
    up.user_id,
    up.bio,
    up.profile_image_url,
    up.investment_experience,
    up.risk_tolerance,
    up.preferred_sectors,
    up.investment_goals,
    up.portfolio_size_range,
    up.created_at,
    up.updated_at,
    v_action::VARCHAR(10) as action_performed
  FROM public.user_profiles up
  WHERE up.id = v_profile_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_user_profile TO authenticated;

-- Add comment
COMMENT ON FUNCTION upsert_user_profile IS 'Upserts user profile data, handling both insert and update operations with validation';

-- Test function (optional - can be removed in production)
-- SELECT * FROM upsert_user_profile(
--   '00000000-0000-0000-0000-000000000000'::UUID,
--   'Test bio',
--   'https://example.com/avatar.png',
--   'intermediate',
--   'moderate',
--   ARRAY['tech', 'finance'],
--   ARRAY['long_term'],
--   '50k-100k'
-- );
