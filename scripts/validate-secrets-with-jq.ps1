# =============================================
# SUPABASE SECRETS VALIDATION WITH JQ (PowerShell)
# =============================================
# Advanced validation using jq for JSON processing

param(
    [switch]$GenerateReport,
    [string]$OutputPath = "secrets-validation-report.json"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

Write-Host "🔍 Validating Supabase Secrets with jq" -ForegroundColor $Cyan
Write-Host "=====================================" -ForegroundColor $Cyan
Write-Host ""

# Check if jq is installed
try {
    $jqVersion = jq --version
    Write-Host "✅ jq version: $jqVersion" -ForegroundColor $Green
} catch {
    Write-Host "❌ jq is not installed. Please install jq first:" -ForegroundColor $Red
    Write-Host "   Windows: winget install jqlang.jq" -ForegroundColor $Yellow
    Write-Host "   macOS: brew install jq" -ForegroundColor $Yellow
    Write-Host "   Linux: apt-get install jq" -ForegroundColor $Yellow
    exit 1
}

Write-Host ""

# Create JSON configuration for validation
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
    "SUPABASE_ANON_KEY": {
      "description": "Supabase anonymous key",
      "min_length": 100,
      "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "SUPABASE_SERVICE_ROLE_KEY": {
      "description": "Supabase service role key",
      "min_length": 100,
      "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "DEEPSEEK_API_KEY": {
      "description": "DeepSeek API key for AI features",
      "pattern": "^sk-",
      "min_length": 20,
      "example": "sk-your-deepseek-api-key"
    },
    "EXPO_TOKEN": {
      "description": "Expo token for builds",
      "min_length": 20,
      "example": "your-expo-token"
    }
  }
}
'@

# Save config to temporary file
$configPath = [System.IO.Path]::GetTempFileName()
$configJson | Out-File -FilePath $configPath -Encoding UTF8

# Function to validate a secret using jq
function Validate-SecretWithJq {
    param(
        [string]$SecretName,
        [string]$SecretValue,
        [string]$ConfigType
    )
    
    # Get validation rules from JSON config using jq
    $rulesJson = jq -r ".$ConfigType.\"$SecretName\"" $configPath
    
    if ($rulesJson -eq "null") {
        Write-Host "❌ Unknown secret: $SecretName" -ForegroundColor $Red
        return $false
    }
    
    $description = ($rulesJson | jq -r '.description')
    $pattern = ($rulesJson | jq -r '.pattern // empty')
    $minLength = [int]($rulesJson | jq -r '.min_length // 0')
    $example = ($rulesJson | jq -r '.example')
    
    Write-Host "🔍 Validating $SecretName`: $description" -ForegroundColor $Blue
    
    # Check if secret is set
    if ([string]::IsNullOrEmpty($SecretValue)) {
        Write-Host "❌ $SecretName is not set" -ForegroundColor $Red
        return $false
    }
    
    # Check for placeholder values using jq
    $hasPlaceholder = $SecretValue | jq -R 'contains("your-") or contains("placeholder") or contains("example")'
    if ($hasPlaceholder -eq "true") {
        Write-Host "❌ $SecretName appears to contain placeholder text" -ForegroundColor $Red
        return $false
    }
    
    # Check minimum length
    $actualLength = ($SecretValue | jq -R 'length')
    if ([int]$actualLength -lt $minLength) {
        Write-Host "❌ $SecretName is too short ($actualLength/$minLength characters)" -ForegroundColor $Red
        return $false
    }
    
    # Check pattern if specified
    if (-not [string]::IsNullOrEmpty($pattern) -and $pattern -ne "null") {
        $matchesPattern = $SecretValue | jq -R --arg pattern $pattern 'test($pattern)'
        if ($matchesPattern -ne "true") {
            Write-Host "❌ $SecretName does not match expected pattern" -ForegroundColor $Red
            Write-Host "   Expected format: $example" -ForegroundColor $Yellow
            return $false
        }
    }
    
    Write-Host "✅ $SecretName is properly configured ($actualLength characters)" -ForegroundColor $Green
    return $true
}

