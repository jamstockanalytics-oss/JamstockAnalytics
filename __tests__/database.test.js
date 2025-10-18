/**
 * MongoDB Database Tests
 * Tests for database connection and basic operations
 */

const DatabaseService = require('../services/database');
const mongoose = require('mongoose');

describe('Database Service', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await DatabaseService.connect();
    }
  }, 30000);

  afterAll(async () => {
    // Clean up test data and disconnect
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.connection.db.dropDatabase();
        await DatabaseService.disconnect();
      } catch (error) {
        console.warn('Cleanup warning:', error.message);
      }
    }
  }, 30000);

  describe('Connection', () => {
    test('should connect to MongoDB successfully', () => {
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    });

    test('should have correct database name', () => {
      expect(mongoose.connection.db.databaseName).toBe('jamstockanalytics');
    });
  });

  describe('Health Check', () => {
    test('should return healthy status', async () => {
      const health = await DatabaseService.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.state).toBe('connected');
    });

    test('should return database information', async () => {
      const health = await DatabaseService.healthCheck();
      expect(health.database).toBe('jamstockanalytics');
      expect(health.host).toBeDefined();
      expect(health.port).toBeDefined();
    });
  });

  describe('Database Statistics', () => {
    test('should get database stats', async () => {
      const stats = await DatabaseService.getDatabaseStats();
      expect(stats).toBeDefined();
      expect(stats.database).toBe('jamstockanalytics');
      expect(stats.collections).toBeDefined();
      expect(stats.objects).toBeDefined();
    });
  });

  describe('Indexes', () => {
    test('should create indexes successfully', async () => {
      // This test verifies that indexes are created without errors
      await expect(DatabaseService.createIndexes()).resolves.not.toThrow();
    });
  });
});
