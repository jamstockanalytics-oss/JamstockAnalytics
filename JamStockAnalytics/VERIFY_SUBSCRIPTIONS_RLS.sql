-- =============================================
-- VERIFY SUBSCRIPTIONS TABLE RLS STATUS
-- =============================================
-- This script verifies the current RLS status of the subscriptions table

-- =============================================
-- 1. CHECK SUBSCRIPTIONS TABLE EXISTS
-- =============================================

SELECT 
    'Subscriptions Table Exists Check' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'subscriptions'
        ) THEN '✅ TABLE EXISTS'
        ELSE '❌ TABLE DOES NOT EXIST'
    END as status;

-- =============================================
-- 2. CHECK RLS STATUS
-- =============================================

SELECT 
    'Subscriptions RLS Status' as test_name,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ENABLED' 
        ELSE '❌ RLS DISABLED - SECURITY RISK!' 
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'subscriptions';

-- =============================================
-- 3. CHECK POLICY COVERAGE
-- =============================================

SELECT 
    'Subscriptions Policy Coverage' as test_name,
    t.tablename,
    COUNT(p.policyname) as policy_count,
    CASE 
        WHEN COUNT(p.policyname) > 0 THEN '✅ HAS POLICIES' 
        ELSE '❌ NO POLICIES - SECURITY RISK!' 
    END as status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' 
    AND t.tablename = 'subscriptions'
GROUP BY t.tablename;

-- =============================================
-- 4. SHOW ALL POLICIES
-- =============================================

SELECT 
    'Subscriptions Policy Details' as test_name,
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

-- =============================================
-- 5. CHECK TABLE STRUCTURE
-- =============================================

SELECT 
    'Subscriptions Table Structure' as test_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- =============================================
-- 6. SECURITY ASSESSMENT
-- =============================================

SELECT 
    'Subscriptions Security Assessment' as test_name,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'subscriptions'
        ) THEN '❌ TABLE NOT FOUND'
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'subscriptions' 
            AND rowsecurity = true
        ) THEN '❌ RLS NOT ENABLED'
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'subscriptions'
        ) THEN '❌ NO POLICIES'
        ELSE '✅ SECURE'
    END as security_status;

-- =============================================
-- 7. RECOMMENDATIONS
-- =============================================

SELECT 
    'Recommendations' as test_name,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'subscriptions'
        ) THEN 'Create subscriptions table first'
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'subscriptions' 
            AND rowsecurity = true
        ) THEN 'Enable RLS on subscriptions table'
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'subscriptions'
        ) THEN 'Create RLS policies for subscriptions table'
        ELSE 'Subscriptions table is properly secured'
    END as recommendation;

SELECT 'Subscriptions RLS verification completed!' as status;
