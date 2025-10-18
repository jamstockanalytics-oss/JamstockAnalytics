#!/usr/bin/env node

// Performance monitoring script for JamStockAnalytics
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      startTime: performance.now(),
      memory: [],
      cpu: [],
      requests: [],
      errors: []
    };
    
    this.startMonitoring();
  }
  
  startMonitoring() {
    // Monitor memory usage every 30 seconds
    setInterval(() => {
      const memUsage = process.memoryUsage();
      this.metrics.memory.push({
        timestamp: Date.now(),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      });
    }, 30000);
    
    // Monitor CPU usage
    setInterval(() => {
      const cpuUsage = process.cpuUsage();
      this.metrics.cpu.push({
        timestamp: Date.now(),
        user: cpuUsage.user,
        system: cpuUsage.system
      });
    }, 10000);
    
    // Log performance summary every 5 minutes
    setInterval(() => {
      this.logPerformanceSummary();
    }, 300000);
  }
  
  recordRequest(method, path, duration, statusCode) {
    this.metrics.requests.push({
      timestamp: Date.now(),
      method,
      path,
      duration,
      statusCode
    });
    
    // Keep only last 1000 requests
    if (this.metrics.requests.length > 1000) {
      this.metrics.requests = this.metrics.requests.slice(-1000);
    }
  }
  
  recordError(error, context) {
    this.metrics.errors.push({
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack,
      context
    });
    
    // Keep only last 100 errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }
  }
  
  logPerformanceSummary() {
    const now = performance.now();
    const uptime = now - this.metrics.startTime;
    
    const recentRequests = this.metrics.requests.filter(
      req => now - req.timestamp < 300000 // Last 5 minutes
    );
    
    const avgResponseTime = recentRequests.length > 0 
      ? recentRequests.reduce((sum, req) => sum + req.duration, 0) / recentRequests.length
      : 0;
    
    const errorRate = recentRequests.length > 0
      ? recentRequests.filter(req => req.statusCode >= 400).length / recentRequests.length
      : 0;
    
    const currentMemory = this.metrics.memory[this.metrics.memory.length - 1];
    
    console.log('\n=== Performance Summary ===');
    console.log(`Uptime: ${Math.round(uptime / 1000)}s`);
    console.log(`Memory Usage: ${currentMemory ? currentMemory.heapUsed + 'MB' : 'N/A'}`);
    console.log(`Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Error Rate: ${(errorRate * 100).toFixed(2)}%`);
    console.log(`Total Requests: ${recentRequests.length}`);
    console.log('===========================\n');
  }
  
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      uptime: performance.now() - this.metrics.startTime,
      summary: this.getSummary(),
      metrics: this.metrics
    };
    
    const reportPath = path.join(__dirname, '..', 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`Performance report generated: ${reportPath}`);
    return report;
  }
  
  getSummary() {
    const recentRequests = this.metrics.requests.filter(
      req => Date.now() - req.timestamp < 300000 // Last 5 minutes
    );
    
    const avgResponseTime = recentRequests.length > 0 
      ? recentRequests.reduce((sum, req) => sum + req.duration, 0) / recentRequests.length
      : 0;
    
    const errorRate = recentRequests.length > 0
      ? recentRequests.filter(req => req.statusCode >= 400).length / recentRequests.length
      : 0;
    
    const currentMemory = this.metrics.memory[this.metrics.memory.length - 1];
    
    return {
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      errorRate: Math.round(errorRate * 10000) / 100,
      totalRequests: recentRequests.length,
      memoryUsage: currentMemory ? currentMemory.heapUsed : 0,
      uptime: Math.round((performance.now() - this.metrics.startTime) / 1000)
    };
  }
  
  // Performance budget checks
  checkPerformanceBudget() {
    const summary = this.getSummary();
    const issues = [];
    
    if (summary.avgResponseTime > 200) {
      issues.push(`High response time: ${summary.avgResponseTime}ms (budget: 200ms)`);
    }
    
    if (summary.errorRate > 5) {
      issues.push(`High error rate: ${summary.errorRate}% (budget: 5%)`);
    }
    
    if (summary.memoryUsage > 500) {
      issues.push(`High memory usage: ${summary.memoryUsage}MB (budget: 500MB)`);
    }
    
    if (issues.length > 0) {
      console.warn('\n⚠️  Performance Budget Exceeded:');
      issues.forEach(issue => console.warn(`  - ${issue}`));
      console.warn('');
    }
    
    return issues;
  }
}

// Export singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;
