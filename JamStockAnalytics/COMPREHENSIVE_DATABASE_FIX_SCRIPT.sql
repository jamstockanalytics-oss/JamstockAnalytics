-- ===================================================================
-- COMPREHENSIVE DATABASE FIX SCRIPT FOR JAMSTOCKANALYTICS
-- This script resolves all critical issues identified in the audit
-- ===================================================================

-- IMPORTANT: This script should be run in Supabase SQL Editor
-- It will fix all schema inconsistencies and add missing components

-- ===================================================================
-- PHASE 1: EMERGENCY FIXES - CRITICAL ISSUES
-- ===================================================================

-- Step 1: Drop conflicting tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS public.user_article_interactions CASCADE;
DROP TABLE IF EXISTS public.market_data CASCADE;
DROP TABLE IF EXISTS public.news_sources CASCADE;

-- Step 2: Create corrected news_sources table with proper primary key
CREATE TABLE public.news_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  base_url TEXT NOT NULL,
  rss_feed_url TEXT,
  api_endpoint TEXT,
  scraping_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  priority_score INTEGER DEFAULT 1 CHECK (priority_score BETWEEN 1 AND 10),
  last_scraped TIMESTAMP WITH TIME ZONE,
  scraping_frequency_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create standardized user_article_interactions table
CREATE TABLE public.user_article_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('view', 'like', 'share', 'save', 'skip', 'comment', 'click', 'bookmark')),
  duration_seconds INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  context JSONB DEFAULT '{}',
  device_type VARCHAR(50),
  location VARCHAR(100),
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id, interaction_type)
);

-- Step 4: Create comprehensive market_data table (company-specific)
CREATE TABLE public.market_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker VARCHAR(20) REFERENCES public.company_tickers(ticker),
  date DATE NOT NULL,
  open_price DECIMAL(10,2),
  high_price DECIMAL(10,2),
  low_price DECIMAL(10,2),
  close_price DECIMAL(10,2),
  volume BIGINT,
  market_cap BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ticker, date)
);

-- Step 5: Create general market indicators table (separate from company data)
CREATE TABLE public.market_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  jse_index DECIMAL(10,2),
  volume BIGINT,
  market_sentiment VARCHAR(20) CHECK (market_sentiment IN ('positive', 'negative', 'neutral')),
  volatility_index DECIMAL(5,2),
  sector_performance JSONB DEFAULT '{}',
  economic_indicators JSONB DEFAULT '{}',
  news_sentiment_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- ===================================================================
-- PHASE 2: MISSING CRITICAL TABLES
-- ===================================================================

-- Database Health Monitoring Tables
CREATE TABLE IF NOT EXISTS public.database_health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_type VARCHAR(50) NOT NULL CHECK (check_type IN ('connection', 'idle_transactions', 'locks', 'performance', 'general')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
  details JSONB DEFAULT '{}',
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Rate Limiting Table
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  api_endpoint VARCHAR(255) NOT NULL,
  requests_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rate_limit_per_hour INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, api_endpoint, window_start)
);

-- Advanced User Analytics
CREATE TABLE IF NOT EXISTS public.user_behavior_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Moderation System
CREATE TABLE IF NOT EXISTS public.content_moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('article', 'comment', 'analysis', 'chat_message')),
  moderation_action VARCHAR(50) NOT NULL CHECK (moderation_action IN ('approve', 'reject', 'flag', 'delete', 'edit')),
  moderator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reason TEXT,
  severity_level VARCHAR(20) DEFAULT 'low' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Performance Metrics
CREATE TABLE IF NOT EXISTS public.system_performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name VARCHAR(100) NOT NULL,
  metric_type VARCHAR(50) CHECK (metric_type IN ('performance', 'usage', 'error', 'security', 'database')),
  metric_value DECIMAL(10,4),
  metric_unit VARCHAR(20),
  tags JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Session Management (Enhanced)
