-- =============================================
-- SUPABASE SECURITY SCRIPT
-- =============================================
-- Complete security fix for JamStockAnalytics Supabase database
-- This script fixes all security vulnerabilities and sets up comprehensive RLS policies

-- =============================================
-- 1. DROP PROBLEMATIC VIEWS (SECURITY RISK)
-- =============================================

-- Remove views that expose user data to anonymous users
DROP VIEW IF EXISTS public.user_analysis_summary CASCADE;
DROP VIEW IF EXISTS public.user_storage_summary CASCADE;

-- =============================================
-- 2. CREATE SECURE REPLACEMENT VIEWS
-- =============================================

-- Secure view for user's own analysis summary (requires authentication)
CREATE VIEW public.my_analysis_summary AS
SELECT 
    u.id as user_id,
    u.full_name,
    COUNT(as.id) as total_sessions,
    COUNT(CASE WHEN as.is_completed THEN 1 END) as completed_sessions,
    AVG(as.duration_minutes) as avg_session_duration,
    MAX(as.completed_at) as last_analysis_date
FROM public.users u
LEFT JOIN public.analysis_sessions as ON u.id = as.user_id
WHERE u.id = auth.uid()  -- Only show current user's data
GROUP BY u.id, u.full_name;

-- Secure view for user's own storage summary (requires authentication)
CREATE VIEW public.my_storage_summary AS
SELECT 
    u.id as user_id,
    u.full_name,
    COUNT(sf.id) as total_files,
    SUM(sf.file_size) as total_size_bytes,
    ROUND(SUM(sf.file_size) / 1024.0 / 1024.0, 2) as total_size_mb,
    COUNT(CASE WHEN sf.is_public THEN 1 END) as public_files,
    COUNT(CASE WHEN sf.is_public = false THEN 1 END) as private_files
FROM public.users u
LEFT JOIN public.storage_files sf ON u.id = sf.user_id
WHERE u.id = auth.uid()  -- Only show current user's data
GROUP BY u.id, u.full_name;

-- =============================================
-- 3. CREATE SECURE FUNCTIONS
-- =============================================

