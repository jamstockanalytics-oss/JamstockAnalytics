#!/usr/bin/env node

/**
 * =============================================
 * GCP SERVICE ACCOUNT KEY VALIDATION (NODE.JS)
 * =============================================
 * Node.js-based validation for GCP service account keys
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateGCPKey(keyPath) {
  log('🔍 GCP Service Account Key Validation (Node.js)', 'cyan');
  log('===============================================', 'cyan');
  console.log('');

  // Check if key file exists
  if (!fs.existsSync(keyPath)) {
    log('❌ GCP service account key file not found', 'red');
    log(`💡 Expected file: ${keyPath}`, 'yellow');
    log('💡 Please download your service account key first:', 'yellow');
    log('   1. Go to Google Cloud Console', 'yellow');
    log('   2. Navigate to IAM & Admin → Service Accounts', 'yellow');
    log('   3. Create or select a service account', 'yellow');
    log('   4. Generate a new JSON key', 'yellow');
    log('   5. Save as "github-actions-key.json" in this directory', 'yellow');
    process.exit(1);
  }

  log('📋 Validating GCP service account key...', 'blue');

  try {
    // Read and parse the key file
    const keyContent = fs.readFileSync(keyPath, 'utf8');
    const keyData = JSON.parse(keyContent);

    log('🔍 Testing JSON structure...', 'blue');
    log('✅ JSON structure is valid', 'green');

    // Validate required fields
    log('🔍 Checking required fields...', 'blue');

    // Check service account type
    if (keyData.type === 'service_account') {
      log('✅ Service account type is correct', 'green');
    } else {
      log('❌ Invalid service account type', 'red');
      log(`💡 Expected: service_account, Got: ${keyData.type || 'missing'}`, 'yellow');
      process.exit(1);
    }

    // Check project ID
    if (keyData.project_id) {
      log(`✅ Project ID is present: ${keyData.project_id}`, 'green');
    } else {
      log('❌ Project ID is missing', 'red');
      process.exit(1);
    }

    // Check private key
    if (keyData.private_key) {
      const privateKeyLength = keyData.private_key.length;
      log(`✅ Private key is present (${privateKeyLength} characters)`, 'green');
    } else {
      log('❌ Private key is missing', 'red');
      process.exit(1);
    }

    // Check client email
    if (keyData.client_email) {
      log(`✅ Client email is present: ${keyData.client_email}`, 'green');
    } else {
      log('❌ Client email is missing', 'red');
      process.exit(1);
    }

    // Check additional fields
    log('🔍 Checking additional fields...', 'blue');

    const optionalFields = [
      'auth_uri',
      'token_uri',
      'client_id',
      'client_x509_cert_url',
      'auth_provider_x509_cert_url'
    ];

    optionalFields.forEach(field => {
      if (keyData[field]) {
        log(`✅ ${field} is present`, 'green');
      } else {
        log(`⚠️  ${field} is missing (optional)`, 'yellow');
      }
    });

    // Summary
    console.log('');
    log('📊 Validation Summary:', 'blue');
    log('✅ JSON structure: Valid', 'green');
    log('✅ Service account type: Correct', 'green');
    log(`✅ Project ID: ${keyData.project_id}`, 'green');
    log('✅ Private key: Present', 'green');
    log(`✅ Client email: ${keyData.client_email}`, 'green');

    console.log('');
    log('🎉 GCP service account key validation successful!', 'green');
    log('💡 Next steps:', 'blue');
    log('   1. Copy the entire JSON content', 'yellow');
    log('   2. Go to GitHub repository settings', 'yellow');
    log('   3. Navigate to Secrets and variables → Actions', 'yellow');
    log('   4. Add new secret: GCP_SA_KEY', 'yellow');
    log('   5. Paste the JSON content as the value', 'yellow');
    log('   6. Save the secret', 'yellow');

    console.log('');
    log('🔧 Your GCP service account key is ready for GitHub Actions!', 'cyan');

  } catch (error) {
    if (error instanceof SyntaxError) {
      log('❌ JSON structure is invalid', 'red');
      log('💡 Please check the JSON format and try again', 'yellow');
      log(`Error: ${error.message}`, 'red');
    } else {
      log('❌ Error reading key file', 'red');
      log(`Error: ${error.message}`, 'red');
    }
    process.exit(1);
  }
}

// Test environment variable validation
function validateEnvironmentKey() {
  const gcpKey = process.env.GCP_SA_KEY;
  
  if (!gcpKey) {
    log('❌ GCP_SA_KEY environment variable is missing', 'red');
    log('💡 Set the GCP_SA_KEY environment variable with your service account key', 'yellow');
    process.exit(1);
  }

  try {
    const keyData = JSON.parse(gcpKey);
    log('✅ GCP_SA_KEY environment variable is valid JSON', 'green');
    log(`✅ Project ID: ${keyData.project_id}`, 'green');
    log(`✅ Client email: ${keyData.client_email}`, 'green');
    log(`✅ Key length: ${gcpKey.length} characters`, 'green');
  } catch (error) {
    log('❌ GCP_SA_KEY environment variable contains invalid JSON', 'red');
    log('💡 Please check the JSON format', 'yellow');
    process.exit(1);
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--env') || args.includes('-e')) {
    // Validate environment variable
    validateEnvironmentKey();
  } else {
    // Validate key file
    const keyPath = path.join(process.cwd(), 'github-actions-key.json');
    validateGCPKey(keyPath);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateGCPKey,
  validateEnvironmentKey
};
