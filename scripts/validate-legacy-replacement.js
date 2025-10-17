#!/usr/bin/env node

/**
 * Legacy Validation Script Replacement
 * 
 * This script replaces the old validate-secrets.js with enhanced functionality
 * while maintaining backward compatibility.
 */

const fs = require('fs');
const path = require('path');

// Import the new comprehensive validation system
let comprehensiveValidator;
try {
  comprehensiveValidator = require('../lib/validation');
} catch (error) {
  console.log('⚠️  New validation system not available, using fallback');
}

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

// Legacy validation function (for backward compatibility)
function validateLegacySecrets() {
  log('🔍 Legacy Secrets Validation (Fallback)', 'bright');
  log('=' .repeat(50), 'blue');
  
  const requiredSecrets = {
    'EXPO_PUBLIC_SUPABASE_URL': {
      required: true,
      description: 'Supabase project URL',
      pattern: /^https:\/\/[a-zA-Z0-9\-]+\.supabase\.co$/
    },
    'EXPO_PUBLIC_SUPABASE_ANON_KEY': {
      required: true,
      description: 'Supabase anonymous key',
      minLength: 100
    },
    'SUPABASE_SERVICE_ROLE_KEY': {
      required: true,
      description: 'Supabase service role key',
      minLength: 100
    },
    'EXPO_PUBLIC_DEEPSEEK_API_KEY': {
      required: true,
      description: 'DeepSeek API key',
      minLength: 20,
      pattern: /^sk-[a-zA-Z0-9]+$/
    }
  };
  
  const optionalSecrets = {
    'DEEPSEEK_API_URL': {
      description: 'DeepSeek API endpoint',
      pattern: /^https:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/.*)?$/
    },
    'DEEPSEEK_MODEL': {
      description: 'DeepSeek model name'
    },
    'DEEPSEEK_TEMPERATURE': {
      description: 'DeepSeek temperature setting',
      pattern: /^[0-9]*\.?[0-9]+$/
    },
    'NODE_ENV': {
      description: 'Node environment',
      pattern: /^(development|production|test)$/
    },
    'PORT': {
      description: 'Server port',
      pattern: /^[0-9]+$/
    },
    'JWT_SECRET': {
      description: 'JWT signing secret',
      minLength: 32
    },
    'ENCRYPTION_KEY': {
      description: 'Data encryption key',
      minLength: 32
    }
  };
  
  let allValid = true;
  let totalErrors = 0;
  let totalWarnings = 0;
  
  // Validate required secrets
  log('\n📋 Required Secrets:', 'bright');
  Object.entries(requiredSecrets).forEach(([key, config]) => {
    const value = process.env[key];
    
    if (!value || value.trim() === '') {
      log(`  ❌ ${key}: Missing required secret`, 'red');
      allValid = false;
      totalErrors++;
    } else if (value.includes('your_') || value.includes('placeholder') || value.includes('example')) {
      log(`  ❌ ${key}: Contains placeholder text`, 'red');
      allValid = false;
      totalErrors++;
    } else {
      // Additional validation
      let isValid = true;
      
      if (config.minLength && value.length < config.minLength) {
        log(`  ❌ ${key}: Too short (minimum ${config.minLength} characters)`, 'red');
        isValid = false;
        allValid = false;
        totalErrors++;
      }
      
      if (config.pattern && !config.pattern.test(value)) {
        log(`  ❌ ${key}: Invalid format`, 'red');
        isValid = false;
        allValid = false;
        totalErrors++;
      }
      
      if (isValid) {
        log(`  ✅ ${key}: Valid`, 'green');
      }
    }
  });
  
  // Validate optional secrets
  log('\n📋 Optional Secrets:', 'bright');
  Object.entries(optionalSecrets).forEach(([key, config]) => {
    const value = process.env[key];
    
    if (!value || value.trim() === '') {
      log(`  ⚠️  ${key}: Not configured`, 'yellow');
      totalWarnings++;
    } else if (value.includes('your_') || value.includes('placeholder') || value.includes('example')) {
      log(`  ⚠️  ${key}: Contains placeholder text`, 'yellow');
      totalWarnings++;
    } else {
      // Additional validation
      let isValid = true;
      
      if (config.minLength && value.length < config.minLength) {
        log(`  ⚠️  ${key}: Too short (minimum ${config.minLength} characters)`, 'yellow');
        isValid = false;
        totalWarnings++;
      }
      
      if (config.pattern && !config.pattern.test(value)) {
        log(`  ⚠️  ${key}: Invalid format`, 'yellow');
        isValid = false;
        totalWarnings++;
      }
      
      if (isValid) {
        log(`  ✅ ${key}: Valid`, 'green');
      }
    }
  });
  
  // Summary
  log('\n📊 Validation Summary:', 'bright');
  log(`  Required secrets: ${Object.keys(requiredSecrets).length}`, 'cyan');
  log(`  Optional secrets: ${Object.keys(optionalSecrets).length}`, 'cyan');
  log(`  Total errors: ${totalErrors}`, totalErrors > 0 ? 'red' : 'green');
  log(`  Total warnings: ${totalWarnings}`, totalWarnings > 0 ? 'yellow' : 'green');
  
  if (allValid) {
    log('\n✅ All required secrets are properly configured!', 'green');
    log('🔒 Your Supabase project is ready for deployment.', 'green');
  } else {
    log('\n❌ Validation failed with errors:', 'red');
    log('💡 To fix these issues:', 'cyan');
    log('  1. Set the required secrets in your environment', 'cyan');
    log('  2. Replace placeholder values with actual configuration', 'cyan');
    log('  3. Ensure all secrets follow the correct format', 'cyan');
    log('  4. Re-run this validation script', 'cyan');
  }
  
  return allValid;
}

