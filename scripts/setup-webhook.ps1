# Setup script for Docker Hub webhook integration
# This script configures the webhook handler and deployment automation

param(
    [string]$WebhookSecret = "your-webhook-secret-change-this",
    [string]$DockerHubUsername = "jamstockanalytics",
    [string]$DockerHubRepository = "jamstockanalytics"
)

Write-Host "🚀 Setting up Docker Hub webhook integration for JamStockAnalytics" -ForegroundColor Green

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

# Create environment file
Write-Host "Creating environment configuration..." -ForegroundColor Yellow
$envContent = @"
# Webhook Configuration
WEBHOOK_SECRET=$WebhookSecret
DOCKER_HUB_USERNAME=$DockerHubUsername
DOCKER_HUB_REPOSITORY=$DockerHubRepository

# Deployment Configuration
DOCKER_IMAGE=$DockerHubUsername/$DockerHubRepository
CONTAINER_NAME=jamstockanalytics-web
COMPOSE_FILE=docker-compose.prod.yml
"@

$envContent | Out-File -FilePath ".env.webhook" -Encoding UTF8
Write-Host "✅ Environment file created: .env.webhook" -ForegroundColor Green

# Build webhook handler image
Write-Host "Building webhook handler Docker image..." -ForegroundColor Yellow
try {
    docker build -f Dockerfile.webhook -t jamstockanalytics-webhook .
    Write-Host "✅ Webhook handler image built successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to build webhook handler image" -ForegroundColor Red
    exit 1
}

# Start webhook handler
Write-Host "Starting webhook handler..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.webhook.yml up -d
    Write-Host "✅ Webhook handler started successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to start webhook handler" -ForegroundColor Red
    exit 1
}

# Display configuration information
Write-Host "`n📋 Configuration Summary:" -ForegroundColor Cyan
Write-Host "Production Webhook URL: http://66.234.84.10:3000/webhook" -ForegroundColor White
Write-Host "Production Health Check: http://66.234.84.10:3000/health" -ForegroundColor White
Write-Host "Local Webhook URL: http://localhost:3000/webhook" -ForegroundColor White
Write-Host "Local Health Check: http://localhost:3000/health" -ForegroundColor White
Write-Host "Webhook Secret: $WebhookSecret" -ForegroundColor White
Write-Host "Docker Hub Repository: $DockerHubUsername/$DockerHubRepository" -ForegroundColor White

Write-Host "`n🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure Docker Hub webhook:" -ForegroundColor White
Write-Host "   - Go to https://hub.docker.com/repository/docker/$DockerHubUsername/$DockerHubRepository/webhooks" -ForegroundColor Gray
Write-Host "   - Add webhook URL: http://66.234.84.10:3000/webhook" -ForegroundColor Gray
Write-Host "   - Set webhook secret: $WebhookSecret" -ForegroundColor Gray
Write-Host "   - Select events: Push to repository" -ForegroundColor Gray

Write-Host "`n2. Test the webhook:" -ForegroundColor White
Write-Host "   - Push a new image to Docker Hub" -ForegroundColor Gray
Write-Host "   - Check webhook logs: docker logs jamstockanalytics-webhook" -ForegroundColor Gray

Write-Host "`n3. Monitor deployment:" -ForegroundColor White
Write-Host "   - Check container status: docker ps" -ForegroundColor Gray
Write-Host "   - View application: http://66.234.84.10/" -ForegroundColor Gray
Write-Host "   - Test webhook health: http://66.234.84.10:3000/health" -ForegroundColor Gray

Write-Host "`n✅ Webhook integration setup complete!" -ForegroundColor Green
