# 🔑 EXPO_TOKEN Status Check Documentation

## Overview

This document provides comprehensive guidance for checking and validating EXPO_TOKEN status in the JamStockAnalytics application deployment process.

## 📋 EXPO_TOKEN Status Check

### **What is EXPO_TOKEN?**

EXPO_TOKEN is an authentication token used by Expo CLI and EAS (Expo Application Services) for:
- Building applications with EAS Build
- Publishing updates with EAS Update
- Managing Expo projects
- Accessing Expo services

### **Token Format:**
```
exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔍 Status Check Methods

### **1. Command Line Validation**

#### **Check Token Validity:**
```bash
# Check if EXPO_TOKEN is set
echo $EXPO_TOKEN

# Validate token with Expo CLI
npx expo whoami

# Check token permissions
npx expo projects:list
```

#### **Expected Output (Valid Token):**
```
Logged in as: your-username
```

#### **Expected Output (Invalid Token):**
```
Not logged in. Please run 'expo login' to authenticate.
```

### **2. Programmatic Validation**

#### **Node.js Validation Script:**
```javascript
// scripts/check-expo-token.js
const { execSync } = require('child_process');

function checkExpoToken() {
  try {
    const result = execSync('npx expo whoami', { encoding: 'utf8' });
    console.log('✅ EXPO_TOKEN is valid');
    console.log(`Logged in as: ${result.trim()}`);
    return true;
  } catch (error) {
    console.log('❌ EXPO_TOKEN is invalid or not set');
    console.log('Error:', error.message);
    return false;
  }
}

// Run validation
checkExpoToken();
```

#### **TypeScript Validation:**
```typescript
// lib/validation/expo-token-validator.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ExpoTokenStatus {
  isValid: boolean;
  username?: string;
  error?: string;
}

