#!/usr/bin/env node

/**
 * Web Deployment Script
 * Builds and deploys the web app to Expo hosting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

class WebDeployment {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.distPath = path.join(this.projectRoot, 'dist');
  }

  /**
   * Build the web app for production
   */
  async buildWebApp() {
    console.log('🌐 Building web app for production...\n');
    
    try {
      // Set production environment
      process.env.NODE_ENV = 'production';
      process.env.EXPO_PUBLIC_APP_ENV = 'production';
      
      // Build the web app
      execSync('npx expo export -p web', { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      
      console.log('✅ Web app built successfully');
      return true;
    } catch (error) {
      console.error('❌ Web app build failed:', error.message);
      return false;
    }
  }

  /**
   * Deploy to Expo hosting
   */
  async deployToExpo() {
    console.log('🚀 Deploying to Expo hosting...\n');
    
    try {
      // Deploy to Expo
      execSync('npx eas-cli@latest deploy', { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      
      console.log('✅ Deployed to Expo successfully');
      return true;
    } catch (error) {
      console.error('❌ Expo deployment failed:', error.message);
      return false;
    }
  }

  /**
   * Create a local web server for testing
   */
  async createLocalServer() {
    console.log('🖥️ Creating local web server...\n');
    
    try {
      // Create a simple HTTP server
      const serverScript = `
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(\`🌐 JamStockAnalytics web app running at http://localhost:\${port}\`);
  console.log('📱 Features available:');
  console.log('  ✅ News Feed with AI Priority');
  console.log('  ✅ AI Chat Interface');
  console.log('  ✅ Market Analysis');
  console.log('  ✅ User Authentication');
  console.log('  ✅ Guest Mode');
  console.log('  ✅ Pro Mode Features');
});
`;
      
      fs.writeFileSync(path.join(this.projectRoot, 'server.js'), serverScript);
      
      // Install express if not available
      try {
        execSync('npm install express', { 
          stdio: 'inherit',
          cwd: this.projectRoot 
        });
      } catch (error) {
        console.log('Express already installed or installation failed');
      }
      
      console.log('✅ Local server created');
      return true;
    } catch (error) {
      console.error('❌ Local server creation failed:', error.message);
      return false;
    }
  }

  /**
   * Start local development server
   */
  async startLocalServer() {
    console.log('🚀 Starting local development server...\n');
    
    try {
      // Start Expo development server for web
      execSync('npx expo start --web', { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
    } catch (error) {
      console.error('❌ Failed to start development server:', error.message);
    }
  }

  /**
   * Show deployment information
   */
  showDeploymentInfo() {
    console.log('\n🎉 Web App Deployment Complete!');
    console.log('================================\n');
    
    console.log('📱 Available Features:');
    console.log('  ✅ AI-Powered News Feed');
    console.log('  ✅ Real-time Market Analysis');
    console.log('  ✅ Interactive AI Chat');
    console.log('  ✅ User Authentication');
    console.log('  ✅ Guest Mode Access');
    console.log('  ✅ Pro Mode Features');
    console.log('  ✅ Mobile-Responsive Design');
    console.log('  ✅ Dark/Light Theme Support');
    
    console.log('\n🌐 Access URLs:');
    console.log('  Local Development: http://localhost:8081');
    console.log('  Production Build: ./dist/index.html');
    console.log('  Expo Hosting: Check Expo dashboard');
    
    console.log('\n📋 Next Steps:');
    console.log('  1. Configure environment variables');
    console.log('  2. Set up Supabase database');
    console.log('  3. Configure AI services');
    console.log('  4. Test all features');
    console.log('  5. Deploy to production');
  }
}

// CLI interface
async function main() {
  const deployment = new WebDeployment();
  const args = process.argv.slice(2);
  const command = args[0] || 'dev';
  
  console.log('🌐 JamStockAnalytics Web Deployment');
  console.log('==================================\n');
  
  try {
    let success = false;
    
    switch (command) {
      case 'build':
        success = await deployment.buildWebApp();
        break;
      case 'deploy':
        success = await deployment.buildWebApp() && await deployment.deployToExpo();
        break;
      case 'local':
        success = await deployment.createLocalServer();
        break;
      case 'dev':
        await deployment.startLocalServer();
        return;
      default:
        console.log('Available commands:');
        console.log('  dev     - Start development server');
        console.log('  build   - Build for production');
        console.log('  deploy  - Build and deploy to Expo');
        console.log('  local   - Create local server');
        return;
    }
    
    if (success) {
      deployment.showDeploymentInfo();
    } else {
      console.log('\n❌ Deployment failed!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the deployment
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { WebDeployment };
