#!/usr/bin/env node

/**
 * Simple CI Test Script for JamStockAnalytics
 * 
 * This script performs basic tests that will work in CI environment
 * without requiring external dependencies or complex setup.
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
  cyan: '\x1b[36m'
};

// Helper function to log with colors
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test results tracking
let passed = 0;
let failed = 0;
let warnings = 0;

function addResult(name, status, message = '') {
  const statusIcon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
  
  log(`${statusIcon} ${name}${message ? ` - ${message}` : ''}`, color);
  
  if (status === 'pass') passed++;
  else if (status === 'fail') failed++;
  else if (status === 'warn') warnings++;
}

// Test 1: Check if .env file exists
function testEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const exists = fs.existsSync(envPath);
  
  if (exists) {
    addResult('Environment File', 'pass', '.env file exists');
  } else {
    addResult('Environment File', 'warn', '.env file not found (will be created)');
  }
  
  return exists;
}

// Test 2: Check package.json
function testPackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    addResult('Package.json', 'fail', 'package.json not found');
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    addResult('Package.json', 'pass', `Version: ${packageJson.version}`);
    return true;
  } catch (error) {
    addResult('Package.json', 'fail', `Invalid JSON: ${error.message}`);
    return false;
  }
}

// Test 3: Check required files
function testRequiredFiles() {
  const requiredFiles = [
    'app.json',
    'package.json'
  ];
  
  const optionalFiles = [
    'eas.json',
    'tsconfig.json',
    'babel.config.js'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      addResult(`Required File: ${file}`, 'pass', 'File exists');
    } else {
      addResult(`Required File: ${file}`, 'fail', 'File not found');
    }
  });
  
  optionalFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      addResult(`Optional File: ${file}`, 'pass', 'File exists');
    } else {
      addResult(`Optional File: ${file}`, 'warn', 'File not found');
    }
  });
}

// Test 4: Check environment variables
function testEnvironmentVariables() {
  const requiredVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const optionalVars = [
    'EXPO_PUBLIC_DEEPSEEK_API_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NODE_ENV'
  ];
  
  // Test required variables
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.includes('your_') || value.includes('_here')) {
      addResult(`Required Variable: ${varName}`, 'fail', 'Not configured or using placeholder');
    } else {
      addResult(`Required Variable: ${varName}`, 'pass', 'Properly configured');
    }
  });
  
  // Test optional variables
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.includes('your_') || value.includes('_here')) {
      addResult(`Optional Variable: ${varName}`, 'warn', 'Not configured (optional)');
    } else {
      addResult(`Optional Variable: ${varName}`, 'pass', 'Properly configured');
    }
  });
}

// Test 5: Check Node.js version
function testNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    addResult('Node.js Version', 'pass', `Version: ${nodeVersion}`);
  } else {
    addResult('Node.js Version', 'warn', `Version: ${nodeVersion} (recommend 18+)`);
  }
}

// Test 6: Check dependencies
function testDependencies() {
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    addResult('Dependencies', 'fail', 'package.json not found');
    return;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    
    const criticalDeps = [
      '@supabase/supabase-js',
      'expo',
      'react-native'
    ];
    
    criticalDeps.forEach(dep => {
      if (dependencies[dep]) {
        addResult(`Dependency: ${dep}`, 'pass', `Version: ${dependencies[dep]}`);
      } else {
        addResult(`Dependency: ${dep}`, 'fail', 'Dependency not found');
      }
    });
  } catch (error) {
    addResult('Dependencies', 'fail', `Error reading package.json: ${error.message}`);
  }
}

// Test 7: Check project structure
function testProjectStructure() {
  const requiredDirs = [
    'app',
    'components'
  ];
  
  const optionalDirs = [
    'lib',
    'scripts',
    'assets'
  ];
  
  requiredDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      addResult(`Required Directory: ${dir}`, 'pass', 'Directory exists');
    } else {
      addResult(`Required Directory: ${dir}`, 'fail', 'Directory not found');
    }
  });
  
  optionalDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      addResult(`Optional Directory: ${dir}`, 'pass', 'Directory exists');
    } else {
      addResult(`Optional Directory: ${dir}`, 'warn', 'Directory not found');
    }
  });
}

// Main test function
function runTests() {
  log('🧪 JamStockAnalytics CI Tests', 'bright');
  log('=============================', 'bright');
  
  // Run all tests
  testEnvFile();
  testPackageJson();
  testRequiredFiles();
  testEnvironmentVariables();
  testNodeVersion();
  testDependencies();
  testProjectStructure();
  
  // Display results
  log('\n📊 Test Results:', 'bright');
  log('================', 'bright');
  
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, 'red');
  log(`⚠️  Warnings: ${warnings}`, 'yellow');
  
  const totalTests = passed + failed + warnings;
  const successRate = totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) : 0;
  
  log(`\n📊 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
  
  if (failed > 0) {
    log('\n❌ Some tests failed. Please check your configuration.', 'red');
    process.exit(1);
  } else if (warnings > 0) {
    log('\n⚠️  Some warnings found. Consider addressing them for optimal performance.', 'yellow');
  } else {
    log('\n🎉 All tests passed! Your CI environment is properly configured.', 'green');
  }
}

// Run the tests
runTests();
