-- =============================================
-- IDENTIFY POSTGREST EXPOSED TABLES
-- =============================================
-- This script identifies tables that are exposed to PostgREST and need RLS

-- =============================================
-- 1. CHECK ALL TABLES FOR RLS STATUS
-- =============================================

-- Check all tables in public schema
SELECT 
    'All Tables RLS Status' as test_name,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ENABLED' 
        ELSE '❌ RLS DISABLED - SECURITY RISK!' 
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =============================================
-- 2. IDENTIFY POSTGREST EXPOSED TABLES
-- =============================================

-- Check for tables that are commonly exposed via PostgREST
SELECT 
    'PostgREST Exposed Tables Check' as test_name,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ENABLED'
        WHEN tablename IN (
            'articles', 'company_tickers', 'market_data', 'market_insights',
            'news_sources', 'market_prices', 'latest_prices', 'scrape_jobs',
            'market_indicators', 'database_health_checks', 'system_performance_metrics',
            'users', 'user_profiles', 'user_saved_articles', 'user_article_interactions',
            'chat_sessions', 'chat_messages', 'analysis_sessions', 'analysis_notes',
            'user_notifications', 'user_alert_subscriptions', 'user_blocks',
            'article_comments', 'comment_interactions', 'web_ui_preferences',
            'web_performance_metrics', 'storage_files', 'subscriptions',
            'brokerages', 'user_organizations', 'organizations', 'alerts', 'trades',
            'storage_buckets', 'storage_usage'
        ) THEN '⚠️ POSTGREST EXPOSED - NEEDS RLS'
        ELSE '⚠️ CHECK IF EXPOSED TO POSTGREST'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =============================================
-- 3. CHECK FOR TABLES WITHOUT POLICIES
-- =============================================

-- Check which tables have RLS enabled but no policies
SELECT 
    'Tables with RLS but No Policies' as test_name,
    t.tablename,
    t.rowsecurity as rls_enabled,
    COUNT(p.policyname) as policy_count,
    CASE 
        WHEN t.rowsecurity = true AND COUNT(p.policyname) = 0 
        THEN '❌ RLS ENABLED BUT NO POLICIES - SECURITY RISK!'
        WHEN t.rowsecurity = true AND COUNT(p.policyname) > 0 
        THEN '✅ RLS ENABLED WITH POLICIES'
        WHEN t.rowsecurity = false 
        THEN '❌ RLS DISABLED - SECURITY RISK!'
        ELSE '✅ OK'
    END as status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- =============================================
-- 4. CHECK FOR CRITICAL SECURITY GAPS
-- =============================================

-- Check for tables that might expose sensitive data
SELECT 
    'Critical Security Gaps' as test_name,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN tablename IN ('users', 'user_profiles', 'user_saved_articles', 
                          'user_article_interactions', 'chat_sessions', 'chat_messages',
                          'analysis_sessions', 'analysis_notes', 'user_notifications',
                          'user_alert_subscriptions', 'subscriptions', 'alerts', 'trades')
        AND rowsecurity = false
        THEN '❌ CRITICAL: USER DATA TABLE WITHOUT RLS!'
        WHEN tablename IN ('articles', 'company_tickers', 'market_data', 
                          'market_insights', 'news_sources')
        AND rowsecurity = false
        THEN '⚠️ WARNING: PUBLIC DATA TABLE WITHOUT RLS'
        WHEN rowsecurity = false
        THEN '⚠️ WARNING: TABLE WITHOUT RLS'
        ELSE '✅ SECURE'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY 
    CASE 
        WHEN tablename IN ('users', 'user_profiles', 'user_saved_articles', 
                          'user_article_interactions', 'chat_sessions', 'chat_messages',
                          'analysis_sessions', 'analysis_notes', 'user_notifications',
                          'user_alert_subscriptions', 'subscriptions', 'alerts', 'trades')
        AND rowsecurity = false
        THEN 1
        WHEN tablename IN ('articles', 'company_tickers', 'market_data', 
                          'market_insights', 'news_sources')
        AND rowsecurity = false
        THEN 2
        WHEN rowsecurity = false
        THEN 3
        ELSE 4
    END, tablename;

-- =============================================
-- 5. CHECK FOR POSTGREST SPECIFIC TABLES
-- =============================================

-- Check for tables that are specifically used by PostgREST
SELECT 
    'PostgREST Specific Tables' as test_name,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN tablename IN ('market_prices', 'latest_prices', 'scrape_jobs',
                          'market_indicators', 'database_health_checks', 
                          'system_performance_metrics')
        AND rowsecurity = false
        THEN '❌ CRITICAL: POSTGREST TABLE WITHOUT RLS!'
        WHEN tablename IN ('market_prices', 'latest_prices', 'scrape_jobs',
                          'market_indicators', 'database_health_checks', 
                          'system_performance_metrics')
        AND rowsecurity = true
        THEN '✅ POSTGREST TABLE WITH RLS'
        ELSE 'N/A'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN ('market_prices', 'latest_prices', 'scrape_jobs',
                      'market_indicators', 'database_health_checks', 
                      'system_performance_metrics')
ORDER BY tablename;

-- =============================================
-- 6. COMPREHENSIVE SECURITY ASSESSMENT
-- =============================================

-- Overall security assessment
SELECT 
    'Security Assessment Summary' as test_name,
    'Total Tables' as category,
    COUNT(*) as count,
    'INFO' as status
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Security Assessment Summary' as test_name,
    'Tables without RLS' as category,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '❌ CRITICAL SECURITY RISK!'
        ELSE '✅ ALL TABLES HAVE RLS'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
    AND rowsecurity = false

UNION ALL

SELECT 
    'Security Assessment Summary' as test_name,
    'Tables with RLS but No Policies' as category,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '❌ SECURITY RISK!'
        ELSE '✅ ALL TABLES HAVE POLICIES'
    END as status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
    AND t.rowsecurity = true
    AND p.policyname IS NULL

UNION ALL

SELECT 
    'Security Assessment Summary' as test_name,
    'User Data Tables without RLS' as category,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '❌ CRITICAL: USER DATA EXPOSED!'
        ELSE '✅ USER DATA PROTECTED'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
    AND rowsecurity = false
    AND tablename IN ('users', 'user_profiles', 'user_saved_articles', 
                     'user_article_interactions', 'chat_sessions', 'chat_messages',
                     'analysis_sessions', 'analysis_notes', 'user_notifications',
                     'user_alert_subscriptions', 'subscriptions', 'alerts', 'trades');

-- =============================================
-- 7. RECOMMENDATIONS
-- =============================================

SELECT 
    'Security Recommendations' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND rowsecurity = false
            AND tablename IN ('users', 'user_profiles', 'user_saved_articles', 
                             'user_article_interactions', 'chat_sessions', 'chat_messages',
                             'analysis_sessions', 'analysis_notes', 'user_notifications',
                             'user_alert_subscriptions', 'subscriptions', 'alerts', 'trades')
        ) THEN 'CRITICAL: Enable RLS on user data tables immediately'
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND rowsecurity = false
        ) THEN 'WARNING: Enable RLS on all tables'
        WHEN EXISTS (
            SELECT 1 FROM pg_tables t
            LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
            WHERE t.schemaname = 'public'
            AND t.rowsecurity = true
            AND p.policyname IS NULL
        ) THEN 'WARNING: Create policies for tables with RLS'
        ELSE 'All tables appear to be properly secured'
    END as recommendation;

SELECT 'PostgREST exposed tables audit completed!' as status;
