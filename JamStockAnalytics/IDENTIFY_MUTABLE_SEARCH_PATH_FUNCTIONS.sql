-- =============================================
-- IDENTIFY MUTABLE SEARCH_PATH FUNCTIONS
-- =============================================
-- This script identifies all functions that might have mutable search_path issues

-- =============================================
-- 1. CHECK ALL FUNCTIONS FOR SECURITY ISSUES
-- =============================================

-- Check all functions in public schema
SELECT 
    'All Functions Security Check' as test_name,
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
    'Functions Search Path Check' as test_name,
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
ORDER BY p.proname;

-- =============================================
-- 3. CHECK FOR FUNCTIONS THAT MIGHT EXPOSE SENSITIVE DATA
-- =============================================

-- Check function definitions for sensitive data references
SELECT 
    'Functions with Sensitive Data References' as test_name,
    routine_name,
    routine_definition,
    CASE 
        WHEN routine_definition ILIKE '%auth.users%' 
        THEN '❌ EXPOSES AUTH.USERS!'
        WHEN routine_definition ILIKE '%auth%'
        THEN '⚠️ REFERENCES AUTH - CHECK SECURITY'
        WHEN routine_definition ILIKE '%users%'
        THEN '⚠️ REFERENCES USERS - CHECK SECURITY'
        ELSE '✅ SAFE'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_definition IS NOT NULL
    AND (
        routine_definition ILIKE '%auth%'
        OR routine_definition ILIKE '%users%'
    )
ORDER BY routine_name;

-- =============================================
-- 4. CHECK FOR FUNCTIONS WITH POTENTIAL SECURITY RISKS
-- =============================================

-- Check for functions that might have security risks
SELECT 
    'Functions with Security Risks' as test_name,
    routine_name,
    security_type,
    routine_definition,
    CASE 
        WHEN security_type = 'DEFINER' 
        AND routine_definition ILIKE '%auth%'
        THEN '❌ CRITICAL: SECURITY DEFINER WITH AUTH REFERENCES'
        WHEN security_type = 'DEFINER'
        THEN '⚠️ SECURITY DEFINER - CHECK SEARCH_PATH'
        WHEN routine_definition ILIKE '%auth.users%'
        THEN '❌ EXPOSES AUTH.USERS!'
        WHEN routine_definition ILIKE '%auth%'
        THEN '⚠️ REFERENCES AUTH - CHECK SECURITY'
        ELSE '✅ SAFE'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_definition IS NOT NULL
ORDER BY routine_name;

-- =============================================
-- 5. CHECK FOR FUNCTIONS THAT MIGHT BE HIJACKED
-- =============================================

-- Check for functions that might be vulnerable to hijacking
SELECT 
    'Functions Vulnerable to Hijacking' as test_name,
    routine_name,
    security_type,
    CASE 
        WHEN security_type = 'DEFINER' 
        THEN '⚠️ VULNERABLE TO HIJACKING - NEEDS SEARCH_PATH FIX'
        ELSE '✅ NOT VULNERABLE'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND security_type = 'DEFINER'
ORDER BY routine_name;

-- =============================================
-- 6. COMPREHENSIVE SECURITY ASSESSMENT
-- =============================================

-- Overall security assessment
SELECT 
    'Security Assessment Summary' as test_name,
    'Total Functions' as category,
    COUNT(*) as count,
    'INFO' as status
FROM information_schema.routines 
WHERE routine_schema = 'public'

UNION ALL

SELECT 
    'Security Assessment Summary' as test_name,
    'SECURITY DEFINER Functions' as category,
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
    'Functions with Auth References' as category,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '⚠️ NEEDS REVIEW'
        ELSE '✅ NONE FOUND'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_definition ILIKE '%auth%'

UNION ALL

SELECT 
    'Security Assessment Summary' as test_name,
    'Functions Exposing Auth.Users' as category,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '❌ CRITICAL SECURITY RISK!'
        ELSE '✅ NONE FOUND'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_definition ILIKE '%auth.users%';

-- =============================================
-- 7. CHECK FOR FUNCTIONS WITH SPECIFIC NAMES
-- =============================================

-- Check for functions with specific names that might be problematic
SELECT 
    'Specific Function Names Check' as test_name,
    routine_name,
    security_type,
    CASE 
        WHEN routine_name ILIKE '%user%' 
        AND security_type = 'DEFINER'
        THEN '⚠️ USER-RELATED SECURITY DEFINER FUNCTION'
        WHEN routine_name ILIKE '%profile%' 
        AND security_type = 'DEFINER'
        THEN '⚠️ PROFILE-RELATED SECURITY DEFINER FUNCTION'
        WHEN routine_name ILIKE '%auth%' 
        AND security_type = 'DEFINER'
        THEN '⚠️ AUTH-RELATED SECURITY DEFINER FUNCTION'
        WHEN security_type = 'DEFINER'
        THEN '⚠️ SECURITY DEFINER FUNCTION'
        ELSE '✅ SAFE'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND security_type = 'DEFINER'
ORDER BY routine_name;

-- =============================================
-- 8. RECOMMENDATIONS
-- =============================================

SELECT 
    'Security Recommendations' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND security_type = 'DEFINER'
            AND routine_definition ILIKE '%auth.users%'
        ) THEN 'CRITICAL: Fix functions exposing auth.users immediately'
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND security_type = 'DEFINER'
        ) THEN 'WARNING: Fix SECURITY DEFINER functions with search_path'
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_definition ILIKE '%auth%'
        ) THEN 'WARNING: Review functions with auth references'
        ELSE 'All functions appear to be secure'
    END as recommendation;

SELECT 'Mutable search_path functions audit completed!' as status;