# Function to create environment JSON
function Create-EnvironmentJson {
    $envJson = @{}
    
    # Get all environment variables that match our patterns
    Get-ChildItem Env: | Where-Object { 
        $_.Name -match '^(SUPABASE_|LOCATION|DEEPSEEK_|EXPO_)' 
    } | ForEach-Object {
        $envJson[$_.Name] = $_.Value
    }
    
    return ($envJson | ConvertTo-Json -Depth 10)
}

# Function to validate all secrets using jq
function Validate-AllSecrets {
    Write-Host "📋 Creating environment JSON..." -ForegroundColor $Blue
    $envJson = Create-EnvironmentJson
    
    Write-Host "📋 Validating required secrets:" -ForegroundColor $Blue
    $requiredErrors = 0
    $requiredSecrets = jq -r '.required_secrets | keys[]' $configPath
    
    foreach ($secret in $requiredSecrets) {
        $value = ($envJson | jq -r ".\"$secret\" // empty")
        if (-not (Validate-SecretWithJq $secret $value "required_secrets")) {
            $requiredErrors++
        }
        Write-Host ""
    }
    
    Write-Host "📋 Validating optional secrets:" -ForegroundColor $Blue
    $optionalErrors = 0
    $optionalSecrets = jq -r '.optional_secrets | keys[]' $configPath
    
    foreach ($secret in $optionalSecrets) {
        $value = ($envJson | jq -r ".\"$secret\" // empty")
        if (-not (Validate-SecretWithJq $secret $value "optional_secrets")) {
            $optionalErrors++
        }
        Write-Host ""
    }
    
    # Generate summary using jq
    $totalRequired = ($requiredSecrets | Measure-Object).Count
    $totalOptional = ($optionalSecrets | Measure-Object).Count
    $requiredPassed = $totalRequired - $requiredErrors
    $optionalPassed = $totalOptional - $optionalErrors
    
    Write-Host "📊 Validation Summary:" -ForegroundColor $Blue
    Write-Host "  Required secrets: $requiredPassed/$totalRequired passed"
    Write-Host "  Optional secrets: $optionalPassed/$totalOptional configured"
    Write-Host "  Total errors: $($requiredErrors + $optionalErrors)"
    
    # Check for critical issues
    if ($requiredErrors -gt 0) {
        Write-Host ""
        Write-Host "❌ Validation failed with errors:" -ForegroundColor $Red
        Write-Host "   Required secrets are missing or invalid" -ForegroundColor $Red
        Write-Host ""
        Write-Host "💡 To fix these issues:" -ForegroundColor $Blue
        Write-Host "  1. Set the required secrets in GitHub repository settings"
        Write-Host "  2. Go to Settings → Secrets and variables → Actions"
        Write-Host "  3. Add the missing secrets with their values"
        Write-Host "  4. Re-run this workflow"
        return $false
    }
    
    if ($optionalErrors -gt 0) {
        Write-Host ""
        Write-Host "⚠️  Validation completed with warnings:" -ForegroundColor $Yellow
        Write-Host "   Some optional secrets have issues but are not required" -ForegroundColor $Yellow
    }
    
    Write-Host ""
    Write-Host "✅ All required secrets are properly configured!" -ForegroundColor $Green
    Write-Host "🔒 Your Supabase project is ready for deployment." -ForegroundColor $Green
    
    return $true
}

