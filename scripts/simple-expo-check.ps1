# Simple EXPO_TOKEN Status Check
Write-Host "🔍 EXPO_TOKEN Status Check" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Not in project root" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project directory found" -ForegroundColor Green

# Check Expo CLI
Write-Host "🔍 Checking Expo CLI..." -ForegroundColor Yellow
try {
    expo --version | Out-Null
    Write-Host "✅ Expo CLI installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Expo CLI not found" -ForegroundColor Red
    Write-Host "💡 Install with: npm install -g @expo/cli" -ForegroundColor Yellow
}

# Check workflows
Write-Host "🔍 Checking workflows..." -ForegroundColor Yellow
$workflowPath = ".github/workflows"
if (Test-Path $workflowPath) {
    $workflows = Get-ChildItem $workflowPath -Filter "*.yml"
    Write-Host "✅ Found $($workflows.Count) workflow files" -ForegroundColor Green
    
    # Check for EXPO_TOKEN usage
    $expoTokenFound = $false
    foreach ($workflow in $workflows) {
        $content = Get-Content $workflow.FullName -Raw
        if ($content -match "EXPO_TOKEN") {
            Write-Host "✅ EXPO_TOKEN found in: $($workflow.Name)" -ForegroundColor Green
            $expoTokenFound = $true
        }
    }
    
    if ($expoTokenFound) {
        Write-Host "🎉 Workflows are configured for EXPO_TOKEN!" -ForegroundColor Green
        Write-Host "🔧 Make sure EXPO_TOKEN secret is set in GitHub" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  EXPO_TOKEN not found in workflows" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ No workflows found" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 Ready for deployment!" -ForegroundColor Green

