# Quick Fix Script for JamStockAnalytics
Write-Host "🔧 Quick Fix Script" -ForegroundColor Cyan

# Check current status
Write-Host "📋 Checking current status..." -ForegroundColor Yellow
git status

# Add all changes
Write-Host "📝 Adding all changes..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Fix errors and configure HTML deployment"

# Push to master
Write-Host "🚀 Pushing to master..." -ForegroundColor Yellow
git push origin master

# Deploy to GitHub Pages
Write-Host "🌐 Deploying to GitHub Pages..." -ForegroundColor Yellow
git checkout gh-pages
git merge master
git push origin gh-pages
git checkout master

Write-Host "✅ All fixes applied and deployed!" -ForegroundColor Green
Write-Host "🌐 GitHub Pages: https://jamstockanalytics-oss.github.io/JamstockAnalyticsWebOnly/" -ForegroundColor Blue
