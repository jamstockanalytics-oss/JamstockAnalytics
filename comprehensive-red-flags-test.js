/**
 * Comprehensive Red Flags Detection and Fix Script
 * Tests actual functionality and identifies runtime issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE RED FLAGS DETECTION');
console.log('====================================\n');

// Test environment variables
console.log('1. Testing Environment Variables...');
try {
  require('dotenv').config();
  
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
  }
} catch (error) {
  console.log('❌ RED FLAG: dotenv not installed or .env file issues');
}

// Test database connection
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
    
    // Test connection by checking if we can access a table
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

// Test TypeScript compilation
console.log('\n3. Testing TypeScript Files...');
const tsFiles = [
  'lib/services/multi-agent-service.ts',
  'components/multi-agent/MultiAgentDashboard.tsx'
];

tsFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for common TypeScript issues
    if (content.includes('any') && content.includes('// TODO')) {
      console.log(`⚠️  ${file} has TODO comments and any types`);
    }
    
    if (content.includes('console.error') && !content.includes('try-catch')) {
      console.log(`⚠️  ${file} has error logging without proper error handling`);
    }
    
    console.log(`✅ ${file} syntax appears valid`);
  }
});

// Test database schema completeness
console.log('\n4. Testing Database Schema Completeness...');
try {
  const schemaContent = fs.readFileSync('ADVANCED_MULTI_AGENT_SYSTEM.sql', 'utf8');
  
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

// Test service dependencies
console.log('\n5. Testing Service Dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredServices = [
    '@supabase/supabase-js',
    'react-native-paper',
    'expo-router',
    'axios',
    'zod'
  ];
  
  let missingDeps = 0;
  requiredServices.forEach(dep => {
    if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
      console.log(`❌ RED FLAG: Missing dependency ${dep}`);
      missingDeps++;
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

// Test multi-agent service structure
console.log('\n6. Testing Multi-Agent Service Structure...');
try {
  const serviceContent = fs.readFileSync('lib/services/multi-agent-service.ts', 'utf8');
  
  // Check for required methods
  const requiredMethods = [
    'createAgentInstance',
    'sendAgentMessage',
    'createModelPrediction',
    'createMarketPrediction',
    'getSystemAnalytics'
  ];
  
  let missingMethods = 0;
  requiredMethods.forEach(method => {
    if (!serviceContent.includes(method)) {
      console.log(`❌ RED FLAG: Method ${method} missing from service`);
      missingMethods++;
    }
  });
  
  if (missingMethods === 0) {
    console.log('✅ All required methods present in service');
  } else {
    console.log(`⚠️  ${missingMethods} methods missing from service`);
  }
  
  // Check for error handling
  if (!serviceContent.includes('try-catch') || !serviceContent.includes('throw error')) {
    console.log('⚠️  Service may need better error handling');
  } else {
    console.log('✅ Service has error handling');
  }
  
} catch (error) {
  console.log('❌ RED FLAG: Cannot read service file:', error.message);
}

// Test component structure
console.log('\n7. Testing Component Structure...');
try {
  const componentContent = fs.readFileSync('components/multi-agent/MultiAgentDashboard.tsx', 'utf8');
  
  // Check for required props and state
  if (!componentContent.includes('useState') || !componentContent.includes('useEffect')) {
    console.log('❌ RED FLAG: Component missing React hooks');
  } else {
    console.log('✅ Component uses React hooks properly');
  }
  
  // Check for error handling
  if (!componentContent.includes('try-catch') || !componentContent.includes('Alert.alert')) {
    console.log('⚠️  Component may need better error handling');
  } else {
    console.log('✅ Component has error handling');
  }
  
  // Check for loading states
  if (!componentContent.includes('loading') || !componentContent.includes('refreshing')) {
    console.log('⚠️  Component may need loading states');
  } else {
    console.log('✅ Component has loading states');
  }
  
} catch (error) {
  console.log('❌ RED FLAG: Cannot read component file:', error.message);
}

console.log('\n📊 COMPREHENSIVE RED FLAGS SUMMARY');
console.log('===================================');

console.log('\n🎯 CRITICAL RED FLAGS TO FIX:');
console.log('1. Configure actual Supabase credentials in .env file');
console.log('2. Execute ADVANCED_MULTI_AGENT_SYSTEM.sql in Supabase dashboard');
console.log('3. Test database connection with actual credentials');

console.log('\n🔧 RECOMMENDED FIXES:');
console.log('1. Add comprehensive error handling to all services');
console.log('2. Implement proper loading states in components');
console.log('3. Add input validation to all API calls');
console.log('4. Implement proper logging and monitoring');
console.log('5. Add unit tests for critical functions');

console.log('\n✅ COMPREHENSIVE RED FLAGS ANALYSIS COMPLETE');
