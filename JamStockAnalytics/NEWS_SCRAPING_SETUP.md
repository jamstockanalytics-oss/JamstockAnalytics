# News Scraping Configuration Guide

**Date:** October 15, 2024  
**Purpose:** Set up news aggregation from Jamaican sources  
**Status:** 🔧 CONFIGURATION REQUIRED  

## 🎯 Overview

This guide provides comprehensive instructions for setting up news scraping and aggregation from Jamaican financial news sources to populate the JamStockAnalytics application.

## 📰 Jamaican News Sources

### Primary Sources
1. **Jamaica Observer** - `https://www.jamaicaobserver.com`
2. **Jamaica Gleaner** - `https://jamaica-gleaner.com`
3. **RJR News** - `https://rjrnewsonline.com`
4. **Loop Jamaica** - `https://www.loopjamaica.com`
5. **Jamaica Information Service** - `https://jis.gov.jm`

### Financial Focus Areas
- JSE (Jamaica Stock Exchange) news
- Junior Market updates
- Banking and financial services
- Insurance sector news
- Investment and market analysis
- Economic indicators and policy

## 🔧 Scraping Configuration

### Step 1: Create Scraping Service

Create a new file `scripts/news-scraper.js`:

```javascript
#!/usr/bin/env node

/**
 * News Scraping Service for JamStockAnalytics
 * Aggregates news from Jamaican financial sources
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const parser = new Parser();

// News sources configuration
const newsSources = [
  {
    name: 'Jamaica Observer',
    baseUrl: 'https://www.jamaicaobserver.com',
    rssUrl: 'https://www.jamaicaobserver.com/rss',
    selectors: {
      title: 'h1, h2, .headline',
      content: '.article-content, .story-body, .content',
      date: '.date, .published, time',
      author: '.author, .byline'
    },
    keywords: ['JSE', 'stock', 'market', 'financial', 'banking', 'investment']
  },
  {
    name: 'Jamaica Gleaner',
    baseUrl: 'https://jamaica-gleaner.com',
    rssUrl: 'https://jamaica-gleaner.com/rss',
    selectors: {
      title: 'h1, h2, .headline',
      content: '.article-content, .story-body, .content',
      date: '.date, .published, time',
      author: '.author, .byline'
    },
    keywords: ['JSE', 'stock', 'market', 'financial', 'banking', 'investment']
  },
  {
    name: 'RJR News',
    baseUrl: 'https://rjrnewsonline.com',
    rssUrl: 'https://rjrnewsonline.com/rss',
    selectors: {
      title: 'h1, h2, .headline',
      content: '.article-content, .story-body, .content',
      date: '.date, .published, time',
      author: '.author, .byline'
    },
    keywords: ['JSE', 'stock', 'market', 'financial', 'banking', 'investment']
  },
  {
    name: 'Loop Jamaica',
    baseUrl: 'https://www.loopjamaica.com',
    rssUrl: 'https://www.loopjamaica.com/rss',
    selectors: {
      title: 'h1, h2, .headline',
      content: '.article-content, .story-body, .content',
      date: '.date, .published, time',
      author: '.author, .byline'
    },
    keywords: ['JSE', 'stock', 'market', 'financial', 'banking', 'investment']
  }
];

// JSE Company tickers for relevance scoring
const jseCompanies = [
  'NCBFG', 'SGJ', 'JMMB', 'GHL', 'SJ', 'PJAM', 'CAC', 'KLE', 'PULS', 'MIL',
  'KEX', 'ISP', 'DCOVE', 'PURITY', 'ELITE'
];

class NewsScraper {
  constructor() {
    this.processedUrls = new Set();
  }

  async scrapeRSSFeed(source) {
    try {
      console.log(`📰 Scraping ${source.name} RSS feed...`);
      
      const feed = await parser.parseURL(source.rssUrl);
      const articles = [];

      for (const item of feed.items.slice(0, 10)) { // Limit to 10 most recent
        if (this.processedUrls.has(item.link)) {
          continue;
        }

        const article = await this.processArticle(item, source);
        if (article) {
          articles.push(article);
          this.processedUrls.add(item.link);
        }
      }

      console.log(`✅ Scraped ${articles.length} articles from ${source.name}`);
      return articles;
    } catch (error) {
      console.error(`❌ Error scraping ${source.name}:`, error.message);
      return [];
    }
  }

  async processArticle(item, source) {
    try {
      // Check if article is financial/business related
      const isFinancial = this.isFinancialArticle(item.title, item.contentSnippet, source.keywords);
      if (!isFinancial) {
        return null;
      }

      // Extract company tickers
      const companyTickers = this.extractCompanyTickers(item.title, item.contentSnippet);
      
      // Calculate AI priority score
      const aiPriorityScore = this.calculatePriorityScore(item, companyTickers);
      
      // Generate AI summary
      const aiSummary = this.generateSummary(item.title, item.contentSnippet);

      const article = {
        headline: item.title,
        source: source.name,
        url: item.link,
        content: item.content || item.contentSnippet,
        excerpt: item.contentSnippet,
        publication_date: new Date(item.pubDate).toISOString(),
        ai_priority_score: aiPriorityScore,
        ai_summary: aiSummary,
        company_tickers: companyTickers,
        tags: this.extractTags(item.title, item.contentSnippet),
        is_processed: false,
        processing_status: 'pending',
        word_count: this.countWords(item.content || item.contentSnippet),
        reading_time_minutes: this.calculateReadingTime(item.content || item.contentSnippet)
      };

      return article;
    } catch (error) {
      console.error(`❌ Error processing article:`, error.message);
      return null;
    }
  }

  isFinancialArticle(title, content, keywords) {
    const text = `${title} ${content}`.toLowerCase();
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  extractCompanyTickers(title, content) {
    const text = `${title} ${content}`.toUpperCase();
    const foundTickers = [];
    
    for (const ticker of jseCompanies) {
      if (text.includes(ticker)) {
        foundTickers.push(ticker);
      }
    }
    
    return foundTickers;
  }

  calculatePriorityScore(item, companyTickers) {
    let score = 0;
    
    // Base score for financial content
    score += 2;
    
    // Company ticker mentions
    score += companyTickers.length * 1.5;
    
    // Recent publication (within 24 hours)
    const hoursAgo = (Date.now() - new Date(item.pubDate).getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 24) {
      score += 2;
    }
    
    // High-priority keywords
    const highPriorityKeywords = ['earnings', 'profit', 'revenue', 'dividend', 'acquisition', 'merger'];
    const text = `${item.title} ${item.contentSnippet}`.toLowerCase();
    highPriorityKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 1;
      }
    });
    
    // Cap score at 10
    return Math.min(score, 10);
  }

  generateSummary(title, content) {
    // Simple summary generation (can be enhanced with AI)
    const words = content.split(' ').slice(0, 20).join(' ');
    return `${title} - ${words}...`;
  }

  extractTags(title, content) {
    const tags = [];
    const text = `${title} ${content}`.toLowerCase();
    
    if (text.includes('jse') || text.includes('jamaica stock exchange')) {
      tags.push('JSE');
    }
    if (text.includes('junior market')) {
      tags.push('Junior Market');
    }
    if (text.includes('banking') || text.includes('bank')) {
      tags.push('Banking');
    }
    if (text.includes('insurance')) {
      tags.push('Insurance');
    }
    if (text.includes('investment')) {
      tags.push('Investment');
    }
    
    return tags;
  }

  countWords(text) {
    return text ? text.split(/\s+/).length : 0;
  }

  calculateReadingTime(text) {
    const words = this.countWords(text);
    return Math.max(1, Math.ceil(words / 200)); // 200 words per minute
  }

  async saveArticles(articles) {
    try {
      if (articles.length === 0) {
        console.log('📝 No new articles to save');
        return;
      }

      console.log(`💾 Saving ${articles.length} articles to database...`);
      
      const { data, error } = await supabase
        .from('articles')
        .insert(articles)
        .select();

      if (error) {
        console.error('❌ Error saving articles:', error.message);
        return;
      }

      console.log(`✅ Successfully saved ${data.length} articles`);
      
      // Update news source last scraped time
      for (const source of newsSources) {
        await supabase
          .from('news_sources')
          .update({ last_scraped: new Date().toISOString() })
          .eq('name', source.name);
      }
      
    } catch (error) {
      console.error('❌ Error saving articles:', error.message);
    }
  }

  async scrapeAllSources() {
    console.log('🚀 Starting news scraping process...');
    
    const allArticles = [];
    
    for (const source of newsSources) {
      const articles = await this.scrapeRSSFeed(source);
      allArticles.push(...articles);
      
      // Add delay between sources to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Remove duplicates based on URL
    const uniqueArticles = allArticles.filter((article, index, self) => 
      index === self.findIndex(a => a.url === article.url)
    );
    
    console.log(`📊 Total unique articles found: ${uniqueArticles.length}`);
    
    await this.saveArticles(uniqueArticles);
    
    console.log('🎉 News scraping completed successfully!');
  }
}

// Main execution
async function main() {
  const scraper = new NewsScraper();
  await scraper.scrapeAllSources();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = NewsScraper;
```

