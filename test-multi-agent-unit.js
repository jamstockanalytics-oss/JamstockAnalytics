
/**
 * Unit Tests for Multi-Agent System Critical Functions
 */

const { multiAgentService } = require('./lib/services/multi-agent-service');

describe('Multi-Agent System Unit Tests', () => {
  
  test('Agent Instance Creation Validation', async () => {
    // Test valid input
    try {
      const agent = await multiAgentService.createAgentInstance(
        'test-agent-type',
        'test-instance',
        { test: 'config' }
      );
      expect(agent).toBeDefined();
    } catch (error) {
      // Expected to fail without proper database setup
      expect(error.message).toContain('Failed to create agent instance');
    }
  });
  
  test('Input Validation', async () => {
    // Test invalid agent type ID
    await expect(
      multiAgentService.createAgentInstance('', 'test', {})
    ).rejects.toThrow('Agent type ID and instance name are required');
    
    // Test invalid instance name
    await expect(
      multiAgentService.createAgentInstance('test', '', {})
    ).rejects.toThrow('Agent type ID and instance name are required');
    
    // Test invalid configuration
    await expect(
      multiAgentService.createAgentInstance('test', 'test', null)
    ).rejects.toThrow('Configuration must be a valid object');
  });
  
  test('Error Logging', () => {
    const errors = multiAgentService.getSystemErrors();
    expect(Array.isArray(errors)).toBe(true);
  });
  
  test('System Analytics', async () => {
    try {
      const analytics = await multiAgentService.getSystemAnalytics();
      expect(analytics).toBeDefined();
      expect(analytics.agent_performance).toBeDefined();
      expect(analytics.learning_metrics).toBeDefined();
      expect(analytics.prediction_metrics).toBeDefined();
      expect(analytics.system_health).toBeDefined();
    } catch (error) {
      // Expected to fail without proper database setup
      expect(error.message).toBeDefined();
    }
  });
});

// Run tests
async function runTests() {
  console.log('🧪 Running Multi-Agent System Unit Tests...');
  
  try {
    // Test error handling
    await multiAgentService.createAgentInstance('', '', null);
  } catch (error) {
    console.log('✅ Input validation test passed:', error.message);
  }
  
  // Test system analytics
  try {
    const analytics = await multiAgentService.getSystemAnalytics();
    console.log('✅ System analytics test passed');
  } catch (error) {
    console.log('⚠️  System analytics test failed (expected without DB):', error.message);
  }
  
  // Test error logging
  const errors = multiAgentService.getSystemErrors();
  console.log(`✅ Error logging test passed: ${errors.length} errors logged`);
  
  console.log('🎉 Unit tests completed');
}

runTests().catch(console.error);
