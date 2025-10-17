#!/usr/bin/env node

/**
 * Environment Setup Script for JamStockAnalytics
 * 
 * This script helps you set up all the necessary environment variables
 * for your JamStockAnalytics application.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Helper function to ask for sensitive input
function askSensitiveQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, { hideEchoBack: true }, resolve);
  });
}

// Helper function to log with colors
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Generate secure random string
function generateSecureString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Check if .env file exists
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  return fs.existsSync(envPath);
}

// Create .env file from template
function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const templatePath = path.join(process.cwd(), 'env.example');
  
  if (fs.existsSync(templatePath)) {
    fs.copyFileSync(templatePath, envPath);
    log('✅ Created .env file from template', 'green');
    return true;
  } else {
    // Create basic .env file
    const basicEnv = `# JamStockAnalytics Environment Variables
# Generated on ${new Date().toISOString()}

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# DeepSeek AI Configuration
EXPO_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Security Configuration
JWT_SECRET=${generateSecureString(32)}
SESSION_SECRET=${generateSecureString(32)}

# Development Configuration
NODE_ENV=development
DEBUG_MODE=true
APP_ENV=development
`;
    
    fs.writeFileSync(envPath, basicEnv);
    log('✅ Created basic .env file', 'green');
    return true;
  }
}

// Update environment variable in .env file
function updateEnvVariable(key, value) {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found', 'red');
    return false;
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if variable exists
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(envContent)) {
    // Update existing variable
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    // Add new variable
    envContent += `\n${key}=${value}`;
  }
  
  fs.writeFileSync(envPath, envContent);
  return true;
}

// Validate Supabase configuration
async function validateSupabaseConfig() {
  log('\n🔍 Validating Supabase configuration...', 'blue');
  
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
    log('❌ Supabase URL not configured', 'red');
    return false;
  }
  
  if (!supabaseAnonKey || supabaseAnonKey.includes('your_supabase')) {
    log('❌ Supabase Anon Key not configured', 'red');
    return false;
  }
  
  if (!supabaseServiceKey || supabaseServiceKey.includes('your_supabase')) {
    log('❌ Supabase Service Role Key not configured', 'red');
    return false;
  }
  
  log('✅ Supabase configuration looks good', 'green');
  return true;
}

// Validate DeepSeek configuration
async function validateDeepSeekConfig() {
  log('\n🔍 Validating DeepSeek configuration...', 'blue');
  
  const deepseekKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
  
  if (!deepseekKey || deepseekKey.includes('your_deepseek')) {
    log('❌ DeepSeek API Key not configured', 'red');
    return false;
  }
  
  // Check if key starts with 'sk-'
  if (!deepseekKey.startsWith('sk-')) {
    log('⚠️  DeepSeek API key should start with "sk-"', 'yellow');
  }
  
  log('✅ DeepSeek configuration looks good', 'green');
  return true;
}

// Test database connection
async function testDatabaseConnection() {
  log('\n🔍 Testing database connection...', 'blue');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      log('❌ Supabase configuration missing', 'red');
      return false;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      log(`❌ Database connection failed: ${error.message}`, 'red');
      return false;
    }
    
    log('✅ Database connection successful', 'green');
    return true;
  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, 'red');
    return false;
  }
}

// Test DeepSeek API connection
async function testDeepSeekConnection() {
  log('\n🔍 Testing DeepSeek API connection...', 'blue');
  
  try {
    const axios = require('axios');
    
    const apiKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      log('❌ DeepSeek API key not configured', 'red');
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
      log('✅ DeepSeek API connection successful', 'green');
      return true;
    } else {
      log(`❌ DeepSeek API returned status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    if (error.response) {
      log(`❌ DeepSeek API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`, 'red');
    } else {
      log(`❌ DeepSeek API connection failed: ${error.message}`, 'red');
    }
    return false;
  }
}

// Main setup function
async function main() {
  log('🚀 JamStockAnalytics Environment Setup', 'bright');
  log('=====================================', 'bright');
  
  // Check if .env file exists
  if (!checkEnvFile()) {
    log('\n📝 Creating .env file...', 'blue');
    createEnvFile();
  } else {
    log('\n✅ .env file already exists', 'green');
  }
  
  // Load environment variables
  require('dotenv').config();
  
  log('\n📋 Environment Setup Checklist:', 'bright');
  log('================================', 'bright');
  
  // Check Supabase configuration
  const supabaseConfigured = await validateSupabaseConfig();
  
  // Check DeepSeek configuration
  const deepseekConfigured = await validateDeepSeekConfig();
  
  // Test connections if configured
  if (supabaseConfigured) {
    await testDatabaseConnection();
  }
  
  if (deepseekConfigured) {
    await testDeepSeekConnection();
  }
  
  // Interactive setup for missing configurations
  if (!supabaseConfigured || !deepseekConfigured) {
    log('\n🔧 Interactive Setup', 'bright');
    log('===================', 'bright');
    
    if (!supabaseConfigured) {
      log('\n📝 Supabase Configuration:', 'blue');
      log('Get your keys from: https://supabase.com/dashboard', 'cyan');
      
      const supabaseUrl = await askQuestion('Enter your Supabase URL: ');
      const supabaseAnonKey = await askQuestion('Enter your Supabase Anon Key: ');
      const supabaseServiceKey = await askSensitiveQuestion('Enter your Supabase Service Role Key: ');
      
      if (supabaseUrl && supabaseAnonKey && supabaseServiceKey) {
        updateEnvVariable('EXPO_PUBLIC_SUPABASE_URL', supabaseUrl);
        updateEnvVariable('EXPO_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey);
        updateEnvVariable('SUPABASE_SERVICE_ROLE_KEY', supabaseServiceKey);
        log('✅ Supabase configuration saved', 'green');
      }
    }
    
    if (!deepseekConfigured) {
      log('\n📝 DeepSeek Configuration:', 'blue');
      log('Get your API key from: https://platform.deepseek.com/api-keys', 'cyan');
      
      const deepseekKey = await askSensitiveQuestion('Enter your DeepSeek API Key: ');
      
      if (deepseekKey) {
        updateEnvVariable('EXPO_PUBLIC_DEEPSEEK_API_KEY', deepseekKey);
        log('✅ DeepSeek configuration saved', 'green');
      }
    }
    
    // Reload environment variables
    require('dotenv').config();
  }
  
  // Final validation
  log('\n🔍 Final Validation:', 'bright');
  log('===================', 'bright');
  
  const finalSupabaseCheck = await validateSupabaseConfig();
  const finalDeepseekCheck = await validateDeepSeekConfig();
  
  if (finalSupabaseCheck && finalDeepseekCheck) {
    log('\n🎉 Environment setup complete!', 'green');
    log('You can now run your application with: npm start', 'cyan');
  } else {
    log('\n⚠️  Some configurations are still missing', 'yellow');
    log('Please check the ENVIRONMENT_SETUP_GUIDE.md for detailed instructions', 'cyan');
  }
  
  rl.close();
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});

// Run the setup
main().catch((error) => {
  log(`❌ Setup failed: ${error.message}`, 'red');
  process.exit(1);
});