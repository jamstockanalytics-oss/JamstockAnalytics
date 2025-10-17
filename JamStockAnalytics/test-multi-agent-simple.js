/**
 * Simple Multi-Agent System Test
 * Tests the system without TypeScript dependencies
 */

console.log('🧪 SIMPLE MULTI-AGENT SYSTEM TEST');
console.log('=================================\n');

// Test 1: Environment Variables
console.log('1. Testing Environment Variables...');
const requiredEnvVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'EXPO_PUBLIC_DEEPSEEK_API_KEY'
];

let envIssues = 0;
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar] || process.env[envVar].includes('your_')) {
    console.log(`❌ RED FLAG: ${envVar} not properly configured`);
    envIssues++;
  } else {
    console.log(`✅ ${envVar} configured`);
  }
});

if (envIssues > 0) {
  console.log(`⚠️  ${envIssues} environment variables need configuration`);
} else {
  console.log('✅ All environment variables configured');
}

// Test 2: Database Connection
console.log('\n2. Testing Database Connection...');
try {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ RED FLAG: Supabase credentials missing');
  } else {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    
    // Test connection
    supabase.from('users').select('count').limit(1).then(({ error }) => {
      if (error) {
        console.log('❌ RED FLAG: Database connection failed:', error.message);
      } else {
        console.log('✅ Database connection successful');
      }
    }).catch(err => {
      console.log('❌ RED FLAG: Database connection error:', err.message);
    });
  }
} catch (error) {
  console.log('❌ RED FLAG: Supabase client creation failed:', error.message);
}

// Test 3: File Structure
console.log('\n3. Testing File Structure...');
const requiredFiles = [
  'lib/services/multi-agent-service.ts',
  'components/multi-agent/MultiAgentDashboard.tsx',
  'ADVANCED_MULTI_AGENT_SYSTEM.sql',
  'lib/utils/validation-utils.ts',
  'lib/utils/monitoring-system.ts',
  'lib/utils/performance-monitor.ts'
];

let missingFiles = 0;
requiredFiles.forEach(file => {
  const fs = require('fs');
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ RED FLAG: ${file} missing`);
    missingFiles++;
  }
});

if (missingFiles === 0) {
  console.log('✅ All required files present');
} else {
  console.log(`⚠️  ${missingFiles} files missing`);
}

// Test 4: Dependencies
console.log('\n4. Testing Dependencies...');
try {
  const packageJson = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
  
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
      console.log(`❌ RED FLAG: Missing dependency ${dep}`);
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
  console.log('❌ RED FLAG: Cannot read package.json:', error.message);
}

// Test 5: Database Schema
console.log('\n5. Testing Database Schema...');
try {
  const schemaContent = require('fs').readFileSync('ADVANCED_MULTI_AGENT_SYSTEM.sql', 'utf8');
  
  const requiredTables = [
    'agent_types',
    'agent_instances', 
    'agent_communications',
    'neural_networks',
    'model_training_sessions',
    'model_predictions',
    'learning_streams',
    'learning_events',
    'adaptive_learning_params',
    'external_data_sources',
    'data_integration_pipeline',
    'data_source_metrics',
    'predictive_models',
    'market_predictions',
    'user_behavior_predictions',
    'content_performance_predictions',
    'system_analytics',
    'agent_performance',
    'learning_effectiveness'
  ];
  
  let missingTables = 0;
  requiredTables.forEach(table => {
    if (!schemaContent.includes(`CREATE TABLE public.${table}`)) {
      console.log(`❌ RED FLAG: Table ${table} missing from schema`);
      missingTables++;
    }
  });
  
  if (missingTables === 0) {
    console.log('✅ All required tables present in schema');
  } else {
    console.log(`⚠️  ${missingTables} tables missing from schema`);
  }
  
  // Check for RLS policies
  if (!schemaContent.includes('ENABLE ROW LEVEL SECURITY')) {
    console.log('❌ RED FLAG: RLS policies not enabled');
  } else {
    console.log('✅ RLS policies configured');
  }
  
  // Check for indexes
  const indexCount = (schemaContent.match(/CREATE INDEX/g) || []).length;
  if (indexCount < 20) {
    console.log(`⚠️  Only ${indexCount} indexes found, may need more for performance`);
  } else {
    console.log(`✅ ${indexCount} indexes configured for performance`);
  }
  
} catch (error) {
  console.log('❌ RED FLAG: Cannot read database schema file:', error.message);
}

console.log('\n📊 RED FLAGS TEST SUMMARY');
console.log('==========================');

let totalRedFlags = envIssues + missingFiles;
if (typeof missingDeps !== 'undefined') totalRedFlags += missingDeps;
if (typeof missingTables !== 'undefined') totalRedFlags += missingTables;

if (totalRedFlags === 0) {
  console.log('🎉 NO RED FLAGS DETECTED! System is ready.');
} else {
  console.log(`⚠️  ${totalRedFlags} RED FLAGS DETECTED`);
}

console.log('\n🎯 CRITICAL NEXT STEPS:');
console.log('1. Execute ADVANCED_MULTI_AGENT_SYSTEM.sql in Supabase dashboard');
console.log('2. Test with actual database connection');
console.log('3. Run the application to verify functionality');

console.log('\n✅ SIMPLE MULTI-AGENT SYSTEM TEST COMPLETE');
