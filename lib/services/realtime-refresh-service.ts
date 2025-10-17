import { supabase } from '../supabase/client';
import { fetchRealJSEData } from './real-jse-data-service';
import { fetchAllNewsArticles } from './comprehensive-news-service';
import { JSETradingSession } from './jse-data-service';
import { NewsArticle } from './comprehensive-news-service';
import { scrapeAllNewsSources, processArticlesWithAI, storeScrapedArticles } from './enhanced-news-scraping-service';

/**
 * Real-time Refresh Service
 * Manages 10-second refresh intervals for market data and news updates
 */

export interface RealtimeUpdate {
  type: 'market_data' | 'news_update' | 'price_change' | 'market_status';
  timestamp: string;
  data: any;
  message: string;
}

export interface RealtimeStats {
  last_market_update: string;
  last_news_update: string;
  total_updates: number;
  successful_updates: number;
  failed_updates: number;
  average_response_time: number;
  is_connected: boolean;
}

class RealtimeRefreshService {
  private marketDataInterval: ReturnType<typeof setInterval> | null = null;
  private newsDataInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;
  private updateCallbacks: ((update: RealtimeUpdate) => void)[] = [];
  private stats: RealtimeStats = {
    last_market_update: '',
    last_news_update: '',
    total_updates: 0,
    successful_updates: 0,
    failed_updates: 0,
    average_response_time: 0,
    is_connected: false
  };
  private responseTimes: number[] = [];

  /**
   * Start real-time refresh service
   */
  public start(): void {
    if (this.isRunning) {
      console.log('RealtimeRefreshService: Already running');
      return;
    }

    console.log('RealtimeRefreshService: Starting real-time refresh service...');
    this.isRunning = true;
    this.stats.is_connected = true;

    // Start market data refresh every 10 seconds
    this.startMarketDataRefresh();
    
    // Start news data refresh every 30 seconds
    this.startNewsDataRefresh();

    // Initial data fetch
    this.fetchInitialData();
  }

  /**
   * Stop real-time refresh service
   */
  public stop(): void {
    if (!this.isRunning) {
      console.log('RealtimeRefreshService: Not running');
      return;
    }

    console.log('RealtimeRefreshService: Stopping real-time refresh service...');
    this.isRunning = false;
    this.stats.is_connected = false;

    if (this.marketDataInterval) {
      clearInterval(this.marketDataInterval);
      this.marketDataInterval = null;
    }

    if (this.newsDataInterval) {
      clearInterval(this.newsDataInterval);
      this.newsDataInterval = null;
    }
  }

  /**
   * Start market data refresh
   */
  private startMarketDataRefresh(): void {
    this.marketDataInterval = setInterval(async () => {
      await this.refreshMarketData();
    }, 10000); // 10 seconds
  }

  /**
   * Start news data refresh
   */
  private startNewsDataRefresh(): void {
    this.newsDataInterval = setInterval(async () => {
      await this.refreshNewsData();
    }, 10000); // 10 seconds - same as market data
  }

  /**
   * Fetch initial data
   */
  private async fetchInitialData(): Promise<void> {
    try {
      console.log('RealtimeRefreshService: Fetching initial data...');
      await Promise.all([
        this.refreshMarketData(),
        this.refreshNewsData()
      ]);
    } catch (error) {
      console.error('RealtimeRefreshService: Error fetching initial data:', error);
    }
  }

