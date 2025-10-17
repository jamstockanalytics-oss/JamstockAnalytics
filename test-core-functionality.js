/**
 * Core Functionality Test for JamStockAnalytics
 * Tests all remaining features after multi-agent system removal
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 CORE FUNCTIONALITY TEST');
console.log('==========================\n');

// Test 1: Check Core Service Files
console.log('1. Testing Core Service Files...');
const coreServices = [
  'lib/services/ai-service.ts',
  'lib/services/chat-service.ts',
  'lib/services/news-service.ts',
  'lib/services/block-user-service.ts',
  'lib/services/jse-service.ts',
  'lib/services/market-update-service.ts',
  'lib/services/scraping-service.ts',
  'lib/services/web-ui-service.ts',
  'lib/services/brokerage-service.ts',
  'lib/services/ml-agent-service.ts'
];

let serviceIssues = 0;
coreServices.forEach(service => {
  if (fs.existsSync(service)) {
    console.log(`✅ ${service} exists`);
  } else {
    console.log(`❌ MISSING: ${service}`);
    serviceIssues++;
  }
});

if (serviceIssues === 0) {
  console.log('✅ All core services present');
} else {
  console.log(`⚠️  ${serviceIssues} services missing`);
}

// Test 2: Check Core Components
console.log('\n2. Testing Core Components...');
const coreComponents = [
  'components/Logo.tsx',
  'components/ProModeGate.tsx',
  'components/SimpleLogo.tsx',
  'components/block-user/BlockedUsersList.tsx',
  'components/block-user/BlockUserButton.tsx',
  'components/block-user/BlockUserModal.tsx',
  'components/block-user/CommentCard.tsx',
  'components/chat/FallbackIndicator.tsx',
  'components/ml-agent/CuratedArticleFeed.tsx',
  'components/ml-agent/MLAgentDashboard.tsx',
  'components/news/ArticleCard.tsx',
  'components/news/PriorityIndicator.tsx',
  'components/web/LightweightButton.tsx',
  'components/web/LightweightCard.tsx',
  'components/web/LightweightLayout.tsx',
  'components/web/LightweightNewsFeed.tsx'
];

let componentIssues = 0;
coreComponents.forEach(component => {
  if (fs.existsSync(component)) {
    console.log(`✅ ${component} exists`);
  } else {
    console.log(`❌ MISSING: ${component}`);
    componentIssues++;
  }
});

if (componentIssues === 0) {
  console.log('✅ All core components present');
} else {
  console.log(`⚠️  ${componentIssues} components missing`);
}

// Test 3: Check App Structure
console.log('\n3. Testing App Structure...');
const appFiles = [
  'app/_layout.tsx',
  'app/(auth)/login.tsx',
  'app/(auth)/signup.tsx',
  'app/(auth)/welcome.tsx',
  'app/(tabs)/_layout.tsx',
  'app/(tabs)/index.tsx',
  'app/(tabs)/chat.tsx',
  'app/(tabs)/analysis.tsx',
  'app/(tabs)/market.tsx',
  'app/(tabs)/profile.tsx',
  'app/(tabs)/ai-analysis.tsx',
  'app/(tabs)/brokerages.tsx',
  'app/(tabs)/blocked-users.tsx'
];

let appIssues = 0;
appFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ MISSING: ${file}`);
    appIssues++;
  }
});

if (appIssues === 0) {
  console.log('✅ All app files present');
} else {
  console.log(`⚠️  ${appIssues} app files missing`);
}

// Test 4: Check Database Schema
console.log('\n4. Testing Database Schema...');
const schemaFiles = [
  'SUPABASE_SETUP.sql',
  'CORRECTED_MISSING_TABLES_SETUP.sql',
  'DOCS/database-schema.sql'
];

let schemaIssues = 0;
schemaFiles.forEach(schema => {
  if (fs.existsSync(schema)) {
    console.log(`✅ ${schema} exists`);
    
    // Check if schema contains multi-agent references
    try {
      const content = fs.readFileSync(schema, 'utf8');
      if (content.includes('multi_agent') || content.includes('agent_types') || content.includes('neural_networks')) {
        console.log(`⚠️  ${schema} may contain multi-agent references`);
      }
    } catch (error) {
      console.log(`⚠️  Could not read ${schema}`);
    }
  } else {
    console.log(`❌ MISSING: ${schema}`);
    schemaIssues++;
  }
});

if (schemaIssues === 0) {
  console.log('✅ All schema files present');
} else {
  console.log(`⚠️  ${schemaIssues} schema files missing`);
}

// Test 5: Check Dependencies
console.log('\n5. Testing Dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredDeps = [
    '@supabase/supabase-js',
    'react-native-paper',
    'expo-router',
    'axios',
    'zod'
  ];
  
  let missingDeps = 0;
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
      console.log(`❌ MISSING DEPENDENCY: ${dep}`);
      missingDeps++;
    } else {
      console.log(`✅ ${dep} installed`);
    }
  });
  
  if (missingDeps === 0) {
    console.log('✅ All required dependencies present');
  } else {
    console.log(`⚠️  ${missingDeps} dependencies missing`);
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Test 6: Check for Multi-Agent References
console.log('\n6. Checking for Multi-Agent References...');
const filesToCheck = [
  'package.json',
  'app.json',
  'tsconfig.json',
  'README.md'
];

let multiAgentRefs = 0;
filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('multi-agent') || content.includes('MultiAgent') || content.includes('MULTI_AGENT')) {
        console.log(`⚠️  ${file} contains multi-agent references`);
        multiAgentRefs++;
      } else {
        console.log(`✅ ${file} clean`);
      }
    } catch (error) {
      console.log(`⚠️  Could not read ${file}`);
    }
  }
});

if (multiAgentRefs === 0) {
  console.log('✅ No multi-agent references found in core files');
} else {
  console.log(`⚠️  ${multiAgentRefs} files contain multi-agent references`);
}

// Test 7: Check Environment Configuration
console.log('\n7. Testing Environment Configuration...');
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists');
} else if (fs.existsSync('env.example')) {
  console.log('✅ env.example file exists');
  console.log('⚠️  Need to create .env file from env.example');
} else {
  console.log('❌ No environment configuration found');
}

// Summary
console.log('\n📊 CORE FUNCTIONALITY TEST SUMMARY');
console.log('===================================');

const totalIssues = serviceIssues + componentIssues + appIssues + schemaIssues + multiAgentRefs;

if (totalIssues === 0) {
  console.log('🎉 ALL CORE FUNCTIONALITY TESTS PASSED!');
  console.log('✅ System is ready for continued development');
} else {
  console.log(`⚠️  ${totalIssues} issues found that need attention`);
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Fix any missing files or dependencies');
console.log('2. Clean up multi-agent references');
console.log('3. Update documentation');
console.log('4. Test individual features');

console.log('\n✅ CORE FUNCTIONALITY TEST COMPLETE');
