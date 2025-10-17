# Security Fixes Deployment Script
Write-Host "🔒 Deploying Security Fixes..." -ForegroundColor Cyan

# Set password
$env:PGPASSWORD = "your-password"

# Run security fixes
Write-Host "🔄 Running security-fixes.sql..." -ForegroundColor Blue
psql -h "your-supabase-host" -U postgres -d postgres -f "scripts/security-fixes.sql"

Write-Host "🔄 Running supabase-security-config.sql..." -ForegroundColor Blue
psql -h "your-supabase-host" -U postgres -d postgres -f "scripts/supabase-security-config.sql"

Write-Host "🔄 Running security-monitoring-dashboard.sql..." -ForegroundColor Blue
psql -h "your-supabase-host" -U postgres -d postgres -f "scripts/security-monitoring-dashboard.sql"

Write-Host "✅ Security fixes deployment complete!" -ForegroundColor Green
Write-Host "🔒 Your database is now secure!" -ForegroundColor Green
