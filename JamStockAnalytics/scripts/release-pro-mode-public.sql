-- =============================================
-- RELEASE PRO MODE AI TO PUBLIC USE
-- Database Updates for Supabase
-- =============================================
-- Run this script in Supabase Dashboard > SQL Editor
-- This script removes Pro Mode restrictions and makes AI features publicly accessible

-- =============================================
-- 1. UPDATE USER SUBSCRIPTION TIERS
-- =============================================

-- Update all users to have premium access (remove free tier restrictions)
UPDATE public.users 
SET subscription_tier = 'premium' 
WHERE subscription_tier = 'free';

-- Add new public access tier
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_subscription_tier_check 
CHECK (subscription_tier IN ('public', 'premium', 'enterprise'));

-- Update all existing users to public tier (free access to AI features)
UPDATE public.users 
SET subscription_tier = 'public' 
WHERE subscription_tier = 'premium';

-- =============================================
-- 2. UPDATE ROW LEVEL SECURITY POLICIES
-- =============================================

-- Make AI analysis sessions publicly accessible
DROP POLICY IF EXISTS "Users can access own analysis sessions" ON public.analysis_sessions;
DROP POLICY IF EXISTS "Users can access own saved articles" ON public.user_saved_articles;
DROP POLICY IF EXISTS "Users can access own chat messages" ON public.chat_messages;

-- Create new public access policies
CREATE POLICY "Public access to analysis sessions" ON public.analysis_sessions 
FOR ALL USING (true);

CREATE POLICY "Public access to saved articles" ON public.user_saved_articles 
FOR ALL USING (true);

CREATE POLICY "Public access to chat messages" ON public.chat_messages 
FOR ALL USING (true);

-- Make market insights publicly readable
DROP POLICY IF EXISTS "Market insights are publicly readable" ON public.market_insights;
CREATE POLICY "Market insights are publicly accessible" ON public.market_insights 
FOR ALL USING (true);

-- =============================================
-- 3. CREATE PUBLIC USER ROLE
-- =============================================

