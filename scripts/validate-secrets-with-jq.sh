#!/bin/bash

# =============================================
# SUPABASE SECRETS VALIDATION WITH JQ
# =============================================
# Advanced validation using jq for JSON processing

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔍 Validating Supabase Secrets with jq${NC}"
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

# Create JSON configuration for validation
cat > /tmp/secrets-config.json << 'EOF'
{
  "required_secrets": {
    "SUPABASE_HOST": {
      "description": "Supabase host URL",
      "pattern": "^https?://.+",
      "min_length": 10,
      "example": "https://your-project-ref.supabase.co"
    },
    "SUPABASE_PASSWORD": {
      "description": "Supabase database password",
      "min_length": 8,
      "example": "your-secure-password"
    },
    "LOCATION": {
      "description": "Deployment location",
      "pattern": "^[a-zA-Z0-9\\-_]+$",
      "min_length": 2,
      "example": "us-east-1"
    }
  },
  "optional_secrets": {
    "SUPABASE_URL": {
      "description": "Supabase project URL",
      "pattern": "^https://[a-zA-Z0-9\\-]+\\.supabase\\.co$",
      "min_length": 20,
      "example": "https://your-project-ref.supabase.co"
    },
    "SUPABASE_ANON_KEY": {
      "description": "Supabase anonymous key",
      "min_length": 100,
      "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "SUPABASE_SERVICE_ROLE_KEY": {
      "description": "Supabase service role key",
      "min_length": 100,
      "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "DEEPSEEK_API_KEY": {
      "description": "DeepSeek API key for AI features",
      "pattern": "^sk-",
      "min_length": 20,
      "example": "sk-your-deepseek-api-key"
    },
    "EXPO_TOKEN": {
      "description": "Expo token for builds",
      "min_length": 20,
      "example": "your-expo-token"
    }
  }
}
EOF

# Function to validate a secret using jq
validate_secret_with_jq() {
    local secret_name="$1"
    local secret_value="$2"
    local config_type="$3"
    
    # Get validation rules from JSON config
    local rules=$(jq -r ".${config_type}.\"${secret_name}\"" /tmp/secrets-config.json)
    
    if [ "$rules" = "null" ]; then
        echo -e "${RED}❌ Unknown secret: $secret_name${NC}"
        return 1
    fi
    
    local description=$(echo "$rules" | jq -r '.description')
    local pattern=$(echo "$rules" | jq -r '.pattern // empty')
    local min_length=$(echo "$rules" | jq -r '.min_length // 0')
    local example=$(echo "$rules" | jq -r '.example')
    
    echo -e "${BLUE}🔍 Validating $secret_name: $description${NC}"
    
    # Check if secret is set
    if [ -z "$secret_value" ]; then
        echo -e "${RED}❌ $secret_name is not set${NC}"
        return 1
    fi
    
    # Check for placeholder values using jq
    if echo "$secret_value" | jq -R 'contains("your-") or contains("placeholder") or contains("example")' | grep -q "true"; then
        echo -e "${RED}❌ $secret_name appears to contain placeholder text${NC}"
        return 1
    fi
    
    # Check minimum length
    local actual_length=$(echo "$secret_value" | jq -R 'length')
    if [ "$actual_length" -lt "$min_length" ]; then
        echo -e "${RED}❌ $secret_name is too short (${actual_length}/${min_length} characters)${NC}"
        return 1
    fi
    
    # Check pattern if specified
    if [ -n "$pattern" ] && [ "$pattern" != "null" ]; then
        if ! echo "$secret_value" | jq -R --arg pattern "$pattern" 'test($pattern)'; then
            echo -e "${RED}❌ $secret_name does not match expected pattern${NC}"
            echo -e "${YELLOW}   Expected format: $example${NC}"
            return 1
        fi
    fi
    
    echo -e "${GREEN}✅ $secret_name is properly configured (${actual_length} characters)${NC}"
    return 0
}

# Function to create environment JSON
create_environment_json() {
    local env_json="{"
    local first=true
    
    # Add all environment variables to JSON
    while IFS='=' read -r key value; do
        if [[ "$key" =~ ^(SUPABASE_|LOCATION|DEEPSEEK_|EXPO_) ]]; then
            if [ "$first" = true ]; then
                first=false
            else
                env_json+=","
            fi
            env_json+="\"$key\": \"$value\""
        fi
    done < <(env | sort)
    
    env_json+="}"
    echo "$env_json"
}