### Step 2: Install Required Dependencies

```bash
cd JamStockAnalytics
npm install axios cheerio rss-parser
```

### Step 3: Create Scraping Scheduler

Create `scripts/scraping-scheduler.js`:

```javascript
#!/usr/bin/env node

/**
 * News Scraping Scheduler
 * Runs scraping at regular intervals
 */

const NewsScraper = require('./news-scraper');
const cron = require('node-cron');

class ScrapingScheduler {
  constructor() {
    this.scraper = new NewsScraper();
    this.isRunning = false;
  }

  async startScheduler() {
    console.log('⏰ Starting news scraping scheduler...');
    
    // Run every 2 hours
    cron.schedule('0 */2 * * *', async () => {
      if (this.isRunning) {
        console.log('⏳ Scraping already in progress, skipping...');
        return;
      }
      
      this.isRunning = true;
      console.log('🔄 Scheduled scraping started...');
      
      try {
        await this.scraper.scrapeAllSources();
      } catch (error) {
        console.error('❌ Scheduled scraping failed:', error.message);
      } finally {
        this.isRunning = false;
        console.log('✅ Scheduled scraping completed');
      }
    });
    
    // Run immediately on startup
    console.log('🚀 Running initial scraping...');
    await this.scraper.scrapeAllSources();
    
    console.log('✅ Scraping scheduler started successfully');
  }
}

// Start scheduler if run directly
if (require.main === module) {
  const scheduler = new ScrapingScheduler();
  scheduler.startScheduler();
}

module.exports = ScrapingScheduler;
```

