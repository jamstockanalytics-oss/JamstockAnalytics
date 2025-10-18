// Advanced caching service for performance optimization
const redis = require('redis');
const NodeCache = require('node-cache');

class CacheService {
  constructor() {
    this.redisClient = null;
    this.memoryCache = new NodeCache({
      stdTTL: 600, // 10 minutes default TTL
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false // Better performance
    });
    
    this.initializeRedis();
  }
  
  async initializeRedis() {
    try {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.warn('Redis connection refused, using memory cache only');
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });
      
      this.redisClient.on('error', (err) => {
        console.warn('Redis Client Error:', err);
        this.redisClient = null;
      });
      
      this.redisClient.on('connect', () => {
        console.log('Redis connected successfully');
      });
      
      await this.redisClient.connect();
    } catch (error) {
      console.warn('Redis initialization failed, using memory cache only:', error.message);
      this.redisClient = null;
    }
  }
  
  // Get value from cache (Redis first, then memory)
  async get(key) {
    try {
      // Try Redis first
      if (this.redisClient) {
        const value = await this.redisClient.get(key);
        if (value) {
          return JSON.parse(value);
        }
      }
      
      // Fallback to memory cache
      return this.memoryCache.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  // Set value in cache (both Redis and memory)
  async set(key, value, ttl = 600) {
    try {
      const serializedValue = JSON.stringify(value);
      
      // Set in Redis
      if (this.redisClient) {
        await this.redisClient.setEx(key, ttl, serializedValue);
      }
      
      // Set in memory cache
      this.memoryCache.set(key, value, ttl);
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }
  
  // Delete value from cache
  async del(key) {
    try {
      // Delete from Redis
      if (this.redisClient) {
        await this.redisClient.del(key);
      }
      
      // Delete from memory cache
      this.memoryCache.del(key);
      
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }
  
  // Clear all cache
  async clear() {
    try {
      // Clear Redis
      if (this.redisClient) {
        await this.redisClient.flushAll();
      }
      
      // Clear memory cache
      this.memoryCache.flushAll();
      
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }
  
  // Get cache statistics
  getStats() {
    const memoryStats = this.memoryCache.getStats();
    return {
      memory: {
        keys: memoryStats.keys,
        hits: memoryStats.hits,
        misses: memoryStats.misses,
        hitRate: memoryStats.hits / (memoryStats.hits + memoryStats.misses) || 0
      },
      redis: this.redisClient ? 'connected' : 'disconnected'
    };
  }
  
  // Cache middleware for Express routes
  cacheMiddleware(ttl = 600) {
    return async (req, res, next) => {
      const cacheKey = `cache:${req.method}:${req.originalUrl}`;
      
      try {
        // Try to get from cache
        const cachedData = await this.get(cacheKey);
        
        if (cachedData) {
          res.setHeader('X-Cache', 'HIT');
          res.setHeader('X-Cache-Key', cacheKey);
          return res.json(cachedData);
        }
        
        // Override res.json to cache the response
        const originalJson = res.json;
        res.json = function(data) {
          // Cache the response
          this.set(cacheKey, data, ttl);
          
          res.setHeader('X-Cache', 'MISS');
          res.setHeader('X-Cache-Key', cacheKey);
          originalJson.call(this, data);
        }.bind(this);
        
        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }
  
  // Invalidate cache by pattern
  async invalidatePattern(pattern) {
    try {
      if (this.redisClient) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      }
      
      // Clear memory cache keys matching pattern
      const memoryKeys = this.memoryCache.keys();
      const matchingKeys = memoryKeys.filter(key => key.includes(pattern.replace('*', '')));
      matchingKeys.forEach(key => this.memoryCache.del(key));
      
      return true;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return false;
    }
  }
  
  // Health check
  async healthCheck() {
    try {
      const testKey = 'health-check';
      const testValue = { timestamp: Date.now() };
      
      await this.set(testKey, testValue, 10);
      const retrieved = await this.get(testKey);
      await this.del(testKey);
      
      return retrieved && retrieved.timestamp === testValue.timestamp;
    } catch (error) {
      console.error('Cache health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
