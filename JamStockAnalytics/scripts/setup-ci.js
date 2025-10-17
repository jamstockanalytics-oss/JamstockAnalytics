#!/usr/bin/env node

require('dotenv').config();

console.log('🚀 Setting up CI/CD Environment...\n');

// Check required environment variables
const requiredVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_DEEPSEEK_API_KEY'
];

const missingVars = [];

requiredVars.forEach(varName => {
  if (!process.env[varName] || process.env[varName] === 'test-key' || process.env[varName].includes('test')) {
    missingVars.push(varName);
    console.log(`⚠️  ${varName}: Using test value (not configured)`);
  } else {
    console.log(`✅ ${varName}: Configured`);
  }
});

if (missingVars.length > 0) {
  console.log(`\n⚠️  Warning: ${missingVars.length} environment variables are not configured`);
  console.log('   Some features may not work properly in CI environment');
} else {
  console.log('\n✅ All required environment variables are configured');
}

// Test basic functionality
console.log('\n🧪 Testing basic functionality...');

try {
  // Test Supabase connection (if configured)
  if (process.env.EXPO_PUBLIC_SUPABASE_URL && !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('test')) {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    );
    console.log('✅ Supabase client created successfully');
  } else {
    console.log('⚠️  Supabase connection skipped (test mode)');
  }

  // Test DeepSeek API (if configured)
  if (process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY && process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY !== 'test-key') {
    console.log('✅ DeepSeek API key configured');
  } else {
    console.log('⚠️  DeepSeek API connection skipped (test mode)');
  }

  console.log('\n🎉 CI setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Configure GitHub repository secrets if needed');
  console.log('   2. Run tests to verify functionality');
  console.log('   3. Build and deploy your application');

} catch (error) {
  console.error('❌ Error during CI setup:', error.message);
  process.exit(1);
}
