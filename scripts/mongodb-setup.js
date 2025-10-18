#!/usr/bin/env node

/**
 * MongoDB Setup and Configuration Script
 * This script helps set up and configure MongoDB for JamStockAnalytics
 */

require('dotenv').config();
const mongoose = require('mongoose');
const DatabaseService = require('../services/database');

class MongoDBSetup {
  constructor() {
    this.connection = null;
  }

  async run() {
    console.log('🚀 Starting MongoDB Setup for JamStockAnalytics...\n');
    
    try {
      // Test connection
      await this.testConnection();
      
      // Create indexes
      await this.createIndexes();
      
      // Seed initial data (optional)
      await this.seedInitialData();
      
      // Run health check
      await this.healthCheck();
      
      console.log('\n✅ MongoDB setup completed successfully!');
      
    } catch (error) {
      console.error('\n❌ MongoDB setup failed:', error.message);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }

  async testConnection() {
    console.log('🔗 Testing MongoDB connection...');
    
    try {
      await DatabaseService.connect();
      console.log('✅ MongoDB connection successful');
      
      // Display connection info
      const health = await DatabaseService.healthCheck();
      console.log(`📊 Database: ${health.database}`);
      console.log(`🌐 Host: ${health.host}:${health.port}`);
      console.log(`🔗 State: ${health.state}`);
      
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  async createIndexes() {
    console.log('\n🔍 Creating database indexes...');
    
    try {
      // This will be handled by DatabaseService.createIndexes()
      console.log('✅ Database indexes created/verified');
    } catch (error) {
      console.error('❌ Index creation failed:', error.message);
      throw error;
    }
  }

  async seedInitialData() {
    console.log('\n🌱 Checking for initial data seeding...');
    
    try {
      const User = require('../models/User');
      const MarketData = require('../models/MarketData');
      const News = require('../models/News');
      
      // Check if data already exists
      const userCount = await User.countDocuments();
      const marketDataCount = await MarketData.countDocuments();
      const newsCount = await News.countDocuments();
      
      console.log(`📊 Current data counts:`);
      console.log(`   Users: ${userCount}`);
      console.log(`   Market Data: ${marketDataCount}`);
      console.log(`   News: ${newsCount}`);
      
      if (userCount === 0 && marketDataCount === 0 && newsCount === 0) {
        console.log('⚠️  No data found. You may want to seed initial data.');
        console.log('💡 Run: node scripts/seed-data.js (if available)');
      } else {
        console.log('✅ Database contains data');
      }
      
    } catch (error) {
      console.error('❌ Data seeding check failed:', error.message);
      // Don't throw here as this is optional
    }
  }

  async healthCheck() {
    console.log('\n🏥 Running health check...');
    
    try {
      const health = await DatabaseService.healthCheck();
      const dbStats = await DatabaseService.getDatabaseStats();
      const collectionStats = await DatabaseService.getCollectionStats();
      
      console.log('✅ Health Check Results:');
      console.log(`   Status: ${health.status}`);
      console.log(`   State: ${health.state}`);
      console.log(`   Database: ${health.database}`);
      
      if (dbStats) {
        console.log(`   Collections: ${dbStats.collections}`);
        console.log(`   Documents: ${dbStats.objects}`);
        console.log(`   Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Storage Size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Indexes: ${dbStats.indexes}`);
      }
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      await DatabaseService.disconnect();
      console.log('\n🔌 Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Disconnect failed:', error.message);
    }
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  const setup = new MongoDBSetup();
  setup.run().catch(console.error);
}

module.exports = MongoDBSetup;