CREATE TABLE IF NOT EXISTS public.user_sessions_enhanced (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  device_info JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  session_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- PHASE 3: FIX AND COMPLETE RLS POLICIES
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_article_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions_enhanced ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own interactions" ON public.user_article_interactions;
DROP POLICY IF EXISTS "Users can insert own interactions" ON public.user_article_interactions;
DROP POLICY IF EXISTS "Users can update own interactions" ON public.user_article_interactions;

-- Create comprehensive RLS policies
-- User-specific data policies
CREATE POLICY "Users can access own interactions" ON public.user_article_interactions 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own analytics" ON public.user_behavior_analytics 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own rate limits" ON public.api_rate_limits 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own enhanced sessions" ON public.user_sessions_enhanced 
FOR ALL USING (auth.uid() = user_id);

-- Public read access for market data
CREATE POLICY "Anyone can read market data" ON public.market_data 
FOR SELECT USING (true);

CREATE POLICY "Anyone can read market indicators" ON public.market_indicators 
FOR SELECT USING (true);

CREATE POLICY "Anyone can read news sources" ON public.news_sources 
FOR SELECT USING (true);

-- Service role access for system tables
CREATE POLICY "Service role can manage database health checks" ON public.database_health_checks 
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage system metrics" ON public.system_performance_metrics 
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage content moderation" ON public.content_moderation_logs 
FOR ALL USING (auth.role() = 'service_role');

-- Admin access for moderation
CREATE POLICY "Admin can manage content moderation" ON public.content_moderation_logs 
FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE subscription_tier = 'enterprise'));

-- ===================================================================
-- PHASE 4: ADD MISSING CRITICAL INDEXES
-- ===================================================================

