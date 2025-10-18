const express = require('express');
const MarketData = require('../models/MarketData');
const MarketDataService = require('../services/marketData');
const authMiddleware = require('../middleware/auth');
const redis = require('redis');
const Sentry = require('@sentry/node');

// Redis client setup
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
});

// Handle Redis connection errors
client.on('error', (err) => {
  console.warn('Redis connection error:', err.message);
  console.warn('Continuing without Redis caching...');
});

client.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

// Connect to Redis
client.connect().catch(err => {
  console.warn('Redis connection failed:', err.message);
});

const router = express.Router();

// Cache TTL Settings
const CACHE_TTL = {
  MARKET_DATA: 300,        // 5 minutes
  TOP_PERFORMERS: 600,     // 10 minutes  
  AI_RECOMMENDATIONS: 1800, // 30 minutes
  SYMBOL_DATA: 300        // 5 minutes
};

// Cache management functions
const clearCache = async (pattern = '*') => {
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`🗑️ Cleared ${keys.length} cache entries matching pattern: ${pattern}`);
    }
  } catch (error) {
    console.warn('Cache clear error:', error.message);
  }
};

const getCacheStats = async () => {
  try {
    const info = await client.info('memory');
    const keys = await client.keys('market-data:*');
    return {
      totalKeys: keys.length,
      memoryInfo: info,
      ttlSettings: CACHE_TTL
    };
  } catch (error) {
    console.warn('Cache stats error:', error.message);
    return { 
      totalKeys: 0, 
      memoryInfo: 'N/A',
      ttlSettings: CACHE_TTL
    };
  }
};

// Get cache TTL settings
const getCacheTTLSettings = () => {
  return CACHE_TTL;
};

// Get all market data with Redis caching
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'market-data:all';
    const cacheTTL = CACHE_TTL.MARKET_DATA;
    
    // Try to get from cache first
    let marketData;
    try {
      const cached = await client.get(cacheKey);
      if (cached) {
        console.log('📦 Serving market data from cache');
        return res.json(JSON.parse(cached));
      }
    } catch (redisError) {
      console.warn('Redis get error:', redisError.message);
    }
    
    // Fetch from database if not in cache
    console.log('🔄 Fetching market data from database');
    marketData = await MarketDataService.fetchLatestData();
    
    // Cache the result
    try {
      await client.setEx(cacheKey, cacheTTL, JSON.stringify(marketData));
      console.log('💾 Market data cached successfully');
    } catch (redisError) {
      console.warn('Redis set error:', redisError.message);
    }
    
    res.json(marketData);
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
});

// Get top performers with Redis caching
router.get('/top-performers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const cacheKey = `market-data:top-performers:${limit}`;
    const cacheTTL = CACHE_TTL.TOP_PERFORMERS;
    
    // Try to get from cache first
    let performers;
    try {
      const cached = await client.get(cacheKey);
      if (cached) {
        console.log('📦 Serving top performers from cache');
        return res.json(JSON.parse(cached));
      }
    } catch (redisError) {
      console.warn('Redis get error:', redisError.message);
    }
    
    // Fetch from database if not in cache
    console.log('🔄 Fetching top performers from database');
    performers = await MarketDataService.getTopPerformers(limit);
    
    // Cache the result
    try {
      await client.setEx(cacheKey, cacheTTL, JSON.stringify(performers));
      console.log('💾 Top performers cached successfully');
    } catch (redisError) {
      console.warn('Redis set error:', redisError.message);
    }
    
    res.json(performers);
  } catch (error) {
    console.error('Top performers fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top performers'
    });
  }
});

// Get AI recommendations with Redis caching
router.get('/ai-recommendations', async (req, res) => {
  try {
    const cacheKey = 'market-data:ai-recommendations';
    const cacheTTL = CACHE_TTL.AI_RECOMMENDATIONS;
    
    // Try to get from cache first
    let recommendations;
    try {
      const cached = await client.get(cacheKey);
      if (cached) {
        console.log('📦 Serving AI recommendations from cache');
        return res.json(JSON.parse(cached));
      }
    } catch (redisError) {
      console.warn('Redis get error:', redisError.message);
    }
    
    // Fetch from database if not in cache
    console.log('🔄 Fetching AI recommendations from database');
    recommendations = await MarketDataService.getAIRecommendations();
    
    // Cache the result
    try {
      await client.setEx(cacheKey, cacheTTL, JSON.stringify(recommendations));
      console.log('💾 AI recommendations cached successfully');
    } catch (redisError) {
      console.warn('Redis set error:', redisError.message);
    }
    
    res.json(recommendations);
  } catch (error) {
    console.error('AI recommendations fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI recommendations'
    });
  }
});

// Get market data by symbol with Redis caching
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const symbolUpper = symbol.toUpperCase();
    const cacheKey = `market-data:symbol:${symbolUpper}`;
    const cacheTTL = CACHE_TTL.SYMBOL_DATA;
    
    // Try to get from cache first
    let marketData;
    try {
      const cached = await client.get(cacheKey);
      if (cached) {
        console.log(`📦 Serving ${symbolUpper} data from cache`);
        return res.json(JSON.parse(cached));
      }
    } catch (redisError) {
      console.warn('Redis get error:', redisError.message);
    }
    
    // Fetch from database if not in cache
    console.log(`🔄 Fetching ${symbolUpper} data from database`);
    marketData = await MarketData.findOne({ 
      symbol: symbolUpper,
      isActive: true 
    });
    
    if (!marketData) {
      return res.status(404).json({
        success: false,
        message: 'Market data not found for symbol'
      });
    }
    
    const response = {
      success: true,
      data: marketData
    };
    
    // Cache the result
    try {
      await client.setEx(cacheKey, cacheTTL, JSON.stringify(response));
      console.log(`💾 ${symbolUpper} data cached successfully`);
    } catch (redisError) {
      console.warn('Redis set error:', redisError.message);
    }
    
    res.json(response);
  } catch (error) {
    console.error('Market data by symbol error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market data for symbol'
    });
  }
});

// Cache management endpoints
router.post('/cache/clear', async (req, res) => {
  try {
    const { pattern } = req.body;
    await clearCache(pattern || 'market-data:*');
    res.json({
      success: true,
      message: 'Cache cleared successfully',
      pattern: pattern || 'market-data:*'
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
});

router.get('/cache/stats', async (req, res) => {
  try {
    const stats = await getCacheStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache stats'
    });
  }
});

router.get('/cache/ttl', async (req, res) => {
  try {
    const ttlSettings = getCacheTTLSettings();
    res.json({
      success: true,
      ttlSettings,
      description: {
        MARKET_DATA: 'All market data cache (5 minutes)',
        TOP_PERFORMERS: 'Top performers cache (10 minutes)',
        AI_RECOMMENDATIONS: 'AI recommendations cache (30 minutes)',
        SYMBOL_DATA: 'Individual symbol data cache (5 minutes)'
      }
    });
  } catch (error) {
    console.error('Cache TTL settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache TTL settings'
    });
  }
});

module.exports = router;
