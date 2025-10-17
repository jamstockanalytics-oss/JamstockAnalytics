#!/bin/bash

# =============================================
# GCP SERVICE ACCOUNT KEY VALIDATION SCRIPT
# =============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔍 GCP Service Account Key Validation${NC}"
echo -e "${CYAN}=====================================${NC}"
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

echo -e "${BLUE}📋 Validating GCP service account key...${NC}"

# Validate JSON structure
echo -e "${BLUE}🔍 Testing JSON structure...${NC}"
if cat github-actions-key.json | jq empty > /dev/null 2>&1; then
    echo -e "${GREEN}✅ JSON structure is valid${NC}"
else
    echo -e "${RED}❌ JSON structure is invalid${NC}"
    echo -e "${YELLOW}💡 Please check the JSON format and try again${NC}"
    exit 1
fi

# Check required fields
echo -e "${BLUE}🔍 Checking required fields...${NC}"

# Check service account type
if cat github-actions-key.json | jq -e '.type == "service_account"' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Service account type is correct${NC}"
else
    echo -e "${RED}❌ Invalid service account type${NC}"
    echo -e "${YELLOW}💡 Expected: service_account, Got: $(cat github-actions-key.json | jq -r '.type // "missing"')${NC}"
    exit 1
fi

# Check project ID
if cat github-actions-key.json | jq -e '.project_id' > /dev/null 2>&1; then
    PROJECT_ID=$(cat github-actions-key.json | jq -r '.project_id')
    echo -e "${GREEN}✅ Project ID is present: ${PROJECT_ID}${NC}"
else
    echo -e "${RED}❌ Project ID is missing${NC}"
    exit 1
fi

# Check private key
if cat github-actions-key.json | jq -e '.private_key' > /dev/null 2>&1; then
    PRIVATE_KEY_LENGTH=$(cat github-actions-key.json | jq -r '.private_key' | wc -c)
    echo -e "${GREEN}✅ Private key is present (${PRIVATE_KEY_LENGTH} characters)${NC}"
else
    echo -e "${RED}❌ Private key is missing${NC}"
    exit 1
fi

# Check client email
if cat github-actions-key.json | jq -e '.client_email' > /dev/null 2>&1; then
    CLIENT_EMAIL=$(cat github-actions-key.json | jq -r '.client_email')
    echo -e "${GREEN}✅ Client email is present: ${CLIENT_EMAIL}${NC}"
else
    echo -e "${RED}❌ Client email is missing${NC}"
    exit 1
fi

# Check additional fields
echo -e "${BLUE}🔍 Checking additional fields...${NC}"

# Check auth URI
if cat github-actions-key.json | jq -e '.auth_uri' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Auth URI is present${NC}"
else
    echo -e "${YELLOW}⚠️  Auth URI is missing (optional)${NC}"
fi

# Check token URI
if cat github-actions-key.json | jq -e '.token_uri' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Token URI is present${NC}"
else
    echo -e "${YELLOW}⚠️  Token URI is missing (optional)${NC}"
fi

# Check client ID
if cat github-actions-key.json | jq -e '.client_id' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Client ID is present${NC}"
else
    echo -e "${YELLOW}⚠️  Client ID is missing (optional)${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}📊 Validation Summary:${NC}"
echo -e "${GREEN}✅ JSON structure: Valid${NC}"
echo -e "${GREEN}✅ Service account type: Correct${NC}"
echo -e "${GREEN}✅ Project ID: ${PROJECT_ID}${NC}"
echo -e "${GREEN}✅ Private key: Present${NC}"
echo -e "${GREEN}✅ Client email: ${CLIENT_EMAIL}${NC}"

echo ""
echo -e "${GREEN}🎉 GCP service account key validation successful!${NC}"
echo -e "${BLUE}💡 Next steps:${NC}"
echo -e "${YELLOW}   1. Copy the entire JSON content${NC}"
echo -e "${YELLOW}   2. Go to GitHub repository settings${NC}"
echo -e "${YELLOW}   3. Navigate to Secrets and variables → Actions${NC}"
echo -e "${YELLOW}   4. Add new secret: GCP_SA_KEY${NC}"
echo -e "${YELLOW}   5. Paste the JSON content as the value${NC}"
echo -e "${YELLOW}   6. Save the secret${NC}"

echo ""
echo -e "${CYAN}🔧 Your GCP service account key is ready for GitHub Actions!${NC}"
