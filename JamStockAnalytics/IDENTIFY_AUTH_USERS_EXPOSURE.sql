-- =============================================
-- IDENTIFY AUTH.USERS EXPOSURE POINTS
-- =============================================
-- This script identifies all potential exposure points for auth.users data

-- =============================================
-- 1. CHECK FOR VIEWS EXPOSING AUTH.USERS
-- =============================================

-- Check all views for auth.users references
SELECT 
    'Views with Auth.Users References' as test_name,
    viewname,
    definition,
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
-- 2. CHECK FOR FUNCTIONS EXPOSING AUTH.USERS
-- =============================================

-- Check all functions for auth.users references
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
-- 3. CHECK FOR POLICIES EXPOSING AUTH.USERS
-- =============================================

-- Check all policies for auth.users references
SELECT 
    'Policies with Auth.Users References' as test_name,
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
-- 4. CHECK FOR TABLES WITHOUT RLS
-- =============================================

-- Check for user tables without RLS
SELECT 
    'User Tables without RLS' as test_name,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ENABLED'
        WHEN tablename IN ('users', 'user_profiles', 'user_saved_articles', 
                          'user_article_interactions', 'chat_sessions', 'chat_messages',
                          'analysis_sessions', 'analysis_notes', 'user_notifications',
                          'user_alert_subscriptions', 'subscriptions', 'alerts', 'trades')
        THEN '❌ CRITICAL: USER DATA TABLE WITHOUT RLS!'
        ELSE '⚠️ CHECK IF USER DATA TABLE'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
    AND rowsecurity = false
ORDER BY tablename;

-- =============================================
-- 5. CHECK FOR POSTGREST EXPOSED USER DATA
-- =============================================

-- Check for tables that might be exposed via PostgREST
SELECT 
    'PostgREST Exposed User Data' as test_name,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN tablename IN ('users', 'user_profiles', 'user_saved_articles', 
                          'user_article_interactions', 'chat_sessions', 'chat_messages',
                          'analysis_sessions', 'analysis_notes', 'user_notifications',
                          'user_alert_subscriptions', 'subscriptions', 'alerts', 'trades')
        AND rowsecurity = false
        THEN '❌ CRITICAL: USER DATA EXPOSED VIA POSTGREST!'
        WHEN tablename IN ('users', 'user_profiles', 'user_saved_articles', 
                          'user_article_interactions', 'chat_sessions', 'chat_messages',
                          'analysis_sessions', 'analysis_notes', 'user_notifications',
                          'user_alert_subscriptions', 'subscriptions', 'alerts', 'trades')
        AND rowsecurity = true
        THEN '✅ USER DATA PROTECTED'
        ELSE 'N/A'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN ('users', 'user_profiles', 'user_saved_articles', 
                     'user_article_interactions', 'chat_sessions', 'chat_messages',
                     'analysis_sessions', 'analysis_notes', 'user_notifications',
                     'user_alert_subscriptions', 'subscriptions', 'alerts', 'trades')
ORDER BY tablename;

-- =============================================
-- 6. CHECK FOR SECURITY DEFINER FUNCTIONS
-- =============================================

-- Check for SECURITY DEFINER functions that might expose auth.users
SELECT 
    'SECURITY DEFINER Functions' as test_name,
    routine_name,
    security_type,
    routine_definition,
    CASE 
        WHEN security_type = 'DEFINER' 
        AND routine_definition ILIKE '%auth.users%'
        THEN '❌ CRITICAL: SECURITY DEFINER EXPOSES AUTH.USERS!'
        WHEN security_type = 'DEFINER'
        AND routine_definition ILIKE '%auth%'
        THEN '⚠️ SECURITY DEFINER WITH AUTH REFERENCES'
        WHEN security_type = 'DEFINER'
        THEN '⚠️ SECURITY DEFINER FUNCTION'
        ELSE '✅ SAFE'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND security_type = 'DEFINER'
ORDER BY routine_name;

-- =============================================
-- 7. CHECK FOR ANONYMOUS ACCESS TO USER DATA
-- =============================================

