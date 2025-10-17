#!/bin/bash

# =============================================
# COMPREHENSIVE GCP SERVICE ACCOUNT KEY VALIDATION
# =============================================
# Matches GitHub Actions validation approach

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔍 Comprehensive GCP Service Account Key Validation${NC}"
echo -e "${CYAN}===================================================${NC}"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq is not installed. Please install jq first:${NC}"
    echo -e "${YELLOW}   Windows: winget install jqlang.jq${NC}"
    echo -e "${YELLOW}   macOS: brew install jq${NC}"
    echo -e "${YELLOW}   Linux: apt-get install jq${NC}"
    exit 1
fi

echo -e "${GREEN}✅ jq version: $(jq --version)${NC}"
echo ""

# Check if key file exists
if [ ! -f "github-actions-key.json" ]; then
    echo -e "${RED}❌ github-actions-key.json not found${NC}"
    echo -e "${YELLOW}💡 Please download your service account key first:${NC}"
    echo -e "${YELLOW}   1. Go to Google Cloud Console${NC}"
    echo -e "${YELLOW}   2. Navigate to IAM & Admin → Service Accounts${NC}"
    echo -e "${YELLOW}   3. Create or select a service account${NC}"
    echo -e "${YELLOW}   4. Generate a new JSON key${NC}"
    echo -e "${YELLOW}   5. Save as 'github-actions-key.json' in this directory${NC}"
    exit 1
fi

# Read the key content
GCP_SA_KEY=$(cat github-actions-key.json)

echo -e "${BLUE}🔍 Checking GCP_SA_KEY presence...${NC}"
if [[ -z "${GCP_SA_KEY:-}" ]]; then
    echo -e "${RED}❌ GCP_SA_KEY is missing${NC}"
    exit 1
fi
echo -e "${GREEN}✅ GCP_SA_KEY is present${NC}"

echo -e "${BLUE}🔍 Validating JSON parse...${NC}"
if ! echo "$GCP_SA_KEY" | jq empty >/dev/null 2>&1; then
    echo -e "${RED}❌ GCP_SA_KEY is not valid JSON${NC}"
    exit 1
else
    echo -e "${GREEN}✅ GCP_SA_KEY is valid JSON${NC}"
fi

echo -e "${BLUE}🔍 Validating it's a service account key...${NC}"
if echo "$GCP_SA_KEY" | jq -e '.type == "service_account"' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ GCP_SA_KEY type == service_account${NC}"
else
    echo -e "${RED}❌ GCP_SA_KEY JSON does not have type=service_account${NC}"
    echo -e "${YELLOW}🔎 You can inspect the parsed fields locally (don't print secrets in CI logs)${NC}"
    
    # Show the actual type for debugging (safe to show)
    ACTUAL_TYPE=$(echo "$GCP_SA_KEY" | jq -r '.type // "missing"')
    echo -e "${YELLOW}   Actual type: ${ACTUAL_TYPE}${NC}"
    exit 1
fi

# Additional comprehensive validation
echo -e "${BLUE}🔍 Additional field validation...${NC}"

# Check project_id
if echo "$GCP_SA_KEY" | jq -e '.project_id' >/dev/null 2>&1; then
    PROJECT_ID=$(echo "$GCP_SA_KEY" | jq -r '.project_id')
    echo -e "${GREEN}✅ Project ID is present: ${PROJECT_ID}${NC}"
else
    echo -e "${RED}❌ Project ID is missing${NC}"
    exit 1
fi

# Check private_key
if echo "$GCP_SA_KEY" | jq -e '.private_key' >/dev/null 2>&1; then
    PRIVATE_KEY_LENGTH=$(echo "$GCP_SA_KEY" | jq -r '.private_key' | wc -c)
    echo -e "${GREEN}✅ Private key is present (${PRIVATE_KEY_LENGTH} characters)${NC}"
else
    echo -e "${RED}❌ Private key is missing${NC}"
    exit 1
fi

# Check client_email
if echo "$GCP_SA_KEY" | jq -e '.client_email' >/dev/null 2>&1; then
    CLIENT_EMAIL=$(echo "$GCP_SA_KEY" | jq -r '.client_email')
    echo -e "${GREEN}✅ Client email is present: ${CLIENT_EMAIL}${NC}"
else
    echo -e "${RED}❌ Client email is missing${NC}"
    exit 1
fi

# Check additional optional fields
echo -e "${BLUE}🔍 Checking optional fields...${NC}"

OPTIONAL_FIELDS=("auth_uri" "token_uri" "client_id" "client_x509_cert_url" "auth_provider_x509_cert_url")

for field in "${OPTIONAL_FIELDS[@]}"; do
    if echo "$GCP_SA_KEY" | jq -e ".${field}" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ ${field} is present${NC}"
    else
        echo -e "${YELLOW}⚠️  ${field} is missing (optional)${NC}"
    fi
done

# Summary
echo ""
echo -e "${BLUE}📊 Validation Summary:${NC}"
echo -e "${GREEN}✅ JSON structure: Valid${NC}"
echo -e "${GREEN}✅ Service account type: Correct${NC}"
echo -e "${GREEN}✅ Project ID: ${PROJECT_ID}${NC}"
echo -e "${GREEN}✅ Private key: Present${NC}"
echo -e "${GREEN}✅ Client email: ${CLIENT_EMAIL}${NC}"

echo ""
echo -e "${GREEN}🎉 Comprehensive GCP service account key validation successful!${NC}"
echo -e "${BLUE}💡 Next steps:${NC}"
echo -e "${YELLOW}   1. Copy the entire JSON content${NC}"
echo -e "${YELLOW}   2. Go to GitHub repository settings${NC}"
echo -e "${YELLOW}   3. Navigate to Secrets and variables → Actions${NC}"
echo -e "${YELLOW}   4. Add new secret: GCP_SA_KEY${NC}"
echo -e "${YELLOW}   5. Paste the JSON content as the value${NC}"
echo -e "${YELLOW}   6. Save the secret${NC}"

echo ""
echo -e "${CYAN}🔧 Your GCP service account key is ready for GitHub Actions!${NC}"
