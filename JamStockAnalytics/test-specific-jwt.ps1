# Test Specific JWT Token
$JWT_TOKEN = "rgUNPEqwl+vMHhzwv9Kgiv6jC1I6WSHwTX7G1nmv4sdUQgbD3JRPCoNaTsZQFyHw7bjKv15+xz32myVhuY+rIg=="
$SUPABASE_URL = "https://ojatfvokildmngpzdutf.supabase.co"
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYXRmdm9raWxkbW5ncHpkdXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODc2OTcsImV4cCI6MjA3NTk2MzY5N30.SPFL5e1MWl3N1HGzYQx-T-AeTzail4vutCHNvhjyJqk"

Write-Host "Testing JWT Token Verification" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "JWT Token: $($JWT_TOKEN.Substring(0,20))..." -ForegroundColor Gray
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer $JWT_TOKEN"
        "apikey" = $SUPABASE_ANON_KEY
        "Content-Type" = "application/json"
    }
    
    $userEndpoint = "$SUPABASE_URL/auth/v1/user"
    Write-Host "Making request to: $userEndpoint" -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $userEndpoint -Method GET -Headers $headers
    
    Write-Host "✅ JWT Token Verification Successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "User Information:" -ForegroundColor Cyan
    Write-Host "ID: $($response.id)" -ForegroundColor White
    Write-Host "Email: $($response.email)" -ForegroundColor White
    Write-Host "Created: $($response.created_at)" -ForegroundColor White
    Write-Host "Last Sign In: $($response.last_sign_in_at)" -ForegroundColor White
    Write-Host "Email Confirmed: $($response.email_confirmed_at)" -ForegroundColor White
    
} catch {
    Write-Host "❌ JWT Token Verification Failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        # Try to get the response body
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read response body" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "Possible Issues:" -ForegroundColor Yellow
    Write-Host "1. JWT token is expired" -ForegroundColor White
    Write-Host "2. JWT token is invalid or malformed" -ForegroundColor White
    Write-Host "3. JWT token is not from this Supabase instance" -ForegroundColor White
    Write-Host "4. User account has been disabled" -ForegroundColor White
    Write-Host "5. Supabase auth configuration issue" -ForegroundColor White
}
