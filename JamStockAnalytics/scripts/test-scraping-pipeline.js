// Test Complete Scraping Pipeline
require('dotenv').config();
const { scrapingService } = require('../lib/services/scraping-service');

async function testScrapingPipeline() {
  console.log('🧪 Testing Complete Scraping Pipeline...\n');

  try {
    // Test 1: Run complete scraping pipeline
    console.log('🚀 Running complete scraping pipeline...');
    await scrapingService.runScrapingPipeline();

    // Test 2: Get scraping statistics
    console.log('\n📊 Getting scraping statistics...');
    const stats = await scrapingService.getScrapingStats();
    
    console.log('📈 Scraping Statistics:');
    console.log(`  • Total Articles: ${stats.totalArticles}`);
    console.log(`  • Processed Articles: ${stats.processedArticles}`);
    console.log(`  • Pending Articles: ${stats.pendingArticles}`);
    console.log(`  • Last Scraping Date: ${stats.lastScrapingDate || 'Never'}`);

    console.log('\n🎉 Scraping pipeline test completed successfully!');
    console.log('\n📋 Your storage buckets are now ready for:');
    console.log('• Automated news article scraping');
    console.log('• AI-powered content analysis');
    console.log('• Market data collection');
    console.log('• User file management');
    console.log('• Company data storage');

  } catch (error) {
    console.error(`❌ Scraping pipeline test failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the test
testScrapingPipeline().catch(console.error);
