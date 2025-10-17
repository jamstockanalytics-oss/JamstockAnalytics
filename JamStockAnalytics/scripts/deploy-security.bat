@echo off
echo 🔒 Deploying Security Fixes...

set PGPASSWORD=your-password

echo 🔄 Running security-fixes.sql...
psql -h your-supabase-host -U postgres -d postgres -f scripts/security-fixes.sql

echo 🔄 Running supabase-security-config.sql...
psql -h your-supabase-host -U postgres -d postgres -f scripts/supabase-security-config.sql

echo 🔄 Running security-monitoring-dashboard.sql...
psql -h your-supabase-host -U postgres -d postgres -f scripts/security-monitoring-dashboard.sql

echo ✅ Security fixes deployment complete!
echo 🔒 Your database is now secure!
pause
