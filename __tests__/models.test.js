/**
 * Database Models Tests
 * Tests for Mongoose models and schemas
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const MarketData = require('../models/MarketData');
const News = require('../models/News');

describe('Database Models', () => {
  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      const DatabaseService = require('../services/database');
      await DatabaseService.connect();
    }
  }, 30000);

  afterAll(async () => {
    // Clean up test data
    try {
      if (User && User.deleteMany) await User.deleteMany({});
      if (MarketData && MarketData.deleteMany) await MarketData.deleteMany({});
      if (News && News.deleteMany) await News.deleteMany({});
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  }, 30000);

  describe('User Model', () => {
    test('should create a user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    test('should validate required fields', async () => {
      const user = new User({});
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should enforce unique email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('MarketData Model', () => {
    test('should create market data successfully', async () => {
      const marketData = {
        symbol: 'TEST',
        name: 'Test Company',
        sector: 'Technology',
        currentPrice: 100.50,
        previousClose: 99.00,
        change: 1.50,
        changePercentage: 1.52
      };

      const market = new MarketData(marketData);
      const savedMarket = await market.save();

      expect(savedMarket._id).toBeDefined();
      expect(savedMarket.symbol).toBe(marketData.symbol);
      expect(savedMarket.name).toBe(marketData.name);
      expect(savedMarket.currentPrice).toBe(marketData.currentPrice);
    });

    test('should validate required fields', async () => {
      const market = new MarketData({});
      
      await expect(market.save()).rejects.toThrow();
    });
  });

  describe('News Model', () => {
    test('should create news successfully', async () => {
      const newsData = {
        title: 'Test News Article',
        summary: 'This is a test news article',
        source: 'Test Source',
        publishedAt: new Date()
      };

      const news = new News(newsData);
      const savedNews = await news.save();

      expect(savedNews._id).toBeDefined();
      expect(savedNews.title).toBe(newsData.title);
      expect(savedNews.summary).toBe(newsData.summary);
      expect(savedNews.source).toBe(newsData.source);
    });

    test('should validate required fields', async () => {
      const news = new News({});
      
      await expect(news.save()).rejects.toThrow();
    });
  });
});
