import { fetchRealJSEData, isJSEMarketOpen } from './real-jse-data-service';

export interface SmartUpdateConfig {
  marketOpenInterval: number;    // Update frequency when market is open (ms)
  marketClosedInterval: number;  // Update frequency when market is closed (ms)
  maxRetries: number;           // Maximum retry attempts
  retryDelay: number;           // Delay between retries (ms)
  adaptiveFrequency: boolean;   // Whether to adapt frequency based on activity
}

export interface UpdateStats {
  totalUpdates: number;
  successfulUpdates: number;
  failedUpdates: number;
  averageResponseTime: number;
  lastUpdateTime: string | null;
  currentFrequency: number;
}

class SmartUpdateService {
  private config: SmartUpdateConfig;
  private updateInterval: number | null = null;
  private isRunning: boolean = false;
  private stats: UpdateStats;
  private consecutiveFailures: number = 0;
  private adaptiveFrequency: number;

  constructor(config?: Partial<SmartUpdateConfig>) {
    this.config = {
      marketOpenInterval: 30000,    // 30 seconds when market is open
      marketClosedInterval: 300000, // 5 minutes when market is closed
      maxRetries: 3,
      retryDelay: 5000,
      adaptiveFrequency: true,
      ...config
    };

    this.stats = {
      totalUpdates: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      averageResponseTime: 0,
      lastUpdateTime: null,
      currentFrequency: this.config.marketOpenInterval
    };

    this.adaptiveFrequency = this.config.marketOpenInterval;
  }

  /**
   * Start the smart update service
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    console.log('Starting smart update service...');
    
    // Start with initial update
    this.performUpdate();
    
    // Set up adaptive interval
    this.scheduleNextUpdate();
  }

  /**
   * Stop the smart update service
   */
  stop(): void {
    if (this.updateInterval) {
      clearTimeout(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.isRunning = false;
    console.log('Smart update service stopped');
  }

  /**
   * Get current update statistics
   */
  getStats(): UpdateStats {
    return { ...this.stats };
  }

  /**
   * Get current configuration
   */
  getConfig(): SmartUpdateConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SmartUpdateConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart service if running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Force an immediate update
   */
  async forceUpdate(): Promise<boolean> {
    return await this.performUpdate();
  }

  /**
   * Schedule the next update based on current conditions
   */
  private scheduleNextUpdate(): void {
    if (!this.isRunning) {
      return;
    }

    const isMarketOpen = isJSEMarketOpen();
    const baseInterval = isMarketOpen 
      ? this.config.marketOpenInterval 
      : this.config.marketClosedInterval;

    // Apply adaptive frequency if enabled
    const interval = this.config.adaptiveFrequency 
      ? this.calculateAdaptiveInterval(baseInterval)
      : baseInterval;

    this.stats.currentFrequency = interval;

    this.updateInterval = setTimeout(() => {
      this.performUpdate().then(() => {
        this.scheduleNextUpdate();
      });
    }, interval);
  }

  /**
   * Calculate adaptive update interval based on market activity
   */
  private calculateAdaptiveInterval(baseInterval: number): number {
    const { successfulUpdates, failedUpdates, totalUpdates } = this.stats;
    
    if (totalUpdates === 0) {
      return baseInterval;
    }

    const successRate = successfulUpdates / totalUpdates;
    const failureRate = failedUpdates / totalUpdates;

    // If we have high failure rate, slow down updates
    if (failureRate > 0.3) {
      return Math.min(baseInterval * 2, 300000); // Max 5 minutes
    }

    // If we have high success rate and market is active, speed up
    if (successRate > 0.9 && isJSEMarketOpen()) {
      return Math.max(baseInterval * 0.7, 15000); // Min 15 seconds
    }

    // If market is closed, slow down significantly
    if (!isJSEMarketOpen()) {
      return Math.max(baseInterval * 2, 600000); // Min 10 minutes
    }

    return baseInterval;
  }

  /**
   * Perform a market data update
   */
  private async performUpdate(): Promise<boolean> {
    const startTime = Date.now();
    this.stats.totalUpdates++;

    try {
      console.log('Performing market data update...');
      
      await fetchRealJSEData();
      
      const responseTime = Date.now() - startTime;
      this.updateStats(true, responseTime);
      
      console.log(`Market data updated successfully in ${responseTime}ms`);
      
      // Reset consecutive failures on success
      this.consecutiveFailures = 0;
      
      return true;
      
    } catch (error) {
      console.error('Market data update failed:', error);
      
      const responseTime = Date.now() - startTime;
      this.updateStats(false, responseTime);
      
      this.consecutiveFailures++;
      
      // If too many consecutive failures, slow down updates
      if (this.consecutiveFailures >= this.config.maxRetries) {
        console.warn(`Too many consecutive failures (${this.consecutiveFailures}), slowing down updates`);
        this.adaptiveFrequency = Math.min(this.adaptiveFrequency * 1.5, 300000);
      }
      
      return false;
    }
  }

  /**
   * Update statistics
   */
  private updateStats(success: boolean, responseTime: number): void {
    if (success) {
      this.stats.successfulUpdates++;
    } else {
      this.stats.failedUpdates++;
    }

    // Update average response time
    const totalResponses = this.stats.successfulUpdates + this.stats.failedUpdates;
    this.stats.averageResponseTime = 
      (this.stats.averageResponseTime * (totalResponses - 1) + responseTime) / totalResponses;

    this.stats.lastUpdateTime = new Date().toISOString();
  }

  /**
   * Check if service is running
   */
  isServiceRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get service health status
   */
  getHealthStatus(): {
    isHealthy: boolean;
    successRate: number;
    averageResponseTime: number;
    consecutiveFailures: number;
    recommendation: string;
  } {
    const successRate = this.stats.totalUpdates > 0 
      ? this.stats.successfulUpdates / this.stats.totalUpdates 
      : 0;

    const isHealthy = successRate > 0.7 && this.consecutiveFailures < this.config.maxRetries;
    
    let recommendation = 'Service is running normally';
    if (successRate < 0.7) {
      recommendation = 'Consider reducing update frequency due to low success rate';
    } else if (this.consecutiveFailures >= this.config.maxRetries) {
      recommendation = 'Service is experiencing issues, consider manual intervention';
    } else if (this.stats.averageResponseTime > 10000) {
      recommendation = 'Response times are slow, consider optimizing data sources';
    }

    return {
      isHealthy,
      successRate,
      averageResponseTime: this.stats.averageResponseTime,
      consecutiveFailures: this.consecutiveFailures,
      recommendation
    };
  }
}

// Create singleton instance
const smartUpdateService = new SmartUpdateService();

export default smartUpdateService;

// Export convenience functions
export function startSmartUpdates(config?: Partial<SmartUpdateConfig>): void {
  if (config) {
    smartUpdateService.updateConfig(config);
  }
  smartUpdateService.start();
}

export function stopSmartUpdates(): void {
  smartUpdateService.stop();
}

export function getSmartUpdateStats(): UpdateStats {
  return smartUpdateService.getStats();
}

export function getSmartUpdateHealth(): ReturnType<typeof smartUpdateService.getHealthStatus> {
  return smartUpdateService.getHealthStatus();
}

export function forceSmartUpdate(): Promise<boolean> {
  return smartUpdateService.forceUpdate();
}
