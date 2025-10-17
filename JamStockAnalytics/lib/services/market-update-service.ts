import { fetchRealJSEData, getJSEMarketStatus, isJSEMarketOpen } from './real-jse-data-service';
import { fetchJSEData } from './jse-data-service';

export interface MarketUpdateEvent {
  type: 'market_open' | 'market_close' | 'data_update' | 'price_alert';
  timestamp: string;
  data?: any;
  message?: string;
}

export interface MarketUpdateCallback {
  (event: MarketUpdateEvent): void;
}

class MarketUpdateService {
  private updateInterval: number | null = null;
  private callbacks: MarketUpdateCallback[] = [];
  private lastMarketStatus: boolean | null = null;
  private isRunning: boolean = false;

  /**
   * Start the automatic market data update service
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    // Check market status immediately
    this.checkMarketStatus();

    // Set up interval to check every 30 seconds
    this.updateInterval = setInterval(() => {
      this.checkMarketStatus();
    }, 30000); // 30 seconds

    // Set up interval to fetch data every 2 minutes when market is open
    setInterval(() => {
      if (isJSEMarketOpen()) {
        this.fetchMarketData();
      }
    }, 120000); // 2 minutes
  }

  /**
   * Stop the automatic market data update service
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    }

  /**
   * Add a callback for market update events
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
   * Check market status and trigger appropriate events
   */
  private async checkMarketStatus(): Promise<void> {
    try {
      const marketStatus = getJSEMarketStatus();
      const isOpen = marketStatus.is_open;

      // Check if market status changed
      if (this.lastMarketStatus !== null && this.lastMarketStatus !== isOpen) {
        if (isOpen) {
          this.emitEvent({
            type: 'market_open',
            timestamp: new Date().toISOString(),
            message: 'JSE market has opened'
          });
        } else {
          this.emitEvent({
            type: 'market_close',
            timestamp: new Date().toISOString(),
            message: 'JSE market has closed'
          });
        }
      }

      this.lastMarketStatus = isOpen;

      // If market is open, fetch fresh data
      if (isOpen) {
        await this.fetchMarketData();
      }

    } catch (error) {
      console.error('Error checking market status:', error);
    }
  }

  /**
   * Fetch fresh market data
   */
  private async fetchMarketData(): Promise<void> {
    try {
      const marketData = await fetchRealJSEData();
      
      this.emitEvent({
        type: 'data_update',
        timestamp: new Date().toISOString(),
        data: marketData,
        message: 'Market data updated'
      });

      } catch (error) {
      console.error('Error fetching market data:', error);
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
   * Get current service status
   */
  getStatus(): { isRunning: boolean; lastUpdate: string | null } {
    return {
      isRunning: this.isRunning,
      lastUpdate: this.lastMarketStatus !== null ? new Date().toISOString() : null
    };
  }
}

// Create singleton instance
export const marketUpdateService = new MarketUpdateService();

/**
 * Initialize market update service with callbacks
 */
export function initializeMarketUpdates(
  onMarketOpen: () => void,
  onMarketClose: () => void,
  onDataUpdate: (data: any) => void
): void {
  // Add callbacks
  marketUpdateService.addCallback((event) => {
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

  // Start the service
  marketUpdateService.start();
}

/**
 * Stop market update service
 */
export function stopMarketUpdates(): void {
  marketUpdateService.stop();
}

/**
 * Get market update service status
 */
export function getMarketUpdateStatus(): { isRunning: boolean; lastUpdate: string | null } {
  return marketUpdateService.getStatus();
}

/**
 * Manual trigger for market data update
 */
export async function triggerMarketUpdate(): Promise<void> {
  try {
    await fetchJSEData();
    marketUpdateService.addCallback((event) => {
      if (event.type === 'data_update') {
        }
    });
  } catch (error) {
    console.error('Error triggering manual market update:', error);
  }
}

/**
 * Set up price alerts for specific stocks
 */
export function setupPriceAlerts(
  symbol: string,
  targetPrice: number,
  condition: 'above' | 'below',
  callback: (alert: { symbol: string; currentPrice: number; targetPrice: number; condition: string }) => void
): void {
  marketUpdateService.addCallback(async (event) => {
    if (event.type === 'data_update' && event.data) {
      const stock = event.data.stocks.find((s: any) => s.symbol === symbol);
      if (stock) {
        const shouldAlert = condition === 'above' 
          ? stock.last_price >= targetPrice
          : stock.last_price <= targetPrice;
        
        if (shouldAlert) {
          callback({
            symbol,
            currentPrice: stock.last_price,
            targetPrice,
            condition
          });
        }
      }
    }
  });
}
