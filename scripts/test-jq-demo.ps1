# =============================================
# JQ VALIDATION DEMO
# =============================================

Write-Host "🔍 jq Validation Demo" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

# Check if jq is installed
try {
    $jqVersion = jq --version
    Write-Host "✅ jq version: $jqVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ jq is not installed. Please install jq first:" -ForegroundColor Red
    Write-Host "   Windows: winget install jqlang.jq" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Create JSON configuration
$configJson = @'
{
  "required_secrets": {
    "SUPABASE_HOST": {
      "description": "Supabase host URL",
      "pattern": "^https?://.+",
      "min_length": 10,
      "example": "https://your-project-ref.supabase.co"
    },
    "SUPABASE_PASSWORD": {
      "description": "Supabase database password",
      "min_length": 8,
      "example": "your-secure-password"
    },
    "LOCATION": {
      "description": "Deployment location",
      "pattern": "^[a-zA-Z0-9\\-_]+$",
      "min_length": 2,
      "example": "us-east-1"
    }
  },
  "optional_secrets": {
    "SUPABASE_URL": {
      "description": "Supabase project URL",
      "pattern": "^https://[a-zA-Z0-9\\-]+\\.supabase\\.co$",
      "min_length": 20,
      "example": "https://your-project-ref.supabase.co"
    },
    "DEEPSEEK_API_KEY": {
      "description": "DeepSeek API key for AI features",
      "pattern": "^sk-",
      "min_length": 20,
      "example": "sk-your-deepseek-api-key"
    }
  }
}
'@

# Save config to temporary file
$configPath = [System.IO.Path]::GetTempFileName()
$configJson | Out-File -FilePath $configPath -Encoding UTF8

Write-Host "📋 Testing jq JSON processing:" -ForegroundColor Blue

# Test 1: Parse configuration
Write-Host "🔍 Test 1: Parse configuration JSON" -ForegroundColor Blue
$requiredSecrets = jq -r '.required_secrets | keys[]' $configPath
Write-Host "Required secrets: $($requiredSecrets -join ', ')" -ForegroundColor Green

# Test 2: Validate environment variables
Write-Host ""
Write-Host "🔍 Test 2: Validate environment variables" -ForegroundColor Blue

$envVars = @{
    "SUPABASE_HOST" = $env:SUPABASE_HOST
    "SUPABASE_PASSWORD" = $env:SUPABASE_PASSWORD
    "LOCATION" = $env:LOCATION
    "SUPABASE_URL" = $env:SUPABASE_URL
    "DEEPSEEK_API_KEY" = $env:DEEPSEEK_API_KEY
}

foreach ($secret in $requiredSecrets) {
    $value = $envVars[$secret]
    
    Write-Host "🔍 Validating $secret..." -ForegroundColor Blue
    
    if ([string]::IsNullOrEmpty($value)) {
        Write-Host "❌ $secret is not set" -ForegroundColor Red
    } else {
        # Get validation rules using jq
        $rules = jq -r ".required_secrets.\"$secret\"" $configPath
        $description = ($rules | jq -r '.description')
        $minLength = [int]($rules | jq -r '.min_length // 0')
        $example = ($rules | jq -r '.example')
        
        Write-Host "   Description: $description" -ForegroundColor Cyan
        Write-Host "   Min Length: $minLength" -ForegroundColor Cyan
        Write-Host "   Example: $example" -ForegroundColor Cyan
        
        # Check for placeholder text using jq
        $hasPlaceholder = $value | jq -R 'contains("your-") or contains("placeholder") or contains("example")'
        if ($hasPlaceholder -eq "true") {
            Write-Host "❌ $secret appears to contain placeholder text" -ForegroundColor Red
        } else {
            # Check length using jq
            $actualLength = ($value | jq -R 'length')
            if ([int]$actualLength -lt $minLength) {
                Write-Host "❌ $secret is too short ($actualLength/$minLength characters)" -ForegroundColor Red
            } else {
                Write-Host "✅ $secret is properly configured ($actualLength characters)" -ForegroundColor Green
            }
        }
    }
    Write-Host ""
}

# Test 3: Pattern matching with jq
Write-Host "🔍 Test 3: Pattern matching with jq" -ForegroundColor Blue

$testValues = @(
    "https://test-project.supabase.co",
    "invalid-url",
    "sk-12345678901234567890",
    "invalid-key"
)

$patterns = @(
    "^https?://.+",
    "^sk-"
)

foreach ($value in $testValues) {
    Write-Host "Testing value: $value" -ForegroundColor Cyan
    
    foreach ($pattern in $patterns) {
        $matches = $value | jq -R --arg pattern $pattern 'test($pattern)'
        if ($matches -eq "true") {
            Write-Host "  ✅ Matches pattern: $pattern" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Does not match pattern: $pattern" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# Test 4: Generate JSON report
Write-Host "🔍 Test 4: Generate JSON report" -ForegroundColor Blue

$report = @{
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    environment = $envVars
    validation_config = ($configJson | ConvertFrom-Json)
    summary = @{
        total_required = 3
        total_optional = 2
        required_set = 0
        optional_set = 0
    }
}

# Count set secrets using jq
foreach ($secret in $requiredSecrets) {
    if (-not [string]::IsNullOrEmpty($envVars[$secret])) {
        $report.summary.required_set++
    }
}

$optionalSecrets = jq -r '.optional_secrets | keys[]' $configPath
foreach ($secret in $optionalSecrets) {
    if (-not [string]::IsNullOrEmpty($envVars[$secret])) {
        $report.summary.optional_set++
    }
}

$reportJson = $report | ConvertTo-Json -Depth 10
Write-Host "Generated JSON report:" -ForegroundColor Green
Write-Host $reportJson -ForegroundColor White

# Test 5: URL parsing with jq
Write-Host ""
Write-Host "🔍 Test 5: URL parsing with jq" -ForegroundColor Blue

$testUrl = "https://test-project.supabase.co:443/api/v1"
Write-Host "Testing URL: $testUrl" -ForegroundColor Cyan

$parsedUrl = "`"$testUrl`"" | jq -r '{
    protocol: split("://")[0],
    hostname: split("://")[1] | split("/")[0] | split(":")[0],
    port: (split("://")[1] | split("/")[0] | if contains(":") then split(":")[1] else (if startswith("https://") then 443 else 80 end) end),
    path: (split("://")[1] | split("/")[1:])
}'

Write-Host "Parsed URL components:" -ForegroundColor Green
Write-Host $parsedUrl -ForegroundColor White

# Clean up
Remove-Item $configPath -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎉 jq validation demo complete!" -ForegroundColor Green
Write-Host "✅ jq is working perfectly for JSON processing!" -ForegroundColor Green
