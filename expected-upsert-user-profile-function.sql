-- =====================================================
-- EXPECTED upsert_user_profile FUNCTION DEFINITION
-- Based on your Supabase schema analysis
-- =====================================================

-- This is what the upsert_user_profile function likely looks like:

CREATE OR REPLACE FUNCTION public.upsert_user_profile(
    p_bio TEXT DEFAULT NULL,
    p_investment_experience VARCHAR(50) DEFAULT 'beginner',
    p_risk_tolerance VARCHAR(20) DEFAULT 'moderate',
    p_investment_goals TEXT[] DEFAULT NULL,
    p_portfolio_size_range VARCHAR(50) DEFAULT NULL,
    p_preferred_sectors TEXT[] DEFAULT NULL
)
RETURNS public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    profile_record public.user_profiles;
BEGIN
    -- Get current authenticated user ID
    current_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to update profile';
    END IF;
    
    -- Validate investment_experience
    IF p_investment_experience NOT IN ('beginner', 'intermediate', 'advanced', 'expert') THEN
        RAISE EXCEPTION 'Invalid investment_experience value';
    END IF;
    
    -- Validate risk_tolerance
    IF p_risk_tolerance NOT IN ('conservative', 'moderate', 'aggressive') THEN
        RAISE EXCEPTION 'Invalid risk_tolerance value';
    END IF;
    
    -- Perform UPSERT operation
    INSERT INTO public.user_profiles (
        user_id,
        bio,
        investment_experience,
        risk_tolerance,
        investment_goals,
        portfolio_size_range,
        preferred_sectors,
        created_at,
        updated_at
    ) VALUES (
        current_user_id,
        p_bio,
        p_investment_experience,
        p_risk_tolerance,
        p_investment_goals,
        p_portfolio_size_range,
        p_preferred_sectors,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        bio = EXCLUDED.bio,
        investment_experience = EXCLUDED.investment_experience,
        risk_tolerance = EXCLUDED.risk_tolerance,
        investment_goals = EXCLUDED.investment_goals,
        portfolio_size_range = EXCLUDED.portfolio_size_range,
        preferred_sectors = EXCLUDED.preferred_sectors,
        updated_at = NOW()
    RETURNING * INTO profile_record;
    
    -- Return the updated/inserted record
    RETURN profile_record;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and re-raise
        RAISE EXCEPTION 'Error upserting user profile: %', SQLERRM;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.upsert_user_profile TO authenticated;

-- =====================================================
-- ALTERNATIVE VERSION (if using JSONB for flexibility)
-- =====================================================

CREATE OR REPLACE FUNCTION public.upsert_user_profile_json(
    p_profile_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    result JSONB;
    profile_record public.user_profiles;
BEGIN
    -- Get current authenticated user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to update profile';
    END IF;
    
    -- Extract values from JSONB with defaults
    INSERT INTO public.user_profiles (
        user_id,
        bio,
        investment_experience,
        risk_tolerance,
        investment_goals,
        portfolio_size_range,
        preferred_sectors,
        created_at,
        updated_at
    ) VALUES (
        current_user_id,
        COALESCE(p_profile_data->>'bio', NULL),
        COALESCE(p_profile_data->>'investment_experience', 'beginner'),
        COALESCE(p_profile_data->>'risk_tolerance', 'moderate'),
        CASE 
            WHEN p_profile_data ? 'investment_goals' 
            THEN ARRAY(SELECT jsonb_array_elements_text(p_profile_data->'investment_goals'))
            ELSE NULL 
        END,
        COALESCE(p_profile_data->>'portfolio_size_range', NULL),
        CASE 
            WHEN p_profile_data ? 'preferred_sectors' 
            THEN ARRAY(SELECT jsonb_array_elements_text(p_profile_data->'preferred_sectors'))
            ELSE NULL 
        END,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        bio = EXCLUDED.bio,
        investment_experience = EXCLUDED.investment_experience,
        risk_tolerance = EXCLUDED.risk_tolerance,
        investment_goals = EXCLUDED.investment_goals,
        portfolio_size_range = EXCLUDED.portfolio_size_range,
        preferred_sectors = EXCLUDED.preferred_sectors,
        updated_at = NOW()
    RETURNING * INTO profile_record;
    
    -- Convert to JSONB for return
    result := to_jsonb(profile_record);
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error upserting user profile: %', SQLERRM;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.upsert_user_profile_json TO authenticated;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Example 1: Using the standard function
-- SELECT public.upsert_user_profile(
--     'Experienced investor focused on tech stocks',
--     'advanced',
--     'aggressive',
--     ARRAY['long_term_growth', 'dividend_income'],
--     '100k-500k',
--     ARRAY['technology', 'finance']
-- );

-- Example 2: Using the JSONB version
-- SELECT public.upsert_user_profile_json('{
--     "bio": "Experienced investor",
--     "investment_experience": "advanced",
--     "risk_tolerance": "aggressive",
--     "investment_goals": ["long_term_growth", "dividend_income"],
--     "portfolio_size_range": "100k-500k",
--     "preferred_sectors": ["technology", "finance"]
-- }'::jsonb);

-- =====================================================
-- TABLE STRUCTURE REFERENCE
-- =====================================================

-- public.user_profiles table structure:
-- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
-- user_id UUID REFERENCES public.users(id) ON DELETE CASCADE
-- bio TEXT
-- investment_experience VARCHAR(50) DEFAULT 'beginner' 
--   CHECK (investment_experience IN ('beginner', 'intermediate', 'advanced', 'expert'))
-- risk_tolerance VARCHAR(20) DEFAULT 'moderate' 
--   CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive'))
-- investment_goals TEXT[]
-- portfolio_size_range VARCHAR(50)
-- preferred_sectors TEXT[]
-- created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
