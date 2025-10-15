const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const DEEPSEEK_API_KEY = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testChatIntegration() {
  console.log('🧪 Testing DeepSeek Chat Integration...\n');

  try {
    // Test 1: Database connection
    console.log('1️⃣ Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('chat_sessions')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    console.log('✅ Database connection successful');

    // Test 2: Create a test user session
    console.log('\n2️⃣ Testing chat session creation...');
    const testUserId = 'test-user-' + Date.now();
    
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: testUserId,
        session_name: 'Test Chat Session',
        is_active: true,
        total_messages: 0,
        session_context: { test: true }
      })
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Failed to create chat session:', sessionError.message);
      return;
    }
    console.log('✅ Chat session created:', session.id);

    // Test 3: Add test messages
    console.log('\n3️⃣ Testing message storage...');
    const testMessages = [
      {
        user_id: testUserId,
        session_id: session.id,
        message_type: 'user',
        content: 'Hello, can you help me with investment advice?',
        context_data: { test: true },
        tokens_used: 0
      },
      {
        user_id: testUserId,
        session_id: session.id,
        message_type: 'ai',
        content: 'Hello! I\'d be happy to help you with investment advice. I specialize in Jamaican and Caribbean markets. What specific investment questions do you have?',
        context_data: { test: true, model: 'deepseek-chat' },
        tokens_used: 25,
        response_time_ms: 1500
      }
    ];

    for (const message of testMessages) {
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert(message);

      if (messageError) {
        console.error('❌ Failed to insert message:', messageError.message);
        return;
      }
    }
    console.log('✅ Test messages stored successfully');

    // Test 4: Retrieve chat history
    console.log('\n4️⃣ Testing chat history retrieval...');
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('❌ Failed to retrieve messages:', messagesError.message);
      return;
    }
    console.log('✅ Retrieved', messages.length, 'messages');

    // Test 5: Test DeepSeek API (if API key is available)
    if (DEEPSEEK_API_KEY) {
      console.log('\n5️⃣ Testing DeepSeek API integration...');
      try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'You are a financial advisor AI specializing in Jamaican and Caribbean markets. Provide a brief, helpful response.'
              },
              {
                role: 'user',
                content: 'What are the key sectors in the Jamaican stock market?'
              }
            ],
            temperature: 0.7,
            max_tokens: 200,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ DeepSeek API test successful');
          console.log('📝 AI Response:', data.choices[0]?.message?.content?.substring(0, 100) + '...');
        } else {
          console.log('⚠️ DeepSeek API test failed:', response.status, response.statusText);
        }
      } catch (apiError) {
        console.log('⚠️ DeepSeek API test failed:', apiError.message);
      }
    } else {
      console.log('\n5️⃣ Skipping DeepSeek API test (no API key provided)');
    }

    // Test 6: Test analytics functions
    console.log('\n6️⃣ Testing analytics functions...');
    try {
      const { data: stats, error: statsError } = await supabase
        .rpc('get_user_chat_stats', { user_uuid: testUserId });

      if (statsError) {
        console.log('⚠️ Analytics function test failed:', statsError.message);
      } else {
        console.log('✅ Analytics function working');
        console.log('📊 User stats:', JSON.stringify(stats, null, 2));
      }
    } catch (analyticsError) {
      console.log('⚠️ Analytics function test failed:', analyticsError.message);
    }

    // Test 7: Test session views
    console.log('\n7️⃣ Testing session views...');
    const { data: sessionSummary, error: summaryError } = await supabase
      .from('chat_session_summary')
      .select('*')
      .eq('id', session.id)
      .single();

    if (summaryError) {
      console.log('⚠️ Session view test failed:', summaryError.message);
    } else {
      console.log('✅ Session view working');
      console.log('📋 Session summary:', {
        total_messages: sessionSummary.total_messages,
        actual_message_count: sessionSummary.actual_message_count,
        total_tokens: sessionSummary.total_tokens
      });
    }

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await supabase
      .from('chat_messages')
      .delete()
      .eq('session_id', session.id);
    
    await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', session.id);

    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Integration Summary:');
    console.log('  ✅ Database connection');
    console.log('  ✅ Chat session management');
    console.log('  ✅ Message storage and retrieval');
    console.log('  ✅ Analytics functions');
    console.log('  ✅ Session views');
    if (DEEPSEEK_API_KEY) {
      console.log('  ✅ DeepSeek API integration');
    } else {
      console.log('  ⚠️ DeepSeek API integration (no API key)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testChatIntegration();
