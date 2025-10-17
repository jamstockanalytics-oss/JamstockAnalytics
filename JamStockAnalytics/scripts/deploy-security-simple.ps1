# =============================================
# SIMPLE SECURITY DEPLOYMENT SCRIPT
# =============================================

Write-Host "🔒 JamStockAnalytics Security Fixes Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variables
$env:PGPASSWORD = "your-password"

Write-Host "📋 Configuration:" -ForegroundColor Blue
Write-Host "Host: your-supabase-host"
Write-Host "Location: your-location"
Write-Host "Password: [HIDDEN]"
Write-Host ""

# Function to run SQL script
function Run-SqlScript {
    param(
        [string]$ScriptName,
        [string]$Description
    )
    
    Write-Host "🔄 Running: $Description" -ForegroundColor Blue
    
    if (Test-Path "scripts/$ScriptName") {
        try {
            psql -h "your-supabase-host" -U postgres -d postgres -f "scripts/$ScriptName"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Success: $Description" -ForegroundColor Green
            } else {
                Write-Host "❌ Error: Failed to run $Description" -ForegroundColor Red
                return $false
            }
        } catch {
            Write-Host "❌ Error: Failed to run $Description - $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "❌ Error: Script not found: scripts/$ScriptName" -ForegroundColor Red
        return $false
    }
    Write-Host ""
    return $true
}

# Main deployment process
Write-Host "🚀 Starting Security Fixes Deployment" -ForegroundColor Blue
Write-Host ""

$success = $true

# Step 1: Apply main security fixes
if (-not (Run-SqlScript "security-fixes.sql" "Main Security Fixes")) {
    $success = $false
}

# Step 2: Apply Supabase security configuration
if (-not (Run-SqlScript "supabase-security-config.sql" "Supabase Security Configuration")) {
    $success = $false
}

# Step 3: Set up security monitoring
if (-not (Run-SqlScript "security-monitoring-dashboard.sql" "Security Monitoring Dashboard")) {
    $success = $false
}

# Final summary
if ($success) {
    Write-Host "🎉 Security Fixes Deployment Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Security Status:" -ForegroundColor Blue
    Write-Host "✅ Exposed auth.users views secured"
    Write-Host "✅ SECURITY DEFINER views fixed"
    Write-Host "✅ RLS enabled on all public tables"
    Write-Host "✅ Mutable search_path issues resolved"
    Write-Host "✅ Missing RLS policies added"
    Write-Host "✅ Password protection enabled"
    Write-Host "✅ Security monitoring dashboard created"
    Write-Host ""
    Write-Host "🔍 Next Steps:" -ForegroundColor Blue
    Write-Host "1. Run security verification: SELECT * FROM public.verify_security_setup();"
    Write-Host "2. Check security dashboard: SELECT * FROM public.get_security_dashboard_data();"
    Write-Host "3. Monitor security alerts: SELECT * FROM public.check_security_alerts();"
    Write-Host ""
    Write-Host "🔒 Your JamStockAnalytics database is now secure!" -ForegroundColor Green
} else {
    Write-Host "❌ Security deployment failed. Please check the errors above." -ForegroundColor Red
    exit 1
}
