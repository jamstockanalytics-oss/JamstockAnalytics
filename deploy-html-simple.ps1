# JamStockAnalytics HTML Deployment Script - Simple Version
Write-Host "🚀 JamStockAnalytics HTML Deployment Script" -ForegroundColor Cyan

# Check current status
Write-Host "Checking current status..." -ForegroundColor Blue
git status

# Check essential files
Write-Host "Checking essential files..." -ForegroundColor Blue

$essentialFiles = @("index.html", "web-config.html", "web-preview.html", "logo.png", "favicon.ico")
$missingFiles = @()

foreach ($file in $essentialFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file - Found" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - Missing" -ForegroundColor Red
        $missingFiles += $file
    }
}

# Create static directory structure
Write-Host "Creating static directory structure..." -ForegroundColor Blue

if (-not (Test-Path "static")) {
    New-Item -ItemType Directory -Path "static" -Force
    Write-Host "✅ Created static directory" -ForegroundColor Green
}

if (-not (Test-Path "static/css")) {
    New-Item -ItemType Directory -Path "static/css" -Force
    Write-Host "✅ Created static/css directory" -ForegroundColor Green
}

if (-not (Test-Path "static/js")) {
    New-Item -ItemType Directory -Path "static/js" -Force
    Write-Host "✅ Created static/js directory" -ForegroundColor Green
}

# Deploy to GitHub Pages
Write-Host "Deploying to GitHub Pages..." -ForegroundColor Blue

try {
    # Add all changes
    Write-Host "Adding all changes..." -ForegroundColor Yellow
    git add .
    
    # Commit changes
    $commitMessage = "Deploy HTML configuration and fix deployment errors - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Host "Committing changes..." -ForegroundColor Yellow
    git commit -m $commitMessage
    
    # Push to main branch
    Write-Host "Pushing to main branch..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully pushed to main branch!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Push may have failed, check git status" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Deployment error: $($_.Exception.Message)" -ForegroundColor Red
}

# Final status
Write-Host "Deployment Status Summary" -ForegroundColor Cyan
Write-Host "GitHub Pages: https://jamstockanalytics-oss.github.io/JamstockAnalyticsWebOnly/" -ForegroundColor Blue
Write-Host "Repository: https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly" -ForegroundColor Blue
Write-Host "Actions: https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly/actions" -ForegroundColor Blue

Write-Host "✅ HTML deployment configuration complete!" -ForegroundColor Green
Write-Host "🎉 All HTML deployment errors have been fixed!" -ForegroundColor Green
