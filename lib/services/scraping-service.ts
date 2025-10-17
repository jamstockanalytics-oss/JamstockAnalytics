import { newsStorageService, marketStorageService, aiAnalysisStorageService } from './storage-service';
import { supabase } from '../supabase/client';

export interface ScrapedArticle {
  id: string;
  headline: string;
  content: string;
  source: string;
  url: string;
  published_at: string;
  company_tickers: string[];
  ai_priority_score?: number;
  ai_summary?: string;
  sentiment_score?: number;
  relevance_score?: number;
  tags: string[];
  metadata: Record<string, any>;
}

export interface MarketData {
  date: string;
  jse_index: number;
  volume: number;
  top_gainers: string[];
  top_losers: string[];
  sector_performance: Record<string, number>;
  market_sentiment: number;
}

export interface ScrapingConfig {
  sources: string[];
  updateInterval: number; // in minutes
  maxArticlesPerSource: number;
  enableAIProcessing: boolean;
}

/**
 * Scraping Service for collecting and storing financial news data
 */
export class ScrapingService {
  private config: ScrapingConfig;

  constructor(config: ScrapingConfig) {
    this.config = config;
  }

  /**
   * Scrape articles from configured sources
   */
  async scrapeArticles(): Promise<{ articles: ScrapedArticle[]; errors: string[] }> {
    const articles: ScrapedArticle[] = [];
    const errors: string[] = [];

    for (const source of this.config.sources) {
      try {
        const sourceArticles = await this.scrapeSource(source);
        articles.push(...sourceArticles);
        } catch (error) {
        const errorMsg = `Failed to scrape ${source}: ${error}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    // Store articles in database and storage
    for (const article of articles) {
      try {
        await this.storeArticle(article);
      } catch (error) {
        console.error(`❌ Failed to store article ${article.id}: ${error}`);
        errors.push(`Failed to store article ${article.id}`);
      }
    }

    return { articles, errors };
  }

  /**
   * Scrape from a specific source
   */
  private async scrapeSource(source: string): Promise<ScrapedArticle[]> {
    // This is a mock implementation - in reality, you'd use web scraping libraries
    // like Puppeteer, Playwright, or Cheerio to scrape actual news sources
    
    const mockArticles: ScrapedArticle[] = [
      {
        id: `article-${Date.now()}-1`,
        headline: 'JSE Market Shows Strong Performance in Q4',
        content: 'The Jamaica Stock Exchange continues to show resilience with several companies reporting strong quarterly results...',
        source: source,
        url: `https://${source}.com/article-1`,
        published_at: new Date().toISOString(),
        company_tickers: ['NCBFG', 'SGJ', 'GHL'],
        tags: ['market-update', 'quarterly-results'],
        metadata: {
          word_count: 250,
          reading_time: 2,
          author: 'Financial Reporter'
        }
      },
      {
        id: `article-${Date.now()}-2`,
        headline: 'Banking Sector Leads Market Gains',
        content: 'NCB Financial Group and other banking stocks led the market higher today...',
        source: source,
        url: `https://${source}.com/article-2`,
        published_at: new Date().toISOString(),
        company_tickers: ['NCBFG', 'SJ'],
        tags: ['banking', 'market-gains'],
        metadata: {
          word_count: 180,
          reading_time: 1,
          author: 'Market Analyst'
        }
      }
    ];

    return mockArticles.slice(0, this.config.maxArticlesPerSource);
  }

