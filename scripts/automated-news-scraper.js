/**
 * Automated News Scraper for JamStockAnalytics
 * Runs news scraping and AI processing on a schedule
 */

const { enhancedNewsService } = require('../lib/services/enhanced-news-service');

console.log('🚀 AUTOMATED NEWS SCRAPER');
console.log('=========================\n');

async function runNewsScraping() {
  try {
    console.log('📰 Starting automated news scraping...');
    
    // Initialize news sources if needed
    console.log('1. Initializing news sources...');
    await enhancedNewsService.initializeNewsSources();
    
    // Scrape all sources
    console.log('2. Scraping news from all sources...');
    await enhancedNewsService.scrapeAllSources();
    
    // Process articles with AI
    console.log('3. Processing articles with AI...');
    await enhancedNewsService.processArticlesWithAI();
    
    // Get statistics
    console.log('4. Getting scraping statistics...');
    const stats = await enhancedNewsService.getScrapingStats();
    
    console.log('\n📊 SCRAPING STATISTICS:');
    console.log('=======================');
    console.log(`Total Articles (24h): ${stats.totalArticles || 0}`);
    
    if (stats.sourceBreakdown) {
      console.log('\nSource Breakdown:');
      Object.entries(stats.sourceBreakdown).forEach(([source, count]) => {
        console.log(`  ${source}: ${count} articles`);
      });
    }
    
    if (stats.statusBreakdown) {
      console.log('\nProcessing Status:');
      Object.entries(stats.statusBreakdown).forEach(([status, count]) => {
        console.log(`  ${status}: ${count} articles`);
      });
    }
    
    console.log('\n✅ Automated news scraping completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in automated news scraping:', error);
    process.exit(1);
  }
}

// Run immediately if called directly
if (require.main === module) {
  runNewsScraping();
}

// Export for use in other scripts
module.exports = { runNewsScraping };
