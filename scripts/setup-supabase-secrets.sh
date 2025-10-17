#!/bin/bash

# =============================================
# SUPABASE SECRETS SETUP SCRIPT
# =============================================
# This script helps set up Supabase secrets using the secrets.env file

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔐 Setting up Supabase Secrets${NC}"
echo -e "${CYAN}=================================${NC}"
echo ""

# Check if Supabase CLI is installed
if command -v supabase &> /dev/null; then
    SUPABASE_VERSION=$(supabase --version)
    echo -e "${GREEN}✅ Supabase CLI found: $SUPABASE_VERSION${NC}"
else
    echo -e "${RED}❌ Supabase CLI not found. Please install it first:${NC}"
    echo -e "${YELLOW}   npm install -g supabase${NC}"
    echo -e "${YELLOW}   or visit: https://supabase.com/docs/guides/cli${NC}"
    exit 1
fi

# Check if secrets.env file exists
if [ -f "secrets.env" ]; then
    echo -e "${GREEN}✅ Found secrets.env file${NC}"
else
    echo -e "${RED}❌ secrets.env file not found. Please create it first.${NC}"
    echo -e "${YELLOW}   A template has been created for you.${NC}"
    exit 1
fi

# Set Supabase secrets from environment file
echo -e "${BLUE}🔄 Setting Supabase secrets from secrets.env...${NC}"

if supabase secrets set --env-file secrets.env; then
    echo -e "${GREEN}✅ Successfully set Supabase secrets!${NC}"
else
    echo -e "${RED}❌ Failed to set Supabase secrets${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔍 Verifying secrets...${NC}"

# List current secrets to verify
if supabase secrets list; then
    echo -e "${GREEN}✅ Secrets verification complete${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Could not verify secrets${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Supabase secrets setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Verify your secrets are set correctly"
echo "2. Deploy your security fixes using the Supabase Dashboard"
echo "3. Test your application with the new secrets"
echo ""
echo -e "${GREEN}🔒 Your Supabase project is now configured with secure secrets!${NC}"
