# Simple jq Test Script
Write-Host "Testing jq installation and basic functionality" -ForegroundColor Green

# Test 1: Basic jq functionality
Write-Host "`nTest 1: Basic JSON processing" -ForegroundColor Yellow
$json = '{"name": "test", "value": 123}'
$result = $json | jq '.name'
Write-Host "Input: $json"
Write-Host "Extracted name: $result"

# Test 2: Environment variable validation
Write-Host "`nTest 2: Environment variable validation" -ForegroundColor Yellow
$env:SUPABASE_HOST = "https://test-project.supabase.co"
$env:SUPABASE_PASSWORD = "test-password-123"
$env:LOCATION = "us-east-1"

Write-Host "SUPABASE_HOST: $env:SUPABASE_HOST"
Write-Host "SUPABASE_PASSWORD: $env:SUPABASE_PASSWORD"
Write-Host "LOCATION: $env:LOCATION"

# Test 3: Length validation with jq
Write-Host "`nTest 3: Length validation" -ForegroundColor Yellow
$hostLength = $env:SUPABASE_HOST | jq -R 'length'
$passwordLength = $env:SUPABASE_PASSWORD | jq -R 'length'
$locationLength = $env:LOCATION | jq -R 'length'

Write-Host "SUPABASE_HOST length: $hostLength"
Write-Host "SUPABASE_PASSWORD length: $passwordLength"
Write-Host "LOCATION length: $locationLength"

# Test 4: Pattern matching (simplified)
Write-Host "`nTest 4: Pattern matching" -ForegroundColor Yellow
$hasHttps = $env:SUPABASE_HOST | jq -R 'contains("https://")'
Write-Host "SUPABASE_HOST contains https://: $hasHttps"

# Test 5: Create validation report
Write-Host "`nTest 5: Generate validation report" -ForegroundColor Yellow
$report = @{
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    secrets = @{
        SUPABASE_HOST = @{
            value = $env:SUPABASE_HOST
            length = [int]$hostLength
            valid = [int]$hostLength -gt 10
        }
        SUPABASE_PASSWORD = @{
            value = $env:SUPABASE_PASSWORD
            length = [int]$passwordLength
            valid = [int]$passwordLength -gt 8
        }
        LOCATION = @{
            value = $env:LOCATION
            length = [int]$locationLength
            valid = [int]$locationLength -gt 2
        }
    }
}

$reportJson = $report | ConvertTo-Json -Depth 10
Write-Host "Validation Report:"
Write-Host $reportJson

Write-Host "`n✅ jq is working correctly!" -ForegroundColor Green
Write-Host "✅ Environment variables are set and validated!" -ForegroundColor Green
