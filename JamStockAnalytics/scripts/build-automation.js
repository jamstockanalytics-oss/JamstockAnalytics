#!/usr/bin/env node

/**
 * Build Automation Script
 * Handles automated builds without user input
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

class BuildAutomation {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.buildProfiles = ['development', 'preview', 'production', 'automated'];
    this.platforms = ['android', 'ios', 'web'];
  }

  /**
   * Validate environment variables
   */
  validateEnvironment() {
    console.log('🔍 Validating environment variables...\n');
    
    const requiredVars = [
      'EXPO_PUBLIC_SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY'
    ];
    
    const optionalVars = [
      'EXPO_PUBLIC_DEEPSEEK_API_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    const missing = [];
    const present = [];
    
    requiredVars.forEach(varName => {
      if (!process.env[varName] || process.env[varName] === 'your_' + varName.toLowerCase().replace('expo_public_', '') + '_here') {
        missing.push(varName);
      } else {
        present.push(varName);
      }
    });
    
    optionalVars.forEach(varName => {
      if (process.env[varName] && process.env[varName] !== 'your_' + varName.toLowerCase().replace('expo_public_', '') + '_here') {
        present.push(varName);
      }
    });
    
    console.log(`✅ Present: ${present.join(', ')}`);
    if (missing.length > 0) {
      console.log(`❌ Missing: ${missing.join(', ')}`);
      return false;
    }
    
    return true;
  }

  /**
   * Setup automated environment
   */
  async setupAutomatedEnvironment() {
    console.log('🔧 Setting up automated environment...\n');
    
    try {
      // Run auto-setup script
      execSync('node scripts/auto-setup-env.js', { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      
      console.log('✅ Automated environment setup completed');
      return true;
    } catch (error) {
      console.error('❌ Automated environment setup failed:', error.message);
      return false;
    }
  }

  /**
   * Setup database automatically
   */
  async setupDatabase() {
    console.log('🗄️ Setting up database...\n');
    
    try {
      // Run database setup
      execSync('npm run setup-database', { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      
      // Run database seeding
      execSync('npm run seed-database', { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      
      console.log('✅ Database setup completed');
      return true;
    } catch (error) {
      console.error('❌ Database setup failed:', error.message);
      return false;
    }
  }

  /**
   * Run tests
   */
  async runTests() {
    console.log('🧪 Running automated tests...\n');
    
    try {
      // Run database tests
      execSync('npm run test-database', { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      
      // Run integration tests
      execSync('npm run test-chat-integration', { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      
      console.log('✅ All tests passed');
      return true;
    } catch (error) {
      console.error('❌ Tests failed:', error.message);
      return false;
    }
  }

  /**
   * Build for specific platform
   */
  async buildPlatform(platform, profile = 'automated') {
    console.log(`📱 Building for ${platform} (${profile})...\n`);
    
    try {
      let command;
      
      switch (platform) {
        case 'web':
          command = 'npm run build:web:auto';
          break;
        case 'android':
          command = `eas build --platform android --profile ${profile} --non-interactive`;
          break;
        case 'ios':
          command = `eas build --platform ios --profile ${profile} --non-interactive`;
          break;
        default:
          command = `eas build --platform ${platform} --profile ${profile} --non-interactive`;
      }
      
      execSync(command, { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      
      console.log(`✅ ${platform} build completed`);
      return true;
    } catch (error) {
      console.error(`❌ ${platform} build failed:`, error.message);
      return false;
    }
  }

  /**
   * Build all platforms
   */
  async buildAll(profile = 'automated') {
    console.log(`🚀 Building all platforms (${profile})...\n`);
    
    const results = {};
    
    for (const platform of this.platforms) {
      results[platform] = await this.buildPlatform(platform, profile);
    }
    
    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    
    console.log(`\n📊 Build Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${totalCount - successCount}`);
    
    return successCount === totalCount;
  }

  /**
   * Deploy application
   */
  async deploy() {
    console.log('🚀 Deploying application...\n');
    
    try {
      execSync('npm run deploy:auto', { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      
      console.log('✅ Deployment completed');
      return true;
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      return false;
    }
  }

  /**
   * Full CI/CD pipeline
   */
  async runCIPipeline() {
    console.log('🔄 Running CI/CD Pipeline...\n');
    
    const steps = [
      { name: 'Environment Validation', fn: () => this.validateEnvironment() },
      { name: 'Automated Environment Setup', fn: () => this.setupAutomatedEnvironment() },
      { name: 'Database Setup', fn: () => this.setupDatabase() },
      { name: 'Test Suite', fn: () => this.runTests() },
      { name: 'Build All Platforms', fn: () => this.buildAll() },
      { name: 'Deploy Application', fn: () => this.deploy() }
    ];
    
    const results = {};
    
    for (const step of steps) {
      console.log(`\n📋 Step: ${step.name}`);
      console.log('='.repeat(50));
      
      try {
        results[step.name] = await step.fn();
        if (results[step.name]) {
          console.log(`✅ ${step.name} completed successfully`);
        } else {
          console.log(`❌ ${step.name} failed`);
        }
      } catch (error) {
        console.error(`💥 ${step.name} failed with error:`, error.message);
        results[step.name] = false;
      }
    }
    
    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    
    console.log('\n🎯 CI/CD Pipeline Summary:');
    console.log('='.repeat(50));
    
    Object.entries(results).forEach(([step, success]) => {
      console.log(`${success ? '✅' : '❌'} ${step}`);
    });
    
    console.log(`\n📊 Overall: ${successCount}/${totalCount} steps completed successfully`);
    
    if (successCount === totalCount) {
      console.log('\n🎉 CI/CD Pipeline completed successfully!');
      return true;
    } else {
      console.log('\n⚠️ CI/CD Pipeline completed with some failures.');
      return false;
    }
  }

  /**
   * Create build artifacts
   */
  async createBuildArtifacts() {
    console.log('📦 Creating build artifacts...\n');
    
    try {
      const artifactsDir = path.join(this.projectRoot, 'build-artifacts');
      
      if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
      }
      
      // Create build info
      const buildInfo = {
        timestamp: new Date().toISOString(),
        version: require('../package.json').version,
        environment: process.env.NODE_ENV || 'development',
        buildProfile: 'automated',
        platforms: this.platforms,
        environmentVariables: {
          supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
          supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
          deepseekKey: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY ? 'configured' : 'missing'
        }
      };
      
      fs.writeFileSync(
        path.join(artifactsDir, 'build-info.json'),
        JSON.stringify(buildInfo, null, 2)
      );
      
      console.log('✅ Build artifacts created');
      return true;
    } catch (error) {
      console.error('❌ Failed to create build artifacts:', error.message);
      return false;
    }
  }
}

// CLI interface
async function main() {
  const automation = new BuildAutomation();
  const args = process.argv.slice(2);
  const command = args[0] || 'ci';
  
  console.log('🤖 JamStockAnalytics Build Automation');
  console.log('=====================================\n');
  
  try {
    let success = false;
    
    switch (command) {
      case 'ci':
        success = await automation.runCIPipeline();
        break;
      case 'build':
        const platform = args[1] || 'all';
        const profile = args[2] || 'automated';
        
        if (platform === 'all') {
          success = await automation.buildAll(profile);
        } else {
          success = await automation.buildPlatform(platform, profile);
        }
        break;
      case 'test':
        success = await automation.runTests();
        break;
      case 'setup':
        success = await automation.setupAutomatedEnvironment() && 
                 await automation.setupDatabase();
        break;
      case 'deploy':
        success = await automation.deploy();
        break;
      case 'artifacts':
        success = await automation.createBuildArtifacts();
        break;
      default:
        console.log('Available commands:');
        console.log('  ci       - Run full CI/CD pipeline');
        console.log('  build    - Build application (platform: android|ios|web|all)');
        console.log('  test     - Run test suite');
        console.log('  setup    - Setup environment and database');
        console.log('  deploy   - Deploy application');
        console.log('  artifacts - Create build artifacts');
        return;
    }
    
    if (success) {
      console.log('\n🎉 Command completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Command failed!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the automation
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { BuildAutomation };
