# 🗄️ MongoDB Setup Guide for JamStockAnalytics Production

## 🚀 Quick MongoDB Atlas Setup (Recommended for Production)

### Step 1: Create MongoDB Atlas Account
1. **Go to [MongoDB Atlas](https://cloud.mongodb.com)**
2. **Sign up** with your email or Google account
3. **Choose the FREE tier** (M0 Sandbox) - Perfect for development and small production apps

### Step 2: Create Your First Cluster
1. **Click "Build a Database"**
2. **Choose "M0 Sandbox" (FREE)**
3. **Select Cloud Provider:**
   - AWS (Recommended)
   - Google Cloud
   - Azure
4. **Choose Region:** Select closest to your users
5. **Cluster Name:** `jamstockanalytics-cluster`
6. **Click "Create"**

### Step 3: Set Up Database Access
1. **Go to "Database Access" in the left menu**
2. **Click "Add New Database User"**
3. **Authentication Method:** Password
4. **Username:** `jamstockanalytics-user`
5. **Password:** Generate secure password (save it!)
6. **Database User Privileges:** "Read and write to any database"
7. **Click "Add User"**

### Step 4: Configure Network Access
1. **Go to "Network Access" in the left menu**
2. **Click "Add IP Address"**
3. **For Production:** Click "Allow Access from Anywhere" (0.0.0.0/0)
4. **For Development:** Add your current IP address
5. **Click "Confirm"**

### Step 5: Get Your Connection String
1. **Go to "Database" in the left menu**
2. **Click "Connect" on your cluster**
3. **Choose "Connect your application"**
4. **Driver:** Node.js
5. **Version:** 4.1 or later
6. **Copy the connection string**

### Step 6: Update Your Connection String
Replace the connection string with your actual credentials:

```
mongodb+srv://jamstockanalytics-user:YOUR_PASSWORD@jamstockanalytics-cluster.xxxxx.mongodb.net/jamstockanalytics?retryWrites=true&w=majority
```

## 🔧 Configure for Render.com Deployment

### Step 1: Add to Render Environment Variables
1. **Go to your Render.com dashboard**
2. **Select your JamStockAnalytics service**
3. **Go to "Environment" tab**
4. **Add new environment variable:**
   - **Key:** `MONGODB_URI`
   - **Value:** Your MongoDB Atlas connection string

### Step 2: Test Your Connection
Your app will automatically connect to MongoDB when deployed. The connection is tested in the health check endpoint.

## 📊 Database Collections (Auto-Created)

Your application will automatically create these collections:

### 1. **users** Collection
```javascript
{
  _id: ObjectId,
  email: String,
  firstName: String,
  lastName: String,
  profile: {
    avatar: String,
    bio: String,
    investmentExperience: String,
    riskTolerance: String
  },
  portfolio: {
    totalValue: Number,
    holdings: Array
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2. **marketdata** Collection
```javascript
{
  _id: ObjectId,
  symbol: String,
  name: String,
  currentPrice: Number,
  change: Number,
  changePercentage: Number,
  volume: Number,
  sector: String,
  aiAnalysis: {
    recommendation: String,
    confidence: Number,
    sentiment: String
  },
  lastUpdated: Date
}
```

### 3. **news** Collection
```javascript
{
  _id: ObjectId,
  title: String,
  summary: String,
  source: String,
  publishedAt: Date,
  symbols: Array,
  sentiment: String,
  priority: String
}
```

### 4. **portfolios** Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  holdings: Array,
  totalValue: Number,
  totalGain: Number,
  lastUpdated: Date
}
```

## 🔍 Database Indexes (Auto-Created)

Your application automatically creates these indexes for optimal performance:

```javascript
// Users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "createdAt": -1 })

// Market data collection
db.marketdata.createIndex({ "symbol": 1, "lastUpdated": -1 })
db.marketdata.createIndex({ "sector": 1, "changePercentage": -1 })

// News collection
db.news.createIndex({ "publishedAt": -1 })
db.news.createIndex({ "symbols": 1 })
```

## 🚨 Important Security Notes

### 1. **Password Security**
- Use a strong, unique password for your database user
- Store it securely (password manager recommended)
- Never commit passwords to your code repository

### 2. **Network Access**
- For production: Allow access from anywhere (0.0.0.0/0)
- For development: Restrict to your IP address
- Monitor access logs regularly

### 3. **Connection String Security**
- Never share your connection string publicly
- Use environment variables in production
- Rotate passwords regularly

## 🔧 Troubleshooting

### Common Issues:

**1. Connection Timeout**
- Check your network access settings
- Verify your IP address is whitelisted
- Ensure your connection string is correct

**2. Authentication Failed**
- Verify username and password
- Check if user has proper permissions
- Ensure database name is correct

**3. SSL/TLS Issues**
- MongoDB Atlas requires SSL connections
- Your connection string should include SSL parameters
- Check your Node.js version (requires 4.1+)

### Testing Your Connection:

**1. Health Check Endpoint**
```
GET https://your-app.onrender.com/api/health
```

**2. Database Status**
Check your Render logs for database connection status.

## 📈 Monitoring Your Database

### 1. **MongoDB Atlas Dashboard**
- Monitor database performance
- View connection metrics
- Check storage usage
- Monitor query performance

### 2. **Application Logs**
- Check Render.com logs for database errors
- Monitor connection status
- Track query performance

### 3. **Health Checks**
Your application includes automatic health checks for:
- Database connectivity
- Collection access
- Index performance

## 🎯 Production Checklist

- [ ] MongoDB Atlas account created
- [ ] Cluster created and running
- [ ] Database user created with proper permissions
- [ ] Network access configured (0.0.0.0/0 for production)
- [ ] Connection string obtained
- [ ] Environment variable set in Render.com
- [ ] Connection tested via health check endpoint
- [ ] Database collections created automatically
- [ ] Indexes created for performance
- [ ] Monitoring set up

## 🚀 You're Ready!

Once you complete this setup:
1. Your MongoDB database will be live and accessible
2. Your JamStockAnalytics app will automatically connect
3. All collections and indexes will be created
4. Your production app will be fully functional

**Your MongoDB database is now ready for production! 🎉**
