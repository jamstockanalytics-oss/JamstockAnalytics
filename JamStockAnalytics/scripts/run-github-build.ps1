# GitHub Actions Build Trigger Script
Write-Host "🚀 TRIGGERING GITHUB ACTIONS BUILD" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Available build workflows:" -ForegroundColor Yellow
Write-Host "1. Test GCP Authentication (Quick test)" -ForegroundColor White
Write-Host "2. Enhanced Build with GCP (Recommended)" -ForegroundColor Green
Write-Host "3. Enhanced Build without GCP (Fallback)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Choose workflow (1-3)"

switch ($choice) {
    "1" {
        Write-Host "🔍 Running GCP Authentication Test..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "STEP 1: Go to GitHub Actions" -ForegroundColor Cyan
        Write-Host "https://github.com/your-username/JamStockAnalytics/actions" -ForegroundColor White
        Write-Host ""
        Write-Host "STEP 2: Find 'Test GCP Authentication'" -ForegroundColor Cyan
        Write-Host "STEP 3: Click 'Run workflow'" -ForegroundColor Cyan
        Write-Host "STEP 4: Select test type: 'basic'" -ForegroundColor Cyan
        Write-Host "STEP 5: Click 'Run workflow'" -ForegroundColor Cyan
    }
    "2" {
        Write-Host "🚀 Running Enhanced Build with GCP..." -ForegroundColor Green
        Write-Host ""
        Write-Host "STEP 1: Go to GitHub Actions" -ForegroundColor Cyan
        Write-Host "https://github.com/your-username/JamStockAnalytics/actions" -ForegroundColor White
        Write-Host ""
        Write-Host "STEP 2: Find 'Automated Build with GCP Authentication'" -ForegroundColor Cyan
        Write-Host "STEP 3: Click 'Run workflow'" -ForegroundColor Cyan
        Write-Host "STEP 4: Configure parameters:" -ForegroundColor Cyan
        Write-Host "   - Build profile: 'automated'" -ForegroundColor White
        Write-Host "   - Platforms: 'all'" -ForegroundColor White
        Write-Host "STEP 5: Click 'Run workflow'" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Expected results:" -ForegroundColor Green
        Write-Host "✅ GCP authentication successful" -ForegroundColor Green
        Write-Host "✅ Service account validation passed" -ForegroundColor Green
        Write-Host "✅ Build jobs completed successfully" -ForegroundColor Green
        Write-Host "✅ Artifacts uploaded" -ForegroundColor Green
    }
    "3" {
        Write-Host "🔧 Running Enhanced Build without GCP..." -ForegroundColor White
        Write-Host ""
        Write-Host "STEP 1: Go to GitHub Actions" -ForegroundColor Cyan
        Write-Host "https://github.com/your-username/JamStockAnalytics/actions" -ForegroundColor White
        Write-Host ""
        Write-Host "STEP 2: Find 'Enhanced Automated Build and Deploy'" -ForegroundColor Cyan
        Write-Host "STEP 3: Click 'Run workflow'" -ForegroundColor Cyan
        Write-Host "STEP 4: Configure parameters:" -ForegroundColor Cyan
        Write-Host "   - Build profile: 'automated'" -ForegroundColor White
        Write-Host "   - Platforms: 'all'" -ForegroundColor White
        Write-Host "STEP 5: Click 'Run workflow'" -ForegroundColor Cyan
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📋 Required GitHub Secrets Status:" -ForegroundColor Yellow
Write-Host "✅ GCP_SA_KEY - You have this!" -ForegroundColor Green
Write-Host "⚠️  SUPABASE_URL - Add your Supabase project URL" -ForegroundColor Yellow
Write-Host "⚠️  SUPABASE_ANON_KEY - Add your Supabase anonymous key" -ForegroundColor Yellow
Write-Host "🔧 DEEPSEEK_API_KEY - Optional" -ForegroundColor White
Write-Host "🔧 EXPO_TOKEN - Optional" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Quick Links:" -ForegroundColor Cyan
Write-Host "GitHub Actions: https://github.com/your-username/JamStockAnalytics/actions" -ForegroundColor Cyan
Write-Host "Repository Settings: https://github.com/your-username/JamStockAnalytics/settings/secrets/actions" -ForegroundColor Cyan

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "- Monitor the workflow logs for real-time progress" -ForegroundColor White
Write-Host "- Check the 'Summary' section for test results" -ForegroundColor White
Write-Host "- Look for ✅ success indicators and ❌ error messages" -ForegroundColor White

Write-Host ""
Write-Host "🚀 READY TO BUILD! Go to GitHub Actions now!" -ForegroundColor Green
