-- =====================================================
-- FIXED USER PROFILE FUNCTION FOR SUPABASE
-- JamStockAnalytics - Corrected get_my_minimal_profile function
-- =====================================================

-- Step 1: Create the minimal profile type if it doesn't exist
CREATE TYPE IF NOT EXISTS public.user_profile_public_minimal AS (
    id UUID,
    display_name TEXT,
    avatar_url TEXT
);

-- Step 2: Drop the existing function if it exists (to avoid conflicts)
DROP FUNCTION IF EXISTS public.get_my_minimal_profile();

-- Step 3: Create the corrected function
CREATE OR REPLACE FUNCTION public.get_my_minimal_profile()
RETURNS public.user_profile_public_minimal
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    up.id,
    up.display_name,
    up.avatar_url
  FROM public.user_profiles up
  WHERE up.id = auth.uid();
$$;

-- Step 4: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_minimal_profile() TO authenticated;

-- Step 5: Create an alternative function that handles missing profiles gracefully
CREATE OR REPLACE FUNCTION public.get_my_profile_safe()
RETURNS TABLE(
    id UUID,
    display_name TEXT,
    avatar_url TEXT,
    exists BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    COALESCE(up.id, auth.uid()) as id,
    COALESCE(up.display_name, 'Anonymous User') as display_name,
    COALESCE(up.avatar_url, '') as avatar_url,
    (up.id IS NOT NULL) as exists
  FROM public.user_profiles up
  WHERE up.id = auth.uid();
$$;

-- Step 6: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_profile_safe() TO authenticated;

-- Step 7: Create a function to ensure user profile exists
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert a basic profile if it doesn't exist
  INSERT INTO public.user_profiles (
    id,
    display_name,
    avatar_url,
    created_at,
    updated_at
  )
  SELECT
    auth.uid(),
    'User ' || substr(auth.uid()::text, 1, 8),
    '',
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid()
  );
END;
$$;

-- Step 8: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Test the function (run these after creating the function)
-- SELECT public.get_my_minimal_profile();
-- SELECT public.get_my_profile_safe();
-- SELECT public.ensure_user_profile();

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Example 1: Get minimal profile (will error if profile doesn't exist)
-- SELECT public.get_my_minimal_profile();

-- Example 2: Get profile safely (returns default values if profile doesn't exist)
-- SELECT public.get_my_profile_safe();

-- Example 3: Ensure profile exists before getting it
-- SELECT public.ensure_user_profile();
-- SELECT public.get_my_minimal_profile();

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- If you get "relation 'user_profiles' does not exist" error:
-- 1. Check if the user_profiles table exists: SELECT * FROM information_schema.tables WHERE table_name = 'user_profiles';
-- 2. Create the table if missing (see SUPABASE_SETUP.sql)

-- If you get "type 'user_profile_public_minimal' does not exist" error:
-- 1. The type creation above should fix this
-- 2. Make sure you run this script in the correct order

-- If you get permission errors:
-- 1. Make sure you're running as a superuser or have proper permissions
-- 2. Check RLS policies on user_profiles table

-- =====================================================
-- NOTES
-- =====================================================

-- This function assumes:
-- 1. The user_profiles table exists with columns: id, display_name, avatar_url
-- 2. The auth.uid() function is available (standard Supabase auth)
-- 3. The user is authenticated (auth.uid() returns a valid UUID)

-- Alternative approach if you want to avoid custom types:
-- CREATE OR REPLACE FUNCTION public.get_my_profile_json()
-- RETURNS JSON
-- LANGUAGE sql
-- SECURITY DEFINER
-- STABLE
-- AS $$
--   SELECT json_build_object(
--     'id', up.id,
--     'display_name', up.display_name,
--     'avatar_url', up.avatar_url
--   )
--   FROM public.user_profiles up
--   WHERE up.id = auth.uid();
-- $$;
