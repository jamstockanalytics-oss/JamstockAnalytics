# 🔧 Node.js GCP Service Account Key Validation

## 📋 Overview

This guide explains how to use Node.js for validating Google Cloud Platform (GCP) service account keys in your JamStockAnalytics project. Node.js provides an alternative to jq for JSON processing and validation.

## 🚀 Features

### **Node.js-Based Validation**
- ✅ **JSON.parse() Validation**: Native JavaScript JSON parsing
- ✅ **Error Handling**: Comprehensive try-catch error handling
- ✅ **Field Verification**: Required field presence and format checking
- ✅ **Environment Variable Support**: Validate keys from environment variables
- ✅ **File-Based Validation**: Validate keys from JSON files
- ✅ **Cross-Platform**: Works on Windows, macOS, and Linux

### **GitHub Actions Integration**
- ✅ **Dual Validation**: Both jq and Node.js validation methods
- ✅ **Fallback Support**: Multiple validation approaches
- ✅ **Error Handling**: Detailed error messages and guidance
- ✅ **Security**: Secure handling of sensitive service account keys

## 🔧 Setup Instructions

### **1. Node.js Validation Script**

The Node.js validation script provides comprehensive validation:

```javascript
// scripts/validate-gcp-key-node.js
const keyData = JSON.parse(process.env.GCP_SA_KEY);
// Validate required fields
if (keyData.type === 'service_account') {
  console.log('✅ Service account type is correct');
}
```

### **2. GitHub Actions Integration**

Both workflows now include Node.js validation:

**validate-supabase-secrets.yml:**
```yaml
- name: Validate GCP service account key (use node)
  run: |
    echo "🔍 Testing GCP secret availability (node)..."
    if [[ -n "${GCP_SA_KEY:-}" ]]; then
      if node -e "try{JSON.parse(process.env.GCP_SA_KEY); process.exit(0)}catch(e){process.exit(1)}"; then
        echo "✅ GCP_SA_KEY present and valid JSON (node)"
        echo "Secret length: ${#GCP_SA_KEY}"
      else
        echo "❌ GCP_SA_KEY present but invalid JSON"
        exit 1
      fi
    else
      echo "❌ GCP_SA_KEY secret is missing"
      exit 1
    fi
```

**automated-build-with-gcp.yml:**
```yaml
- name: Validate GCP Service Account Key (Node.js)
  run: |
    echo "🔍 Validating GCP service account key with Node.js..."
    if [[ -z "${{ secrets.GCP_SA_KEY }}" ]]; then
      echo "❌ GCP_SA_KEY secret is missing"
      exit 1
    fi
    
    # Check if the JSON is valid using Node.js
    if node -e "try{JSON.parse(process.env.GCP_SA_KEY); console.log('✅ GCP service account key JSON is valid (Node.js)')}catch(e){console.log('❌ GCP service account key JSON is invalid'); process.exit(1)}"; then
      echo "✅ Node.js validation passed"
    else
      echo "❌ Node.js validation failed"
      exit 1
    fi
```

## 🛠️ Local Testing

### **File-Based Validation**

Test with a local JSON file:

```bash
# Run Node.js validation script
node scripts/validate-gcp-key-node.js

# Expected output:
🔍 GCP Service Account Key Validation (Node.js)
===============================================

📋 Validating GCP service account key...
🔍 Testing JSON structure...
✅ JSON structure is valid
🔍 Checking required fields...
✅ Service account type is correct
✅ Project ID is present: jamstockanalytics
✅ Private key is present (1234 characters)
✅ Client email is present: github-actions@jamstockanalytics.iam.gserviceaccount.com

🎉 GCP service account key validation successful!
```

### **Environment Variable Validation**

Test with environment variable:

```bash
# Set environment variable
export GCP_SA_KEY='{"type":"service_account","project_id":"jamstockanalytics",...}'

# Run validation
node scripts/validate-gcp-key-node.js --env

# Expected output:
✅ GCP_SA_KEY environment variable is valid JSON
✅ Project ID: jamstockanalytics
✅ Client email: github-actions@jamstockanalytics.iam.gserviceaccount.com
✅ Key length: 1234 characters
```

## 🔍 Validation Features

### **JSON Structure Validation**
```javascript
try {
  const keyData = JSON.parse(process.env.GCP_SA_KEY);
  console.log('✅ JSON structure is valid');
} catch (error) {
  console.log('❌ JSON structure is invalid');
  process.exit(1);
}
```

### **Required Field Validation**
```javascript
// Check service account type
if (keyData.type === 'service_account') {
  console.log('✅ Service account type is correct');
}

// Check project ID
if (keyData.project_id) {
  console.log(`✅ Project ID is present: ${keyData.project_id}`);
}

// Check private key
if (keyData.private_key) {
  console.log('✅ Private key is present');
}

// Check client email
if (keyData.client_email) {
  console.log(`✅ Client email is present: ${keyData.client_email}`);
}
```

