const mongoose = require('mongoose');

class DatabaseService {
  static async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }

      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log('✅ MongoDB connected successfully');
      
      // Create indexes for performance
      await this.createIndexes();
      
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  static async createIndexes() {
    try {
      // User indexes
      await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
      await mongoose.connection.db.collection('users').createIndex({ createdAt: -1 });
      
      // Market data indexes
      await mongoose.connection.db.collection('marketdata').createIndex({ symbol: 1, lastUpdated: -1 });
      await mongoose.connection.db.collection('marketdata').createIndex({ sector: 1, changePercentage: -1 });
      
      // News indexes
      await mongoose.connection.db.collection('news').createIndex({ publishedAt: -1 });
      await mongoose.connection.db.collection('news').createIndex({ symbols: 1 });
      
      console.log('✅ Database indexes created');
    } catch (error) {
      console.error('❌ Index creation failed:', error);
    }
  }

  static async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    } catch (error) {
      console.error('❌ MongoDB disconnect failed:', error);
    }
  }
}

module.exports = DatabaseService;
