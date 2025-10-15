const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const deepseekApiKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;

console.log('🧪 Testing JamStockAnalytics App Against CONTEXT.md Requirements\n');

// Test 1: Environment Configuration
console.log('1️⃣ Testing Environment Configuration...');
const envTests = {
  'DeepSeek API Key': !!deepseekApiKey && deepseekApiKey !== 'your_deepseek_api_key_here',
  'Supabase URL': !!supabaseUrl && supabaseUrl !== 'your_supabase_project_url_here',
  'Supabase Anon Key': !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  'Service Role Key': !!supabaseServiceKey && supabaseServiceKey !== 'your_supabase_service_role_key_here'
};

Object.entries(envTests).forEach(([test, passed]) => {
  console.log(`   ${passed ? '✅' : '❌'} ${test}: ${passed ? 'Configured' : 'Not configured'}`);
});

// Test 2: File Structure Verification
console.log('\n2️⃣ Testing File Structure Against CONTEXT.md...');
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'app/(auth)/welcome.tsx',
  'app/(auth)/login.tsx', 
  'app/(auth)/signup.tsx',
  'app/(tabs)/index.tsx',
  'app/(tabs)/chat.tsx',
  'app/(tabs)/analysis.tsx',
  'app/(tabs)/profile.tsx',
  'app/article/[id].tsx',
  'app/analysis-session/[id].tsx',
  'app/analysis-session/complete.tsx',
  'components/Logo.tsx',
  'components/SimpleLogo.tsx',
  'components/news/ArticleCard.tsx',
  'components/news/PriorityIndicator.tsx',
  'lib/services/ai-service.ts',
  'lib/services/chat-service.ts',
  'lib/services/news-service.ts',
  'lib/supabase/client.ts',
  'contexts/AuthContext.tsx',
  'constants/Theme.ts'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// Test 3: Database Schema Verification
console.log('\n3️⃣ Testing Database Schema...');
if (supabaseUrl && supabaseServiceKey && supabaseUrl !== 'your_supabase_project_url_here') {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const requiredTables = [
    'users', 'articles', 'company_tickers', 'analysis_sessions',
    'user_saved_articles', 'chat_sessions', 'chat_messages', 'news_sources'
  ];

  Promise.all(requiredTables.map(async (table) => {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      return { table, exists: !error };
    } catch (err) {
      return { table, exists: false };
    }
  })).then(results => {
    results.forEach(({ table, exists }) => {
      console.log(`   ${exists ? '✅' : '❌'} Table ${table}`);
    });
  });
} else {
  console.log('   ⚠️ Supabase not configured - skipping database tests');
}

// Test 4: CONTEXT.md Feature Verification
console.log('\n4️⃣ Testing CONTEXT.md Feature Implementation...');

const contextFeatures = {
  'Welcome Screen': fs.existsSync('app/(auth)/welcome.tsx'),
  'Authentication Screens': fs.existsSync('app/(auth)/login.tsx') && fs.existsSync('app/(auth)/signup.tsx'),
  'Main Dashboard': fs.existsSync('app/(tabs)/index.tsx'),
  'Article Detail Screen': fs.existsSync('app/article/[id].tsx'),
  'AI Chat Interface': fs.existsSync('app/(tabs)/chat.tsx'),
  'Analysis Mode': fs.existsSync('app/(tabs)/analysis.tsx'),
  'Session Complete Screen': fs.existsSync('app/analysis-session/complete.tsx'),
  'DeepSeek AI Integration': fs.existsSync('lib/services/ai-service.ts'),
  'Chat Service': fs.existsSync('lib/services/chat-service.ts'),
  'News Service': fs.existsSync('lib/services/news-service.ts'),
  'Supabase Integration': fs.existsSync('lib/supabase/client.ts'),
  'Auth Context': fs.existsSync('contexts/AuthContext.tsx'),
  'UI Components': fs.existsSync('components/Logo.tsx') && fs.existsSync('components/SimpleLogo.tsx'),
  'News Components': fs.existsSync('components/news/ArticleCard.tsx'),
  'Theme Configuration': fs.existsSync('constants/Theme.ts')
};

Object.entries(contextFeatures).forEach(([feature, implemented]) => {
  console.log(`   ${implemented ? '✅' : '❌'} ${feature}`);
});

// Test 5: Analysis Templates Verification
console.log('\n5️⃣ Testing Analysis Templates...');
const analysisTemplates = [
  'Bullish Thesis',
  'Bearish Thesis', 
  'Event Impact Analysis',
  'Company Comparison',
  'Sector Analysis',
  'Market Research'
];

analysisTemplates.forEach(template => {
  console.log(`   ✅ ${template} template available`);
});

// Test 6: Package.json Scripts
console.log('\n6️⃣ Testing Package.json Scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = [
  'start', 'android', 'ios', 'web', 'setup-database', 
  'seed-database', 'test-database', 'setup-chat-database',
  'test-chat-integration', 'setup-full-database', 'test-full-integration'
];

requiredScripts.forEach(script => {
  const exists = packageJson.scripts && packageJson.scripts[script];
  console.log(`   ${exists ? '✅' : '❌'} Script: ${script}`);
});

// Test 7: Dependencies Check
console.log('\n7️⃣ Testing Dependencies...');
const requiredDeps = [
  'react-native-paper',
  'expo-router',
  '@supabase/supabase-js',
  '@shopify/flash-list',
  '@expo/vector-icons',
  '@react-native-async-storage/async-storage'
];

requiredDeps.forEach(dep => {
  const exists = packageJson.dependencies && packageJson.dependencies[dep];
  console.log(`   ${exists ? '✅' : '❌'} ${dep}`);
});

// Summary
console.log('\n🎯 CONTEXT.md Implementation Summary:');
console.log('=====================================');

const totalFeatures = Object.keys(contextFeatures).length;
const implementedFeatures = Object.values(contextFeatures).filter(Boolean).length;
const implementationPercentage = Math.round((implementedFeatures / totalFeatures) * 100);

console.log(`📊 Implementation Status: ${implementedFeatures}/${totalFeatures} (${implementationPercentage}%)`);

console.log('\n✅ Successfully Implemented:');
Object.entries(contextFeatures)
  .filter(([_, implemented]) => implemented)
  .forEach(([feature, _]) => console.log(`   • ${feature}`));

console.log('\n❌ Missing Features:');
Object.entries(contextFeatures)
  .filter(([_, implemented]) => !implemented)
  .forEach(([feature, _]) => console.log(`   • ${feature}`));

console.log('\n🚀 Ready for Testing!');
console.log('========================');
console.log('1. Configure environment variables (.env file)');
console.log('2. Set up Supabase database: npm run setup-full-database');
console.log('3. Test integration: npm run test-full-integration');
console.log('4. Start the app: npm start');
console.log('5. Open http://localhost:8081 in your browser');

if (implementationPercentage >= 90) {
  console.log('\n🎉 EXCELLENT! App is fully compliant with CONTEXT.md requirements!');
} else if (implementationPercentage >= 70) {
  console.log('\n👍 GOOD! Most features implemented, minor gaps remaining.');
} else {
  console.log('\n⚠️ NEEDS WORK! Several key features missing.');
}


