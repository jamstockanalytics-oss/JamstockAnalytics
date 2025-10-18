# Validate GitHub Scripts - Simple Validation
Write-Host "🔍 Validating GitHub Scripts..." -ForegroundColor Cyan

# Check if files exist
$files = @(
    "deploy-to-github-pages.ps1",
    "deploy-to-github-pages.sh", 
    "deploy-html.ps1",
    ".github/workflows/ci.yml",
    ".github/workflows/docker.yml",
    ".github/workflows/deploy-web.yml"
)

Write-Host "`n📁 Checking Files..." -ForegroundColor Blue
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file - Found" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - Missing" -ForegroundColor Red
    }
}

# Check package.json scripts
Write-Host "`n📦 Checking Package Scripts..." -ForegroundColor Blue
if (Test-Path "package.json") {
    $package = Get-Content "package.json" | ConvertFrom-Json
    $requiredScripts = @("build:web:optimized", "deploy:web")
    
    foreach ($script in $requiredScripts) {
        if ($package.scripts.$script) {
            Write-Host "✅ Script '$script' found" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Script '$script' missing" -ForegroundColor Yellow
        }
    }
}

# Check for common fixes applied
Write-Host "`n🔧 Checking Applied Fixes..." -ForegroundColor Blue

# Check PowerShell script fixes
if ((Get-Content "deploy-to-github-pages.ps1" -Raw) -match "git checkout main") {
    Write-Host "✅ PowerShell branch handling fixed" -ForegroundColor Green
} else {
    Write-Host "❌ PowerShell branch handling needs fixing" -ForegroundColor Red
}

# Check GitHub Actions fixes
if ((Get-Content ".github/workflows/ci.yml" -Raw) -match "secrets\.EXPO_TOKEN != ''") {
    Write-Host "✅ GitHub Actions conditionals fixed" -ForegroundColor Green
} else {
    Write-Host "❌ GitHub Actions conditionals need fixing" -ForegroundColor Red
}

# Check Docker workflow fixes
if ((Get-Content ".github/workflows/docker.yml" -Raw) -match "images: jamstockanalytics") {
    Write-Host "✅ Docker workflow metadata fixed" -ForegroundColor Green
} else {
    Write-Host "❌ Docker workflow metadata needs fixing" -ForegroundColor Red
}

Write-Host "`n✅ Validation Complete!" -ForegroundColor Green
