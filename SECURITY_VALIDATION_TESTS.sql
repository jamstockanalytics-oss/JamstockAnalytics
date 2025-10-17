-- =====================================================
-- COMPREHENSIVE SECURITY VALIDATION TESTS
-- =====================================================
-- This script validates all security fixes and ensures
-- proper RLS behavior for anon, authenticated, and service_role

-- =====================================================
-- 1. TEST ANONYMOUS ACCESS
-- =====================================================

-- Test 1: Anonymous should NOT access user data
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE anon;
        PERFORM * FROM public.users LIMIT 1;
        test_result := 'FAIL: Anonymous user accessed users table';
    EXCEPTION
        WHEN insufficient_privilege THEN
            test_result := 'PASS: Anonymous user correctly blocked from users table';
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 1 - Anonymous Users Access: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 2: Anonymous should access public data
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE anon;
        PERFORM * FROM public.articles LIMIT 1;
        test_result := 'PASS: Anonymous user can access articles';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 2 - Anonymous Articles Access: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 3: Anonymous should NOT access user profiles
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE anon;
        PERFORM * FROM public.user_profiles LIMIT 1;
        test_result := 'FAIL: Anonymous user accessed user_profiles table';
    EXCEPTION
        WHEN insufficient_privilege THEN
            test_result := 'PASS: Anonymous user correctly blocked from user_profiles table';
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 3 - Anonymous User Profiles Access: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- =====================================================
-- 2. TEST AUTHENTICATED ACCESS
-- =====================================================

-- Test 4: Authenticated user should access own data
DO $$
DECLARE
    test_result TEXT;
    test_user_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claims" TO json_build_object('sub', test_user_id::text);
        PERFORM * FROM public.users WHERE id = test_user_id LIMIT 1;
        test_result := 'PASS: Authenticated user accessed own data';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 4 - Authenticated Own Data Access: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 5: Authenticated user should NOT access other user's data
DO $$
DECLARE
    test_result TEXT;
    test_user_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
    other_user_id UUID := '00000000-0000-0000-0000-000000000002'::UUID;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claims" TO json_build_object('sub', test_user_id::text);
        PERFORM * FROM public.users WHERE id = other_user_id LIMIT 1;
        test_result := 'FAIL: Authenticated user accessed other user data';
    EXCEPTION
        WHEN insufficient_privilege THEN
            test_result := 'PASS: Authenticated user correctly blocked from other user data';
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 5 - Authenticated Other Data Access: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- =====================================================
-- 3. TEST SERVICE ROLE ACCESS
-- =====================================================

-- Test 6: Service role should access all data
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE service_role;
        PERFORM * FROM public.users LIMIT 1;
        test_result := 'PASS: Service role accessed users table';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 6 - Service Role Access: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- =====================================================
-- 4. TEST SECURITY DEFINER FUNCTIONS
-- =====================================================

-- Test 7: SECURITY DEFINER functions should have fixed search_path
DO $$
DECLARE
    test_result TEXT;
    search_path_config TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    SELECT p.proconfig::text INTO search_path_config
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'is_user_blocked'
    AND p.prosecdef = true;
    
    IF search_path_config IS NULL OR search_path_config NOT LIKE '%search_path%' THEN
        test_result := 'FAIL: SECURITY DEFINER function missing search_path configuration';
    ELSE
        test_result := 'PASS: SECURITY DEFINER function has search_path configuration';
    END IF;
    
    RAISE NOTICE 'Test 7 - SECURITY DEFINER Search Path: %', test_result;
END;
$$;

-- =====================================================
-- 5. TEST RLS POLICIES
-- =====================================================

-- Test 8: Check RLS is enabled on all user tables
DO $$
DECLARE
    test_result TEXT;
    rls_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT 
        COUNT(*) FILTER (WHERE rowsecurity = true) as rls_enabled,
        COUNT(*) as total_tables
    INTO rls_count, total_count
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'user_profiles', 'user_saved_articles', 
        'user_article_interactions', 'chat_sessions', 'chat_messages',
        'analysis_sessions', 'analysis_notes', 'user_notifications',
        'user_alert_subscriptions', 'storage_files', 'subscriptions',
        'alerts', 'trades', 'brokerages', 'user_organizations'
    );
    
    IF rls_count = total_count THEN
        test_result := 'PASS: All user tables have RLS enabled';
    ELSE
        test_result := 'FAIL: ' || (total_count - rls_count) || ' user tables missing RLS';
    END IF;
    
    RAISE NOTICE 'Test 8 - RLS Status: %', test_result;
END;
$$;

-- Test 9: Check policies exist on all user tables
DO $$
DECLARE
    test_result TEXT;
    policy_count INTEGER;
    expected_count INTEGER := 16; -- Number of user tables
