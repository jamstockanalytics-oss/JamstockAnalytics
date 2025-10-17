#!/usr/bin/env node

/**
 * Quick Web Deployment Script
 * Deploys the web app to show all features online
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌐 JamStockAnalytics Quick Web Deployment');
console.log('==========================================\n');

try {
  // Check if we're in the right directory
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Please run this script from the project root directory');
    process.exit(1);
  }

  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('\n🌐 Starting web development server...');
  console.log('=====================================');
  console.log('🚀 Web app will be available at: http://localhost:8081');
  console.log('📱 Features available:');
  console.log('  ✅ AI-Powered News Feed');
  console.log('  ✅ Interactive AI Chat');
  console.log('  ✅ Market Analysis');
  console.log('  ✅ User Authentication');
  console.log('  ✅ Guest Mode');
  console.log('  ✅ Pro Mode Features');
  console.log('  ✅ Mobile-Responsive Design');
  console.log('\n🎯 Open your browser and navigate to: http://localhost:8081');
  console.log('\n📋 Available Features:');
  console.log('  🏠 Main Dashboard - AI-prioritized news feed');
  console.log('  🤖 AI Chat - Interactive market analysis');
  console.log('  📊 Market Analysis - Real-time market insights');
  console.log('  🔐 Authentication - Login/guest access');
  console.log('  📱 Mobile Support - Responsive design');
  console.log('  🎨 Modern UI - Material Design components');
  
  console.log('\n🚀 Starting development server...\n');
  
  // Start the web development server
  execSync('npx expo start --web', { 
    stdio: 'inherit'
  });

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('  1. Make sure you\'re in the project root directory');
  console.log('  2. Run: npm install');
  console.log('  3. Run: npx expo start --web');
  console.log('  4. Open: http://localhost:8081');
  process.exit(1);
}
