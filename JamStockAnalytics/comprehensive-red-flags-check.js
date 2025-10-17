#!/usr/bin/env node

/**
 * Comprehensive Red Flags Check
 * Identifies all potential issues in the JamStockAnalytics project
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE RED FLAGS CHECK');
console.log('=================================');

let redFlags = [];
let totalIssues = 0;

function addRedFlag(category, severity, issue, file = '', suggestion = '') {
  const flag = {
    category,
    severity,
    issue,
    file,
    suggestion,
    id: totalIssues + 1
  };
  redFlags.push(flag);
  totalIssues++;
}

function checkFileExists(filePath, description) {
  if (!fs.existsSync(filePath)) {
    addRedFlag('Missing Files', 'HIGH', `${description} missing`, filePath, 'Create the missing file');
    return false;
  }
  return true;
}

function checkFileContent(filePath, checks) {
  if (!fs.existsSync(filePath)) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    checks.forEach(check => {
      if (check.type === 'contains' && !content.includes(check.value)) {
        addRedFlag(check.category, check.severity, check.issue, filePath, check.suggestion);
      } else if (check.type === 'notContains' && content.includes(check.value)) {
        addRedFlag(check.category, check.severity, check.issue, filePath, check.suggestion);
      } else if (check.type === 'regex' && !check.regex.test(content)) {
        addRedFlag(check.category, check.severity, check.issue, filePath, check.suggestion);
      }
    });
  } catch (error) {
    addRedFlag('File Access', 'MEDIUM', `Cannot read file: ${filePath}`, filePath, 'Check file permissions');
  }
}

function checkDependencies() {
  console.log('\n1. Checking Dependencies...');
  
  if (!fs.existsSync('package.json')) {
    addRedFlag('Critical', 'CRITICAL', 'package.json missing', 'package.json', 'Create package.json file');
    return;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check for required dependencies
    const requiredDeps = [
      '@supabase/supabase-js',
      'react-native-paper',
      'expo-router',
      'axios',
      'zod'
    ];
    
    requiredDeps.forEach(dep => {
      if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
        addRedFlag('Dependencies', 'HIGH', `Missing required dependency: ${dep}`, 'package.json', `Add ${dep} to dependencies`);
      }
    });
    
    // Check for deprecated dependencies
    const deprecatedDeps = ['inflight', 'rimraf@3', 'glob@7'];
    deprecatedDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        addRedFlag('Dependencies', 'MEDIUM', `Deprecated dependency: ${dep}`, 'package.json', `Update or replace ${dep}`);
      }
    });
    
    // Check for security vulnerabilities
    if (packageJson.dependencies && packageJson.dependencies['react-native'] === '0.81.4') {
      addRedFlag('Security', 'MEDIUM', 'React Native version may have security issues', 'package.json', 'Update React Native to latest stable version');
    }
    
  } catch (error) {
    addRedFlag('Configuration', 'HIGH', 'Invalid package.json format', 'package.json', 'Fix JSON syntax errors');
  }
}

function checkConfigurationFiles() {
  console.log('\n2. Checking Configuration Files...');
  
  // Check TypeScript configuration
  checkFileContent('tsconfig.json', [
    {
      type: 'contains',
      value: '"strict": true',
      category: 'TypeScript',
      severity: 'MEDIUM',
      issue: 'TypeScript strict mode not enabled',
      suggestion: 'Enable strict mode for better type safety'
    }
  ]);
  
  // Check Babel configuration
  checkFileContent('babel.config.js', [
    {
      type: 'contains',
      value: 'babel-preset-expo',
      category: 'Configuration',
      severity: 'MEDIUM',
      issue: 'Babel preset not configured',
      suggestion: 'Configure babel-preset-expo'
    }
  ]);
  
  // Check Metro configuration
  checkFileContent('metro.config.js', [
    {
      type: 'contains',
      value: 'getDefaultConfig',
      category: 'Configuration',
      severity: 'MEDIUM',
      issue: 'Metro configuration may be incomplete',
      suggestion: 'Ensure Metro is properly configured'
    }
  ]);
  
  // Check app configuration
  checkFileExists('app.config.js', 'App configuration file');
  checkFileExists('.env', 'Environment variables file');
}

function checkEnvironmentVariables() {
  console.log('\n3. Checking Environment Variables...');
  
  if (!fs.existsSync('.env')) {
    addRedFlag('Environment', 'CRITICAL', 'Environment variables file missing', '.env', 'Create .env file with required variables');
    return;
  }
  
  const envContent = fs.readFileSync('.env', 'utf8');
  const requiredEnvVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'EXPO_PUBLIC_DEEPSEEK_API_KEY'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (!envContent.includes(envVar)) {
      addRedFlag('Environment', 'HIGH', `Missing environment variable: ${envVar}`, '.env', `Add ${envVar} to .env file`);
    } else if (envContent.includes(`${envVar}=your_`)) {
      addRedFlag('Environment', 'HIGH', `Environment variable not configured: ${envVar}`, '.env', `Set actual value for ${envVar}`);
    }
  });
}

function checkCoreServices() {
  console.log('\n4. Checking Core Services...');
  
  const coreServices = [
    'lib/services/ai-service.ts',
    'lib/services/news-service.ts',
    'lib/services/block-user-service.ts',
    'lib/services/ml-agent-service.ts',
    'lib/services/analytics-service.ts',
    'lib/services/performance-service.ts'
  ];
  
  coreServices.forEach(service => {
    checkFileExists(service, `Core service: ${service}`);
    
    if (fs.existsSync(service)) {
      checkFileContent(service, [
        {
          type: 'contains',
          value: 'export',
          category: 'Code Quality',
          severity: 'MEDIUM',
          issue: 'Service may not export functions properly',
          suggestion: 'Ensure service exports are properly defined'
        },
        {
          type: 'contains',
          value: 'try {',
          category: 'Error Handling',
          severity: 'MEDIUM',
          issue: 'Service may lack error handling',
          suggestion: 'Add proper try-catch blocks for error handling'
        }
      ]);
    }
  });
}

function checkComponents() {
  console.log('\n5. Checking Components...');
  
  const coreComponents = [
    'components/Logo.tsx',
    'components/ProModeGate.tsx',
    'components/block-user/BlockUserButton.tsx',
    'components/ml-agent/MLAgentDashboard.tsx',
    'components/analytics/AnalyticsDashboard.tsx'
  ];
  
  coreComponents.forEach(component => {
    checkFileExists(component, `Core component: ${component}`);
    
    if (fs.existsSync(component)) {
      checkFileContent(component, [
        {
          type: 'contains',
          value: 'export default',
          category: 'Code Quality',
          severity: 'LOW',
          issue: 'Component may not have default export',
          suggestion: 'Ensure component has proper default export'
        },
        {
          type: 'contains',
          value: 'React.FC',
          category: 'Code Quality',
          severity: 'LOW',
          issue: 'Component may not have proper TypeScript typing',
          suggestion: 'Add proper TypeScript component typing'
        }
      ]);
    }
  });
}

function checkAppStructure() {
  console.log('\n6. Checking App Structure...');
  
  const appFiles = [
    'app/_layout.tsx',
    'app/(tabs)/index.tsx',
    'app/(tabs)/chat.tsx',
    'app/(tabs)/analysis.tsx',
    'app/(tabs)/market.tsx',
    'app/(tabs)/profile.tsx'
  ];
  
  appFiles.forEach(file => {
    checkFileExists(file, `App file: ${file}`);
  });
}

function checkDatabaseSchema() {
  console.log('\n7. Checking Database Schema...');
  
  const schemaFiles = [
    'SUPABASE_SETUP.sql',
    'DOCS/database-schema.sql'
  ];
  
  schemaFiles.forEach(file => {
    checkFileExists(file, `Database schema: ${file}`);
  });
}

function checkSecurityIssues() {
  console.log('\n8. Checking Security Issues...');
  
  // Check for hardcoded secrets
  const filesToCheck = [
    'lib/services/ai-service.ts',
    'lib/services/news-service.ts',
    '.env'
  ];
  
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      checkFileContent(file, [
        {
          type: 'notContains',
          value: 'sk-',
          category: 'Security',
          severity: 'HIGH',
          issue: 'Potential hardcoded API keys',
          suggestion: 'Remove hardcoded secrets, use environment variables'
        },
        {
          type: 'notContains',
          value: 'eyJ',
          category: 'Security',
          severity: 'HIGH',
          issue: 'Potential hardcoded JWT tokens',
          suggestion: 'Remove hardcoded tokens, use environment variables'
        }
      ]);
    }
  });
}

function checkPerformanceIssues() {
  console.log('\n9. Checking Performance Issues...');
  
  // Check for large files
  const checkLargeFiles = (dir, maxSize = 1000000) => { // 1MB
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
      const filePath = path.join(dir, file.name);
      if (file.isFile()) {
        const stats = fs.statSync(filePath);
        if (stats.size > maxSize) {
          addRedFlag('Performance', 'MEDIUM', `Large file detected: ${filePath}`, filePath, `Optimize file size (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
        }
      } else if (file.isDirectory() && !file.name.startsWith('.')) {
        checkLargeFiles(filePath, maxSize);
      }
    });
  };
  
  checkLargeFiles('.');
}

function checkCodeQuality() {
  console.log('\n10. Checking Code Quality...');
  
  const tsFiles = [];
  const findTsFiles = (dir) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
      const filePath = path.join(dir, file.name);
      if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx'))) {
        tsFiles.push(filePath);
      } else if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        findTsFiles(filePath);
      }
    });
  };
  
  findTsFiles('.');
  
  // Check for console.log statements
  tsFiles.forEach(file => {
    checkFileContent(file, [
      {
        type: 'notContains',
        value: 'console.log',
        category: 'Code Quality',
        severity: 'LOW',
        issue: 'Console.log statements found in production code',
        suggestion: 'Remove or replace with proper logging'
      }
    ]);
  });
}

async function runRedFlagsCheck() {
  try {
    console.log('Starting comprehensive red flags analysis...\n');
    
    checkDependencies();
    checkConfigurationFiles();
    checkEnvironmentVariables();
    checkCoreServices();
    checkComponents();
    checkAppStructure();
    checkDatabaseSchema();
    checkSecurityIssues();
    checkPerformanceIssues();
    checkCodeQuality();
    
    console.log('\n📊 RED FLAGS ANALYSIS COMPLETE');
    console.log('===============================');
    
    if (redFlags.length === 0) {
      console.log('🎉 NO RED FLAGS FOUND!');
      console.log('✅ Project is in excellent condition');
    } else {
      console.log(`🚨 FOUND ${redFlags.length} RED FLAGS`);
      console.log('');
      
      // Group by severity
      const critical = redFlags.filter(f => f.severity === 'CRITICAL');
      const high = redFlags.filter(f => f.severity === 'HIGH');
      const medium = redFlags.filter(f => f.severity === 'MEDIUM');
      const low = redFlags.filter(f => f.severity === 'LOW');
      
      if (critical.length > 0) {
        console.log('🔴 CRITICAL ISSUES:');
        critical.forEach(flag => {
          console.log(`   ${flag.id}. [${flag.category}] ${flag.issue}`);
          console.log(`      File: ${flag.file}`);
          console.log(`      Fix: ${flag.suggestion}\n`);
        });
      }
      
      if (high.length > 0) {
        console.log('🟠 HIGH PRIORITY ISSUES:');
        high.forEach(flag => {
          console.log(`   ${flag.id}. [${flag.category}] ${flag.issue}`);
          console.log(`      File: ${flag.file}`);
          console.log(`      Fix: ${flag.suggestion}\n`);
        });
      }
      
      if (medium.length > 0) {
        console.log('🟡 MEDIUM PRIORITY ISSUES:');
        medium.forEach(flag => {
          console.log(`   ${flag.id}. [${flag.category}] ${flag.issue}`);
          console.log(`      File: ${flag.file}`);
          console.log(`      Fix: ${flag.suggestion}\n`);
        });
      }
      
      if (low.length > 0) {
        console.log('🟢 LOW PRIORITY ISSUES:');
        low.forEach(flag => {
          console.log(`   ${flag.id}. [${flag.category}] ${flag.issue}`);
          console.log(`      File: ${flag.file}`);
          console.log(`      Fix: ${flag.suggestion}\n`);
        });
      }
      
      console.log(`\n📈 SUMMARY:`);
      console.log(`   Critical: ${critical.length}`);
      console.log(`   High: ${high.length}`);
      console.log(`   Medium: ${medium.length}`);
      console.log(`   Low: ${low.length}`);
      console.log(`   Total: ${redFlags.length}`);
    }
    
    // Save results to file
    fs.writeFileSync('red-flags-report.json', JSON.stringify(redFlags, null, 2));
    console.log('\n📄 Detailed report saved to: red-flags-report.json');
    
  } catch (error) {
    console.error('❌ Error during red flags check:', error.message);
    process.exit(1);
  }
}

// Run the check
runRedFlagsCheck();
