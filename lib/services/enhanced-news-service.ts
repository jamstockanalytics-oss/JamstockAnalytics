/**
 * Enhanced News Service for JamStockAnalytics
 * Automated news collection and processing pipeline
 */

import { supabase } from '../supabase/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';
import { DeepSeekChatService, analyzeNewsArticle } from './ai-service';

// News source configuration
interface NewsSource {
  id: string;
  name: string;
  baseUrl: string;
  rssUrl?: string;
  apiEndpoint?: string;
  scrapingConfig: {
    selectors: {
      title: string;
      content: string;
      date: string;
      author?: string;
      image?: string;
    };
    filters: {
      includeKeywords: string[];
      excludeKeywords: string[];
      minContentLength: number;
    };
  };
  priority: number;
  isActive: boolean;
  lastScraped?: Date;
}

// Enhanced article interface
interface EnhancedArticle {
  id?: string;
  headline: string;
  source: string;
  url: string;
  content: string;
  publication_date: Date;
  scraped_at: Date;
  ai_priority_score: number;
  ai_summary: string;
  sentiment_score: number;
  relevance_score: number;
  company_tickers: string[];
  tags: string[];
  is_processed: boolean;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: {
    author?: string;
    image_url?: string;
    word_count: number;
    reading_time: number;
    language: string;
    category?: string;
  };
}

// JSE company ticker mapping
const JSE_TICKERS = {
  'NCB': ['NCBFG', 'NCB Financial Group'],
  'Sagicor': ['SGJ', 'Sagicor Group Jamaica'],
  'Guardian': ['GHL', 'Guardian Holdings Limited'],
  'GraceKennedy': ['GK', 'GraceKennedy Limited'],
  'Jamaica Broilers': ['JBG', 'Jamaica Broilers Group'],
  'Seprod': ['SEP', 'Seprod Limited'],
  'Carreras': ['CAR', 'Carreras Limited'],
  'Jamaica Producers': ['JP', 'Jamaica Producers Group'],
  'Derrimon Trading': ['DTL', 'Derrimon Trading Company'],
  'Lasco Financial': ['LASF', 'Lasco Financial Services'],
  'Lasco Manufacturing': ['LASM', 'Lasco Manufacturing Limited'],
  'Lasco Distributors': ['LASD', 'Lasco Distributors Limited'],
  'Mayberry Investments': ['MIL', 'Mayberry Investments Limited'],
  'Jamaica Stock Exchange': ['JSE', 'Jamaica Stock Exchange Limited'],
  'Bank of Jamaica': ['BOJ', 'Bank of Jamaica'],
  'Jamaica Money Market Brokers': ['JMMB', 'Jamaica Money Market Brokers Limited']
};

export class EnhancedNewsService {
  private aiService: DeepSeekChatService;
  private parser: Parser;
  private scrapingInterval: number | null = null;
  private isScraping = false;

