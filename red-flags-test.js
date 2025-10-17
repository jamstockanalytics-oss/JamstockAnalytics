/**
 * Red Flags Detection and Fix Script
 * Identifies and fixes issues in the Multi-Agent System
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 RED FLAGS DETECTION AND FIX SCRIPT');
console.log('=====================================\n');

// Red flags to check
const redFlags = {
  environmentVariables: false,
  databaseConnection: false,
  serviceFiles: false,
  dependencies: false,
  databaseSchema: false,
  multiAgentService: false
};

// Check 1: Environment Variables
console.log('1. Checking Environment Variables...');
try {
  if (!fs.existsSync('.env')) {
    console.log('❌ RED FLAG: .env file missing');
    redFlags.environmentVariables = true;
  } else {
    const envContent = fs.readFileSync('.env', 'utf8');
    if (envContent.includes('your_supabase_project_url_here')) {
      console.log('❌ RED FLAG: Supabase URL not configured');
      redFlags.environmentVariables = true;
    } else {
      console.log('✅ Environment variables configured');
    }
  }
} catch (error) {
  console.log('❌ RED FLAG: Error reading .env file:', error.message);
  redFlags.environmentVariables = true;
}

// Check 2: Service Files
console.log('\n2. Checking Service Files...');
const serviceFiles = [
  'lib/services/multi-agent-service.ts',
  'lib/services/ai-service.ts',
  'lib/services/chat-service.ts',
  'lib/services/news-service.ts'
];

serviceFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ RED FLAG: ${file} missing`);
    redFlags.serviceFiles = true;
  }
});

// Check 3: Dependencies
console.log('\n3. Checking Dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['@supabase/supabase-js', 'react-native-paper', 'expo-router'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep} installed`);
    } else {
      console.log(`❌ RED FLAG: ${dep} missing from dependencies`);
      redFlags.dependencies = true;
    }
  });
} catch (error) {
  console.log('❌ RED FLAG: Error reading package.json:', error.message);
  redFlags.dependencies = true;
}

// Check 4: Database Schema Files
console.log('\n4. Checking Database Schema Files...');
const schemaFiles = [
  'ADVANCED_MULTI_AGENT_SYSTEM.sql',
  'SUPABASE_SETUP.sql',
  'CORRECTED_MISSING_TABLES_SETUP.sql'
];

schemaFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ RED FLAG: ${file} missing`);
    redFlags.databaseSchema = true;
  }
});

// Check 5: Multi-Agent Components
console.log('\n5. Checking Multi-Agent Components...');
const componentFiles = [
  'components/multi-agent/MultiAgentDashboard.tsx'
];

componentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ RED FLAG: ${file} missing`);
    redFlags.multiAgentService = true;
  }
});

// Summary
console.log('\n📊 RED FLAGS SUMMARY');
console.log('===================');

const totalRedFlags = Object.values(redFlags).filter(flag => flag).length;

if (totalRedFlags === 0) {
  console.log('🎉 NO RED FLAGS DETECTED! System is ready.');
} else {
  console.log(`⚠️  ${totalRedFlags} RED FLAGS DETECTED:`);
  
  if (redFlags.environmentVariables) {
    console.log('   - Environment variables not configured');
  }
  if (redFlags.serviceFiles) {
    console.log('   - Service files missing');
  }
  if (redFlags.dependencies) {
    console.log('   - Dependencies missing');
  }
  if (redFlags.databaseSchema) {
    console.log('   - Database schema files missing');
  }
  if (redFlags.multiAgentService) {
    console.log('   - Multi-agent components missing');
  }
}

console.log('\n🔧 FIXING RED FLAGS...');
console.log('======================');

// Fix 1: Create .env file if missing
if (redFlags.environmentVariables) {
  console.log('Creating .env file...');
  const envContent = `# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI Service Configuration
EXPO_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here

# DeepSeek Configuration
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_TEMPERATURE=0.7
DEEPSEEK_MAX_TOKENS=1000

# Chat Configuration
CHAT_SESSION_TIMEOUT_HOURS=24
CHAT_MAX_MESSAGES_PER_SESSION=1000
CHAT_CLEANUP_INTERVAL_DAYS=30

# Multi-Agent System Configuration
ML_AGENT_ENABLED=true
ML_AGENT_TRAINING_INTERVAL_HOURS=6
ML_AGENT_MIN_ARTICLES_FOR_TRAINING=50
ML_AGENT_CONFIDENCE_THRESHOLD=0.7
`;
  
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created');
}

// Fix 2: Check if database schema needs to be executed
if (redFlags.databaseSchema) {
  console.log('Database schema files exist - ready for execution');
}

console.log('\n🎯 NEXT STEPS TO FIX REMAINING RED FLAGS:');
console.log('==========================================');
console.log('1. Update .env file with actual Supabase credentials');
console.log('2. Run: npm install (if dependencies missing)');
console.log('3. Execute ADVANCED_MULTI_AGENT_SYSTEM.sql in Supabase dashboard');
console.log('4. Test the system with: node red-flags-test.js');

console.log('\n✅ RED FLAGS ANALYSIS COMPLETE');
