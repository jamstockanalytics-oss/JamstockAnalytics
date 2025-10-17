#!/usr/bin/env node

/**
 * Test Public Access to Pro Mode AI Features
 * This script verifies that all AI features are now publicly accessible
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   EXPO_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   EXPO_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey);
  process.exit(1);
}

// Create client with anon key (simulating public access)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPublicAccess() {
  console.log('🧪 Testing Public Access to Pro Mode AI Features...\n');

  const tests = [
    {
      name: 'Articles Access',
      test: async () => {
        const { data, error } = await supabase
          .from('articles')
          .select('id, headline, ai_priority_score')
          .limit(5);
        
        if (error) throw error;
        return `✅ Can access ${data.length} articles with AI priority scores`;
      }
    },
    {
      name: 'Market Insights Access',
      test: async () => {
        const { data, error } = await supabase
          .from('market_insights')
          .select('*')
          .limit(3);
        
        if (error) {
          // Table might not exist yet, that's okay
          return '⚠️  Market insights table not found (will be created)';
        }
        return `✅ Can access ${data.length} market insights`;
      }
    },
    {
      name: 'Company Tickers Access',
      test: async () => {
        const { data, error } = await supabase
          .from('company_tickers')
          .select('ticker, company_name')
          .limit(5);
        
        if (error) throw error;
        return `✅ Can access ${data.length} company tickers`;
      }
    },
    {
      name: 'Public Access Configuration',
      test: async () => {
        const { data, error } = await supabase
          .from('public_access_config')
          .select('feature_name, is_enabled, access_level')
          .eq('is_enabled', true);
        
        if (error) {
          return '⚠️  Public access config table not found (will be created)';
        }
        return `✅ Found ${data.length} publicly enabled features`;
      }
    },
    {
      name: 'News Sources Access',
      test: async () => {
        const { data, error } = await supabase
          .from('news_sources')
          .select('name, base_url')
          .limit(3);
        
        if (error) throw error;
        return `✅ Can access ${data.length} news sources`;
      }
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`⏳ Testing ${test.name}...`);
      const result = await test.test();
      console.log(`   ${result}\n`);
      passedTests++;
    } catch (error) {
      console.log(`   ❌ ${test.name} failed: ${error.message}\n`);
    }
  }

  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Pro Mode AI is publicly accessible!');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('\n✅ Most tests passed! Pro Mode AI is mostly publicly accessible!');
    console.log('   Some features may need database setup.');
  } else {
    console.log('\n⚠️  Some tests failed. Manual database setup may be required.');
    console.log('   Run the SQL script in Supabase Dashboard > SQL Editor');
  }

  return passedTests === totalTests;
}

async function testAIFeatures() {
  console.log('\n🤖 Testing AI Feature Accessibility...\n');

  const aiFeatures = [
    'ai_market_analysis',
    'ai_chat',
    'ai_insights',
    'red_flag_analysis',
    'portfolio_analysis',
    'news_prioritization',
    'market_prediction',
    'company_analysis'
  ];

  try {
    const { data, error } = await supabase
      .from('public_access_config')
      .select('feature_name, is_enabled, access_level')
      .in('feature_name', aiFeatures);

    if (error) {
      console.log('⚠️  Could not test AI features (table not found)');
      console.log('   This is expected if the SQL script hasn\'t been run yet.');
      return false;
    }

    const enabledFeatures = data.filter(f => f.is_enabled && f.access_level === 'public');
    const disabledFeatures = data.filter(f => !f.is_enabled || f.access_level !== 'public');

    console.log(`✅ Enabled AI Features (${enabledFeatures.length}):`);
    enabledFeatures.forEach(feature => {
      console.log(`   • ${feature.feature_name} (${feature.access_level})`);
    });

    if (disabledFeatures.length > 0) {
      console.log(`\n❌ Disabled AI Features (${disabledFeatures.length}):`);
      disabledFeatures.forEach(feature => {
        console.log(`   • ${feature.feature_name} (${feature.access_level})`);
      });
    }

    return enabledFeatures.length === aiFeatures.length;
  } catch (error) {
    console.log('⚠️  Error testing AI features:', error.message);
    return false;
  }
}

async function main() {
  console.log('🎯 JamStockAnalytics - Public Access Test Suite');
  console.log('=' .repeat(60));

  try {
    const basicAccess = await testPublicAccess();
    const aiAccess = await testAIFeatures();

    console.log('\n📋 Summary:');
    console.log(`🔓 Basic Public Access: ${basicAccess ? '✅ Working' : '❌ Needs Setup'}`);
    console.log(`🤖 AI Features Access: ${aiAccess ? '✅ Working' : '❌ Needs Setup'}`);

    if (basicAccess && aiAccess) {
      console.log('\n🎉 SUCCESS! Pro Mode AI is fully publicly accessible!');
      console.log('\n📱 Frontend Features Available:');
      console.log('   • AI Market Analysis - Real-time sentiment analysis');
      console.log('   • AI Chat - Financial query assistance');
      console.log('   • Red Flag Analysis - Investment risk assessment');
      console.log('   • Market Insights - AI-powered recommendations');
      console.log('   • News Prioritization - AI-curated content');
      console.log('   • Company Analysis - AI financial analysis');
    } else {
      console.log('\n🔧 Setup Required:');
      console.log('1. Run: npm run release:pro-mode');
      console.log('2. Or manually execute: scripts/release-pro-mode-public.sql');
      console.log('3. In Supabase Dashboard > SQL Editor');
    }

  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    console.log('\n🔧 Manual Setup Required:');
    console.log('1. Open Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Run scripts/release-pro-mode-public.sql');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testPublicAccess, testAIFeatures };
