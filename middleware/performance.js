// Performance monitoring middleware
const performance = require('perf_hooks').performance;

// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  const startTime = performance.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Log performance metrics
    console.log(`[PERF] ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
    
    // Add performance headers
    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    res.setHeader('X-Performance-Start', startTime.toFixed(2));
    res.setHeader('X-Performance-End', endTime.toFixed(2));
    
    // Call original end
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Cache control middleware
const cacheControl = (maxAge = 3600) => {
  return (req, res, next) => {
    // Set cache headers based on route
    if (req.path.startsWith('/static/') || req.path.startsWith('/assets/')) {
      res.setHeader('Cache-Control', `public, max-age=${maxAge}, immutable`);
    } else if (req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    }
    
    next();
  };
};

// ETag middleware for better caching
const etagMiddleware = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 200 && data) {
      const crypto = require('crypto');
      const etag = crypto.createHash('md5').update(data).digest('hex');
      
      res.setHeader('ETag', `"${etag}"`);
      
      // Check if client has cached version
      if (req.headers['if-none-match'] === `"${etag}"`) {
        res.status(304).end();
        return;
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Request size limiting
const requestSizeLimit = (limit = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = parseInt(limit.replace('mb', '')) * 1024 * 1024;
    
    if (contentLength > maxSize) {
      res.status(413).json({
        error: 'Request entity too large',
        maxSize: limit
      });
      return;
    }
    
    next();
  };
};

// Memory usage monitoring
const memoryMonitor = (req, res, next) => {
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };
  
  // Add memory info to response headers
  res.setHeader('X-Memory-Usage', JSON.stringify(memUsageMB));
  
  // Log high memory usage
  if (memUsageMB.heapUsed > 500) {
    console.warn(`[MEMORY] High memory usage: ${memUsageMB.heapUsed}MB`);
  }
  
  next();
};

// Database query optimization
const queryOptimizer = (req, res, next) => {
  // Add query optimization headers
  res.setHeader('X-Query-Optimization', 'enabled');
  
  // Log slow queries
  const startTime = performance.now();
  
  const originalJson = res.json;
  res.json = function(data) {
    const endTime = performance.now();
    const queryTime = endTime - startTime;
    
    if (queryTime > 1000) {
      console.warn(`[SLOW QUERY] ${req.path} - ${queryTime.toFixed(2)}ms`);
    }
    
    originalJson.call(this, data);
  };
  
  next();
};

module.exports = {
  performanceMiddleware,
  cacheControl,
  etagMiddleware,
  requestSizeLimit,
  memoryMonitor,
  queryOptimizer
};
