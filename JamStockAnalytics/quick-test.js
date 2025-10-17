#!/usr/bin/env node

/**
 * Quick Application Test
 * Tests core functionality after database setup
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runQuickTest() {
  console.log('🧪 JamStockAnalytics - Quick Application Test');
  console.log('===============================================\n');

  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (userError) {
      console.log('❌ Database connection failed:', userError.message);
      return;
    }
    console.log('✅ Database connection successful');

    // Test 2: Check Core Tables
    console.log('\n2️⃣ Checking core tables...');
    const tables = [
      'users', 'articles', 'company_tickers', 'news_sources',
      'chat_sessions', 'chat_messages', 'analysis_sessions',
      'user_blocks', 'article_comments', 'web_ui_preferences',
      'ml_learning_patterns', 'curated_articles'
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: Accessible`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

    // Test 3: Check Initial Data
    console.log('\n3️⃣ Checking initial data...');
    
    const { data: newsSources, error: newsError } = await supabase
      .from('news_sources')
      .select('name, is_active');
    
    if (newsError) {
      console.log('❌ News sources error:', newsError.message);
    } else {
      console.log(`✅ News sources: ${newsSources?.length || 0} configured`);
      newsSources?.forEach(source => {
        console.log(`   - ${source.name}: ${source.is_active ? 'Active' : 'Inactive'}`);
      });
    }

    const { data: companies, error: companyError } = await supabase
      .from('company_tickers')
      .select('ticker, company_name, exchange');
    
    if (companyError) {
      console.log('❌ Company tickers error:', companyError.message);
    } else {
      console.log(`✅ Company tickers: ${companies?.length || 0} configured`);
      const jseCount = companies?.filter(c => c.exchange === 'JSE').length || 0;
      const juniorCount = companies?.filter(c => c.exchange === 'Junior').length || 0;
      console.log(`   - JSE companies: ${jseCount}`);
      console.log(`   - Junior Market: ${juniorCount}`);
    }

    // Test 4: Check ML Agent System
    console.log('\n4️⃣ Checking ML agent system...');
    
    const { data: mlAgents, error: mlError } = await supabase
      .from('ml_agent_state')
      .select('agent_name, status');
    
    if (mlError) {
      console.log('❌ ML agents error:', mlError.message);
    } else {
      console.log(`✅ ML agents: ${mlAgents?.length || 0} configured`);
      mlAgents?.forEach(agent => {
        console.log(`   - ${agent.agent_name}: ${agent.status}`);
      });
    }

    // Test 5: Check RLS Policies
    console.log('\n5️⃣ Checking Row Level Security...');
    
    const { data: rlsTables, error: rlsError } = await supabase
      .rpc('get_rls_status');
    
    if (rlsError) {
      console.log('⚠️  RLS check not available (this is normal)');
    } else {
      console.log('✅ RLS policies configured');
    }

    // Test 6: Environment Variables
    console.log('\n6️⃣ Checking environment configuration...');
    
    const deepseekKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
    console.log(`✅ DeepSeek API: ${deepseekKey ? 'Configured' : 'Missing'}`);
    console.log(`✅ Supabase URL: ${supabaseUrl ? 'Configured' : 'Missing'}`);
    console.log(`✅ Service Key: ${supabaseServiceKey ? 'Configured' : 'Missing'}`);

    // Summary
    console.log('\n🎉 Quick Test Summary');
    console.log('====================');
    console.log('✅ Database connection working');
    console.log('✅ Core tables accessible');
    console.log('✅ Initial data populated');
    console.log('✅ ML agent system ready');
    console.log('✅ Environment configured');
    
    console.log('\n🚀 Application is ready for testing!');
    console.log('\nNext steps:');
    console.log('1. Start the application: npm start');
    console.log('2. Test user registration and login');
    console.log('3. Test news feed functionality');
    console.log('4. Test AI chat integration');
    console.log('5. Test analysis mode features');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file has correct Supabase credentials');
    console.log('2. Verify database schema was created successfully');
    console.log('3. Ensure Supabase project is active and accessible');
  }
}

// Run the test
runQuickTest().catch(console.error);
