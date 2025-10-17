# 🔐 GitHub Secrets Setup Guide

**Project**: JamStockAnalytics  
**Purpose**: Configure GitHub Secrets for CI/CD pipeline  
**Status**: ✅ **READY FOR CONFIGURATION**

---

## 📋 Required GitHub Secrets

### 1. **EXPO_TOKEN** (Required for Mobile Builds)
```
Name: EXPO_TOKEN
Value: iyfNeQS2OdZ4m2wTzm2QqWkZ607I6gxAttYEjbSU
Purpose: Enables Android and iOS builds via EAS
```

### 2. **DOCKER_USERNAME** (Optional for Docker Hub)
```
Name: DOCKER_USERNAME
Value: your_dockerhub_username
Purpose: Push Docker images to Docker Hub
```

### 3. **DOCKER_PASSWORD** (Optional for Docker Hub)
```
Name: DOCKER_PASSWORD
Value: your_dockerhub_token
Purpose: Authenticate with Docker Hub
```

### 4. **SUPABASE_SECRETS** (If using Supabase)
```
Name: EXPO_PUBLIC_SUPABASE_URL
Value: your_supabase_project_url

Name: EXPO_PUBLIC_SUPABASE_ANON_KEY
Value: your_supabase_anon_key

Name: SUPABASE_SERVICE_ROLE_KEY
Value: your_supabase_service_role_key
```

### 5. **DEEPSEEK_SECRETS** (If using AI features)
```
Name: EXPO_PUBLIC_DEEPSEEK_API_KEY
Value: your_deepseek_api_key
```

---

## 🚀 Setup Instructions

### Step 1: Navigate to GitHub Repository
1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**

### Step 2: Add EXPO_TOKEN Secret
1. Click **"New repository secret"**
2. **Name**: `EXPO_TOKEN`
3. **Value**: `iyfNeQS2OdZ4m2wTzm2QqWkZ607I6gxAttYEjbSU`
4. Click **"Add secret"**

### Step 3: Add Optional Secrets (if needed)
Repeat the process for any additional secrets you need:
- `DOCKER_USERNAME` (for Docker Hub)
- `DOCKER_PASSWORD` (for Docker Hub)
- `EXPO_PUBLIC_SUPABASE_URL` (for Supabase)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` (for Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` (for Supabase)
- `EXPO_PUBLIC_DEEPSEEK_API_KEY` (for AI features)

---

## 🔧 CI/CD Workflow Integration

### Current Workflows Using EXPO_TOKEN:

#### 1. **Main CI Pipeline** (`.github/workflows/ci.yml`)
```yaml
- name: Setup Expo
  uses: expo/expo-github-action@v8
  with:
    expo-version: latest
    token: ${{ secrets.EXPO_TOKEN }}
```

#### 2. **Docker Pipeline** (`.github/workflows/docker.yml`)
```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```

#### 3. **Token Verification** (`.github/workflows/verify-expo-token.yml`)
```yaml
- name: Verify EXPO_TOKEN Secret
  run: |
    if [[ -z "${{ secrets.EXPO_TOKEN }}" ]]; then
      echo "❌ EXPO_TOKEN is NOT set"
      exit 1
    else
      echo "✅ EXPO_TOKEN is configured!"
    fi
```

---

## ✅ Verification Steps

### 1. **Check Secret Configuration**
```bash
# Run the verification workflow
# Go to Actions tab → Verify EXPO_TOKEN Configuration → Run workflow
```

### 2. **Test CI/CD Pipeline**
```bash
# Push a commit to trigger the CI pipeline
git add .
git commit -m "Test CI/CD with EXPO_TOKEN"
git push
```

### 3. **Monitor Build Status**
- Go to **Actions** tab in GitHub
- Check that builds are successful
- Verify Android/iOS builds work with EXPO_TOKEN

---

## 🛠️ Troubleshooting

### Issue 1: EXPO_TOKEN Not Found
**Error**: `❌ EXPO_TOKEN is NOT set`
**Solution**: 
1. Verify secret is added in GitHub repository settings
2. Check secret name is exactly `EXPO_TOKEN`
3. Ensure secret value is correct

### Issue 2: Build Failures
**Error**: Android/iOS builds failing
**Solution**:
1. Verify EXPO_TOKEN is valid and active
2. Check token permissions in Expo dashboard
3. Ensure token has required project access

### Issue 3: Docker Hub Issues
**Error**: Docker push failures
**Solution**:
1. Verify DOCKER_USERNAME and DOCKER_PASSWORD are set
2. Check Docker Hub credentials are valid
3. Ensure repository has push permissions

---

## 📊 Security Best Practices

### Secret Management:
- ✅ **Never commit secrets** to repository
- ✅ **Use GitHub Secrets** for sensitive data
- ✅ **Rotate tokens regularly** (every 90 days)
- ✅ **Limit token permissions** to minimum required
- ✅ **Monitor secret usage** in GitHub Actions logs

### Token Security:
- ✅ **EXPO_TOKEN**: Use project-specific tokens
- ✅ **DOCKER_PASSWORD**: Use access tokens, not passwords
- ✅ **API Keys**: Use least-privilege access
- ✅ **Regular Audits**: Review secret usage monthly

---

## 🚀 Next Steps

### Immediate Actions:
1. ✅ **Add EXPO_TOKEN** to GitHub Secrets
2. ✅ **Test CI/CD pipeline** with a test commit
3. ✅ **Verify builds** are working correctly
4. ✅ **Monitor workflow** execution

### Optional Enhancements:
1. **Add Docker Hub secrets** for container deployment
2. **Configure Supabase secrets** for database integration
3. **Set up DeepSeek secrets** for AI features
4. **Enable automated deployments** to app stores

---

## 📞 Support & Resources

### Documentation:
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Docker Hub Integration](https://docs.docker.com/docker-hub/)

### Verification Commands:
```bash
# Check if secrets are configured (run in GitHub Actions)
echo "EXPO_TOKEN configured: ${{ secrets.EXPO_TOKEN != '' }}"
echo "DOCKER_USERNAME configured: ${{ secrets.DOCKER_USERNAME != '' }}"
```

### Contact:
- **GitHub Issues**: Create issue in repository
- **Expo Support**: [expo.dev/support](https://expo.dev/support)
- **Documentation**: Check project README files

---

**⚠️ IMPORTANT**: Without EXPO_TOKEN in GitHub Secrets, your CI/CD pipeline will fail for mobile builds. Web builds will continue to work normally.

**🚀 Once configured**: All platforms will be available for automated building and deployment through GitHub Actions! 🎉
