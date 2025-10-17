#!/usr/bin/env node

/**
 * Auto Setup Environment Script for JamStockAnalytics
 * 
 * This script creates the necessary environment files for CI/CD builds
 * with proper fallbacks and error handling.
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

// Main setup function
function setupEnvironment() {
  log('🔧 Setting up environment for CI/CD...', 'bright');
  
  try {
    // Get environment variables with fallbacks
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'test-key';
    const deepseekApiKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || 'disabled';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key';
    const nodeEnv = process.env.NODE_ENV || 'production';
    
    // Create .env file content
    const envContent = [
      `EXPO_PUBLIC_SUPABASE_URL=${supabaseUrl}`,
      `EXPO_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}`,
      `EXPO_PUBLIC_DEEPSEEK_API_KEY=${deepseekApiKey}`,
      `SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`,
      `NODE_ENV=${nodeEnv}`,
      `DEBUG_MODE=false`,
      `APP_ENV=production`
    ].join('\n');
    
    // Write .env file
    const envPath = path.join(process.cwd(), '.env');
    fs.writeFileSync(envPath, envContent, 'utf8');
    
    log('✅ Environment file created successfully', 'green');
    log(`📄 Environment file location: ${envPath}`, 'cyan');
    
    // Display environment variables (without sensitive values)
    log('\n📋 Environment Configuration:', 'bright');
    log(`  SUPABASE_URL: ${supabaseUrl}`, 'cyan');
    log(`  SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 10)}...`, 'cyan');
    log(`  DEEPSEEK_API_KEY: ${deepseekApiKey === 'disabled' ? 'disabled' : deepseekApiKey.substring(0, 10) + '...'}`, 'cyan');
    log(`  SERVICE_ROLE_KEY: ${serviceRoleKey.substring(0, 10)}...`, 'cyan');
    log(`  NODE_ENV: ${nodeEnv}`, 'cyan');
    
    // Validate environment
    log('\n🔍 Validating environment setup...', 'bright');
    
    if (supabaseUrl.includes('test.supabase.co')) {
      log('⚠️  Using test Supabase URL - configure SUPABASE_URL secret for production', 'yellow');
    } else {
      log('✅ Using production Supabase URL', 'green');
    }
    
    if (supabaseAnonKey === 'test-key') {
      log('⚠️  Using test Supabase key - configure SUPABASE_ANON_KEY secret for production', 'yellow');
    } else {
      log('✅ Using production Supabase key', 'green');
    }
    
    if (deepseekApiKey === 'disabled') {
      log('⚠️  DeepSeek API disabled - configure DEEPSEEK_API_KEY secret to enable AI features', 'yellow');
    } else {
      log('✅ DeepSeek API configured', 'green');
    }
    
    if (serviceRoleKey === 'test-service-key') {
      log('⚠️  Using test service role key - configure SUPABASE_SERVICE_ROLE_KEY secret for production', 'yellow');
    } else {
      log('✅ Using production service role key', 'green');
    }
    
    log('\n🎉 Environment setup completed successfully!', 'green');
    
  } catch (error) {
    log(`❌ Environment setup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the setup
setupEnvironment();