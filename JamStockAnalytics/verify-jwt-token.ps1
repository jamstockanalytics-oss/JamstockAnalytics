# =====================================================
# JWT Token Verification Script for Supabase
# JamStockAnalytics - Verify JWT token maps to user ID
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

Write-Host "🔐 JWT Token Verification for Supabase" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if credentials are available
if (-not $SUPABASE_URL -or -not $SUPABASE_ANON_KEY) {
    Write-Host "❌ Error: Supabase credentials not found in environment variables" -ForegroundColor Red
    Write-Host "Please check your .env file" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase URL: $SUPABASE_URL" -ForegroundColor Green
Write-Host "✅ Anon Key: $($SUPABASE_ANON_KEY.Substring(0,20))..." -ForegroundColor Green
Write-Host ""

# Function to verify JWT token
function Test-JWTToken {
    param(
        [string]$JWT_TOKEN
    )
    
    if (-not $JWT_TOKEN) {
        Write-Host "❌ No JWT token provided" -ForegroundColor Red
        return
    }
    
    Write-Host "🔍 Verifying JWT token..." -ForegroundColor Yellow
    Write-Host "Token: $($JWT_TOKEN.Substring(0,20))..." -ForegroundColor Gray
    Write-Host ""
    
    try {
        # Make the API call to verify the token
        $headers = @{
            "Authorization" = "Bearer $JWT_TOKEN"
            "apikey" = $SUPABASE_ANON_KEY
            "Content-Type" = "application/json"
        }
        
        $userEndpoint = "$SUPABASE_URL/auth/v1/user"
        
        Write-Host "📡 Making request to: $userEndpoint" -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri $userEndpoint -Method GET -Headers $headers
        
        Write-Host "✅ JWT Token Verification Successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 User Information:" -ForegroundColor Cyan
        Write-Host "   ID: $($response.id)" -ForegroundColor White
        Write-Host "   Email: $($response.email)" -ForegroundColor White
        Write-Host "   Created: $($response.created_at)" -ForegroundColor White
        Write-Host "   Last Sign In: $($response.last_sign_in_at)" -ForegroundColor White
        Write-Host "   Email Confirmed: $($response.email_confirmed_at)" -ForegroundColor White
        
        return $response
        
    } catch {
        Write-Host "❌ JWT Token Verification Failed!" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "Status Code: $statusCode" -ForegroundColor Red
        }
        
        return $null
    }
}

# Function to create a test user and get JWT token
function New-TestUser {
    Write-Host "👤 Creating test user for JWT verification..." -ForegroundColor Yellow
    
    $testEmail = "test-user-$(Get-Random)@jamstockanalytics.com"
    $testPassword = "TestPassword123!"
    
    Write-Host "Test Email: $testEmail" -ForegroundColor Gray
    Write-Host ""
    
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
        Write-Host "Access Token: $($response.access_token.Substring(0,20))..." -ForegroundColor Gray
        Write-Host ""
        
        return $response.access_token
        
    } catch {
        Write-Host "❌ Failed to create test user" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to login existing user
function Connect-User {
    param(
        [string]$Email,
        [SecureString]$Password
    )
    
    Write-Host "🔐 Logging in user..." -ForegroundColor Yellow
    
    try {
        # Convert SecureString to plain text for API call
        $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password))
        
        $loginEndpoint = "$SUPABASE_URL/auth/v1/token?grant_type=password"
        $headers = @{
            "apikey" = $SUPABASE_ANON_KEY
            "Content-Type" = "application/json"
        }
        
        $body = @{
            email = $Email
            password = $plainPassword
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $loginEndpoint -Method POST -Headers $headers -Body $body
        
        Write-Host "✅ Login successful!" -ForegroundColor Green
        Write-Host "Access Token: $($response.access_token.Substring(0,20))..." -ForegroundColor Gray
        Write-Host ""
        
        return $response.access_token
        
    } catch {
        Write-Host "❌ Login failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Main execution
Write-Host "🎯 Choose an option:" -ForegroundColor Cyan
Write-Host "1. Test with existing JWT token" -ForegroundColor White
Write-Host "2. Create test user and get JWT token" -ForegroundColor White
Write-Host "3. Login existing user" -ForegroundColor White
Write-Host "4. Test with service role key" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        $jwtToken = Read-Host "Enter your JWT token"
        Test-JWTToken -JWT_TOKEN $jwtToken
    }
    "2" {
        $jwtToken = New-TestUser
        if ($jwtToken) {
            Test-JWTToken -JWT_TOKEN $jwtToken
        }
    }
    "3" {
        $email = Read-Host "Enter email"
        $password = Read-Host "Enter password" -AsSecureString
        $jwtToken = Connect-User -Email $email -Password $password
        if ($jwtToken) {
            Test-JWTToken -JWT_TOKEN $jwtToken
        }
    }
    "4" {
        Write-Host "🔧 Testing with service role key..." -ForegroundColor Yellow
        $SERVICE_ROLE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY
        if ($SERVICE_ROLE_KEY) {
            Test-JWTToken -JWT_TOKEN $SERVICE_ROLE_KEY
        } else {
            Write-Host "❌ Service role key not found" -ForegroundColor Red
        }
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 JWT Token verification complete!" -ForegroundColor Green
