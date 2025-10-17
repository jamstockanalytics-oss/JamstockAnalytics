const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   EXPO_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupWebUI() {
  console.log('🚀 Setting up Web UI configuration and optimization...');

  try {
    // Create web_ui_preferences table
    console.log('⚙️ Creating web_ui_preferences table...');
    const createWebUIPreferencesTable = `
      CREATE TABLE IF NOT EXISTS public.web_ui_preferences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
        layout_mode VARCHAR(20) DEFAULT 'lightweight' CHECK (layout_mode IN ('standard', 'lightweight', 'minimal')),
        data_saver BOOLEAN DEFAULT TRUE,
        auto_refresh BOOLEAN DEFAULT FALSE,
        refresh_interval INTEGER DEFAULT 300,
        max_articles_per_page INTEGER DEFAULT 10,
        enable_images BOOLEAN DEFAULT FALSE,
        enable_animations BOOLEAN DEFAULT FALSE,
        compact_mode BOOLEAN DEFAULT TRUE,
        font_size VARCHAR(10) DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
        color_scheme VARCHAR(20) DEFAULT 'default' CHECK (color_scheme IN ('default', 'high_contrast', 'colorblind_friendly')),
        performance_mode VARCHAR(20) DEFAULT 'optimized' CHECK (performance_mode IN ('standard', 'optimized', 'ultra_light')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `;
    await supabase.rpc('exec_sql', { sql: createWebUIPreferencesTable });

    // Create web_performance_metrics table
    console.log('📊 Creating web_performance_metrics table...');
    const createWebPerformanceMetricsTable = `
      CREATE TABLE IF NOT EXISTS public.web_performance_metrics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        session_id VARCHAR(255),
        page_load_time_ms INTEGER,
        total_data_transferred_bytes BIGINT,
        network_type VARCHAR(50),
        device_type VARCHAR(50),
        browser_info JSONB,
        performance_score INTEGER CHECK (performance_score BETWEEN 0 AND 100),
        optimization_level VARCHAR(20) DEFAULT 'standard',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await supabase.rpc('exec_sql', { sql: createWebPerformanceMetricsTable });

    // Create web_cache_config table
    console.log('💾 Creating web_cache_config table...');
    const createWebCacheConfigTable = `
      CREATE TABLE IF NOT EXISTS public.web_cache_config (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        cache_key VARCHAR(255) UNIQUE NOT NULL,
        cache_type VARCHAR(50) NOT NULL CHECK (cache_type IN ('articles', 'market_data', 'user_data', 'static_content')),
        content_hash VARCHAR(255),
        expires_at TIMESTAMP WITH TIME ZONE,
        is_compressed BOOLEAN DEFAULT TRUE,
        compression_type VARCHAR(20) DEFAULT 'gzip',
        size_bytes BIGINT,
        hit_count INTEGER DEFAULT 0,
        last_accessed TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await supabase.rpc('exec_sql', { sql: createWebCacheConfigTable });

    // Create indexes
    console.log('📈 Creating performance indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_web_ui_preferences_user ON public.web_ui_preferences(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_web_ui_preferences_theme ON public.web_ui_preferences(theme);',
      'CREATE INDEX IF NOT EXISTS idx_web_ui_preferences_performance ON public.web_ui_preferences(performance_mode);',
      'CREATE INDEX IF NOT EXISTS idx_web_performance_metrics_user ON public.web_performance_metrics(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_web_performance_metrics_session ON public.web_performance_metrics(session_id);',
      'CREATE INDEX IF NOT EXISTS idx_web_performance_metrics_created ON public.web_performance_metrics(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_web_cache_config_key ON public.web_cache_config(cache_key);',
      'CREATE INDEX IF NOT EXISTS idx_web_cache_config_type ON public.web_cache_config(cache_type);',
      'CREATE INDEX IF NOT EXISTS idx_web_cache_config_expires ON public.web_cache_config(expires_at);'
    ];

    for (const indexSql of indexes) {
      await supabase.rpc('exec_sql', { sql: indexSql });
    }

    // Enable RLS
    console.log('🔐 Enabling Row Level Security...');
    const enableRls = [
      'ALTER TABLE public.web_ui_preferences ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.web_performance_metrics ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.web_cache_config ENABLE ROW LEVEL SECURITY;'
    ];

    for (const rlsSql of enableRls) {
      await supabase.rpc('exec_sql', { sql: rlsSql });
    }

    // Create RLS policies
    console.log('🛡️ Creating security policies...');
    const policies = [
      // Web UI preferences policies
      `CREATE POLICY "Users can view their own web UI preferences" ON public.web_ui_preferences
        FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can create their own web UI preferences" ON public.web_ui_preferences
        FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update their own web UI preferences" ON public.web_ui_preferences
        FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can delete their own web UI preferences" ON public.web_ui_preferences
        FOR DELETE USING (auth.uid() = user_id);`,

      // Web performance metrics policies
      `CREATE POLICY "Users can view their own performance metrics" ON public.web_performance_metrics
        FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can create their own performance metrics" ON public.web_performance_metrics
        FOR INSERT WITH CHECK (auth.uid() = user_id);`,

      // Web cache config policies
      `CREATE POLICY "Anyone can view cache config for optimization" ON public.web_cache_config
        FOR SELECT USING (true);`,
      `CREATE POLICY "Service role can manage cache config" ON public.web_cache_config
        FOR ALL USING (auth.role() = 'service_role');`
    ];

    for (const policySql of policies) {
      await supabase.rpc('exec_sql', { sql: policySql });
    }

    // Insert default web UI configurations
    console.log('🎨 Setting up default web UI configurations...');
    const defaultConfigs = [
      {
        cache_key: 'default_lightweight_config',
        cache_type: 'static_content',
        content_hash: 'lightweight_v1',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        is_compressed: true,
        compression_type: 'gzip',
        size_bytes: 2048,
        hit_count: 0
      },
      {
        cache_key: 'performance_optimization_config',
        cache_type: 'static_content',
        content_hash: 'performance_v1',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        is_compressed: true,
        compression_type: 'gzip',
        size_bytes: 1024,
        hit_count: 0
      }
    ];

    for (const config of defaultConfigs) {
      await supabase
        .from('web_cache_config')
        .upsert(config, { onConflict: 'cache_key' });
    }

    console.log('✅ Web UI configuration setup completed successfully!');
    console.log('');
    console.log('📋 What was created:');
    console.log('   • web_ui_preferences table - User UI customization settings');
    console.log('   • web_performance_metrics table - Performance tracking');
    console.log('   • web_cache_config table - Caching optimization');
    console.log('   • Performance indexes for fast queries');
    console.log('   • Row Level Security policies');
    console.log('   • Default lightweight configurations');
    console.log('');
    console.log('🎯 Features available:');
    console.log('   • Lightweight mode for minimal data usage');
    console.log('   • Performance tracking and optimization');
    console.log('   • User-customizable UI preferences');
    console.log('   • Smart caching for faster loading');
    console.log('   • Data saver mode for low-bandwidth connections');
    console.log('   • Compressed content delivery');

  } catch (error) {
    console.error('❌ Error setting up Web UI:', error);
    process.exit(1);
  }
}

// Run the setup
setupWebUI();
