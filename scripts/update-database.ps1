# JamStockAnalytics Database Update Script
# PowerShell version for cross-platform compatibility

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "JamStockAnalytics Database Update" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js not found"
    }
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    Write-Host "Please create a .env file with your Supabase credentials:" -ForegroundColor Yellow
    Write-Host "   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url" -ForegroundColor Gray
    Write-Host "   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key" -ForegroundColor Gray
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Starting database update..." -ForegroundColor Yellow
Write-Host ""

# Run the database update script
try {
    node scripts/setup-database.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Database update completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Your JamStockAnalytics database is now ready!" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "New features available:" -ForegroundColor Yellow
        Write-Host "   - Social Media Sharing System" -ForegroundColor Gray
        Write-Host "   - Chart Preferences and Data Caching" -ForegroundColor Gray
        Write-Host "   - Enhanced User Profiles" -ForegroundColor Gray
        Write-Host "   - Analytics and Performance Tracking" -ForegroundColor Gray
        Write-Host "   - Row Level Security Policies" -ForegroundColor Gray
        Write-Host "   - Database Functions and Triggers" -ForegroundColor Gray
        Write-Host "   - Performance Indexes" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "❌ Database update failed!" -ForegroundColor Red
        Write-Host "Please check the error messages above and try again." -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error running database update script: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