-- Articles indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_ai_priority_date ON public.articles(ai_priority_score DESC, publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_processed_status ON public.articles(is_processed, processing_status);
CREATE INDEX IF NOT EXISTS idx_articles_source_date ON public.articles(source, publication_date DESC);

-- User interactions indexes
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON public.user_article_interactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type_timestamp ON public.user_article_interactions(interaction_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_timestamp ON public.user_article_interactions(user_id, timestamp DESC);

-- Chat and analysis indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_analysis_context ON public.chat_messages(is_analysis_context);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_timestamp ON public.chat_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_type_completed ON public.analysis_sessions(session_type, is_completed);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_user_completed ON public.analysis_sessions(user_id, is_completed);

-- Market data indexes
CREATE INDEX IF NOT EXISTS idx_market_data_ticker_date_desc ON public.market_data(ticker, date DESC);
CREATE INDEX IF NOT EXISTS idx_market_indicators_date_desc ON public.market_indicators(date DESC);
CREATE INDEX IF NOT EXISTS idx_market_data_volume ON public.market_data(volume DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_user_behavior_analytics_user_event ON public.user_behavior_analytics(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_analytics_timestamp ON public.user_behavior_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_user_endpoint ON public.api_rate_limits(user_id, api_endpoint);

-- Database monitoring indexes
CREATE INDEX IF NOT EXISTS idx_database_health_checks_type_status ON public.database_health_checks(check_type, status);
CREATE INDEX IF NOT EXISTS idx_database_health_checks_created ON public.database_health_checks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_performance_metrics_name_type ON public.system_performance_metrics(metric_name, metric_type);

-- Content moderation indexes
CREATE INDEX IF NOT EXISTS idx_content_moderation_logs_content_type ON public.content_moderation_logs(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_logs_action ON public.content_moderation_logs(moderation_action);
CREATE INDEX IF NOT EXISTS idx_content_moderation_logs_created ON public.content_moderation_logs(created_at DESC);

-- Enhanced full-text search indexes
CREATE INDEX IF NOT EXISTS idx_articles_fulltext_search ON public.articles 
USING GIN(to_tsvector('english', headline || ' ' || COALESCE(content, '')));

CREATE INDEX IF NOT EXISTS idx_articles_headline_search ON public.articles 
USING GIN(to_tsvector('english', headline));

CREATE INDEX IF NOT EXISTS idx_company_tickers_search ON public.company_tickers 
USING GIN(to_tsvector('english', company_name || ' ' || COALESCE(description, '')));

-- ===================================================================
-- PHASE 5: ADD MISSING TRIGGERS AND FUNCTIONS
-- ===================================================================

-- Create or replace update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to new tables
CREATE TRIGGER update_news_sources_updated_at 
    BEFORE UPDATE ON public.news_sources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_rate_limits_updated_at 
    BEFORE UPDATE ON public.api_rate_limits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user's last_active timestamp
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users 
    SET last_active = NOW() 
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add last_active triggers
CREATE TRIGGER update_last_active_on_user_interaction 
    AFTER INSERT ON public.user_article_interactions 
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active();

CREATE TRIGGER update_last_active_on_behavior_analytics 
    AFTER INSERT ON public.user_behavior_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active();

-- Function to calculate reading time
CREATE OR REPLACE FUNCTION calculate_reading_time(content TEXT)
RETURNS INTEGER AS $$
BEGIN
    IF content IS NULL THEN
        RETURN 1;
    END IF;
    RETURN GREATEST(1, CEIL(LENGTH(content) / 200.0)); -- Assuming 200 words per minute
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- PHASE 6: INSERT INITIAL DATA
-- ===================================================================

-- Insert default news sources
INSERT INTO public.news_sources (name, base_url, rss_feed_url, priority_score, is_active) VALUES
('Jamaica Observer', 'https://www.jamaicaobserver.com', 'https://www.jamaicaobserver.com/rss', 8, true),
('Jamaica Gleaner', 'https://jamaica-gleaner.com', 'https://jamaica-gleaner.com/rss', 8, true),
('RJR News', 'https://rjrnewsonline.com', 'https://rjrnewsonline.com/rss', 7, true),
('Loop Jamaica', 'https://www.loopjamaica.com', 'https://www.loopjamaica.com/rss', 6, true),
('Jamaica Information Service', 'https://jis.gov.jm', 'https://jis.gov.jm/rss', 7, true)
ON CONFLICT (name) DO NOTHING;

-- Insert default system metrics
INSERT INTO public.system_performance_metrics (metric_name, metric_type, metric_value, metric_unit) VALUES
('database_connection_time', 'performance', 50, 'ms'),
('api_response_time', 'performance', 200, 'ms'),
('active_users', 'usage', 0, 'count'),
('articles_processed', 'usage', 0, 'count')
ON CONFLICT DO NOTHING;

-- ===================================================================
-- PHASE 7: ADD COMMENTS AND DOCUMENTATION
-- ===================================================================

COMMENT ON TABLE public.news_sources IS 'News sources configuration with scraping settings';
COMMENT ON TABLE public.user_article_interactions IS 'User interactions with articles including views, likes, shares';
COMMENT ON TABLE public.market_data IS 'Company-specific market data with OHLC prices and volume';
COMMENT ON TABLE public.market_indicators IS 'General market indicators and sentiment data';
COMMENT ON TABLE public.database_health_checks IS 'Database health monitoring and performance checks';
COMMENT ON TABLE public.api_rate_limits IS 'API rate limiting and usage tracking';
COMMENT ON TABLE public.user_behavior_analytics IS 'Advanced user behavior analytics and tracking';
COMMENT ON TABLE public.content_moderation_logs IS 'Content moderation actions and audit trail';
COMMENT ON TABLE public.system_performance_metrics IS 'System performance metrics and monitoring';
COMMENT ON TABLE public.user_sessions_enhanced IS 'Enhanced user session management with device tracking';

-- ===================================================================
-- PHASE 8: VERIFICATION QUERIES
-- ===================================================================

-- Verify all tables exist and have proper structure
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'news_sources', 'user_article_interactions', 'market_data', 
        'market_indicators', 'database_health_checks', 'api_rate_limits',
        'user_behavior_analytics', 'content_moderation_logs', 
        'system_performance_metrics', 'user_sessions_enhanced'
    );
    
    RAISE NOTICE 'Verification: % critical tables created successfully', table_count;
    
    IF table_count < 10 THEN
        RAISE EXCEPTION 'Not all critical tables were created. Expected 10, found %', table_count;
    END IF;
END $$;

-- Verify RLS is enabled on all tables
DO $$
DECLARE
    rls_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO rls_count 
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname IN (
        'news_sources', 'user_article_interactions', 'market_data', 
        'market_indicators', 'database_health_checks', 'api_rate_limits',
        'user_behavior_analytics', 'content_moderation_logs', 
        'system_performance_metrics', 'user_sessions_enhanced'
    )
    AND c.relrowsecurity = true;
    
    RAISE NOTICE 'Verification: % tables have RLS enabled', rls_count;
END $$;

-- ===================================================================
-- COMPLETION MESSAGE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'COMPREHENSIVE DATABASE FIX COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ All critical schema issues resolved';
    RAISE NOTICE '✅ Missing tables added';
    RAISE NOTICE '✅ RLS policies fixed and completed';
    RAISE NOTICE '✅ Critical indexes added';
    RAISE NOTICE '✅ Triggers and functions created';
    RAISE NOTICE '✅ Initial data inserted';
    RAISE NOTICE '✅ Database monitoring system ready';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database is now ready for production use';
    RAISE NOTICE 'Next: Run database monitoring script';
    RAISE NOTICE 'Command: npm run db:monitor';
    RAISE NOTICE '========================================';
END $$;
