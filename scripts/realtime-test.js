#!/usr/bin/env node

// Real-time Testing Script for JamStockAnalytics
const io = require('socket.io-client');

class RealtimeTester {
  constructor() {
    this.socket = null;
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };
    this.serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
  }
  
  async runAllTests() {
    console.log('🧪 Starting Real-time Tests...\n');
    
    try {
      // Test 1: Connection
      await this.testConnection();
      
      // Test 2: Market Data Subscription
      await this.testMarketDataSubscription();
      
      // Test 3: News Subscription
      await this.testNewsSubscription();
      
      // Test 4: AI Insights Subscription
      await this.testAIInsightsSubscription();
      
      // Test 5: Data Requests
      await this.testDataRequests();
      
      // Test 6: Disconnection
      await this.testDisconnection();
      
      // Generate report
      this.generateReport();
      
      console.log('\n✅ Real-time testing completed!');
      
    } catch (error) {
      console.error('❌ Real-time testing failed:', error.message);
    }
  }
  
  async testConnection() {
    console.log('🔌 Testing Connection...');
    
    return new Promise((resolve) => {
      this.socket = io(this.serverUrl);
      
      const timeout = setTimeout(() => {
        this.addTestResult('connection-timeout', false, 'Connection timeout');
        console.log('  ❌ Connection timeout');
        resolve();
      }, 5000);
      
      this.socket.on('connect', () => {
        clearTimeout(timeout);
        this.addTestResult('connection-success', true, 'Connected successfully');
        console.log('  ✅ Connected successfully');
        resolve();
      });
      
      this.socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        this.addTestResult('connection-error', false, `Connection error: ${error.message}`);
        console.log('  ❌ Connection failed:', error.message);
        resolve();
      });
    });
  }
  
  async testMarketDataSubscription() {
    console.log('📊 Testing Market Data Subscription...');
    
    return new Promise((resolve) => {
      let marketDataReceived = false;
      let marketUpdateReceived = false;
      
      const timeout = setTimeout(() => {
        this.addTestResult('market-subscription-timeout', false, 'Market data subscription timeout');
        console.log('  ❌ Market data subscription timeout');
        resolve();
      }, 10000);
      
      // Subscribe to market data
      this.socket.emit('subscribe', {
        type: 'market-data',
        symbol: null
      });
      
      // Listen for market data
      this.socket.on('market-data', (data) => {
        marketDataReceived = true;
        this.addTestResult('market-data-received', true, 'Market data received');
        console.log('  ✅ Market data received');
      });
      
      this.socket.on('market-update', (data) => {
        marketUpdateReceived = true;
        this.addTestResult('market-update-received', true, 'Market update received');
        console.log('  ✅ Market update received');
      });
      
      // Check if we received data
      setTimeout(() => {
        clearTimeout(timeout);
        
        if (marketDataReceived || marketUpdateReceived) {
          this.addTestResult('market-subscription-success', true, 'Market data subscription successful');
          console.log('  ✅ Market data subscription successful');
        } else {
          this.addTestResult('market-subscription-failed', false, 'No market data received');
          console.log('  ❌ No market data received');
        }
        
        resolve();
      }, 8000);
    });
  }
  
  async testNewsSubscription() {
    console.log('📰 Testing News Subscription...');
    
    return new Promise((resolve) => {
      let newsDataReceived = false;
      let newsUpdateReceived = false;
      
      const timeout = setTimeout(() => {
        this.addTestResult('news-subscription-timeout', false, 'News subscription timeout');
        console.log('  ❌ News subscription timeout');
        resolve();
      }, 10000);
      
      // Subscribe to news
      this.socket.emit('subscribe', {
        type: 'news',
        symbol: null
      });
      
      // Listen for news data
      this.socket.on('news-data', (data) => {
        newsDataReceived = true;
        this.addTestResult('news-data-received', true, 'News data received');
        console.log('  ✅ News data received');
      });
      
      this.socket.on('news-update', (data) => {
        newsUpdateReceived = true;
        this.addTestResult('news-update-received', true, 'News update received');
        console.log('  ✅ News update received');
      });
      
      // Check if we received data
      setTimeout(() => {
        clearTimeout(timeout);
        
        if (newsDataReceived || newsUpdateReceived) {
          this.addTestResult('news-subscription-success', true, 'News subscription successful');
          console.log('  ✅ News subscription successful');
        } else {
          this.addTestResult('news-subscription-failed', false, 'No news data received');
          console.log('  ❌ No news data received');
        }
        
        resolve();
      }, 8000);
    });
  }
  
  async testAIInsightsSubscription() {
    console.log('🤖 Testing AI Insights Subscription...');
    
    return new Promise((resolve) => {
      let aiDataReceived = false;
      let aiUpdateReceived = false;
      
      const timeout = setTimeout(() => {
        this.addTestResult('ai-subscription-timeout', false, 'AI insights subscription timeout');
        console.log('  ❌ AI insights subscription timeout');
        resolve();
      }, 10000);
      
      // Subscribe to AI insights
      this.socket.emit('subscribe', {
        type: 'ai-insights',
        symbol: null
      });
      
      // Listen for AI insights
      this.socket.on('ai-insights-data', (data) => {
        aiDataReceived = true;
        this.addTestResult('ai-data-received', true, 'AI insights data received');
        console.log('  ✅ AI insights data received');
      });
      
      this.socket.on('ai-insights-update', (data) => {
        aiUpdateReceived = true;
        this.addTestResult('ai-update-received', true, 'AI insights update received');
        console.log('  ✅ AI insights update received');
      });
      
      // Check if we received data
      setTimeout(() => {
        clearTimeout(timeout);
        
        if (aiDataReceived || aiUpdateReceived) {
          this.addTestResult('ai-subscription-success', true, 'AI insights subscription successful');
          console.log('  ✅ AI insights subscription successful');
        } else {
          this.addTestResult('ai-subscription-failed', false, 'No AI insights data received');
          console.log('  ❌ No AI insights data received');
        }
        
        resolve();
      }, 8000);
    });
  }
  
  async testDataRequests() {
    console.log('📡 Testing Data Requests...');
    
    return new Promise((resolve) => {
      let marketRequestReceived = false;
      let newsRequestReceived = false;
      
      const timeout = setTimeout(() => {
        this.addTestResult('data-requests-timeout', false, 'Data requests timeout');
        console.log('  ❌ Data requests timeout');
        resolve();
      }, 10000);
      
      // Request market data
      this.socket.emit('request-data', {
        type: 'market-data',
        symbol: 'JSE',
        timeframe: '1m'
      });
      
      // Request news data
      this.socket.emit('request-data', {
        type: 'news',
        symbol: null
      });
      
      // Listen for responses
      this.socket.on('market-data', (data) => {
        marketRequestReceived = true;
        this.addTestResult('market-request-success', true, 'Market data request successful');
        console.log('  ✅ Market data request successful');
      });
      
      this.socket.on('news-data', (data) => {
        newsRequestReceived = true;
        this.addTestResult('news-request-success', true, 'News data request successful');
        console.log('  ✅ News data request successful');
      });
      
      // Check if we received responses
      setTimeout(() => {
        clearTimeout(timeout);
        
        if (marketRequestReceived && newsRequestReceived) {
          this.addTestResult('data-requests-success', true, 'Data requests successful');
          console.log('  ✅ Data requests successful');
        } else {
          this.addTestResult('data-requests-failed', false, 'Some data requests failed');
          console.log('  ❌ Some data requests failed');
        }
        
        resolve();
      }, 8000);
    });
  }
  
  async testDisconnection() {
    console.log('🔌 Testing Disconnection...');
    
    return new Promise((resolve) => {
      let disconnected = false;
      
      const timeout = setTimeout(() => {
        this.addTestResult('disconnection-timeout', false, 'Disconnection timeout');
        console.log('  ❌ Disconnection timeout');
        resolve();
      }, 5000);
      
      this.socket.on('disconnect', () => {
        disconnected = true;
        this.addTestResult('disconnection-success', true, 'Disconnected successfully');
        console.log('  ✅ Disconnected successfully');
        clearTimeout(timeout);
        resolve();
      });
      
      // Disconnect after a short delay
      setTimeout(() => {
        this.socket.disconnect();
      }, 1000);
    });
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
    const reportPath = require('path').join(__dirname, '..', 'realtime-test-report.json');
    require('fs').writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    
    console.log(`\n📋 Real-time test report generated: ${reportPath}`);
    
    // Display summary
    console.log('\n📊 Real-time Test Summary:');
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
    console.log(`\n🎯 Real-time Score: ${score}%`);
    
    if (score >= 90) {
      console.log('🏆 Excellent real-time implementation!');
    } else if (score >= 70) {
      console.log('👍 Good real-time implementation with room for improvement');
    } else if (score >= 50) {
      console.log('⚠️  Real-time implementation needs work');
    } else {
      console.log('❌ Real-time implementation requires significant improvements');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new RealtimeTester();
  tester.runAllTests();
}

module.exports = RealtimeTester;
