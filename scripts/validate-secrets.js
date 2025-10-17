#!/usr/bin/env node

/**
 * Supabase Secrets Validation Script
 * Validates that all required secrets are properly configured
 */

const fs = require('fs');
const path = require('path');

// Required secrets configuration
const REQUIRED_SECRETS = {
  SUPABASE_HOST: {
    required: true,
    description: 'Supabase host URL',
    pattern: /^https?:\/\/.+/,
    example: 'https://your-project-ref.supabase.co'
  },
  SUPABASE_PASSWORD: {
    required: true,
    description: 'Supabase database password',
    minLength: 8,
    example: 'your-secure-password'
  },
  LOCATION: {
    required: true,
    description: 'Deployment location',
    pattern: /^[a-zA-Z0-9\-_]+$/,
    example: 'us-east-1'
  }
};

// Optional secrets that enhance functionality
const OPTIONAL_SECRETS = {
  SUPABASE_URL: {
    description: 'Supabase project URL',
    pattern: /^https:\/\/[a-zA-Z0-9\-]+\.supabase\.co$/,
    example: 'https://your-project-ref.supabase.co'
  },
  SUPABASE_ANON_KEY: {
    description: 'Supabase anonymous key',
    minLength: 100,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    description: 'Supabase service role key',
    minLength: 100,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  DEEPSEEK_API_KEY: {
    description: 'DeepSeek API key for AI features',
    minLength: 20,
    example: 'sk-your-deepseek-api-key'
  },
  EXPO_TOKEN: {
    description: 'Expo token for builds',
    minLength: 20,
    example: 'your-expo-token'
  }
};

/**
 * Validate a single secret
 */
function validateSecret(key, value, config) {
  const errors = [];
  const warnings = [];

  if (!value) {
    if (config.required) {
      errors.push(`${key} is required but not set`);
    } else {
      warnings.push(`${key} is optional and not set`);
    }
    return { errors, warnings };
  }

  // Check minimum length
  if (config.minLength && value.length < config.minLength) {
    errors.push(`${key} is too short (minimum ${config.minLength} characters)`);
  }

  // Check pattern
  if (config.pattern && !config.pattern.test(value)) {
    errors.push(`${key} does not match expected format`);
  }

  // Check for placeholder values
  if (value.includes('your-') || value.includes('placeholder')) {
    errors.push(`${key} appears to contain placeholder text`);
  }

  return { errors, warnings };
}

/**
 * Main validation function
 */
function validateSecrets() {
  console.log('🔍 Validating Supabase Secrets...\n');

  const allErrors = [];
  const allWarnings = [];
  const results = {};

  // Validate required secrets
  console.log('📋 Checking required secrets:');
  for (const [key, config] of Object.entries(REQUIRED_SECRETS)) {
    const value = process.env[key];
    const { errors, warnings } = validateSecret(key, value, config);
    
    allErrors.push(...errors);
    allWarnings.push(...warnings);
    
    results[key] = {
      status: errors.length > 0 ? 'FAIL' : 'PASS',
      errors,
      warnings
    };

    console.log(`  ${key}: ${results[key].status}`);
    if (errors.length > 0) {
      errors.forEach(error => console.log(`    ❌ ${error}`));
    }
    if (warnings.length > 0) {
      warnings.forEach(warning => console.log(`    ⚠️  ${warning}`));
    }
  }

  console.log('\n📋 Checking optional secrets:');
  for (const [key, config] of Object.entries(OPTIONAL_SECRETS)) {
    const value = process.env[key];
    const { errors, warnings } = validateSecret(key, value, config);
    
    allWarnings.push(...warnings);
    
    results[key] = {
      status: errors.length > 0 ? 'WARN' : (value ? 'PASS' : 'SKIP'),
      errors,
      warnings
    };

    console.log(`  ${key}: ${results[key].status}`);
    if (errors.length > 0) {
      errors.forEach(error => console.log(`    ❌ ${error}`));
    }
    if (warnings.length > 0) {
      warnings.forEach(warning => console.log(`    ⚠️  ${warning}`));
    }
  }

  // Summary
  console.log('\n📊 Validation Summary:');
  console.log(`  Required secrets: ${Object.values(results).filter(r => r.status === 'PASS').length}/${Object.keys(REQUIRED_SECRETS).length} passed`);
  console.log(`  Optional secrets: ${Object.values(results).filter(r => r.status === 'PASS').length}/${Object.keys(OPTIONAL_SECRETS).length} configured`);
  console.log(`  Total errors: ${allErrors.length}`);
  console.log(`  Total warnings: ${allWarnings.length}`);

  // Check for critical issues
  if (allErrors.length > 0) {
    console.log('\n❌ Validation failed with errors:');
    allErrors.forEach(error => console.log(`  - ${error}`));
    console.log('\n💡 To fix these issues:');
    console.log('  1. Set the required secrets in GitHub repository settings');
    console.log('  2. Go to Settings → Secrets and variables → Actions');
    console.log('  3. Add the missing secrets with their values');
    console.log('  4. Re-run this workflow');
    process.exit(1);
  }

  if (allWarnings.length > 0) {
    console.log('\n⚠️  Validation completed with warnings:');
    allWarnings.forEach(warning => console.log(`  - ${warning}`));
  }

  console.log('\n✅ All required secrets are properly configured!');
  console.log('🔒 Your Supabase project is ready for deployment.');
}

/**
 * Test connection to Supabase (if possible)
 */
async function testConnection() {
  const supabaseHost = process.env.SUPABASE_HOST;
  
  if (!supabaseHost) {
    console.log('⚠️  Cannot test connection: SUPABASE_HOST not set');
    return;
  }

  console.log('\n🔗 Testing connection to Supabase...');
  
  try {
    const https = require('https');
    const url = require('url');
    
    const parsedUrl = url.parse(supabaseHost);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        resolve({ statusCode: res.statusCode, headers: res.headers });
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Connection timeout')));
      req.setTimeout(5000);
      req.end();
    });

    if (response.statusCode === 200) {
      console.log('✅ Supabase connection successful');
    } else {
      console.log(`⚠️  Supabase responded with status ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`⚠️  Could not test connection: ${error.message}`);
    console.log('   This is normal if the health endpoint is not available');
  }
}

// Run validation
if (require.main === module) {
  validateSecrets();
  
  // Test connection if in CI environment
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    testConnection().catch(console.error);
  }
}

module.exports = { validateSecrets, testConnection };