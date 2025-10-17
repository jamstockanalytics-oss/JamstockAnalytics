#!/usr/bin/env node

/**
 * Environment Testing Script for JamStockAnalytics
 * 
 * This script tests all environment configurations and validates
 * that the application is properly set up.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

// Helper function to log with colors
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to add test result
function addTestResult(name, status, message = '') {
  testResults.tests.push({ name, status, message });
  if (status === 'pass') testResults.passed++;
  else if (status === 'fail') testResults.failed++;
  else if (status === 'warn') testResults.warnings++;
}

// Test 1: Check if .env file exists
function testEnvFileExists() {
  const envPath = path.join(process.cwd(), '.env');
  const exists = fs.existsSync(envPath);
  
  if (exists) {
    addTestResult('Environment File', 'pass', '.env file exists');
  } else {
    addTestResult('Environment File', 'fail', '.env file not found');
  }
  
  return exists;
}

// Test 2: Check if env.example exists
function testEnvExampleExists() {
  const examplePath = path.join(process.cwd(), 'env.example');
  const exists = fs.existsSync(examplePath);
  
  if (exists) {
    addTestResult('Environment Template', 'pass', 'env.example file exists');
  } else {
    addTestResult('Environment Template', 'warn', 'env.example file not found');
  }
  
  return exists;
}

// Test 3: Load and validate environment variables
function testEnvironmentVariables() {
  // Load environment variables
  require('dotenv').config();
  
  const requiredVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'EXPO_PUBLIC_DEEPSEEK_API_KEY'
  ];
  
  const optionalVars = [
    'JWT_SECRET',
    'SESSION_SECRET',
    'NODE_ENV',
    'DEBUG_MODE',
    'APP_ENV'
  ];
  
  // Test required variables
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.includes('your_') || value.includes('_here')) {
      addTestResult(`Required Variable: ${varName}`, 'fail', 'Not configured or using placeholder value');
    } else {
      addTestResult(`Required Variable: ${varName}`, 'pass', 'Properly configured');
    }
  });
  
  // Test optional variables
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.includes('your_') || value.includes('_here')) {
      addTestResult(`Optional Variable: ${varName}`, 'warn', 'Not configured (optional)');
    } else {
      addTestResult(`Optional Variable: ${varName}`, 'pass', 'Properly configured');
    }
  });
}

// Test 4: Validate Supabase URL format
function testSupabaseUrlFormat() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  
  if (!url) {
    addTestResult('Supabase URL Format', 'fail', 'URL not configured');
    return false;
  }
  
  if (url.includes('your_supabase') || url.includes('_here')) {
    addTestResult('Supabase URL Format', 'fail', 'Using placeholder value');
    return false;
  }
  
  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    addTestResult('Supabase URL Format', 'warn', 'URL format may be incorrect');
    return false;
  }
  
  addTestResult('Supabase URL Format', 'pass', 'URL format looks correct');
  return true;
}

// Test 5: Validate DeepSeek API key format
function testDeepSeekKeyFormat() {
  const key = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
  
  if (!key) {
    addTestResult('DeepSeek API Key Format', 'fail', 'API key not configured');
    return false;
  }
  
  if (key.includes('your_deepseek') || key.includes('_here')) {
    addTestResult('DeepSeek API Key Format', 'fail', 'Using placeholder value');
    return false;
  }
  
  if (!key.startsWith('sk-')) {
    addTestResult('DeepSeek API Key Format', 'warn', 'API key should start with "sk-"');
    return false;
  }
  
  addTestResult('DeepSeek API Key Format', 'pass', 'API key format looks correct');
  return true;
}

// Test 6: Test Supabase connection
async function testSupabaseConnection() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      addTestResult('Supabase Connection', 'fail', 'Configuration missing');
      return false;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      addTestResult('Supabase Connection', 'fail', `Connection failed: ${error.message}`);
      return false;
    }
    
    addTestResult('Supabase Connection', 'pass', 'Connection successful');
    return true;
  } catch (error) {
    addTestResult('Supabase Connection', 'fail', `Connection failed: ${error.message}`);
    return false;
  }
}

// Test 7: Test DeepSeek API connection
async function testDeepSeekConnection() {
  try {
    const axios = require('axios');
    
    const apiKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      addTestResult('DeepSeek API Connection', 'fail', 'API key not configured');
      return false;
    }
    
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message.'
          }
        ],
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    if (response.status === 200) {
      addTestResult('DeepSeek API Connection', 'pass', 'API connection successful');
      return true;
    } else {
      addTestResult('DeepSeek API Connection', 'fail', `API returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response) {
      addTestResult('DeepSeek API Connection', 'fail', `API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
    } else {
      addTestResult('DeepSeek API Connection', 'fail', `Connection failed: ${error.message}`);
    }
    return false;
  }
}

// Test 8: Check security configuration
function testSecurityConfiguration() {
  const jwtSecret = process.env.JWT_SECRET;
  const sessionSecret = process.env.SESSION_SECRET;
  
  if (!jwtSecret || jwtSecret.includes('your_') || jwtSecret.includes('_here')) {
    addTestResult('JWT Secret', 'warn', 'JWT secret not configured or using placeholder');
  } else if (jwtSecret.length < 32) {
    addTestResult('JWT Secret', 'warn', 'JWT secret should be at least 32 characters');
  } else {
    addTestResult('JWT Secret', 'pass', 'JWT secret properly configured');
  }
  
  if (!sessionSecret || sessionSecret.includes('your_') || sessionSecret.includes('_here')) {
    addTestResult('Session Secret', 'warn', 'Session secret not configured or using placeholder');
  } else if (sessionSecret.length < 32) {
    addTestResult('Session Secret', 'warn', 'Session secret should be at least 32 characters');
  } else {
    addTestResult('Session Secret', 'pass', 'Session secret properly configured');
  }
}

// Test 9: Check development configuration
function testDevelopmentConfiguration() {
  const nodeEnv = process.env.NODE_ENV;
  const debugMode = process.env.DEBUG_MODE;
  const appEnv = process.env.APP_ENV;
  
  if (!nodeEnv) {
    addTestResult('NODE_ENV', 'warn', 'NODE_ENV not set');
  } else {
    addTestResult('NODE_ENV', 'pass', `Set to: ${nodeEnv}`);
  }
  
  if (!debugMode) {
    addTestResult('DEBUG_MODE', 'warn', 'DEBUG_MODE not set');
  } else {
    addTestResult('DEBUG_MODE', 'pass', `Set to: ${debugMode}`);
  }
  
  if (!appEnv) {
    addTestResult('APP_ENV', 'warn', 'APP_ENV not set');
  } else {
    addTestResult('APP_ENV', 'pass', `Set to: ${appEnv}`);
  }
}

// Test 10: Check package.json scripts
function testPackageScripts() {
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    addTestResult('Package.json', 'fail', 'package.json not found');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const scripts = packageJson.scripts || {};
  
  const requiredScripts = [
    'start',
    'test-database',
    'test-chat-integration',
    'setup-database'
  ];
  
  requiredScripts.forEach(script => {
    if (scripts[script]) {
      addTestResult(`Script: ${script}`, 'pass', 'Script exists');
    } else {
      addTestResult(`Script: ${script}`, 'warn', 'Script not found');
    }
  });
}

// Test 11: Check dependencies
function testDependencies() {
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    addTestResult('Dependencies', 'fail', 'package.json not found');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const dependencies = packageJson.dependencies || {};
  
  const requiredDeps = [
    '@supabase/supabase-js',
    'axios',
    'expo',
    'react-native',
    'react-native-paper'
  ];
  
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      addTestResult(`Dependency: ${dep}`, 'pass', `Version: ${dependencies[dep]}`);
    } else {
      addTestResult(`Dependency: ${dep}`, 'fail', 'Dependency not found');
    }
  });
}

// Test 12: Check project structure
function testProjectStructure() {
  const requiredFiles = [
    'app.json',
    'package.json',
    'tsconfig.json',
    'babel.config.js'
  ];
  
  const requiredDirs = [
    'app',
    'components',
    'lib',
    'scripts'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      addTestResult(`File: ${file}`, 'pass', 'File exists');
    } else {
      addTestResult(`File: ${file}`, 'warn', 'File not found');
    }
  });
  
  requiredDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      addTestResult(`Directory: ${dir}`, 'pass', 'Directory exists');
    } else {
      addTestResult(`Directory: ${dir}`, 'warn', 'Directory not found');
    }
  });
}

// Main test function
async function runTests() {
  log('🧪 JamStockAnalytics Environment Tests', 'bright');
  log('=====================================', 'bright');
  
  // Run all tests
  testEnvFileExists();
  testEnvExampleExists();
  testEnvironmentVariables();
  testSupabaseUrlFormat();
  testDeepSeekKeyFormat();
  testSecurityConfiguration();
  testDevelopmentConfiguration();
  testPackageScripts();
  testDependencies();
  testProjectStructure();
  
  // Test connections (async)
  await testSupabaseConnection();
  await testDeepSeekConnection();
  
  // Display results
  log('\n📊 Test Results:', 'bright');
  log('================', 'bright');
  
  testResults.tests.forEach(test => {
    const status = test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️';
    const color = test.status === 'pass' ? 'green' : test.status === 'fail' ? 'red' : 'yellow';
    log(`${status} ${test.name}${test.message ? ` - ${test.message}` : ''}`, color);
  });
  
  log('\n📈 Summary:', 'bright');
  log('============', 'bright');
  log(`✅ Passed: ${testResults.passed}`, 'green');
  log(`❌ Failed: ${testResults.failed}`, 'red');
  log(`⚠️  Warnings: ${testResults.warnings}`, 'yellow');
  
  const totalTests = testResults.passed + testResults.failed + testResults.warnings;
  const successRate = ((testResults.passed / totalTests) * 100).toFixed(1);
  
  log(`\n📊 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
  
  if (testResults.failed > 0) {
    log('\n❌ Some tests failed. Please check your configuration.', 'red');
    process.exit(1);
  } else if (testResults.warnings > 0) {
    log('\n⚠️  Some warnings found. Consider addressing them for optimal performance.', 'yellow');
  } else {
    log('\n🎉 All tests passed! Your environment is properly configured.', 'green');
  }
}

// Run the tests
runTests().catch((error) => {
  log(`❌ Test execution failed: ${error.message}`, 'red');
  process.exit(1);
});
