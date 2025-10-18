const axios = require('axios');
const crypto = require('crypto');

// Webhook test configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
const MAIN_APP_URL = process.env.MAIN_APP_URL || 'http://localhost:3001';

// Test data
const testEvents = {
  marketDataUpdate: {
    event: 'market_data_update',
    data: {
      symbol: 'NCBFG',
      price: 95.50,
      change: 2.3,
      changePercentage: 2.47,
      triggerAI: true
    },
    source: 'market_data_service'
  },
  
  newsUpdate: {
    event: 'news_update',
    data: {
      title: 'NCB Financial Group Reports Strong Q3 Earnings',
      summary: 'NCB Financial Group reported strong third quarter earnings with significant growth in digital banking services.',
      sentiment: 'positive',
      symbols: ['NCBFG'],
      impact: 'high'
    },
    source: 'news_service'
  },
  
  aiAnalysisComplete: {
    event: 'ai_analysis_complete',
    data: {
      symbol: 'NCBFG',
      recommendation: 'buy',
      confidence: 85,
      priceTarget: 98.50,
      riskLevel: 'medium'
    },
    source: 'ai_service'
  },
  
  userActivity: {
    event: 'user_activity',
    data: {
      userId: 'user123',
      activity: 'portfolio_update',
      timestamp: new Date().toISOString()
    },
    source: 'user_service'
  }
};

// Create webhook signature
function createSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
}

// Test webhook endpoint
async function testWebhook(eventName, eventData) {
  try {
    console.log(`\n🧪 Testing ${eventName}...`);
    
    const signature = createSignature(eventData, WEBHOOK_SECRET);
    
    const response = await axios.post(`${WEBHOOK_URL}/webhook`, eventData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': `sha256=${signature}`
      },
      timeout: 10000
    });
    
    console.log(`✅ ${eventName} test passed:`, response.data);
    return true;
    
  } catch (error) {
    console.error(`❌ ${eventName} test failed:`, error.message);
    return false;
  }
}

// Test main app webhook endpoints
async function testMainAppWebhooks() {
  try {
    console.log('\n🧪 Testing main app webhook endpoints...');
    
    // Test market update webhook
    const marketResponse = await axios.post(`${MAIN_APP_URL}/api/webhook/market-update`, {
      symbol: 'NCBFG',
      price: 95.50,
      change: 2.3,
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Market update webhook test passed:', marketResponse.data);
    
    // Test news update webhook
    const newsResponse = await axios.post(`${MAIN_APP_URL}/api/webhook/news-update`, {
      title: 'Test News Update',
      summary: 'This is a test news update',
      sentiment: 'positive',
      symbols: ['NCBFG'],
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ News update webhook test passed:', newsResponse.data);
    
    // Test AI analysis webhook
    const aiResponse = await axios.post(`${MAIN_APP_URL}/api/webhook/ai-analysis`, {
      symbol: 'NCBFG',
      recommendation: 'buy',
      confidence: 85,
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ AI analysis webhook test passed:', aiResponse.data);
    
    return true;
    
  } catch (error) {
    console.error('❌ Main app webhook test failed:', error.message);
    return false;
  }
}

// Test health endpoints
async function testHealthEndpoints() {
  try {
    console.log('\n🧪 Testing health endpoints...');
    
    // Test webhook health
    const webhookHealth = await axios.get(`${WEBHOOK_URL}/health`);
    console.log('✅ Webhook health check passed:', webhookHealth.data);
    
    // Test main app health
    const mainAppHealth = await axios.get(`${MAIN_APP_URL}/api/health`);
    console.log('✅ Main app health check passed:', mainAppHealth.data);
    
    return true;
    
  } catch (error) {
    console.error('❌ Health check test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting webhook integration tests...');
  console.log(`Webhook URL: ${WEBHOOK_URL}`);
  console.log(`Main App URL: ${MAIN_APP_URL}`);
  
  const results = {
    health: false,
    webhook: false,
    mainApp: false
  };
  
  // Test health endpoints
  results.health = await testHealthEndpoints();
  
  // Test webhook service
  results.webhook = await testWebhook('market_data_update', testEvents.marketDataUpdate);
  results.webhook = await testWebhook('news_update', testEvents.newsUpdate) && results.webhook;
  results.webhook = await testWebhook('ai_analysis_complete', testEvents.aiAnalysisComplete) && results.webhook;
  results.webhook = await testWebhook('user_activity', testEvents.userActivity) && results.webhook;
  
  // Test main app webhooks
  results.mainApp = await testMainAppWebhooks();
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log(`Health Endpoints: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Webhook Service: ${results.webhook ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Main App Webhooks: ${results.mainApp ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = results.health && results.webhook && results.mainApp;
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return allPassed;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution error:', error);
      process.exit(1);
    });
}

module.exports = {
  testWebhook,
  testMainAppWebhooks,
  testHealthEndpoints,
  runAllTests
};
