/**
 * Performance Monitoring Configuration
 * Tracks and reports application performance metrics
 */

export const PerformanceConfig = {
  // Monitoring Settings
  ENABLE_PERFORMANCE_MONITORING: true,
  SAMPLE_RATE: 0.1, // 10% of requests
  
  // Metrics Thresholds
  SLOW_REQUEST_THRESHOLD_MS: 2000,
  MEMORY_WARNING_THRESHOLD_MB: 100,
  BUNDLE_SIZE_WARNING_THRESHOLD_MB: 5,
  
  // Reporting
  METRICS_ENDPOINT: '/api/metrics',
  REPORT_INTERVAL_MS: 60000, // 1 minute
  MAX_METRICS_BUFFER_SIZE: 1000,
  
  // Performance Targets
  TARGET_LOAD_TIME_MS: 3000,
  TARGET_INTERACTIVE_TIME_MS: 5000,
  TARGET_CUMULATIVE_LAYOUT_SHIFT: 0.1,
  
  // Bundle Analysis
  ENABLE_BUNDLE_ANALYSIS: true,
  BUNDLE_ANALYSIS_THRESHOLD_MB: 2
};

export default PerformanceConfig;