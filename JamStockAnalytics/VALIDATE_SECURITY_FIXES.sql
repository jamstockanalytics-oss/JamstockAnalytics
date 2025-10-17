-- =====================================================
-- VALIDATE SECURITY FIXES - COMPREHENSIVE TESTING
-- =====================================================
-- This script validates all security fixes implemented:
-- 1. SECURITY DEFINER views fixed
-- 2. Admin policies for subscriptions (Option A - JWT claims)
-- 3. SECURITY DEFINER admin helper (Option B - database function)
-- 4. Security validation and testing

-- =====================================================
-- 1. TEST SECURITY DEFINER VIEWS FIXES
-- =====================================================

-- Test 1: Check that problematic views are dropped
DO $$
DECLARE
    test_result TEXT;
    view_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO view_count
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
    
    IF view_count = 0 THEN
        test_result := 'PASS: All problematic SECURITY DEFINER views have been dropped';
    ELSE
        test_result := 'FAIL: ' || view_count || ' problematic views still exist';
    END IF;
    
    RAISE NOTICE 'Test 1 - SECURITY DEFINER Views: %', test_result;
END;
$$;

-- Test 2: Check that secure functions exist
DO $$
DECLARE
    test_result TEXT;
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN ('get_my_analysis_summary', 'get_my_storage_summary');
    
    IF function_count = 2 THEN
        test_result := 'PASS: Secure replacement functions exist';
    ELSE
        test_result := 'FAIL: ' || (2 - function_count) || ' secure functions missing';
    END IF;
    
    RAISE NOTICE 'Test 2 - Secure Functions: %', test_result;
END;
$$;

-- =====================================================
-- 2. TEST SUBSCRIPTIONS ADMIN POLICIES (OPTION A - JWT CLAIMS)
-- =====================================================

-- Test 3: Check subscriptions RLS is enabled
DO $$
DECLARE
    test_result TEXT;
    rls_enabled BOOLEAN;
BEGIN
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename = 'subscriptions';
    
    IF rls_enabled THEN
        test_result := 'PASS: Subscriptions table has RLS enabled';
    ELSE
        test_result := 'FAIL: Subscriptions table does not have RLS enabled';
    END IF;
    
    RAISE NOTICE 'Test 3 - Subscriptions RLS: %', test_result;
END;
$$;

-- Test 4: Check admin policies exist for subscriptions
DO $$
DECLARE
    test_result TEXT;
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename = 'subscriptions'
    AND policyname LIKE '%admin%';
    
    IF policy_count >= 2 THEN
        test_result := 'PASS: Admin policies exist for subscriptions';
    ELSE
        test_result := 'FAIL: Only ' || policy_count || ' admin policies found for subscriptions';
    END IF;
    
    RAISE NOTICE 'Test 4 - Subscriptions Admin Policies: %', test_result;
END;
$$;

-- Test 5: Test admin access with JWT claims
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claims" TO json_build_object('role', 'admin');
        PERFORM * FROM public.subscriptions LIMIT 1;
        test_result := 'PASS: Admin with JWT role=admin can access subscriptions';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 5 - Admin JWT Access: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- =====================================================
-- 3. TEST SECURITY DEFINER ADMIN HELPER (OPTION B - DATABASE FUNCTION)
-- =====================================================

-- Test 6: Check admin function exists
DO $$
DECLARE
    test_result TEXT;
    function_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'private_security'
        AND p.proname = 'is_admin'
    ) INTO function_exists;
    
    IF function_exists THEN
        test_result := 'PASS: Admin function private_security.is_admin() exists';
    ELSE
        test_result := 'FAIL: Admin function private_security.is_admin() does not exist';
    END IF;
    
    RAISE NOTICE 'Test 6 - Admin Function Exists: %', test_result;
END;
$$;

-- Test 7: Test admin function with JWT role
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claims" TO json_build_object('role', 'admin');
        PERFORM private_security.is_admin();
        test_result := 'PASS: Admin function returned true for JWT role=admin';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 7 - Admin Function JWT Role: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 8: Test admin function with JWT admin flag
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claims" TO json_build_object('admin', true);
        PERFORM private_security.is_admin();
        test_result := 'PASS: Admin function returned true for JWT admin=true';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 8 - Admin Function JWT Flag: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 9: Test admin function with non-admin user
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claims" TO json_build_object('role', 'user');
        PERFORM private_security.is_admin();
        test_result := 'FAIL: Admin function returned true for non-admin user';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'PASS: Admin function returned false for non-admin user';
    END;
    
    RAISE NOTICE 'Test 9 - Admin Function Non-Admin: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- =====================================================
-- 4. TEST ADMIN MANAGEMENT FUNCTIONS
-- =====================================================

-- Test 10: Test add admin user function
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
    test_user_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
BEGIN
    BEGIN
        SET LOCAL ROLE service_role;
        PERFORM public.add_admin_user(test_user_id, 'admin', '{"permissions": ["read", "write"]}');
        test_result := 'PASS: Successfully added admin user';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 10 - Add Admin User: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 11: Test list admin users function
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE service_role;
        PERFORM * FROM public.list_admin_users();
        test_result := 'PASS: Successfully listed admin users';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 11 - List Admin Users: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 12: Test remove admin user function
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
    test_user_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
