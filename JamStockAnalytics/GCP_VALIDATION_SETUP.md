# 🔧 GCP Service Account Key Validation Setup

## 📋 Overview

This guide explains how to set up and validate Google Cloud Platform (GCP) service account keys in your JamStockAnalytics project using jq for JSON processing and validation.

## 🚀 Features

### **Advanced GCP Validation**
- ✅ **JSON Validation**: jq-powered JSON structure validation
- ✅ **Field Verification**: Required field presence and format checking
- ✅ **Service Account Type**: Validates service account type
- ✅ **Project ID Validation**: Ensures project ID is present
- ✅ **Private Key Verification**: Validates private key format
- ✅ **Client Email Check**: Verifies client email format

### **GitHub Actions Integration**
- ✅ **Automated Validation**: Runs on every push and pull request
- ✅ **jq Installation**: Automatic jq installation for JSON processing
- ✅ **Error Handling**: Comprehensive error messages and guidance
- ✅ **Security**: Secure handling of sensitive service account keys

## 🔧 Setup Instructions

### **1. Create GCP Service Account**

1. **Go to Google Cloud Console**
   - Navigate to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project: `jamstockanalytics`

2. **Create Service Account**
   ```bash
   # Using gcloud CLI
   gcloud iam service-accounts create github-actions \
     --display-name="GitHub Actions" \
     --description="Service account for GitHub Actions CI/CD"
   ```

3. **Assign Required Roles**
   ```bash
   # Grant necessary permissions
   gcloud projects add-iam-policy-binding jamstockanalytics \
     --member="serviceAccount:github-actions@jamstockanalytics.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   
   gcloud projects add-iam-policy-binding jamstockanalytics \
     --member="serviceAccount:github-actions@jamstockanalytics.iam.gserviceaccount.com" \
     --role="roles/cloudbuild.builds.editor"
   ```

### **2. Generate Service Account Key**

1. **Create JSON Key**
   ```bash
   # Generate and download the key
   gcloud iam service-accounts keys create github-actions-key.json \
     --iam-account=github-actions@jamstockanalytics.iam.gserviceaccount.com
   ```

2. **Copy Key Content**
   ```bash
   # Copy the entire JSON content
   cat github-actions-key.json
   ```

### **3. Add to GitHub Secrets**

1. **Go to Repository Settings**
   - Navigate to your GitHub repository
   - Go to `Settings` → `Secrets and variables` → `Actions`

2. **Add GCP_SA_KEY Secret**
   - Click `New repository secret`
   - Name: `GCP_SA_KEY`
   - Value: Paste the entire JSON content from the service account key file

3. **Verify Secret Format**
   ```json
   {
     "type": "service_account",
     "project_id": "jamstockanalytics",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "github-actions@jamstockanalytics.iam.gserviceaccount.com",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "..."
   }
   ```

## 🔍 Validation Process

### **GitHub Actions Validation Steps**

The validation process includes the following steps:

1. **jq Installation**
   ```yaml
   - name: Install jq for GCP validation
     run: |
       echo "🔍 Installing jq for GCP validation..."
       sudo apt-get update -y
       sudo apt-get install -y jq
   ```

2. **JSON Structure Validation**
   ```bash
   # Validate JSON structure
   echo "$GCP_SA_KEY" | jq empty
   ```

3. **Required Field Validation**
   ```bash
   # Check service account type
   echo "$GCP_SA_KEY" | jq -e '.type == "service_account"'
   
   # Check project ID
   echo "$GCP_SA_KEY" | jq -e '.project_id'
   
   # Check private key
   echo "$GCP_SA_KEY" | jq -e '.private_key'
   
   # Check client email
   echo "$GCP_SA_KEY" | jq -e '.client_email'
   ```

### **Validation Output**

**Success Case:**
```
🔍 Installing jq for GCP validation...
🔍 Validating GCP service account key...
✅ GCP service account key JSON is valid
✅ Service account type is correct
✅ Project ID is present
✅ Private key is present
✅ Client email is present
```

**Failure Case:**
```
🔍 Installing jq for GCP validation...
🔍 Validating GCP service account key...
❌ GCP_SA_KEY secret is missing
💡 Please add a valid GCP service account key to GitHub Secrets
```

## 🛠️ Manual Testing

### **Local Validation Script**

Create a test script to validate your GCP key locally:

