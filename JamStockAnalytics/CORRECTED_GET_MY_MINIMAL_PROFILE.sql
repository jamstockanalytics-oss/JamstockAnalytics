-- =====================================================
-- CORRECTED get_my_minimal_profile FUNCTION
-- Fix for your original Supabase function
-- =====================================================

-- The issue with your original function is likely:
-- 1. The custom type 'user_profile_public_minimal' doesn't exist
-- 2. The user_profiles table structure might be different
-- 3. Missing permissions

-- =====================================================
-- SOLUTION 1: Create the missing type and fix the function
-- =====================================================

-- Step 1: Create the custom type
CREATE TYPE IF NOT EXISTS public.user_profile_public_minimal AS (
    id UUID,
    display_name TEXT,
    avatar_url TEXT
);

-- Step 2: Drop and recreate the function with proper error handling
DROP FUNCTION IF EXISTS public.get_my_minimal_profile();

CREATE OR REPLACE FUNCTION public.get_my_minimal_profile()
RETURNS public.user_profile_public_minimal
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    result public.user_profile_public_minimal;
BEGIN
    -- Get the user profile data
    SELECT 
        up.id,
        up.display_name,
        up.avatar_url
    INTO result
    FROM public.user_profiles up
    WHERE up.id = auth.uid();
    
    -- Return the result
    RETURN result;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        -- Return a default profile if none exists
        RETURN ROW(auth.uid(), 'Anonymous User', '')::public.user_profile_public_minimal;
    WHEN OTHERS THEN
        -- Log error and return default
        RAISE WARNING 'Error in get_my_minimal_profile: %', SQLERRM;
        RETURN ROW(auth.uid(), 'Anonymous User', '')::public.user_profile_public_minimal;
END;
$$;

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION public.get_my_minimal_profile() TO authenticated;

-- =====================================================
-- SOLUTION 2: Alternative without custom type (safer)
-- =====================================================

-- If the custom type approach doesn't work, use this:

CREATE OR REPLACE FUNCTION public.get_my_minimal_profile_v2()
RETURNS TABLE(
    id UUID,
    display_name TEXT,
    avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        COALESCE(up.display_name, 'Anonymous User') as display_name,
        COALESCE(up.avatar_url, '') as avatar_url
    FROM public.user_profiles up
    WHERE up.id = auth.uid();
    
    -- If no profile found, return default values
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            auth.uid() as id,
            'Anonymous User'::TEXT as display_name,
            ''::TEXT as avatar_url;
    END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_my_minimal_profile_v2() TO authenticated;

-- =====================================================
-- SOLUTION 3: JSON version (most compatible)
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_my_minimal_profile_json()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', up.id,
        'display_name', COALESCE(up.display_name, 'Anonymous User'),
        'avatar_url', COALESCE(up.avatar_url, '')
    )
    INTO result
    FROM public.user_profiles up
    WHERE up.id = auth.uid();
    
    -- If no profile found, return default
    IF result IS NULL THEN
        result := json_build_object(
            'id', auth.uid(),
            'display_name', 'Anonymous User',
            'avatar_url', ''
        );
    END IF;
    
    RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_my_minimal_profile_json() TO authenticated;

-- =====================================================
-- VERIFICATION AND TESTING
-- =====================================================

-- Test the functions (run these after creating them):

-- Test 1: Original function with custom type
-- SELECT public.get_my_minimal_profile();

-- Test 2: Table return version
-- SELECT * FROM public.get_my_minimal_profile_v2();

-- Test 3: JSON version
-- SELECT public.get_my_minimal_profile_json();

-- =====================================================
-- TROUBLESHOOTING GUIDE
-- =====================================================

-- If you get "type does not exist" error:
-- 1. Make sure you run the CREATE TYPE statement first
-- 2. Check if you're in the right schema (public)

-- If you get "relation does not exist" error:
-- 1. Check if user_profiles table exists: 
--    SELECT * FROM information_schema.tables WHERE table_name = 'user_profiles';
-- 2. If missing, create it or run your main setup script first

-- If you get permission errors:
-- 1. Make sure you're running as superuser or have CREATE privileges
-- 2. Check RLS policies on user_profiles table

-- If auth.uid() returns null:
-- 1. Make sure you're authenticated
-- 2. Check your Supabase auth configuration

-- =====================================================
-- RECOMMENDED USAGE
-- =====================================================

-- For most applications, use the JSON version as it's most compatible:
-- SELECT public.get_my_minimal_profile_json();

-- For type safety, use the table version:
-- SELECT * FROM public.get_my_minimal_profile_v2();

-- Only use the custom type version if you specifically need that return type:
-- SELECT public.get_my_minimal_profile();
