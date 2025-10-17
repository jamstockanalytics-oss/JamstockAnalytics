/**
 * News Scraping Scheduler for JamStockAnalytics
 * Schedules automated news scraping and processing
 */

const cron = require('node-cron');
const { runNewsScraping } = require('./automated-news-scraper');

console.log('⏰ NEWS SCRAPING SCHEDULER');
console.log('==========================\n');

class NewsScheduler {
  constructor() {
    this.isRunning = false;
    this.scheduledJobs = [];
  }

  /**
   * Start the news scraping scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    console.log('Starting news scraping scheduler...');

    // Schedule news scraping every 30 minutes
    const scrapingJob = cron.schedule('*/30 * * * *', async () => {
      console.log('\n🕐 Scheduled news scraping triggered...');
      try {
        await runNewsScraping();
      } catch (error) {
        console.error('Scheduled scraping failed:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Jamaica"
    });

    // Schedule AI processing every 15 minutes
    const processingJob = cron.schedule('*/15 * * * *', async () => {
      console.log('\n🤖 Scheduled AI processing triggered...');
      try {
        const { enhancedNewsService } = require('../lib/services/enhanced-news-service');
        await enhancedNewsService.processArticlesWithAI();
      } catch (error) {
        console.error('Scheduled AI processing failed:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Jamaica"
    });

    // Schedule cleanup every hour
    const cleanupJob = cron.schedule('0 * * * *', async () => {
      console.log('\n🧹 Scheduled cleanup triggered...');
      try {
        await this.cleanupOldArticles();
      } catch (error) {
        console.error('Scheduled cleanup failed:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Jamaica"
    });

    // Start all jobs
    scrapingJob.start();
    processingJob.start();
    cleanupJob.start();

    this.scheduledJobs = [scrapingJob, processingJob, cleanupJob];
    this.isRunning = true;

    console.log('✅ News scraping scheduler started');
    console.log('📅 News scraping: Every 30 minutes');
    console.log('🤖 AI processing: Every 15 minutes');
    console.log('🧹 Cleanup: Every hour');
    console.log('🌍 Timezone: America/Jamaica');
  }

  /**
   * Stop the news scraping scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log('Scheduler is not running');
      return;
    }

    console.log('Stopping news scraping scheduler...');

    this.scheduledJobs.forEach(job => {
      job.stop();
    });

    this.scheduledJobs = [];
    this.isRunning = false;

    console.log('✅ News scraping scheduler stopped');
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: this.scheduledJobs.length,
      nextRuns: this.scheduledJobs.map(job => ({
        next: job.nextDate(),
        task: job.getStatus()
      }))
    };
  }

  /**
   * Clean up old articles
   */
  async cleanupOldArticles() {
    try {
      const { supabase } = require('../lib/supabase/client');
      
      // Delete articles older than 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const { error } = await supabase
        .from('articles')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (error) {
        throw new Error(`Cleanup error: ${error.message}`);
      }

      console.log('✅ Old articles cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up old articles:', error);
    }
  }

  /**
   * Run immediate scraping
   */
  async runImmediate() {
    console.log('🚀 Running immediate news scraping...');
    try {
      await runNewsScraping();
    } catch (error) {
      console.error('Immediate scraping failed:', error);
    }
  }
}

// Create scheduler instance
const scheduler = new NewsScheduler();

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, stopping scheduler...');
  scheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, stopping scheduler...');
  scheduler.stop();
  process.exit(0);
});

// Command line interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'start':
      scheduler.start();
      // Keep the process running
      setInterval(() => {
        // Keep alive
      }, 1000);
      break;

    case 'stop':
      scheduler.stop();
      break;

    case 'status':
      const status = scheduler.getStatus();
      console.log('📊 Scheduler Status:');
      console.log(`Running: ${status.isRunning}`);
      console.log(`Active Jobs: ${status.activeJobs}`);
      if (status.nextRuns.length > 0) {
        console.log('Next Runs:');
        status.nextRuns.forEach((run, index) => {
          console.log(`  Job ${index + 1}: ${run.next}`);
        });
      }
      break;

    case 'run':
      scheduler.runImmediate();
      break;

    default:
      console.log('Usage: node news-scheduler.js [start|stop|status|run]');
      console.log('  start  - Start the scheduler');
      console.log('  stop   - Stop the scheduler');
      console.log('  status - Show scheduler status');
      console.log('  run    - Run immediate scraping');
      break;
  }
}

module.exports = { NewsScheduler, scheduler };
