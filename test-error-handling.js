
/**
 * Error Handling Test for Multi-Agent System
 */

const { multiAgentService } = require('./lib/services/multi-agent-service');

async function testErrorHandling() {
  console.log('🧪 Testing Error Handling...');
  
  try {
    // Test with invalid inputs
    await multiAgentService.createAgentInstance('', '', null);
  } catch (error) {
    console.log('✅ Input validation working:', error.message);
  }
  
  try {
    // Test with invalid user ID
    await multiAgentService.getUserBehaviorPredictions('');
  } catch (error) {
    console.log('✅ User ID validation working:', error.message);
  }
  
  // Check system errors
  const errors = multiAgentService.getSystemErrors();
  console.log(`📊 System errors logged: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('Recent errors:');
    errors.slice(-3).forEach(error => {
      console.log(`  - [${error.severity}] ${error.type}: ${error.message}`);
    });
  }
  
  console.log('✅ Error handling test complete');
}

testErrorHandling().catch(console.error);