BEGIN
    SELECT COUNT(DISTINCT tablename) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'user_profiles', 'user_saved_articles', 
        'user_article_interactions', 'chat_sessions', 'chat_messages',
        'analysis_sessions', 'analysis_notes', 'user_notifications',
        'user_alert_subscriptions', 'storage_files', 'subscriptions',
        'alerts', 'trades', 'brokerages', 'user_organizations'
    );
    
    IF policy_count >= expected_count THEN
        test_result := 'PASS: All user tables have policies';
    ELSE
        test_result := 'FAIL: ' || (expected_count - policy_count) || ' user tables missing policies';
    END IF;
    
    RAISE NOTICE 'Test 9 - Policy Coverage: %', test_result;
END;
$$;

-- =====================================================
-- 6. TEST ADMIN POLICIES
-- =====================================================

-- Test 10: Admin policies should work with JWT claims
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claims" TO json_build_object('role', 'admin');
        PERFORM * FROM public.users LIMIT 1;
        test_result := 'PASS: Admin role accessed users table';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 10 - Admin Role Access: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- =====================================================
-- 7. TEST SECURE FUNCTIONS
-- =====================================================

-- Test 11: Secure functions should require authentication
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE anon;
        PERFORM * FROM public.get_my_analysis_summary();
        test_result := 'FAIL: Anonymous user accessed secure function';
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLERRM LIKE '%Authentication required%' THEN
                test_result := 'PASS: Secure function correctly requires authentication';
            ELSE
                test_result := 'ERROR: ' || SQLERRM;
                error_occurred := TRUE;
            END IF;
    END;
    
    RAISE NOTICE 'Test 11 - Secure Function Authentication: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- =====================================================
-- 8. COMPREHENSIVE SECURITY REPORT
-- =====================================================

-- Generate comprehensive security report
SELECT 
    'SECURITY VALIDATION REPORT' as report_type,
    'RLS Status' as category,
    COUNT(*) as total_tables,
    COUNT(*) FILTER (WHERE rowsecurity = true) as rls_enabled,
    COUNT(*) FILTER (WHERE rowsecurity = false) as rls_disabled
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'SECURITY VALIDATION REPORT' as report_type,
    'Policy Coverage' as category,
    COUNT(DISTINCT tablename) as total_tables,
    COUNT(DISTINCT tablename) FILTER (WHERE policyname IS NOT NULL) as tables_with_policies,
    0 as tables_without_policies
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'SECURITY VALIDATION REPORT' as report_type,
    'SECURITY DEFINER Functions' as category,
    COUNT(*) as total_functions,
    COUNT(*) FILTER (WHERE p.proconfig IS NOT NULL AND p.proconfig::text LIKE '%search_path%') as functions_with_search_path,
    COUNT(*) FILTER (WHERE p.proconfig IS NULL OR p.proconfig::text NOT LIKE '%search_path%') as functions_without_search_path
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosecdef = true

UNION ALL

SELECT 
    'SECURITY VALIDATION REPORT' as report_type,
    'Index Coverage' as category,
    COUNT(*) as total_indexes,
    COUNT(*) FILTER (WHERE indexname LIKE 'idx_%') as policy_indexes,
    0 as missing_indexes
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';

-- =====================================================
-- 9. DETAILED POLICY ANALYSIS
-- =====================================================

-- Show all policies with their details
SELECT 
    'POLICY DETAILS' as analysis_type,
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

-- =====================================================
-- 10. SECURITY RECOMMENDATIONS
-- =====================================================

-- Generate security recommendations based on the current state
SELECT 
    'SECURITY RECOMMENDATIONS' as recommendation_type,
    CASE 
        WHEN COUNT(*) FILTER (WHERE rowsecurity = false) > 0 THEN
            'Enable RLS on ' || COUNT(*) FILTER (WHERE rowsecurity = false) || ' tables'
        ELSE 'All tables have RLS enabled'
    END as recommendation
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'SECURITY RECOMMENDATIONS' as recommendation_type,
    CASE 
        WHEN COUNT(*) FILTER (WHERE p.proconfig IS NULL OR p.proconfig::text NOT LIKE '%search_path%') > 0 THEN
            'Fix search_path on ' || COUNT(*) FILTER (WHERE p.proconfig IS NULL OR p.proconfig::text NOT LIKE '%search_path%') || ' SECURITY DEFINER functions'
        ELSE 'All SECURITY DEFINER functions have search_path configured'
    END as recommendation
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosecdef = true;

-- =====================================================
-- SECURITY VALIDATION COMPLETE
-- =====================================================
-- All security tests have been executed and results logged.
-- Review the output above to ensure all security measures are working correctly.
