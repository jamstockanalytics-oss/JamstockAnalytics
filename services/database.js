const mongoose = require('mongoose');

class DatabaseService {
  static async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }

      // Enhanced MongoDB connection options
      const options = {
        maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
        minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 5,
        maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS) || 30000,
        connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS) || 10000,
        socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS) || 45000,
        serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 5000,
        retryWrites: true,
        retryReads: true,
        // Enable SSL/TLS for production
        ssl: process.env.NODE_ENV === 'production',
        // Authentication
        authSource: 'admin',
        // Write concern for data safety
        w: 'majority',
        journal: true, // Journal enabled for durability
        // Buffer commands if connection is down
        bufferCommands: false,
      };

      // Connect to MongoDB
      await mongoose.connect(mongoUri, options);

      // Set up connection event handlers
      this.setupConnectionHandlers();

      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
      console.log(`🔗 Connection state: ${mongoose.connection.readyState}`);
      
      // Create indexes for performance
      await this.createIndexes();
      
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  static setupConnectionHandlers() {
    // Connection successful
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected');
    });

    // Connection error
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    // Connection disconnected
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Connection reconnected
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });
  }

  static async createIndexes() {
    try {
      console.log('🔍 Creating database indexes...');
      
      // User indexes
      await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
      await mongoose.connection.db.collection('users').createIndex({ createdAt: -1 });
      await mongoose.connection.db.collection('users').createIndex({ 'portfolio.holdings.symbol': 1 });
      await mongoose.connection.db.collection('users').createIndex({ 'watchlist.symbol': 1 });
      await mongoose.connection.db.collection('users').createIndex({ isActive: 1 });
      
      // Market data indexes
      await mongoose.connection.db.collection('marketdata').createIndex({ symbol: 1, lastUpdated: -1 });
      await mongoose.connection.db.collection('marketdata').createIndex({ sector: 1, changePercentage: -1 });
      await mongoose.connection.db.collection('marketdata').createIndex({ 'aiAnalysis.recommendation': 1, 'aiAnalysis.confidence': -1 });
      await mongoose.connection.db.collection('marketdata').createIndex({ lastUpdated: -1 });
      await mongoose.connection.db.collection('marketdata').createIndex({ isActive: 1 });
      await mongoose.connection.db.collection('marketdata').createIndex({ currentPrice: 1 });
      await mongoose.connection.db.collection('marketdata').createIndex({ marketCap: -1 });
      
      // News indexes
      await mongoose.connection.db.collection('news').createIndex({ publishedAt: -1, isActive: 1 });
      await mongoose.connection.db.collection('news').createIndex({ symbols: 1, publishedAt: -1 });
      await mongoose.connection.db.collection('news').createIndex({ sentiment: 1, publishedAt: -1 });
      await mongoose.connection.db.collection('news').createIndex({ category: 1, publishedAt: -1 });
      await mongoose.connection.db.collection('news').createIndex({ 'aiAnalysis.relevanceScore': -1, publishedAt: -1 });
      await mongoose.connection.db.collection('news').createIndex({ source: 1 });
      await mongoose.connection.db.collection('news').createIndex({ impact: 1 });
      
      // Text indexes for search functionality
      await mongoose.connection.db.collection('news').createIndex({ 
        title: 'text', 
        summary: 'text', 
        content: 'text' 
      }, { 
        weights: { title: 10, summary: 5, content: 1 },
        name: 'news_text_search'
      });
      
      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('❌ Index creation failed:', error);
    }
  }

  static async getDatabaseStats() {
    try {
      const stats = await mongoose.connection.db.stats();
      return {
        database: stats.db,
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize
      };
    } catch (error) {
      console.error('❌ Failed to get database stats:', error);
      return null;
    }
  }

  static async getCollectionStats() {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const stats = {};
      
      for (const collection of collections) {
        const collectionStats = await mongoose.connection.db.collection(collection.name).stats();
        stats[collection.name] = {
          count: collectionStats.count,
          size: collectionStats.size,
          avgObjSize: collectionStats.avgObjSize,
          storageSize: collectionStats.storageSize,
          totalIndexSize: collectionStats.totalIndexSize
        };
      }
      
      return stats;
    } catch (error) {
      console.error('❌ Failed to get collection stats:', error);
      return null;
    }
  }

  static async healthCheck() {
    try {
      const state = mongoose.connection.readyState;
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      return {
        status: state === 1 ? 'healthy' : 'unhealthy',
        state: states[state] || 'unknown',
        database: mongoose.connection.db?.databaseName || 'unknown',
        host: mongoose.connection.host || 'unknown',
        port: mongoose.connection.port || 'unknown'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  static async disconnect() {
    try {
      await mongoose.disconnect();
      // MongoDB disconnected
    } catch (error) {
      console.error('❌ MongoDB disconnect failed:', error);
    }
  }
}

module.exports = DatabaseService;