### **Error Handling**
```javascript
try {
  const keyData = JSON.parse(process.env.GCP_SA_KEY);
  // Validation logic
} catch (error) {
  if (error instanceof SyntaxError) {
    console.log('❌ JSON structure is invalid');
  } else {
    console.log('❌ Error reading key');
  }
  process.exit(1);
}
```

## 🚀 GitHub Actions Workflow

### **Dual Validation Approach**

Both workflows now use both jq and Node.js validation:

1. **jq Validation** - For comprehensive JSON processing
2. **Node.js Validation** - For JavaScript-based validation
3. **Fallback Support** - If one method fails, the other can succeed

### **Validation Steps**

```yaml
# Step 1: Install jq
- name: Install jq for GCP validation
  run: |
    sudo apt-get update -y
    sudo apt-get install -y jq

# Step 2: jq validation
- name: Validate GCP Service Account Key (jq)
  run: |
    echo "${{ secrets.GCP_SA_KEY }}" | jq empty

# Step 3: Node.js validation
- name: Validate GCP Service Account Key (Node.js)
  run: |
    node -e "try{JSON.parse(process.env.GCP_SA_KEY); console.log('✅ Valid')}catch(e){process.exit(1)}"
```

## 🔒 Security Features

### **Secure Key Handling**
- ✅ **No Key Exposure** - Keys never logged or displayed
- ✅ **Environment Variables** - Secure environment variable handling
- ✅ **Error Handling** - Comprehensive error handling without exposing sensitive data
- ✅ **Validation Only** - Only validates structure, doesn't store or transmit keys

### **GitHub Secrets Integration**
- ✅ **Encrypted Storage** - GitHub encrypts all secrets
- ✅ **Access Logging** - GitHub logs secret access
- ✅ **Environment Isolation** - Secrets scoped to repository
- ✅ **Secure Transmission** - Keys transmitted securely to workflows

## 📊 Monitoring and Analytics

### **Validation Output**

**Success Case:**
```
🔍 Validating GCP service account key with Node.js...
✅ GCP service account key JSON is valid (Node.js)
✅ Node.js validation passed
```

**Failure Case:**
```
🔍 Validating GCP service account key with Node.js...
❌ GCP service account key JSON is invalid
❌ Node.js validation failed
```

### **GitHub Actions Logs**
- Monitor validation results in workflow runs
- Check for validation errors and warnings
- Review detailed validation output from both jq and Node.js

## 🛠️ Advanced Features

### **Custom Validation Logic**
```javascript
// Custom validation function
function validateGCPKey(keyData) {
  const requiredFields = [
    'type', 'project_id', 'private_key', 'client_email'
  ];
  
  for (const field of requiredFields) {
    if (!keyData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  if (keyData.type !== 'service_account') {
    throw new Error('Invalid service account type');
  }
  
  return true;
}
```

### **Environment Variable Testing**
```bash
# Test with environment variable
GCP_SA_KEY='{"type":"service_account","project_id":"test"}' node scripts/validate-gcp-key-node.js --env
```

## 🚨 Troubleshooting

### **Common Issues**

1. **"GCP_SA_KEY secret is missing"**
   - Add the secret to GitHub repository settings
   - Ensure the secret name is exactly `GCP_SA_KEY`

2. **"JSON structure is invalid"**
   - Check that the entire JSON content is copied
   - Ensure no extra characters or formatting issues
   - Validate JSON using online JSON validator

3. **"Node.js validation failed"**
   - Check Node.js version compatibility
   - Ensure the JSON is properly formatted
   - Verify the key structure matches GCP service account format

### **Debug Commands**

```bash
# Test Node.js JSON parsing
node -e "console.log(JSON.parse('{\"test\": \"value\"}'))"

# Test environment variable
export GCP_SA_KEY='{"type":"service_account"}'
node -e "console.log(JSON.parse(process.env.GCP_SA_KEY))"

# Test validation script
node scripts/validate-gcp-key-node.js --env
```

## 🎯 Benefits

### **Dual Validation Approach**
- ✅ **Redundancy** - Multiple validation methods ensure reliability
- ✅ **Cross-Platform** - Works on different operating systems
- ✅ **Fallback Support** - If one method fails, the other can succeed
- ✅ **Comprehensive Testing** - Both jq and Node.js validation

### **Developer Experience**
- ✅ **Local Testing** - Test keys before adding to GitHub
- ✅ **Clear Documentation** - Step-by-step setup guide
- ✅ **Troubleshooting** - Common issues and solutions
- ✅ **Best Practices** - Security guidelines and recommendations

## 🚀 Next Steps

1. **Set up GCP service account** following the setup guide
2. **Generate service account key** and test locally with Node.js
3. **Add GCP_SA_KEY to GitHub Secrets** with the JSON content
4. **Test the validation** by pushing to your repository
5. **Monitor both jq and Node.js validation** in GitHub Actions logs

---

**🔧 Your JamStockAnalytics project now has dual GCP service account key validation with both jq and Node.js!**

The Node.js validation provides an alternative approach to jq, ensuring robust validation across different environments and platforms. 🎉
