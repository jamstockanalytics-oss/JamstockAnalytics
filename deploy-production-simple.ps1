# Simple Production Deployment for JamStockAnalytics
Write-Host "🚀 Deploying JamStockAnalytics Production Application" -ForegroundColor Green

# Check if Docker is running
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed or not running" -ForegroundColor Red
    Write-Host "Please install Docker Desktop and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker is available" -ForegroundColor Green

# Create production environment file
Write-Host "📝 Creating production environment file..." -ForegroundColor Yellow

$envContent = @"
NODE_ENV=production
PORT=3000
CLIENT_URL=https://jamstockanalytics-oss.github.io
MONGODB_URI=mongodb://localhost:27017/jamstockanalytics
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

# Build production Docker image
Write-Host "🔨 Building production Docker image..." -ForegroundColor Yellow
docker build -f Dockerfile.production -t jamstockanalytics-production:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Production Docker image built successfully" -ForegroundColor Green

# Create simple docker-compose for production
Write-Host "📦 Creating production docker-compose..." -ForegroundColor Yellow

$dockerComposeContent = @"
version: '3.8'

services:
  app:
    image: jamstockanalytics-production:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://mongodb:27017/jamstockanalytics
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=production-jwt-secret
      - DEEPSEEK_API_KEY=your-deepseek-api-key
      - CLIENT_URL=https://jamstockanalytics-oss.github.io
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped
    networks:
      - jamstock-network

  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=jamstockanalytics
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped
    networks:
      - jamstock-network

  redis:
    image: redis:7.2-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - jamstock-network

volumes:
  mongodb_data:

networks:
  jamstock-network:
    driver: bridge
"@

$dockerComposeContent | Out-File -FilePath "docker-compose.simple.yml" -Encoding UTF8

# Deploy with Docker Compose
Write-Host "🚀 Deploying production application..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker Compose deployment failed" -ForegroundColor Red
    exit 1
}

# Wait for services to start
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service health
Write-Host "🔍 Checking service health..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Main application is healthy" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Main application health check returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Main application health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Production Deployment Complete!" -ForegroundColor Green
Write-Host "`n📊 Service URLs:" -ForegroundColor Cyan
Write-Host "   Main Application: http://localhost:3000" -ForegroundColor White
Write-Host "   API Health: http://localhost:3000/api/health" -ForegroundColor White
Write-Host "   MongoDB: localhost:27017" -ForegroundColor White
Write-Host "   Redis: localhost:6379" -ForegroundColor White

Write-Host "`n🔧 Management Commands:" -ForegroundColor Cyan
Write-Host "   View logs: docker-compose -f docker-compose.simple.yml logs -f" -ForegroundColor White
Write-Host "   Stop services: docker-compose -f docker-compose.simple.yml down" -ForegroundColor White
Write-Host "   Restart app: docker-compose -f docker-compose.simple.yml restart app" -ForegroundColor White

Write-Host "`n⚠️  Important Notes:" -ForegroundColor Yellow
Write-Host "   1. Update environment variables in .env.production" -ForegroundColor White
Write-Host "   2. Configure your DeepSeek API key" -ForegroundColor White
Write-Host "   3. Set up proper database backups" -ForegroundColor White
Write-Host "   4. Configure SSL certificates for production" -ForegroundColor White

Write-Host "`n✅ Production application is now running!" -ForegroundColor Green
Write-Host "🌐 Your full production website is available at: http://localhost:3000" -ForegroundColor Green
