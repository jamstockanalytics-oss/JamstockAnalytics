# Deploy JamStockAnalytics Production Application
# This script deploys the full production application with backend services

Write-Host "🚀 Deploying JamStockAnalytics Production Application" -ForegroundColor Green

# Check if Docker is running
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed or not running" -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker and Docker Compose are available" -ForegroundColor Green

# Create production environment file if it doesn't exist
if (-not (Test-Path ".env.production")) {
    Write-Host "📝 Creating production environment file..." -ForegroundColor Yellow
    
    $envContent = @"
# Production Environment Configuration
NODE_ENV=production
PORT=3000
CLIENT_URL=https://jamstockanalytics-oss.github.io

# Database Configuration
MONGODB_URI=mongodb://mongodb:27017/jamstockanalytics
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=production-jwt-secret-change-this-in-production

# AI Service Configuration
DEEPSEEK_API_KEY=your-deepseek-api-key-here

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=production-session-secret-change-this

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Webhook Configuration
WEBHOOK_SECRET=production-webhook-secret
DOCKER_IMAGE=jamstockanalytics/jamstockanalytics

# Monitoring
GRAFANA_PASSWORD=admin123
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure-password
REDIS_PASSWORD=redis-secure-password
"@
    
    $envContent | Out-File -FilePath ".env.production" -Encoding UTF8
    Write-Host "✅ Created .env.production file" -ForegroundColor Green
    Write-Host "⚠️  Please update the environment variables in .env.production" -ForegroundColor Yellow
}

# Build production Docker image
Write-Host "🔨 Building production Docker image..." -ForegroundColor Yellow
docker build -f Dockerfile.production -t jamstockanalytics-production:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Production Docker image built successfully" -ForegroundColor Green

# Create necessary directories
Write-Host "📁 Creating necessary directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "logs" -Force | Out-Null
New-Item -ItemType Directory -Path "nginx" -Force | Out-Null
New-Item -ItemType Directory -Path "monitoring" -Force | Out-Null
New-Item -ItemType Directory -Path "scripts" -Force | Out-Null

# Create nginx configuration
Write-Host "⚙️ Creating nginx configuration..." -ForegroundColor Yellow
$nginxConfig = @"
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade `$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host `$host;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto `$scheme;
            proxy_cache_bypass `$http_upgrade;
        }

        location /socket.io/ {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade `$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host `$host;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto `$scheme;
        }
    }
}
"@

$nginxConfig | Out-File -FilePath "nginx/nginx.conf" -Encoding UTF8

# Create Prometheus configuration
Write-Host "📊 Creating monitoring configuration..." -ForegroundColor Yellow
$prometheusConfig = @"
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'jamstockanalytics'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 5s
"@

$prometheusConfig | Out-File -FilePath "monitoring/prometheus.yml" -Encoding UTF8

# Create MongoDB initialization script
Write-Host "🗄️ Creating database initialization..." -ForegroundColor Yellow
$mongoInit = @"
db = db.getSiblingDB('jamstockanalytics');

// Create collections with indexes
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

$mongoInit | Out-File -FilePath "scripts/mongo-init.js" -Encoding UTF8

# Deploy with Docker Compose
Write-Host "🚀 Deploying production application..." -ForegroundColor Yellow
docker-compose -f docker-compose.production.yml --env-file .env.production up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker Compose deployment failed" -ForegroundColor Red
    exit 1
}

# Wait for services to start
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service health
Write-Host "🔍 Checking service health..." -ForegroundColor Yellow

# Check main application
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

# Check MongoDB
try {
    $mongoResponse = docker exec jamstockanalytics_mongodb_1 mongo --eval "db.runCommand('ping')" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB is healthy" -ForegroundColor Green
    } else {
        Write-Host "⚠️ MongoDB health check failed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ MongoDB health check failed" -ForegroundColor Red
}

# Check Redis
try {
    $redisResponse = docker exec jamstockanalytics_redis_1 redis-cli ping 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Redis is healthy" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Redis health check failed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Redis health check failed" -ForegroundColor Red
}

Write-Host "`n🎉 Production Deployment Complete!" -ForegroundColor Green
Write-Host "`n📊 Service URLs:" -ForegroundColor Cyan
Write-Host "   Main Application: http://localhost:3000" -ForegroundColor White
Write-Host "   API Health: http://localhost:3000/api/health" -ForegroundColor White
Write-Host "   MongoDB: localhost:27017" -ForegroundColor White
Write-Host "   Redis: localhost:6379" -ForegroundColor White
Write-Host "   Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "   Grafana: http://localhost:3001" -ForegroundColor White

Write-Host "`n🔧 Management Commands:" -ForegroundColor Cyan
Write-Host "   View logs: docker-compose -f docker-compose.production.yml logs -f" -ForegroundColor White
Write-Host "   Stop services: docker-compose -f docker-compose.production.yml down" -ForegroundColor White
Write-Host "   Restart app: docker-compose -f docker-compose.production.yml restart app" -ForegroundColor White

Write-Host "`n⚠️  Important Notes:" -ForegroundColor Yellow
Write-Host "   1. Update environment variables in .env.production" -ForegroundColor White
Write-Host "   2. Configure SSL certificates for production" -ForegroundColor White
Write-Host "   3. Set up proper database backups" -ForegroundColor White
Write-Host "   4. Configure monitoring alerts" -ForegroundColor White
Write-Host "   5. Set up CI/CD pipeline for automated deployments" -ForegroundColor White

Write-Host "`n✅ Production application is now running!" -ForegroundColor Green
