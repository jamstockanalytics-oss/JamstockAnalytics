-- =====================================================
-- JamStockAnalytics Database Update - Supabase SQL Only
-- Run this directly in Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- 1. SOCIAL MEDIA SHARING TABLES
-- =====================================================

-- Social Share Events Table
CREATE TABLE IF NOT EXISTS public.social_share_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('article', 'ai_message', 'chart', 'analysis')),
  content_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  error_message TEXT,
  content_title TEXT NOT NULL,
  content_url TEXT,
  hashtags_used TEXT[],
  reach_estimate INTEGER,
  engagement_estimate INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Social Preferences Table
CREATE TABLE IF NOT EXISTS public.user_social_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  enabled_platforms TEXT[] DEFAULT '{}',
  default_platform VARCHAR(50) DEFAULT 'twitter',
  include_hashtags BOOLEAN DEFAULT TRUE,
  include_app_branding BOOLEAN DEFAULT TRUE,
  share_analytics BOOLEAN DEFAULT FALSE,
  auto_share BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CHART PREFERENCES AND DATA TABLES
-- =====================================================

-- User Chart Preferences Table
CREATE TABLE IF NOT EXISTS public.user_chart_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  default_design VARCHAR(50) DEFAULT 'professional',
  default_type VARCHAR(20) DEFAULT 'line',
  show_legend BOOLEAN DEFAULT TRUE,
  show_grid BOOLEAN DEFAULT TRUE,
  show_labels BOOLEAN DEFAULT TRUE,
  auto_refresh BOOLEAN DEFAULT TRUE,
  refresh_interval INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chart Data Cache Table
CREATE TABLE IF NOT EXISTS public.chart_data_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(50) NOT NULL,
  content_id VARCHAR(255) NOT NULL,
  chart_type VARCHAR(20) NOT NULL,
  chart_design VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_type, content_id, chart_type, chart_design)
);

-- =====================================================
-- 3. ENHANCED USER PROFILE TABLES
-- =====================================================

-- User Profile Extensions Table
CREATE TABLE IF NOT EXISTS public.user_profile_extensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  chart_preferences JSONB DEFAULT '{}',
  social_preferences JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. ANALYTICS AND TRACKING TABLES
-- =====================================================

-- User Activity Analytics
CREATE TABLE IF NOT EXISTS public.user_activity_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  content_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Performance Analytics
CREATE TABLE IF NOT EXISTS public.content_performance_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(50) NOT NULL,
  content_id VARCHAR(255) NOT NULL,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  export_count INTEGER DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0.00,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_type, content_id)
);

-- =====================================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================

