# Quick GCP Check Script
Write-Host "🔍 Quick GCP Setup Check" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check gcloud installation
try {
    gcloud version | Out-Null
    Write-Host "✅ gcloud CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ gcloud CLI not found" -ForegroundColor Red
    exit 1
}

# Check authentication
try {
    $account = gcloud auth list --filter=status:ACTIVE --format="value(account)"
    if ($account) {
        Write-Host "✅ Authenticated as: $account" -ForegroundColor Green
    } else {
        Write-Host "❌ Not authenticated" -ForegroundColor Red
        Write-Host "💡 Run: gcloud auth login" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Authentication check failed" -ForegroundColor Red
    exit 1
}

# Set project
Write-Host "🔧 Setting project to jamstockanalytics..." -ForegroundColor Yellow
gcloud config set project jamstockanalytics

# Check service account
Write-Host "🔍 Checking service account status..." -ForegroundColor Yellow
$status = gcloud iam service-accounts describe 802624016917-compute@developer.gserviceaccount.com --project=jamstockanalytics --format="value(disabled)" 2>$null

if ($status -eq "True") {
    Write-Host "⚠️  Service account is disabled" -ForegroundColor Yellow
    Write-Host "🔧 Enabling service account..." -ForegroundColor Yellow
    gcloud iam service-accounts enable 802624016917-compute@developer.gserviceaccount.com --project=jamstockanalytics
    Write-Host "✅ Service account enabled" -ForegroundColor Green
} else {
    Write-Host "✅ Service account is enabled" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 GCP Setup Check Complete!" -ForegroundColor Green
Write-Host "✅ Ready for GitHub Actions" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Test the GitHub Actions workflow" -ForegroundColor Yellow