-- Check for policies that might allow anonymous access to user data
SELECT 
    'Anonymous Access to User Data' as test_name,
    schemaname,
    tablename,
    policyname,
    roles,
    qual,
    CASE 
        WHEN roles IS NULL OR roles = '{}' OR 'anon' = ANY(roles)
        AND tablename IN ('users', 'user_profiles', 'user_saved_articles', 
                          'user_article_interactions', 'chat_sessions', 'chat_messages',
                          'analysis_sessions', 'analysis_notes', 'user_notifications',
                          'user_alert_subscriptions', 'subscriptions', 'alerts', 'trades')
        THEN '❌ CRITICAL: ANONYMOUS ACCESS TO USER DATA!'
        WHEN roles IS NULL OR roles = '{}' OR 'anon' = ANY(roles)
        THEN '⚠️ ANONYMOUS ACCESS ALLOWED'
        ELSE '✅ AUTHENTICATED ONLY'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
    AND (roles IS NULL OR roles = '{}' OR 'anon' = ANY(roles))
ORDER BY tablename, policyname;

-- =============================================
-- 8. COMPREHENSIVE SECURITY ASSESSMENT
-- =============================================

-- Overall security assessment
SELECT 
    'Security Assessment Summary' as test_name,
    'Views with Auth.Users References' as category,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '❌ CRITICAL SECURITY RISK!'
        ELSE '✅ NONE FOUND'
    END as status
FROM pg_views 
WHERE schemaname = 'public'
    AND definition ILIKE '%auth.users%'

UNION ALL

SELECT 
    'Security Assessment Summary' as test_name,
    'Functions with Auth.Users References' as category,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '❌ CRITICAL SECURITY RISK!'
        ELSE '✅ NONE FOUND'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_definition ILIKE '%auth.users%'

UNION ALL

SELECT 
    'Security Assessment Summary' as test_name,
    'User Tables without RLS' as category,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '❌ CRITICAL SECURITY RISK!'
        ELSE '✅ NONE FOUND'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
    AND rowsecurity = false
    AND tablename IN ('users', 'user_profiles', 'user_saved_articles', 
                     'user_article_interactions', 'chat_sessions', 'chat_messages',
                     'analysis_sessions', 'analysis_notes', 'user_notifications',
                     'user_alert_subscriptions', 'subscriptions', 'alerts', 'trades')

UNION ALL

SELECT 
    'Security Assessment Summary' as test_name,
    'Anonymous Access to User Data' as category,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '❌ CRITICAL SECURITY RISK!'
        ELSE '✅ NONE FOUND'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
    AND (roles IS NULL OR roles = '{}' OR 'anon' = ANY(roles))
    AND tablename IN ('users', 'user_profiles', 'user_saved_articles', 
                     'user_article_interactions', 'chat_sessions', 'chat_messages',
                     'analysis_sessions', 'analysis_notes', 'user_notifications',
                     'user_alert_subscriptions', 'subscriptions', 'alerts', 'trades');

-- =============================================
-- 9. RECOMMENDATIONS
-- =============================================

SELECT 
    'Security Recommendations' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_views 
            WHERE schemaname = 'public' 
            AND definition ILIKE '%auth.users%'
        ) THEN 'CRITICAL: Remove views exposing auth.users immediately'
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_definition ILIKE '%auth.users%'
        ) THEN 'CRITICAL: Fix functions exposing auth.users immediately'
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND rowsecurity = false
            AND tablename IN ('users', 'user_profiles', 'user_saved_articles', 
                             'user_article_interactions', 'chat_sessions', 'chat_messages',
                             'analysis_sessions', 'analysis_notes', 'user_notifications',
                             'user_alert_subscriptions', 'subscriptions', 'alerts', 'trades')
        ) THEN 'CRITICAL: Enable RLS on user data tables immediately'
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public'
            AND (roles IS NULL OR roles = '{}' OR 'anon' = ANY(roles))
            AND tablename IN ('users', 'user_profiles', 'user_saved_articles', 
                             'user_article_interactions', 'chat_sessions', 'chat_messages',
                             'analysis_sessions', 'analysis_notes', 'user_notifications',
                             'user_alert_subscriptions', 'subscriptions', 'alerts', 'trades')
        ) THEN 'CRITICAL: Remove anonymous access to user data immediately'
        ELSE 'All auth.users exposure points appear to be secured'
    END as recommendation;

SELECT 'Auth.users exposure audit completed!' as status;
