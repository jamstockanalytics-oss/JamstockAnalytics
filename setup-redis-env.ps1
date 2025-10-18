# Redis Environment Setup Script for JamStockAnalytics
# Run this script to set up Redis environment variables

Write-Host "🔧 Setting up Redis Environment Variables for JamStockAnalytics" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green

# Set Redis environment variables
Write-Host "📝 Setting Redis configuration..." -ForegroundColor Yellow

# Set environment variables for current session
$env:REDIS_HOST = "localhost"
$env:REDIS_PORT = "6379"
$env:REDIS_PASSWORD = ""

# Set environment variables permanently for user
[Environment]::SetEnvironmentVariable("REDIS_HOST", "localhost", "User")
[Environment]::SetEnvironmentVariable("REDIS_PORT", "6379", "User")
[Environment]::SetEnvironmentVariable("REDIS_PASSWORD", "", "User")

Write-Host "✅ Redis environment variables set successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Configuration:" -ForegroundColor Cyan
Write-Host "  REDIS_HOST: $env:REDIS_HOST" -ForegroundColor White
Write-Host "  REDIS_PORT: $env:REDIS_PORT" -ForegroundColor White
Write-Host "  REDIS_PASSWORD: $env:REDIS_PASSWORD" -ForegroundColor White
Write-Host ""

# Test Redis connection
Write-Host "🧪 Testing Redis connection..." -ForegroundColor Yellow

try {
    # Try to connect to Redis
    $redisTest = Test-NetConnection -ComputerName $env:REDIS_HOST -Port $env:REDIS_PORT -InformationLevel Quiet
    if ($redisTest) {
        Write-Host "✅ Redis connection successful!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Redis connection failed. Make sure Redis is running." -ForegroundColor Yellow
        Write-Host "   Install Redis: choco install redis-64" -ForegroundColor Cyan
        Write-Host "   Or use free cloud Redis: https://upstash.com/" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Could not test Redis connection: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start your JamStockAnalytics server" -ForegroundColor White
Write-Host "2. Test the API endpoints" -ForegroundColor White
Write-Host "3. Check cache performance" -ForegroundColor White
Write-Host ""
Write-Host "📚 For more details, see REDIS_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Redis caching setup complete!" -ForegroundColor Green
