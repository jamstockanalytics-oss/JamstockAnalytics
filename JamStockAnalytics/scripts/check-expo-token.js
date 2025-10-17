#!/usr/bin/env node

/**
 * EXPO_TOKEN Status Check Script
 * Validates EXPO_TOKEN and provides detailed status information
 */

const { execSync, exec } = require('child_process');
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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if EXPO_TOKEN is set
function checkTokenSet() {
  const token = process.env.EXPO_TOKEN;
  if (!token) {
    log('❌ EXPO_TOKEN is not set', 'red');
    return false;
  }
  
  log('✅ EXPO_TOKEN is set', 'green');
  log(`Token: ${token.substring(0, 10)}...${token.substring(token.length - 4)}`, 'cyan');
  return true;
}

// Validate token with Expo CLI
function validateToken() {
  try {
    log('🔍 Validating EXPO_TOKEN with Expo CLI...', 'blue');
    const result = execSync('npx expo whoami', { encoding: 'utf8', stdio: 'pipe' });
    const username = result.trim();
    log('✅ EXPO_TOKEN is valid', 'green');
    log(`Logged in as: ${username}`, 'cyan');
    return { isValid: true, username };
  } catch (error) {
    log('❌ EXPO_TOKEN is invalid', 'red');
    log(`Error: ${error.message}`, 'red');
    return { isValid: false, error: error.message };
  }
}

// Check token permissions
function checkTokenPermissions() {
  try {
    log('🔍 Checking token permissions...', 'blue');
    const result = execSync('npx expo projects:list --limit 1', { encoding: 'utf8', stdio: 'pipe' });
    log('✅ Token has required permissions', 'green');
    return true;
  } catch (error) {
    log('⚠️  Token permissions check failed', 'yellow');
    log(`Error: ${error.message}`, 'yellow');
    return false;
  }
}

// Check if token is in correct format
function validateTokenFormat(token) {
  if (!token) return false;
  
  // EXPO_TOKEN should start with 'exp_' and be 64 characters long
  const expoTokenPattern = /^exp_[a-zA-Z0-9]{60}$/;
  return expoTokenPattern.test(token);
}

// Get token information
function getTokenInfo() {
  const token = process.env.EXPO_TOKEN;
  if (!token) return null;
  
  return {
    isSet: true,
    isValidFormat: validateTokenFormat(token),
    length: token.length,
    prefix: token.substring(0, 4),
    suffix: token.substring(token.length - 4)
  };
}

// Check environment configuration
function checkEnvironment() {
  log('🔍 Checking environment configuration...', 'blue');
  
  // Check for .env file
  const envFile = path.join(process.cwd(), '.env');
  if (fs.existsSync(envFile)) {
    log('✅ .env file found', 'green');
    
    // Check if EXPO_TOKEN is in .env file
    const envContent = fs.readFileSync(envFile, 'utf8');
    if (envContent.includes('EXPO_TOKEN')) {
      log('✅ EXPO_TOKEN found in .env file', 'green');
    } else {
      log('⚠️  EXPO_TOKEN not found in .env file', 'yellow');
    }
  } else {
    log('⚠️  .env file not found', 'yellow');
  }
  
  // Check for .env.local file
  const envLocalFile = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalFile)) {
    log('✅ .env.local file found', 'green');
  }
}

