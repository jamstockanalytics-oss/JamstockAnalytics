# =============================================
# SIMPLE SUPABASE SECRETS VALIDATION WITH JQ
# =============================================

Write-Host "🔍 Validating Supabase Secrets with jq" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
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

Write-Host "📋 Validating required secrets:" -ForegroundColor Blue

$requiredErrors = 0
$requiredSecrets = @("SUPABASE_HOST", "SUPABASE_PASSWORD", "LOCATION")

foreach ($secret in $requiredSecrets) {
    $value = [Environment]::GetEnvironmentVariable($secret)
    
    Write-Host "🔍 Validating $secret..." -ForegroundColor Blue
    
    if ([string]::IsNullOrEmpty($value)) {
        Write-Host "❌ $secret is not set" -ForegroundColor Red
        $requiredErrors++
    } elseif ($value -match "your-|placeholder|example") {
        Write-Host "❌ $secret appears to contain placeholder text" -ForegroundColor Red
        $requiredErrors++
    } else {
        $length = $value.Length
        
        # Get validation rules from JSON
        $rules = jq -r ".required_secrets.\"$secret\"" $configPath
        $minLength = [int]($rules | jq -r '.min_length // 0')
        
        if ($length -lt $minLength) {
            Write-Host "❌ $secret is too short ($length/$minLength characters)" -ForegroundColor Red
            $requiredErrors++
        } else {
            Write-Host "✅ $secret is properly configured ($length characters)" -ForegroundColor Green
        }
    }
    Write-Host ""
}

Write-Host "📋 Validating optional secrets:" -ForegroundColor Blue

$optionalErrors = 0
$optionalSecrets = @("SUPABASE_URL", "DEEPSEEK_API_KEY")

foreach ($secret in $optionalSecrets) {
    $value = [Environment]::GetEnvironmentVariable($secret)
    
    Write-Host "🔍 Validating $secret..." -ForegroundColor Blue
    
    if ([string]::IsNullOrEmpty($value)) {
        Write-Host "⚠️  $secret is optional and not set" -ForegroundColor Yellow
    } elseif ($value -match "your-|placeholder|example") {
        Write-Host "❌ $secret appears to contain placeholder text" -ForegroundColor Red
        $optionalErrors++
    } else {
        $length = $value.Length
        
        # Get validation rules from JSON
        $rules = jq -r ".optional_secrets.\"$secret\"" $configPath
        $minLength = [int]($rules | jq -r '.min_length // 0')
        
        if ($length -lt $minLength) {
            Write-Host "❌ $secret is too short ($length/$minLength characters)" -ForegroundColor Red
            $optionalErrors++
        } else {
            Write-Host "✅ $secret is properly configured ($length characters)" -ForegroundColor Green
        }
    }
    Write-Host ""
}

# Summary
Write-Host "📊 Validation Summary:" -ForegroundColor Blue
Write-Host "  Required secrets: $($requiredSecrets.Count - $requiredErrors)/$($requiredSecrets.Count) passed"
Write-Host "  Optional secrets: $($optionalSecrets.Count - $optionalErrors)/$($optionalSecrets.Count) configured"
Write-Host "  Total errors: $($requiredErrors + $optionalErrors)"

if ($requiredErrors -gt 0) {
    Write-Host ""
    Write-Host "❌ Validation failed with errors:" -ForegroundColor Red
    Write-Host "   Required secrets are missing or invalid" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 To fix these issues:" -ForegroundColor Blue
    Write-Host "  1. Set the required secrets in GitHub repository settings"
    Write-Host "  2. Go to Settings → Secrets and variables → Actions"
    Write-Host "  3. Add the missing secrets with their values"
    Write-Host "  4. Re-run this workflow"
    
    # Clean up
    Remove-Item $configPath -ErrorAction SilentlyContinue
    exit 1
}

if ($optionalErrors -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Validation completed with warnings:" -ForegroundColor Yellow
    Write-Host "   Some optional secrets have issues but are not required" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ All required secrets are properly configured!" -ForegroundColor Green
Write-Host "🔒 Your Supabase project is ready for deployment." -ForegroundColor Green

# Test connection if SUPABASE_HOST is set
$supabaseHost = [Environment]::GetEnvironmentVariable("SUPABASE_HOST")
if (-not [string]::IsNullOrEmpty($supabaseHost)) {
    Write-Host ""
    Write-Host "🔗 Testing connection to Supabase..." -ForegroundColor Blue
    
    try {
        # Parse URL using jq
        $parsedUrl = "`"$supabaseHost`"" | jq -r '{
            protocol: split("://")[0],
            hostname: split("://")[1] | split("/")[0],
            port: (if contains(":") then split(":")[1] | split("/")[0] else (if startswith("https://") then 443 else 80 end) end)
        }'
        
        $hostname = ($parsedUrl | jq -r '.hostname')
        $port = ($parsedUrl | jq -r '.port')
        
        Write-Host "   Hostname: $hostname" -ForegroundColor Blue
        Write-Host "   Port: $port" -ForegroundColor Blue
        
        # Test connection
        $connection = Test-NetConnection -ComputerName $hostname -Port $port -WarningAction SilentlyContinue
        
        if ($connection.TcpTestSucceeded) {
            Write-Host "✅ Supabase connection successful" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Could not test connection to Supabase" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Could not test connection: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Clean up
Remove-Item $configPath -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎉 jq-based validation complete!" -ForegroundColor Green
