# Cloud Webhook Deployment Script for JamStockAnalytics
# This script helps deploy the webhook to various cloud services

param(
    [string]$Service = "render",
    [string]$WebhookSecret = "your-webhook-secret"
)

Write-Host "🚀 Deploying Webhook to Cloud Service: $Service" -ForegroundColor Green

# Create webhook deployment package
Write-Host "Creating webhook deployment package..." -ForegroundColor Yellow

# Copy webhook files to deployment directory
$deployDir = "webhook-deploy"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir

# Copy necessary files
Copy-Item "webhook-handler.js" -Destination "$deployDir/"
Copy-Item "webhook-package.json" -Destination "$deployDir/package.json"
Copy-Item "Dockerfile.webhook" -Destination "$deployDir/Dockerfile"

# Create environment file
$envContent = @"
WEBHOOK_PORT=10000
WEBHOOK_SECRET=$WebhookSecret
NODE_ENV=production
"@
$envContent | Out-File -FilePath "$deployDir/.env" -Encoding UTF8

Write-Host "✅ Webhook deployment package created in $deployDir" -ForegroundColor Green

# Service-specific deployment instructions
if ($Service.ToLower() -eq "render") {
    Write-Host "`n📋 Render Deployment Instructions:" -ForegroundColor Cyan
    Write-Host "1. Go to https://render.com" -ForegroundColor White
    Write-Host "2. Sign up/Login with GitHub" -ForegroundColor White
    Write-Host "3. Click 'New +' -> 'Web Service'" -ForegroundColor White
    Write-Host "4. Connect your GitHub repository" -ForegroundColor White
    Write-Host "5. Set these settings:" -ForegroundColor White
    Write-Host "   - Build Command: npm install" -ForegroundColor Gray
    Write-Host "   - Start Command: node webhook-handler.js" -ForegroundColor Gray
    Write-Host "   - Environment: Node" -ForegroundColor Gray
    Write-Host "6. Add Environment Variables:" -ForegroundColor White
    Write-Host "   - WEBHOOK_PORT: 10000" -ForegroundColor Gray
    Write-Host "   - WEBHOOK_SECRET: $WebhookSecret" -ForegroundColor Gray
    Write-Host "   - NODE_ENV: production" -ForegroundColor Gray
    Write-Host "7. Deploy!" -ForegroundColor White
}
elseif ($Service.ToLower() -eq "railway") {
    Write-Host "`n📋 Railway Deployment Instructions:" -ForegroundColor Cyan
    Write-Host "1. Go to https://railway.app" -ForegroundColor White
    Write-Host "2. Sign up/Login with GitHub" -ForegroundColor White
    Write-Host "3. Click 'New Project' -> 'Deploy from GitHub repo'" -ForegroundColor White
    Write-Host "4. Select your JamStockAnalytics repository" -ForegroundColor White
    Write-Host "5. Railway will auto-detect the Dockerfile.webhook" -ForegroundColor White
    Write-Host "6. Add Environment Variables:" -ForegroundColor White
    Write-Host "   - WEBHOOK_PORT: 10000" -ForegroundColor Gray
    Write-Host "   - WEBHOOK_SECRET: $WebhookSecret" -ForegroundColor Gray
    Write-Host "   - NODE_ENV: production" -ForegroundColor Gray
    Write-Host "7. Deploy!" -ForegroundColor White
}
elseif ($Service.ToLower() -eq "heroku") {
    Write-Host "`n📋 Heroku Deployment Instructions:" -ForegroundColor Cyan
    Write-Host "1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor White
    Write-Host "2. Run: heroku login" -ForegroundColor White
    Write-Host "3. Run: heroku create jamstockanalytics-webhook" -ForegroundColor White
    Write-Host "4. Run: heroku config:set WEBHOOK_PORT=10000" -ForegroundColor White
    Write-Host "5. Run: heroku config:set WEBHOOK_SECRET=$WebhookSecret" -ForegroundColor White
    Write-Host "6. Run: heroku config:set NODE_ENV=production" -ForegroundColor White
    Write-Host "7. Run: git push heroku main" -ForegroundColor White
}

Write-Host "`n🔧 After Deployment:" -ForegroundColor Cyan
Write-Host "1. Get your webhook URL from the cloud service" -ForegroundColor White
Write-Host "2. Update Docker Hub webhook URL to: https://your-app-url/webhook" -ForegroundColor White
Write-Host "3. Test by pushing a new image to Docker Hub" -ForegroundColor White
Write-Host "4. Check webhook logs in your cloud service dashboard" -ForegroundColor White

Write-Host "`n✅ Deployment package ready in $deployDir" -ForegroundColor Green