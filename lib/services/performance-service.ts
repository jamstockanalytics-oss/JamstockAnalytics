/**
 * Performance Monitoring Service
 * Tracks and optimizes app performance metrics
 */

import { supabase } from '../supabase/client';

interface PerformanceMetric {
  id?: string;
  user_id?: string;
  session_id: string;
  metric_type: 'page_load' | 'api_call' | 'component_render' | 'user_interaction' | 'memory_usage';
  metric_name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface PerformanceThresholds {
  page_load_time: number; // ms
  api_response_time: number; // ms
  component_render_time: number; // ms
  memory_usage: number; // bytes
  error_rate: number; // percentage
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private sessionId: string;
  private userId?: string;
  private thresholds: PerformanceThresholds;
  private isEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = process.env.NODE_ENV === 'production' || process.env.EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true';
    
    this.thresholds = {
      page_load_time: 3000, // 3 seconds
      api_response_time: 5000, // 5 seconds
      component_render_time: 100, // 100ms
      memory_usage: 100 * 1024 * 1024, // 100MB
      error_rate: 5, // 5%
    };

    // Start performance monitoring
    this.startMonitoring();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set user ID for performance tracking
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Start performance monitoring
   */
  private startMonitoring(): void {
    if (!this.isEnabled) return;

    // Monitor memory usage
    this.startMemoryMonitoring();

    // Monitor network performance
    this.startNetworkMonitoring();

    // Monitor user interactions
    this.startInteractionMonitoring();
  }

  /**
   * Start memory usage monitoring
   */
  private startMemoryMonitoring(): void {
    setInterval(() => {
      if (performance.memory) {
        this.recordMetric({
          metric_type: 'memory_usage',
          metric_name: 'heap_used',
          value: performance.memory.usedJSHeapSize,
          unit: 'bytes',
          timestamp: new Date(),
          metadata: {
            heap_total: performance.memory.totalJSHeapSize,
            heap_limit: performance.memory.jsHeapSizeLimit,
          },
        });
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Start network performance monitoring
   */
  private startNetworkMonitoring(): void {
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this.recordMetric({
          metric_type: 'api_call',
          metric_name: 'fetch_request',
          value: endTime - startTime,
          unit: 'ms',
          timestamp: new Date(),
          metadata: {
            url: args[0]?.toString(),
            status: response.status,
            method: 'GET', // Default, could be extracted from args
          },
        });

        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.recordMetric({
          metric_type: 'api_call',
          metric_name: 'fetch_error',
          value: endTime - startTime,
          unit: 'ms',
          timestamp: new Date(),
          metadata: {
            url: args[0]?.toString(),
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        throw error;
      }
    };
  }

  /**
   * Start user interaction monitoring
   */
  private startInteractionMonitoring(): void {
    // Monitor touch events
    document.addEventListener('touchstart', () => {
      this.recordMetric({
        metric_type: 'user_interaction',
        metric_name: 'touch_start',
        value: 1,
        unit: 'count',
        timestamp: new Date(),
      });
    });

    // Monitor scroll events
    let scrollTimeout: number;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.recordMetric({
          metric_type: 'user_interaction',
          metric_name: 'scroll_end',
          value: 1,
          unit: 'count',
          timestamp: new Date(),
        });
      }, 150);
    });
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, 'session_id' | 'user_id'>): void {
    if (!this.isEnabled) return;

    const fullMetric: PerformanceMetric = {
      ...metric,
      session_id: this.sessionId,
      user_id: this.userId,
    };

    this.metrics.push(fullMetric);

    // Check if metric exceeds thresholds
    this.checkThresholds(fullMetric);

    // Batch upload metrics every 10 items or every 30 seconds
    if (this.metrics.length >= 10) {
      this.uploadMetrics();
    }
  }

  /**
   * Check if metric exceeds performance thresholds
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.getThreshold(metric.metric_name);
    if (threshold && metric.value > threshold) {
      console.warn(`Performance threshold exceeded: ${metric.metric_name} = ${metric.value}${metric.unit} (threshold: ${threshold}${metric.unit})`);
      
      // Record threshold violation
      this.recordMetric({
        metric_type: 'user_interaction',
        metric_name: 'threshold_violation',
        value: 1,
        unit: 'count',
        timestamp: new Date(),
        metadata: {
          violated_metric: metric.metric_name,
          value: metric.value,
          threshold,
        },
      });
    }
  }

  /**
   * Get threshold for a metric
   */
  private getThreshold(metricName: string): number | null {
    switch (metricName) {
      case 'page_load_time':
        return this.thresholds.page_load_time;
      case 'api_response_time':
        return this.thresholds.api_response_time;
      case 'component_render_time':
        return this.thresholds.component_render_time;
      case 'memory_usage':
        return this.thresholds.memory_usage;
      default:
        return null;
    }
  }

  /**
   * Upload metrics to database
   */
  private async uploadMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    try {
      const metricsToUpload = [...this.metrics];
      this.metrics = [];

      const { error } = await supabase
        .from('performance_metrics')
        .insert(metricsToUpload.map(metric => ({
          user_id: metric.user_id,
          session_id: metric.session_id,
          metric_type: metric.metric_type,
          metric_name: metric.metric_name,
          value: metric.value,
          unit: metric.unit,
          timestamp: metric.timestamp.toISOString(),
          metadata: metric.metadata,
        })));

      if (error) {
        console.error('Error uploading performance metrics:', error);
        // Re-add metrics to queue for retry
        this.metrics.unshift(...metricsToUpload);
      }
    } catch (error) {
      console.error('Error uploading performance metrics:', error);
    }
  }

  /**
   * Measure page load time
   */
  measurePageLoad(pageName: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.recordMetric({
          metric_type: 'page_load',
          metric_name: 'page_load_time',
          value: navigation.loadEventEnd - navigation.fetchStart,
          unit: 'ms',
          timestamp: new Date(),
          metadata: {
            page_name: pageName,
            dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            first_paint: this.getFirstPaint(),
          },
        });
      }
    }
  }

  /**
   * Get first paint time
   */
  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  /**
   * Measure component render time
   */
  measureComponentRender(componentName: string, renderTime: number): void {
    this.recordMetric({
      metric_type: 'component_render',
      metric_name: 'component_render_time',
      value: renderTime,
      unit: 'ms',
      timestamp: new Date(),
      metadata: {
        component_name: componentName,
      },
    });
  }

  /**
   * Measure API call performance
   */
  measureAPICall(apiName: string, duration: number, success: boolean): void {
    this.recordMetric({
      metric_type: 'api_call',
      metric_name: 'api_call_duration',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      metadata: {
        api_name: apiName,
        success,
      },
    });
  }

  /**
   * Get performance summary
   */
  async getPerformanceSummary(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('session_id', this.sessionId)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(`Failed to fetch performance metrics: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return { message: 'No performance data available' };
      }

      // Calculate summary statistics
      const summary = {
        session_id: this.sessionId,
        total_metrics: data.length,
        page_loads: data.filter(m => m.metric_type === 'page_load').length,
        api_calls: data.filter(m => m.metric_type === 'api_call').length,
        component_renders: data.filter(m => m.metric_type === 'component_render').length,
        user_interactions: data.filter(m => m.metric_type === 'user_interaction').length,
        threshold_violations: data.filter(m => m.metric_name === 'threshold_violation').length,
        average_page_load_time: this.calculateAverage(data.filter(m => m.metric_name === 'page_load_time')),
        average_api_response_time: this.calculateAverage(data.filter(m => m.metric_name === 'api_call_duration')),
        average_component_render_time: this.calculateAverage(data.filter(m => m.metric_name === 'component_render_time')),
      };

      return summary;
    } catch (error) {
      console.error('Error getting performance summary:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Calculate average value for metrics
   */
  private calculateAverage(metrics: any[]): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return Math.round(sum / metrics.length);
  }

  /**
   * Upload remaining metrics and cleanup
   */
  async cleanup(): Promise<void> {
    await this.uploadMetrics();
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();

// Performance monitoring hooks
export const usePerformanceMonitoring = () => {
  const measureRender = (componentName: string, renderFunction: () => void) => {
    const startTime = performance.now();
    renderFunction();
    const endTime = performance.now();
    
    performanceService.measureComponentRender(componentName, endTime - startTime);
  };

  const measureAPICall = async <T>(apiName: string, apiCall: () => Promise<T>): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      
      performanceService.measureAPICall(apiName, endTime - startTime, true);
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      performanceService.measureAPICall(apiName, endTime - startTime, false);
      throw error;
    }
  };

  return {
    measureRender,
    measureAPICall,
    recordMetric: performanceService.recordMetric.bind(performanceService),
    getPerformanceSummary: performanceService.getPerformanceSummary.bind(performanceService),
  };
};

export default performanceService;
