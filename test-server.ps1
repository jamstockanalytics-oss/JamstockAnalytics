# test-server.ps1
# Test script for the HTTP server

Write-Host "🧪 Testing HTTP Server" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check (GET /)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/" -Method GET
    Write-Host "✅ Health Check Passed" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor White
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: API Endpoint
Write-Host "Test 2: API Endpoint (POST /foo)" -ForegroundColor Yellow
try {
    $body = @{name = "Alice"} | ConvertTo-Json
    $headers = @{"Content-Type" = "application/json"}
    $response = Invoke-RestMethod -Uri "http://localhost:8080/foo" -Method POST -Body $body -Headers $headers
    Write-Host "✅ API Endpoint Passed" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor White
} catch {
    Write-Host "❌ API Endpoint Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Invalid JSON
Write-Host "Test 3: Invalid JSON Test" -ForegroundColor Yellow
try {
    $body = "invalid json"
    $headers = @{"Content-Type" = "application/json"}
    $response = Invoke-RestMethod -Uri "http://localhost:8080/foo" -Method POST -Body $body -Headers $headers
    Write-Host "❌ Should have failed with invalid JSON" -ForegroundColor Red
} catch {
    Write-Host "✅ Invalid JSON properly rejected" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Test 4: Missing name field
Write-Host "Test 4: Missing Name Field" -ForegroundColor Yellow
try {
    $body = @{} | ConvertTo-Json
    $headers = @{"Content-Type" = "application/json"}
    $response = Invoke-RestMethod -Uri "http://localhost:8080/foo" -Method POST -Body $body -Headers $headers
    Write-Host "❌ Should have failed with missing name" -ForegroundColor Red
} catch {
    Write-Host "✅ Missing name properly rejected" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Test 5: 404 Test
Write-Host "Test 5: 404 Not Found Test" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/nonexistent" -Method GET
    Write-Host "❌ Should have returned 404" -ForegroundColor Red
} catch {
    Write-Host "✅ 404 properly returned" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎉 Server testing complete!" -ForegroundColor Green
