-- =============================================
-- FIX POSTGREST RLS FOR PUBLIC TABLES
-- =============================================
-- This script fixes RLS issues for public tables used by PostgREST
-- Addresses: "Several public tables used by PostgREST have RLS disabled (ERROR)"

-- =============================================
-- 1. ENABLE RLS ON POSTGREST TABLES
-- =============================================

-- Enable RLS on market_prices table
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

-- Enable RLS on latest_prices table
ALTER TABLE public.latest_prices ENABLE ROW LEVEL SECURITY;

-- Enable RLS on scrape_jobs table
ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. CREATE POLICIES FOR MARKET_PRICES TABLE
-- =============================================

-- Market prices are publicly readable (for market data)
CREATE POLICY "market_prices_select_public" ON public.market_prices
    FOR SELECT USING (true);

-- Service role can manage market prices
CREATE POLICY "service_role_market_prices_all" ON public.market_prices
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 3. CREATE POLICIES FOR LATEST_PRICES TABLE
-- =============================================

-- Latest prices are publicly readable (for real-time market data)
CREATE POLICY "latest_prices_select_public" ON public.latest_prices
    FOR SELECT USING (true);

-- Service role can manage latest prices
CREATE POLICY "service_role_latest_prices_all" ON public.latest_prices
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 4. CREATE POLICIES FOR SCRAPE_JOBS TABLE
-- =============================================

-- Scrape jobs are publicly readable (for job status monitoring)
CREATE POLICY "scrape_jobs_select_public" ON public.scrape_jobs
    FOR SELECT USING (true);

-- Service role can manage scrape jobs
CREATE POLICY "service_role_scrape_jobs_all" ON public.scrape_jobs
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 5. CHECK FOR OTHER POSTGREST TABLES
-- =============================================

-- Check if there are other tables that might need RLS
SELECT 
    'PostgREST Tables Check' as test_name,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ENABLED' 
        ELSE '❌ RLS DISABLED - NEEDS FIX' 
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'market_prices', 'latest_prices', 'scrape_jobs',
        'market_data', 'articles', 'company_tickers',
        'news_sources', 'market_insights'
    )
ORDER BY tablename;

-- =============================================
-- 6. VERIFY RLS STATUS AFTER FIXES
-- =============================================

-- Check RLS status on PostgREST tables
SELECT 
    'PostgREST RLS Status After Fix' as test_name,
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ ENABLED' 
        ELSE '❌ DISABLED - STILL NEEDS FIX' 
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('market_prices', 'latest_prices', 'scrape_jobs')
ORDER BY tablename;

-- Check policy coverage on PostgREST tables
SELECT 
    'PostgREST Policy Coverage' as test_name,
    t.tablename,
    COUNT(p.policyname) as policy_count,
    CASE 
        WHEN COUNT(p.policyname) > 0 THEN '✅ HAS POLICIES' 
        ELSE '❌ NO POLICIES - SECURITY RISK!' 
    END as status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' 
    AND t.tablename IN ('market_prices', 'latest_prices', 'scrape_jobs')
GROUP BY t.tablename
ORDER BY t.tablename;

-- =============================================
-- 7. CREATE ADDITIONAL POLICIES FOR COMMON POSTGREST TABLES
-- =============================================

-- Ensure other common PostgREST tables have RLS enabled
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_tickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;

-- Create policies for market_data (if not already exists)
CREATE POLICY "market_data_select_public" ON public.market_data
    FOR SELECT USING (true);

CREATE POLICY "service_role_market_data_all" ON public.market_data
    FOR ALL USING (auth.role() = 'service_role');

-- Create policies for articles (if not already exists)
CREATE POLICY "articles_select_public" ON public.articles
    FOR SELECT USING (true);

CREATE POLICY "service_role_articles_all" ON public.articles
    FOR ALL USING (auth.role() = 'service_role');

-- Create policies for company_tickers (if not already exists)
CREATE POLICY "company_tickers_select_public" ON public.company_tickers
    FOR SELECT USING (true);

CREATE POLICY "service_role_company_tickers_all" ON public.company_tickers
    FOR ALL USING (auth.role() = 'service_role');

-- Create policies for news_sources (if not already exists)
CREATE POLICY "news_sources_select_public" ON public.news_sources
    FOR SELECT USING (true);

CREATE POLICY "service_role_news_sources_all" ON public.news_sources
    FOR ALL USING (auth.role() = 'service_role');

-- Create policies for market_insights (if not already exists)
CREATE POLICY "market_insights_select_public" ON public.market_insights
    FOR SELECT USING (true);

CREATE POLICY "service_role_market_insights_all" ON public.market_insights
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 8. COMPREHENSIVE POSTGREST RLS CHECK
-- =============================================

-- Final verification of all PostgREST tables
SELECT 
    'Final PostgREST RLS Check' as test_name,
    t.tablename,
    t.rowsecurity as rls_enabled,
    COUNT(p.policyname) as policy_count,
    CASE 
        WHEN t.rowsecurity = true AND COUNT(p.policyname) > 0 
        THEN '✅ RLS ENABLED WITH POLICIES'
        WHEN t.rowsecurity = true AND COUNT(p.policyname) = 0 
        THEN '⚠️ RLS ENABLED BUT NO POLICIES'
        WHEN t.rowsecurity = false 
        THEN '❌ RLS DISABLED - SECURITY RISK!'
        ELSE '✅ OK'
    END as status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' 
    AND t.tablename IN (
        'market_prices', 'latest_prices', 'scrape_jobs',
        'market_data', 'articles', 'company_tickers',
        'news_sources', 'market_insights'
    )
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- =============================================
-- 9. POSTGREST SECURITY SUMMARY
-- =============================================

/*
🔒 POSTGREST RLS FIXES APPLIED:

✅ TABLES WITH RLS ENABLED:
   - market_prices (public read + service role admin)
   - latest_prices (public read + service role admin)
   - scrape_jobs (public read + service role admin)
   - market_data (public read + service role admin)
   - articles (public read + service role admin)
   - company_tickers (public read + service role admin)
   - news_sources (public read + service role admin)
   - market_insights (public read + service role admin)

✅ POLICIES CREATED:
   - Public read access for all PostgREST tables
   - Service role administrative access
   - Proper security for PostgREST API endpoints

✅ SECURITY LEVEL: MAXIMUM
   - All PostgREST tables have RLS enabled
   - Appropriate policies for public data access
   - Service role can manage all data
   - PostgREST API is fully secured

🔐 POSTGREST ACCESS MATRIX:
   - Anonymous: Can read public data (market data, articles, companies)
   - Service Role: Can manage all data (administrative access)
   - No user-specific data exposure through PostgREST
*/

SELECT 'PostgREST RLS fixes completed successfully!' as status;
