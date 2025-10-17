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