# Function to validate all secrets using jq
validate_all_secrets() {
    echo -e "${BLUE}📋 Creating environment JSON...${NC}"
    local env_json=$(create_environment_json)
    
    echo -e "${BLUE}📋 Validating required secrets:${NC}"
    local required_errors=0
    local required_secrets=$(jq -r '.required_secrets | keys[]' /tmp/secrets-config.json)
    
    while IFS= read -r secret; do
        local value=$(echo "$env_json" | jq -r ".\"$secret\" // empty")
        if ! validate_secret_with_jq "$secret" "$value" "required_secrets"; then
            ((required_errors++))
        fi
        echo ""
    done <<< "$required_secrets"
    
    echo -e "${BLUE}📋 Validating optional secrets:${NC}"
    local optional_errors=0
    local optional_secrets=$(jq -r '.optional_secrets | keys[]' /tmp/secrets-config.json)
    
    while IFS= read -r secret; do
        local value=$(echo "$env_json" | jq -r ".\"$secret\" // empty")
        if ! validate_secret_with_jq "$secret" "$value" "optional_secrets"; then
            ((optional_errors++))
        fi
        echo ""
    done <<< "$optional_secrets"
    
    # Generate summary using jq
    local total_required=$(echo "$required_secrets" | wc -l)
    local total_optional=$(echo "$optional_secrets" | wc -l)
    local required_passed=$((total_required - required_errors))
    local optional_passed=$((total_optional - optional_errors))
    
    echo -e "${BLUE}📊 Validation Summary:${NC}"
    echo "  Required secrets: $required_passed/$total_required passed"
    echo "  Optional secrets: $optional_passed/$total_optional configured"
    echo "  Total errors: $((required_errors + optional_errors))"
    
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
        return 1
    fi
    
    if [ $optional_errors -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}⚠️  Validation completed with warnings:${NC}"
        echo -e "${YELLOW}   Some optional secrets have issues but are not required${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✅ All required secrets are properly configured!${NC}"
    echo -e "${GREEN}🔒 Your Supabase project is ready for deployment.${NC}"
    
    return 0
}

# Function to test Supabase connection using jq
test_connection_with_jq() {
    local supabase_host="$1"
    
    if [ -z "$supabase_host" ]; then
        echo -e "${YELLOW}⚠️  Cannot test connection: SUPABASE_HOST not set${NC}"
        return 0
    fi
    
    echo -e "${BLUE}🔗 Testing connection to Supabase...${NC}"
    
    # Parse URL using jq
    local parsed_url=$(echo "\"$supabase_host\"" | jq -r '{
        protocol: split("://")[0],
        hostname: split("://")[1] | split("/")[0],
        port: (if contains(":") then split(":")[1] | split("/")[0] else (if startswith("https://") then 443 else 80 end) end)
    }')
    
    local hostname=$(echo "$parsed_url" | jq -r '.hostname')
    local port=$(echo "$parsed_url" | jq -r '.port')
    
    echo -e "${BLUE}   Hostname: $hostname${NC}"
    echo -e "${BLUE}   Port: $port${NC}"
    
    # Test connection (timeout after 5 seconds)
    if timeout 5 bash -c "echo > /dev/tcp/$hostname/$port" 2>/dev/null; then
        echo -e "${GREEN}✅ Supabase connection successful${NC}"
        
        # Try to get health endpoint if available
        local health_url="${supabase_host}/health"
        echo -e "${BLUE}   Testing health endpoint: $health_url${NC}"
        
        if curl -fsS --max-time 5 "$health_url" 2>/dev/null | jq -r '.status // "unknown"' 2>/dev/null; then
            echo -e "${GREEN}✅ Health endpoint responded${NC}"
        else
            echo -e "${YELLOW}⚠️  Health endpoint not available (this is normal)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Could not test connection to Supabase${NC}"
        echo -e "${YELLOW}   This is normal if the host is not reachable or firewall blocks the connection${NC}"
    fi
}

# Function to generate JSON report
generate_json_report() {
    local env_json=$(create_environment_json)
    local report=$(jq -n \
        --argjson env "$env_json" \
        --argjson config "$(cat /tmp/secrets-config.json)" \
        --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        '{
            timestamp: $timestamp,
            environment: $env,
            validation_config: $config,
            summary: {
                total_required: ($config.required_secrets | length),
                total_optional: ($config.optional_secrets | length),
                required_set: ($config.required_secrets | keys | map(select($env[.] != null and $env[.] != "")) | length),
                optional_set: ($config.optional_secrets | keys | map(select($env[.] != null and $env[.] != "")) | length)
            }
        }')
    
    echo "$report" > /tmp/secrets-validation-report.json
    echo -e "${GREEN}📄 JSON report saved to /tmp/secrets-validation-report.json${NC}"
}

# Main execution
main() {
    # Validate all secrets
    if validate_all_secrets; then
        # Test connection if in CI environment
        if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
            test_connection_with_jq "$SUPABASE_HOST"
        fi
        
        # Generate JSON report
        generate_json_report
        
        # Clean up
        rm -f /tmp/secrets-config.json
        rm -f /tmp/secrets-validation-report.json
        
        exit 0
    else
        # Clean up on failure
        rm -f /tmp/secrets-config.json
        rm -f /tmp/secrets-validation-report.json
        
        exit 1
    fi
}

# Run main function
main
