import { supabase } from '../supabase/client';

export interface NewsArticle {
  id: string;
  headline: string;
  content: string;
  source: string;
  url: string;
  published_at: string;
  company_tickers: string[];
  tags: string[];
  ai_priority_score: number;
  ai_summary: string;
  sentiment_score: number;
  relevance_score: number;
  metadata: {
    word_count: number;
    reading_time: number;
    author: string;
    image_url?: string;
    category: string;
  };
}

export interface NewsSource {
  id: string;
  name: string;
  base_url: string;
  rss_feed_url: string;
  api_endpoint?: string;
  scraping_config: {
    article_selector: string;
    title_selector: string;
    content_selector: string;
    date_selector: string;
    author_selector?: string;
  };
  is_active: boolean;
  priority_score: number;
  last_scraped?: string;
}

export interface NewsCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

// Real Jamaican financial news sources
const REAL_NEWS_SOURCES: NewsSource[] = [
  {
    id: 'jamaica-observer',
    name: 'Jamaica Observer',
    base_url: 'https://www.jamaicaobserver.com',
    rss_feed_url: 'https://www.jamaicaobserver.com/rss.xml',
    scraping_config: {
      article_selector: '.article-content',
      title_selector: 'h1.article-title',
      content_selector: '.article-body',
      date_selector: '.article-date',
      author_selector: '.article-author'
    },
    is_active: true,
    priority_score: 10
  },
  {
    id: 'gleaner',
    name: 'Jamaica Gleaner',
    base_url: 'https://jamaica-gleaner.com',
    rss_feed_url: 'https://jamaica-gleaner.com/rss.xml',
    scraping_config: {
      article_selector: '.article',
      title_selector: 'h1',
      content_selector: '.article-content',
      date_selector: '.date',
      author_selector: '.author'
    },
    is_active: true,
    priority_score: 9
  },
  {
    id: 'rjr-news',
    name: 'RJR News',
    base_url: 'https://rjrnewsonline.com',
    rss_feed_url: 'https://rjrnewsonline.com/rss.xml',
    scraping_config: {
      article_selector: '.news-article',
      title_selector: 'h1.news-title',
      content_selector: '.news-content',
      date_selector: '.news-date',
      author_selector: '.news-author'
    },
    is_active: true,
    priority_score: 8
  },
  {
    id: 'jamaica-star',
    name: 'Jamaica Star',
    base_url: 'https://jamaica-star.com',
    rss_feed_url: 'https://jamaica-star.com/rss.xml',
    scraping_config: {
      article_selector: '.article',
      title_selector: 'h1',
      content_selector: '.content',
      date_selector: '.date',
      author_selector: '.author'
    },
    is_active: true,
    priority_score: 7
  },
  {
    id: 'loop-jamaica',
    name: 'Loop Jamaica',
    base_url: 'https://jamaica.loopnews.com',
    rss_feed_url: 'https://jamaica.loopnews.com/rss.xml',
    scraping_config: {
      article_selector: '.article-content',
      title_selector: 'h1',
      content_selector: '.article-body',
      date_selector: '.article-date',
      author_selector: '.article-author'
    },
    is_active: true,
    priority_score: 6
  }
];

// News categories for Jamaican financial news
const NEWS_CATEGORIES: NewsCategory[] = [
  {
    id: 'market-updates',
    name: 'Market Updates',
    description: 'JSE market movements and trading updates',
    color: '#2563eb',
    icon: 'trending-up'
  },
  {
    id: 'company-news',
    name: 'Company News',
    description: 'Individual company announcements and results',
    color: '#059669',
    icon: 'building'
  },
  {
    id: 'economic-policy',
    name: 'Economic Policy',
    description: 'Government economic policies and BOJ announcements',
    color: '#dc2626',
    icon: 'bank'
  },
  {
    id: 'sector-analysis',
    name: 'Sector Analysis',
    description: 'Industry-specific analysis and trends',
    color: '#7c3aed',
    icon: 'chart-bar'
  },
  {
    id: 'international',
    name: 'International',
    description: 'Global economic impact on Jamaica',
    color: '#ea580c',
    icon: 'globe'
  }
];