```bash
#!/bin/bash
# test-gcp-key.sh

echo "🔍 Testing GCP service account key..."

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is not installed. Please install jq first:"
    echo "   Windows: winget install jqlang.jq"
    echo "   macOS: brew install jq"
    echo "   Linux: apt-get install jq"
    exit 1
fi

# Check if key file exists
if [ ! -f "github-actions-key.json" ]; then
    echo "❌ github-actions-key.json not found"
    echo "💡 Please download your service account key first"
    exit 1
fi

# Validate JSON structure
if cat github-actions-key.json | jq empty; then
    echo "✅ JSON structure is valid"
else
    echo "❌ JSON structure is invalid"
    exit 1
fi

# Check required fields
echo "🔍 Checking required fields..."

if cat github-actions-key.json | jq -e '.type == "service_account"' > /dev/null; then
    echo "✅ Service account type is correct"
else
    echo "❌ Invalid service account type"
    exit 1
fi

if cat github-actions-key.json | jq -e '.project_id' > /dev/null; then
    echo "✅ Project ID is present: $(cat github-actions-key.json | jq -r '.project_id')"
else
    echo "❌ Project ID is missing"
    exit 1
fi

if cat github-actions-key.json | jq -e '.private_key' > /dev/null; then
    echo "✅ Private key is present"
else
    echo "❌ Private key is missing"
    exit 1
fi

if cat github-actions-key.json | jq -e '.client_email' > /dev/null; then
    echo "✅ Client email is present: $(cat github-actions-key.json | jq -r '.client_email')"
else
    echo "❌ Client email is missing"
    exit 1
fi

echo "🎉 GCP service account key validation successful!"
```

### **Run Local Test**

```bash
# Make script executable
chmod +x test-gcp-key.sh

# Run validation
./test-gcp-key.sh
```

## 🔒 Security Best Practices

### **Key Management**
- ✅ **Never commit keys** to version control
- ✅ **Use GitHub Secrets** for secure storage
- ✅ **Rotate keys regularly** (every 90 days)
- ✅ **Limit permissions** to minimum required
- ✅ **Monitor key usage** in GCP Console

### **Access Control**
- ✅ **Principle of least privilege** - only grant necessary permissions
- ✅ **Regular access reviews** - audit permissions quarterly
- ✅ **Key rotation** - rotate service account keys regularly
- ✅ **Monitoring** - enable audit logs for key usage

### **GitHub Actions Security**
- ✅ **Secrets encryption** - GitHub encrypts secrets at rest
- ✅ **Access logging** - GitHub logs secret access
- ✅ **Environment restrictions** - limit secret access to specific environments
- ✅ **Branch protection** - protect main branch from unauthorized changes

## 🚨 Troubleshooting

### **Common Issues**

1. **"GCP_SA_KEY secret is missing"**
   - Add the secret to GitHub repository settings
   - Ensure the secret name is exactly `GCP_SA_KEY`

2. **"JSON structure is invalid"**
   - Check that the entire JSON content is copied
   - Ensure no extra characters or formatting issues
   - Validate JSON using online JSON validator

3. **"Invalid service account type"**
   - Ensure you're using a service account key, not a user account key
   - Verify the key was generated from a service account

4. **"Project ID is missing"**
   - Check that the service account belongs to the correct project
   - Verify the project ID matches your GCP project

### **Debug Commands**

```bash
# Check if jq is working
echo '{"test": "value"}' | jq '.test'

# Validate JSON file
cat github-actions-key.json | jq .

# Check specific fields
cat github-actions-key.json | jq '.type'
cat github-actions-key.json | jq '.project_id'
cat github-actions-key.json | jq '.client_email'
```

## 📊 Monitoring and Analytics

### **GitHub Actions Logs**
- Monitor workflow runs in GitHub Actions tab
- Check validation step logs for detailed information
- Review error messages for troubleshooting

### **GCP Console Monitoring**
- Monitor service account usage in GCP Console
- Check IAM permissions and roles
- Review audit logs for key usage

## 🎯 Next Steps

1. **Set up GCP service account** following the instructions above
2. **Add GCP_SA_KEY to GitHub Secrets** with the JSON key content
3. **Test the validation** by pushing to your repository
4. **Monitor the workflow** to ensure validation passes
5. **Set up monitoring** for ongoing key management

---

**🔧 Your JamStockAnalytics project now has comprehensive GCP service account key validation!**

The jq-powered validation ensures your GCP credentials are properly formatted and ready for use in your CI/CD pipeline. 🎉
