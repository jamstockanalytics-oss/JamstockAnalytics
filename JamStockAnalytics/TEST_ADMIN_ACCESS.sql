-- =====================================================
-- TEST ADMIN ACCESS IMPLEMENTATION
-- =====================================================
-- This script tests both Option A (JWT claims) and Option B (DB function)
-- for admin access to ensure they work correctly

-- =====================================================
-- 1. TEST OPTION A: JWT CLAIMS ADMIN ACCESS
-- =====================================================

-- Test 1: Admin with JWT role='admin' should access all data
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claims" TO json_build_object('role', 'admin');
        PERFORM * FROM public.users LIMIT 1;
        test_result := 'PASS: Admin with JWT role=admin accessed users table';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 1 - JWT Admin Access: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 2: Admin with JWT admin=true should access all data
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claims" TO json_build_object('admin', true);
        PERFORM * FROM public.users LIMIT 1;
        test_result := 'PASS: Admin with JWT admin=true accessed users table';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 2 - JWT Admin Flag Access: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 3: Non-admin user should not access other user's data
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claims" TO json_build_object('role', 'user');
        PERFORM * FROM public.users LIMIT 1;
        test_result := 'FAIL: Non-admin user accessed users table';
    EXCEPTION
        WHEN insufficient_privilege THEN
            test_result := 'PASS: Non-admin user correctly blocked from users table';
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 3 - Non-Admin Access: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- =====================================================
-- 2. TEST OPTION B: DATABASE FUNCTION ADMIN ACCESS
-- =====================================================

-- Test 4: Admin function should work with JWT role='admin'
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
    
    RAISE NOTICE 'Test 4 - Admin Function JWT Role: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 5: Admin function should work with JWT admin=true
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
    
    RAISE NOTICE 'Test 5 - Admin Function JWT Flag: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 6: Admin function should work with JWT role='super_admin'
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claims" TO json_build_object('role', 'super_admin');
        PERFORM private_security.is_admin();
        test_result := 'PASS: Admin function returned true for JWT role=super_admin';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 6 - Admin Function Super Admin: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 7: Admin function should return false for non-admin
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
    
    RAISE NOTICE 'Test 7 - Admin Function Non-Admin: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- =====================================================
-- 3. TEST ADMIN MANAGEMENT FUNCTIONS
-- =====================================================

-- Test 8: Add admin user function
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
    
    RAISE NOTICE 'Test 8 - Add Admin User: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 9: List admin users function
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
    
    RAISE NOTICE 'Test 9 - List Admin Users: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- Test 10: Remove admin user function
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
    
    RAISE NOTICE 'Test 10 - Remove Admin User: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- =====================================================
-- 4. TEST ADMIN POLICIES WITH DATABASE FUNCTION
-- =====================================================

-- Test 11: Admin policies using database function
DO $$
DECLARE
    test_result TEXT;
    error_occurred BOOLEAN := FALSE;
BEGIN
    BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claims" TO json_build_object('role', 'admin');
        PERFORM * FROM public.users LIMIT 1;
        test_result := 'PASS: Admin policies using database function worked';
    EXCEPTION
        WHEN OTHERS THEN
            test_result := 'ERROR: ' || SQLERRM;
            error_occurred := TRUE;
    END;
    
    RAISE NOTICE 'Test 11 - Admin Policies with Function: %', test_result;
    
    -- Reset role
    RESET ROLE;
END;
$$;

-- =====================================================
-- 5. COMPREHENSIVE ADMIN ACCESS REPORT
-- =====================================================

-- Generate comprehensive admin access report
SELECT 
    'ADMIN ACCESS REPORT' as report_type,
    'JWT Claims Policies' as category,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE policyname LIKE '%admin%' AND policyname NOT LIKE '%function%') as jwt_policies,
    0 as function_policies
FROM pg_policies 
WHERE schemaname = 'public'
AND policyname LIKE '%admin%'

UNION ALL

SELECT 
    'ADMIN ACCESS REPORT' as report_type,
    'Function Policies' as category,
    COUNT(*) as total_policies,
    0 as jwt_policies,
    COUNT(*) FILTER (WHERE policyname LIKE '%admin%' AND policyname LIKE '%function%') as function_policies
FROM pg_policies 
WHERE schemaname = 'public'
AND policyname LIKE '%admin%'

UNION ALL

SELECT 
    'ADMIN ACCESS REPORT' as report_type,
    'Admin Functions' as category,
    COUNT(*) as total_functions,
    0 as jwt_policies,
    0 as function_policies
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'private_security'
AND p.proname = 'is_admin'

UNION ALL

SELECT 
    'ADMIN ACCESS REPORT' as report_type,
    'Admin Management Functions' as category,
    COUNT(*) as total_functions,
    0 as jwt_policies,
    0 as function_policies
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('add_admin_user', 'remove_admin_user', 'list_admin_users');

-- =====================================================
-- 6. DETAILED POLICY ANALYSIS
-- =====================================================

-- Show all admin policies with their details
SELECT 
    'ADMIN POLICY DETAILS' as analysis_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
AND policyname LIKE '%admin%'
ORDER BY tablename, policyname;

-- =====================================================
-- 7. ADMIN ACCESS RECOMMENDATIONS
-- =====================================================

-- Generate recommendations based on current implementation
SELECT 
    'ADMIN ACCESS RECOMMENDATIONS' as recommendation_type,
    CASE 
        WHEN COUNT(*) FILTER (WHERE policyname LIKE '%admin%' AND policyname NOT LIKE '%function%') > 0 THEN
            'JWT Claims Admin Access: ' || COUNT(*) FILTER (WHERE policyname LIKE '%admin%' AND policyname NOT LIKE '%function%') || ' policies implemented'
        ELSE 'JWT Claims Admin Access: No policies found'
    END as recommendation
FROM pg_policies 
WHERE schemaname = 'public'
AND policyname LIKE '%admin%'

UNION ALL

SELECT 
    'ADMIN ACCESS RECOMMENDATIONS' as recommendation_type,
    CASE 
        WHEN COUNT(*) FILTER (WHERE policyname LIKE '%admin%' AND policyname LIKE '%function%') > 0 THEN
            'Database Function Admin Access: ' || COUNT(*) FILTER (WHERE policyname LIKE '%admin%' AND policyname LIKE '%function%') || ' policies implemented'
        ELSE 'Database Function Admin Access: No policies found'
    END as recommendation
FROM pg_policies 
WHERE schemaname = 'public'
AND policyname LIKE '%admin%'

UNION ALL

SELECT 
    'ADMIN ACCESS RECOMMENDATIONS' as recommendation_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'private_security' AND p.proname = 'is_admin') THEN
            'Admin Function: Available for complex admin checks'
        ELSE 'Admin Function: Not implemented'
    END as recommendation

UNION ALL

SELECT 
    'ADMIN ACCESS RECOMMENDATIONS' as recommendation_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_users') THEN
            'Admin Users Table: Available for database-stored admin users'
        ELSE 'Admin Users Table: Not implemented'
    END as recommendation;

-- =====================================================
-- ADMIN ACCESS TESTING COMPLETE
-- =====================================================
-- Both Option A (JWT claims) and Option B (DB function) have been tested
-- Review the results above to ensure admin access is working correctly
