#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function setupMLAgentDatabase() {
  console.log('🤖 Setting up ML Agent Database Schema...\n');

  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. Enable required extensions
    console.log('📦 Enabling required extensions...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "pg_trgm";
      `
    });

    // 2. Create user interaction tracking table
    console.log('👥 Creating user interaction tracking table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_article_interactions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
      `
    });

    // 3. Create ML learning patterns table
    console.log('🧠 Creating ML learning patterns table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.ml_learning_patterns (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          pattern_id VARCHAR(255) UNIQUE NOT NULL,
          pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN ('user_preference', 'market_trend', 'content_quality', 'timing_optimization', 'engagement_prediction')),
          pattern_data JSONB NOT NULL DEFAULT '{}',
          confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
          success_rate DECIMAL(3,2) CHECK (success_rate >= 0 AND success_rate <= 1),
          usage_count INTEGER DEFAULT 0,
          last_used TIMESTAMP WITH TIME ZONE,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // 4. Create ML agent state table
    console.log('🤖 Creating ML agent state table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.ml_agent_state (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          agent_id VARCHAR(100) UNIQUE NOT NULL,
          model_version VARCHAR(50) NOT NULL,
          last_training_time TIMESTAMP WITH TIME ZONE,
          training_count INTEGER DEFAULT 0,
          pattern_count INTEGER DEFAULT 0,
          user_profile_count INTEGER DEFAULT 0,
          performance_metrics JSONB DEFAULT '{}',
          configuration JSONB DEFAULT '{}',
          is_active BOOLEAN DEFAULT TRUE,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // 5. Create curated articles table
    console.log('📰 Creating curated articles table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.curated_articles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
          curation_score DECIMAL(3,2) CHECK (curation_score >= 0 AND curation_score <= 1),
          curation_reason TEXT,
          target_audience TEXT[],
          optimal_timing VARCHAR(50),
          expected_engagement DECIMAL(3,2) CHECK (expected_engagement >= 0 AND expected_engagement <= 1),
          confidence_level DECIMAL(3,2) CHECK (confidence_level >= 0 AND confidence_level <= 1),
          curation_patterns JSONB DEFAULT '{}',
          actual_engagement DECIMAL(3,2),
          engagement_accuracy DECIMAL(3,2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // 6. Create user interaction profiles table
    console.log('👤 Creating user interaction profiles table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_interaction_profiles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
      `
    });

    // 7. Create market data table
    console.log('📊 Creating market data table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.market_data (
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
      `
    });

    // 8. Create indexes for performance
    console.log('📊 Creating performance indexes...');
    await supabase.rpc('exec_sql', {
      sql: `
        -- User interactions indexes
        CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_article_interactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_interactions_article_id ON public.user_article_interactions(article_id);
        CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON public.user_article_interactions(interaction_type);
        CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON public.user_article_interactions(timestamp);
        CREATE INDEX IF NOT EXISTS idx_user_interactions_context ON public.user_article_interactions USING GIN(context);

        -- ML patterns indexes
        CREATE INDEX IF NOT EXISTS idx_ml_patterns_type ON public.ml_learning_patterns(pattern_type);
        CREATE INDEX IF NOT EXISTS idx_ml_patterns_confidence ON public.ml_learning_patterns(confidence_score);
        CREATE INDEX IF NOT EXISTS idx_ml_patterns_active ON public.ml_learning_patterns(is_active);
        CREATE INDEX IF NOT EXISTS idx_ml_patterns_data ON public.ml_learning_patterns USING GIN(pattern_data);

        -- Curated articles indexes
        CREATE INDEX IF NOT EXISTS idx_curated_articles_score ON public.curated_articles(curation_score DESC);
        CREATE INDEX IF NOT EXISTS idx_curated_articles_engagement ON public.curated_articles(expected_engagement DESC);
        CREATE INDEX IF NOT EXISTS idx_curated_articles_audience ON public.curated_articles USING GIN(target_audience);
        CREATE INDEX IF NOT EXISTS idx_curated_articles_timing ON public.curated_articles(optimal_timing);

        -- User profiles indexes
        CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_interaction_profiles(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON public.user_interaction_profiles(is_active);
        CREATE INDEX IF NOT EXISTS idx_user_profiles_data ON public.user_interaction_profiles USING GIN(profile_data);

        -- Market data indexes
        CREATE INDEX IF NOT EXISTS idx_market_data_date ON public.market_data(date DESC);
        CREATE INDEX IF NOT EXISTS idx_market_data_sentiment ON public.market_data(market_sentiment);
      `
    });

    // 9. Enable Row Level Security
    console.log('🔒 Enabling Row Level Security...');
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.user_article_interactions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.ml_learning_patterns ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.ml_agent_state ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.curated_articles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.user_interaction_profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
      `
    });

    // 10. Create RLS policies
    console.log('🛡️ Creating RLS policies...');
    await supabase.rpc('exec_sql', {
      sql: `
        -- User interactions policies
        CREATE POLICY "Users can view own interactions" ON public.user_article_interactions
        FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert own interactions" ON public.user_article_interactions
        FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Service role can manage all interactions" ON public.user_article_interactions
        FOR ALL USING (auth.role() = 'service_role');

        -- ML patterns policies (service role only)
        CREATE POLICY "Service role can manage ML patterns" ON public.ml_learning_patterns
        FOR ALL USING (auth.role() = 'service_role');

        -- ML agent state policies (service role only)
        CREATE POLICY "Service role can manage agent state" ON public.ml_agent_state
        FOR ALL USING (auth.role() = 'service_role');

        -- Curated articles policies (public read, service role write)
        CREATE POLICY "Anyone can read curated articles" ON public.curated_articles
        FOR SELECT USING (true);

        CREATE POLICY "Service role can manage curated articles" ON public.curated_articles
        FOR ALL USING (auth.role() = 'service_role');

        -- User profiles policies
        CREATE POLICY "Users can view own profile" ON public.user_interaction_profiles
        FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Service role can manage all profiles" ON public.user_interaction_profiles
        FOR ALL USING (auth.role() = 'service_role');

        -- Market data policies (public read, service role write)
        CREATE POLICY "Anyone can read market data" ON public.market_data
        FOR SELECT USING (true);

        CREATE POLICY "Service role can manage market data" ON public.market_data
        FOR ALL USING (auth.role() = 'service_role');
      `
    });

    // 11. Create ML functions
    console.log('⚙️ Creating ML functions...');
    await supabase.rpc('exec_sql', {
      sql: `
        -- Function to calculate engagement score
        CREATE OR REPLACE FUNCTION calculate_engagement_score(
          article_id_param UUID
        ) RETURNS DECIMAL(3,2) AS $$
        DECLARE
          total_interactions INTEGER;
          engagement_score DECIMAL(3,2);
        BEGIN
          SELECT COUNT(*) INTO total_interactions
          FROM public.user_article_interactions
          WHERE article_id = article_id_param
          AND interaction_type IN ('like', 'share', 'save', 'comment');

          -- Simple engagement calculation
          engagement_score := LEAST(total_interactions * 0.1, 1.0);
          
          RETURN engagement_score;
        END;
        $$ LANGUAGE plpgsql;

        -- Function to update user profile
        CREATE OR REPLACE FUNCTION update_user_profile(
          user_id_param UUID,
          interaction_data JSONB
        ) RETURNS VOID AS $$
        BEGIN
          INSERT INTO public.user_interaction_profiles (
            user_id,
            profile_data,
            last_interaction,
            interaction_count
          ) VALUES (
            user_id_param,
            interaction_data,
            NOW(),
            1
          )
          ON CONFLICT (user_id) DO UPDATE SET
            profile_data = user_interaction_profiles.profile_data || interaction_data,
            last_interaction = NOW(),
            interaction_count = user_interaction_profiles.interaction_count + 1,
            last_updated = NOW();
        END;
        $$ LANGUAGE plpgsql;

        -- Function to get top performing patterns
        CREATE OR REPLACE FUNCTION get_top_patterns(
          pattern_type_param VARCHAR(50),
          limit_param INTEGER DEFAULT 10
        ) RETURNS TABLE (
          pattern_id VARCHAR(255),
          pattern_data JSONB,
          confidence_score DECIMAL(3,2),
          success_rate DECIMAL(3,2)
        ) AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            ml.pattern_id,
            ml.pattern_data,
            ml.confidence_score,
            ml.success_rate
          FROM public.ml_learning_patterns ml
          WHERE ml.pattern_type = pattern_type_param
          AND ml.is_active = true
          ORDER BY ml.confidence_score DESC, ml.success_rate DESC
          LIMIT limit_param;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    // 12. Create triggers
    console.log('🔄 Creating triggers...');
    await supabase.rpc('exec_sql', {
      sql: `
        -- Trigger to update user profile on interaction
        CREATE OR REPLACE FUNCTION trigger_update_user_profile() RETURNS TRIGGER AS $$
        BEGIN
          PERFORM update_user_profile(
            NEW.user_id,
            jsonb_build_object(
              'interaction_type', NEW.interaction_type,
              'duration_seconds', NEW.duration_seconds,
              'timestamp', NEW.timestamp
            )
          );
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trigger_user_interaction_profile
        AFTER INSERT ON public.user_article_interactions
        FOR EACH ROW
        EXECUTE FUNCTION trigger_update_user_profile();

        -- Trigger to update article curation status
        CREATE OR REPLACE FUNCTION trigger_update_article_curation() RETURNS TRIGGER AS $$
        BEGIN
          UPDATE public.articles
          SET is_curated = true
          WHERE id = NEW.article_id;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trigger_article_curation
        AFTER INSERT ON public.curated_articles
        FOR EACH ROW
        EXECUTE FUNCTION trigger_update_article_curation();
      `
    });

    // 13. Create views
    console.log('👁️ Creating views...');
    await supabase.rpc('exec_sql', {
      sql: `
        -- View for article performance summary
        CREATE OR REPLACE VIEW article_performance_summary AS
        SELECT 
          a.id,
          a.headline,
          a.ai_priority_score,
          a.sentiment_score,
          COUNT(uai.id) as total_interactions,
          COUNT(CASE WHEN uai.interaction_type = 'like' THEN 1 END) as likes,
          COUNT(CASE WHEN uai.interaction_type = 'share' THEN 1 END) as shares,
          COUNT(CASE WHEN uai.interaction_type = 'save' THEN 1 END) as saves,
          calculate_engagement_score(a.id) as engagement_score,
          ca.curation_score,
          ca.expected_engagement
        FROM public.articles a
        LEFT JOIN public.user_article_interactions uai ON a.id = uai.article_id
        LEFT JOIN public.curated_articles ca ON a.id = ca.article_id
        GROUP BY a.id, a.headline, a.ai_priority_score, a.sentiment_score, ca.curation_score, ca.expected_engagement;

        -- View for ML agent performance
        CREATE OR REPLACE VIEW ml_agent_performance AS
        SELECT 
          mas.agent_id,
          mas.model_version,
          mas.last_training_time,
          mas.training_count,
          mas.pattern_count,
          mas.user_profile_count,
          COUNT(ca.id) as curated_articles_count,
          AVG(ca.curation_score) as avg_curation_score,
          AVG(ca.expected_engagement) as avg_expected_engagement,
          AVG(ca.actual_engagement) as avg_actual_engagement
        FROM public.ml_agent_state mas
        LEFT JOIN public.curated_articles ca ON ca.created_at >= mas.last_training_time
        GROUP BY mas.agent_id, mas.model_version, mas.last_training_time, mas.training_count, mas.pattern_count, mas.user_profile_count;
      `
    });

    console.log('✅ ML Agent Database setup completed successfully!\n');

    console.log('📋 Created tables:');
    console.log('  - user_article_interactions');
    console.log('  - ml_learning_patterns');
    console.log('  - ml_agent_state');
    console.log('  - curated_articles');
    console.log('  - user_interaction_profiles');
    console.log('  - market_data');

    console.log('\n🔧 Created functions:');
    console.log('  - calculate_engagement_score()');
    console.log('  - update_user_profile()');
    console.log('  - get_top_patterns()');

    console.log('\n👁️ Created views:');
    console.log('  - article_performance_summary');
    console.log('  - ml_agent_performance');

    console.log('\n🛡️ Security:');
    console.log('  - Row Level Security enabled');
    console.log('  - RLS policies created');

    console.log('\n📊 Performance:');
    console.log('  - Indexes created for optimal query performance');
    console.log('  - Triggers for automatic updates');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  }
}

// Run the setup
setupMLAgentDatabase();
