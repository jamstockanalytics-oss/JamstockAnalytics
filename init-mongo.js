// Initialize database and collections for JamStockAnalytics
db = db.getSiblingDB('jamstockanalytics');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        },
        password: {
          bsonType: 'string',
          minLength: 6
        },
        name: {
          bsonType: 'string'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('marketdata', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['symbol', 'price', 'timestamp'],
      properties: {
        symbol: {
          bsonType: 'string'
        },
        price: {
          bsonType: 'number'
        },
        change: {
          bsonType: 'number'
        },
        volume: {
          bsonType: 'number'
        },
        timestamp: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('news', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'content', 'timestamp'],
      properties: {
        title: {
          bsonType: 'string'
        },
        content: {
          bsonType: 'string'
        },
        source: {
          bsonType: 'string'
        },
        url: {
          bsonType: 'string'
        },
        symbols: {
          bsonType: 'array'
        },
        sentiment: {
          bsonType: 'object'
        },
        timestamp: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.marketdata.createIndex({ symbol: 1, timestamp: -1 });
db.news.createIndex({ timestamp: -1 });
db.news.createIndex({ symbols: 1 });
db.news.createIndex({ source: 1 });

print('✅ JamStockAnalytics database initialized successfully');
