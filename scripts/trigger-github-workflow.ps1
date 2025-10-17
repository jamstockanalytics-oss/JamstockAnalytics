# GitHub Workflow Trigger Script
# This script helps you trigger GitHub Actions workflows

Write-Host "🚀 GitHub Actions Workflow Trigger" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Available workflows to test:" -ForegroundColor Yellow
Write-Host "1. Test GCP Authentication (test-gcp-auth.yml)" -ForegroundColor White
Write-Host "2. Enhanced Build with GCP (automated-build-with-gcp.yml)" -ForegroundColor White
Write-Host "3. Enhanced Build without GCP (automated-build-enhanced.yml)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host "🔍 Testing GCP Authentication..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To trigger this workflow:" -ForegroundColor White
        Write-Host "1. Go to: https://github.com/your-username/JamStockAnalytics/actions" -ForegroundColor Cyan
        Write-Host "2. Find 'Test GCP Authentication' workflow" -ForegroundColor Cyan
        Write-Host "3. Click 'Run workflow'" -ForegroundColor Cyan
        Write-Host "4. Choose test type: 'basic', 'full', or 'permissions'" -ForegroundColor Cyan
        Write-Host "5. Click 'Run workflow'" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Expected results:" -ForegroundColor Green
        Write-Host "✅ GCP_SA_KEY secret is present" -ForegroundColor Green
        Write-Host "✅ GCP authentication successful" -ForegroundColor Green
        Write-Host "✅ Service account is enabled" -ForegroundColor Green
    }
    "2" {
        Write-Host "🚀 Testing Enhanced Build with GCP..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To trigger this workflow:" -ForegroundColor White
        Write-Host "1. Go to: https://github.com/your-username/JamStockAnalytics/actions" -ForegroundColor Cyan
        Write-Host "2. Find 'Automated Build with GCP Authentication' workflow" -ForegroundColor Cyan
        Write-Host "3. Click 'Run workflow'" -ForegroundColor Cyan
        Write-Host "4. Choose build profile: 'automated'" -ForegroundColor Cyan
        Write-Host "5. Choose platforms: 'all'" -ForegroundColor Cyan
        Write-Host "6. Click 'Run workflow'" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Expected results:" -ForegroundColor Green
        Write-Host "✅ GCP authentication successful" -ForegroundColor Green
        Write-Host "✅ Service account validation passed" -ForegroundColor Green
        Write-Host "✅ Build jobs completed successfully" -ForegroundColor Green
        Write-Host "✅ Artifacts uploaded" -ForegroundColor Green
    }
    "3" {
        Write-Host "🔧 Testing Enhanced Build without GCP..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To trigger this workflow:" -ForegroundColor White
        Write-Host "1. Go to: https://github.com/your-username/JamStockAnalytics/actions" -ForegroundColor Cyan
        Write-Host "2. Find 'Enhanced Automated Build and Deploy' workflow" -ForegroundColor Cyan
        Write-Host "3. Click 'Run workflow'" -ForegroundColor Cyan
        Write-Host "4. Choose build profile: 'automated'" -ForegroundColor Cyan
        Write-Host "5. Choose platforms: 'all'" -ForegroundColor Cyan
        Write-Host "6. Click 'Run workflow'" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Expected results:" -ForegroundColor Green
        Write-Host "✅ Secret validation passed" -ForegroundColor Green
        Write-Host "✅ Build jobs completed successfully" -ForegroundColor Green
        Write-Host "✅ Artifacts uploaded" -ForegroundColor Green
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📋 Required GitHub Secrets:" -ForegroundColor Yellow
Write-Host "✅ GCP_SA_KEY - You have this" -ForegroundColor Green
Write-Host "⚠️  SUPABASE_URL - Required" -ForegroundColor Yellow
Write-Host "⚠️  SUPABASE_ANON_KEY - Required" -ForegroundColor Yellow
Write-Host "⚠️  DEEPSEEK_API_KEY - Optional" -ForegroundColor White
Write-Host "⚠️  EXPO_TOKEN - Optional" -ForegroundColor White
Write-Host "⚠️  SUPABASE_SERVICE_ROLE_KEY - Optional" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Quick Links:" -ForegroundColor Cyan
Write-Host "GitHub Actions: https://github.com/your-username/JamStockAnalytics/actions" -ForegroundColor Cyan
Write-Host "Repository Settings: https://github.com/your-username/JamStockAnalytics/settings/secrets/actions" -ForegroundColor Cyan

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "- Monitor the workflow logs for real-time progress" -ForegroundColor White
Write-Host "- Check the 'Summary' section for test results" -ForegroundColor White
Write-Host "- Look for ✅ success indicators and ❌ error messages" -ForegroundColor White