export async function validateExpoToken(): Promise<ExpoTokenStatus> {
  try {
    const { stdout } = await execAsync('npx expo whoami');
    return {
      isValid: true,
      username: stdout.trim()
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
}
```

### **3. Environment Variable Check**

#### **Check if Token is Set:**
```bash
# Check if EXPO_TOKEN environment variable exists
if [ -z "$EXPO_TOKEN" ]; then
  echo "❌ EXPO_TOKEN is not set"
  exit 1
else
  echo "✅ EXPO_TOKEN is set"
fi
```

#### **PowerShell Check:**
```powershell
# Check if EXPO_TOKEN environment variable exists
if ([string]::IsNullOrEmpty($env:EXPO_TOKEN)) {
  Write-Host "❌ EXPO_TOKEN is not set" -ForegroundColor Red
  exit 1
} else {
  Write-Host "✅ EXPO_TOKEN is set" -ForegroundColor Green
}
```

## 🛠️ Token Management

### **1. Getting EXPO_TOKEN**

#### **Method 1: Login with Expo CLI**
```bash
# Login to Expo
npx expo login

# This will prompt for username/password and set the token
```

#### **Method 2: Get Token from Expo Dashboard**
1. Go to [expo.dev](https://expo.dev)
2. Sign in to your account
3. Go to Account Settings
4. Navigate to Access Tokens
5. Create a new token
6. Copy the token value

#### **Method 3: EAS CLI**
```bash
# Login with EAS CLI
npx eas login

# This will also set the EXPO_TOKEN
```

### **2. Setting EXPO_TOKEN**

#### **Environment Variable:**
```bash
# Set for current session
export EXPO_TOKEN=exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Set permanently in .env file
echo "EXPO_TOKEN=exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" >> .env
```

#### **Windows:**
```cmd
# Set for current session
set EXPO_TOKEN=exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Set permanently
setx EXPO_TOKEN "exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### **PowerShell:**
```powershell
# Set for current session
$env:EXPO_TOKEN = "exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Set permanently
[Environment]::SetEnvironmentVariable("EXPO_TOKEN", "exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "User")
```

## 🔧 Integration with Deployment

### **1. Pre-Deployment Check**

#### **Add to Deployment Script:**
```bash
# scripts/deploy-with-expo-check.sh
#!/bin/bash

echo "🔍 Checking EXPO_TOKEN status..."

# Check if EXPO_TOKEN is set
if [ -z "$EXPO_TOKEN" ]; then
  echo "❌ EXPO_TOKEN is not set"
  echo "Please set EXPO_TOKEN environment variable"
  exit 1
fi

# Validate token
if npx expo whoami > /dev/null 2>&1; then
  echo "✅ EXPO_TOKEN is valid"
  USERNAME=$(npx expo whoami)
  echo "Logged in as: $USERNAME"
else
  echo "❌ EXPO_TOKEN is invalid"
  echo "Please check your token or run 'npx expo login'"
  exit 1
fi

# Continue with deployment
echo "🚀 Proceeding with deployment..."
```

### **2. GitHub Actions Integration**

#### **Add to Workflow:**
```yaml
# .github/workflows/deploy-with-expo.yml
name: Deploy with Expo Token Check

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Check EXPO_TOKEN status
        run: |
          echo "🔍 Checking EXPO_TOKEN status..."
          if [ -z "$EXPO_TOKEN" ]; then
            echo "❌ EXPO_TOKEN is not set"
            exit 1
          fi
          
          if npx expo whoami > /dev/null 2>&1; then
            echo "✅ EXPO_TOKEN is valid"
            USERNAME=$(npx expo whoami)
            echo "Logged in as: $USERNAME"
          else
            echo "❌ EXPO_TOKEN is invalid"
            exit 1
          fi
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

      - name: Build application
        run: npm run build:web:optimized
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

      - name: Deploy to production
        run: npm run deploy:web
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

### **3. Package.json Scripts**

#### **Add Validation Scripts:**
```json
{
  "scripts": {
    "check-expo-token": "npx expo whoami",
    "validate-expo-token": "node scripts/check-expo-token.js",
    "deploy-with-expo-check": "npm run validate-expo-token && npm run deploy:web"
  }
}
```

## 📊 Status Check Results

### **Valid Token Response:**
```
✅ EXPO_TOKEN is valid
Logged in as: your-username
```

### **Invalid Token Response:**
```
❌ EXPO_TOKEN is invalid
Error: Not logged in. Please run 'expo login' to authenticate.
```

### **Missing Token Response:**
```
❌ EXPO_TOKEN is not set
Please set EXPO_TOKEN environment variable
```

## 🔒 Security Considerations

### **1. Token Security:**
- ✅ **Never commit tokens** to version control
- ✅ **Use environment variables** for token storage
- ✅ **Rotate tokens regularly** for security
- ✅ **Use least privilege** principle

### **2. Token Storage:**
- ✅ **Local development**: Use `.env` file
- ✅ **CI/CD**: Use GitHub Secrets
- ✅ **Production**: Use secure environment variables
- ✅ **Team sharing**: Use secure password managers

### **3. Token Permissions:**
- ✅ **Read-only** for most operations
- ✅ **Build permissions** for EAS Build
- ✅ **Update permissions** for EAS Update
- ✅ **Project access** for specific projects

## 🚨 Troubleshooting

### **Common Issues:**

#### **1. Token Not Set:**
```bash
# Solution: Set the token
export EXPO_TOKEN=your_token_here
```

#### **2. Invalid Token:**
```bash
# Solution: Login again
npx expo login
```

#### **3. Token Expired:**
```bash
# Solution: Generate new token
# Go to expo.dev → Account Settings → Access Tokens
```

#### **4. Permission Denied:**
```bash
# Solution: Check token permissions
npx expo projects:list
```

### **Debug Commands:**
```bash
# Check token status
npx expo whoami

# List available projects
npx expo projects:list

# Check token permissions
npx expo projects:list --limit 1
```

## 📝 Best Practices

### **1. Token Management:**
- ✅ **Use environment variables** for all deployments
- ✅ **Validate tokens** before deployment
- ✅ **Rotate tokens** regularly
- ✅ **Monitor token usage** for security

### **2. Deployment Integration:**
- ✅ **Check token status** in CI/CD pipelines
- ✅ **Fail fast** on invalid tokens
- ✅ **Provide clear error messages**
- ✅ **Document token requirements**

### **3. Team Collaboration:**
- ✅ **Share token setup** instructions
- ✅ **Use secure channels** for token sharing
- ✅ **Document token requirements**
- ✅ **Provide troubleshooting guides**

## 🎯 Implementation Checklist

### **Pre-Deployment:**
- [ ] EXPO_TOKEN is set in environment
- [ ] Token is valid (npx expo whoami works)
- [ ] Token has required permissions
- [ ] Token is not expired

### **During Deployment:**
- [ ] Validate token before build
- [ ] Check token status in CI/CD
- [ ] Handle token errors gracefully
- [ ] Provide clear error messages

### **Post-Deployment:**
- [ ] Verify deployment success
- [ ] Check token usage logs
- [ ] Monitor for token issues
- [ ] Update documentation if needed

## 📞 Support

### **Getting Help:**
1. **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev)
2. **EAS CLI Help**: `npx eas --help`
3. **Expo CLI Help**: `npx expo --help`
4. **Community Support**: [forums.expo.dev](https://forums.expo.dev)

### **Common Commands:**
```bash
# Get help
npx expo --help
npx eas --help

# Check status
npx expo whoami
npx expo projects:list

# Login/logout
npx expo login
npx expo logout
```

---

**🔑 EXPO_TOKEN status checking is now fully documented and integrated into the deployment process!** 🚀
