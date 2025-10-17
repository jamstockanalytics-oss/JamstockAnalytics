#!/usr/bin/env node

/**
 * Secrets and Environment Validation Script for JamStockAnalytics
 * 
 * This script validates all required GitHub secrets and environment variables
 * for the CI/CD workflows to function properly.
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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
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

// Test 1: Validate Core Required Secrets
function validateCoreSecrets() {
  log('\n🔐 Core Required Secrets:', 'bright');
  log('========================', 'bright');
  
  const coreSecrets = [
    {
      name: 'SUPABASE_URL',
      envVar: 'EXPO_PUBLIC_SUPABASE_URL',
      description: 'Supabase project URL',
      required: true,
      example: 'https://your-project.supabase.co'
    },
    {
      name: 'SUPABASE_ANON_KEY',
      envVar: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
      description: 'Supabase anonymous key',
      required: true,
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  ];
  
  coreSecrets.forEach(secret => {
    const value = process.env[secret.envVar] || process.env[secret.name];
    if (!value || value.includes('your_') || value.includes('_here') || value === '') {
      addResult(`Core Secret: ${secret.name}`, 'fail', `Missing or invalid - ${secret.description}`);
      log(`   💡 Example: ${secret.example}`, 'cyan');
    } else {
      addResult(`Core Secret: ${secret.name}`, 'pass', `${secret.description} configured`);
    }
  });
}

// Test 2: Validate Optional Secrets
function validateOptionalSecrets() {
  log('\n🔧 Optional Secrets:', 'bright');
  log('====================', 'bright');
  
  const optionalSecrets = [
    {
      name: 'DEEPSEEK_API_KEY',
      envVar: 'EXPO_PUBLIC_DEEPSEEK_API_KEY',
      description: 'DeepSeek AI API key for AI features',
      example: 'sk-...'
    },
    {
      name: 'EXPO_TOKEN',
      envVar: 'EXPO_TOKEN',
      description: 'Expo authentication token for EAS builds',
      example: 'exp_...'
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      envVar: 'SUPABASE_SERVICE_ROLE_KEY',
      description: 'Supabase service role key for database operations',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    },
    {
      name: 'GCP_SA_KEY',
      envVar: 'GCP_SA_KEY',
      description: 'Google Cloud Platform service account key',
      example: '{"type": "service_account", "project_id": "..."}'
    }
  ];
  
  optionalSecrets.forEach(secret => {
    const value = process.env[secret.envVar] || process.env[secret.name];
    if (!value || value.includes('your_') || value.includes('_here') || value === '') {
      addResult(`Optional Secret: ${secret.name}`, 'warn', `Not configured - ${secret.description}`);
      log(`   💡 Example: ${secret.example}`, 'cyan');
    } else {
      addResult(`Optional Secret: ${secret.name}`, 'pass', `${secret.description} configured`);
    }
  });
}

// Test 3: Validate Environment File
function validateEnvironmentFile() {
  log('\n📄 Environment File:', 'bright');
  log('===================', 'bright');
  
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    addResult('Environment File', 'warn', '.env file not found');
    log('   💡 Run: npm run setup:env to create environment file', 'cyan');
    return false;
  }
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    addResult('Environment File', 'pass', `.env file exists with ${envLines.length} variables`);
    
    // Check for required variables in .env
    const requiredEnvVars = [
      'EXPO_PUBLIC_SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY'
    ];
    
    requiredEnvVars.forEach(varName => {
      if (envContent.includes(varName)) {
        addResult(`Environment Variable: ${varName}`, 'pass', 'Found in .env file');
      } else {
        addResult(`Environment Variable: ${varName}`, 'warn', 'Not found in .env file');
      }
    });
    
    return true;
  } catch (error) {
    addResult('Environment File', 'fail', `Error reading .env file: ${error.message}`);
    return false;
  }
}

// Test 4: Validate GitHub Secrets Format
function validateSecretFormats() {
  log('\n🔍 Secret Format Validation:', 'bright');
  log('============================', 'bright');
  
  // Check Supabase URL format
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (supabaseUrl && supabaseUrl !== '') {
    if (supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')) {
      addResult('Supabase URL Format', 'pass', 'Valid Supabase URL format');
    } else {
      addResult('Supabase URL Format', 'fail', 'Invalid Supabase URL format');
      log('   💡 Should be: https://your-project.supabase.co', 'cyan');
    }
  }
  
  // Check Supabase Anon Key format
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (supabaseAnonKey && supabaseAnonKey !== '') {
    if (supabaseAnonKey.startsWith('eyJ') && supabaseAnonKey.length > 100) {
      addResult('Supabase Anon Key Format', 'pass', 'Valid JWT token format');
    } else {
      addResult('Supabase Anon Key Format', 'fail', 'Invalid JWT token format');
      log('   💡 Should be a JWT token starting with "eyJ"', 'cyan');
    }
  }
  
  // Check DeepSeek API Key format
  const deepseekKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (deepseekKey && deepseekKey !== '' && deepseekKey !== 'disabled') {
    if (deepseekKey.startsWith('sk-')) {
      addResult('DeepSeek API Key Format', 'pass', 'Valid API key format');
    } else {
      addResult('DeepSeek API Key Format', 'warn', 'Invalid API key format');
      log('   💡 Should start with "sk-"', 'cyan');
    }
  }
  
  // Check Expo Token format
  const expoToken = process.env.EXPO_TOKEN;
  if (expoToken && expoToken !== '') {
    if (expoToken.startsWith('exp_') || expoToken.startsWith('exp-')) {
      addResult('Expo Token Format', 'pass', 'Valid Expo token format');
    } else {
      addResult('Expo Token Format', 'warn', 'Invalid Expo token format');
      log('   💡 Should start with "exp_" or "exp-"', 'cyan');
    }
  }
}

// Test 5: Validate Workflow Dependencies
function validateWorkflowDependencies() {
  log('\n⚙️  Workflow Dependencies:', 'bright');
  log('==========================', 'bright');
  
  // Check if required files exist
  const requiredFiles = [
    'package.json',
    'app.json',
    '.github/workflows/automated-build-with-gcp.yml'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      addResult(`Required File: ${file}`, 'pass', 'File exists');
    } else {
      addResult(`Required File: ${file}`, 'fail', 'File not found');
    }
  });
  
  // Check if scripts exist
  const requiredScripts = [
    'scripts/auto-setup-env.js',
    'scripts/ci-test.js',
    'scripts/ci-test-lenient.js'
  ];
  
  requiredScripts.forEach(script => {
    const scriptPath = path.join(process.cwd(), script);
    if (fs.existsSync(scriptPath)) {
      addResult(`Required Script: ${script}`, 'pass', 'Script exists');
    } else {
      addResult(`Required Script: ${script}`, 'fail', 'Script not found');
    }
  });
}

// Test 6: Generate Setup Instructions
function generateSetupInstructions() {
  log('\n📋 Setup Instructions:', 'bright');
  log('======================', 'bright');
  
  const missingSecrets = [];
  const missingOptional = [];
  
  // Check core secrets
  if (!process.env.EXPO_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) {
    missingSecrets.push('SUPABASE_URL');
  }
  if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY && !process.env.SUPABASE_ANON_KEY) {
    missingSecrets.push('SUPABASE_ANON_KEY');
  }
  
  // Check optional secrets
  if (!process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY && !process.env.DEEPSEEK_API_KEY) {
    missingOptional.push('DEEPSEEK_API_KEY');
  }
  if (!process.env.EXPO_TOKEN) {
    missingOptional.push('EXPO_TOKEN');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missingOptional.push('SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!process.env.GCP_SA_KEY) {
    missingOptional.push('GCP_SA_KEY');
  }
  
  if (missingSecrets.length > 0) {
    log('\n❌ Missing Required Secrets:', 'red');
    missingSecrets.forEach(secret => {
      log(`   • ${secret}`, 'red');
    });
    log('\n💡 To add secrets:', 'yellow');
    log('   1. Go to your GitHub repository', 'cyan');
    log('   2. Click Settings → Secrets and variables → Actions', 'cyan');
    log('   3. Click "New repository secret"', 'cyan');
    log('   4. Add each missing secret', 'cyan');
  }
  
  if (missingOptional.length > 0) {
    log('\n⚠️  Missing Optional Secrets:', 'yellow');
    missingOptional.forEach(secret => {
      log(`   • ${secret}`, 'yellow');
    });
    log('\n💡 Optional secrets enable additional features:', 'cyan');
    log('   • DEEPSEEK_API_KEY: Enables AI features', 'cyan');
    log('   • EXPO_TOKEN: Enables EAS builds', 'cyan');
    log('   • SUPABASE_SERVICE_ROLE_KEY: Enables database operations', 'cyan');
    log('   • GCP_SA_KEY: Enables Google Cloud operations', 'cyan');
  }
  
  if (missingSecrets.length === 0 && missingOptional.length === 0) {
    log('\n🎉 All secrets are configured!', 'green');
  }
}

// Main validation function
function runValidation() {
  log('🔐 JamStockAnalytics Secrets & Environment Validation', 'bright');
  log('======================================================', 'bright');
  
  // Run all validation tests
  validateCoreSecrets();
  validateOptionalSecrets();
  validateEnvironmentFile();
  validateSecretFormats();
  validateWorkflowDependencies();
  
  // Display results
  log('\n📊 Validation Results:', 'bright');
  log('======================', 'bright');
  
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, 'red');
  log(`⚠️  Warnings: ${warnings}`, 'yellow');
  
  const totalTests = passed + failed + warnings;
  const successRate = totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) : 0;
  
  log(`\n📊 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
  
  // Generate setup instructions
  generateSetupInstructions();
  
  // Exit with appropriate code
  if (failed > 0) {
    log('\n❌ Validation failed. Please configure missing secrets.', 'red');
    process.exit(1);
  } else if (warnings > 0) {
    log('\n⚠️  Validation completed with warnings.', 'yellow');
    process.exit(0);
  } else {
    log('\n🎉 All validations passed! Your environment is properly configured.', 'green');
    process.exit(0);
  }
}

// Run the validation
runValidation();