// Generate token status report
function generateReport() {
  log('\n📊 EXPO_TOKEN Status Report', 'bright');
  log('============================', 'blue');
  
  const tokenInfo = getTokenInfo();
  if (!tokenInfo) {
    log('❌ EXPO_TOKEN is not set', 'red');
    log('\n💡 To fix this issue:', 'yellow');
    log('1. Set EXPO_TOKEN environment variable:', 'cyan');
    log('   export EXPO_TOKEN=your_token_here', 'cyan');
    log('2. Or add to .env file:', 'cyan');
    log('   EXPO_TOKEN=your_token_here', 'cyan');
    log('3. Or login with Expo CLI:', 'cyan');
    log('   npx expo login', 'cyan');
    return;
  }
  
  log(`Token Status: ${tokenInfo.isSet ? 'Set' : 'Not Set'}`, tokenInfo.isSet ? 'green' : 'red');
  log(`Format Valid: ${tokenInfo.isValidFormat ? 'Yes' : 'No'}`, tokenInfo.isValidFormat ? 'green' : 'red');
  log(`Token Length: ${tokenInfo.length}`, 'cyan');
  log(`Token Prefix: ${tokenInfo.prefix}`, 'cyan');
  log(`Token Suffix: ${tokenInfo.suffix}`, 'cyan');
  
  // Validate token
  const validation = validateToken();
  if (validation.isValid) {
    log(`Username: ${validation.username}`, 'green');
  } else {
    log(`Validation Error: ${validation.error}`, 'red');
  }
  
  // Check permissions
  const hasPermissions = checkTokenPermissions();
  log(`Permissions: ${hasPermissions ? 'Valid' : 'Invalid'}`, hasPermissions ? 'green' : 'red');
  
  // Check environment
  checkEnvironment();
}

// Main function
function main() {
  log('🔑 EXPO_TOKEN Status Check', 'bright');
  log('===========================', 'blue');
  
  // Check if token is set
  const tokenSet = checkTokenSet();
  if (!tokenSet) {
    log('\n💡 To set EXPO_TOKEN:', 'yellow');
    log('1. Get token from expo.dev dashboard', 'cyan');
    log('2. Set environment variable:', 'cyan');
    log('   export EXPO_TOKEN=your_token_here', 'cyan');
    log('3. Or login with Expo CLI:', 'cyan');
    log('   npx expo login', 'cyan');
    process.exit(1);
  }
  
  // Get token info
  const tokenInfo = getTokenInfo();
  if (!tokenInfo.isValidFormat) {
    log('❌ EXPO_TOKEN format is invalid', 'red');
    log('Expected format: exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'yellow');
    process.exit(1);
  }
  
  // Validate token
  const validation = validateToken();
  if (!validation.isValid) {
    log('\n💡 To fix this issue:', 'yellow');
    log('1. Check if token is correct', 'cyan');
    log('2. Login again with Expo CLI:', 'cyan');
    log('   npx expo login', 'cyan');
    log('3. Get new token from expo.dev dashboard', 'cyan');
    process.exit(1);
  }
  
  // Check permissions
  const hasPermissions = checkTokenPermissions();
  if (!hasPermissions) {
    log('\n⚠️  Token permissions check failed', 'yellow');
    log('This may not affect basic operations', 'yellow');
  }
  
  // Generate full report
  generateReport();
  
  log('\n✅ EXPO_TOKEN status check completed successfully!', 'green');
  log('🚀 Ready for deployment!', 'green');
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  log('EXPO_TOKEN Status Check Script', 'bright');
  log('==============================', 'blue');
  log('');
  log('Usage: node check-expo-token.js [options]', 'cyan');
  log('');
  log('Options:', 'yellow');
  log('  --help, -h     Show this help message', 'cyan');
  log('  --report       Generate detailed report', 'cyan');
  log('  --validate     Validate token only', 'cyan');
  log('');
  log('Examples:', 'yellow');
  log('  node check-expo-token.js', 'cyan');
  log('  node check-expo-token.js --report', 'cyan');
  log('  node check-expo-token.js --validate', 'cyan');
  process.exit(0);
}

if (args.includes('--report')) {
  generateReport();
  process.exit(0);
}

if (args.includes('--validate')) {
  const validation = validateToken();
  if (validation.isValid) {
    log('✅ EXPO_TOKEN is valid', 'green');
    process.exit(0);
  } else {
    log('❌ EXPO_TOKEN is invalid', 'red');
    process.exit(1);
  }
}

// Run main function
main();
