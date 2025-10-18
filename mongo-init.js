db = db.getSiblingDB('jamstockanalytics');

// Create collections
db.createCollection('users');
db.createCollection('marketdata');
db.createCollection('news');
db.createCollection('portfolios');

// Create indexes for performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });
db.marketdata.createIndex({ "symbol": 1, "lastUpdated": -1 });
db.marketdata.createIndex({ "sector": 1, "changePercentage": -1 });
db.news.createIndex({ "publishedAt": -1 });
db.news.createIndex({ "symbols": 1 });

print('Database initialized successfully');
