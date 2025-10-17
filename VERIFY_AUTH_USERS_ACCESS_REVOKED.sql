-- =====================================================
-- VERIFY AUTH.USERS ACCESS REVOCATION
-- =====================================================
-- This script verifies that all PostgREST and anonymous access
-- to views exposing auth.users data has been properly revoked.

-- =====================================================
-- 1. CHECK FOR REMAINING PROBLEMATIC VIEWS
-- =====================================================

-- Check if any problematic views still exist
SELECT 
    'PROBLEMATIC VIEWS STILL EXIST' as status,
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN (
    'user_analysis_summary',
    'user_storage_summary', 
    'user_full_profile',
    'user_objects',
    'user_profile_public',
    'user_profile_public_minimal',
    'my_analysis_summary',
    'my_storage_summary'
);

-- =====================================================
-- 2. CHECK FOR REMAINING PROBLEMATIC FUNCTIONS
-- =====================================================

-- Check if any problematic functions still exist
SELECT 
    'PROBLEMATIC FUNCTIONS STILL EXIST' as status,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'get_user_analysis_summary',
    'get_user_storage_summary',
    'get_user_full_profile',
    'get_user_objects',
    'get_user_profile_public',
    'get_user_profile_public_minimal',
    'get_my_analysis_summary',
    'get_my_storage_summary'
);

-- =====================================================
-- 3. CHECK ACCESS PERMISSIONS ON AUTH.USERS
-- =====================================================

-- Check if anon role has any access to auth.users
SELECT 
    'ANON ACCESS TO AUTH.USERS' as status,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'auth' 
AND table_name = 'users' 
AND grantee = 'anon';

-- Check if authenticated role has any access to auth.users
SELECT 
    'AUTHENTICATED ACCESS TO AUTH.USERS' as status,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'auth' 
AND table_name = 'users' 
AND grantee = 'authenticated';

-- Check if public role has any access to auth.users
SELECT 
    'PUBLIC ACCESS TO AUTH.USERS' as status,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'auth' 
AND table_name = 'users' 
AND grantee = 'public';

-- =====================================================
-- 4. CHECK RLS STATUS ON USER TABLES
-- =====================================================

-- Check RLS status on all user tables
SELECT 
    'RLS STATUS CHECK' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ENABLED'
        ELSE '❌ RLS DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'users',
    'user_profiles',
    'user_saved_articles',
    'user_article_interactions',
    'chat_sessions',
    'chat_messages',
    'analysis_sessions',
    'analysis_notes',
    'subscriptions',
    'alerts',
    'trades'
)
ORDER BY tablename;

-- =====================================================
-- 5. CHECK POLICIES ON USER TABLES
-- =====================================================

-- Check policies on all user tables
SELECT 
    'POLICY CHECK' as status,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'users',
    'user_profiles',
    'user_saved_articles',
    'user_article_interactions',
    'chat_sessions',
    'chat_messages',
    'analysis_sessions',
    'analysis_notes',
    'subscriptions',
    'alerts',
    'trades'
)
ORDER BY tablename, policyname;

-- =====================================================
-- 6. CHECK SECURE FUNCTIONS
-- =====================================================

-- Check if secure functions exist
SELECT 
    'SECURE FUNCTIONS CHECK' as status,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'get_my_analysis_summary',
    'get_my_storage_summary',
    'get_my_profile'
)
ORDER BY p.proname;

-- =====================================================
-- 7. CHECK FUNCTION PERMISSIONS
-- =====================================================

-- Check permissions on secure functions
SELECT 
    'FUNCTION PERMISSIONS CHECK' as status,
    routine_schema,
    routine_name,
    grantee,
    privilege_type
FROM information_schema.routine_privileges 
WHERE routine_schema = 'public'
AND routine_name IN (
    'get_my_analysis_summary',
    'get_my_storage_summary',
    'get_my_profile'
)
ORDER BY routine_name, grantee;

-- =====================================================
-- 8. CHECK FOR ANY REMAINING AUTH.USERS EXPOSURE
-- =====================================================

-- Check for any views that might still expose auth.users
SELECT 
    'AUTH.USERS EXPOSURE CHECK' as status,
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
AND definition ILIKE '%auth.users%';

-- Check for any functions that might still expose auth.users
SELECT 
    'AUTH.USERS EXPOSURE CHECK' as status,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(p.oid) ILIKE '%auth.users%';

-- =====================================================
-- 9. SUMMARY REPORT
-- =====================================================

-- Generate summary report
SELECT 
    'SECURITY STATUS SUMMARY' as status,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ NO PROBLEMATIC VIEWS FOUND'
        ELSE '❌ ' || COUNT(*) || ' PROBLEMATIC VIEWS STILL EXIST'
    END as view_status
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN (
    'user_analysis_summary',
    'user_storage_summary', 
    'user_full_profile',
    'user_objects',
    'user_profile_public',
    'user_profile_public_minimal',
    'my_analysis_summary',
    'my_storage_summary'
)

UNION ALL

SELECT 
    'SECURITY STATUS SUMMARY' as status,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ NO PROBLEMATIC FUNCTIONS FOUND'
        ELSE '❌ ' || COUNT(*) || ' PROBLEMATIC FUNCTIONS STILL EXIST'
    END as function_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'get_user_analysis_summary',
    'get_user_storage_summary',
    'get_user_full_profile',
    'get_user_objects',
    'get_user_profile_public',
    'get_user_profile_public_minimal',
    'get_my_analysis_summary',
    'get_my_storage_summary'
)

UNION ALL

SELECT 
    'SECURITY STATUS SUMMARY' as status,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ NO AUTH.USERS EXPOSURE FOUND'
        ELSE '❌ ' || COUNT(*) || ' AUTH.USERS EXPOSURE POINTS FOUND'
    END as exposure_status
FROM pg_views 
WHERE schemaname = 'public' 
AND definition ILIKE '%auth.users%';

-- =====================================================
-- VERIFICATION COMPLETE
-- =====================================================
-- This script verifies that all PostgREST and anonymous access
-- to views exposing auth.users data has been properly revoked.
