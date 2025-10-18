# Sentry Error Handling Guide for JamStockAnalytics

## Overview
This guide shows you how to implement proper error handling with Sentry in your JamStockAnalytics application using the proven pattern.

## The Pattern You Should Use

### Basic Error Capture
```javascript
const Sentry = require("@sentry/node");

try {
  // Your code that might throw an error
  riskyOperation();
} catch (e) {
  Sentry.captureException(e);
}
```

### Enhanced Error Capture with Context
```javascript
try {
  // Your code
  databaseOperation();
} catch (e) {
  Sentry.captureException(e, {
    tags: {
      component: 'database',
      operation: 'user-query',
      severity: 'error'
    },
    extra: {
      timestamp: new Date().toISOString(),
      userId: req.user?.id,
      requestId: req.id
    }
  });
}
```

## Implementation in Your Routes

### Market Data Routes (Already Implemented)
Your `routes/market.js` already has this pattern:
```javascript
} catch (error) {
  console.error('Market data fetch error:', error);
  
  // Send error to Sentry with context
  Sentry.captureException(error, {
    tags: {
      route: 'GET /api/market/data',
      component: 'market-routes'
    },
    extra: {
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent')
    }
  });
  
  res.status(500).json({
    success: false,
    message: 'Failed to fetch market data'
  });
}
```

## Best Practices for Your Application

### 1. Database Operations
```javascript
// In your database service
try {
  const result = await MarketData.find({});
  return result;
} catch (e) {
  Sentry.captureException(e, {
    tags: {
      component: 'database',
      operation: 'market-data-fetch'
    },
    extra: {
      collection: 'MarketData',
      query: JSON.stringify(query)
    }
  });
  throw e; // Re-throw if needed
}
```

### 2. External API Calls
```javascript
// In your external API calls
try {
  const response = await axios.get('https://api.jamstockex.com/data');
  return response.data;
} catch (e) {
  Sentry.captureException(e, {
    tags: {
      component: 'external-api',
      service: 'jamstockex'
    },
    extra: {
      url: 'https://api.jamstockex.com/data',
      statusCode: e.response?.status
    }
  });
  throw e;
}
```

### 3. Redis Operations
```javascript
// In your Redis operations
try {
  const cached = await client.get(cacheKey);
  return JSON.parse(cached);
} catch (e) {
  Sentry.captureException(e, {
    tags: {
      component: 'redis',
      operation: 'cache-get'
    },
    extra: {
      cacheKey,
      redisError: e.message
    }
  });
  // Continue without cache
  return null;
}
```

### 4. Authentication Errors
```javascript
// In your auth middleware
try {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
} catch (e) {
  Sentry.captureException(e, {
    tags: {
      component: 'authentication',
      operation: 'token-verification'
    },
    extra: {
      hasToken: !!token,
      tokenLength: token?.length
    }
  });
  res.status(401).json({ error: 'Invalid token' });
}
```

## Error Categories for Your App

### Database Errors
- **Tags**: `component: 'database'`, `operation: 'query'`
- **Extra**: Collection name, query details

### API Errors
- **Tags**: `component: 'api'`, `endpoint: '/api/market'`
- **Extra**: Request method, user agent, request ID

### Cache Errors
- **Tags**: `component: 'redis'`, `operation: 'cache'`
- **Extra**: Cache key, TTL, error type

### Authentication Errors
- **Tags**: `component: 'auth'`, `operation: 'login'`
- **Extra**: User ID, IP address, attempt count

## Production Error Handling

### Global Error Handler
Your server already has this in `server.js`:
```javascript
// Error handling middleware
app.use(errorHandler);

// Sentry error handler removed - using instrument.js approach
```

### Unhandled Promise Rejections
Sentry automatically captures these with your current setup.

### Uncaught Exceptions
Sentry automatically captures these with your current setup.

## Monitoring Your Errors

### In Sentry Dashboard
1. **Issues Tab** - See all captured errors
2. **Performance Tab** - See request traces with errors
3. **Releases Tab** - Track errors by deployment

### Error Alerts
Set up alerts for:
- **New errors** - Get notified immediately
- **Error rate spikes** - Monitor error frequency
- **Critical errors** - Database connection failures

## Testing Your Error Handling

### Local Testing
```javascript
// Test error capture
try {
  throw new Error('Test error for Sentry');
} catch (e) {
  Sentry.captureException(e);
}
```

### Production Testing
- Monitor your Sentry dashboard
- Check error grouping
- Verify context data
- Test error alerts

## Benefits for Your Application

### Better Debugging
- **Exact error location** with source maps
- **User context** for each error
- **Request context** for API errors
- **Database context** for query errors

### Performance Monitoring
- **Error rates** by endpoint
- **Response times** with error correlation
- **Database performance** with error tracking
- **Cache performance** with error monitoring

### User Experience
- **Proactive error detection**
- **Faster error resolution**
- **Better error messages**
- **Improved reliability**

## Next Steps

1. **Review existing error handling** in your routes
2. **Add error handling** to new features
3. **Set up error alerts** in Sentry
4. **Monitor error trends** in production
5. **Improve error messages** based on Sentry data

Your JamStockAnalytics application now has comprehensive error monitoring and debugging capabilities!
