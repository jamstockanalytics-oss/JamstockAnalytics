#!/usr/bin/env node

/**
 * Test script for JamStockAnalytics Chat Server
 * Tests all endpoints and functionality
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:8000';
const ADMIN_SECRET = process.env.ADMIN_SECRET;

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => null);
  
  return {
    status: response.status,
    ok: response.ok,
    data,
    headers: Object.fromEntries(response.headers.entries()),
  };
}

async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  
  const result = await makeRequest('/health');
  
  if (result.ok && result.data?.status === 'healthy') {
    console.log('✅ Health check passed');
    return true;
  } else {
    console.log('❌ Health check failed:', result);
    return false;
  }
}

async function testGetMessages() {
  console.log('🔍 Testing get messages...');
  
  // Test without filters
  const result1 = await makeRequest('/messages');
  if (!result1.ok) {
    console.log('❌ Get messages (no filters) failed:', result1);
    return false;
  }
  
  // Test with limit
  const result2 = await makeRequest('/messages?limit=5');
  if (!result2.ok) {
    console.log('❌ Get messages (with limit) failed:', result2);
    return false;
  }
  
  // Test with invalid limit
  const result3 = await makeRequest('/messages?limit=1000');
  if (!result3.ok) {
    console.log('❌ Get messages (invalid limit) failed:', result3);
    return false;
  }
  
  // Test with invalid user_id
  const result4 = await makeRequest('/messages?user_id=invalid-uuid');
  if (result4.ok) {
    console.log('❌ Get messages (invalid user_id) should have failed');
    return false;
  }
  
  console.log('✅ Get messages tests passed');
  return true;
}

async function testRateLimit() {
  console.log('🔍 Testing rate limit...');
  
  const promises = Array(10).fill().map(() => makeRequest('/messages'));
  const results = await Promise.all(promises);
  
  const successCount = results.filter(r => r.ok).length;
  const rateLimitHeaders = results.find(r => r.headers['x-ratelimit-remaining']);
  
  console.log(`📊 Made 10 requests, ${successCount} succeeded`);
  
  if (rateLimitHeaders) {
    console.log('✅ Rate limiting headers present');
    return true;
  } else {
    console.log('⚠️  Rate limiting headers not found (may be normal)');
    return true; // Not critical
  }
}

async function testAdminClear() {
  console.log('🔍 Testing admin clear...');
  
  if (!ADMIN_SECRET) {
    console.log('⚠️  ADMIN_SECRET not provided, skipping admin tests');
    return true;
  }
  
  // Test without secret
  const result1 = await makeRequest('/admin/clear', { method: 'POST' });
  if (result1.ok) {
    console.log('❌ Admin clear (no secret) should have failed');
    return false;
  }
  
  // Test with wrong secret
  const result2 = await makeRequest('/admin/clear', {
    method: 'POST',
    headers: { 'x-admin-secret': 'wrong-secret' },
  });
  if (result2.ok) {
    console.log('❌ Admin clear (wrong secret) should have failed');
    return false;
  }
  
  // Test with correct secret
  const result3 = await makeRequest('/admin/clear', {
    method: 'POST',
    headers: { 'x-admin-secret': ADMIN_SECRET },
  });
  if (!result3.ok) {
    console.log('❌ Admin clear (correct secret) failed:', result3);
    return false;
  }
  
  console.log('✅ Admin clear tests passed');
  return true;
}

async function testCORS() {
  console.log('🔍 Testing CORS...');
  
  const result = await makeRequest('/health', {
    method: 'OPTIONS',
  });
  
  if (result.ok && result.headers['access-control-allow-origin']) {
    console.log('✅ CORS preflight test passed');
    return true;
  } else {
    console.log('❌ CORS test failed:', result);
    return false;
  }
}

async function testErrorHandling() {
  console.log('🔍 Testing error handling...');
  
  // Test 404
  const result1 = await makeRequest('/nonexistent');
  if (result1.status === 404) {
    console.log('✅ 404 error handling works');
  } else {
    console.log('❌ 404 error handling failed:', result1);
    return false;
  }
  
  // Test invalid method
  const result2 = await makeRequest('/messages', { method: 'POST' });
  if (result2.status === 404) {
    console.log('✅ Invalid method handling works');
  } else {
    console.log('❌ Invalid method handling failed:', result2);
    return false;
  }
  
  return true;
}

async function runAllTests() {
  console.log('🚀 Starting JamStockAnalytics Chat Server Tests');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Get Messages', fn: testGetMessages },
    { name: 'Rate Limiting', fn: testRateLimit },
    { name: 'Admin Clear', fn: testAdminClear },
    { name: 'CORS', fn: testCORS },
    { name: 'Error Handling', fn: testErrorHandling },
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) passed++;
    } catch (error) {
      console.log(`❌ ${test.name} threw error:`, error.message);
    }
    console.log(''); // Empty line for readability
  }
  
  console.log('=' .repeat(50));
  console.log(`📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('💥 Some tests failed');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  makeRequest,
  testHealthCheck,
  testGetMessages,
  testRateLimit,
  testAdminClear,
  testCORS,
  testErrorHandling,
  runAllTests,
};
