# 🔧 jq-Based Secrets Validation Guide

## 📋 Overview

This guide explains how to use the advanced jq-based validation system for your JamStockAnalytics project secrets. jq provides powerful JSON processing capabilities for robust validation.

## 🚀 Features

### **Advanced JSON Processing**
- ✅ **JSON Configuration**: Validation rules stored in structured JSON
- ✅ **Pattern Matching**: Advanced regex pattern validation using jq
- ✅ **Length Validation**: Precise character count validation
- ✅ **Placeholder Detection**: Smart detection of placeholder text
- ✅ **Connection Testing**: Network connectivity testing with JSON parsing

### **Enhanced Validation**
- ✅ **Structured Output**: JSON-formatted validation results
- ✅ **Detailed Reporting**: Comprehensive validation reports
- ✅ **Error Categorization**: Categorized error messages
- ✅ **Progress Tracking**: Real-time validation progress

## 🔧 Installation

### **Windows**
```powershell
# Using winget (recommended)
winget install jqlang.jq

# Verify installation
jq --version
```

### **macOS**
```bash
# Using Homebrew
brew install jq

# Verify installation
jq --version
```

### **Linux**
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install jq

# CentOS/RHEL
sudo yum install jq

# Verify installation
jq --version
```

## 📊 Validation Configuration

### **JSON Configuration Structure**

The validation system uses a structured JSON configuration:

```json
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
    "DEEPSEEK_API_KEY": {
      "description": "DeepSeek API key for AI features",
      "pattern": "^sk-",
      "min_length": 20,
      "example": "sk-your-deepseek-api-key"
    }
  }
}
```

## 🛠️ Usage

### **Shell Script (Linux/macOS)**
```bash
# Make executable
chmod +x scripts/validate-secrets-with-jq.sh

# Run validation
./scripts/validate-secrets-with-jq.sh

# With environment variables
SUPABASE_HOST="https://your-project.supabase.co" \
SUPABASE_PASSWORD="your-password" \
LOCATION="us-east-1" \
./scripts/validate-secrets-with-jq.sh
```

### **PowerShell Script (Windows)**
```powershell
# Run validation
.\scripts\validate-secrets-with-jq.ps1

# With report generation
.\scripts\validate-secrets-with-jq.ps1 -GenerateReport -OutputPath "validation-report.json"
```

### **GitHub Actions**
The workflow automatically installs jq and runs both basic and advanced validation:

```yaml
- name: Install jq
  run: |
    sudo apt-get update
    sudo apt-get install -y jq

- name: Run validate-secrets script (with jq)
  run: |
    chmod +x ./scripts/validate-secrets-with-jq.sh
    ./scripts/validate-secrets-with-jq.sh
```

## 📋 Validation Rules

### **Required Secrets**

#### **SUPABASE_HOST**
- **Pattern**: `^https?://.+`
- **Min Length**: 10 characters
- **Description**: Supabase host URL
- **Example**: `https://your-project-ref.supabase.co`

#### **SUPABASE_PASSWORD**
- **Min Length**: 8 characters
- **Description**: Supabase database password
- **Example**: `your-secure-password`

#### **LOCATION**
- **Pattern**: `^[a-zA-Z0-9\-_]+$`
- **Min Length**: 2 characters
- **Description**: Deployment location
- **Example**: `us-east-1`

### **Optional Secrets**

#### **SUPABASE_URL**
- **Pattern**: `^https://[a-zA-Z0-9\-]+\.supabase\.co$`
- **Min Length**: 20 characters
- **Description**: Supabase project URL

#### **DEEPSEEK_API_KEY**
- **Pattern**: `^sk-`
- **Min Length**: 20 characters
- **Description**: DeepSeek API key for AI features

## 🔍 Advanced Features

### **JSON Report Generation**

The jq-based validation can generate detailed JSON reports:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": {
    "SUPABASE_HOST": "https://your-project.supabase.co",
    "SUPABASE_PASSWORD": "secure-password",
    "LOCATION": "us-east-1"
  },
  "validation_config": {
    "required_secrets": { ... },
    "optional_secrets": { ... }
  },
  "summary": {
    "total_required": 3,
    "total_optional": 5,
    "required_set": 3,
    "optional_set": 2
  }
}
```

### **Connection Testing**

Advanced connection testing with JSON parsing:

```bash
# Parse URL using jq
parsed_url=$(echo "\"$SUPABASE_HOST\"" | jq -r '{
  protocol: split("://")[0],
  hostname: split("://")[1] | split("/")[0],
  port: (if contains(":") then split(":")[1] | split("/")[0] else (if startswith("https://") then 443 else 80 end) end)
}')