-- Social Share Events Indexes
CREATE INDEX IF NOT EXISTS idx_social_share_events_user_id ON public.social_share_events(user_id);
CREATE INDEX IF NOT EXISTS idx_social_share_events_content ON public.social_share_events(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_social_share_events_platform ON public.social_share_events(platform);
CREATE INDEX IF NOT EXISTS idx_social_share_events_shared_at ON public.social_share_events(shared_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_share_events_success ON public.social_share_events(success);

-- User Preferences Indexes
CREATE INDEX IF NOT EXISTS idx_user_social_preferences_user_id ON public.user_social_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chart_preferences_user_id ON public.user_chart_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_extensions_user_id ON public.user_profile_extensions(user_id);

-- Chart Data Cache Indexes
CREATE INDEX IF NOT EXISTS idx_chart_data_cache_content ON public.chart_data_cache(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_chart_data_cache_expires ON public.chart_data_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_chart_data_cache_created ON public.chart_data_cache(created_at DESC);

-- Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_analytics_user_id ON public.user_activity_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_analytics_type ON public.user_activity_analytics(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_analytics_created ON public.user_activity_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_performance_analytics_content ON public.content_performance_analytics(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_performance_analytics_engagement ON public.content_performance_analytics(engagement_score DESC);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.social_share_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_social_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_chart_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_performance_analytics ENABLE ROW LEVEL SECURITY;

-- Social Share Events Policies
CREATE POLICY "Users can view own social share events" ON public.social_share_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social share events" ON public.social_share_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social share events" ON public.social_share_events
  FOR UPDATE USING (auth.uid() = user_id);

-- User Social Preferences Policies
CREATE POLICY "Users can view own social preferences" ON public.user_social_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social preferences" ON public.user_social_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social preferences" ON public.user_social_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- User Chart Preferences Policies
CREATE POLICY "Users can view own chart preferences" ON public.user_chart_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chart preferences" ON public.user_chart_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chart preferences" ON public.user_chart_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Chart Data Cache Policies (Public read, authenticated write)
CREATE POLICY "Anyone can view chart data cache" ON public.chart_data_cache
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert chart data cache" ON public.chart_data_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update chart data cache" ON public.chart_data_cache
  FOR UPDATE USING (auth.role() = 'authenticated');

-- User Profile Extensions Policies
CREATE POLICY "Users can view own profile extensions" ON public.user_profile_extensions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile extensions" ON public.user_profile_extensions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile extensions" ON public.user_profile_extensions
  FOR UPDATE USING (auth.uid() = user_id);

-- User Activity Analytics Policies
CREATE POLICY "Users can view own activity analytics" ON public.user_activity_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity analytics" ON public.user_activity_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Content Performance Analytics Policies (Public read, authenticated write)
CREATE POLICY "Anyone can view content performance analytics" ON public.content_performance_analytics
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert content performance analytics" ON public.content_performance_analytics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update content performance analytics" ON public.content_performance_analytics
  FOR UPDATE USING (auth.role() = 'authenticated');

-- =====================================================
-- 7. DATABASE FUNCTIONS
-- =====================================================

-- Function to get user's social sharing statistics
CREATE OR REPLACE FUNCTION get_user_social_stats(user_uuid UUID)
RETURNS TABLE (
  total_shares BIGINT,
  platform_breakdown JSONB,
  content_type_breakdown JSONB,
  recent_shares JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_shares,
    jsonb_object_agg(platform, platform_count) as platform_breakdown,
    jsonb_object_agg(content_type, content_type_count) as content_type_breakdown,
    jsonb_agg(
      jsonb_build_object(
        'platform', platform,
        'content_title', content_title,
        'shared_at', shared_at
      ) ORDER BY shared_at DESC
    ) as recent_shares
  FROM (
    SELECT 
      platform,
      content_type,
      content_title,
      shared_at,
      COUNT(*) OVER (PARTITION BY platform) as platform_count,
      COUNT(*) OVER (PARTITION BY content_type) as content_type_count
    FROM public.social_share_events 
    WHERE user_id = user_uuid
  ) stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update content performance analytics
CREATE OR REPLACE FUNCTION update_content_performance(
  content_type_param VARCHAR(50),
  content_id_param VARCHAR(255),
  activity_type_param VARCHAR(50)
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.content_performance_analytics (
    content_type, 
    content_id, 
    view_count, 
    share_count, 
    export_count,
    engagement_score
  )
  VALUES (
    content_type_param,
    content_id_param,
    CASE WHEN activity_type_param = 'view' THEN 1 ELSE 0 END,
    CASE WHEN activity_type_param = 'share' THEN 1 ELSE 0 END,
    CASE WHEN activity_type_param = 'export' THEN 1 ELSE 0 END,
    0.0
  )
  ON CONFLICT (content_type, content_id)
  DO UPDATE SET
    view_count = CASE 
      WHEN activity_type_param = 'view' THEN content_performance_analytics.view_count + 1
      ELSE content_performance_analytics.view_count
    END,
    share_count = CASE 
      WHEN activity_type_param = 'share' THEN content_performance_analytics.share_count + 1
      ELSE content_performance_analytics.share_count
    END,
    export_count = CASE 
      WHEN activity_type_param = 'export' THEN content_performance_analytics.export_count + 1
      ELSE content_performance_analytics.export_count
    END,
    engagement_score = (
      (content_performance_analytics.view_count + 
       CASE WHEN activity_type_param = 'view' THEN 1 ELSE 0 END) * 0.1 +
      (content_performance_analytics.share_count + 
       CASE WHEN activity_type_param = 'share' THEN 1 ELSE 0 END) * 0.5 +
      (content_performance_analytics.export_count + 
       CASE WHEN activity_type_param = 'export' THEN 1 ELSE 0 END) * 0.3
    ),
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired chart data cache
CREATE OR REPLACE FUNCTION cleanup_expired_chart_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.chart_data_cache 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_user_social_preferences_updated_at
  BEFORE UPDATE ON public.user_social_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_chart_preferences_updated_at
  BEFORE UPDATE ON public.user_chart_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profile_extensions_updated_at
  BEFORE UPDATE ON public.user_profile_extensions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. SAMPLE DATA AND INITIALIZATION
-- =====================================================

-- Insert default chart designs data
INSERT INTO public.chart_data_cache (content_type, content_id, chart_type, chart_design, data, expires_at)
VALUES 
  ('system', 'default_designs', 'line', 'professional', 
   '{"colors": {"primary": "#1976D2", "secondary": "#42A5F5", "background": "#FFFFFF", "text": "#333333", "grid": "#E0E0E0"}}'::jsonb,
   NOW() + INTERVAL '1 year'),
  ('system', 'default_designs', 'line', 'minimalist',
   '{"colors": {"primary": "#2E2E2E", "secondary": "#666666", "background": "#FFFFFF", "text": "#000000", "grid": "#F0F0F0"}}'::jsonb,
   NOW() + INTERVAL '1 year'),
  ('system', 'default_designs', 'line', 'vibrant',
   '{"colors": {"primary": "#FF6B6B", "secondary": "#4ECDC4", "background": "#FFFFFF", "text": "#2C3E50", "grid": "#E8F4F8"}}'::jsonb,
   NOW() + INTERVAL '1 year')
ON CONFLICT (content_type, content_id, chart_type, chart_design) DO NOTHING;

-- =====================================================
-- 10. VIEWS FOR ANALYTICS
-- =====================================================

-- Create view for social sharing analytics
CREATE OR REPLACE VIEW public.social_sharing_analytics AS
SELECT 
  u.id as user_id,
  u.email,
  COUNT(sse.id) as total_shares,
  COUNT(CASE WHEN sse.platform = 'twitter' THEN 1 END) as twitter_shares,
  COUNT(CASE WHEN sse.platform = 'facebook' THEN 1 END) as facebook_shares,
  COUNT(CASE WHEN sse.platform = 'linkedin' THEN 1 END) as linkedin_shares,
  COUNT(CASE WHEN sse.platform = 'whatsapp' THEN 1 END) as whatsapp_shares,
  COUNT(CASE WHEN sse.content_type = 'article' THEN 1 END) as article_shares,
  COUNT(CASE WHEN sse.content_type = 'ai_message' THEN 1 END) as ai_message_shares,
  COUNT(CASE WHEN sse.content_type = 'chart' THEN 1 END) as chart_shares,
  AVG(sse.reach_estimate) as avg_reach,
  AVG(sse.engagement_estimate) as avg_engagement,
  MAX(sse.shared_at) as last_share_date
FROM public.users u
LEFT JOIN public.social_share_events sse ON u.id = sse.user_id
GROUP BY u.id, u.email;

-- Create view for content performance analytics
CREATE OR REPLACE VIEW public.content_performance_view AS
SELECT 
  content_type,
  content_id,
  view_count,
  share_count,
  export_count,
  engagement_score,
  (view_count + share_count + export_count) as total_interactions,
  CASE 
    WHEN engagement_score > 8.0 THEN 'High'
    WHEN engagement_score > 5.0 THEN 'Medium'
    ELSE 'Low'
  END as performance_tier,
  last_updated,
  created_at
FROM public.content_performance_analytics
ORDER BY engagement_score DESC;

-- =====================================================
-- 11. GRANTS AND PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_share_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_social_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_chart_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profile_extensions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_activity_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.content_performance_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chart_data_cache TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_social_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_content_performance(VARCHAR, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_chart_cache() TO authenticated;

-- Grant view permissions
GRANT SELECT ON public.social_sharing_analytics TO authenticated;
GRANT SELECT ON public.content_performance_view TO authenticated;

-- =====================================================
-- 12. VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
SELECT 
  'Tables Created' as status,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'social_share_events',
  'user_social_preferences', 
  'user_chart_preferences',
  'chart_data_cache',
  'user_profile_extensions',
  'user_activity_analytics',
  'content_performance_analytics'
);

-- Verify functions were created
SELECT 
  'Functions Created' as status,
  COUNT(*) as count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_user_social_stats',
  'update_content_performance',
  'cleanup_expired_chart_cache'
);

-- Verify views were created
SELECT 
  'Views Created' as status,
  COUNT(*) as count
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN (
  'social_sharing_analytics',
  'content_performance_view'
);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '🎉 JamStockAnalytics Database Update Completed Successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ New Features Added:';
  RAISE NOTICE '   🔗 Social Media Sharing System';
  RAISE NOTICE '   📊 Chart Preferences and Data Caching';
  RAISE NOTICE '   👤 Enhanced User Profiles';
  RAISE NOTICE '   📈 Analytics and Performance Tracking';
  RAISE NOTICE '   🔒 Row Level Security Policies';
  RAISE NOTICE '   ⚡ Database Functions and Triggers';
  RAISE NOTICE '   🚀 Performance Indexes';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Your database is ready for the updated JamStockAnalytics application!';
END $$;
