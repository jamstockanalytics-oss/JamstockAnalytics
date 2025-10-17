#!/bin/bash

# =============================================
# SUPABASE SECRETS VALIDATION SCRIPT
# =============================================
# Validates that all required secrets are properly configured

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔍 Validating Supabase Secrets${NC}"
echo -e "${CYAN}==============================${NC}"
echo ""

# Required secrets
REQUIRED_SECRETS=("SUPABASE_HOST" "SUPABASE_PASSWORD" "LOCATION")

# Optional secrets
OPTIONAL_SECRETS=("SUPABASE_URL" "SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY" "DEEPSEEK_API_KEY" "EXPO_TOKEN")

# Validation functions
validate_required_secret() {
    local secret_name="$1"
    local secret_value="${!secret_name}"
    
    if [ -z "$secret_value" ]; then
        echo -e "${RED}❌ $secret_name is required but not set${NC}"
        return 1
    fi
    
    # Check for placeholder values
    if [[ "$secret_value" == *"your-"* ]] || [[ "$secret_value" == *"placeholder"* ]]; then
        echo -e "${RED}❌ $secret_name appears to contain placeholder text${NC}"
        return 1
    fi
    
    # Specific validations
    case "$secret_name" in
        "SUPABASE_HOST")
            if [[ ! "$secret_value" =~ ^https?:// ]]; then
                echo -e "${RED}❌ $secret_name does not start with http:// or https://${NC}"
                return 1
            fi
            ;;
        "SUPABASE_PASSWORD")
            if [ ${#secret_value} -lt 8 ]; then
                echo -e "${RED}❌ $secret_name is too short (minimum 8 characters)${NC}"
                return 1
            fi
            ;;
        "LOCATION")
            if [[ ! "$secret_value" =~ ^[a-zA-Z0-9\-_]+$ ]]; then
                echo -e "${RED}❌ $secret_name contains invalid characters${NC}"
                return 1
            fi
            ;;
    esac
    
    echo -e "${GREEN}✅ $secret_name is properly configured${NC}"
    return 0
}

validate_optional_secret() {
    local secret_name="$1"
    local secret_value="${!secret_name}"
    
    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}⚠️  $secret_name is optional and not set${NC}"
        return 0
    fi
    
    # Check for placeholder values
    if [[ "$secret_value" == *"your-"* ]] || [[ "$secret_value" == *"placeholder"* ]]; then
        echo -e "${RED}❌ $secret_name appears to contain placeholder text${NC}"
        return 1
    fi
    
    # Specific validations
    case "$secret_name" in
        "SUPABASE_URL")
            if [[ ! "$secret_value" =~ ^https://[a-zA-Z0-9\-]+\.supabase\.co$ ]]; then
                echo -e "${RED}❌ $secret_name does not match expected format${NC}"
                return 1
            fi
            ;;
        "SUPABASE_ANON_KEY"|"SUPABASE_SERVICE_ROLE_KEY")
            if [ ${#secret_value} -lt 100 ]; then
                echo -e "${RED}❌ $secret_name is too short (minimum 100 characters)${NC}"
                return 1
            fi
            ;;
        "DEEPSEEK_API_KEY")
            if [ ${#secret_value} -lt 20 ]; then
                echo -e "${RED}❌ $secret_name is too short (minimum 20 characters)${NC}"
                return 1
            fi
            ;;
        "EXPO_TOKEN")
            if [ ${#secret_value} -lt 20 ]; then
                echo -e "${RED}❌ $secret_name is too short (minimum 20 characters)${NC}"
                return 1
            fi
            ;;
    esac
    
    echo -e "${GREEN}✅ $secret_name is properly configured${NC}"
    return 0
}

# Test connection to Supabase
test_connection() {
    local supabase_host="$1"
    
    if [ -z "$supabase_host" ]; then
        echo -e "${YELLOW}⚠️  Cannot test connection: SUPABASE_HOST not set${NC}"
        return 0
    fi
    
    echo -e "${BLUE}🔗 Testing connection to Supabase...${NC}"
    
    # Extract hostname from URL
    local hostname=$(echo "$supabase_host" | sed 's|^https\?://||' | cut -d'/' -f1)
    
    # Test connection (timeout after 5 seconds)
    if timeout 5 bash -c "echo > /dev/tcp/$hostname/443" 2>/dev/null; then
        echo -e "${GREEN}✅ Supabase connection successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not test connection to Supabase${NC}"
        echo -e "${YELLOW}   This is normal if the host is not reachable or firewall blocks the connection${NC}"
    fi
}

# Main validation
echo -e "${BLUE}📋 Checking required secrets:${NC}"
required_errors=0
for secret in "${REQUIRED_SECRETS[@]}"; do
    if ! validate_required_secret "$secret"; then
        ((required_errors++))
    fi
done

echo ""
echo -e "${BLUE}📋 Checking optional secrets:${NC}"
optional_errors=0
for secret in "${OPTIONAL_SECRETS[@]}"; do
    if ! validate_optional_secret "$secret"; then
        ((optional_errors++))
    fi
done

# Summary
echo ""
echo -e "${BLUE}📊 Validation Summary:${NC}"
echo "  Required secrets: $(( ${#REQUIRED_SECRETS[@]} - required_errors ))/${#REQUIRED_SECRETS[@]} passed"
echo "  Optional secrets: $(( ${#OPTIONAL_SECRETS[@]} - optional_errors ))/${#OPTIONAL_SECRETS[@]} configured"
echo "  Total errors: $(( required_errors + optional_errors ))"

# Check for critical issues
if [ $required_errors -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Validation failed with errors:${NC}"
    echo -e "${RED}   Required secrets are missing or invalid${NC}"
    echo ""
    echo -e "${BLUE}💡 To fix these issues:${NC}"
    echo "  1. Set the required secrets in GitHub repository settings"
    echo "  2. Go to Settings → Secrets and variables → Actions"
    echo "  3. Add the missing secrets with their values"
    echo "  4. Re-run this workflow"
    exit 1
fi

if [ $optional_errors -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Validation completed with warnings:${NC}"
    echo -e "${YELLOW}   Some optional secrets have issues but are not required${NC}"
fi

echo ""
echo -e "${GREEN}✅ All required secrets are properly configured!${NC}"
echo -e "${GREEN}🔒 Your Supabase project is ready for deployment.${NC}"

# Test connection if in CI environment
if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
    test_connection "$SUPABASE_HOST"
fi