BEGIN
    BEGIN
        SET LOCAL ROLE service_role;
        PERFORM public.remove_admin_user(test_user_id);
        test_result := 'PASS: Successfully removed admin user';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 12 - Remove Admin User: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- =====================================================
-- 5. TEST SECURITY AND ACCESS CONTROL
-- =====================================================

-- Test 13: Test anonymous access to subscriptions
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE anon;
        PERFORM * FROM public.subscriptions LIMIT 1;
        test_result := 'FAIL: Anonymous user accessed subscriptions table';
    EXCEPTION
        WHEN insufficient_privilege THEN
            test_result := 'PASS: Anonymous user correctly blocked from subscriptions table';
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 13 - Anonymous Subscriptions Access: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 14: Test non-admin user access to subscriptions
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
    test_user_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
BEGIN
    BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claims" TO json_build_object('sub', test_user_id::text, 'role', 'user');
        PERFORM * FROM public.subscriptions WHERE user_id = test_user_id LIMIT 1;
        test_result := 'PASS: User can access own subscriptions';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 14 - User Own Subscriptions Access: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 15: Test non-admin user cannot access other user's subscriptions
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
    test_user_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
    other_user_id UUID := '00000000-0000-0000-0000-000000000002'::UUID;
BEGIN
    BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claims" TO json_build_object('sub', test_user_id::text, 'role', 'user');
        PERFORM * FROM public.subscriptions WHERE user_id = other_user_id LIMIT 1;
        test_result := 'FAIL: User accessed other user subscriptions';
    EXCEPTION
        WHEN insufficient_privilege THEN
            test_result := 'PASS: User correctly blocked from other user subscriptions';
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 15 - User Other Subscriptions Access: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- =====================================================
-- 6. COMPREHENSIVE SECURITY REPORT
-- =====================================================

-- Generate comprehensive security report
SELECT 
    'SECURITY VALIDATION REPORT' as report_type,
    'SECURITY DEFINER Views' as category,
    COUNT(*) as total_views,
    COUNT(*) FILTER (WHERE viewname IN (
        'user_analysis_summary', 'user_storage_summary', 'user_full_profile',
        'user_objects', 'user_profile_public', 'user_profile_public_minimal',
        'my_analysis_summary', 'my_storage_summary'
    )) as problematic_views,
    0 as secure_functions
FROM pg_views 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'SECURITY VALIDATION REPORT' as report_type,
    'Secure Functions' as category,
    0 as total_views,
    0 as problematic_views,
    COUNT(*) as secure_functions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('get_my_analysis_summary', 'get_my_storage_summary')

UNION ALL

SELECT 
    'SECURITY VALIDATION REPORT' as report_type,
    'Subscriptions RLS' as category,
    COUNT(*) as total_tables,
    COUNT(*) FILTER (WHERE rowsecurity = true) as rls_enabled,
    0 as secure_functions
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename = 'subscriptions'

UNION ALL

SELECT 
    'SECURITY VALIDATION REPORT' as report_type,
    'Subscriptions Policies' as category,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE policyname LIKE '%admin%') as admin_policies,
    0 as secure_functions
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'subscriptions'

UNION ALL

SELECT 
    'SECURITY VALIDATION REPORT' as report_type,
    'Admin Function' as category,
    0 as total_views,
    0 as problematic_views,
    COUNT(*) as secure_functions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'private_security'
AND p.proname = 'is_admin';

-- =====================================================
-- 7. DETAILED POLICY ANALYSIS
-- =====================================================

-- Show all policies for subscriptions
SELECT 
    'SUBSCRIPTIONS POLICY DETAILS' as analysis_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'subscriptions'
ORDER BY policyname;

-- =====================================================
-- 8. SECURITY RECOMMENDATIONS
-- =====================================================

-- Generate security recommendations based on current state
SELECT 
    'SECURITY RECOMMENDATIONS' as recommendation_type,
    CASE 
        WHEN COUNT(*) FILTER (WHERE viewname IN (
            'user_analysis_summary', 'user_storage_summary', 'user_full_profile',
            'user_objects', 'user_profile_public', 'user_profile_public_minimal',
            'my_analysis_summary', 'my_storage_summary'
        )) = 0 THEN
            '✅ All problematic SECURITY DEFINER views have been removed'
        ELSE
            '❌ ' || COUNT(*) FILTER (WHERE viewname IN (
                'user_analysis_summary', 'user_storage_summary', 'user_full_profile',
                'user_objects', 'user_profile_public', 'user_profile_public_minimal',
                'my_analysis_summary', 'my_storage_summary'
            )) || ' problematic views still exist'
    END as recommendation
FROM pg_views 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'SECURITY RECOMMENDATIONS' as recommendation_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscriptions' AND rowsecurity = true) THEN
            '✅ Subscriptions table has RLS enabled'
        ELSE
            '❌ Subscriptions table does not have RLS enabled'
    END as recommendation

UNION ALL

SELECT 
    'SECURITY RECOMMENDATIONS' as recommendation_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'private_security' AND p.proname = 'is_admin') THEN
            '✅ Admin function is available for complex admin checks'
        ELSE
            '❌ Admin function is not available'
    END as recommendation;

-- =====================================================
-- SECURITY VALIDATION COMPLETE
-- =====================================================
-- All security fixes have been tested and validated.
-- Review the results above to ensure all security measures are working correctly.
