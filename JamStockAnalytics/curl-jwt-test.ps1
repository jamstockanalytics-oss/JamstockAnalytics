# =====================================================
# Simple cURL JWT Token Verification
# JamStockAnalytics - Direct cURL command for JWT verification
# =====================================================

# Load environment variables
$envFile = ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Get Supabase configuration
$SUPABASE_URL = $env:EXPO_PUBLIC_SUPABASE_URL
$SUPABASE_ANON_KEY = $env:EXPO_PUBLIC_SUPABASE_ANON_KEY

Write-Host "🔐 JWT Token Verification with cURL" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if credentials are available
if (-not $SUPABASE_URL -or -not $SUPABASE_ANON_KEY) {
    Write-Host "❌ Error: Supabase credentials not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Supabase URL: $SUPABASE_URL" -ForegroundColor Green
Write-Host "✅ Anon Key: $($SUPABASE_ANON_KEY.Substring(0,20))..." -ForegroundColor Green
Write-Host ""

# Prompt for JWT token
$JWT_TOKEN = Read-Host "Enter your JWT token"

if (-not $JWT_TOKEN) {
    Write-Host "❌ No JWT token provided" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔍 Verifying JWT token with cURL..." -ForegroundColor Yellow
Write-Host "Token: $($JWT_TOKEN.Substring(0,20))..." -ForegroundColor Gray
Write-Host ""

# Construct the cURL command
$curlCommand = "curl -H `"Authorization: Bearer $JWT_TOKEN`" `"$SUPABASE_URL/auth/v1/user`" -H `"apikey: $SUPABASE_ANON_KEY`""

Write-Host "📡 cURL Command:" -ForegroundColor Cyan
Write-Host $curlCommand -ForegroundColor Gray
Write-Host ""

# Execute the cURL command
try {
    Write-Host "🚀 Executing cURL command..." -ForegroundColor Yellow
    
    $result = Invoke-Expression $curlCommand
    
    Write-Host "✅ cURL Command Executed Successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Response:" -ForegroundColor Cyan
    Write-Host $result -ForegroundColor White
    
} catch {
    Write-Host "❌ cURL Command Failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 JWT Token verification complete!" -ForegroundColor Green

# Also show the PowerShell equivalent
Write-Host ""
Write-Host "💡 PowerShell Equivalent:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""
Write-Host '$headers = @{'
Write-Host '    "Authorization" = "Bearer YOUR_JWT_TOKEN"'
Write-Host '    "apikey" = "YOUR_SUPABASE_ANON_KEY"'
Write-Host '}'
Write-Host ''
Write-Host '$response = Invoke-RestMethod -Uri "YOUR_SUPABASE_URL/auth/v1/user" -Headers $headers'
Write-Host '$response'
