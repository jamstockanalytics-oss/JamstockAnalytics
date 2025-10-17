# Simple JWT Token Verification for Supabase
# JamStockAnalytics

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

Write-Host "JWT Token Verification for Supabase" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

if (-not $SUPABASE_URL -or -not $SUPABASE_ANON_KEY) {
    Write-Host "Error: Supabase credentials not found" -ForegroundColor Red
    exit 1
}

Write-Host "Supabase URL: $SUPABASE_URL" -ForegroundColor Green
Write-Host "Anon Key: $($SUPABASE_ANON_KEY.Substring(0,20))..." -ForegroundColor Green

# Get JWT token from user
$JWT_TOKEN = Read-Host "Enter your JWT token"

if (-not $JWT_TOKEN) {
    Write-Host "No JWT token provided" -ForegroundColor Red
    exit 1
}

Write-Host "Verifying JWT token..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $JWT_TOKEN"
        "apikey" = $SUPABASE_ANON_KEY
        "Content-Type" = "application/json"
    }
    
    $userEndpoint = "$SUPABASE_URL/auth/v1/user"
    
    $response = Invoke-RestMethod -Uri $userEndpoint -Method GET -Headers $headers
    
    Write-Host "JWT Token Verification Successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "User Information:" -ForegroundColor Cyan
    Write-Host "ID: $($response.id)" -ForegroundColor White
    Write-Host "Email: $($response.email)" -ForegroundColor White
    Write-Host "Created: $($response.created_at)" -ForegroundColor White
    Write-Host "Last Sign In: $($response.last_sign_in_at)" -ForegroundColor White
    
} catch {
    Write-Host "JWT Token Verification Failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
