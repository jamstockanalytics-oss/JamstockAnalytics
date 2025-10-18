# Production Webhook Deployment Script for JamStockAnalytics
# This script deploys the webhook handler to your production server

param(
    [string]$WebhookSecret = "your-secure-production-secret-change-this",
    [string]$DockerHubUsername = "jamstockanalytics",
    [string]$DockerHubRepository = "jamstockanalytics",
    [string]$ProductionIP = "66.234.84.10"
)

Write-Host "🚀 Deploying Production Webhook Handler to $ProductionIP" -ForegroundColor Green

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Create production environment file
Write-Host "Creating production environment configuration..." -ForegroundColor Yellow
$envContent = @"
# Production Webhook Configuration
WEBHOOK_SECRET=$WebhookSecret
DOCKER_HUB_USERNAME=$DockerHubUsername
DOCKER_HUB_REPOSITORY=$DockerHubRepository

# Deployment Configuration
DOCKER_IMAGE=$DockerHubUsername/$DockerHubRepository
CONTAINER_NAME=jamstockanalytics-web
COMPOSE_FILE=docker-compose.prod.yml

# Production Server Configuration
PRODUCTION_SERVER_IP=$ProductionIP
PRODUCTION_WEBHOOK_URL=http://$ProductionIP:3000/webhook
PRODUCTION_HEALTH_URL=http://$ProductionIP:3000/health

# Webhook Handler Configuration
WEBHOOK_PORT=3000
NODE_ENV=production
"@

$envContent | Out-File -FilePath ".env.webhook" -Encoding UTF8
Write-Host "✅ Production environment file created: .env.webhook" -ForegroundColor Green

# Build webhook handler image for production
Write-Host "Building production webhook handler Docker image..." -ForegroundColor Yellow
try {
    docker build -f Dockerfile.webhook -t jamstockanalytics-webhook:production .
    Write-Host "✅ Production webhook handler image built successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to build production webhook handler image" -ForegroundColor Red
    exit 1
}

# Start webhook handler for production
Write-Host "Starting production webhook handler..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.webhook.yml up -d
    Write-Host "✅ Production webhook handler started successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to start production webhook handler" -ForegroundColor Red
    exit 1
}

# Display production configuration information
Write-Host "`n📋 Production Configuration Summary:" -ForegroundColor Cyan
Write-Host "Production Server IP: $ProductionIP" -ForegroundColor White
Write-Host "Production Webhook URL: http://$ProductionIP:3000/webhook" -ForegroundColor White
Write-Host "Production Health Check: http://$ProductionIP:3000/health" -ForegroundColor White
Write-Host "Webhook Secret: $WebhookSecret" -ForegroundColor White
Write-Host "Docker Hub Repository: $DockerHubUsername/$DockerHubRepository" -ForegroundColor White

Write-Host "`n🔧 Next Steps for Production:" -ForegroundColor Cyan
Write-Host "1. Configure Docker Hub webhook:" -ForegroundColor White
Write-Host "   - Go to https://hub.docker.com/repository/docker/$DockerHubUsername/$DockerHubRepository/webhooks" -ForegroundColor Gray
Write-Host "   - Add webhook URL: http://$ProductionIP:3000/webhook" -ForegroundColor Gray
Write-Host "   - Set webhook secret: $WebhookSecret" -ForegroundColor Gray
Write-Host "   - Select events: Push to repository" -ForegroundColor Gray

Write-Host "`n2. Test the production webhook:" -ForegroundColor White
Write-Host "   - Test health endpoint: curl http://$ProductionIP:3000/health" -ForegroundColor Gray
Write-Host "   - Push a new image to Docker Hub" -ForegroundColor Gray
Write-Host "   - Check webhook logs: docker logs jamstockanalytics-webhook" -ForegroundColor Gray

Write-Host "`n3. Monitor production deployment:" -ForegroundColor White
Write-Host "   - Check container status: docker ps" -ForegroundColor Gray
Write-Host "   - View application: http://$ProductionIP/" -ForegroundColor Gray
Write-Host "   - Monitor webhook: http://$ProductionIP:3000/health" -ForegroundColor Gray

Write-Host "`n4. Security considerations:" -ForegroundColor White
Write-Host "   - Ensure firewall allows port 3000" -ForegroundColor Gray
Write-Host "   - Use HTTPS in production (consider reverse proxy)" -ForegroundColor Gray
Write-Host "   - Keep webhook secret secure" -ForegroundColor Gray
Write-Host "   - Monitor webhook logs regularly" -ForegroundColor Gray

Write-Host "`n✅ Production webhook deployment complete!" -ForegroundColor Green
Write-Host "Your webhook is now ready at: http://$ProductionIP:3000/webhook" -ForegroundColor Green