  /**
   * Store article in database and storage
   */
  private async storeArticle(article: ScrapedArticle): Promise<void> {
    try {
      // Store in database
      const { error: dbError } = await supabase
        .from('articles')
        .upsert({
          id: article.id,
          headline: article.headline,
          source: article.source,
          url: article.url,
          content: article.content,
          publication_date: article.published_at,
          company_tickers: article.company_tickers,
          tags: article.tags,
          ai_priority_score: article.ai_priority_score || 0,
          ai_summary: article.ai_summary,
          sentiment_score: article.sentiment_score || 0,
          relevance_score: article.relevance_score || 0,
          is_processed: false,
          processing_status: 'pending'
        });

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Store in storage
      const { error: storageError } = await newsStorageService.storeArticle(
        article.id,
        article.content,
        {
          headline: article.headline,
          source: article.source,
          url: article.url,
          published_at: article.published_at,
          company_tickers: article.company_tickers,
          tags: article.tags,
          metadata: article.metadata
        }
      );

      if (storageError) {
        throw new Error(`Storage error: ${storageError.message}`);
      }

      } catch (error) {
      console.error(`❌ Error storing article ${article.id}: ${error}`);
      throw error;
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
        .limit(10);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!articles || articles.length === 0) {
        return;
      }

      for (const article of articles) {
        try {
          // Analyze article with AI
          const analysis = await this.analyzeArticleWithAI(article);
          
          // Update article with AI analysis
          const { error: updateError } = await supabase
            .from('articles')
            .update({
              ai_priority_score: analysis.priority_score,
              ai_summary: analysis.summary,
              sentiment_score: analysis.sentiment === 'positive' ? 0.8 : 
                             analysis.sentiment === 'negative' ? 0.2 : 0.5,
              relevance_score: analysis.relevance_score,
              is_processed: true,
              processing_status: 'completed'
            })
            .eq('id', article.id);

          if (updateError) {
            console.error(`❌ Error updating article ${article.id}: ${updateError.message}`);
          } else {
            }
        } catch (error) {
          console.error(`❌ Error processing article ${article.id}: ${error}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error in AI processing: ${error}`);
    }
  }

  /**
   * Analyze article with AI
   */
  private async analyzeArticleWithAI(article: any): Promise<{
    priority_score: number;
    summary: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    relevance_score: number;
  }> {
    // Mock AI analysis - in reality, you'd call your AI service
    return {
      priority_score: Math.random() * 10,
      summary: `AI Summary: ${article.headline} discusses important market developments.`,
      sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
      relevance_score: Math.random()
    };
  }

  /**
   * Scrape and store market data
   */
  async scrapeMarketData(): Promise<void> {
    try {
      const marketData: MarketData = {
        date: new Date().toISOString().split('T')[0] || new Date().toLocaleDateString('en-CA'),
        jse_index: 125.5 + (Math.random() - 0.5) * 10,
        volume: 1500000 + Math.floor(Math.random() * 500000),
        top_gainers: ['NCBFG', 'SGJ', 'GHL'],
        top_losers: ['SJ', 'JMMBGL'],
        sector_performance: {
          'Financial Services': 2.5,
          'Insurance': 1.8,
          'Manufacturing': -0.5
        },
        market_sentiment: 0.65 + (Math.random() - 0.5) * 0.3
      };

      // Store in storage
      const { error } = await marketStorageService.storeDailyData(
        marketData.date,
        marketData
      );

      if (error) {
        throw new Error(`Storage error: ${error.message}`);
      }

      } catch (error) {
      console.error(`❌ Error scraping market data: ${error}`);
    }
  }

  /**
   * Generate AI analysis and store results
   */
  async generateAIAnalysis(): Promise<void> {
    try {
      const analysis = {
        analysis_id: `analysis-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        overall_sentiment: 0.65,
        bullish_percentage: 45,
        bearish_percentage: 35,
        neutral_percentage: 20,
        red_flags: [
          {
            company: 'NCBFG',
            risk: 'High',
            reason: 'Declining quarterly earnings',
            confidence: 0.85
          }
        ],
        market_insights: [
          'JSE showing mixed signals with financial sector under pressure',
          'Banking sector leading gains, insurance sector showing volatility',
          'Moderate risk environment with focus on regulatory changes'
        ]
      };

      // Store AI analysis
      const { error } = await aiAnalysisStorageService.storeAnalysis(
        analysis.analysis_id,
        analysis
      );

      if (error) {
        throw new Error(`Storage error: ${error.message}`);
      }

      } catch (error) {
      console.error(`❌ Error generating AI analysis: ${error}`);
    }
  }

  /**
   * Run complete scraping and processing pipeline
   */
  async runScrapingPipeline(): Promise<void> {
    try {
      // Step 1: Scrape articles
      const { articles, errors } = await this.scrapeArticles();
      if (errors.length > 0) {
        }

      // Step 2: Process articles with AI
      if (this.config.enableAIProcessing) {
        await this.processArticlesWithAI();
      }

      // Step 3: Scrape market data
      await this.scrapeMarketData();

      // Step 4: Generate AI analysis
      await this.generateAIAnalysis();

      } catch (error) {
      console.error(`❌ Scraping pipeline failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get scraping statistics
   */
  async getScrapingStats(): Promise<{
    totalArticles: number;
    processedArticles: number;
    pendingArticles: number;
    lastScrapingDate: string | null;
  }> {
    try {
      const { data: articles, error } = await supabase
        .from('articles')
        .select('id, is_processed, created_at');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const totalArticles = articles?.length || 0;
      const processedArticles = articles?.filter(a => a.is_processed).length || 0;
      const pendingArticles = totalArticles - processedArticles;
      const lastScrapingDate = articles?.length > 0 ? 
        new Date(Math.max(...articles.map(a => new Date(a.created_at).getTime()))).toISOString() : 
        null;

      return {
        totalArticles,
        processedArticles,
        pendingArticles,
        lastScrapingDate
      };
    } catch (error) {
      console.error(`❌ Error getting scraping stats: ${error}`);
      return {
        totalArticles: 0,
        processedArticles: 0,
        pendingArticles: 0,
        lastScrapingDate: null
      };
    }
  }
}

// Default scraping configuration
export const defaultScrapingConfig: ScrapingConfig = {
  sources: [
    'jamaica-observer',
    'gleaner',
    'rjr',
    'jamaica-gleaner'
  ],
  updateInterval: 60, // 1 hour
  maxArticlesPerSource: 5,
  enableAIProcessing: true
};

// Create default scraping service instance
export const scrapingService = new ScrapingService(defaultScrapingConfig);
