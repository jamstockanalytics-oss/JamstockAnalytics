# 🔍 EXPO_TOKEN Status Checker
# This script helps verify if EXPO_TOKEN is properly configured

Write-Host "🔍 EXPO_TOKEN Configuration Checker" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Not in project root directory" -ForegroundColor Red
    Write-Host "💡 Please run this from the JamStockAnalytics project root" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Project directory found" -ForegroundColor Green
Write-Host ""

# Check if Expo CLI is installed
Write-Host "🔍 Checking Expo CLI..." -ForegroundColor Yellow
try {
    $expoVersion = expo --version 2>$null
    if ($expoVersion) {
        Write-Host "✅ Expo CLI installed: $expoVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Expo CLI not found" -ForegroundColor Red
        Write-Host "💡 Install with: npm install -g @expo/cli" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Expo CLI not installed" -ForegroundColor Red
    Write-Host "💡 Install with: npm install -g @expo/cli" -ForegroundColor Yellow
}

Write-Host ""

# Check Expo authentication status
Write-Host "🔍 Checking Expo authentication..." -ForegroundColor Yellow
try {
    $whoami = expo whoami 2>$null
    if ($whoami) {
        Write-Host "✅ Expo authenticated as: $whoami" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Expo not authenticated" -ForegroundColor Yellow
        Write-Host "💡 Run 'expo login' to authenticate" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Expo authentication check failed" -ForegroundColor Yellow
    Write-Host "💡 Run 'expo login' to authenticate" -ForegroundColor Yellow
}

Write-Host ""

# Check GitHub Actions workflow files
Write-Host "🔍 Checking GitHub Actions workflows..." -ForegroundColor Yellow
$workflowPath = ".github/workflows"
if (Test-Path $workflowPath) {
    $workflows = Get-ChildItem $workflowPath -Filter "*.yml"
    Write-Host "✅ Found $($workflows.Count) workflow files:" -ForegroundColor Green
    foreach ($workflow in $workflows) {
        Write-Host "   📄 $($workflow.Name)" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ No GitHub Actions workflows found" -ForegroundColor Red
}

Write-Host ""

# Check for EXPO_TOKEN in workflow files
Write-Host "🔍 Checking for EXPO_TOKEN usage in workflows..." -ForegroundColor Yellow
$expoTokenFound = $false
if (Test-Path $workflowPath) {
    $workflows = Get-ChildItem $workflowPath -Filter "*.yml"
    foreach ($workflow in $workflows) {
        $content = Get-Content $workflow.FullName -Raw
        if ($content -match "EXPO_TOKEN") {
            Write-Host "✅ EXPO_TOKEN found in: $($workflow.Name)" -ForegroundColor Green
            $expoTokenFound = $true
        }
    }
}

if (-not $expoTokenFound) {
    Write-Host "⚠️  EXPO_TOKEN not found in workflow files" -ForegroundColor Yellow
    Write-Host "💡 Make sure your workflows reference EXPO_TOKEN" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "🎯 EXPO_TOKEN Status Summary:" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

if ($expoTokenFound) {
    Write-Host "✅ Workflows configured for EXPO_TOKEN" -ForegroundColor Green
    Write-Host "✅ Android builds: Ready (if EXPO_TOKEN secret is set)" -ForegroundColor Green
    Write-Host "✅ iOS builds: Ready (if EXPO_TOKEN secret is set)" -ForegroundColor Green
    Write-Host "✅ Web builds: Ready (works without EXPO_TOKEN)" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔧 To verify EXPO_TOKEN secret is set:" -ForegroundColor Yellow
    Write-Host "   1. Go to GitHub → Settings → Secrets and variables → Actions" -ForegroundColor White
    Write-Host "   2. Look for 'EXPO_TOKEN' in the list" -ForegroundColor White
    Write-Host "   3. If missing, add it with your Expo token" -ForegroundColor White
} else {
    Write-Host "⚠️  Workflows may not be configured for EXPO_TOKEN" -ForegroundColor Yellow
    Write-Host "💡 Check your workflow files for EXPO_TOKEN references" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Ready for deployment!" -ForegroundColor Green

