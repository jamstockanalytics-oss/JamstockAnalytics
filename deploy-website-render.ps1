# Deploy Website to Render - JamStockAnalytics
# This script helps deploy your HTML website to Render

Write-Host "🚀 Deploying JamStockAnalytics Website to Render" -ForegroundColor Green

# Check if we have HTML files
if (-not (Test-Path "index.html")) {
    Write-Host "❌ index.html not found. Please run from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "✅ HTML website files found" -ForegroundColor Green

# Create website deployment package
Write-Host "Creating website deployment package..." -ForegroundColor Yellow

$deployDir = "website-deploy"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir

# Copy HTML files
Copy-Item "*.html" -Destination $deployDir -ErrorAction SilentlyContinue
Copy-Item "static" -Destination $deployDir -Recurse -ErrorAction SilentlyContinue
Copy-Item "logo.png" -Destination $deployDir -ErrorAction SilentlyContinue
Copy-Item "favicon.ico" -Destination $deployDir -ErrorAction SilentlyContinue

# Copy subdirectories
if (Test-Path "(auth)") { Copy-Item "(auth)" -Destination $deployDir -Recurse }
if (Test-Path "(tabs)") { Copy-Item "(tabs)" -Destination $deployDir -Recurse }
if (Test-Path "analysis-session") { Copy-Item "analysis-session" -Destination $deployDir -Recurse }
if (Test-Path "article") { Copy-Item "article" -Destination $deployDir -Recurse }
if (Test-Path "brokerage") { Copy-Item "brokerage" -Destination $deployDir -Recurse }
if (Test-Path "stock") { Copy-Item "stock" -Destination $deployDir -Recurse }

Write-Host "✅ Website deployment package created in $deployDir" -ForegroundColor Green

# Create package.json for Render
$packageJson = @"
{
  "name": "jamstockanalytics-website",
  "version": "1.0.0",
  "description": "JamStockAnalytics Website",
  "main": "index.html",
  "scripts": {
    "start": "serve -s . -p \$PORT"
  },
  "dependencies": {
    "serve": "^14.2.1"
  }
}
"@

$packageJson | Out-File -FilePath "$deployDir/package.json" -Encoding UTF8

Write-Host "`n🚀 RENDER DEPLOYMENT STEPS:" -ForegroundColor Cyan

Write-Host "`n1. GO TO RENDER:" -ForegroundColor Yellow
Write-Host "   - Open: https://render.com" -ForegroundColor White
Write-Host "   - Sign up/Login with GitHub" -ForegroundColor White
Write-Host "   - Click 'New +' → 'Web Service'" -ForegroundColor White

Write-Host "`n2. CONNECT REPOSITORY:" -ForegroundColor Yellow
Write-Host "   - Select: jamstockanalytics-oss/JamstockAnalyticsWebOnly" -ForegroundColor White
Write-Host "   - Choose branch: master" -ForegroundColor White
Write-Host "   - Click 'Connect'" -ForegroundColor White

Write-Host "`n3. CONFIGURE SERVICE:" -ForegroundColor Yellow
Write-Host "   - Name: jamstockanalytics-website" -ForegroundColor White
Write-Host "   - Environment: Node" -ForegroundColor White
Write-Host "   - Plan: Free" -ForegroundColor White
Write-Host "   - Build Command: npm install" -ForegroundColor Gray
Write-Host "   - Start Command: npx serve -s . -p \$PORT" -ForegroundColor Gray

Write-Host "`n4. DEPLOY:" -ForegroundColor Yellow
Write-Host "   - Click 'Create Web Service'" -ForegroundColor White
Write-Host "   - Wait for deployment (2-3 minutes)" -ForegroundColor White
Write-Host "   - Get your website URL!" -ForegroundColor White

Write-Host "`n🌐 YOUR WEBSITE WILL BE LIVE AT:" -ForegroundColor Cyan
Write-Host "   https://jamstockanalytics-website.onrender.com" -ForegroundColor Green

Write-Host "`n✅ Website deployment package ready!" -ForegroundColor Green
Write-Host "Follow the steps above to deploy your website to Render." -ForegroundColor Green
