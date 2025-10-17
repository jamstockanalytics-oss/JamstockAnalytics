-- ML Agent Database Schema for JamStockAnalytics
-- This file contains the SQL schema for the ML Agent system

-- User Article Interactions Table
CREATE TABLE IF NOT EXISTS public.user_article_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('view', 'like', 'share', 'save', 'skip', 'comment', 'click')),
  duration_seconds INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  context JSONB DEFAULT '{}',
  device_type VARCHAR(50),
  location VARCHAR(100),
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML Learning Patterns Table
CREATE TABLE IF NOT EXISTS public.ml_learning_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type VARCHAR(50) NOT NULL,
  pattern_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
  pattern_source VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2) DEFAULT 0.0,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML Agent State Table
CREATE TABLE IF NOT EXISTS public.ml_agent_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name VARCHAR(100) NOT NULL DEFAULT 'main_agent',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'training', 'error')),
  last_training TIMESTAMP WITH TIME ZONE,
  training_frequency_hours INTEGER DEFAULT 6,
  total_patterns INTEGER DEFAULT 0,
  active_patterns INTEGER DEFAULT 0,
  performance_score DECIMAL(3,2) DEFAULT 0.0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Curated Articles Table
CREATE TABLE IF NOT EXISTS public.curated_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  curation_score DECIMAL(3,2) NOT NULL CHECK (curation_score BETWEEN 0 AND 1),
  target_audience VARCHAR(50) CHECK (target_audience IN ('beginners', 'advanced', 'investors', 'news_followers')),
  reasoning TEXT,
  confidence_level DECIMAL(3,2) DEFAULT 0.0,
  engagement_prediction DECIMAL(3,2) DEFAULT 0.0,
  timing_optimization TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Interaction Profiles Table
CREATE TABLE IF NOT EXISTS public.user_interaction_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_data JSONB NOT NULL DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  behavior_patterns JSONB DEFAULT '{}',
  engagement_history JSONB DEFAULT '{}',
  last_interaction TIMESTAMP WITH TIME ZONE,
  interaction_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Data Table
CREATE TABLE IF NOT EXISTS public.market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_article_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_article_id ON public.user_article_interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON public.user_article_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_ml_patterns_type ON public.ml_learning_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_ml_patterns_confidence ON public.ml_learning_patterns(confidence_score);
CREATE INDEX IF NOT EXISTS idx_curated_articles_score ON public.curated_articles(curation_score DESC);

-- Enable Row Level Security
ALTER TABLE public.user_article_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_agent_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curated_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interaction_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own interactions" ON public.user_article_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interactions" ON public.user_article_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own interactions" ON public.user_article_interactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profiles" ON public.user_interaction_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profiles" ON public.user_interaction_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profiles" ON public.user_interaction_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for curated articles and market data
CREATE POLICY "Anyone can view curated articles" ON public.curated_articles FOR SELECT USING (true);
CREATE POLICY "Anyone can view market data" ON public.market_data FOR SELECT USING (true);

-- Service role access for ML patterns and agent state
CREATE POLICY "Service role can manage ML patterns" ON public.ml_learning_patterns FOR ALL USING (true);
CREATE POLICY "Service role can manage agent state" ON public.ml_agent_state FOR ALL USING (true);
