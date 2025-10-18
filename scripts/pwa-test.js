#!/usr/bin/env node

// PWA Testing Script for JamStockAnalytics
const fs = require('fs');
const path = require('path');

class PWATester {
  constructor() {
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };
  }
  
  async runAllTests() {
    console.log('🧪 Starting PWA Tests...\n');
    
    try {
      // Test 1: Manifest file
      await this.testManifest();
      
      // Test 2: Service Worker
      await this.testServiceWorker();
      
      // Test 3: Offline page
      await this.testOfflinePage();
      
      // Test 4: Icons
      await this.testIcons();
      
      // Test 5: HTML PWA features
      await this.testHTMLFeatures();
      
      // Test 6: CSS PWA styles
      await this.testPWAStyles();
      
      // Generate report
      this.generateReport();
      
      console.log('\n✅ PWA testing completed!');
      
    } catch (error) {
      console.error('❌ PWA testing failed:', error.message);
    }
  }
  
  async testManifest() {
    console.log('📋 Testing PWA Manifest...');
    
    const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
    
    try {
      if (!fs.existsSync(manifestPath)) {
        this.addTestResult('manifest-exists', false, 'Manifest file not found');
        return;
      }
      
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      
      // Test required fields
      const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
      let allRequired = true;
      
      for (const field of requiredFields) {
        if (!manifest[field]) {
          this.addTestResult(`manifest-${field}`, false, `Missing required field: ${field}`);
          allRequired = false;
        } else {
          this.addTestResult(`manifest-${field}`, true, `Field ${field} present`);
        }
      }
      
      // Test icons array
      if (manifest.icons && Array.isArray(manifest.icons)) {
        this.addTestResult('manifest-icons-array', true, `Found ${manifest.icons.length} icons`);
        
        // Check for required icon sizes
        const requiredSizes = ['192x192', '512x512'];
        const iconSizes = manifest.icons.map(icon => icon.sizes);
        
        for (const size of requiredSizes) {
          if (iconSizes.includes(size)) {
            this.addTestResult(`manifest-icon-${size}`, true, `Icon ${size} found`);
          } else {
            this.addTestResult(`manifest-icon-${size}`, false, `Icon ${size} missing`);
          }
        }
      }
      
      // Test display mode
      const validDisplays = ['standalone', 'fullscreen', 'minimal-ui'];
      if (validDisplays.includes(manifest.display)) {
        this.addTestResult('manifest-display', true, `Display mode: ${manifest.display}`);
      } else {
        this.addTestResult('manifest-display', false, `Invalid display mode: ${manifest.display}`);
      }
      
      // Test theme color
      if (manifest.theme_color) {
        this.addTestResult('manifest-theme-color', true, `Theme color: ${manifest.theme_color}`);
      } else {
        this.addTestResult('manifest-theme-color', false, 'Theme color missing');
      }
      
      if (allRequired) {
        console.log('  ✅ Manifest file is valid');
      } else {
        console.log('  ❌ Manifest file has issues');
      }
      
    } catch (error) {
      this.addTestResult('manifest-parse', false, `Manifest parse error: ${error.message}`);
      console.log('  ❌ Manifest file is invalid JSON');
    }
  }
  
  async testServiceWorker() {
    console.log('🔧 Testing Service Worker...');
    
    const swPath = path.join(__dirname, '..', 'public', 'sw.js');
    
    if (!fs.existsSync(swPath)) {
      this.addTestResult('sw-exists', false, 'Service worker file not found');
      console.log('  ❌ Service worker file missing');
      return;
    }
    
    this.addTestResult('sw-exists', true, 'Service worker file found');
    
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    // Test for required event listeners
    const requiredEvents = ['install', 'activate', 'fetch'];
    for (const event of requiredEvents) {
      if (swContent.includes(`addEventListener('${event}'`)) {
        this.addTestResult(`sw-${event}-listener`, true, `${event} event listener found`);
      } else {
        this.addTestResult(`sw-${event}-listener`, false, `${event} event listener missing`);
      }
    }
    
    // Test for cache strategies
    if (swContent.includes('caches.open')) {
      this.addTestResult('sw-cache-strategy', true, 'Cache strategy implemented');
    } else {
      this.addTestResult('sw-cache-strategy', false, 'Cache strategy missing');
    }
    
    // Test for offline functionality
    if (swContent.includes('offline')) {
      this.addTestResult('sw-offline-support', true, 'Offline support found');
    } else {
      this.addTestResult('sw-offline-support', false, 'Offline support missing');
    }
    
    console.log('  ✅ Service worker analysis completed');
  }
  
  async testOfflinePage() {
    console.log('📱 Testing Offline Page...');
    
    const offlinePath = path.join(__dirname, '..', 'public', 'offline.html');
    
    if (!fs.existsSync(offlinePath)) {
      this.addTestResult('offline-page-exists', false, 'Offline page not found');
      console.log('  ❌ Offline page missing');
      return;
    }
    
    this.addTestResult('offline-page-exists', true, 'Offline page found');
    
    const offlineContent = fs.readFileSync(offlinePath, 'utf8');
    
    // Test for offline indicators
    if (offlineContent.includes('offline') || offlineContent.includes('Offline')) {
      this.addTestResult('offline-indicator', true, 'Offline indicator found');
    } else {
      this.addTestResult('offline-indicator', false, 'Offline indicator missing');
    }
    
    // Test for retry functionality
    if (offlineContent.includes('retry') || offlineContent.includes('checkConnection')) {
      this.addTestResult('offline-retry', true, 'Retry functionality found');
    } else {
      this.addTestResult('offline-retry', false, 'Retry functionality missing');
    }
    
    console.log('  ✅ Offline page analysis completed');
  }
  
  async testIcons() {
    console.log('🖼️  Testing PWA Icons...');
    
    const iconsDir = path.join(__dirname, '..', 'public', 'icons');
    const requiredSizes = ['72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512'];
    
    if (!fs.existsSync(iconsDir)) {
      this.addTestResult('icons-directory', false, 'Icons directory not found');
      console.log('  ❌ Icons directory missing');
      return;
    }
    
    this.addTestResult('icons-directory', true, 'Icons directory found');
    
    const iconFiles = fs.readdirSync(iconsDir);
    
    for (const size of requiredSizes) {
      const iconFile = `icon-${size}.png`;
      if (iconFiles.includes(iconFile)) {
        this.addTestResult(`icon-${size}`, true, `Icon ${size} found`);
      } else {
        this.addTestResult(`icon-${size}`, false, `Icon ${size} missing`);
      }
    }
    
    console.log('  ✅ Icons analysis completed');
  }
  
  async testHTMLFeatures() {
    console.log('🌐 Testing HTML PWA Features...');
    
    const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
    
    if (!fs.existsSync(htmlPath)) {
      this.addTestResult('html-exists', false, 'HTML file not found');
      return;
    }
    
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Test for manifest link
    if (htmlContent.includes('rel="manifest"')) {
      this.addTestResult('html-manifest-link', true, 'Manifest link found');
    } else {
      this.addTestResult('html-manifest-link', false, 'Manifest link missing');
    }
    
    // Test for service worker registration
    if (htmlContent.includes('serviceWorker.register')) {
      this.addTestResult('html-sw-registration', true, 'Service worker registration found');
    } else {
      this.addTestResult('html-sw-registration', false, 'Service worker registration missing');
    }
    
    // Test for PWA meta tags
    const pwaMetaTags = [
      'apple-mobile-web-app-capable',
      'apple-mobile-web-app-status-bar-style',
      'mobile-web-app-capable',
      'theme-color'
    ];
    
    for (const tag of pwaMetaTags) {
      if (htmlContent.includes(tag)) {
        this.addTestResult(`html-meta-${tag}`, true, `Meta tag ${tag} found`);
      } else {
        this.addTestResult(`html-meta-${tag}`, false, `Meta tag ${tag} missing`);
      }
    }
    
    // Test for install button
    if (htmlContent.includes('install-button')) {
      this.addTestResult('html-install-button', true, 'Install button found');
    } else {
      this.addTestResult('html-install-button', false, 'Install button missing');
    }
    
    console.log('  ✅ HTML PWA features analysis completed');
  }
  
  async testPWAStyles() {
    console.log('🎨 Testing PWA Styles...');
    
    const cssPath = path.join(__dirname, '..', 'static', 'css', 'main.css');
    
    if (!fs.existsSync(cssPath)) {
      this.addTestResult('css-exists', false, 'CSS file not found');
      return;
    }
    
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Test for PWA-specific styles
    const pwaStyles = [
      '.install-btn',
      '.offline',
      '.pwa-status',
      '.install-prompt'
    ];
    
    for (const style of pwaStyles) {
      if (cssContent.includes(style)) {
        this.addTestResult(`css-${style.replace('.', '')}`, true, `Style ${style} found`);
      } else {
        this.addTestResult(`css-${style.replace('.', '')}`, false, `Style ${style} missing`);
      }
    }
    
    console.log('  ✅ PWA styles analysis completed');
  }
  
  addTestResult(testName, passed, message) {
    this.testResults.tests.push({
      name: testName,
      passed: passed,
      message: message,
      timestamp: new Date().toISOString()
    });
    
    this.testResults.summary.total++;
    if (passed) {
      this.testResults.summary.passed++;
    } else {
      this.testResults.summary.failed++;
    }
  }
  
  generateReport() {
    const reportPath = path.join(__dirname, '..', 'pwa-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    
    console.log(`\n📋 PWA test report generated: ${reportPath}`);
    
    // Display summary
    console.log('\n📊 PWA Test Summary:');
    console.log(`  ✅ Passed: ${this.testResults.summary.passed}`);
    console.log(`  ❌ Failed: ${this.testResults.summary.failed}`);
    console.log(`  📈 Total: ${this.testResults.summary.total}`);
    
    // Display failed tests
    const failedTests = this.testResults.tests.filter(test => !test.passed);
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`  - ${test.name}: ${test.message}`);
      });
    }
    
    // Calculate score
    const score = Math.round((this.testResults.summary.passed / this.testResults.summary.total) * 100);
    console.log(`\n🎯 PWA Score: ${score}%`);
    
    if (score >= 90) {
      console.log('🏆 Excellent PWA implementation!');
    } else if (score >= 70) {
      console.log('👍 Good PWA implementation with room for improvement');
    } else if (score >= 50) {
      console.log('⚠️  PWA implementation needs work');
    } else {
      console.log('❌ PWA implementation requires significant improvements');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new PWATester();
  tester.runAllTests();
}

module.exports = PWATester;
