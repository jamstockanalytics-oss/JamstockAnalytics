# docker-troubleshoot.ps1

Write-Host "🔍 Docker Connection Troubleshooting" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check Docker status
Write-Host "📊 Docker status:" -ForegroundColor Yellow
try {
    docker --version
    docker info | Select-String "Server Version"
} catch {
    Write-Host "❌ Docker not running or not installed" -ForegroundColor Red
    exit 1
}

# Check running containers
Write-Host "📦 Running containers:" -ForegroundColor Yellow
docker ps

# Check if our container exists
Write-Host "🔍 Checking jamstock-test container:" -ForegroundColor Yellow
$containerExists = docker ps -a --filter "name=jamstock-test" --format "{{.Names}}" | Select-String "jamstock-test"
if ($containerExists) {
    Write-Host "✅ Container exists" -ForegroundColor Green
    docker ps -a --filter "name=jamstock-test" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
} else {
    Write-Host "❌ Container not found" -ForegroundColor Red
}

# Check port usage
Write-Host "🔌 Port 8081 usage:" -ForegroundColor Yellow
netstat -an | Select-String ":8081"

# Test container health
Write-Host "🏥 Container health:" -ForegroundColor Yellow
$containerRunning = docker ps --filter "name=jamstock-test" --format "{{.Names}}" | Select-String "jamstock-test"
if ($containerRunning) {
    Write-Host "✅ Container is running" -ForegroundColor Green
    try {
        docker exec jamstock-test wget --spider http://localhost/ 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ nginx is responding" -ForegroundColor Green
        } else {
            Write-Host "❌ nginx not responding" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Cannot test nginx inside container" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Container is not running" -ForegroundColor Red
}

# Test external access
Write-Host "🌐 Testing external access:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:8081 -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ External access working" -ForegroundColor Green
    } else {
        Write-Host "❌ External access failed with status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ External access failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎯 Troubleshooting complete" -ForegroundColor Green

# Quick fix suggestions
Write-Host "`n🔧 Quick Fix Suggestions:" -ForegroundColor Cyan
Write-Host "1. If container is not running:" -ForegroundColor White
Write-Host "   docker run -d --name jamstock-test -p 8081:80 jamstockanalytics:test" -ForegroundColor Gray
Write-Host "`n2. If port 8081 is busy, try port 8082:" -ForegroundColor White
Write-Host "   docker stop jamstock-test" -ForegroundColor Gray
Write-Host "   docker rm jamstock-test" -ForegroundColor Gray
Write-Host "   docker run -d --name jamstock-test -p 8082:80 jamstockanalytics:test" -ForegroundColor Gray
Write-Host "`n3. If Docker Desktop is not running:" -ForegroundColor White
Write-Host "   Start Docker Desktop from Start Menu" -ForegroundColor Gray
Write-Host "`n4. Test in browser:" -ForegroundColor White
Write-Host "   Open http://localhost:8081 in your browser" -ForegroundColor Gray
