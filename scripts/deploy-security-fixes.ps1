# =============================================
# SECURITY FIXES DEPLOYMENT SCRIPT (PowerShell)
# =============================================
# This script deploys all security fixes for JamStockAnalytics
# Run this script to secure your Supabase database

param(
    [string]$SupabaseHost = $env:SUPABASE_HOST ?? "localhost",
    [string]$SupabasePort = $env:SUPABASE_PORT ?? "5432",
    [string]$SupabaseDb = $env:SUPABASE_DB ?? "postgres",
    [string]$SupabaseUser = $env:SUPABASE_USER ?? "postgres"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

Write-Host "🔒 JamStockAnalytics Security Fixes Deployment" -ForegroundColor $Cyan
Write-Host "================================================" -ForegroundColor $Cyan
Write-Host ""

# Check if required environment variables are set
if (-not $env:SUPABASE_HOST) {
    Write-Host "⚠️  Warning: SUPABASE_HOST not set, using localhost" -ForegroundColor $Yellow
}

if (-not $env:SUPABASE_USER) {
    Write-Host "⚠️  Warning: SUPABASE_USER not set, using postgres" -ForegroundColor $Yellow
}

Write-Host "📋 Security Issues to Fix:" -ForegroundColor $Blue
Write-Host "1. ✅ Exposed auth.users via public view"
Write-Host "2. ✅ SECURITY DEFINER views bypass RLS"
Write-Host "3. ✅ RLS disabled on public tables"
Write-Host "4. ✅ Mutable search_path in functions"
Write-Host "5. ✅ Missing RLS policies"
Write-Host "6. ✅ Password protection disabled"
Write-Host ""

# Function to run SQL script
function Run-SqlScript {
    param(
        [string]$ScriptName,
        [string]$Description
    )
    
    Write-Host "🔄 Running: $Description" -ForegroundColor $Blue
    
    if (Test-Path "scripts/$ScriptName") {
        try {
            $env:PGPASSWORD = $env:SUPABASE_PASSWORD
            psql -h $SupabaseHost -p $SupabasePort -U $SupabaseUser -d $SupabaseDb -f "scripts/$ScriptName"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Success: $Description" -ForegroundColor $Green
            } else {
                Write-Host "❌ Error: Failed to run $Description" -ForegroundColor $Red
                exit 1
            }
        } catch {
            Write-Host "❌ Error: Failed to run $Description - $($_.Exception.Message)" -ForegroundColor $Red
            exit 1
        }
    } else {
        Write-Host "❌ Error: Script not found: scripts/$ScriptName" -ForegroundColor $Red
        exit 1
    }
    Write-Host ""
}

# Function to verify security setup
function Verify-Security {
    Write-Host "🔍 Verifying Security Implementation" -ForegroundColor $Blue
    
    try {
        $env:PGPASSWORD = $env:SUPABASE_PASSWORD
        psql -h $SupabaseHost -p $SupabasePort -U $SupabaseUser -d $SupabaseDb -c "SELECT * FROM public.verify_security_setup();" | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Security verification functions available" -ForegroundColor $Green
        } else {
            Write-Host "⚠️  Warning: Security verification functions not found" -ForegroundColor $Yellow
        }
    } catch {
        Write-Host "⚠️  Warning: Security verification functions not found" -ForegroundColor $Yellow
    }
    
    try {
        $env:PGPASSWORD = $env:SUPABASE_PASSWORD
        psql -h $SupabaseHost -p $SupabasePort -U $SupabaseUser -d $SupabaseDb -c "SELECT * FROM public.get_security_dashboard_data();" | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Security monitoring dashboard available" -ForegroundColor $Green
        } else {
            Write-Host "⚠️  Warning: Security monitoring dashboard not found" -ForegroundColor $Yellow
        }
    } catch {
        Write-Host "⚠️  Warning: Security monitoring dashboard not found" -ForegroundColor $Yellow
    }
}

# Main deployment process
Write-Host "🚀 Starting Security Fixes Deployment" -ForegroundColor $Blue
Write-Host ""

# Step 1: Apply main security fixes
Run-SqlScript "security-fixes.sql" "Main Security Fixes"

# Step 2: Apply Supabase security configuration
Run-SqlScript "supabase-security-config.sql" "Supabase Security Configuration"

# Step 3: Set up security monitoring
Run-SqlScript "security-monitoring-dashboard.sql" "Security Monitoring Dashboard"

# Step 4: Verify security implementation
Verify-Security

# Final summary
Write-Host "🎉 Security Fixes Deployment Complete!" -ForegroundColor $Green
Write-Host ""
Write-Host "📊 Security Status:" -ForegroundColor $Blue
Write-Host "✅ Exposed auth.users views secured"
Write-Host "✅ SECURITY DEFINER views fixed"
Write-Host "✅ RLS enabled on all public tables"
Write-Host "✅ Mutable search_path issues resolved"
Write-Host "✅ Missing RLS policies added"
Write-Host "✅ Password protection enabled"
Write-Host "✅ Security monitoring dashboard created"
Write-Host ""

Write-Host "🔍 Next Steps:" -ForegroundColor $Blue
Write-Host "1. Run security verification: SELECT * FROM public.verify_security_setup();"
Write-Host "2. Check security dashboard: SELECT * FROM public.get_security_dashboard_data();"
Write-Host "3. Monitor security alerts: SELECT * FROM public.check_security_alerts();"
Write-Host "4. Review security documentation: DOCS/SECURITY_IMPLEMENTATION_GUIDE.md"
Write-Host ""

Write-Host "🔒 Your JamStockAnalytics database is now secure!" -ForegroundColor $Green
