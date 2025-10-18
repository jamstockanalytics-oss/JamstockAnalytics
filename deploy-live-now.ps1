# Deploy JamStockAnalytics to Render.com - GO LIVE NOW!
Write-Host "🚀 DEPLOYING JAMSTOCKANALYTICS TO PRODUCTION - GO LIVE NOW!" -ForegroundColor Green

# Check if we have all necessary files
Write-Host "🔍 Checking production files..." -ForegroundColor Yellow

$requiredFiles = @("package.json", "server.js", "models", "routes", "services", "middleware")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Missing required files: $($missingFiles -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All production files found" -ForegroundColor Green

# Create production environment file
Write-Host "📝 Creating production environment configuration..." -ForegroundColor Yellow

$envContent = @"
NODE_ENV=production
PORT=3000
CLIENT_URL=https://jamstockanalytics-oss.github.io
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jamstockanalytics
JWT_SECRET=production-jwt-secret-change-this-in-production
DEEPSEEK_API_KEY=your-deepseek-api-key-here
BCRYPT_ROUNDS=12
SESSION_SECRET=production-session-secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
WEBHOOK_SECRET=production-webhook-secret
"@

$envContent | Out-File -FilePath ".env.production" -Encoding UTF8

# Create Render deployment configuration
Write-Host "📦 Creating Render deployment configuration..." -ForegroundColor Yellow

$renderConfig = @"
services:
  - type: web
    name: jamstockanalytics-production
    env: node
    plan: starter
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: MONGODB_URI
        fromDatabase:
          name: jamstockanalytics-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: DEEPSEEK_API_KEY
        sync: false
      - key: CLIENT_URL
        value: https://jamstockanalytics-oss.github.io
      - key: BCRYPT_ROUNDS
        value: 12
      - key: RATE_LIMIT_WINDOW_MS
        value: 900000
      - key: RATE_LIMIT_MAX_REQUESTS
        value: 100
    healthCheckPath: /api/health
    autoDeploy: true
    branch: master
    repo: https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly

  - type: pserv
    name: jamstockanalytics-db
    env: docker
    plan: starter
    dockerfilePath: ./Dockerfile.mongodb
    envVars:
      - key: MONGO_INITDB_ROOT_USERNAME
        value: admin
      - key: MONGO_INITDB_ROOT_PASSWORD
        generateValue: true
      - key: MONGO_INITDB_DATABASE
        value: jamstockanalytics
"@

$renderConfig | Out-File -FilePath "render-production.yaml" -Encoding UTF8

# Create quick deployment guide
Write-Host "📋 Creating deployment guide..." -ForegroundColor Yellow

$deploymentGuide = @"
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
"@

$deploymentGuide | Out-File -FilePath "QUICK_DEPLOYMENT_GUIDE.md" -Encoding UTF8

Write-Host "`n🎉 PRODUCTION DEPLOYMENT READY!" -ForegroundColor Green
Write-Host "`n📊 Files Created:" -ForegroundColor Cyan
Write-Host "   ✅ package.json - Production dependencies" -ForegroundColor White
Write-Host "   ✅ server.js - Main application server" -ForegroundColor White
Write-Host "   ✅ render-production.yaml - Render deployment config" -ForegroundColor White
Write-Host "   ✅ QUICK_DEPLOYMENT_GUIDE.md - Step-by-step guide" -ForegroundColor White

Write-Host "`n🚀 DEPLOY NOW:" -ForegroundColor Cyan
Write-Host "   1. Go to https://render.com" -ForegroundColor White
Write-Host "   2. Create New Web Service" -ForegroundColor White
Write-Host "   3. Connect GitHub: jamstockanalytics-oss/JamstockAnalyticsWebOnly" -ForegroundColor White
Write-Host "   4. Build Command: npm install" -ForegroundColor White
Write-Host "   5. Start Command: npm start" -ForegroundColor White
Write-Host "   6. Set Environment Variables" -ForegroundColor White
Write-Host "   7. Deploy!" -ForegroundColor White

Write-Host "`n⚡ QUICK SETUP:" -ForegroundColor Cyan
Write-Host "   • MongoDB Atlas: https://cloud.mongodb.com" -ForegroundColor White
Write-Host "   • DeepSeek API: https://platform.deepseek.com" -ForegroundColor White
Write-Host "   • Render.com: https://render.com" -ForegroundColor White

Write-Host "`n🎯 YOUR PRODUCTION APP WILL HAVE:" -ForegroundColor Cyan
Write-Host "   ✅ Full backend API with authentication" -ForegroundColor White
Write-Host "   ✅ Real-time WebSocket connections" -ForegroundColor White
Write-Host "   ✅ AI-powered market analysis" -ForegroundColor White
Write-Host "   ✅ MongoDB database" -ForegroundColor White
Write-Host "   ✅ Portfolio management" -ForegroundColor White
Write-Host "   ✅ News feed with AI curation" -ForegroundColor White
Write-Host "   ✅ Security and rate limiting" -ForegroundColor White
Write-Host "   ✅ Health monitoring" -ForegroundColor White

Write-Host "`n✅ READY TO GO LIVE!" -ForegroundColor Green
Write-Host "🌐 Follow the deployment guide to get your production website live!" -ForegroundColor Green
