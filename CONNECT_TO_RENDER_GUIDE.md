# 🚀 Connect JamStockAnalytics to Render.com - Complete Guide

## 🌐 Step 1: Go to Render.com
1. **Visit:** https://render.com
2. **Sign up/Login** with your account
3. **Click "New +"** in the top right
4. **Select "Web Service"**

## 🔗 Step 2: Connect Your GitHub Repository
1. **Click "Connect GitHub"**
2. **Authorize Render** to access your repositories
3. **Search for:** `jamstockanalytics-oss/JamstockAnalyticsWebOnly`
4. **Click "Connect"** on your repository

## ⚙️ Step 3: Configure Your Service
**Service Settings:**
- **Name:** `jamstockanalytics-production`
- **Environment:** `Node`
- **Region:** `Oregon (US West)` (or closest to your users)
- **Branch:** `master`
- **Root Directory:** Leave empty (uses root)
- **Build Command:** `npm install`
- **Start Command:** `npm start`

## 🔐 Step 4: Set Environment Variables
**Click "Advanced" → "Environment Variables"**

**Add these variables:**

### Required Variables:
```
NODE_ENV = production
PORT = 3000
MONGODB_URI = mongodb+srv://jamstockanalytics_db_user:YOUR_PASSWORD@cluster0.2qebwwk.mongodb.net/jamstockanalytics?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET = your-secure-jwt-secret-here
CLIENT_URL = https://jamstockanalytics-oss.github.io
```

### Optional Variables (for full functionality):
```
DEEPSEEK_API_KEY = your-deepseek-api-key-here
BCRYPT_ROUNDS = 12
SESSION_SECRET = your-session-secret
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100
```

## 🚀 Step 5: Deploy Your Application
1. **Click "Create Web Service"**
2. **Wait for deployment** (5-10 minutes)
3. **Your app will be live at:** `https://jamstockanalytics-production.onrender.com`

## 🧪 Step 6: Test Your Deployment
**Health Check:**
- Visit: `https://jamstockanalytics-production.onrender.com/api/health`
- Should return: `{"status":"healthy","timestamp":"..."}`

**API Endpoints:**
- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/market/data` - Market data

## 📊 Step 7: Monitor Your Application
**Render Dashboard:**
- **Logs:** View real-time application logs
- **Metrics:** Monitor CPU, memory, and response times
- **Deployments:** Track deployment history
- **Environment:** Manage environment variables

## 🔧 Step 8: Configure Auto-Deploy
**Automatic Deployments:**
- ✅ **Auto-deploy from master branch** (already enabled)
- ✅ **Deploy on every push** to master
- ✅ **Build and deploy automatically**

## 🎯 What You're Connecting:

### Your GitHub Repository:
- **Repository:** `jamstockanalytics-oss/JamstockAnalyticsWebOnly`
- **Branch:** `master`
- **Files:** All your production code

### Your MongoDB Database:
- **Database:** `jamstockanalytics`
- **Collections:** `users`, `marketdata`, `news`, `portfolios`
- **Connection:** Via `MONGODB_URI` environment variable

### Your Production Application:
- **Backend API:** Node.js/Express server
- **Authentication:** JWT-based user system
- **AI Features:** DeepSeek integration
- **Real-time:** WebSocket connections
- **Database:** MongoDB with optimized indexes

## 🎉 Step 9: Your App is Live!
**Your production URL:** `https://jamstockanalytics-production.onrender.com`

**Features Available:**
- ✅ Full backend API
- ✅ User authentication
- ✅ AI-powered analysis
- ✅ Real-time updates
- ✅ Portfolio management
- ✅ Market data
- ✅ News feed
- ✅ WebSocket connections

## 🔍 Troubleshooting:

### Common Issues:
1. **Build Fails:** Check build logs in Render dashboard
2. **Database Connection:** Verify `MONGODB_URI` is correct
3. **Environment Variables:** Ensure all required variables are set
4. **Port Issues:** Make sure `PORT=3000` is set

### Support Resources:
- **Render Logs:** Check application logs in dashboard
- **MongoDB Atlas:** Verify database connection
- **GitHub:** Check repository for latest code

## ✅ Success Checklist:
- [ ] Render.com account created
- [ ] GitHub repository connected
- [ ] Service configured with correct settings
- [ ] Environment variables set
- [ ] MongoDB connection string added
- [ ] Application deployed successfully
- [ ] Health check endpoint working
- [ ] API endpoints accessible

## 🚀 You're Ready!
Your JamStockAnalytics production application is now connected to Render.com and ready to serve users worldwide!

**Your production website is live at:**
`https://jamstockanalytics-production.onrender.com`
