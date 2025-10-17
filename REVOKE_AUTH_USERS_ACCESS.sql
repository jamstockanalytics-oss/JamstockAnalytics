-- =====================================================
-- IMMEDIATE SECURITY FIX: REVOKE AUTH.USERS ACCESS
-- =====================================================
-- This script immediately revokes all PostgREST and anonymous access
-- to views that surface auth.users data.

-- =====================================================
-- 1. REVOKE ALL ACCESS TO PROBLEMATIC VIEWS
-- =====================================================

-- Revoke all access from anon role to views exposing auth.users
REVOKE ALL ON public.user_analysis_summary FROM anon;
REVOKE ALL ON public.user_storage_summary FROM anon;
REVOKE ALL ON public.user_full_profile FROM anon;
REVOKE ALL ON public.user_objects FROM anon;
REVOKE ALL ON public.user_profile_public FROM anon;
REVOKE ALL ON public.user_profile_public_minimal FROM anon;
REVOKE ALL ON public.my_analysis_summary FROM anon;
REVOKE ALL ON public.my_storage_summary FROM anon;

-- Revoke all access from authenticated role to views exposing auth.users
REVOKE ALL ON public.user_analysis_summary FROM authenticated;
REVOKE ALL ON public.user_storage_summary FROM authenticated;
REVOKE ALL ON public.user_full_profile FROM authenticated;
REVOKE ALL ON public.user_objects FROM authenticated;
REVOKE ALL ON public.user_profile_public FROM authenticated;
REVOKE ALL ON public.user_profile_public_minimal FROM authenticated;
REVOKE ALL ON public.my_analysis_summary FROM authenticated;
REVOKE ALL ON public.my_storage_summary FROM authenticated;

-- Revoke all access from public role to views exposing auth.users
REVOKE ALL ON public.user_analysis_summary FROM public;
REVOKE ALL ON public.user_storage_summary FROM public;
REVOKE ALL ON public.user_full_profile FROM public;
REVOKE ALL ON public.user_objects FROM public;
REVOKE ALL ON public.user_profile_public FROM public;
REVOKE ALL ON public.user_profile_public_minimal FROM public;
REVOKE ALL ON public.my_analysis_summary FROM public;
REVOKE ALL ON public.my_storage_summary FROM public;

-- =====================================================
-- 2. REVOKE ACCESS TO FUNCTIONS EXPOSING AUTH.USERS
-- =====================================================

