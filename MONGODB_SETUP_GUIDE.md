# MongoDB Configuration Guide for JamStockAnalytics

This guide will help you set up and configure MongoDB for your JamStockAnalytics application.

## Table of Contents
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [Local MongoDB Setup](#local-mongodb-setup)
- [Database Models](#database-models)
- [Performance Optimization](#performance-optimization)
- [Security Configuration](#security-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Quick Start

1. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB connection string
   ```

2. **Run the setup script:**
   ```bash
   node scripts/mongodb-setup.js
   ```

3. **Start your application:**
   ```bash
   npm start
   ```

## Environment Configuration

### Required Environment Variables

Add these to your `.env` file:

```env
# MongoDB Atlas (Cloud) - Recommended for production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jamstockanalytics?retryWrites=true&w=majority

# Local MongoDB (Development)
# MONGODB_URI=mongodb://localhost:27017/jamstockanalytics

# MongoDB Configuration Options
MONGODB_DB_NAME=jamstockanalytics
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=5
MONGODB_MAX_IDLE_TIME_MS=30000
MONGODB_CONNECT_TIMEOUT_MS=10000
MONGODB_SOCKET_TIMEOUT_MS=45000
MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000
```

### Connection String Format

**MongoDB Atlas (Cloud):**
```
mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
```

**Local MongoDB:**
```
mongodb://localhost:27017/<database>
```

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Sandbox is free)

### 2. Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a user with read/write permissions
4. Save the username and password

### 3. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Add your current IP address or use `0.0.0.0/0` for all IPs (less secure)

### 4. Get Connection String
1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

## Local MongoDB Setup

### Windows
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install MongoDB
3. Start MongoDB service:
   ```cmd
   net start MongoDB
   ```

### macOS (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Database Models

### User Model
- **Collection:** `users`
- **Purpose:** Store user accounts and profiles
- **Key Fields:** email, password, profile, portfolio, watchlist
- **Indexes:** email (unique), createdAt, portfolio holdings

### MarketData Model
- **Collection:** `marketdata`
- **Purpose:** Store stock market data and AI analysis
- **Key Fields:** symbol, currentPrice, change, aiAnalysis
- **Indexes:** symbol+lastUpdated, sector+changePercentage, AI recommendations

### News Model
- **Collection:** `news`
- **Purpose:** Store news articles and sentiment analysis
- **Key Fields:** title, summary, sentiment, symbols, aiAnalysis
- **Indexes:** publishedAt, symbols, sentiment, text search

## Performance Optimization

### Indexes
The application automatically creates optimized indexes for:
- User authentication and queries
- Market data lookups and sorting
- News search and filtering
- AI analysis queries

### Connection Pooling
- **Max Pool Size:** 10 connections (configurable)
- **Min Pool Size:** 5 connections (configurable)
- **Connection Timeout:** 10 seconds
- **Socket Timeout:** 45 seconds

### Query Optimization
- Use compound indexes for complex queries
- Implement pagination for large datasets
- Use projection to limit returned fields
- Enable query profiling in development

## Security Configuration

### Authentication
- Use strong passwords for database users
- Enable MongoDB authentication
- Use environment variables for credentials

### Network Security
- Restrict IP access in production
- Use SSL/TLS for connections
- Enable MongoDB encryption at rest

### Data Validation
- Schema validation in Mongoose models
- Input sanitization in API routes
- Regular security audits

## Monitoring and Maintenance

### Health Checks
```javascript
// Check database health
const health = await DatabaseService.healthCheck();
console.log('Database Status:', health.status);
```

### Database Statistics
```javascript
// Get database stats
const stats = await DatabaseService.getDatabaseStats();
console.log('Collections:', stats.collections);
console.log('Documents:', stats.objects);
```

### Regular Maintenance
1. **Monitor disk usage**
2. **Check index performance**
3. **Review slow queries**
4. **Backup data regularly**
5. **Update MongoDB version**

## Troubleshooting

### Common Issues

**Connection Timeout:**
```
Error: connect ETIMEDOUT
```
- Check network connectivity
- Verify MongoDB server is running
- Check firewall settings

**Authentication Failed:**
```
Error: Authentication failed
```
- Verify username and password
- Check user permissions
- Ensure authSource is correct

**Index Creation Failed:**
```
Error: Index creation failed
```
- Check available disk space
- Verify collection permissions
- Review index specifications

### Debug Mode
Enable MongoDB debug logging:
```javascript
mongoose.set('debug', true);
```

### Connection State Check
```javascript
// Check connection state
const states = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};
console.log('Connection state:', states[mongoose.connection.readyState]);
```

## Production Checklist

- [ ] MongoDB Atlas cluster configured
- [ ] Database user created with proper permissions
- [ ] Network access restricted to application servers
- [ ] SSL/TLS enabled for connections
- [ ] Environment variables secured
- [ ] Connection pooling optimized
- [ ] Indexes created and verified
- [ ] Monitoring and alerting configured
- [ ] Backup strategy implemented
- [ ] Security audit completed

## Support

For additional help:
1. Check MongoDB documentation: https://docs.mongodb.com/
2. Review application logs
3. Run the setup script: `node scripts/mongodb-setup.js`
4. Contact support team

---

**Last Updated:** $(date)
**Version:** 1.0.0
