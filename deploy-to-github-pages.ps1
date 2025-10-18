# Deploy JamStockAnalytics to GitHub Pages
# PowerShell script for Windows

Write-Host "🚀 Deploying JamStockAnalytics to GitHub Pages..." -ForegroundColor Green

# Build the web app
Write-Host "📦 Building web app..." -ForegroundColor Yellow
Set-Location JamStockAnalytics
npm run build:web:optimized

# Check if dist directory exists
if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: dist directory not found. Build failed." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Web app built successfully!" -ForegroundColor Green

# Create or update gh-pages branch
Write-Host "🌿 Setting up gh-pages branch..." -ForegroundColor Yellow

# Add dist contents to git
git add dist/

# Commit the changes
git commit -m "Deploy web app to GitHub Pages - $(Get-Date)"

# Create and switch to gh-pages branch
try {
    git checkout -b gh-pages
} catch {
    # Branch might already exist, try to switch to it
    git checkout gh-pages
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Could not create or switch to gh-pages branch" -ForegroundColor Red
        exit 1
    }
}

# Copy dist contents to root
Copy-Item -Path "dist\*" -Destination "." -Recurse -Force

# Add all files
git add .

# Commit deployment
git commit -m "Deploy web app to GitHub Pages - $(Get-Date)"

# Push to gh-pages branch
Write-Host "📤 Pushing to GitHub Pages..." -ForegroundColor Yellow
git push origin gh-pages --force

# Switch back to main branch (or master if main doesn't exist)
try {
    git checkout main
} catch {
    git checkout master
}

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your web app will be available at:" -ForegroundColor Cyan
Write-Host "   https://jamstockanalytics-oss.github.io/JamstockAnalytics/" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Note: It may take a few minutes for GitHub Pages to update." -ForegroundColor Yellow
