-- =====================================================
-- SQL QUERIES TO GET upsert_user_profile FUNCTION DEFINITION
-- Run these in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- QUERY 1: Get Complete Function Definition (Primary)
-- =====================================================

SELECT pg_get_functiondef(p.oid) AS definition 
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public' AND p.proname = 'upsert_user_profile';

-- =====================================================
-- QUERY 2: Get Function Details (Alternative)
-- =====================================================

SELECT 
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments,
    p.prosrc as source_code,
    p.prolang as language,
    p.prosecdef as security_definer,
    p.provolatile as volatility
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public' AND p.proname = 'upsert_user_profile';

-- =====================================================
-- QUERY 3: Check if Function Exists
-- =====================================================

SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'upsert_user_profile'
  AND routine_type = 'FUNCTION';

-- =====================================================
-- QUERY 4: List All Functions in Public Schema
-- =====================================================

SELECT 
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- =====================================================
-- QUERY 5: Check Related Tables Structure
-- =====================================================

-- Check user_profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- =====================================================
-- QUERY 6: Check Foreign Key Relationships
-- =====================================================

SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND (tc.table_name = 'user_profiles' OR tc.table_name = 'users');

-- =====================================================
-- QUERY 7: Check RLS Policies on User Tables
-- =====================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'user_profiles');

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================

-- The upsert_user_profile function should:
-- 1. Accept parameters for user profile fields
-- 2. Use auth.uid() to get current user
-- 3. Perform INSERT ... ON CONFLICT (user_id) DO UPDATE
-- 4. Return the user_profiles record
-- 5. Have SECURITY DEFINER attribute
-- 6. Be granted to 'authenticated' role

-- If the function doesn't exist, you can create it using
-- the expected definition from expected-upsert-user-profile-function.sql