### Step 4: Add Package Dependencies

```bash
npm install node-cron
```

## 🤖 AI Content Processing

### Step 1: Create AI Processing Service

Create `scripts/ai-content-processor.js`:

```javascript
#!/usr/bin/env node

/**
 * AI Content Processing Service
 * Processes scraped articles with AI analysis
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const deepseekApiKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class AIContentProcessor {
  constructor() {
    this.deepseekApiKey = deepseekApiKey;
  }

  async processUnprocessedArticles() {
    try {
      console.log('🤖 Starting AI content processing...');
      
      // Get unprocessed articles
      const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_processed', false)
        .eq('processing_status', 'pending')
        .limit(10);

      if (error) {
        console.error('❌ Error fetching articles:', error.message);
        return;
      }

      console.log(`📊 Processing ${articles.length} articles...`);

      for (const article of articles) {
        await this.processArticle(article);
        // Add delay to respect API limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('✅ AI content processing completed');
    } catch (error) {
      console.error('❌ AI processing error:', error.message);
    }
  }

  async processArticle(article) {
    try {
      console.log(`🔄 Processing article: ${article.headline}`);
      
      // Update status to processing
      await supabase
        .from('articles')
        .update({ processing_status: 'processing' })
        .eq('id', article.id);

      // Generate AI analysis
      const aiAnalysis = await this.generateAIAnalysis(article);
      
      // Update article with AI analysis
      await supabase
        .from('articles')
        .update({
          ai_priority_score: aiAnalysis.priorityScore,
          ai_summary: aiAnalysis.summary,
          sentiment_score: aiAnalysis.sentiment,
          relevance_score: aiAnalysis.relevance,
          ai_analysis_data: aiAnalysis.analysisData,
          is_processed: true,
          processing_status: 'completed'
        })
        .eq('id', article.id);

      console.log(`✅ Processed article: ${article.headline}`);
    } catch (error) {
      console.error(`❌ Error processing article ${article.id}:`, error.message);
      
      // Mark as failed
      await supabase
        .from('articles')
        .update({ processing_status: 'failed' })
        .eq('id', article.id);
    }
  }

  async generateAIAnalysis(article) {
    try {
      const prompt = `
        Analyze this Jamaican financial news article for the JamStockAnalytics platform:
        
        Headline: ${article.headline}
        Content: ${article.content}
        
        Please provide:
        1. Priority score (0-10) for Jamaican financial market relevance
        2. Sentiment score (-1 to 1) for market impact
        3. Relevance score (0-1) for JSE/Junior Market
        4. Brief summary (2-3 sentences)
        5. Key insights and market implications
        
        Focus on Jamaican financial markets, JSE companies, and local economic impact.
      `;

      const response = await this.callDeepSeekAPI(prompt);
      
      return {
        priorityScore: this.extractPriorityScore(response),
        sentiment: this.extractSentimentScore(response),
        relevance: this.extractRelevanceScore(response),
        summary: this.extractSummary(response),
        analysisData: {
          prompt: prompt,
          response: response,
          processed_at: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ AI analysis error:', error.message);
      return {
        priorityScore: 5,
        sentiment: 0,
        relevance: 0.5,
        summary: 'AI analysis unavailable',
        analysisData: { error: error.message }
      };
    }
  }

  async callDeepSeekAPI(prompt) {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.deepseekApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a financial analyst specializing in Jamaican markets and the JSE. Provide concise, professional analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('❌ DeepSeek API error:', error.message);
      throw error;
    }
  }

  extractPriorityScore(response) {
    const match = response.match(/priority[:\s]*(\d+(?:\.\d+)?)/i);
    return match ? Math.min(10, Math.max(0, parseFloat(match[1]))) : 5;
  }

  extractSentimentScore(response) {
    const match = response.match(/sentiment[:\s]*(-?\d+(?:\.\d+)?)/i);
    return match ? Math.min(1, Math.max(-1, parseFloat(match[1]))) : 0;
  }

  extractRelevanceScore(response) {
    const match = response.match(/relevance[:\s]*(\d+(?:\.\d+)?)/i);
    return match ? Math.min(1, Math.max(0, parseFloat(match[1]))) : 0.5;
  }

  extractSummary(response) {
    const lines = response.split('\n');
    const summaryLine = lines.find(line => 
      line.toLowerCase().includes('summary') || 
      line.toLowerCase().includes('brief')
    );
    return summaryLine ? summaryLine.replace(/^.*?summary[:\s]*/i, '') : 'Summary not available';
  }
}

// Main execution
async function main() {
  const processor = new AIContentProcessor();
  await processor.processUnprocessedArticles();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AIContentProcessor;
```

