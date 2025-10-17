# Create Test User and Verify JWT Token
# JamStockAnalytics - Complete JWT verification demo

# Load environment variables
$envFile = ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

$SUPABASE_URL = $env:EXPO_PUBLIC_SUPABASE_URL
$SUPABASE_ANON_KEY = $env:EXPO_PUBLIC_SUPABASE_ANON_KEY

Write-Host "JWT Token Verification Demo" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create a test user
Write-Host "Step 1: Creating test user..." -ForegroundColor Yellow

$testEmail = "test-user-$(Get-Random)@jamstockanalytics.com"
$testPassword = "TestPassword123!"

Write-Host "Test Email: $testEmail" -ForegroundColor Gray

try {
    $signupEndpoint = "$SUPABASE_URL/auth/v1/signup"
    $headers = @{
        "apikey" = $SUPABASE_ANON_KEY
        "Content-Type" = "application/json"
    }
    
    $body = @{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri $signupEndpoint -Method POST -Headers $headers -Body $body
    
    Write-Host "✅ Test user created successfully!" -ForegroundColor Green
    Write-Host "User ID: $($response.user.id)" -ForegroundColor White
    Write-Host "Access Token: $($response.access_token.Substring(0,30))..." -ForegroundColor Gray
    
    $jwtToken = $response.access_token
    
    Write-Host ""
    Write-Host "Step 2: Verifying JWT token..." -ForegroundColor Yellow
    
    # Step 2: Verify the JWT token
    $verifyHeaders = @{
        "Authorization" = "Bearer $jwtToken"
        "apikey" = $SUPABASE_ANON_KEY
        "Content-Type" = "application/json"
    }
    
    $userEndpoint = "$SUPABASE_URL/auth/v1/user"
    
    $verifyResponse = Invoke-RestMethod -Uri $userEndpoint -Method GET -Headers $verifyHeaders
    
    Write-Host "✅ JWT Token Verification Successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "User Information:" -ForegroundColor Cyan
    Write-Host "ID: $($verifyResponse.id)" -ForegroundColor White
    Write-Host "Email: $($verifyResponse.email)" -ForegroundColor White
    Write-Host "Created: $($verifyResponse.created_at)" -ForegroundColor White
    
    Write-Host ""
    Write-Host "Step 3: Testing cURL command..." -ForegroundColor Yellow
    
    # Step 3: Show the equivalent cURL command
    $curlCommand = "curl -H `"Authorization: Bearer $jwtToken`" `"$SUPABASE_URL/auth/v1/user`" -H `"apikey: $SUPABASE_ANON_KEY`""
    
    Write-Host "cURL Command:" -ForegroundColor Cyan
    Write-Host $curlCommand -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "🎉 Complete JWT verification demo successful!" -ForegroundColor Green
    Write-Host "The JWT token successfully maps to user ID: $($verifyResponse.id)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
