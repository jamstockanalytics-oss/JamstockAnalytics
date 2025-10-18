#!/usr/bin/env node

// Sentiment Analysis Testing Script for JamStockAnalytics
const axios = require('axios');

class SentimentTester {
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
    this.baseUrl = process.env.SERVER_URL || 'http://localhost:3000';
  }
  
  async runAllTests() {
    console.log('🧠 Starting Sentiment Analysis Tests...\n');
    
    try {
      // Test 1: Overall sentiment endpoint
      await this.testOverallSentiment();
      
      // Test 2: News sentiment endpoint
      await this.testNewsSentiment();
      
      // Test 3: Market sentiment endpoint
      await this.testMarketSentiment();
      
      // Test 4: Social sentiment endpoint
      await this.testSocialSentiment();
      
      // Test 5: Sentiment history endpoint
      await this.testSentimentHistory();
      
      // Test 6: Custom text analysis
      await this.testCustomTextAnalysis();
      
      // Test 7: Symbol-specific sentiment
      await this.testSymbolSentiment();
      
      // Test 8: Sentiment status
      await this.testSentimentStatus();
      
      // Generate report
      this.generateReport();
      
      console.log('\n✅ Sentiment analysis testing completed!');
      
    } catch (error) {
      console.error('❌ Sentiment analysis testing failed:', error.message);
    }
  }
  
  async testOverallSentiment() {
    console.log('📊 Testing Overall Sentiment...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/sentiment/overall`);
      
      if (response.status === 200 && response.data.success) {
        this.addTestResult('overall-sentiment-success', true, 'Overall sentiment endpoint working');
        console.log('  ✅ Overall sentiment endpoint working');
        
        // Test data structure
        const data = response.data.data;
        if (data && typeof data.score === 'number' && data.sentiment) {
          this.addTestResult('overall-sentiment-data', true, 'Overall sentiment data structure valid');
          console.log('  ✅ Overall sentiment data structure valid');
        } else {
          this.addTestResult('overall-sentiment-data', false, 'Overall sentiment data structure invalid');
          console.log('  ❌ Overall sentiment data structure invalid');
        }
      } else {
        this.addTestResult('overall-sentiment-success', false, 'Overall sentiment endpoint failed');
        console.log('  ❌ Overall sentiment endpoint failed');
      }
      
    } catch (error) {
      this.addTestResult('overall-sentiment-error', false, `Overall sentiment error: ${error.message}`);
      console.log('  ❌ Overall sentiment error:', error.message);
    }
  }
  
  async testNewsSentiment() {
    console.log('📰 Testing News Sentiment...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/sentiment/news`);
      
      if (response.status === 200 && response.data.success) {
        this.addTestResult('news-sentiment-success', true, 'News sentiment endpoint working');
        console.log('  ✅ News sentiment endpoint working');
        
        // Test data structure
        const data = response.data.data;
        if (data && typeof data.score === 'number' && data.sentiment) {
          this.addTestResult('news-sentiment-data', true, 'News sentiment data structure valid');
          console.log('  ✅ News sentiment data structure valid');
        } else {
          this.addTestResult('news-sentiment-data', false, 'News sentiment data structure invalid');
          console.log('  ❌ News sentiment data structure invalid');
        }
      } else {
        this.addTestResult('news-sentiment-success', false, 'News sentiment endpoint failed');
        console.log('  ❌ News sentiment endpoint failed');
      }
      
    } catch (error) {
      this.addTestResult('news-sentiment-error', false, `News sentiment error: ${error.message}`);
      console.log('  ❌ News sentiment error:', error.message);
    }
  }
  
  async testMarketSentiment() {
    console.log('📈 Testing Market Sentiment...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/sentiment/market`);
      
      if (response.status === 200 && response.data.success) {
        this.addTestResult('market-sentiment-success', true, 'Market sentiment endpoint working');
        console.log('  ✅ Market sentiment endpoint working');
        
        // Test data structure
        const data = response.data.data;
        if (data && typeof data.score === 'number' && data.sentiment) {
          this.addTestResult('market-sentiment-data', true, 'Market sentiment data structure valid');
          console.log('  ✅ Market sentiment data structure valid');
        } else {
          this.addTestResult('market-sentiment-data', false, 'Market sentiment data structure invalid');
          console.log('  ❌ Market sentiment data structure invalid');
        }
      } else {
        this.addTestResult('market-sentiment-success', false, 'Market sentiment endpoint failed');
        console.log('  ❌ Market sentiment endpoint failed');
      }
      
    } catch (error) {
      this.addTestResult('market-sentiment-error', false, `Market sentiment error: ${error.message}`);
      console.log('  ❌ Market sentiment error:', error.message);
    }
  }
  
  async testSocialSentiment() {
    console.log('📱 Testing Social Sentiment...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/sentiment/social`);
      
      if (response.status === 200 && response.data.success) {
        this.addTestResult('social-sentiment-success', true, 'Social sentiment endpoint working');
        console.log('  ✅ Social sentiment endpoint working');
        
        // Test data structure
        const data = response.data.data;
        if (data && typeof data.score === 'number' && data.sentiment) {
          this.addTestResult('social-sentiment-data', true, 'Social sentiment data structure valid');
          console.log('  ✅ Social sentiment data structure valid');
        } else {
          this.addTestResult('social-sentiment-data', false, 'Social sentiment data structure invalid');
          console.log('  ❌ Social sentiment data structure invalid');
        }
      } else {
        this.addTestResult('social-sentiment-success', false, 'Social sentiment endpoint failed');
        console.log('  ❌ Social sentiment endpoint failed');
      }
      
    } catch (error) {
      this.addTestResult('social-sentiment-error', false, `Social sentiment error: ${error.message}`);
      console.log('  ❌ Social sentiment error:', error.message);
    }
  }
  
  async testSentimentHistory() {
    console.log('📊 Testing Sentiment History...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/sentiment/history?timeframe=24h&limit=10`);
      
      if (response.status === 200 && response.data.success) {
        this.addTestResult('sentiment-history-success', true, 'Sentiment history endpoint working');
        console.log('  ✅ Sentiment history endpoint working');
        
        // Test data structure
        const data = response.data.data;
        if (Array.isArray(data)) {
          this.addTestResult('sentiment-history-data', true, 'Sentiment history data structure valid');
          console.log('  ✅ Sentiment history data structure valid');
        } else {
          this.addTestResult('sentiment-history-data', false, 'Sentiment history data structure invalid');
          console.log('  ❌ Sentiment history data structure invalid');
        }
      } else {
        this.addTestResult('sentiment-history-success', false, 'Sentiment history endpoint failed');
        console.log('  ❌ Sentiment history endpoint failed');
      }
      
    } catch (error) {
      this.addTestResult('sentiment-history-error', false, `Sentiment history error: ${error.message}`);
      console.log('  ❌ Sentiment history error:', error.message);
    }
  }
  
  async testCustomTextAnalysis() {
    console.log('🔍 Testing Custom Text Analysis...');
    
    try {
      const testTexts = [
        'The market is performing excellently with strong growth',
        'Investors are concerned about market volatility',
        'The stock price remained stable throughout the day'
      ];
      
      for (const text of testTexts) {
        const response = await axios.post(`${this.baseUrl}/api/sentiment/analyze`, {
          text: text
        });
        
        if (response.status === 200 && response.data.success) {
          this.addTestResult(`custom-analysis-${text.substring(0, 20)}`, true, `Custom analysis working for: ${text.substring(0, 30)}...`);
          console.log(`  ✅ Custom analysis working for: ${text.substring(0, 30)}...`);
          
          // Test data structure
          const data = response.data.data;
          if (data && typeof data.score === 'number' && data.sentiment && data.confidence) {
            this.addTestResult(`custom-analysis-data-${text.substring(0, 20)}`, true, 'Custom analysis data structure valid');
            console.log('  ✅ Custom analysis data structure valid');
          } else {
            this.addTestResult(`custom-analysis-data-${text.substring(0, 20)}`, false, 'Custom analysis data structure invalid');
            console.log('  ❌ Custom analysis data structure invalid');
          }
        } else {
          this.addTestResult(`custom-analysis-${text.substring(0, 20)}`, false, `Custom analysis failed for: ${text.substring(0, 30)}...`);
          console.log(`  ❌ Custom analysis failed for: ${text.substring(0, 30)}...`);
        }
      }
      
    } catch (error) {
      this.addTestResult('custom-analysis-error', false, `Custom analysis error: ${error.message}`);
      console.log('  ❌ Custom analysis error:', error.message);
    }
  }
  
  async testSymbolSentiment() {
    console.log('🏷️  Testing Symbol Sentiment...');
    
    try {
      const symbols = ['JSE', 'NCBFG', 'SJ', 'BIL'];
      
      for (const symbol of symbols) {
        const response = await axios.get(`${this.baseUrl}/api/sentiment/symbol/${symbol}`);
        
        if (response.status === 200 && response.data.success) {
          this.addTestResult(`symbol-sentiment-${symbol}`, true, `Symbol sentiment working for ${symbol}`);
          console.log(`  ✅ Symbol sentiment working for ${symbol}`);
          
          // Test data structure
          const data = response.data.data;
          if (data && data.symbol === symbol) {
            this.addTestResult(`symbol-sentiment-data-${symbol}`, true, `Symbol sentiment data structure valid for ${symbol}`);
            console.log(`  ✅ Symbol sentiment data structure valid for ${symbol}`);
          } else {
            this.addTestResult(`symbol-sentiment-data-${symbol}`, false, `Symbol sentiment data structure invalid for ${symbol}`);
            console.log(`  ❌ Symbol sentiment data structure invalid for ${symbol}`);
          }
        } else {
          this.addTestResult(`symbol-sentiment-${symbol}`, false, `Symbol sentiment failed for ${symbol}`);
          console.log(`  ❌ Symbol sentiment failed for ${symbol}`);
        }
      }
      
    } catch (error) {
      this.addTestResult('symbol-sentiment-error', false, `Symbol sentiment error: ${error.message}`);
      console.log('  ❌ Symbol sentiment error:', error.message);
    }
  }
  
  async testSentimentStatus() {
    console.log('📊 Testing Sentiment Status...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/sentiment/status`);
      
      if (response.status === 200 && response.data.success) {
        this.addTestResult('sentiment-status-success', true, 'Sentiment status endpoint working');
        console.log('  ✅ Sentiment status endpoint working');
        
        // Test data structure
        const data = response.data.data;
        if (data && typeof data.isRunning === 'boolean') {
          this.addTestResult('sentiment-status-data', true, 'Sentiment status data structure valid');
          console.log('  ✅ Sentiment status data structure valid');
        } else {
          this.addTestResult('sentiment-status-data', false, 'Sentiment status data structure invalid');
          console.log('  ❌ Sentiment status data structure invalid');
        }
      } else {
        this.addTestResult('sentiment-status-success', false, 'Sentiment status endpoint failed');
        console.log('  ❌ Sentiment status endpoint failed');
      }
      
    } catch (error) {
      this.addTestResult('sentiment-status-error', false, `Sentiment status error: ${error.message}`);
      console.log('  ❌ Sentiment status error:', error.message);
    }
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
    const reportPath = require('path').join(__dirname, '..', 'sentiment-test-report.json');
    require('fs').writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    
    console.log(`\n📋 Sentiment test report generated: ${reportPath}`);
    
    // Display summary
    console.log('\n📊 Sentiment Test Summary:');
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
    console.log(`\n🎯 Sentiment Score: ${score}%`);
    
    if (score >= 90) {
      console.log('🏆 Excellent sentiment analysis implementation!');
    } else if (score >= 70) {
      console.log('👍 Good sentiment analysis implementation with room for improvement');
    } else if (score >= 50) {
      console.log('⚠️  Sentiment analysis implementation needs work');
    } else {
      console.log('❌ Sentiment analysis implementation requires significant improvements');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SentimentTester();
  tester.runAllTests();
}

module.exports = SentimentTester;
