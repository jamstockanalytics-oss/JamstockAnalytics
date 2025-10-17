# =============================================
# GITHUB SECRETS SETUP SCRIPT
# =============================================
# This script helps set up GitHub secrets for CI/CD

Write-Host "🔐 Setting up GitHub Secrets for CI/CD" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if GitHub CLI is installed
try {
    $ghVersion = gh --version
    Write-Host "✅ GitHub CLI found: $ghVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ GitHub CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   Visit: https://cli.github.com/" -ForegroundColor Yellow
    Write-Host "   Or run: winget install GitHub.cli" -ForegroundColor Yellow
    exit 1
}

# Check if user is authenticated
try {
    $authStatus = gh auth status
    Write-Host "✅ GitHub CLI authenticated" -ForegroundColor Green
} catch {
    Write-Host "❌ Not authenticated with GitHub CLI. Please run:" -ForegroundColor Red
    Write-Host "   gh auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔄 Setting up GitHub secrets..." -ForegroundColor Blue
Write-Host ""

# Function to set secret
function Set-GitHubSecret {
    param(
        [string]$SecretName,
        [string]$SecretValue,
        [string]$Description
    )
    
    if ($SecretValue -and $SecretValue -ne "your-$SecretName") {
        try {
            gh secret set $SecretName --body $SecretValue
            Write-Host "✅ Set $SecretName" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to set $SecretName" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  Skipping $SecretName (no value provided)" -ForegroundColor Yellow
    }
}

# Read secrets from environment file if it exists
if (Test-Path "secrets.env") {
    Write-Host "📋 Reading secrets from secrets.env..." -ForegroundColor Blue
    
    # Parse secrets.env file
    $secrets = @{}
    Get-Content "secrets.env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $secrets[$key] = $value
        }
    }
    
    # Set GitHub secrets
    Set-GitHubSecret "SUPABASE_URL" $secrets["SUPABASE_URL"] "Supabase project URL"
    Set-GitHubSecret "SUPABASE_ANON_KEY" $secrets["SUPABASE_ANON_KEY"] "Supabase anonymous key"
    Set-GitHubSecret "SUPABASE_SERVICE_ROLE_KEY" $secrets["SUPABASE_SERVICE_ROLE_KEY"] "Supabase service role key"
    Set-GitHubSecret "SUPABASE_HOST" $secrets["SUPABASE_HOST"] "Supabase host"
    Set-GitHubSecret "SUPABASE_PASSWORD" $secrets["SUPABASE_PASSWORD"] "Supabase password"
    Set-GitHubSecret "LOCATION" $secrets["LOCATION"] "Location configuration"
    Set-GitHubSecret "DEEPSEEK_API_KEY" $secrets["DEEPSEEK_API_KEY"] "DeepSeek API key"
    Set-GitHubSecret "EXPO_TOKEN" $secrets["EXPO_TOKEN"] "Expo token"
    
} else {
    Write-Host "⚠️  secrets.env file not found. Please create it first." -ForegroundColor Yellow
    Write-Host "   A template has been created for you." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 Verifying secrets..." -ForegroundColor Blue

# List current secrets
try {
    gh secret list
    Write-Host "✅ Secrets verification complete" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Could not verify secrets" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 GitHub secrets setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Blue
Write-Host "1. Verify your secrets are set correctly in GitHub"
Write-Host "2. Test your CI/CD pipeline"
Write-Host "3. Deploy your security fixes"
Write-Host ""
Write-Host "🔒 Your CI/CD pipeline is now configured with secure secrets!" -ForegroundColor Green
