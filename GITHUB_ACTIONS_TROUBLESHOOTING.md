# GitHub Actions Troubleshooting Guide

## Common CI/CD Pipeline Issues and Solutions

### 🚨 **Issue: "Failed" Status in GitHub Actions**

#### **Problem**: CI/CD pipeline shows failed status
#### **Solutions**:

1. **Check Workflow Logs**:
   - Go to your GitHub repository
   - Click on **Actions** tab
   - Click on the failed workflow run
   - Review the error messages in the logs

2. **Common Error Patterns**:
   - ❌ `npm ci` fails → Check package.json and package-lock.json
   - ❌ `node scripts/...` fails → Check if script files exist
   - ❌ Environment variables missing → Configure GitHub secrets
   - ❌ Build fails → Check build configuration

### 🔧 **Issue: Missing Environment Variables**

#### **Problem**: Scripts fail due to missing environment variables
#### **Solutions**:

1. **Configure GitHub Secrets**:
   ```bash
   # Go to: GitHub Repository → Settings → Secrets and variables → Actions
   # Add these secrets:
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   DEEPSEEK_API_KEY=your_deepseek_api_key
   ```

2. **Test with Fallback Values**:
   - The CI pipeline includes fallback values for testing
   - Tests will run with `test-key` values if secrets are missing
   - Some tests may show warnings but won't fail completely

### 📦 **Issue: Build Failures**

#### **Problem**: Web build or deployment fails
#### **Solutions**:

1. **Check Dependencies**:
   ```bash
   # Verify all dependencies are installed
   npm ci
   ```

2. **Check Build Configuration**:
   - Verify `app.config.js` exists and is valid
   - Check `eas.json` configuration
   - Ensure `package.json` has correct scripts

3. **Test Locally First**:
   ```bash
   # Test build locally
   npm run build:web:optimized
   ```

### 🧪 **Issue: Test Failures**

#### **Problem**: Tests fail in CI environment
#### **Solutions**:

1. **Environment Setup**:
   - CI creates a test `.env` file automatically
   - Tests run with fallback values if secrets are missing
   - Some tests are marked as `continue-on-error: true`

2. **Test Scripts**:
   - Verify test scripts exist in `scripts/` directory
   - Check that scripts are executable
   - Ensure all dependencies are installed

### 🔍 **Issue: Workflow Not Running**

#### **Problem**: GitHub Actions workflow doesn't trigger
#### **Solutions**:

1. **Check Workflow Triggers**:
   - Verify `.github/workflows/*.yml` files exist
   - Check `on:` configuration in workflow files
   - Ensure you're pushing to the correct branch

2. **Check Repository Settings**:
   - Go to **Settings** → **Actions** → **General**
   - Ensure "Allow all actions and reusable workflows" is selected
   - Check if Actions are enabled for your repository

### 📋 **Issue: Permission Errors**

#### **Problem**: Workflow fails due to permission issues
#### **Solutions**:

1. **Repository Permissions**:
   - Ensure GitHub Actions has necessary permissions
   - Check if repository is public or private (affects some actions)

2. **Secret Access**:
   - Verify secrets are properly configured
   - Check secret names match exactly (case-sensitive)

### 🚀 **Issue: Deployment Failures**

#### **Problem**: Deployment step fails
#### **Solutions**:

1. **Build Artifacts**:
   - Ensure build step completes successfully
   - Check that artifacts are uploaded properly
   - Verify artifact names match between upload and download

2. **Deployment Configuration**:
   - Check deployment target configuration
   - Verify necessary credentials are available
   - Test deployment locally first

## 🔧 **Quick Fixes**

### **Fix 1: Restart Failed Workflow**
1. Go to **Actions** tab
2. Click on failed workflow
3. Click **Re-run jobs** button

### **Fix 2: Check Recent Changes**
1. Review recent commits
2. Check if any files were deleted or moved
3. Verify all required files exist

### **Fix 3: Update Dependencies**
```bash
# Update package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### **Fix 4: Simplify Workflow**
- Use the `simple-ci.yml` workflow for basic testing
- Disable complex build steps temporarily
- Focus on essential tests first

## 📊 **Monitoring and Debugging**

### **Enable Debug Logging**
Add this to your workflow file for more detailed logs:
```yaml
- name: Debug
  run: |
    echo "Debug information:"
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Current directory: $(pwd)"
    echo "Files in directory: $(ls -la)"
```

### **Check Workflow Status**
- **Green checkmark** ✅ = Success
- **Red X** ❌ = Failure (check logs)
- **Yellow circle** ⚠️ = Running or cancelled
- **Gray circle** ⚪ = Not started or skipped

## 🆘 **Getting Help**

### **Resources**:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Troubleshooting GitHub Actions](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)

### **Common Commands**:
```bash
# Check workflow files
ls -la .github/workflows/

# Test scripts locally
npm run test:environment
npm run test-all-ai-features

# Check environment
cat .env

# Verify dependencies
npm list --depth=0
```

---

**Remember**: Most CI/CD issues are related to missing environment variables or incorrect file paths. Start by checking the workflow logs and verifying your GitHub secrets are properly configured.
