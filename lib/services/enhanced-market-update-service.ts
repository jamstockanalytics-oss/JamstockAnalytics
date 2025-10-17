import { fetchRealJSEData, getJSEMarketStatus, isJSEMarketOpen } from './real-jse-data-service';

export interface MarketUpdateEvent {
  type: 'market_open' | 'market_close' | 'data_update' | 'price_alert' | 'error';
  timestamp: string;
  data?: any;
  message?: string;
  error?: string;
}

export interface MarketUpdateCallback {
  (event: MarketUpdateEvent): void;
}

export interface PriceChange {
  symbol: string;
  previousPrice: number;
  currentPrice: number;
  change: number;
  changePercent: number;
}

class EnhancedMarketUpdateService {
  private updateInterval: number | null = null;
  private dataInterval: number | null = null;
  private callbacks: MarketUpdateCallback[] = [];
  private lastMarketStatus: boolean | null = null;
  private isRunning: boolean = false;
  private lastPrices: Map<string, number> = new Map();
  private errorCount: number = 0;
  private maxErrors: number = 5;
  private updateFrequency: number = 30000; // 30 seconds
  private dataFetchFrequency: number = 120000; // 2 minutes when market is open

  /**
   * Start the enhanced market data update service
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.errorCount = 0;
    
    console.log('Starting enhanced market update service...');
    
    // Check market status immediately
    this.checkMarketStatus();

    // Set up interval to check market status
    this.updateInterval = setInterval(() => {
      this.checkMarketStatus();
    }, this.updateFrequency);

    // Set up interval to fetch data when market is open
    this.dataInterval = setInterval(() => {
      if (isJSEMarketOpen()) {
        this.fetchMarketData();
      }
    }, this.dataFetchFrequency);
  }

  /**
   * Stop the enhanced market data update service
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    if (this.dataInterval) {
      clearInterval(this.dataInterval);
      this.dataInterval = null;
    }
    
    this.isRunning = false;
    this.lastPrices.clear();
    console.log('Enhanced market update service stopped');
  }

  /**
   * Add a callback for market updates
   */
  addCallback(callback: MarketUpdateCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove a callback
   */
  removeCallback(callback: MarketUpdateCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * Check if the service is running
   */
  isServiceRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get current update frequency
   */
  getUpdateFrequency(): number {
    return this.updateFrequency;
  }

  /**
   * Set update frequency
   */
  setUpdateFrequency(frequency: number): void {
    this.updateFrequency = Math.max(10000, frequency); // Minimum 10 seconds
  }

  /**
   * Check market status and handle state changes
   */
  private async checkMarketStatus(): Promise<void> {
    try {
      const marketStatus = getJSEMarketStatus();
      const isOpen = marketStatus.is_open;

      // Handle market open/close events
      if (this.lastMarketStatus !== null && this.lastMarketStatus !== isOpen) {
        if (isOpen) {
          this.emitEvent({
            type: 'market_open',
            timestamp: new Date().toISOString(),
            message: 'JSE Market is now open'
          });
          
          // Fetch data immediately when market opens
          this.fetchMarketData();
        } else {
          this.emitEvent({
            type: 'market_close',
            timestamp: new Date().toISOString(),
            message: 'JSE Market is now closed'
          });
        }
      }

      this.lastMarketStatus = isOpen;
      this.errorCount = 0; // Reset error count on successful status check
      
    } catch (error) {
      console.error('Error checking market status:', error);
      this.handleError('Failed to check market status', error);
    }
  }

  /**
   * Fetch fresh market data
   */
  private async fetchMarketData(): Promise<void> {
    try {
      console.log('Fetching market data...');
      const marketData = await fetchRealJSEData();
      
      // Track price changes
      const priceChanges = this.trackPriceChanges(marketData.stocks);
      
      // Emit data update event
      this.emitEvent({
        type: 'data_update',
        timestamp: new Date().toISOString(),
        data: marketData,
        message: `Market data updated with ${marketData.stocks.length} stocks`
      });

      // Emit price alerts for significant changes
      priceChanges.forEach(change => {
        if (Math.abs(change.changePercent) > 5) { // 5% threshold
          this.emitEvent({
            type: 'price_alert',
            timestamp: new Date().toISOString(),
            data: change,
            message: `${change.symbol} changed by ${change.changePercent.toFixed(2)}%`
          });
        }
      });

      this.errorCount = 0; // Reset error count on successful fetch
      
    } catch (error) {
      console.error('Error fetching market data:', error);
      this.handleError('Failed to fetch market data', error);
    }
  }

  /**
   * Track price changes between updates
   */
  private trackPriceChanges(stocks: any[]): PriceChange[] {
    const changes: PriceChange[] = [];
    
    stocks.forEach(stock => {
      const previousPrice = this.lastPrices.get(stock.symbol);
      if (previousPrice && previousPrice !== stock.last_price) {
        changes.push({
          symbol: stock.symbol,
          previousPrice,
          currentPrice: stock.last_price,
          change: stock.last_price - previousPrice,
          changePercent: ((stock.last_price - previousPrice) / previousPrice) * 100
        });
      }
      
      // Update last price
      this.lastPrices.set(stock.symbol, stock.last_price);
    });
    
    return changes;
  }

  /**
   * Handle errors with exponential backoff
   */
  private handleError(message: string, error: any): void {
    this.errorCount++;
    
    this.emitEvent({
      type: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message || 'Unknown error'
    });

    // If too many errors, stop the service
    if (this.errorCount >= this.maxErrors) {
      console.error(`Too many errors (${this.errorCount}), stopping service`);
      this.stop();
      
      this.emitEvent({
        type: 'error',
        timestamp: new Date().toISOString(),
        message: 'Service stopped due to repeated errors',
        error: `Failed ${this.errorCount} times`
      });
    }
  }

  /**
   * Emit an event to all registered callbacks
   */
  private emitEvent(event: MarketUpdateEvent): void {
    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in market update callback:', error);
      }
    });
  }

  /**
   * Force a manual data refresh
   */
  async forceRefresh(): Promise<void> {
    if (this.isRunning) {
      await this.fetchMarketData();
    }
  }

  /**
   * Get service statistics
   */
  getServiceStats(): {
    isRunning: boolean;
    errorCount: number;
    updateFrequency: number;
    dataFetchFrequency: number;
    trackedStocks: number;
  } {
    return {
      isRunning: this.isRunning,
      errorCount: this.errorCount,
      updateFrequency: this.updateFrequency,
      dataFetchFrequency: this.dataFetchFrequency,
      trackedStocks: this.lastPrices.size
    };
  }
}

// Create singleton instance
const enhancedMarketUpdateService = new EnhancedMarketUpdateService();

// Export functions for backward compatibility
export function initializeMarketUpdates(
  onMarketOpen: () => void,
  onMarketClose: () => void,
  onDataUpdate: (data: any) => void
): void {
  enhancedMarketUpdateService.addCallback((event) => {
    switch (event.type) {
      case 'market_open':
        onMarketOpen();
        break;
      case 'market_close':
        onMarketClose();
        break;
      case 'data_update':
        onDataUpdate(event.data);
        break;
    }
  });
  
  enhancedMarketUpdateService.start();
}

export function stopMarketUpdates(): void {
  enhancedMarketUpdateService.stop();
}

export function getMarketUpdateStatus(): {
  isRunning: boolean;
  errorCount: number;
  updateFrequency: number;
  trackedStocks: number;
} {
  return enhancedMarketUpdateService.getServiceStats();
}

export function forceMarketDataRefresh(): Promise<void> {
  return enhancedMarketUpdateService.forceRefresh();
}

export function setMarketUpdateFrequency(frequency: number): void {
  enhancedMarketUpdateService.setUpdateFrequency(frequency);
}

export default enhancedMarketUpdateService;
