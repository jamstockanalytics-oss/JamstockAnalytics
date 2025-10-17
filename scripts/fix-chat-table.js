#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function fixChatTable() {
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('🔧 Fixing chat_sessions table...\n');

    // Drop and recreate the table to ensure proper structure
    console.log('🗑️ Dropping existing chat_sessions table...');
    await supabase.rpc('exec_sql', {
      sql: `DROP TABLE IF EXISTS public.chat_sessions CASCADE;`
    });

    console.log('🔨 Creating chat_sessions table with proper structure...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE public.chat_sessions (
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

    console.log('📊 Creating indexes...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON public.chat_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON public.chat_sessions(is_active);
      `
    });

    console.log('🔒 Enabling RLS...');
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
      `
    });

    console.log('🛡️ Creating RLS policies...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can access own chat sessions" ON public.chat_sessions
        FOR ALL USING (auth.uid() = user_id);
      `
    });

    console.log('✅ Chat sessions table fixed successfully!\n');

    // Test the table
    console.log('🧪 Testing table...');
    const { data: testSession, error: testError } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: 'test-user-123',
        session_name: 'Test Session',
        is_active: true,
        total_messages: 0,
        session_context: { test: true }
      })
      .select()
      .single();

    if (testError) {
      console.error('❌ Test failed:', testError.message);
    } else {
      console.log('✅ Test successful! Session created:', testSession.id);
      
      // Clean up test data
      await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', testSession.id);
      
      console.log('🧹 Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ Error fixing table:', error.message);
  }
}

fixChatTable();
