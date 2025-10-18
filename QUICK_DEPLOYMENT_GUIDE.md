# 🚀 QUICK DEPLOYMENT GUIDE - GO LIVE NOW!

## Step 1: Deploy to Render.com
1. Go to https://render.com
2. Sign up/Login
3. Click "New +" → "Web Service"
4. Connect GitHub repository: jamstockanalytics-oss/JamstockAnalyticsWebOnly
5. Configure:
   - Build Command: npm install
   - Start Command: npm start
   - Environment: Node
   - Plan: Starter

## Step 2: Set Environment Variables
In Render dashboard, add these environment variables:
- NODE_ENV=production
- PORT=3000
- MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jamstockanalytics
- JWT_SECRET=your-secure-jwt-secret
- DEEPSEEK_API_KEY=your-deepseek-api-key
- CLIENT_URL=https://jamstockanalytics-oss.github.io

## Step 3: Deploy!
Click "Deploy" and wait for deployment to complete.

## Your Production App Will Be Live At:
https://your-app-name.onrender.com

## Features Available:
✅ Full backend API
✅ User authentication
✅ AI-powered analysis
✅ Real-time updates
✅ Portfolio management
✅ Market data
✅ News feed
✅ WebSocket connections

## API Endpoints:
- GET /api/health - Health check
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/market/data - Market data
- POST /api/ai/analyze - AI analysis
- WebSocket /socket.io - Real-time updates

## Database Setup:
1. Create MongoDB Atlas cluster
2. Get connection string
3. Update MONGODB_URI in Render

## AI Service Setup:
1. Get DeepSeek API key
2. Update DEEPSEEK_API_KEY in Render

## Your app is ready to go live! 🎉