-- Revoke access to functions that expose auth.users data
REVOKE ALL ON FUNCTION public.get_user_analysis_summary(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_user_storage_summary(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_user_full_profile(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_user_objects(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_user_profile_public(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_user_profile_public_minimal(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_my_analysis_summary() FROM anon;
REVOKE ALL ON FUNCTION public.get_my_storage_summary() FROM anon;

REVOKE ALL ON FUNCTION public.get_user_analysis_summary(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.get_user_storage_summary(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.get_user_full_profile(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.get_user_objects(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.get_user_profile_public(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.get_user_profile_public_minimal(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.get_my_analysis_summary() FROM authenticated;
REVOKE ALL ON FUNCTION public.get_my_storage_summary() FROM authenticated;

REVOKE ALL ON FUNCTION public.get_user_analysis_summary(uuid) FROM public;
REVOKE ALL ON FUNCTION public.get_user_storage_summary(uuid) FROM public;
REVOKE ALL ON FUNCTION public.get_user_full_profile(uuid) FROM public;
REVOKE ALL ON FUNCTION public.get_user_objects(uuid) FROM public;
REVOKE ALL ON FUNCTION public.get_user_profile_public(uuid) FROM public;
REVOKE ALL ON FUNCTION public.get_user_profile_public_minimal(uuid) FROM public;
REVOKE ALL ON FUNCTION public.get_my_analysis_summary() FROM public;
REVOKE ALL ON FUNCTION public.get_my_storage_summary() FROM public;

-- =====================================================
-- 3. REVOKE ACCESS TO AUTH.USERS TABLE DIRECTLY
-- =====================================================

-- Revoke all access to auth.users table from public roles
REVOKE ALL ON auth.users FROM anon;
REVOKE ALL ON auth.users FROM authenticated;
REVOKE ALL ON auth.users FROM public;

-- =====================================================
-- 4. REVOKE ACCESS TO USER TABLES WITHOUT RLS
-- =====================================================

-- Revoke access to user tables that might expose auth.users data
REVOKE ALL ON public.users FROM anon;
REVOKE ALL ON public.user_profiles FROM anon;
REVOKE ALL ON public.user_saved_articles FROM anon;
REVOKE ALL ON public.user_article_interactions FROM anon;
REVOKE ALL ON public.chat_sessions FROM anon;
REVOKE ALL ON public.chat_messages FROM anon;
REVOKE ALL ON public.analysis_sessions FROM anon;
REVOKE ALL ON public.analysis_notes FROM anon;
REVOKE ALL ON public.subscriptions FROM anon;
REVOKE ALL ON public.alerts FROM anon;
REVOKE ALL ON public.trades FROM anon;

-- =====================================================
-- 5. DROP PROBLEMATIC VIEWS COMPLETELY
-- =====================================================

-- Drop all views that expose auth.users data
DROP VIEW IF EXISTS public.user_analysis_summary CASCADE;
DROP VIEW IF EXISTS public.user_storage_summary CASCADE;
DROP VIEW IF EXISTS public.user_full_profile CASCADE;
DROP VIEW IF EXISTS public.user_objects CASCADE;
DROP VIEW IF EXISTS public.user_profile_public CASCADE;
DROP VIEW IF EXISTS public.user_profile_public_minimal CASCADE;
DROP VIEW IF EXISTS public.my_analysis_summary CASCADE;
DROP VIEW IF EXISTS public.my_storage_summary CASCADE;

-- =====================================================
-- 6. DROP PROBLEMATIC FUNCTIONS
-- =====================================================

-- Drop functions that expose auth.users data
DROP FUNCTION IF EXISTS public.get_user_analysis_summary(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_storage_summary(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_full_profile(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_objects(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_profile_public(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_profile_public_minimal(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_analysis_summary() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_storage_summary() CASCADE;

-- =====================================================
-- 7. ENABLE RLS ON ALL USER TABLES
-- =====================================================

-- Enable RLS on all user-related tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_article_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. CREATE SECURE POLICIES FOR USER TABLES
-- =====================================================

-- Users table - only own data
CREATE POLICY "users_own_data" ON public.users
    FOR ALL USING (auth.uid() = id);

-- User profiles - only own profile
CREATE POLICY "user_profiles_own_data" ON public.user_profiles
    FOR ALL USING (auth.uid() = user_id);

-- User saved articles - only own saved articles
CREATE POLICY "user_saved_articles_own_data" ON public.user_saved_articles
    FOR ALL USING (auth.uid() = user_id);

-- User article interactions - only own interactions
CREATE POLICY "user_article_interactions_own_data" ON public.user_article_interactions
    FOR ALL USING (auth.uid() = user_id);

-- Chat sessions - only own chat sessions
CREATE POLICY "chat_sessions_own_data" ON public.chat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Chat messages - only own chat messages
CREATE POLICY "chat_messages_own_data" ON public.chat_messages
    FOR ALL USING (auth.uid() = user_id);

-- Analysis sessions - only own analysis sessions
CREATE POLICY "analysis_sessions_own_data" ON public.analysis_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Analysis notes - only own analysis notes
CREATE POLICY "analysis_notes_own_data" ON public.analysis_notes
    FOR ALL USING (auth.uid() = user_id);

-- Subscriptions - only own subscriptions
CREATE POLICY "subscriptions_own_data" ON public.subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- Alerts - only own alerts
CREATE POLICY "alerts_own_data" ON public.alerts
    FOR ALL USING (auth.uid() = user_id);

-- Trades - only own trades
CREATE POLICY "trades_own_data" ON public.trades
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 9. CREATE SECURE FUNCTIONS FOR USER DATA ACCESS
-- =====================================================

-- Secure function to get user's own analysis summary
CREATE OR REPLACE FUNCTION public.get_my_analysis_summary()
RETURNS TABLE (
    total_sessions bigint,
    total_notes bigint,
    last_analysis_date timestamp with time zone,
    favorite_companies text[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Only return data for the authenticated user
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT n.id) as total_notes,
        MAX(s.created_at) as last_analysis_date,
        ARRAY_AGG(DISTINCT s.company_symbol) as favorite_companies
    FROM public.analysis_sessions s
    LEFT JOIN public.analysis_notes n ON s.id = n.session_id
    WHERE s.user_id = auth.uid()
    GROUP BY s.user_id;
END;
$$;

-- Secure function to get user's own storage summary
CREATE OR REPLACE FUNCTION public.get_my_storage_summary()
RETURNS TABLE (
    total_files bigint,
    total_size_bytes bigint,
    file_types text[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Only return data for the authenticated user
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    RETURN QUERY
    SELECT 
        COUNT(*) as total_files,
        COALESCE(SUM(f.size_bytes), 0) as total_size_bytes,
        ARRAY_AGG(DISTINCT f.file_type) as file_types
    FROM public.storage_files f
    WHERE f.user_id = auth.uid();
END;
$$;

-- Secure function to get user's own profile
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Only return data for the authenticated user
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.full_name,
        u.avatar_url,
        u.created_at,
        u.updated_at
    FROM public.users u
    WHERE u.id = auth.uid();
END;
$$;

-- =====================================================
-- 10. GRANT ACCESS TO SECURE FUNCTIONS
-- =====================================================

-- Grant access to secure functions for authenticated users only
GRANT EXECUTE ON FUNCTION public.get_my_analysis_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_storage_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- =====================================================
-- 11. VERIFICATION QUERIES
-- =====================================================

-- Check that all problematic views are dropped
SELECT 
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

-- Check that all problematic functions are dropped
SELECT 
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

-- Check RLS status on user tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
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
);

-- Check policies on user tables
SELECT 
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
);

-- =====================================================
-- SECURITY FIX COMPLETE
-- =====================================================
-- All PostgREST and anonymous access to views exposing auth.users
-- has been immediately revoked. The database is now secure.