## ⚙️ Configuration and Setup

### Step 1: Environment Variables

Add to your `.env` file:

```env
# News Scraping Configuration
SCRAPING_ENABLED=true
SCRAPING_INTERVAL_HOURS=2
SCRAPING_MAX_ARTICLES_PER_SOURCE=10

# AI Processing Configuration
AI_PROCESSING_ENABLED=true
AI_PROCESSING_BATCH_SIZE=10
AI_PROCESSING_DELAY_MS=1000
```

### Step 2: Create Package Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "scrape": "node scripts/news-scraper.js",
    "scrape:schedule": "node scripts/scraping-scheduler.js",
    "process:ai": "node scripts/ai-content-processor.js",
    "scrape:full": "npm run scrape && npm run process:ai"
  }
}
```

### Step 3: Test Scraping

```bash
# Test manual scraping
npm run scrape

# Test AI processing
npm run process:ai

# Test full pipeline
npm run scrape:full
```

## 📊 Monitoring and Analytics

### Step 1: Create Monitoring Dashboard

Create `scripts/scraping-monitor.js`:

```javascript
#!/usr/bin/env node

/**
 * News Scraping Monitor
 * Monitors scraping performance and statistics
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

class ScrapingMonitor {
  async getScrapingStats() {
    try {
      console.log('📊 News Scraping Statistics');
      console.log('============================');

      // Total articles
      const { count: totalArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      // Articles by source
      const { data: articlesBySource } = await supabase
        .from('articles')
        .select('source, count(*)')
        .group('source');

      // Processing status
      const { data: processingStatus } = await supabase
        .from('articles')
        .select('processing_status, count(*)')
        .group('processing_status');

      // Recent articles (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: recentArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      console.log(`📰 Total Articles: ${totalArticles}`);
      console.log(`🕐 Recent Articles (24h): ${recentArticles}`);
      console.log('\n📊 Articles by Source:');
      articlesBySource?.forEach(source => {
        console.log(`   ${source.source}: ${source.count}`);
      });
      
      console.log('\n🔄 Processing Status:');
      processingStatus?.forEach(status => {
        console.log(`   ${status.processing_status}: ${status.count}`);
      });

      // News sources status
      const { data: newsSources } = await supabase
        .from('news_sources')
        .select('*');

      console.log('\n📡 News Sources Status:');
      newsSources?.forEach(source => {
        const lastScraped = source.last_scraped ? 
          new Date(source.last_scraped).toLocaleString() : 'Never';
        console.log(`   ${source.name}: ${source.is_active ? 'Active' : 'Inactive'} (Last: ${lastScraped})`);
      });

    } catch (error) {
      console.error('❌ Error getting scraping stats:', error.message);
    }
  }
}

// Main execution
async function main() {
  const monitor = new ScrapingMonitor();
  await monitor.getScrapingStats();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ScrapingMonitor;
```

## 🚀 Production Deployment

### Step 1: Create Production Scraping Service

Create `scripts/production-scraper.js`:

```javascript
#!/usr/bin/env node

/**
 * Production News Scraping Service
 * Optimized for production deployment
 */

