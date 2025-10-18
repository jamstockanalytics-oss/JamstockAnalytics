# Main Application Deployment Script for JamStockAnalytics
# This script deploys the main JamStockAnalytics application

param(
    [string]$Environment = "production",
    [string]$Platform = "web"
)

Write-Host "🚀 Deploying JamStockAnalytics Main Application" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Platform: $Platform" -ForegroundColor Yellow

# Check if we're in the right directory
if (-not (Test-Path "JamStockAnalytics/package.json")) {
    Write-Host "❌ JamStockAnalytics directory not found. Please run from the project root." -ForegroundColor Red
    exit 1
}

# Navigate to the main app directory
Set-Location "JamStockAnalytics"

Write-Host "`n📋 DEPLOYMENT OPTIONS:" -ForegroundColor Cyan
Write-Host "1. Deploy to Render (Web App)" -ForegroundColor White
Write-Host "2. Deploy to Railway (Web App)" -ForegroundColor White
Write-Host "3. Deploy to Vercel (Web App)" -ForegroundColor White
Write-Host "4. Deploy to Netlify (Web App)" -ForegroundColor White
Write-Host "5. Build for Mobile (Android/iOS)" -ForegroundColor White

Write-Host "`n🌐 WEB DEPLOYMENT STEPS:" -ForegroundColor Cyan

# Create web deployment package
Write-Host "Creating web deployment package..." -ForegroundColor Yellow

# Build the web version
Write-Host "Building web application..." -ForegroundColor Yellow
try {
    npm run build:web:optimized
    Write-Host "✅ Web application built successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to build web application" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create deployment directory
$deployDir = "../web-deploy"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir

# Copy built files
Copy-Item "dist/*" -Destination $deployDir -Recurse -ErrorAction SilentlyContinue
Copy-Item "web-build/*" -Destination $deployDir -Recurse -ErrorAction SilentlyContinue

Write-Host "✅ Web deployment package created in $deployDir" -ForegroundColor Green

# Create deployment configurations
Write-Host "Creating deployment configurations..." -ForegroundColor Yellow

# Render configuration
$renderConfig = @"
services:
  - type: web
    name: jamstockanalytics-app
    env: static
    plan: free
    buildCommand: npm run build:web:optimized
    staticPublishPath: ./web-build
    envVars:
      - key: NODE_ENV
        value: production
      - key: EXPO_PUBLIC_SUPABASE_URL
        value: YOUR_SUPABASE_URL
      - key: EXPO_PUBLIC_SUPABASE_ANON_KEY
        value: YOUR_SUPABASE_ANON_KEY
      - key: EXPO_PUBLIC_DEEPSEEK_API_KEY
        value: YOUR_DEEPSEEK_API_KEY
"@
$renderConfig | Out-File -FilePath "$deployDir/render.yaml" -Encoding UTF8

# Vercel configuration
$vercelConfig = @"
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "web-build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
"@
$vercelConfig | Out-File -FilePath "$deployDir/vercel.json" -Encoding UTF8

# Netlify configuration
$netlifyConfig = @"
[build]
  publish = "web-build"
  command = "npm run build:web:optimized"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
"@
$netlifyConfig | Out-File -FilePath "$deployDir/netlify.toml" -Encoding UTF8

Write-Host "✅ Deployment configurations created" -ForegroundColor Green

Write-Host "`n🚀 DEPLOYMENT INSTRUCTIONS:" -ForegroundColor Cyan

Write-Host "`n1. RENDER DEPLOYMENT:" -ForegroundColor Yellow
Write-Host "   - Go to https://render.com" -ForegroundColor White
Write-Host "   - Create new Static Site" -ForegroundColor White
Write-Host "   - Connect GitHub repository" -ForegroundColor White
Write-Host "   - Build Command: npm run build:web:optimized" -ForegroundColor Gray
Write-Host "   - Publish Directory: web-build" -ForegroundColor Gray
Write-Host "   - Add environment variables:" -ForegroundColor White
Write-Host "     * EXPO_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
Write-Host "     * EXPO_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Gray
Write-Host "     * EXPO_PUBLIC_DEEPSEEK_API_KEY" -ForegroundColor Gray

Write-Host "`n2. VERCEL DEPLOYMENT:" -ForegroundColor Yellow
Write-Host "   - Go to https://vercel.com" -ForegroundColor White
Write-Host "   - Import GitHub repository" -ForegroundColor White
Write-Host "   - Framework: Other" -ForegroundColor White
Write-Host "   - Build Command: npm run build:web:optimized" -ForegroundColor Gray
Write-Host "   - Output Directory: web-build" -ForegroundColor Gray

Write-Host "`n3. NETLIFY DEPLOYMENT:" -ForegroundColor Yellow
Write-Host "   - Go to https://netlify.com" -ForegroundColor White
Write-Host "   - Connect GitHub repository" -ForegroundColor White
Write-Host "   - Build Command: npm run build:web:optimized" -ForegroundColor Gray
Write-Host "   - Publish Directory: web-build" -ForegroundColor Gray

Write-Host "`n📱 MOBILE DEPLOYMENT:" -ForegroundColor Cyan
Write-Host "For Android/iOS deployment:" -ForegroundColor White
Write-Host "1. Run: npm run build:android:auto" -ForegroundColor Gray
Write-Host "2. Run: npm run build:ios:auto" -ForegroundColor Gray
Write-Host "3. Deploy via EAS Build" -ForegroundColor Gray

Write-Host "`n🔧 ENVIRONMENT SETUP:" -ForegroundColor Cyan
Write-Host "Before deploying, make sure you have:" -ForegroundColor White
Write-Host "1. Supabase project configured" -ForegroundColor Gray
Write-Host "2. DeepSeek API key" -ForegroundColor Gray
Write-Host "3. Environment variables set" -ForegroundColor Gray

Write-Host "`n✅ Deployment package ready!" -ForegroundColor Green
Write-Host "Choose your deployment platform and follow the instructions above." -ForegroundColor Green

# Return to original directory
Set-Location ".."
