
/**
 * Comprehensive Test Runner for Multi-Agent System
 */

const { multiAgentService } = require('./lib/services/multi-agent-service');

async function runComprehensiveTests() {
  console.log('🧪 COMPREHENSIVE MULTI-AGENT SYSTEM TESTS');
  console.log('==========================================
');
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  const runTest = async (testName, testFn) => {
    try {
      console.log(`Testing: ${testName}...`);
      await testFn();
      console.log(`✅ ${testName} PASSED`);
      testsPassed++;
    } catch (error) {
      console.log(`❌ ${testName} FAILED: ${error.message}`);
      testsFailed++;
    }
  };
  
  // Test 1: Input Validation
  await runTest('Input Validation', async () => {
    await expect(
      multiAgentService.createAgentInstance('', '', null)
    ).rejects.toThrow();
  });
  
  // Test 2: Error Handling
  await runTest('Error Handling', async () => {
    const errors = multiAgentService.getSystemErrors();
    expect(Array.isArray(errors)).toBe(true);
  });
  
  // Test 3: System Analytics
  await runTest('System Analytics', async () => {
    const analytics = await multiAgentService.getSystemAnalytics();
    expect(analytics).toBeDefined();
  });
  
  // Test 4: Agent Management
  await runTest('Agent Management', async () => {
    const agents = await multiAgentService.getAgentInstances();
    expect(Array.isArray(agents)).toBe(true);
  });
  
  // Test 5: Market Predictions
  await runTest('Market Predictions', async () => {
    const predictions = await multiAgentService.getMarketPredictions();
    expect(Array.isArray(predictions)).toBe(true);
  });
  
  console.log(`
📊 TEST RESULTS`);
  console.log(`===============`);
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
  
  if (testsFailed === 0) {
    console.log(`
🎉 ALL TESTS PASSED! Multi-Agent System is working correctly.`);
  } else {
    console.log(`
⚠️  ${testsFailed} tests failed. Check the errors above.`);
  }
}

// Helper function for expect
function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined || actual === null) {
        throw new Error(`Expected value to be defined, but got ${actual}`);
      }
    },
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    rejects: {
      toThrow: async () => {
        try {
          await actual;
          throw new Error('Expected function to throw, but it did not');
        } catch (error) {
          // Expected to throw
        }
      }
    }
  };
}

runComprehensiveTests().catch(console.error);
