-- =============================================
-- DIAGNOSTIC SCRIPT - CHECK DATABASE STATUS
-- =============================================
-- This script helps diagnose why data population isn't working

-- =============================================
-- STEP 1: CHECK IF TABLES EXIST
-- =============================================

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('company_tickers', 'news_sources', 'articles', 'market_prices', 'market_insights', 'system_performance_metrics', 'database_health_checks') 
        THEN 'REQUIRED TABLE'
        ELSE 'OTHER TABLE'
    END as table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- =============================================
-- STEP 2: CHECK CURRENT DATA COUNTS
-- =============================================

-- Check if tables have any data
SELECT 
    'company_tickers' as table_name, 
    COUNT(*) as current_count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS DATA' ELSE 'EMPTY' END as status
FROM public.company_tickers
UNION ALL
SELECT 
    'news_sources' as table_name, 
    COUNT(*) as current_count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS DATA' ELSE 'EMPTY' END as status
FROM public.news_sources
UNION ALL
SELECT 
    'articles' as table_name, 
    COUNT(*) as current_count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS DATA' ELSE 'EMPTY' END as status
FROM public.articles
UNION ALL
SELECT 
    'market_prices' as table_name, 
    COUNT(*) as current_count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS DATA' ELSE 'EMPTY' END as status
FROM public.market_prices
UNION ALL
SELECT 
    'market_insights' as table_name, 
    COUNT(*) as current_count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS DATA' ELSE 'EMPTY' END as status
FROM public.market_insights;

-- =============================================
-- STEP 3: CHECK TABLE STRUCTURE
-- =============================================

-- Check company_tickers table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'company_tickers'
ORDER BY ordinal_position;

-- =============================================
-- STEP 4: TEST SIMPLE INSERT
-- =============================================

-- Try to insert one simple record to test
INSERT INTO public.company_tickers (ticker, company_name, exchange, sector, market_cap, is_active) 
VALUES ('TEST', 'Test Company', 'JSE', 'Test Sector', 1000000, true)
ON CONFLICT (ticker) DO NOTHING;

-- Check if the test record was inserted
SELECT COUNT(*) as test_records FROM public.company_tickers WHERE ticker = 'TEST';

-- =============================================
-- STEP 5: CHECK FOR ERRORS
-- =============================================

-- Check if there are any constraint violations
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.company_tickers'::regclass;

-- =============================================
-- STEP 6: CHECK RLS POLICIES
-- =============================================

-- Check if RLS is enabled and what policies exist
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_tickers') as policy_count
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'company_tickers';

-- =============================================
-- STEP 7: CHECK PERMISSIONS
-- =============================================

-- Check current role and permissions
SELECT current_user, current_role, session_user;

-- Check if we can select from the table
SELECT COUNT(*) as can_select FROM public.company_tickers;

-- =============================================
-- STEP 8: CLEANUP TEST DATA
-- =============================================

-- Remove test record if it was created
DELETE FROM public.company_tickers WHERE ticker = 'TEST';