hostname=$(echo "$parsed_url" | jq -r '.hostname')
port=$(echo "$parsed_url" | jq -r '.port')
```

### **Pattern Validation**

Advanced pattern matching using jq:

```bash
# Check if value matches pattern
matches_pattern=$(echo "$secret_value" | jq -R --arg pattern "$pattern" 'test($pattern)')

if [ "$matches_pattern" = "true" ]; then
  echo "Pattern validation passed"
else
  echo "Pattern validation failed"
fi
```

## 📊 Example Output

### **Success Case**
```
🔍 Validating Supabase Secrets with jq
=====================================

✅ jq version: jq-1.8.1

📋 Creating environment JSON...
📋 Validating required secrets:
🔍 Validating SUPABASE_HOST: Supabase host URL
✅ SUPABASE_HOST is properly configured (35 characters)

🔍 Validating SUPABASE_PASSWORD: Supabase database password
✅ SUPABASE_PASSWORD is properly configured (12 characters)

🔍 Validating LOCATION: Deployment location
✅ LOCATION is properly configured (9 characters)

📋 Validating optional secrets:
🔍 Validating SUPABASE_URL: Supabase project URL
✅ SUPABASE_URL is properly configured (35 characters)

📊 Validation Summary:
  Required secrets: 3/3 passed
  Optional secrets: 1/5 configured
  Total errors: 0

✅ All required secrets are properly configured!
🔒 Your Supabase project is ready for deployment.

🔗 Testing connection to Supabase...
   Hostname: your-project.supabase.co
   Port: 443
✅ Supabase connection successful
✅ Health endpoint responded

📄 JSON report saved to /tmp/secrets-validation-report.json
```

### **Failure Case**
```
🔍 Validating Supabase Secrets with jq
=====================================

✅ jq version: jq-1.8.1

📋 Creating environment JSON...
📋 Validating required secrets:
🔍 Validating SUPABASE_HOST: Supabase host URL
❌ SUPABASE_HOST is not set

🔍 Validating SUPABASE_PASSWORD: Supabase database password
❌ SUPABASE_PASSWORD appears to contain placeholder text

📊 Validation Summary:
  Required secrets: 0/3 passed
  Optional secrets: 0/5 configured
  Total errors: 2

❌ Validation failed with errors:
   Required secrets are missing or invalid

💡 To fix these issues:
  1. Set the required secrets in GitHub repository settings
  2. Go to Settings → Secrets and variables → Actions
  3. Add the missing secrets with their values
  4. Re-run this workflow
```

## 🔧 Troubleshooting

### **Common Issues**

1. **"jq is not installed"**
   - Install jq using the appropriate package manager
   - Verify installation with `jq --version`

2. **"JSON parse error"**
   - Check JSON configuration format
   - Validate JSON syntax using `jq . config.json`

3. **"Pattern validation failed"**
   - Review pattern regex syntax
   - Test patterns using jq test function

4. **"Connection test failed"**
   - Check network connectivity
   - Verify Supabase host URL format

### **Debugging**

Enable verbose output:

```bash
# Shell script
bash -x ./scripts/validate-secrets-with-jq.sh

# PowerShell script
.\scripts\validate-secrets-with-jq.ps1 -Verbose
```

## 📋 Best Practices

### **Configuration Management**
1. **Version Control**: Keep validation configuration in version control
2. **Environment Specific**: Use different configs for different environments
3. **Regular Updates**: Update validation rules as requirements change

### **Security**
1. **Sensitive Data**: Never log sensitive secret values
2. **Access Control**: Restrict access to validation scripts
3. **Audit Logging**: Log validation results for audit purposes

## 🎯 Next Steps

1. **Install jq** using the appropriate method for your system
2. **Run validation** using the jq-based scripts
3. **Review results** and fix any validation issues
4. **Integrate with CI/CD** for automated validation
5. **Generate reports** for compliance and auditing

---

**🔧 Your JamStockAnalytics project now has advanced jq-based secrets validation!**

The jq-based validation provides more robust, structured, and detailed validation capabilities compared to basic validation methods. 🎉