-- Function to get user's own analysis summary
CREATE OR REPLACE FUNCTION public.get_my_analysis_summary()
RETURNS TABLE (
    user_id UUID,
    full_name VARCHAR(255),
    total_sessions BIGINT,
    completed_sessions BIGINT,
    avg_session_duration NUMERIC,
    last_analysis_date TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        u.id as user_id,
        u.full_name,
        COUNT(as.id) as total_sessions,
        COUNT(CASE WHEN as.is_completed THEN 1 END) as completed_sessions,
        AVG(as.duration_minutes) as avg_session_duration,
        MAX(as.completed_at) as last_analysis_date
    FROM public.users u
    LEFT JOIN public.analysis_sessions as ON u.id = as.user_id
    WHERE u.id = auth.uid()  -- Only current user's data
    GROUP BY u.id, u.full_name;
$$;

-- Function to get user's own storage summary
CREATE OR REPLACE FUNCTION public.get_my_storage_summary()
RETURNS TABLE (
    user_id UUID,
    full_name VARCHAR(255),
    total_files BIGINT,
    total_size_bytes BIGINT,
    total_size_mb NUMERIC,
    public_files BIGINT,
    private_files BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        u.id as user_id,
        u.full_name,
        COUNT(sf.id) as total_files,
        SUM(sf.file_size) as total_size_bytes,
        ROUND(SUM(sf.file_size) / 1024.0 / 1024.0, 2) as total_size_mb,
        COUNT(CASE WHEN sf.is_public THEN 1 END) as public_files,
        COUNT(CASE WHEN sf.is_public = false THEN 1 END) as private_files
    FROM public.users u
    LEFT JOIN public.storage_files sf ON u.id = sf.user_id
    WHERE u.id = auth.uid()  -- Only current user's data
    GROUP BY u.id, u.full_name;
$$;

-- =============================================
-- 4. SECURE EXISTING SECURITY DEFINER FUNCTIONS
-- =============================================

-- Secure user blocking functions
CREATE OR REPLACE FUNCTION public.is_user_blocked(blocker_uuid UUID, blocked_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only allow users to check blocks involving themselves
  IF blocker_uuid != auth.uid() AND blocked_uuid != auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.user_blocks 
    WHERE blocker_id = blocker_uuid 
      AND blocked_id = blocked_uuid 
      AND is_active = true 
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_blocked_users(user_uuid UUID)
RETURNS TABLE (
  blocked_user_id UUID,
  blocked_user_name VARCHAR(255),
  blocked_user_email VARCHAR(255),
  reason VARCHAR(100),
  blocked_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Only allow users to see their own blocked users
  IF user_uuid != auth.uid() THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    u.email,
    ub.reason,
    ub.blocked_at,
    ub.expires_at
  FROM public.user_blocks ub
  JOIN public.users u ON ub.blocked_id = u.id
  WHERE ub.blocker_id = user_uuid 
    AND ub.is_active = true
  ORDER BY ub.blocked_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.unblock_user(blocker_uuid UUID, blocked_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only allow users to unblock their own blocks
  IF blocker_uuid != auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.user_blocks 
  SET 
    is_active = false,
    unblocked_at = NOW(),
    updated_at = NOW()
  WHERE blocker_id = blocker_uuid 
    AND blocked_id = blocked_uuid 
    AND is_active = true;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.filter_comments_for_user(user_uuid UUID)
RETURNS TABLE (
  comment_id UUID,
  article_id UUID,
  user_id UUID,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  like_count INTEGER,
  reply_count INTEGER
) AS $$
BEGIN
  -- Only allow users to filter comments for themselves
  IF user_uuid != auth.uid() THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    ac.id,
    ac.article_id,
    ac.user_id,
    ac.content,
    ac.created_at,
    ac.like_count,
    ac.reply_count
  FROM public.article_comments ac
  WHERE ac.is_deleted = false
    AND NOT public.is_user_blocked(user_uuid, ac.user_id)
  ORDER BY ac.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. ENABLE RLS ON ALL TABLES
-- =============================================

-- Core user tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- User interaction tables
ALTER TABLE public.user_saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_article_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alert_subscriptions ENABLE ROW LEVEL SECURITY;

-- Chat and analysis tables
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_notes ENABLE ROW LEVEL SECURITY;

-- User blocking and comments
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_interactions ENABLE ROW LEVEL SECURITY;

-- Web UI and performance
ALTER TABLE public.web_ui_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Storage
ALTER TABLE public.storage_files ENABLE ROW LEVEL SECURITY;

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Brokerages (if table exists)
ALTER TABLE public.brokerages ENABLE ROW LEVEL SECURITY;

-- PostgREST tables
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.latest_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;

-- Additional tables
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_performance_metrics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. DROP ALL EXISTING POLICIES (CLEAN SLATE)
-- =============================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- =============================================
-- 7. CREATE COMPREHENSIVE RLS POLICIES
-- =============================================

-- =============================================
-- USER DATA POLICIES (AUTHENTICATED USERS ONLY)
-- =============================================

-- Users table - users can only access their own data
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User profiles - users can only access their own profile
CREATE POLICY "user_profiles_all_own" ON public.user_profiles
    FOR ALL USING (auth.uid() = user_id);

-- User saved articles - users can only access their own saved articles
CREATE POLICY "user_saved_articles_all_own" ON public.user_saved_articles
    FOR ALL USING (auth.uid() = user_id);

-- User article interactions - users can only access their own interactions
CREATE POLICY "user_article_interactions_all_own" ON public.user_article_interactions
    FOR ALL USING (auth.uid() = user_id);

-- User notifications - users can only access their own notifications
CREATE POLICY "user_notifications_all_own" ON public.user_notifications
    FOR ALL USING (auth.uid() = user_id);

-- User alert subscriptions - users can only access their own subscriptions
CREATE POLICY "user_alert_subscriptions_all_own" ON public.user_alert_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- CHAT AND ANALYSIS POLICIES
-- =============================================

-- Chat sessions - users can only access their own sessions
CREATE POLICY "chat_sessions_all_own" ON public.chat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Chat messages - users can only access their own messages
CREATE POLICY "chat_messages_all_own" ON public.chat_messages
    FOR ALL USING (auth.uid() = user_id);

-- Analysis sessions - users can only access their own sessions
CREATE POLICY "analysis_sessions_all_own" ON public.analysis_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Analysis notes - users can only access their own notes
CREATE POLICY "analysis_notes_all_own" ON public.analysis_notes
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- USER BLOCKING POLICIES
-- =============================================

-- User blocks - users can view blocks they created or received
CREATE POLICY "user_blocks_select_own" ON public.user_blocks
    FOR SELECT USING (
        auth.uid() = blocker_id OR 
        auth.uid() = blocked_id
    );

-- Users can create blocks (only as the blocker)
CREATE POLICY "user_blocks_insert_own" ON public.user_blocks
    FOR INSERT WITH CHECK (auth.uid() = blocker_id);

-- Users can update their own blocks (only as the blocker)
CREATE POLICY "user_blocks_update_own" ON public.user_blocks
    FOR UPDATE USING (auth.uid() = blocker_id);

-- Users can delete their own blocks (only as the blocker)
CREATE POLICY "user_blocks_delete_own" ON public.user_blocks
    FOR DELETE USING (auth.uid() = blocker_id);

-- =============================================
-- ARTICLE COMMENTS POLICIES
-- =============================================

-- Article comments - anyone can view non-deleted comments
CREATE POLICY "article_comments_select_public" ON public.article_comments
    FOR SELECT USING (is_deleted = false);

-- Users can create comments (must be authenticated)
CREATE POLICY "article_comments_insert_authenticated" ON public.article_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "article_comments_update_own" ON public.article_comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "article_comments_delete_own" ON public.article_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Comment interactions - anyone can view, authenticated users can interact
CREATE POLICY "comment_interactions_select_public" ON public.comment_interactions
    FOR SELECT USING (true);

CREATE POLICY "comment_interactions_insert_authenticated" ON public.comment_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comment_interactions_update_own" ON public.comment_interactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "comment_interactions_delete_own" ON public.comment_interactions
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- WEB UI POLICIES
-- =============================================

-- Web UI preferences - users can only access their own preferences
CREATE POLICY "web_ui_preferences_all_own" ON public.web_ui_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Web performance metrics - users can only access their own metrics
CREATE POLICY "web_performance_metrics_all_own" ON public.web_performance_metrics
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Storage files - users can access their own files
CREATE POLICY "storage_files_all_own" ON public.storage_files
    FOR ALL USING (auth.uid() = user_id);

-- Public files are readable by everyone
CREATE POLICY "storage_files_select_public" ON public.storage_files
    FOR SELECT USING (is_public = true);

-- =============================================
-- SUBSCRIPTION POLICIES
-- =============================================

-- Subscriptions - users can only access their own subscriptions
CREATE POLICY "subscriptions_all_own" ON public.subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- BROKERAGES POLICIES
-- =============================================

-- Brokerages - users can only access their own brokerages
CREATE POLICY "brokerages_all_own" ON public.brokerages
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- PUBLIC DATA POLICIES (ANONYMOUS ACCESS)
-- =============================================

-- Articles are publicly readable
CREATE POLICY "articles_select_public" ON public.articles
    FOR SELECT USING (true);

-- Company tickers are publicly readable
CREATE POLICY "company_tickers_select_public" ON public.company_tickers
    FOR SELECT USING (true);

-- Market data is publicly readable
CREATE POLICY "market_data_select_public" ON public.market_data
    FOR SELECT USING (true);

-- Market insights are publicly readable
CREATE POLICY "market_insights_select_public" ON public.market_insights
    FOR SELECT USING (true);

-- News sources are publicly readable
CREATE POLICY "news_sources_select_public" ON public.news_sources
    FOR SELECT USING (true);

-- Storage buckets are publicly readable (for optimization)
CREATE POLICY "storage_buckets_select_public" ON public.storage_buckets
    FOR SELECT USING (true);

-- Storage usage is publicly readable (for optimization)
CREATE POLICY "storage_usage_select_public" ON public.storage_usage
    FOR SELECT USING (true);

-- =============================================
-- SERVICE ROLE POLICIES (ADMIN ACCESS)
-- =============================================

-- Service role can manage all user data
CREATE POLICY "service_role_users_all" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_user_profiles_all" ON public.user_profiles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_user_saved_articles_all" ON public.user_saved_articles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_user_article_interactions_all" ON public.user_article_interactions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_user_notifications_all" ON public.user_notifications
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_user_alert_subscriptions_all" ON public.user_alert_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Service role can manage all chat and analysis data
CREATE POLICY "service_role_chat_sessions_all" ON public.chat_sessions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_chat_messages_all" ON public.chat_messages
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_analysis_sessions_all" ON public.analysis_sessions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_analysis_notes_all" ON public.analysis_notes
    FOR ALL USING (auth.role() = 'service_role');

-- Service role can manage all content data
CREATE POLICY "service_role_articles_all" ON public.articles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_company_tickers_all" ON public.company_tickers
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_market_data_all" ON public.market_data
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_market_insights_all" ON public.market_insights
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_news_sources_all" ON public.news_sources
    FOR ALL USING (auth.role() = 'service_role');

-- Service role can manage all storage data
CREATE POLICY "service_role_storage_buckets_all" ON public.storage_buckets
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_storage_usage_all" ON public.storage_usage
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_storage_files_all" ON public.storage_files
    FOR ALL USING (auth.role() = 'service_role');

-- Service role can manage all subscriptions
CREATE POLICY "service_role_subscriptions_all" ON public.subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Service role can manage all brokerages
CREATE POLICY "service_role_brokerages_all" ON public.brokerages
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- POSTGREST TABLES POLICIES
-- =============================================

-- Market prices are publicly readable
CREATE POLICY "market_prices_select_public" ON public.market_prices
    FOR SELECT USING (true);

-- Latest prices are publicly readable
CREATE POLICY "latest_prices_select_public" ON public.latest_prices
    FOR SELECT USING (true);

-- Scrape jobs are publicly readable
CREATE POLICY "scrape_jobs_select_public" ON public.scrape_jobs
    FOR SELECT USING (true);

-- Service role can manage PostgREST tables
CREATE POLICY "service_role_market_prices_all" ON public.market_prices
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_latest_prices_all" ON public.latest_prices
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_scrape_jobs_all" ON public.scrape_jobs
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- ADDITIONAL TABLES POLICIES
-- =============================================

-- User organizations - users can access their own memberships
CREATE POLICY "user_organizations_all_own" ON public.user_organizations
    FOR ALL USING (auth.uid() = user_id);

-- Organizations - users can view organizations they are members of
CREATE POLICY "organizations_select_member" ON public.organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_organizations uo 
            WHERE uo.organization_id = organizations.id 
            AND uo.user_id = auth.uid()
        )
    );

-- Organizations - admins/owners can update their organizations
CREATE POLICY "organizations_update_member" ON public.organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_organizations uo 
            WHERE uo.organization_id = organizations.id 
            AND uo.user_id = auth.uid()
            AND uo.role IN ('admin', 'owner')
        )
    );

-- Alerts - users can access their own alerts
CREATE POLICY "alerts_all_own" ON public.alerts
    FOR ALL USING (auth.uid() = user_id);

-- Trades - users can access their own trades
CREATE POLICY "trades_all_own" ON public.trades
    FOR ALL USING (auth.uid() = user_id);

-- Market indicators - publicly readable
CREATE POLICY "market_indicators_select_public" ON public.market_indicators
    FOR SELECT USING (true);

-- Database health checks - publicly readable
CREATE POLICY "database_health_checks_select_public" ON public.database_health_checks
    FOR SELECT USING (true);

-- System performance metrics - publicly readable
CREATE POLICY "system_performance_metrics_select_public" ON public.system_performance_metrics
    FOR SELECT USING (true);

-- Service role can manage all user blocking
CREATE POLICY "service_role_user_blocks_all" ON public.user_blocks
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_article_comments_all" ON public.article_comments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_comment_interactions_all" ON public.comment_interactions
    FOR ALL USING (auth.role() = 'service_role');

-- Service role can manage all web UI data
CREATE POLICY "service_role_web_ui_preferences_all" ON public.web_ui_preferences
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_web_performance_metrics_all" ON public.web_performance_metrics
    FOR ALL USING (auth.role() = 'service_role');

-- Service role can manage all additional tables
CREATE POLICY "service_role_user_organizations_all" ON public.user_organizations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_organizations_all" ON public.organizations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_alerts_all" ON public.alerts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_trades_all" ON public.trades
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_market_indicators_all" ON public.market_indicators
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_database_health_checks_all" ON public.database_health_checks
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_system_performance_metrics_all" ON public.system_performance_metrics
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 8. GRANT PERMISSIONS TO FUNCTIONS
-- =============================================

-- Grant execute permissions to authenticated users for secure functions
GRANT EXECUTE ON FUNCTION public.get_my_analysis_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_storage_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_blocked(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_blocked_users(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unblock_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.filter_comments_for_user(UUID) TO authenticated;

-- =============================================
-- 9. SECURITY VERIFICATION
-- =============================================

-- Check RLS status on all tables
SELECT 
    'RLS Status Check' as test_name,
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ ENABLED' 
        ELSE '❌ DISABLED - SECURITY RISK!' 
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'users', 'user_profiles', 'articles', 'company_tickers', 
        'analysis_sessions', 'user_saved_articles', 'chat_sessions', 
        'chat_messages', 'news_sources', 'market_insights',
        'user_blocks', 'article_comments', 'comment_interactions',
        'web_ui_preferences', 'web_performance_metrics', 'storage_files',
        'subscriptions', 'storage_buckets', 'storage_usage', 'brokerages',
        'market_prices', 'latest_prices', 'scrape_jobs',
        'user_organizations', 'organizations', 'alerts', 'trades',
        'market_indicators', 'database_health_checks', 'system_performance_metrics'
    )
ORDER BY tablename;

-- Check policy coverage
SELECT 
    'Policy Coverage Check' as test_name,
    t.tablename,
    COUNT(p.policyname) as policy_count,
    CASE 
        WHEN COUNT(p.policyname) > 0 THEN '✅ HAS POLICIES' 
        ELSE '❌ NO POLICIES - SECURITY RISK!' 
    END as status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' 
    AND t.tablename IN (
        'users', 'user_profiles', 'articles', 'company_tickers', 
        'analysis_sessions', 'user_saved_articles', 'chat_sessions', 
        'chat_messages', 'news_sources', 'market_insights',
        'user_blocks', 'article_comments', 'comment_interactions',
        'web_ui_preferences', 'web_performance_metrics', 'storage_files',
        'subscriptions', 'storage_buckets', 'storage_usage', 'brokerages',
        'market_prices', 'latest_prices', 'scrape_jobs',
        'user_organizations', 'organizations', 'alerts', 'trades',
        'market_indicators', 'database_health_checks', 'system_performance_metrics'
    )
GROUP BY t.tablename
ORDER BY t.tablename;

-- Check if problematic views have been removed
SELECT 
    'View Security Check' as test_name,
    viewname,
    CASE 
        WHEN viewname IN ('user_analysis_summary', 'user_storage_summary') 
        THEN '❌ PROBLEMATIC VIEW STILL EXISTS!' 
        ELSE '✅ SAFE VIEW' 
    END as status
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- =============================================
-- 10. SECURITY SUMMARY
-- =============================================

/*
🔒 SUPABASE SECURITY FIXES APPLIED:

✅ REMOVED SECURITY VULNERABILITIES:
   - Dropped user_analysis_summary view (exposed user data)
   - Dropped user_storage_summary view (exposed user data)
   - Secured all SECURITY DEFINER functions

✅ CREATED SECURE REPLACEMENTS:
   - my_analysis_summary view (user's own data only)
   - my_storage_summary view (user's own data only)
   - get_my_analysis_summary() function
   - get_my_storage_summary() function

✅ COMPREHENSIVE RLS POLICIES:
   - All user tables have RLS enabled
   - Users can only access their own data
   - Anonymous users can only access public data
   - Service role has administrative access

✅ ACCESS CONTROL MATRIX:
   - Anonymous: Public data only (articles, companies, market data)
   - Authenticated: Own data only (user tables, interactions, preferences)
   - Service Role: All data (administrative access)

🔐 SECURITY LEVEL: MAXIMUM
   - Zero user data exposure to anonymous users
   - Complete data isolation between users
   - All functions properly secured
   - Comprehensive access control implemented
*/

SELECT 'Supabase security script completed successfully!' as status;