// JSE company tickers for relevance scoring
const JSE_COMPANIES = [
  'NCBFG', 'SGJ', 'JMMB', 'BGL', 'SGL', 'JPS', 'WCO', 'JSE',
  'GHL', 'CAC', 'CAB', 'CAC', 'CAB', 'CAC', 'CAB', 'CAC',
  'CAB', 'CAC', 'CAB', 'CAC', 'CAB', 'CAC', 'CAB', 'CAC'
];

class ComprehensiveNewsService {
  private sources: NewsSource[] = REAL_NEWS_SOURCES;
  private categories: NewsCategory[] = NEWS_CATEGORIES;

  /**
   * Fetch articles from all active sources
   */
  async fetchAllArticles(): Promise<NewsArticle[]> {
    try {
      const articles: NewsArticle[] = [];
      
      for (const source of this.sources.filter(s => s.is_active)) {
        try {
          const sourceArticles = await this.fetchFromSource(source);
          articles.push(...sourceArticles);
        } catch (error) {
          console.error(`Error fetching from ${source.name}:`, error);
          // Continue with other sources
        }
      }

      // Process articles with AI analysis
      const processedArticles = await this.processArticlesWithAI(articles);
      
      // Store in database
      await this.storeArticles(processedArticles);
      
      return processedArticles;
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  }

  /**
   * Fetch articles from a specific source
   */
  private async fetchFromSource(source: NewsSource): Promise<NewsArticle[]> {
    try {
      // Try RSS feed first
      if (source.rss_feed_url) {
        return await this.fetchFromRSS(source);
      }
      
      // Fallback to web scraping
      return await this.scrapeFromWebsite(source);
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Fetch articles from RSS feed
   */
  private async fetchFromRSS(source: NewsSource): Promise<NewsArticle[]> {
    try {
      const response = await fetch(source.rss_feed_url);
      const xmlText = await response.text();
      
      // Parse RSS XML (simplified implementation)
      const articles = this.parseRSSFeed(xmlText, source);
      return articles;
    } catch (error) {
      console.error(`Error fetching RSS from ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Scrape articles from website
   */
  private async scrapeFromWebsite(source: NewsSource): Promise<NewsArticle[]> {
    try {
      // This would use a web scraping service in production
      // For now, we'll use a mock implementation with realistic data
      return this.generateRealisticArticles(source);
    } catch (error) {
      console.error(`Error scraping from ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Generate realistic articles for a source
   */
  private generateRealisticArticles(source: NewsSource): NewsArticle[] {
    const articleTemplates = [
      {
        headline: 'JSE Market Shows Strong Performance in Q4',
        content: 'The Jamaica Stock Exchange continues to show resilience with several companies reporting strong quarterly results. NCB Financial Group led the gains with a 3.2% increase, while Scotia Group Jamaica also posted positive results.',
        category: 'market-updates',
        tickers: ['NCBFG', 'SGJ', 'JMMB']
      },
      {
        headline: 'Banking Sector Leads Market Gains',
        content: 'NCB Financial Group and other banking stocks led the market higher today as investors responded positively to the latest economic indicators. The banking sector index rose 2.1% on strong trading volume.',
        category: 'company-news',
        tickers: ['NCBFG', 'SGJ']
      },
      {
        headline: 'BOJ Maintains Interest Rates Amid Economic Recovery',
        content: 'The Bank of Jamaica has decided to maintain its current interest rate policy as the economy continues to show signs of recovery. Governor Richard Byles cited improving employment figures and stable inflation.',
        category: 'economic-policy',
        tickers: []
      },
      {
        headline: 'Tourism Sector Shows Signs of Recovery',
        content: 'Jamaica\'s tourism sector is showing encouraging signs of recovery with increased visitor arrivals and hotel occupancy rates. This positive trend is expected to benefit related sectors in the coming months.',
        category: 'sector-analysis',
        tickers: ['WCO']
      },
      {
        headline: 'Global Economic Trends Impact JSE',
        content: 'International market movements are having a mixed impact on the Jamaica Stock Exchange. While some sectors benefit from global trends, others face challenges from external economic factors.',
        category: 'international',
        tickers: ['NCBFG', 'SGJ', 'JMMB']
      }
    ];

    return articleTemplates.map((template, index) => ({
      id: `${source.id}-${Date.now()}-${index}`,
      headline: template.headline,
      content: template.content,
      source: source.name,
      url: `${source.base_url}/article-${index}`,
      published_at: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Random time in last 24 hours
      company_tickers: template.tickers,
      tags: [template.category, 'jamaica', 'finance'],
      ai_priority_score: Math.random() * 10, // Will be calculated by AI
      ai_summary: '', // Will be generated by AI
      sentiment_score: 0, // Will be calculated by AI
      relevance_score: 0, // Will be calculated by AI
      metadata: {
        word_count: template.content.split(' ').length,
        reading_time: Math.ceil(template.content.split(' ').length / 200),
        author: 'Financial Reporter',
        category: template.category
      }
    }));
  }

  /**
   * Parse RSS feed XML
   */
  private parseRSSFeed(xmlText: string, source: NewsSource): NewsArticle[] {
    // Simplified RSS parsing - in production, use a proper XML parser
    const articles: NewsArticle[] = [];
    
    // This is a simplified implementation
    // In production, you would use a proper RSS parser like 'rss-parser'
    
    return articles;
  }

  /**
   * Process articles with AI analysis
   */
  private async processArticlesWithAI(articles: NewsArticle[]): Promise<NewsArticle[]> {
    try {
      const processedArticles = await Promise.all(
        articles.map(async (article) => {
          // Calculate AI priority score
          const priorityScore = await this.calculatePriorityScore(article);
          
          // Generate AI summary
          const summary = await this.generateAISummary(article);
          
          // Calculate sentiment score
          const sentimentScore = await this.calculateSentimentScore(article);
          
          // Calculate relevance score
          const relevanceScore = await this.calculateRelevanceScore(article);

          return {
            ...article,
            ai_priority_score: priorityScore,
            ai_summary: summary,
            sentiment_score: sentimentScore,
            relevance_score: relevanceScore
          };
        })
      );

      return processedArticles;
    } catch (error) {
      console.error('Error processing articles with AI:', error);
      return articles; // Return unprocessed articles if AI fails
    }
  }

  /**
   * Calculate AI priority score for an article
   */
  private async calculatePriorityScore(article: NewsArticle): Promise<number> {
    let score = 0;
    
    // Base score from source priority
    const source = this.sources.find(s => s.name === article.source);
    if (source) {
      score += source.priority_score * 0.3;
    }
    
    // Company ticker relevance
    const tickerCount = article.company_tickers.length;
    score += tickerCount * 2;
    
    // Content analysis
    const contentLength = article.content.length;
    score += Math.min(contentLength / 1000, 3); // Max 3 points for content length
    
    // Keyword analysis
    const keywords = ['earnings', 'revenue', 'profit', 'growth', 'acquisition', 'merger'];
    const keywordMatches = keywords.filter(keyword => 
      article.content.toLowerCase().includes(keyword)
    ).length;
    score += keywordMatches * 1.5;
    
    // Recent publication bonus
    const hoursSincePublication = (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60);
    if (hoursSincePublication < 24) {
      score += 2;
    }
    
    return Math.min(score, 10); // Cap at 10
  }

  /**
   * Generate AI summary for an article
   */
  private async generateAISummary(article: NewsArticle): Promise<string> {
    // In production, this would call an AI service like DeepSeek
    // For now, we'll generate a simple summary
    const sentences = article.content.split('.').slice(0, 2);
    return sentences.join('.') + '.';
  }

  /**
   * Calculate sentiment score for an article
   */
  private async calculateSentimentScore(article: NewsArticle): Promise<number> {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['growth', 'profit', 'increase', 'strong', 'positive', 'gain'];
    const negativeWords = ['loss', 'decline', 'decrease', 'weak', 'negative', 'fall'];
    
    const content = article.content.toLowerCase();
    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;
    
    return positiveCount - negativeCount;
  }

  /**
   * Calculate relevance score for an article
   */
  private async calculateRelevanceScore(article: NewsArticle): Promise<number> {
    let score = 0;
    
    // JSE company relevance
    const jseTickers = article.company_tickers.filter(ticker => 
      JSE_COMPANIES.includes(ticker)
    );
    score += jseTickers.length * 3;
    
    // Category relevance
    const category = this.categories.find(c => c.id === article.metadata.category);
    if (category) {
      score += 2;
    }
    
    // Content relevance
    const financeKeywords = ['stock', 'market', 'trading', 'investment', 'financial'];
    const keywordMatches = financeKeywords.filter(keyword => 
      article.content.toLowerCase().includes(keyword)
    ).length;
    score += keywordMatches * 1.5;
    
    return Math.min(score, 10); // Cap at 10
  }

  /**
   * Store articles in database
   */
  private async storeArticles(articles: NewsArticle[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('articles')
        .upsert(articles.map(article => ({
          id: article.id,
          headline: article.headline,
          source: article.source,
          url: article.url,
          content: article.content,
          publication_date: article.published_at,
          company_tickers: article.company_tickers,
          tags: article.tags,
          ai_priority_score: article.ai_priority_score,
          ai_summary: article.ai_summary,
          sentiment_score: article.sentiment_score,
          relevance_score: article.relevance_score,
          is_processed: true,
          processing_status: 'completed'
        })));

      if (error) {
        console.error('Error storing articles:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error storing articles:', error);
      throw error;
    }
  }

  /**
   * Get articles from database
   */
  async getArticles(limit: number = 50, offset: number = 0): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('ai_priority_score', { ascending: false })
        .order('publication_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching articles:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  }

  /**
   * Get articles by company ticker
   */
  async getArticlesByTicker(ticker: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .contains('company_tickers', [ticker])
        .order('ai_priority_score', { ascending: false })
        .order('publication_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching articles by ticker:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching articles by ticker:', error);
      throw error;
    }
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(category: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .contains('tags', [category])
        .order('ai_priority_score', { ascending: false })
        .order('publication_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching articles by category:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching articles by category:', error);
      throw error;
    }
  }

  /**
   * Search articles
   */
  async searchArticles(query: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .or(`headline.ilike.%${query}%,content.ilike.%${query}%`)
        .order('ai_priority_score', { ascending: false })
        .order('publication_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error searching articles:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching articles:', error);
      throw error;
    }
  }

  /**
   * Get news sources
   */
  getNewsSources(): NewsSource[] {
    return this.sources;
  }

  /**
   * Get news categories
   */
  getNewsCategories(): NewsCategory[] {
    return this.categories;
  }

  /**
   * Update source status
   */
  async updateSourceStatus(sourceId: string, isActive: boolean): Promise<void> {
    const source = this.sources.find(s => s.id === sourceId);
    if (source) {
      source.is_active = isActive;
    }
  }
}

// Create singleton instance
const comprehensiveNewsService = new ComprehensiveNewsService();

export default comprehensiveNewsService;

// Export convenience functions
export async function fetchAllNewsArticles(): Promise<NewsArticle[]> {
  return await comprehensiveNewsService.fetchAllArticles();
}

export async function getNewsArticles(limit?: number, offset?: number): Promise<NewsArticle[]> {
  return await comprehensiveNewsService.getArticles(limit, offset);
}

export async function getNewsArticlesByTicker(ticker: string, limit?: number): Promise<NewsArticle[]> {
  return await comprehensiveNewsService.getArticlesByTicker(ticker, limit);
}

export async function getNewsArticlesByCategory(category: string, limit?: number): Promise<NewsArticle[]> {
  return await comprehensiveNewsService.getArticlesByCategory(category, limit);
}

export async function searchNewsArticles(query: string, limit?: number): Promise<NewsArticle[]> {
  return await comprehensiveNewsService.searchArticles(query, limit);
}

export function getNewsSources(): NewsSource[] {
  return comprehensiveNewsService.getNewsSources();
}

export function getNewsCategories(): NewsCategory[] {
  return comprehensiveNewsService.getNewsCategories();
}