-- Create a public user role for guest access
INSERT INTO public.users (
  id,
  email,
  full_name,
  subscription_tier,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'public@jamstockanalytics.com',
  'Public User',
  'public',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  subscription_tier = 'public',
  updated_at = NOW();

-- =============================================
-- 4. UPDATE WEB UI PREFERENCES FOR PUBLIC ACCESS
-- =============================================

-- Create default public preferences
INSERT INTO public.web_ui_preferences (
  user_id,
  theme,
  layout_mode,
  data_saver,
  auto_refresh,
  refresh_interval,
  max_articles_per_page,
  enable_images,
  enable_animations,
  compact_mode,
  font_size,
  color_scheme,
  performance_mode
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'light',
  'lightweight',
  true,
  false,
  300,
  20,
  false,
  false,
  true,
  'medium',
  'default',
  'optimized'
) ON CONFLICT (user_id) DO UPDATE SET
  theme = 'light',
  layout_mode = 'lightweight',
  data_saver = true,
  auto_refresh = false,
  refresh_interval = 300,
  max_articles_per_page = 20,
  enable_images = false,
  enable_animations = false,
  compact_mode = true,
  font_size = 'medium',
  color_scheme = 'default',
  performance_mode = 'optimized';

-- =============================================
-- 5. UPDATE ML AGENT FOR PUBLIC ACCESS
-- =============================================

-- Update ML agent state for public access
INSERT INTO public.ml_agent_state (
  id,
  is_active,
  last_training_at,
  training_frequency_hours,
  total_patterns_learned,
  total_user_profiles,
  curation_accuracy,
  performance_score,
  created_at,
  updated_at
) VALUES (
  'ml-agent-public',
  true,
  NOW(),
  6,
  0,
  0,
  0.0,
  0,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  is_active = true,
  last_training_at = NOW(),
  training_frequency_hours = 6,
  updated_at = NOW();

-- =============================================
-- 6. CREATE PUBLIC ACCESS CONFIGURATION
-- =============================================

-- Create public access configuration table
CREATE TABLE IF NOT EXISTS public.public_access_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_name VARCHAR(100) UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  access_level VARCHAR(20) DEFAULT 'public' CHECK (access_level IN ('public', 'authenticated', 'premium')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable all AI features for public access
INSERT INTO public.public_access_config (feature_name, is_enabled, access_level, description) VALUES
  ('ai_market_analysis', true, 'public', 'AI-powered market sentiment analysis and risk assessment'),
  ('ai_chat', true, 'public', 'AI chat interface for financial queries'),
  ('ai_insights', true, 'public', 'AI-generated market insights and recommendations'),
  ('red_flag_analysis', true, 'public', 'AI-identified investment risks and concerns'),
  ('portfolio_analysis', true, 'public', 'AI portfolio analysis and optimization'),
  ('news_prioritization', true, 'public', 'AI-powered news prioritization and curation'),
  ('market_prediction', true, 'public', 'AI market trend predictions and forecasts'),
  ('company_analysis', true, 'public', 'AI company financial analysis and ratings')
ON CONFLICT (feature_name) DO UPDATE SET
  is_enabled = true,
  access_level = 'public',
  updated_at = NOW();

-- =============================================
-- 7. UPDATE PERFORMANCE METRICS FOR PUBLIC ACCESS
-- =============================================

-- Create public performance tracking
INSERT INTO public.web_performance_metrics (
  user_id,
  session_id,
  page_load_time_ms,
  total_data_transferred_bytes,
  network_type,
  device_type,
  browser_info,
  performance_score,
  optimization_level
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'public-session',
  500,
  1024000,
  'broadband',
  'desktop',
  '{"name": "public", "version": "1.0"}',
  95,
  'optimized'
) ON CONFLICT DO NOTHING;

-- =============================================
-- 8. CREATE INDEXES FOR PUBLIC ACCESS OPTIMIZATION
-- =============================================

-- Create indexes for better public access performance
CREATE INDEX IF NOT EXISTS idx_articles_public_priority ON public.articles(ai_priority_score DESC, publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_market_insights_public ON public.market_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_access_config ON public.public_access_config(feature_name, is_enabled);

-- =============================================
-- 9. CREATE PUBLIC ACCESS FUNCTIONS
-- =============================================

-- Function to check if feature is publicly accessible
CREATE OR REPLACE FUNCTION public.is_feature_public(feature_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.public_access_config 
    WHERE feature_name = $1 
    AND is_enabled = true 
    AND access_level = 'public'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get public user ID
CREATE OR REPLACE FUNCTION public.get_public_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN '00000000-0000-0000-0000-000000000000';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 10. GRANT PUBLIC ACCESS PERMISSIONS
-- =============================================

-- Grant public access to necessary tables
GRANT SELECT ON public.articles TO anon;
GRANT SELECT ON public.company_tickers TO anon;
GRANT SELECT ON public.market_insights TO anon;
GRANT SELECT ON public.news_sources TO anon;
GRANT SELECT ON public.public_access_config TO anon;

-- Grant public access to functions
GRANT EXECUTE ON FUNCTION public.is_feature_public(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_user_id() TO anon;

-- =============================================
-- 11. UPDATE CACHE CONFIGURATION FOR PUBLIC ACCESS
-- =============================================

-- Create public cache entries for better performance
INSERT INTO public.web_cache_config (
  cache_key,
  cache_type,
  content_hash,
  expires_at,
  is_compressed,
  compression_type,
  size_bytes,
  hit_count
) VALUES
  ('public-articles-list', 'articles', 'public-hash-1', NOW() + INTERVAL '1 hour', true, 'gzip', 51200, 0),
  ('public-market-insights', 'insights', 'public-hash-2', NOW() + INTERVAL '30 minutes', true, 'gzip', 25600, 0),
  ('public-company-data', 'companies', 'public-hash-3', NOW() + INTERVAL '2 hours', true, 'gzip', 102400, 0)
ON CONFLICT (cache_key) DO UPDATE SET
  expires_at = NOW() + INTERVAL '1 hour',
  hit_count = web_cache_config.hit_count + 1;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- Log the completion
INSERT INTO public.web_performance_metrics (
  user_id,
  session_id,
  page_load_time_ms,
  total_data_transferred_bytes,
  network_type,
  device_type,
  browser_info,
  performance_score,
  optimization_level
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'pro-mode-release-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  0,
  0,
  'system',
  'server',
  '{"action": "pro_mode_released", "timestamp": "' || NOW() || '"}',
  100,
  'optimized'
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ PRO MODE AI HAS BEEN SUCCESSFULLY RELEASED TO PUBLIC USE!';
  RAISE NOTICE '📊 All AI features are now publicly accessible';
  RAISE NOTICE '🔓 Guest users can now access AI Analysis, Market Insights, and Chat';
  RAISE NOTICE '⚡ Performance optimizations have been applied';
  RAISE NOTICE '🛡️ Security policies updated for public access';
  RAISE NOTICE '📈 Database indexes created for optimal performance';
END $$;
