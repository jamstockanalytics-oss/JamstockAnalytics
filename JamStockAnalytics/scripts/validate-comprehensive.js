#!/usr/bin/env node

/**
 * Comprehensive Validation Script
 * Complete validation system for JamStockAnalytics
 * 
 * Features:
 * - Environment validation
 * - Secrets security validation
 * - Configuration validation
 * - Integration testing
 * - Deployment readiness assessment
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

// Validation results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let warnings = 0;

function addTestResult(name, status, message = '', details = '') {
  const statusIcon = status === 'pass' ? '✅' : status === 'warn' ? '⚠️' : '❌';
  const color = status === 'pass' ? 'green' : status === 'warn' ? 'yellow' : 'red';
  
  log(`${statusIcon} ${name}${message ? ` - ${message}` : ''}`, color);
  if (details) {
    log(`    ${details}`, 'cyan');
  }
  
  totalTests++;
  if (status === 'pass') passedTests++;
  else if (status === 'warn') warnings++;
  else failedTests++;
}

// Environment validation
function validateEnvironment() {
  log('\n🌍 Environment Validation', 'bright');
  log('=' .repeat(40), 'blue');
  
  const requiredEnvVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'EXPO_PUBLIC_DEEPSEEK_API_KEY'
  ];
  
  const optionalEnvVars = [
    'DEEPSEEK_API_URL',
    'DEEPSEEK_MODEL',
    'DEEPSEEK_TEMPERATURE',
    'NODE_ENV',
    'PORT',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'RATE_LIMIT',
    'WINDOW_MS',
    'MAX_MESSAGES',
    'CLEANUP_DAYS',
    'SUPABASE_DB_URL',
    'EXPO_TOKEN',
    'GCP_SA_KEY'
  ];
  
  let envValid = true;
  
  // Check required environment variables
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (!value || value.trim() === '') {
      addTestResult(`Required: ${envVar}`, 'fail', 'Missing required environment variable');
      envValid = false;
    } else if (value.includes('your_') || value.includes('placeholder') || value.includes('example')) {
      addTestResult(`Required: ${envVar}`, 'fail', 'Contains placeholder text');
      envValid = false;
    } else {
      addTestResult(`Required: ${envVar}`, 'pass', 'Configured');
    }
  });
  
  // Check optional environment variables
  optionalEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (!value || value.trim() === '') {
      addTestResult(`Optional: ${envVar}`, 'warn', 'Not configured');
    } else if (value.includes('your_') || value.includes('placeholder') || value.includes('example')) {
      addTestResult(`Optional: ${envVar}`, 'warn', 'Contains placeholder text');
    } else {
      addTestResult(`Optional: ${envVar}`, 'pass', 'Configured');
    }
  });
  
  // Validate specific formats
  validateEnvironmentFormats();
  
  return envValid;
}

function validateEnvironmentFormats() {
  // Validate Supabase URL format
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    const urlPattern = /^https:\/\/[a-zA-Z0-9\-]+\.supabase\.co$/;
    if (urlPattern.test(supabaseUrl)) {
      addTestResult('Supabase URL Format', 'pass', 'Valid format');
    } else {
      addTestResult('Supabase URL Format', 'fail', 'Invalid format');
    }
  }
  
  // Validate JWT token format
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (anonKey) {
    const jwtPattern = /^eyJ[A-Za-z0-9+/=]+\.eyJ[A-Za-z0-9+/=]+\.?[A-Za-z0-9+/=]*$/;
    if (jwtPattern.test(anonKey)) {
      addTestResult('Supabase Anon Key Format', 'pass', 'Valid JWT format');
    } else {
      addTestResult('Supabase Anon Key Format', 'fail', 'Invalid JWT format');
    }
  }
  
  // Validate DeepSeek API key format
  const deepseekKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
  if (deepseekKey) {
    const apiKeyPattern = /^sk-[a-zA-Z0-9]{20,}$/;
    if (apiKeyPattern.test(deepseekKey)) {
      addTestResult('DeepSeek API Key Format', 'pass', 'Valid API key format');
    } else {
      addTestResult('DeepSeek API Key Format', 'fail', 'Invalid API key format');
    }
  }
}

// Secrets validation
function validateSecrets() {
  log('\n🔒 Secrets Security Validation', 'bright');
  log('=' .repeat(40), 'blue');
  
  const secrets = {
    'EXPO_PUBLIC_SUPABASE_URL': {
      type: 'url',
      required: true,
      pattern: /^https:\/\/[a-zA-Z0-9\-]+\.supabase\.co$/,
      securityLevel: 'medium'
    },
    'EXPO_PUBLIC_SUPABASE_ANON_KEY': {
      type: 'jwt',
      required: true,
      minLength: 100,
      pattern: /^eyJ[A-Za-z0-9+/=]+\.eyJ[A-Za-z0-9+/=]+\.?[A-Za-z0-9+/=]*$/,
      securityLevel: 'high'
    },
    'SUPABASE_SERVICE_ROLE_KEY': {
      type: 'jwt',
      required: true,
      minLength: 100,
      pattern: /^eyJ[A-Za-z0-9+/=]+\.eyJ[A-Za-z0-9+/=]+\.?[A-Za-z0-9+/=]*$/,
      securityLevel: 'critical'
    },
    'EXPO_PUBLIC_DEEPSEEK_API_KEY': {
      type: 'api_key',
      required: true,
      minLength: 20,
      pattern: /^sk-[a-zA-Z0-9]{20,}$/,
      securityLevel: 'high'
    }
  };
  
  let secretsValid = true;
  let securityScore = 0;
  const maxScore = Object.keys(secrets).length * 25; // 25 points per secret
  
  Object.entries(secrets).forEach(([key, config]) => {
    const value = process.env[key];
    let score = 0;
    
    if (!value || value.trim() === '') {
      if (config.required) {
        addTestResult(`Secret: ${key}`, 'fail', 'Missing required secret');
        secretsValid = false;
      } else {
        addTestResult(`Secret: ${key}`, 'warn', 'Optional secret not set');
        score = 10; // Partial points for optional
      }
    } else if (value.includes('your_') || value.includes('placeholder') || value.includes('example')) {
      addTestResult(`Secret: ${key}`, 'fail', 'Contains placeholder text');
      secretsValid = false;
    } else {
      // Validate length
      if (config.minLength && value.length < config.minLength) {
        addTestResult(`Secret: ${key}`, 'fail', `Too short (minimum ${config.minLength} characters)`);
        secretsValid = false;
      } else {
        score += 10; // Length points
      }
      
      // Validate pattern
      if (config.pattern && !config.pattern.test(value)) {
        addTestResult(`Secret: ${key}`, 'fail', 'Invalid format');
        secretsValid = false;
      } else {
        score += 15; // Format points
      }
      
      if (score > 0) {
        addTestResult(`Secret: ${key}`, 'pass', `Valid (${config.securityLevel} security)`);
      }
    }
    
    securityScore += score;
  });
  
  const finalScore = Math.round((securityScore / maxScore) * 100);
  log(`\nSecurity Score: ${finalScore}/100`, finalScore >= 80 ? 'green' : finalScore >= 60 ? 'yellow' : 'red');
  
  return secretsValid;
}

// Configuration validation
function validateConfiguration() {
  log('\n⚙️ Configuration Validation', 'bright');
  log('=' .repeat(40), 'blue');
  
  // Check package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      addTestResult('Package.json', 'pass', 'Valid JSON format');
      
      // Check required dependencies
      const requiredDeps = [
        '@supabase/supabase-js',
        'expo',
        'react',
        'react-native'
      ];
      
      requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          addTestResult(`Dependency: ${dep}`, 'pass', `Version ${packageJson.dependencies[dep]}`);
        } else {
          addTestResult(`Dependency: ${dep}`, 'fail', 'Missing required dependency');
        }
      });
      
    } catch (error) {
      addTestResult('Package.json', 'fail', 'Invalid JSON format');
    }
  } else {
    addTestResult('Package.json', 'fail', 'File not found');
  }
  
  // Check app.json
  const appJsonPath = path.join(process.cwd(), 'app.json');
  if (fs.existsSync(appJsonPath)) {
    try {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      addTestResult('App.json', 'pass', 'Valid JSON format');
      
      if (appJson.expo && appJson.expo.name) {
        addTestResult('App Name', 'pass', appJson.expo.name);
      } else {
        addTestResult('App Name', 'warn', 'Not configured');
      }
      
    } catch (error) {
      addTestResult('App.json', 'fail', 'Invalid JSON format');
    }
  } else {
    addTestResult('App.json', 'warn', 'File not found');
  }
  
  // Check TypeScript configuration
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (fs.existsSync(tsConfigPath)) {
    addTestResult('TypeScript Config', 'pass', 'Found');
  } else {
    addTestResult('TypeScript Config', 'warn', 'Not found');
  }
  
  return true;
}

// Integration validation
function validateIntegration() {
  log('\n🔗 Integration Validation', 'bright');
  log('=' .repeat(40), 'blue');
  
  // Check if Supabase client can be created
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      addTestResult('Supabase Client', 'pass', 'Can create client');
    } else {
      addTestResult('Supabase Client', 'fail', 'Missing Supabase configuration');
    }
  } catch (error) {
    addTestResult('Supabase Client', 'fail', 'Cannot create client');
  }
  
  // Check if DeepSeek API key is valid format
  const deepseekKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
  if (deepseekKey && deepseekKey.startsWith('sk-') && deepseekKey.length >= 20) {
    addTestResult('DeepSeek API Key', 'pass', 'Valid format');
  } else {
    addTestResult('DeepSeek API Key', 'fail', 'Invalid format or missing');
  }
  
  // Check environment file
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    addTestResult('Environment File', 'pass', 'Found .env file');
  } else {
    addTestResult('Environment File', 'warn', 'No .env file found');
  }
  
  return true;
}

// File structure validation
function validateFileStructure() {
  log('\n📁 File Structure Validation', 'bright');
  log('=' .repeat(40), 'blue');
  
  const requiredFiles = [
    'package.json',
    'app.json',
    'tsconfig.json'
  ];
  
  const requiredDirs = [
    'lib',
    'components',
    'app'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      addTestResult(`File: ${file}`, 'pass', 'Found');
    } else {
      addTestResult(`File: ${file}`, 'fail', 'Missing required file');
    }
  });
  
  requiredDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      addTestResult(`Directory: ${dir}`, 'pass', 'Found');
    } else {
      addTestResult(`Directory: ${dir}`, 'fail', 'Missing required directory');
    }
  });
  
  return true;
}

// Main validation function
function runComprehensiveValidation() {
  log('🔍 JamStockAnalytics Comprehensive Validation', 'bright');
  log('=' .repeat(60), 'magenta');
  log(`Started at: ${new Date().toISOString()}`, 'cyan');
  
  const startTime = Date.now();
  
  // Run all validations
  const envValid = validateEnvironment();
  const secretsValid = validateSecrets();
  const configValid = validateConfiguration();
  const integrationValid = validateIntegration();
  const structureValid = validateFileStructure();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Summary
  log('\n📊 Validation Summary', 'bright');
  log('=' .repeat(40), 'blue');
  
  const overallValid = envValid && secretsValid && configValid && integrationValid && structureValid;
  const successRate = Math.round((passedTests / totalTests) * 100);
  
  log(`Total Tests: ${totalTests}`, 'cyan');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${failedTests}`, 'red');
  log(`Warnings: ${warnings}`, 'yellow');
  log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red');
  log(`Duration: ${duration}ms`, 'cyan');
  
  // Deployment readiness
  log('\n🚀 Deployment Readiness', 'bright');
  log('=' .repeat(40), 'blue');
  
  if (overallValid && failedTests === 0) {
    log('✅ READY FOR DEPLOYMENT', 'green');
    log('All validations passed successfully!', 'green');
  } else if (failedTests === 0 && warnings > 0) {
    log('⚠️  READY WITH WARNINGS', 'yellow');
    log('Deployment ready but review warnings', 'yellow');
  } else {
    log('❌ NOT READY FOR DEPLOYMENT', 'red');
    log('Please fix errors before deploying', 'red');
  }
  
  // Recommendations
  if (warnings > 0 || failedTests > 0) {
    log('\n💡 Recommendations', 'bright');
    log('=' .repeat(40), 'blue');
    
    if (failedTests > 0) {
      log('• Fix all failed tests before deployment', 'red');
    }
    
    if (warnings > 0) {
      log('• Review warnings and consider improvements', 'yellow');
    }
    
    log('• Ensure all environment variables are properly configured', 'cyan');
    log('• Verify all secrets are secure and not placeholder values', 'cyan');
    log('• Test all integrations before production deployment', 'cyan');
  }
  
  // Exit with appropriate code
  if (overallValid && failedTests === 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  runComprehensiveValidation();
}

module.exports = {
  runComprehensiveValidation,
  validateEnvironment,
  validateSecrets,
  validateConfiguration,
  validateIntegration,
  validateFileStructure
};
