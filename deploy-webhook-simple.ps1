# Simple Cloud Webhook Deployment Script
param(
    [string]$WebhookSecret = "your-webhook-secret"
)

Write-Host "🚀 Preparing Webhook for Cloud Deployment" -ForegroundColor Green

# Create deployment directory
$deployDir = "webhook-deploy"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir

# Copy files
Copy-Item "webhook-handler.js" -Destination "$deployDir/"
Copy-Item "webhook-package.json" -Destination "$deployDir/package.json"

# Create environment file
$envContent = @"
WEBHOOK_PORT=10000
WEBHOOK_SECRET=$WebhookSecret
NODE_ENV=production
"@
$envContent | Out-File -FilePath "$deployDir/.env" -Encoding UTF8

Write-Host "✅ Deployment package created in $deployDir" -ForegroundColor Green

Write-Host "`n📋 RENDER DEPLOYMENT STEPS:" -ForegroundColor Cyan
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

Write-Host "`n🔧 After Deployment:" -ForegroundColor Cyan
Write-Host "1. Get your webhook URL (e.g., https://your-app.onrender.com)" -ForegroundColor White
Write-Host "2. Update Docker Hub webhook URL to: https://your-app.onrender.com/webhook" -ForegroundColor White
Write-Host "3. Test by pushing a new image to Docker Hub" -ForegroundColor White

Write-Host "`n✅ Ready for deployment!" -ForegroundColor Green