# Function to generate JSON report
function Generate-JsonReport {
    param([string]$OutputPath)
    
    $envJson = Create-EnvironmentJson
    $configContent = Get-Content $configPath -Raw
    $timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    
    $report = @{
        timestamp = $timestamp
        environment = ($envJson | ConvertFrom-Json)
        validation_config = ($configContent | ConvertFrom-Json)
        summary = @{
            total_required = ($configContent | ConvertFrom-Json).required_secrets.PSObject.Properties.Count
            total_optional = ($configContent | ConvertFrom-Json).optional_secrets.PSObject.Properties.Count
            required_set = 0
            optional_set = 0
        }
    }
    
    # Count set secrets
    $envObj = $envJson | ConvertFrom-Json
    foreach ($secret in ($configContent | ConvertFrom-Json).required_secrets.PSObject.Properties.Name) {
        if (-not [string]::IsNullOrEmpty($envObj.$secret)) {
            $report.summary.required_set++
        }
    }
    
    foreach ($secret in ($configContent | ConvertFrom-Json).optional_secrets.PSObject.Properties.Name) {
        if (-not [string]::IsNullOrEmpty($envObj.$secret)) {
            $report.summary.optional_set++
        }
    }
    
    $report | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputPath -Encoding UTF8
    Write-Host "📄 JSON report saved to $OutputPath" -ForegroundColor $Green
}

# Function to test Supabase connection
function Test-ConnectionWithJq {
    param([string]$SupabaseHost)
    
    if ([string]::IsNullOrEmpty($SupabaseHost)) {
        Write-Host "⚠️  Cannot test connection: SUPABASE_HOST not set" -ForegroundColor $Yellow
        return
    }
    
    Write-Host "🔗 Testing connection to Supabase..." -ForegroundColor $Blue
    
    try {
        # Parse URL using jq
        $parsedUrl = "`"$SupabaseHost`"" | jq -r '{
            protocol: split("://")[0],
            hostname: split("://")[1] | split("/")[0],
            port: (if contains(":") then split(":")[1] | split("/")[0] else (if startswith("https://") then 443 else 80 end) end)
        }'
        
        $hostname = ($parsedUrl | jq -r '.hostname')
        $port = ($parsedUrl | jq -r '.port')
        
        Write-Host "   Hostname: $hostname" -ForegroundColor $Blue
        Write-Host "   Port: $port" -ForegroundColor $Blue
        
        # Test connection using Test-NetConnection
        $connection = Test-NetConnection -ComputerName $hostname -Port $port -WarningAction SilentlyContinue
        
        if ($connection.TcpTestSucceeded) {
            Write-Host "✅ Supabase connection successful" -ForegroundColor $Green
            
            # Try to get health endpoint if available
            $healthUrl = "$SupabaseHost/health"
            Write-Host "   Testing health endpoint: $healthUrl" -ForegroundColor $Blue
            
            try {
                $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response) {
                    Write-Host "✅ Health endpoint responded" -ForegroundColor $Green
                }
            } catch {
                Write-Host "⚠️  Health endpoint not available (this is normal)" -ForegroundColor $Yellow
            }
        } else {
            Write-Host "⚠️  Could not test connection to Supabase" -ForegroundColor $Yellow
            Write-Host "   This is normal if the host is not reachable or firewall blocks the connection" -ForegroundColor $Yellow
        }
    } catch {
        Write-Host "⚠️  Could not test connection: $($_.Exception.Message)" -ForegroundColor $Yellow
    }
}

# Main execution
try {
    # Validate all secrets
    if (Validate-AllSecrets) {
        # Test connection if in CI environment
        if ($env:CI -eq "true" -or $env:GITHUB_ACTIONS -eq "true") {
            Test-ConnectionWithJq $env:SUPABASE_HOST
        }
        
        # Generate JSON report if requested
        if ($GenerateReport) {
            Generate-JsonReport $OutputPath
        }
        
        # Clean up
        Remove-Item $configPath -ErrorAction SilentlyContinue
        
        exit 0
    } else {
        # Clean up on failure
        Remove-Item $configPath -ErrorAction SilentlyContinue
        
        exit 1
    }
} catch {
    Write-Host "❌ Error during validation: $($_.Exception.Message)" -ForegroundColor $Red
    Remove-Item $configPath -ErrorAction SilentlyContinue
    exit 1
}
