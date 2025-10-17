# =============================================
# SUPABASE SECRETS SETUP SCRIPT
# =============================================
# This script helps set up Supabase secrets using the secrets.env file

Write-Host "🔐 Setting up Supabase Secrets" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    Write-Host "   or visit: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

# Check if secrets.env file exists
if (Test-Path "secrets.env") {
    Write-Host "✅ Found secrets.env file" -ForegroundColor Green
} else {
    Write-Host "❌ secrets.env file not found. Please create it first." -ForegroundColor Red
    Write-Host "   A template has been created for you." -ForegroundColor Yellow
    exit 1
}

# Set Supabase secrets from environment file
Write-Host "🔄 Setting Supabase secrets from secrets.env..." -ForegroundColor Blue

try {
    # Set secrets using the environment file
    supabase secrets set --env-file secrets.env
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully set Supabase secrets!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to set Supabase secrets" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error setting Supabase secrets: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔍 Verifying secrets..." -ForegroundColor Blue

# List current secrets to verify
try {
    supabase secrets list
    Write-Host "✅ Secrets verification complete" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Could not verify secrets" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Supabase secrets setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Blue
Write-Host "1. Verify your secrets are set correctly"
Write-Host "2. Deploy your security fixes using the Supabase Dashboard"
Write-Host "3. Test your application with the new secrets"
Write-Host ""
Write-Host "🔒 Your Supabase project is now configured with secure secrets!" -ForegroundColor Green
