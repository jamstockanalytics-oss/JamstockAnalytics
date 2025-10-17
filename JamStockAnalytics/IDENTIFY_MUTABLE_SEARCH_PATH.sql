-- =============================================
-- IDENTIFY FUNCTIONS WITH MUTABLE SEARCH_PATH
-- =============================================
-- This script identifies all functions with mutable search_path that need fixing

-- =============================================
-- 1. FIND ALL FUNCTIONS WITH MUTABLE SEARCH_PATH
-- =============================================

-- Check all functions in public schema
SELECT 
    'All Functions in Public Schema' as test_name,
    routine_name,
    routine_type,
    security_type,
    data_type,
    CASE 
        WHEN security_type = 'DEFINER' THEN '⚠️ SECURITY DEFINER - CHECK SEARCH_PATH'
        ELSE '✅ SECURITY INVOKER'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- =============================================
-- 2. CHECK SPECIFIC FUNCTIONS FOR SEARCH_PATH
-- =============================================

-- Check if functions have search_path set
SELECT 
    'Functions with Search Path Check' as test_name,
    p.proname as function_name,
    p.prosecdef as security_definer,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments,
    CASE 
        WHEN p.prosecdef THEN '⚠️ SECURITY DEFINER - NEEDS SEARCH_PATH FIX'
        ELSE '✅ SECURITY INVOKER'
    END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN (
        'get_my_analysis_summary', 'get_my_storage_summary',
        'is_user_blocked', 'get_blocked_users', 'unblock_user',
        'filter_comments_for_user', 'get_my_subscriptions',
        'get_my_profile', 'get_my_profile_minimal',
        'upsert_user_profile', 'get_my_minimal_profile'
    )
ORDER BY p.proname;

-- =============================================
-- 3. CHECK FOR FUNCTIONS THAT MIGHT EXPOSE AUTH.USERS
-- =============================================

-- Check function definitions for auth.users references
SELECT 
    'Functions with Auth.Users References' as test_name,
    routine_name,
    routine_definition,
    CASE 
        WHEN routine_definition ILIKE '%auth.users%' 
        THEN '❌ EXPOSES AUTH.USERS!'
        WHEN routine_definition ILIKE '%auth%'
        THEN '⚠️ REFERENCES AUTH - CHECK SECURITY'
        ELSE '✅ SAFE'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_definition IS NOT NULL
    AND routine_definition ILIKE '%auth%'
ORDER BY routine_name;

-- =============================================
-- 4. CHECK FOR VIEWS THAT MIGHT EXPOSE AUTH.USERS
-- =============================================

-- Check all views for auth.users references
SELECT 
    'Views with Auth.Users References' as test_name,
    viewname,
    CASE 
        WHEN definition ILIKE '%auth.users%' 
        THEN '❌ EXPOSES AUTH.USERS!'
        WHEN definition ILIKE '%auth%'
        THEN '⚠️ REFERENCES AUTH - CHECK SECURITY'
        ELSE '✅ SAFE'
    END as status
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- =============================================
-- 5. CHECK FOR TABLES THAT MIGHT EXPOSE AUTH.USERS
-- =============================================

-- Check if any tables have policies that might expose auth.users
SELECT 
    'Table Policies with Auth References' as test_name,
    schemaname,
    tablename,
    policyname,
    qual,
    CASE 
        WHEN qual ILIKE '%auth.users%' 
        THEN '❌ EXPOSES AUTH.USERS!'
        WHEN qual ILIKE '%auth%'
        THEN '⚠️ REFERENCES AUTH - CHECK SECURITY'
        ELSE '✅ SAFE'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
    AND qual ILIKE '%auth%'
ORDER BY tablename, policyname;

-- =============================================
-- 6. COMPREHENSIVE SECURITY AUDIT
-- =============================================

-- Overall security assessment
SELECT 
    'Security Assessment Summary' as test_name,
    'Functions with Security Definers' as category,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '⚠️ NEEDS REVIEW'
        ELSE '✅ NONE FOUND'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND security_type = 'DEFINER'

UNION ALL

SELECT 
    'Security Assessment Summary' as test_name,
    'Views with Auth References' as category,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '⚠️ NEEDS REVIEW'
        ELSE '✅ NONE FOUND'
    END as status
FROM pg_views 
WHERE schemaname = 'public'
    AND definition ILIKE '%auth%'

UNION ALL

SELECT 
    'Security Assessment Summary' as test_name,
    'Policies with Auth References' as category,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '⚠️ NEEDS REVIEW'
        ELSE '✅ NONE FOUND'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
    AND qual ILIKE '%auth%';

-- =============================================
-- 7. RECOMMENDATIONS
-- =============================================

SELECT 
    'Security Recommendations' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND security_type = 'DEFINER'
        ) THEN 'Fix SECURITY DEFINER functions with search_path'
        WHEN EXISTS (
            SELECT 1 FROM pg_views 
            WHERE schemaname = 'public' 
            AND definition ILIKE '%auth%'
        ) THEN 'Remove or secure views with auth references'
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND qual ILIKE '%auth%'
        ) THEN 'Review policies with auth references'
        ELSE 'All security issues appear to be resolved'
    END as recommendation;

SELECT 'Security audit completed!' as status;
