-- =====================================================
-- SIMPLE USER PROFILE FUNCTION FOR SUPABASE
-- JamStockAnalytics - Simple approach that definitely works
-- =====================================================

-- Option 1: Simple JSON return (no custom types needed)
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT json_build_object(
    'id', up.id,
    'display_name', COALESCE(up.display_name, 'User'),
    'avatar_url', COALESCE(up.avatar_url, ''),
    'email', au.email,
    'created_at', up.created_at
  )
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.id
  WHERE up.id = auth.uid();
$$;

-- Option 2: Safe version that handles missing profiles
CREATE OR REPLACE FUNCTION public.get_my_profile_safe()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT json_build_object(
    'id', COALESCE(up.id, auth.uid()),
    'display_name', COALESCE(up.display_name, 'Anonymous User'),
    'avatar_url', COALESCE(up.avatar_url, ''),
    'email', COALESCE(au.email, ''),
    'created_at', COALESCE(up.created_at, NOW()),
    'profile_exists', (up.id IS NOT NULL)
  )
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.id
  WHERE up.id = auth.uid();
$$;

-- Option 3: Alternative using TABLE return type (no custom types)
CREATE OR REPLACE FUNCTION public.get_my_profile_table()
RETURNS TABLE(
    id UUID,
    display_name TEXT,
    avatar_url TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    up.id,
    COALESCE(up.display_name, 'User') as display_name,
    COALESCE(up.avatar_url, '') as avatar_url,
    au.email,
    up.created_at
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.id
  WHERE up.id = auth.uid();
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_profile_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_profile_table() TO authenticated;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Use any of these in your application:

-- 1. JSON version (recommended for most use cases)
-- SELECT public.get_my_profile();

-- 2. Safe JSON version (handles missing profiles gracefully)
-- SELECT public.get_my_profile_safe();

-- 3. Table version (if you prefer table format)
-- SELECT * FROM public.get_my_profile_table();

-- =====================================================
-- TESTING
-- =====================================================

-- Test if the functions work:
-- SELECT public.get_my_profile_safe();

-- If you get errors, check:
-- 1. Does user_profiles table exist?
-- 2. Are you authenticated?
-- 3. Do you have the right permissions?
