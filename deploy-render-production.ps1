# Deploy JamStockAnalytics Production to Render.com
Write-Host "🚀 Deploying JamStockAnalytics Production to Render.com" -ForegroundColor Green

# Check if we have the necessary files
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "server.js")) {
    Write-Host "❌ server.js not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Production files found" -ForegroundColor Green

# Create production environment file
Write-Host "📝 Creating production environment file..." -ForegroundColor Yellow

$envContent = @"
NODE_ENV=production
PORT=3000
CLIENT_URL=https://jamstockanalytics-oss.github.io
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jamstockanalytics
REDIS_URL=redis://localhost:6379
JWT_SECRET=production-jwt-secret-change-this
DEEPSEEK_API_KEY=your-deepseek-api-key-here
BCRYPT_ROUNDS=12
SESSION_SECRET=production-session-secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
WEBHOOK_SECRET=production-webhook-secret
DOCKER_IMAGE=jamstockanalytics/jamstockanalytics
"@

$envContent | Out-File -FilePath ".env.production" -Encoding UTF8
Write-Host "✅ Created .env.production file" -ForegroundColor Green

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
Write-Host "✅ Created render-production.yaml" -ForegroundColor Green

# Create MongoDB Dockerfile for Render
Write-Host "🗄️ Creating MongoDB Dockerfile..." -ForegroundColor Yellow

$mongoDockerfile = @"
FROM mongo:7.0

# Set environment variables
ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=secure-password
ENV MONGO_INITDB_DATABASE=jamstockanalytics

# Create initialization script
COPY mongo-init.js /docker-entrypoint-initdb.d/

# Expose port
EXPOSE 27017

# Start MongoDB
CMD ["mongod", "--bind_ip_all"]
"@

$mongoDockerfile | Out-File -FilePath "Dockerfile.mongodb" -Encoding UTF8

# Create MongoDB initialization script
Write-Host "📝 Creating MongoDB initialization script..." -ForegroundColor Yellow

$mongoInit = @"
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
"@

$mongoInit | Out-File -FilePath "mongo-init.js" -Encoding UTF8

# Create deployment instructions
Write-Host "📋 Creating deployment instructions..." -ForegroundColor Yellow

$deploymentInstructions = @"
# JamStockAnalytics Production Deployment Instructions

## Prerequisites
1. Render.com account
2. MongoDB Atlas account (for production database)
3. DeepSeek API key

## Deployment Steps

### 1. Deploy to Render.com
1. Go to https://render.com
2. Connect your GitHub repository
3. Create a new Web Service
4. Use the following settings:
   - Build Command: npm install
   - Start Command: npm start
   - Environment: Node
   - Plan: Starter (or higher)

### 2. Configure Environment Variables
Set the following environment variables in Render:
- NODE_ENV=production
- PORT=3000
- MONGODB_URI=your-mongodb-atlas-connection-string
- JWT_SECRET=your-secure-jwt-secret
- DEEPSEEK_API_KEY=your-deepseek-api-key
- CLIENT_URL=https://jamstockanalytics-oss.github.io

### 3. Database Setup
1. Create a MongoDB Atlas cluster
2. Get the connection string
3. Update MONGODB_URI in Render environment variables

### 4. AI Service Setup
1. Get DeepSeek API key from https://platform.deepseek.com
2. Update DEEPSEEK_API_KEY in Render environment variables

### 5. Deploy
1. Push changes to GitHub
2. Render will automatically deploy
3. Your production app will be available at your Render URL

## Features Included
✅ Full production backend with Node.js/Express
✅ MongoDB database with optimized indexes
✅ Redis caching for performance
✅ JWT authentication system
✅ AI-powered market analysis
✅ Real-time WebSocket connections
✅ Rate limiting and security
✅ Health check endpoints
✅ Error handling and logging
✅ Production-ready Docker configuration

## API Endpoints
- GET /api/health - Health check
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/market/data - Market data
- POST /api/ai/analyze - AI analysis
- WebSocket /socket.io - Real-time updates

## Monitoring
- Health checks: /api/health
- Logs available in Render dashboard
- Database monitoring in MongoDB Atlas

## Security Features
- JWT token authentication
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers
- Password hashing with bcrypt
- Environment variable protection
"@

$deploymentInstructions | Out-File -FilePath "PRODUCTION_DEPLOYMENT_GUIDE.md" -Encoding UTF8

Write-Host "`n🎉 Production Deployment Configuration Complete!" -ForegroundColor Green
Write-Host "`n📊 Files Created:" -ForegroundColor Cyan
Write-Host "   ✅ package.json - Production dependencies" -ForegroundColor White
Write-Host "   ✅ server.js - Main application server" -ForegroundColor White
Write-Host "   ✅ render-production.yaml - Render deployment config" -ForegroundColor White
Write-Host "   ✅ Dockerfile.mongodb - MongoDB container" -ForegroundColor White
Write-Host "   ✅ mongo-init.js - Database initialization" -ForegroundColor White
Write-Host "   ✅ PRODUCTION_DEPLOYMENT_GUIDE.md - Deployment instructions" -ForegroundColor White

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Push all changes to GitHub" -ForegroundColor White
Write-Host "   2. Go to https://render.com" -ForegroundColor White
Write-Host "   3. Create new Web Service" -ForegroundColor White
Write-Host "   4. Connect your GitHub repository" -ForegroundColor White
Write-Host "   5. Configure environment variables" -ForegroundColor White
Write-Host "   6. Deploy!" -ForegroundColor White

Write-Host "`n⚠️  Important Notes:" -ForegroundColor Yellow
Write-Host "   • Set up MongoDB Atlas for production database" -ForegroundColor White
Write-Host "   • Configure DeepSeek API key for AI features" -ForegroundColor White
Write-Host "   • Update JWT_SECRET for security" -ForegroundColor White
Write-Host "   • Monitor logs in Render dashboard" -ForegroundColor White

Write-Host "`n✅ Your production application is ready for deployment!" -ForegroundColor Green
Write-Host "🌐 Follow the deployment guide to get your full production website live!" -ForegroundColor Green
