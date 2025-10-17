const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupChatDatabase() {
  console.log('🚀 Setting up chat and AI database features...');

  try {
    // Enable necessary extensions
    console.log('📦 Enabling required extensions...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "pg_trgm";
      `
    });

    // Create chat sessions table
    console.log('💬 Creating chat_sessions table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.chat_sessions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          session_name VARCHAR(255),
          is_active BOOLEAN DEFAULT TRUE,
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          ended_at TIMESTAMP WITH TIME ZONE,
          total_messages INTEGER DEFAULT 0,
          session_context JSONB DEFAULT '{}'
        );
      `
    });

    // Create chat messages table
    console.log('💬 Creating chat_messages table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.chat_messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
          message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'ai', 'system')),
          content TEXT NOT NULL,
          context_data JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_analysis_context BOOLEAN DEFAULT FALSE,
          tokens_used INTEGER DEFAULT 0,
          response_time_ms INTEGER
        );
      `
    });

    // Create indexes for performance
    console.log('📊 Creating indexes...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON public.chat_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON public.chat_sessions(is_active);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON public.chat_messages(user_id);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at);
      `
    });

    // Enable RLS
    console.log('🔒 Enabling Row Level Security...');
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
      `
    });

    // Create RLS policies
    console.log('🛡️ Creating RLS policies...');
    await supabase.rpc('exec_sql', {
      sql: `
        -- Chat sessions policies
        DROP POLICY IF EXISTS "Users can access own chat sessions" ON public.chat_sessions;
        CREATE POLICY "Users can access own chat sessions" ON public.chat_sessions 
          FOR ALL USING (auth.uid() = user_id);

        -- Chat messages policies
        DROP POLICY IF EXISTS "Users can access own chat messages" ON public.chat_messages;
        CREATE POLICY "Users can access own chat messages" ON public.chat_messages 
          FOR ALL USING (auth.uid() = user_id);
      `
    });

    // Create functions for chat analytics
    console.log('⚙️ Creating chat analytics functions...');
    await supabase.rpc('exec_sql', {
      sql: `
        -- Function to get user's chat statistics
        CREATE OR REPLACE FUNCTION get_user_chat_stats(user_uuid UUID)
        RETURNS JSON AS $$
        DECLARE
          result JSON;
        BEGIN
          SELECT json_build_object(
            'total_sessions', COUNT(DISTINCT cs.id),
            'active_sessions', COUNT(DISTINCT CASE WHEN cs.is_active THEN cs.id END),
            'total_messages', COUNT(cm.id),
            'total_tokens', COALESCE(SUM(cm.tokens_used), 0),
            'avg_response_time', COALESCE(AVG(cm.response_time_ms), 0),
            'last_activity', MAX(cm.created_at)
          ) INTO result
          FROM public.chat_sessions cs
          LEFT JOIN public.chat_messages cm ON cs.id = cm.session_id
          WHERE cs.user_id = user_uuid;
          
          RETURN result;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Function to clean up old inactive sessions
        CREATE OR REPLACE FUNCTION cleanup_old_sessions()
        RETURNS INTEGER AS $$
        DECLARE
          deleted_count INTEGER;
        BEGIN
          DELETE FROM public.chat_sessions 
          WHERE is_active = FALSE 
          AND ended_at < NOW() - INTERVAL '30 days';
          
          GET DIAGNOSTICS deleted_count = ROW_COUNT;
          RETURN deleted_count;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    // Create triggers for automatic updates
    console.log('🔄 Creating triggers...');
    await supabase.rpc('exec_sql', {
      sql: `
        -- Function to update session message count
        CREATE OR REPLACE FUNCTION update_session_message_count()
        RETURNS TRIGGER AS $$
        BEGIN
          UPDATE public.chat_sessions 
          SET total_messages = total_messages + 1,
              session_context = jsonb_set(
                COALESCE(session_context, '{}'::jsonb),
                '{last_activity}',
                to_jsonb(NOW())
              )
          WHERE id = NEW.session_id;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Trigger to update message count
        DROP TRIGGER IF EXISTS update_message_count_trigger ON public.chat_messages;
        CREATE TRIGGER update_message_count_trigger
          AFTER INSERT ON public.chat_messages
          FOR EACH ROW EXECUTE FUNCTION update_session_message_count();
      `
    });

    // Create views for common queries
    console.log('👁️ Creating views...');
    await supabase.rpc('exec_sql', {
      sql: `
        -- View for chat session summary
        CREATE OR REPLACE VIEW public.chat_session_summary AS
        SELECT 
          cs.id,
          cs.user_id,
          cs.session_name,
          cs.is_active,
          cs.started_at,
          cs.ended_at,
          cs.total_messages,
          cs.session_context,
          COUNT(cm.id) as actual_message_count,
          COALESCE(SUM(cm.tokens_used), 0) as total_tokens,
          COALESCE(AVG(cm.response_time_ms), 0) as avg_response_time,
          MAX(cm.created_at) as last_message_at
        FROM public.chat_sessions cs
        LEFT JOIN public.chat_messages cm ON cs.id = cm.session_id
        GROUP BY cs.id, cs.user_id, cs.session_name, cs.is_active, 
                 cs.started_at, cs.ended_at, cs.total_messages, cs.session_context;

        -- View for user chat analytics
        CREATE OR REPLACE VIEW public.user_chat_analytics AS
        SELECT 
          user_id,
          COUNT(DISTINCT id) as total_sessions,
          COUNT(DISTINCT CASE WHEN is_active THEN id END) as active_sessions,
          SUM(total_messages) as total_messages,
          AVG(total_messages) as avg_messages_per_session,
          MAX(started_at) as last_session_start,
          MIN(started_at) as first_session_start
        FROM public.chat_sessions
        GROUP BY user_id;
      `
    });

    console.log('✅ Chat and AI database setup completed successfully!');
    console.log('\n📋 Created tables:');
    console.log('  - chat_sessions');
    console.log('  - chat_messages');
    console.log('\n🔧 Created functions:');
    console.log('  - get_user_chat_stats(user_uuid)');
    console.log('  - cleanup_old_sessions()');
    console.log('\n👁️ Created views:');
    console.log('  - chat_session_summary');
    console.log('  - user_chat_analytics');
    console.log('\n🛡️ Security:');
    console.log('  - Row Level Security enabled');
    console.log('  - RLS policies created');
    console.log('\n📊 Performance:');
    console.log('  - Indexes created for optimal query performance');
    console.log('  - Triggers for automatic updates');

  } catch (error) {
    console.error('❌ Error setting up chat database:', error);
    process.exit(1);
  }
}

// Run the setup
setupChatDatabase();