// Enhanced validation using new system
async function validateWithNewSystem() {
  if (!comprehensiveValidator) {
    return validateLegacySecrets();
  }
  
  try {
    log('🔍 Enhanced Validation System', 'bright');
    log('=' .repeat(50), 'blue');
    
    const results = await comprehensiveValidator.validateJamStockAnalytics({
      verbose: true
    });
    
    // Display results
    log('\n📊 Enhanced Validation Results:', 'bright');
    log(`Environment: ${results.environment.isValid ? '✅' : '❌'}`, results.environment.isValid ? 'green' : 'red');
    log(`Secrets: ${results.secrets.isValid ? '✅' : '❌'} (Score: ${results.secrets.score}/100)`, results.secrets.isValid ? 'green' : 'red');
    log(`Configuration: ${results.config.isValid ? '✅' : '❌'} (Score: ${results.config.score}/100)`, results.config.isValid ? 'green' : 'red');
    log(`Overall: ${results.overall.isValid ? '✅' : '❌'} (Score: ${results.overall.score}/100)`, results.overall.isValid ? 'green' : 'red');
    log(`Readiness: ${results.overall.readiness.toUpperCase()}`, 
        results.overall.readiness === 'ready' ? 'green' : 
        results.overall.readiness === 'needs_attention' ? 'yellow' : 'red');
    
    return results.overall.isValid;
    
  } catch (error) {
    log(`⚠️  Enhanced validation failed: ${error.message}`, 'yellow');
    log('Falling back to legacy validation...', 'cyan');
    return validateLegacySecrets();
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const useLegacy = args.includes('--legacy') || args.includes('-l');
  const useEnhanced = args.includes('--enhanced') || args.includes('-e');
  
  log('🔍 JamStockAnalytics Secrets Validation', 'bright');
  log(`Started at: ${new Date().toISOString()}`, 'cyan');
  
  let isValid = false;
  
  if (useLegacy || (!comprehensiveValidator && !useEnhanced)) {
    // Use legacy validation
    isValid = validateLegacySecrets();
  } else {
    // Use enhanced validation
    isValid = await validateWithNewSystem();
  }
  
  // Exit with appropriate code
  if (isValid) {
    log('\n🎉 Validation completed successfully!', 'green');
    process.exit(0);
  } else {
    log('\n💥 Validation failed!', 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
  });
}

// Export for use in other scripts
module.exports = {
  validateLegacySecrets,
  validateWithNewSystem,
  main
};
