-- =====================================================
-- JamStockAnalytics Database Update - Safe Version
-- Run this in Supabase SQL Editor in smaller chunks
-- =====================================================

-- PART 1: Create Tables (Run this first)
-- =====================================================

-- Social Share Events Table
CREATE TABLE IF NOT EXISTS public.social_share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- User Chart Preferences Table
CREATE TABLE IF NOT EXISTS public.user_chart_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- User Profile Extensions Table
CREATE TABLE IF NOT EXISTS public.user_profile_extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  chart_preferences JSONB DEFAULT '{}',
  social_preferences JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Analytics Table
CREATE TABLE IF NOT EXISTS public.user_activity_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  content_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Performance Analytics Table
CREATE TABLE IF NOT EXISTS public.content_performance_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
