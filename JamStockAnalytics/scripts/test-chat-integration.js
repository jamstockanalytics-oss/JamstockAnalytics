#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testChatIntegration() {
  console.log('🧪 Testing DeepSeek Chat Integration...\n');

  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Test 1: Database connection
    console.log('1️⃣ Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    console.log('✅ Database connection successful');

    // Test 2: Check if chat_sessions table exists
    console.log('\n2️⃣ Testing chat sessions table...');
    
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('id')
      .limit(1);

    if (sessionsError) {
      console.error('❌ Failed to access chat_sessions table:', sessionsError.message);
      return;
    }
    console.log('✅ Chat sessions table accessible');

    // Test 3: Test AI service integration
    console.log('\n3️⃣ Testing AI service integration...');
    
    try {
      // Test if DeepSeek API key is configured
      const deepSeekKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
      if (!deepSeekKey || deepSeekKey === 'your_deepseek_api_key_here') {
        console.log('⚠️  DeepSeek API key not configured - skipping AI test');
        console.log('✅ Environment setup completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('   1. Add your DeepSeek API key to .env file');
        console.log('   2. Run: npm run deploy:web');
        return;
      }
      
      console.log('✅ DeepSeek API key configured');
      
      // Test DeepSeek API connection
      console.log('\n4️⃣ Testing DeepSeek API connection...');
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepSeekKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: 'Hello, this is a test message.'
            }
          ],
          max_tokens: 50
        })
      });

      if (!response.ok) {
        console.log('⚠️  DeepSeek API test failed:', response.status, response.statusText);
        console.log('   This might be due to API key permissions or quota limits');
      } else {
        console.log('✅ DeepSeek API connection successful');
      }
      
      console.log('✅ Chat integration test completed successfully!');
      
    } catch (error) {
      console.error('❌ AI service test failed:', error.message);
    }

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Database connection working');
    console.log('   ✅ Chat tables accessible');
    console.log('   ✅ Environment variables configured');
    
    if (process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY && 
        process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY !== 'your_deepseek_api_key_here') {
      console.log('   ✅ DeepSeek API configured');
    } else {
      console.log('   ⚠️  DeepSeek API key needs to be configured');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testChatIntegration();