const NewsScraper = require('./news-scraper');
const AIContentProcessor = require('./ai-content-processor');
const ScrapingScheduler = require('./scraping-scheduler');

class ProductionScrapingService {
  constructor() {
    this.scraper = new NewsScraper();
    this.processor = new AIContentProcessor();
    this.scheduler = new ScrapingScheduler();
  }

  async start() {
    console.log('🚀 Starting Production News Scraping Service...');
    
    try {
      // Start scheduler
      await this.scheduler.startScheduler();
      
      // Process any unprocessed articles
      await this.processor.processUnprocessedArticles();
      
      console.log('✅ Production scraping service started successfully');
    } catch (error) {
      console.error('❌ Failed to start scraping service:', error.message);
      process.exit(1);
    }
  }
}

// Start service if run directly
if (require.main === module) {
  const service = new ProductionScrapingService();
  service.start();
}

module.exports = ProductionScrapingService;
```

### Step 2: Add Production Scripts

```json
{
  "scripts": {
    "scrape:prod": "node scripts/production-scraper.js",
    "monitor": "node scripts/scraping-monitor.js"
  }
}
```

## 📋 Testing Checklist

### ✅ Scraping Functionality
- [ ] RSS feeds accessible and parseable
- [ ] Articles extracted correctly
- [ ] Company tickers identified
- [ ] AI priority scores calculated
- [ ] Database storage working

### ✅ AI Processing
- [ ] DeepSeek API integration working
- [ ] Content analysis accurate
- [ ] Sentiment scoring functional
- [ ] Summary generation working
- [ ] Processing status updates

### ✅ Monitoring
- [ ] Statistics dashboard working
- [ ] Error logging functional
- [ ] Performance metrics available
- [ ] Alert system operational

## 🎯 Expected Results

After successful setup:
- **News articles** automatically scraped every 2 hours
- **AI analysis** applied to all articles
- **Company tickers** identified and tagged
- **Priority scores** calculated for content ranking
- **Database** populated with relevant financial news
- **Monitoring** dashboard shows scraping statistics

---

**Configuration Status:** 🔧 READY TO CONFIGURE  
**Estimated Setup Time:** 1-2 hours  
**Prerequisites:** Database setup completion and API keys configured