  constructor() {
    this.aiService = new DeepSeekChatService();
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'JamStockAnalytics/1.0 (Financial News Aggregator)'
      }
    });
  }

  /**
   * Initialize news sources in database
   */
  async initializeNewsSources(): Promise<void> {
    const newsSources: Omit<NewsSource, 'id'>[] = [
      {
        name: 'Jamaica Observer',
        baseUrl: 'https://www.jamaicaobserver.com',
        rssUrl: 'https://www.jamaicaobserver.com/rss.xml',
        scrapingConfig: {
          selectors: {
            title: 'h1.article-title, .headline',
            content: '.article-content, .story-body',
            date: '.publish-date, .article-date',
            author: '.author-name, .byline',
            image: '.article-image img, .featured-image img'
          },
          filters: {
            includeKeywords: ['stock', 'market', 'financial', 'bank', 'investment', 'JSE', 'economy', 'business'],
            excludeKeywords: ['sports', 'entertainment', 'lifestyle', 'gossip'],
            minContentLength: 200
          }
        },
        priority: 1,
        isActive: true
      },
      {
        name: 'Jamaica Gleaner',
        baseUrl: 'https://jamaica-gleaner.com',
        rssUrl: 'https://jamaica-gleaner.com/rss.xml',
        scrapingConfig: {
          selectors: {
            title: 'h1, .article-title',
            content: '.article-content, .story-content',
            date: '.publish-date, .date',
            author: '.author, .byline',
            image: '.article-image img, .featured-image img'
          },
          filters: {
            includeKeywords: ['business', 'finance', 'market', 'stock', 'economy', 'banking', 'investment'],
            excludeKeywords: ['sports', 'entertainment', 'lifestyle'],
            minContentLength: 200
          }
        },
        priority: 1,
        isActive: true
      },
      {
        name: 'RJR News',
        baseUrl: 'https://rjrnewsonline.com',
        rssUrl: 'https://rjrnewsonline.com/rss.xml',
        scrapingConfig: {
          selectors: {
            title: 'h1, .headline',
            content: '.article-content, .story-body',
            date: '.publish-date, .date',
            author: '.author, .byline',
            image: '.article-image img, .featured-image img'
          },
          filters: {
            includeKeywords: ['business', 'finance', 'market', 'economy', 'banking'],
            excludeKeywords: ['sports', 'entertainment', 'lifestyle'],
            minContentLength: 150
          }
        },
        priority: 2,
        isActive: true
      },
      {
        name: 'Loop Jamaica',
        baseUrl: 'https://www.loopjamaica.com',
        rssUrl: 'https://www.loopjamaica.com/rss.xml',
        scrapingConfig: {
          selectors: {
            title: 'h1, .article-title',
            content: '.article-content, .story-content',
            date: '.publish-date, .date',
            author: '.author, .byline',
            image: '.article-image img, .featured-image img'
          },
          filters: {
            includeKeywords: ['business', 'finance', 'market', 'economy'],
            excludeKeywords: ['sports', 'entertainment', 'lifestyle'],
            minContentLength: 150
          }
        },
        priority: 3,
        isActive: true
      }
    ];

    try {
      for (const source of newsSources) {
        const { error } = await supabase
          .from('news_sources')
          .upsert({
            name: source.name,
            base_url: source.baseUrl,
            rss_feed_url: source.rssUrl,
            scraping_config: source.scrapingConfig,
            priority_score: source.priority,
            is_active: source.isActive
          }, {
            onConflict: 'name'
          });

        if (error) {
          console.error(`Error initializing news source ${source.name}:`, error);
        } else {
          }
      }
    } catch (error) {
      console.error('Error initializing news sources:', error);
    }
  }

  /**
   * Start automated news scraping
   */
  async startAutomatedScraping(intervalMinutes: number = 30): Promise<void> {
    if (this.scrapingInterval) {
      return;
    }

    // Initial scrape
    await this.scrapeAllSources();

    // Set up interval
    this.scrapingInterval = setInterval(async () => {
      await this.scrapeAllSources();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop automated news scraping
   */
  stopAutomatedScraping(): void {
    if (this.scrapingInterval) {
      clearInterval(this.scrapingInterval);
      this.scrapingInterval = null;
      }
  }

  /**
   * Scrape all active news sources
   */
  async scrapeAllSources(): Promise<void> {
    if (this.isScraping) {
      return;
    }

    this.isScraping = true;
    try {
      // Get active news sources
      const { data: sources, error } = await supabase
        .from('news_sources')
        .select('*')
        .eq('is_active', true)
        .order('priority_score', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch news sources: ${error.message}`);
      }

      if (!sources || sources.length === 0) {
        return;
      }

      // Scrape each source
      const scrapingPromises = sources.map(source => this.scrapeSource(source));
      const results = await Promise.allSettled(scrapingPromises);

      // Log results
      let successCount = 0;
      let errorCount = 0;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
          } else {
          errorCount++;
          console.error(`❌ ${sources[index].name}: ${result.reason}`);
        }
      });

      // Update last scraped timestamp
      await this.updateLastScrapedTimestamp();

    } catch (error) {
      console.error('Error in automated scraping:', error);
    } finally {
      this.isScraping = false;
    }
  }

  /**
   * Scrape a single news source
   */
  private async scrapeSource(source: any): Promise<number> {
    try {
      let articles: EnhancedArticle[] = [];

      // Try RSS feed first
      if (source.rss_feed_url) {
        try {
          articles = await this.scrapeRSSFeed(source);
        } catch (rssError) {
          console.warn(`RSS scraping failed for ${source.name}, trying web scraping:`, rssError);
          articles = await this.scrapeWebPage(source);
        }
      } else {
        articles = await this.scrapeWebPage(source);
      }

      // Process and save articles
      let savedCount = 0;
      for (const article of articles) {
        try {
          const saved = await this.saveArticle(article);
          if (saved) savedCount++;
        } catch (error) {
          console.error(`Error saving article "${article.headline}":`, error);
        }
      }

      return savedCount;

    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Scrape RSS feed
   */
  private async scrapeRSSFeed(source: any): Promise<EnhancedArticle[]> {
    const feed = await this.parser.parseURL(source.rss_feed_url);
    const articles: EnhancedArticle[] = [];

    for (const item of feed.items) {
      try {
        // Check if article is relevant
        if (!this.isRelevantArticle(item.title || '', item.contentSnippet || '', source.scraping_config)) {
          continue;
        }

        // Extract content if needed
        let content = item.contentSnippet || item.content || '';
        if (content.length < 200 && item.link) {
          content = await this.extractContentFromUrl(item.link, source.scraping_config);
        }

        const article: EnhancedArticle = {
          headline: item.title || 'Untitled',
          source: source.name,
          url: item.link || '',
          content: content,
          publication_date: new Date(item.pubDate || Date.now()),
          scraped_at: new Date(),
          ai_priority_score: 0,
          ai_summary: '',
          sentiment_score: 0,
          relevance_score: 0,
          company_tickers: this.extractCompanyTickers(item.title || '', content),
          tags: this.generateTags(item.title || '', content),
          is_processed: false,
          processing_status: 'pending',
          metadata: {
            word_count: content.split(' ').length,
            reading_time: Math.ceil(content.split(' ').length / 200), // 200 words per minute
            language: 'en',
            category: item.categories?.[0] || 'business'
          }
        };

        articles.push(article);
      } catch (error) {
        console.error(`Error processing RSS item:`, error);
      }
    }

    return articles;
  }

  /**
   * Scrape web page content
   */
  private async scrapeWebPage(source: any): Promise<EnhancedArticle[]> {
    // This would implement web scraping logic
    // For now, return empty array as RSS is preferred
    return [];
  }

  /**
   * Extract content from URL
   */
  private async extractContentFromUrl(url: string, config: any): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'JamStockAnalytics/1.0 (Financial News Aggregator)'
        }
      });

      const $ = cheerio.load(response.data);
      const content = $(config.selectors.content).text().trim();
      
      return content || '';
    } catch (error) {
      console.error(`Error extracting content from ${url}:`, error);
      return '';
    }
  }

  /**
   * Check if article is relevant
   */
  private isRelevantArticle(title: string, content: string, config: any): boolean {
    const text = (title + ' ' + content).toLowerCase();
    
    // Check include keywords
    const hasIncludeKeywords = config.filters.includeKeywords.some((keyword: string) => 
      text.includes(keyword.toLowerCase())
    );

    // Check exclude keywords
    const hasExcludeKeywords = config.filters.excludeKeywords.some((keyword: string) => 
      text.includes(keyword.toLowerCase())
    );

    // Check minimum content length
    const hasMinLength = content.length >= config.filters.minContentLength;

    return hasIncludeKeywords && !hasExcludeKeywords && hasMinLength;
  }

  /**
   * Extract company tickers from text
   */
  private extractCompanyTickers(title: string, content: string): string[] {
    const text = (title + ' ' + content).toLowerCase();
    const tickers: string[] = [];

    for (const [company, tickerInfo] of Object.entries(JSE_TICKERS)) {
      if (text.includes(company.toLowerCase()) || text.includes(tickerInfo[0].toLowerCase())) {
        tickers.push(tickerInfo[0]);
      }
    }

    return [...new Set(tickers)]; // Remove duplicates
  }

  /**
   * Generate tags from content
   */
  private generateTags(title: string, content: string): string[] {
    const text = (title + ' ' + content).toLowerCase();
    const tags: string[] = [];

    // Financial tags
    if (text.includes('stock') || text.includes('share')) tags.push('stocks');
    if (text.includes('bond') || text.includes('debt')) tags.push('bonds');
    if (text.includes('bank') || text.includes('banking')) tags.push('banking');
    if (text.includes('insurance')) tags.push('insurance');
    if (text.includes('earnings') || text.includes('profit')) tags.push('earnings');
    if (text.includes('dividend')) tags.push('dividends');
    if (text.includes('merger') || text.includes('acquisition')) tags.push('mergers');
    if (text.includes('ipo') || text.includes('listing')) tags.push('ipo');

    // Market tags
    if (text.includes('jse') || text.includes('jamaica stock exchange')) tags.push('jse');
    if (text.includes('boj') || text.includes('bank of jamaica')) tags.push('boj');
    if (text.includes('economy') || text.includes('economic')) tags.push('economy');
    if (text.includes('inflation')) tags.push('inflation');
    if (text.includes('interest rate')) tags.push('interest-rates');

    return tags;
  }

  /**
   * Save article to database
   */
  private async saveArticle(article: EnhancedArticle): Promise<boolean> {
    try {
      // Check if article already exists
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('url', article.url)
        .single();

      if (existing) {
        return false; // Article already exists
      }

      // Save article
      const { error } = await supabase
        .from('articles')
        .insert({
          headline: article.headline,
          source: article.source,
          url: article.url,
          content: article.content,
          publication_date: article.publication_date.toISOString(),
          scraped_at: article.scraped_at.toISOString(),
          ai_priority_score: article.ai_priority_score,
          ai_summary: article.ai_summary,
          sentiment_score: article.sentiment_score,
          relevance_score: article.relevance_score,
          company_tickers: article.company_tickers,
          tags: article.tags,
          is_processed: article.is_processed,
          processing_status: article.processing_status
        });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error saving article:', error);
      return false;
    }
  }

  /**
   * Update last scraped timestamp
   */
  private async updateLastScrapedTimestamp(): Promise<void> {
    try {
      const { error } = await supabase
        .from('news_sources')
        .update({ last_scraped: new Date().toISOString() })
        .eq('is_active', true);

      if (error) {
        console.error('Error updating last scraped timestamp:', error);
      }
    } catch (error) {
      console.error('Error updating last scraped timestamp:', error);
    }
  }

  /**
   * Process articles with AI analysis
   */
  async processArticlesWithAI(): Promise<void> {
    try {
      // Get unprocessed articles
      const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_processed', false)
        .eq('processing_status', 'pending')
        .limit(10);

      if (error) {
        throw new Error(`Failed to fetch unprocessed articles: ${error.message}`);
      }

      if (!articles || articles.length === 0) {
        return;
      }

      // Process each article
      for (const article of articles) {
        try {
          // Update status to processing
          await supabase
            .from('articles')
            .update({ processing_status: 'processing' })
            .eq('id', article.id);

          // Get AI analysis
          const analysis = await analyzeNewsArticle(
            article.headline,
            article.content,
            article.publication_date
          );

          // Update article with AI analysis
          await supabase
            .from('articles')
            .update({
              ai_priority_score: analysis.priority_score,
              ai_summary: analysis.summary,
              sentiment_score: this.convertSentimentToScore(analysis.sentiment),
              relevance_score: this.calculateRelevanceScore(analysis),
              is_processed: true,
              processing_status: 'completed'
            })
            .eq('id', article.id);

          } catch (error) {
          console.error(`Error processing article ${article.headline}:`, error);
          
          // Update status to failed
          await supabase
            .from('articles')
            .update({ processing_status: 'failed' })
            .eq('id', article.id);
        }
      }

      } catch (error) {
      console.error('Error in AI processing:', error);
    }
  }

  /**
   * Convert sentiment to numeric score
   */
  private convertSentimentToScore(sentiment: string): number {
    switch (sentiment) {
      case 'positive': return 0.7;
      case 'negative': return -0.7;
      case 'neutral': return 0.0;
      default: return 0.0;
    }
  }

  /**
   * Calculate relevance score from AI analysis
   */
  private calculateRelevanceScore(analysis: any): number {
    let score = 0.5; // Base relevance

    // Adjust based on market impact
    switch (analysis.market_impact) {
      case 'high': score += 0.3; break;
      case 'medium': score += 0.1; break;
      case 'low': score -= 0.1; break;
    }

    // Adjust based on priority score
    score += (analysis.priority_score - 5) * 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Get scraping statistics
   */
  async getScrapingStats(): Promise<any> {
    try {
      const { data: stats } = await supabase
        .from('articles')
        .select('source, processing_status, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (!stats) return {};

      const sourceStats: any = {};
      const statusStats: any = {};

      stats.forEach(article => {
        // Source stats
        sourceStats[article.source] = (sourceStats[article.source] || 0) + 1;
        
        // Status stats
        statusStats[article.processing_status] = (statusStats[article.processing_status] || 0) + 1;
      });

      return {
        totalArticles: stats.length,
        sourceBreakdown: sourceStats,
        statusBreakdown: statusStats,
        last24Hours: true
      };

    } catch (error) {
      console.error('Error getting scraping stats:', error);
      return {};
    }
  }
}

// Export singleton instance
export const enhancedNewsService = new EnhancedNewsService();
