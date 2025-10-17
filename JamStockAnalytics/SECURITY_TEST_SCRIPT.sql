-- =============================================
-- SECURITY TEST SCRIPT FOR SUPABASE
-- =============================================
-- This script tests the security fixes to ensure proper access control

-- =============================================
-- 1. TEST RLS STATUS
-- =============================================

-- Check if RLS is enabled on all critical tables
SELECT 
    'RLS Status Check' as test_name,
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ ENABLED' 
        ELSE '❌ DISABLED - SECURITY RISK!' 
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'users', 'user_profiles', 'articles', 'company_tickers', 
        'analysis_sessions', 'user_saved_articles', 'chat_sessions', 
        'chat_messages', 'news_sources', 'market_insights',
        'user_blocks', 'article_comments', 'comment_interactions',
        'web_ui_preferences', 'web_performance_metrics', 'storage_files',
        'subscriptions', 'storage_buckets', 'storage_usage'
    )
ORDER BY tablename;

-- =============================================
-- 2. TEST POLICY COVERAGE
-- =============================================

-- Check if all tables have appropriate policies
SELECT 
    'Policy Coverage Check' as test_name,
    t.tablename,
    COUNT(p.policyname) as policy_count,
    CASE 
        WHEN COUNT(p.policyname) > 0 THEN '✅ HAS POLICIES' 
        ELSE '❌ NO POLICIES - SECURITY RISK!' 
    END as status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' 
    AND t.tablename IN (
        'users', 'user_profiles', 'articles', 'company_tickers', 
        'analysis_sessions', 'user_saved_articles', 'chat_sessions', 
        'chat_messages', 'news_sources', 'market_insights',
        'user_blocks', 'article_comments', 'comment_interactions',
        'web_ui_preferences', 'web_performance_metrics', 'storage_files',
        'subscriptions', 'storage_buckets', 'storage_usage'
    )
GROUP BY t.tablename
ORDER BY t.tablename;

-- =============================================
-- 3. TEST VIEW SECURITY
-- =============================================

-- Check if problematic views have been removed
SELECT 
    'View Security Check' as test_name,
    viewname,
    CASE 
        WHEN viewname IN ('user_analysis_summary', 'user_storage_summary') 
        THEN '❌ PROBLEMATIC VIEW STILL EXISTS!' 
        ELSE '✅ SAFE VIEW' 
    END as status
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- =============================================
-- 4. TEST FUNCTION SECURITY
-- =============================================

-- Check if SECURITY DEFINER functions are properly secured
SELECT 
    'Function Security Check' as test_name,
    routine_name,
    security_type,
    CASE 
        WHEN security_type = 'DEFINER' THEN '⚠️ SECURITY DEFINER - CHECK AUTHORIZATION' 
        ELSE '✅ SECURITY INVOKER' 
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_name IN (
        'get_my_analysis_summary', 'get_my_storage_summary',
        'is_user_blocked', 'get_blocked_users', 'unblock_user',
        'filter_comments_for_user'
    )
ORDER BY routine_name;

-- =============================================
-- 5. TEST POLICY DETAILS
-- =============================================

-- Show all policies for verification
SELECT 
    'Policy Details' as test_name,
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- 6. TEST ANONYMOUS ACCESS
-- =============================================

-- Test what anonymous users can access (should be limited to public data)
-- Note: These queries should be run as anonymous user to test properly

-- Test 1: Anonymous users should NOT be able to access user data
-- (This should fail if RLS is working properly)
/*
SELECT 'Testing anonymous access to user data...' as test;
SELECT COUNT(*) as user_count FROM public.users;
SELECT COUNT(*) as profile_count FROM public.user_profiles;
SELECT COUNT(*) as saved_articles_count FROM public.user_saved_articles;
*/

-- Test 2: Anonymous users SHOULD be able to access public data
-- (These should succeed)
/*
SELECT 'Testing anonymous access to public data...' as test;
SELECT COUNT(*) as article_count FROM public.articles;
SELECT COUNT(*) as company_count FROM public.company_tickers;
SELECT COUNT(*) as market_data_count FROM public.market_data;
*/

-- =============================================
-- 7. TEST AUTHENTICATED ACCESS
-- =============================================

-- Test what authenticated users can access (should be their own data only)
-- Note: These queries should be run as authenticated user to test properly

-- Test 1: Authenticated users should only see their own data
/*
SELECT 'Testing authenticated access to own data...' as test;
SELECT COUNT(*) as own_user_count FROM public.users WHERE id = auth.uid();
SELECT COUNT(*) as own_profile_count FROM public.user_profiles WHERE user_id = auth.uid();
SELECT COUNT(*) as own_saved_articles_count FROM public.user_saved_articles WHERE user_id = auth.uid();
*/

-- Test 2: Authenticated users should NOT see other users' data
/*
SELECT 'Testing authenticated access to other users data...' as test;
SELECT COUNT(*) as other_users_count FROM public.users WHERE id != auth.uid();
SELECT COUNT(*) as other_profiles_count FROM public.user_profiles WHERE user_id != auth.uid();
*/

-- =============================================
-- 8. SECURITY AUDIT SUMMARY
-- =============================================

-- Count total policies
SELECT 
    'Policy Count Summary' as test_name,
    COUNT(*) as total_policies,
    COUNT(DISTINCT tablename) as tables_with_policies
FROM pg_policies 
WHERE schemaname = 'public';

-- Count tables with RLS enabled
SELECT 
    'RLS Summary' as test_name,
    COUNT(*) as total_tables,
    COUNT(CASE WHEN rowsecurity THEN 1 END) as tables_with_rls,
    COUNT(CASE WHEN NOT rowsecurity THEN 1 END) as tables_without_rls
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'users', 'user_profiles', 'articles', 'company_tickers', 
        'analysis_sessions', 'user_saved_articles', 'chat_sessions', 
        'chat_messages', 'news_sources', 'market_insights',
        'user_blocks', 'article_comments', 'comment_interactions',
        'web_ui_preferences', 'web_performance_metrics', 'storage_files',
        'subscriptions', 'storage_buckets', 'storage_usage'
    );

-- =============================================
-- 9. SECURITY RECOMMENDATIONS
-- =============================================

/*
🔒 SECURITY TEST RESULTS INTERPRETATION:

✅ PASS CRITERIA:
   - All user tables have RLS enabled
   - All tables have appropriate policies
   - No problematic views exist
   - SECURITY DEFINER functions have proper authorization

❌ FAIL CRITERIA:
   - Any user table without RLS
   - Any table without policies
   - Problematic views still exist
   - Unsecured SECURITY DEFINER functions

🔐 ADDITIONAL SECURITY CHECKS:

1. Test with different user roles:
   - Anonymous user (should only access public data)
   - Authenticated user (should only access own data)
   - Service role (should access all data)

2. Test cross-user data access:
   - Try to access other users' data (should fail)
   - Verify data isolation between users

3. Test function security:
   - Verify SECURITY DEFINER functions check authorization
   - Test function access with different roles

4. Monitor for security violations:
   - Check logs for unauthorized access attempts
   - Verify RLS policies are working as expected
*/

SELECT 'Security test script completed!' as status;