  /**
   * Refresh market data
   */
  private async refreshMarketData(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('RealtimeRefreshService: Refreshing market data...');
      const marketData = await fetchRealJSEData();
      
      // Store market data in database
      await this.storeMarketData(marketData);
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      this.updateStats(true, responseTime);
      
      // Emit update event
      this.emitUpdate({
        type: 'market_data',
        timestamp: new Date().toISOString(),
        data: marketData,
        message: 'Market data updated successfully'
      });

      console.log('RealtimeRefreshService: Market data refreshed successfully');
    } catch (error) {
      console.error('RealtimeRefreshService: Error refreshing market data:', error);
      this.updateStats(false, Date.now() - startTime);
      
      // Emit error event
      this.emitUpdate({
        type: 'market_data',
        timestamp: new Date().toISOString(),
        data: null,
        message: 'Failed to refresh market data'
      });
    }
  }

  /**
   * Refresh news data
   */
  private async refreshNewsData(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('RealtimeRefreshService: Refreshing news data with enhanced scraping...');
      
      // Scrape news from all sources
      const scrapedArticles = await scrapeAllNewsSources();
      console.log(`RealtimeRefreshService: Scraped ${scrapedArticles.length} articles`);
      
      // Process articles with AI analysis
      const processedArticles = await processArticlesWithAI(scrapedArticles);
      console.log(`RealtimeRefreshService: Processed ${processedArticles.length} articles with AI`);
      
      // Store processed articles in database
      await storeScrapedArticles(processedArticles);
      console.log('RealtimeRefreshService: Articles stored in database');
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      this.updateStats(true, responseTime);
      
      // Emit update event
      this.emitUpdate({
        type: 'news_update',
        timestamp: new Date().toISOString(),
        data: processedArticles,
        message: `News data updated successfully - ${processedArticles.length} articles processed`
      });

      console.log('RealtimeRefreshService: News data refreshed successfully');
    } catch (error) {
      console.error('RealtimeRefreshService: Error refreshing news data:', error);
      this.updateStats(false, Date.now() - startTime);
      
      // Emit error event
      this.emitUpdate({
        type: 'news_update',
        timestamp: new Date().toISOString(),
        data: null,
        message: 'Failed to refresh news data'
      });
    }
  }

  /**
   * Store market data in database
   */
  private async storeMarketData(marketData: JSETradingSession): Promise<void> {
    try {
      // Store market summary
      const { error: summaryError } = await supabase
        .from('market_summaries')
        .upsert({
          date: marketData.date,
          total_volume: marketData.market_summary.total_volume,
          total_value: marketData.market_summary.total_value,
          advancing_stocks: marketData.market_summary.advancing_stocks,
          declining_stocks: marketData.market_summary.declining_stocks,
          unchanged_stocks: marketData.market_summary.unchanged_stocks,
          market_index: marketData.market_summary.market_index,
          market_change: marketData.market_summary.market_change,
          market_change_percent: marketData.market_summary.market_change_percent,
          last_updated: new Date().toISOString()
        });

      if (summaryError) {
        console.error('Error storing market summary:', summaryError);
      }

      // Store stock data
      const { error: stocksError } = await supabase
        .from('stock_data')
        .upsert(marketData.stocks.map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          last_price: stock.last_price,
          change: stock.change,
          change_percent: stock.change_percent,
          volume: stock.volume,
          high: stock.high,
          low: stock.low,
          open: stock.open,
          previous_close: stock.previous_close,
          market_cap: stock.market_cap,
          pe_ratio: stock.pe_ratio,
          dividend_yield: stock.dividend_yield,
          last_updated: stock.last_updated
        })));

      if (stocksError) {
        console.error('Error storing stock data:', stocksError);
      }
    } catch (error) {
      console.error('Error storing market data:', error);
    }
  }


  /**
   * Update statistics
   */
  private updateStats(success: boolean, responseTime: number): void {
    this.stats.total_updates++;
    this.stats.last_market_update = new Date().toISOString();
    
    if (success) {
      this.stats.successful_updates++;
    } else {
      this.stats.failed_updates++;
    }

    // Update response times
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift(); // Keep only last 100 response times
    }

    // Calculate average response time
    this.stats.average_response_time = this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
  }

  /**
   * Emit update event
   */
  private emitUpdate(update: RealtimeUpdate): void {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error in update callback:', error);
      }
    });
  }

  /**
   * Subscribe to updates
   */
  public subscribe(callback: (update: RealtimeUpdate) => void): () => void {
    this.updateCallbacks.push(callback);
    return () => {
      this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Get service statistics
   */
  public getStats(): RealtimeStats {
    return { ...this.stats };
  }

  /**
   * Get service status
   */
  public getStatus(): {
    is_running: boolean;
    is_connected: boolean;
    last_update: string;
    next_update: string;
  } {
    return {
      is_running: this.isRunning,
      is_connected: this.stats.is_connected,
      last_update: this.stats.last_market_update,
      next_update: new Date(Date.now() + 10000).toISOString()
    };
  }

  /**
   * Force refresh
   */
  public async forceRefresh(): Promise<void> {
    console.log('RealtimeRefreshService: Force refresh requested');
    await Promise.all([
      this.refreshMarketData(),
      this.refreshNewsData()
    ]);
  }

  /**
   * Get current market data
   */
  public async getCurrentMarketData(): Promise<JSETradingSession | null> {
    try {
      return await fetchRealJSEData();
    } catch (error) {
      console.error('Error fetching current market data:', error);
      return null;
    }
  }

  /**
   * Get current news data
   */
  public async getCurrentNewsData(): Promise<NewsArticle[] | null> {
    try {
      return await fetchAllNewsArticles();
    } catch (error) {
      console.error('Error fetching current news data:', error);
      return null;
    }
  }
}

// Create singleton instance
const realtimeRefreshService = new RealtimeRefreshService();

export default realtimeRefreshService;

// Export convenience functions
export function startRealtimeRefresh(): void {
  realtimeRefreshService.start();
}

export function stopRealtimeRefresh(): void {
  realtimeRefreshService.stop();
}

export function subscribeToUpdates(callback: (update: RealtimeUpdate) => void): () => void {
  return realtimeRefreshService.subscribe(callback);
}

export function getRealtimeStats(): RealtimeStats {
  return realtimeRefreshService.getStats();
}

export function getRealtimeStatus(): {
  is_running: boolean;
  is_connected: boolean;
  last_update: string;
  next_update: string;
} {
  return realtimeRefreshService.getStatus();
}

export function forceRefresh(): Promise<void> {
  return realtimeRefreshService.forceRefresh();
}

export function getCurrentMarketData(): Promise<JSETradingSession | null> {
  return realtimeRefreshService.getCurrentMarketData();
}

export function getCurrentNewsData(): Promise<NewsArticle[] | null> {
  return realtimeRefreshService.getCurrentNewsData();
}
