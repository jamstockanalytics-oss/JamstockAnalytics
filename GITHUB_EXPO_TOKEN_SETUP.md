# 🔑 GitHub EXPO_TOKEN Setup Guide

## 📍 Where to Add EXPO_TOKEN in GitHub

### **Step 1: Navigate to Repository Settings**

1. **Go to your GitHub repository**: `https://github.com/your-username/jamstockanalytics`
2. **Click on "Settings"** tab (top right of repository page)
3. **Scroll down to "Secrets and variables"** section in the left sidebar
4. **Click on "Actions"** under "Secrets and variables"

### **Step 2: Add EXPO_TOKEN Secret**

1. **Click "New repository secret"** button
2. **Name**: `EXPO_TOKEN`
3. **Secret**: `exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. **Click "Add secret"**

## 🔧 Detailed Setup Instructions

### **Method 1: GitHub Web Interface**

#### **Step-by-Step Process:**

1. **Navigate to Repository:**
   ```
   https://github.com/your-username/jamstockanalytics
   ```

2. **Access Settings:**
   - Click **"Settings"** tab (top navigation)
   - Scroll to **"Secrets and variables"** section
   - Click **"Actions"**

3. **Add New Secret:**
   - Click **"New repository secret"**
   - **Name**: `EXPO_TOKEN`
   - **Secret**: Your EXPO token (starts with `exp_`)
   - Click **"Add secret"**

4. **Verify Secret Added:**
   - You should see `EXPO_TOKEN` in the secrets list
   - Status should show "Created" with timestamp

### **Method 2: GitHub CLI (Alternative)**

```bash
# Install GitHub CLI
npm install -g @github/cli

# Login to GitHub
gh auth login

# Add secret via CLI
gh secret set EXPO_TOKEN --body "exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## 🔍 How to Get EXPO_TOKEN

### **Option 1: From Expo Dashboard**

1. **Go to Expo Dashboard**: https://expo.dev
2. **Sign in** to your account
3. **Click on your profile** (top right)
4. **Go to "Account Settings"**
5. **Navigate to "Access Tokens"**
6. **Click "Create Token"**
7. **Copy the token** (starts with `exp_`)

### **Option 2: Using Expo CLI**

```bash
# Login to Expo
npx expo login

# This will set the token in your local environment
# You can then copy it from your .env file or environment
```

### **Option 3: From Local Environment**

```bash
# Check if you already have a token
echo $EXPO_TOKEN

# Or check in your .env file
cat .env | grep EXPO_TOKEN
```

## 📊 GitHub Actions Integration

### **Workflow Configuration**

The EXPO_TOKEN will be automatically used in GitHub Actions workflows:

```yaml
# .github/workflows/check-expo-token.yml
name: Check EXPO_TOKEN Status

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  check-expo-token:
    runs-on: ubuntu-latest
    steps:
      - name: Check EXPO_TOKEN status
        run: npm run check-expo-token
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

### **Available Workflows**

1. **`check-expo-token.yml`** - Validates EXPO_TOKEN status
2. **`validate-supabase-secrets-enhanced.yml`** - Enhanced validation
3. **`automated-build-with-enhanced-validation.yml`** - Build with validation

## 🔒 Security Best Practices

### **Token Security:**

1. **Never commit tokens** to code
2. **Use GitHub Secrets** for storage
3. **Rotate tokens regularly**
4. **Use least privilege** principle
5. **Monitor token usage**

### **Token Permissions:**

- ✅ **Build permissions** for EAS Build
- ✅ **Update permissions** for EAS Update
- ✅ **Project access** for specific projects
- ✅ **Read-only** for most operations

## 🧪 Testing EXPO_TOKEN Setup

### **Test Commands:**

```bash
# Test token locally
npm run check-expo-token

# Validate token
npm run validate-expo-token

# Generate report
npm run expo-token-report
```

### **Expected Output:**

```
🔑 EXPO_TOKEN Status Check
===========================
✅ EXPO_TOKEN is set
Token: exp_xxxxxxxx...xxxx
✅ EXPO_TOKEN is valid
Logged in as: your-username
✅ Token has required permissions
```

## 🔧 Troubleshooting

### **Common Issues:**

#### **1. Token Not Found:**
```
❌ EXPO_TOKEN is not set
```
**Solution**: Add token to GitHub Secrets

#### **2. Invalid Token:**
```
❌ EXPO_TOKEN is invalid
```
**Solution**: Generate new token from Expo dashboard

#### **3. Permission Denied:**
```
⚠️ Token permissions check failed
```
**Solution**: Check token permissions in Expo dashboard

#### **4. Token Expired:**
```
❌ EXPO_TOKEN is expired
```
**Solution**: Generate new token and update GitHub Secrets

### **Debug Steps:**

1. **Check GitHub Secrets:**
   - Go to repository settings
   - Verify EXPO_TOKEN exists
   - Check if token is correct

2. **Validate Token Format:**
   - Should start with `exp_`
   - Should be 64 characters long
   - Should not contain spaces

3. **Test Token Locally:**
   ```bash
   export EXPO_TOKEN=your_token_here
   npm run check-expo-token
   ```

## 📋 Setup Checklist

### **Pre-Setup:**
- [ ] GitHub repository access
- [ ] Expo account access
- [ ] EXPO_TOKEN generated

### **GitHub Setup:**
- [ ] Navigate to repository settings
- [ ] Go to Secrets and variables → Actions
- [ ] Add EXPO_TOKEN secret
- [ ] Verify secret is added

### **Testing:**
- [ ] Run local validation
- [ ] Check GitHub Actions
- [ ] Verify token permissions
- [ ] Test deployment

## 🎯 Quick Setup Commands

### **One-Command Setup:**

```bash
# Get token from Expo CLI
npx expo login

# Copy token to clipboard (Windows)
echo $EXPO_TOKEN | clip

# Add to GitHub (requires GitHub CLI)
gh secret set EXPO_TOKEN --body "$EXPO_TOKEN"
```

### **Manual Setup:**

1. **Get token**: https://expo.dev → Account Settings → Access Tokens
2. **Add to GitHub**: Repository Settings → Secrets → Actions → New secret
3. **Test**: Run `npm run check-expo-token`

## 📞 Support

### **Getting Help:**

1. **Expo Documentation**: https://docs.expo.dev
2. **GitHub Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
3. **EAS CLI Help**: `npx eas --help`
4. **Expo CLI Help**: `npx expo --help`

### **Common Commands:**

```bash
# Check token status
npm run check-expo-token

# Validate token
npm run validate-expo-token

# Generate report
npm run expo-token-report

# Test Expo CLI
npx expo whoami
```

---

## 🎉 Setup Complete!

Once you've added the EXPO_TOKEN to GitHub Secrets:

1. ✅ **Token is secure** - Stored in GitHub Secrets
2. ✅ **Workflows can access** - Available in GitHub Actions
3. ✅ **Validation works** - Status checks will pass
4. ✅ **Deployment ready** - All systems operational

**Your EXPO_TOKEN is now properly configured in GitHub!** 🚀
