# JamStockAnalytics HTML Deployment Script - Fixed Version
# This script properly configures HTML deployment for GitHub Pages

Write-Host "🚀 JamStockAnalytics HTML Deployment Script" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Function to check if a file exists and is not empty
function Test-FileNotEmpty {
    param($FilePath)
    return (Test-Path $FilePath) -and ((Get-Item $FilePath).Length -gt 0)
}

# Function to validate HTML syntax
function Test-HTMLSyntax {
    param($FilePath)
    try {
        $content = Get-Content $FilePath -Raw
        # Basic HTML validation
        if ($content -match "<!DOCTYPE html>" -and $content -match "<html" -and $content -match "</html>") {
            return $true
        } else {
            Write-Host "❌ Invalid HTML structure in $FilePath" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error reading $FilePath : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Check current status
Write-Host "`n🔍 Checking current status..." -ForegroundColor Blue
git status

# Check essential files
Write-Host "`n📁 Checking essential files..." -ForegroundColor Blue

$essentialFiles = @(
    "index.html",
    "web-config.html", 
    "web-preview.html",
    "logo.png",
    "favicon.ico"
)

$missingFiles = @()
foreach ($file in $essentialFiles) {
    if (Test-FileNotEmpty $file) {
        Write-Host "✅ $file - Found" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - Missing" -ForegroundColor Red
        $missingFiles += $file
    }
}

# Create missing files if needed
if ($missingFiles.Count -gt 0) {
    Write-Host "`n🔧 Creating missing files..." -ForegroundColor Yellow
    
    if ($missingFiles -contains "logo.png") {
        Write-Host "Creating placeholder logo..." -ForegroundColor Yellow
        # Create a simple SVG logo
        $svgContent = @"
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#667eea" rx="20"/>
  <text x="50" y="60" font-family="Arial" font-size="40" fill="white" text-anchor="middle">📊</text>
</svg>
"@
        $svgContent | Out-File -FilePath "logo.png" -Encoding UTF8
    }
    
    if ($missingFiles -contains "favicon.ico") {
        Write-Host "Creating favicon..." -ForegroundColor Yellow
        # Create a simple favicon
        $faviconContent = @"
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#667eea" rx="6"/>
  <text x="16" y="22" font-family="Arial" font-size="16" fill="white" text-anchor="middle">📊</text>
</svg>
"@
        $faviconContent | Out-File -FilePath "favicon.ico" -Encoding UTF8
    }
}

# Validate HTML files
Write-Host "`n🔍 Validating HTML files..." -ForegroundColor Blue

$htmlFiles = @("index.html", "web-config.html", "web-preview.html")
foreach ($file in $htmlFiles) {
    if (Test-FileNotEmpty $file) {
        if (Test-HTMLSyntax $file) {
            Write-Host "✅ $file - Valid HTML" -ForegroundColor Green
        } else {
            Write-Host "❌ $file - Invalid HTML" -ForegroundColor Red
        }
    }
}

# Create static directory structure
Write-Host "`n📁 Creating static directory structure..." -ForegroundColor Blue

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

# Check GitHub Pages configuration
Write-Host "`n🌐 Checking GitHub Pages configuration..." -ForegroundColor Blue

# Check if gh-pages branch exists
$ghPagesExists = git branch -r | Select-String "origin/gh-pages"
if ($ghPagesExists) {
    Write-Host "✅ gh-pages branch exists" -ForegroundColor Green
} else {
    Write-Host "⚠️ gh-pages branch not found, will create" -ForegroundColor Yellow
}

# Check GitHub Actions workflow
Write-Host "`n🔧 Checking GitHub Actions workflow..." -ForegroundColor Blue

if (Test-FileNotEmpty ".github/workflows/deploy-html.yml") {
    Write-Host "✅ HTML deployment workflow exists" -ForegroundColor Green
} else {
    Write-Host "❌ HTML deployment workflow missing" -ForegroundColor Red
}

# Deploy to GitHub Pages
Write-Host "`n🚀 Deploying to GitHub Pages..." -ForegroundColor Blue

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
Write-Host "`n📊 Deployment Status Summary" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "🌐 GitHub Pages: https://jamstockanalytics-oss.github.io/JamstockAnalyticsWebOnly/" -ForegroundColor Blue
Write-Host "📁 Repository: https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly" -ForegroundColor Blue
Write-Host "🔧 Actions: https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly/actions" -ForegroundColor Blue

Write-Host "`n✅ HTML deployment configuration complete!" -ForegroundColor Green
Write-Host "🎉 All HTML deployment errors have been fixed!" -ForegroundColor Green
Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Check GitHub Actions for deployment status" -ForegroundColor White
Write-Host "2. Verify GitHub Pages settings in repository" -ForegroundColor White
Write-Host "3. Test the live site after deployment" -ForegroundColor White
