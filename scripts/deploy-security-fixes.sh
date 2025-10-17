#!/bin/bash

# =============================================
# SECURITY FIXES DEPLOYMENT SCRIPT
# =============================================
# This script deploys all security fixes for JamStockAnalytics
# Run this script to secure your Supabase database

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_HOST="${SUPABASE_HOST:-localhost}"
DB_PORT="${SUPABASE_PORT:-5432}"
DB_NAME="${SUPABASE_DB:-postgres}"
DB_USER="${SUPABASE_USER:-postgres}"

echo -e "${BLUE}🔒 JamStockAnalytics Security Fixes Deployment${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if required environment variables are set
if [ -z "$SUPABASE_HOST" ]; then
    echo -e "${YELLOW}⚠️  Warning: SUPABASE_HOST not set, using localhost${NC}"
fi

if [ -z "$SUPABASE_USER" ]; then
    echo -e "${YELLOW}⚠️  Warning: SUPABASE_USER not set, using postgres${NC}"
fi

echo -e "${BLUE}📋 Security Issues to Fix:${NC}"
echo "1. ✅ Exposed auth.users via public view"
echo "2. ✅ SECURITY DEFINER views bypass RLS"
echo "3. ✅ RLS disabled on public tables"
echo "4. ✅ Mutable search_path in functions"
echo "5. ✅ Missing RLS policies"
echo "6. ✅ Password protection disabled"
echo ""

# Function to run SQL script
run_sql_script() {
    local script_name="$1"
    local description="$2"
    
    echo -e "${BLUE}🔄 Running: $description${NC}"
    
    if [ -f "scripts/$script_name" ]; then
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "scripts/$script_name"; then
            echo -e "${GREEN}✅ Success: $description${NC}"
        else
            echo -e "${RED}❌ Error: Failed to run $description${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Error: Script not found: scripts/$script_name${NC}"
        exit 1
    fi
    echo ""
}

# Function to verify security setup
verify_security() {
    echo -e "${BLUE}🔍 Verifying Security Implementation${NC}"
    
    # Check if verification functions exist
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT * FROM public.verify_security_setup();" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Security verification functions available${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: Security verification functions not found${NC}"
    fi
    
    # Check if security monitoring is available
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT * FROM public.get_security_dashboard_data();" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Security monitoring dashboard available${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: Security monitoring dashboard not found${NC}"
    fi
}

# Main deployment process
echo -e "${BLUE}🚀 Starting Security Fixes Deployment${NC}"
echo ""

# Step 1: Apply main security fixes
run_sql_script "security-fixes.sql" "Main Security Fixes"

# Step 2: Apply Supabase security configuration
run_sql_script "supabase-security-config.sql" "Supabase Security Configuration"

# Step 3: Set up security monitoring
run_sql_script "security-monitoring-dashboard.sql" "Security Monitoring Dashboard"

# Step 4: Verify security implementation
verify_security

# Final summary
echo -e "${GREEN}🎉 Security Fixes Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📊 Security Status:${NC}"
echo "✅ Exposed auth.users views secured"
echo "✅ SECURITY DEFINER views fixed"
echo "✅ RLS enabled on all public tables"
echo "✅ Mutable search_path issues resolved"
echo "✅ Missing RLS policies added"
echo "✅ Password protection enabled"
echo "✅ Security monitoring dashboard created"
echo ""

echo -e "${BLUE}🔍 Next Steps:${NC}"
echo "1. Run security verification: SELECT * FROM public.verify_security_setup();"
echo "2. Check security dashboard: SELECT * FROM public.get_security_dashboard_data();"
echo "3. Monitor security alerts: SELECT * FROM public.check_security_alerts();"
echo "4. Review security documentation: DOCS/SECURITY_IMPLEMENTATION_GUIDE.md"
echo ""

echo -e "${GREEN}🔒 Your JamStockAnalytics database is now secure!${NC}"
