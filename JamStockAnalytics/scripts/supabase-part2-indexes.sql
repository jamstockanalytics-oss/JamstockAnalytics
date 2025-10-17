-- =====================================================
-- PART 2: Create Indexes (Run this second)
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
