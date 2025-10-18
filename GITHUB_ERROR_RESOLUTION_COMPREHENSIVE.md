# 🔧 GitHub Error Resolution Guide

## 📋 Table of Contents

1. [Common GitHub Issues](#common-github-issues)
2. [Troubleshooting Steps](#troubleshooting-steps)
3. [Prevention Strategies](#prevention-strategies)
4. [Emergency Recovery](#emergency-recovery)
5. [Monitoring & Alerts](#monitoring--alerts)
6. [Best Practices](#best-practices)

---

## 🚨 Common GitHub Issues

### 1. "Fix errors and configure HTML deployment"

**Symptoms:**
- GitHub shows "Fix errors and configure HTML deployment" in repository status
- HTML deployment appears to be working but GitHub still reports issues
- Repository has multiple branches with different configurations

**Root Cause:**
- GitHub's status checks are based on the default branch (usually `master` or `main`)
- If the `gh-pages` branch has the correct configuration but the default branch doesn't, GitHub will still report issues
- Branch synchronization problems between `master` and `gh-pages`

**Solution:**
```bash
# 1. Check current branch status
git branch -a
git status

# 2. Switch to default branch
git checkout master
# or
git checkout main

# 3. Merge gh-pages into default branch
git merge gh-pages

# 4. Push changes
git push origin master

# 5. Verify resolution
git log --oneline -5
```

### 2. GitHub Actions Workflow Failures

**Symptoms:**
- Workflows fail with syntax errors
- Conditional logic not working properly
- Missing environment variables
- Docker build failures

**Common Fixes:**

#### YAML Syntax Issues
```yaml
# ✅ Correct conditional syntax
if: ${{ secrets.EXPO_TOKEN != '' }}

# ❌ Incorrect syntax
if: ${{ secrets.EXPO_TOKEN }}
```

#### PowerShell Syntax Issues
```powershell
# ✅ Correct string formatting
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green

# ❌ Incorrect syntax
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
```

#### Docker Workflow Issues
```yaml
# ✅ Correct metadata extraction
- name: Extract metadata
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: jamstockanalytics
    tags: |
      type=ref,event=branch
      type=ref,event=pr
      type=sha,prefix={{branch}}-
      type=raw,value=latest,enable={{is_default_branch}}
```

### 3. HTML Deployment Problems

**Symptoms:**
- HTML files not deploying correctly
- Missing static assets
- GitHub Pages not updating
- 404 errors on deployed site

**Solution:**

#### Create Proper HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JamStockAnalytics</title>
    <link rel="stylesheet" href="static/css/main.css">
</head>
<body>
    <!-- Content -->
    <script src="static/js/main.js"></script>
</body>
</html>
```

#### Create Static Assets Structure
```
static/
├── css/
│   └── main.css
├── js/
│   └── main.js
└── images/
    └── logo.png
```

#### Configure GitHub Pages
1. Go to repository Settings
2. Navigate to Pages section
3. Select source: Deploy from a branch
4. Choose branch: gh-pages
5. Select folder: / (root)

### 4. Branch Protection Issues

**Symptoms:**
- Cannot push to protected branches
- Workflow failures due to branch protection
- Merge conflicts

**Solution:**
```bash
# Check branch protection rules
git config --get branch.master.protection

# Temporarily disable protection (if you have admin access)
# Go to repository Settings → Branches → Edit protection rules

# Force push (use with caution)
git push --force-with-lease origin master
```

### 5. Environment Variables Issues

**Symptoms:**
- Workflows fail with "secrets not found"
- API keys not working
- Authentication failures

**Solution:**
1. Go to repository Settings → Secrets and variables → Actions
2. Add required secrets:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`
   - `EXPO_TOKEN`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### 6. Docker Build Failures

**Symptoms:**
- Docker builds fail in GitHub Actions
- Image not found errors
- Build timeout issues

**Solution:**
```yaml
# ✅ Correct Docker workflow
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./Dockerfile
    platforms: linux/amd64,linux/arm64
    push: ${{ github.event_name != 'pull_request' }}
    tags: ${{ steps.meta.outputs.tags }}
    labels: ${{ steps.meta.outputs.labels }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

---

## 🔍 Troubleshooting Steps

### Step 1: Verify Repository Status
```bash
# Check current branch
git branch

# Check status
git status

# Check remote branches
git branch -a

# Check last commit
git log --oneline -5
```

### Step 2: Check GitHub Actions
1. Go to repository Actions tab
2. Check workflow runs
3. Review failed jobs
4. Check logs for specific errors
5. Verify environment variables

### Step 3: Verify HTML Configuration
1. Check if `index.html` exists in root
2. Verify static assets are present
3. Test HTML locally
4. Check GitHub Pages settings

### Step 4: Branch Synchronization
```bash
# Switch to default branch
git checkout master

# Merge gh-pages
git merge gh-pages

# Push changes
git push origin master

# Verify both branches
git checkout gh-pages
git log --oneline -3
git checkout master
git log --oneline -3
```

### Step 5: Test Deployment
```bash
# Test HTML locally
python -m http.server 8000
# or
npx serve .

# Test Docker locally
docker build -t jamstockanalytics .
docker run -p 8081:8081 jamstockanalytics
```

---

## 🛡️ Prevention Strategies

### 1. Consistent Branch Management
- Always work on the default branch for main development
- Use `gh-pages` only for deployment
- Regularly sync branches
- Use feature branches for development

### 2. Proper Workflow Configuration
- Use correct YAML syntax
- Test workflows locally
- Validate environment variables
- Use proper conditional logic

### 3. HTML Deployment Best Practices
- Keep HTML files in root directory
- Use relative paths for assets
- Test deployment locally first
- Use proper meta tags

### 4. Regular Maintenance
- Monitor GitHub status regularly
- Check for workflow failures
- Update dependencies regularly
- Review and update documentation

### 5. Code Quality
- Use linting tools
- Write comprehensive tests
- Use proper error handling
- Document all changes

---

## 🚑 Emergency Recovery

### If Repository is Completely Broken:

#### 1. Backup Current State
```bash
# Create backup branch
git stash
git branch backup-$(date +%Y%m%d)

# Save current state
git add .
git commit -m "Emergency backup before recovery"
```

#### 2. Reset to Working State
```bash
# Reset to previous commit
git reset --hard HEAD~1

# Or reset to specific commit
git reset --hard <commit-hash>

# Force push (use with caution)
git push --force-with-lease origin master
```

#### 3. Recreate from Scratch
```bash
# Clone fresh repository
git clone https://github.com/username/repository.git
cd repository

# Copy working files
cp -r /path/to/working/files/* .

# Commit and push
git add .
git commit -m "Recovery: Restore working state"
git push origin master
```

### If GitHub Pages is Not Working:

#### 1. Check Settings
- Repository Settings → Pages
- Verify source branch
- Check folder selection
- Confirm custom domain (if used)

#### 2. Re-deploy
```bash
# Switch to gh-pages branch
git checkout gh-pages

# Force update
git push origin gh-pages --force

# Switch back to master
git checkout master
```

#### 3. Wait for Deployment
- GitHub Pages can take 5-10 minutes to update
- Check Actions tab for deployment status
- Verify site is accessible

### If Docker Builds Fail:

#### 1. Check Dockerfile
```dockerfile
# Ensure proper base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 8081

# Start application
CMD ["npm", "start"]
```

#### 2. Test Locally
```bash
# Build image
docker build -t jamstockanalytics .

# Run container
docker run -p 8081:8081 jamstockanalytics

# Check logs
docker logs <container-id>
```

---

## 📊 Monitoring & Alerts

### Set Up Monitoring:

#### 1. GitHub Notifications
- Enable email notifications for workflow failures
- Set up branch protection rules
- Configure status checks

#### 2. External Monitoring
- Use services like UptimeRobot
- Monitor website availability
- Check deployment status
- Set up alerts for downtime

#### 3. Regular Health Checks
- Weekly repository status review
- Monthly workflow audit
- Quarterly dependency updates
- Annual security review

### Monitoring Scripts:

#### Repository Health Check
```bash
#!/bin/bash
# repository-health-check.sh

echo "🔍 Checking repository health..."

# Check branch status
echo "📊 Branch status:"
git branch -a

# Check last commit
echo "📝 Last commit:"
git log --oneline -1

# Check remote status
echo "🌐 Remote status:"
git remote -v

# Check for uncommitted changes
echo "📋 Working directory status:"
git status --porcelain

echo "✅ Repository health check complete"
```

#### Workflow Status Check
```bash
#!/bin/bash
# workflow-status-check.sh

echo "🔍 Checking workflow status..."

# Check recent workflow runs
gh run list --limit 10

# Check failed runs
gh run list --status failure --limit 5

# Check current status
gh run list --status in_progress

echo "✅ Workflow status check complete"
```

---

## 🎯 Best Practices

### 1. Repository Management
- Keep branches synchronized
- Use meaningful commit messages
- Regular backups
- Proper documentation

### 2. Workflow Design
- Test workflows locally
- Use proper error handling
- Implement rollback strategies
- Monitor performance

### 3. Security
- Use secrets for sensitive data
- Regular security audits
- Update dependencies
- Implement proper access controls

### 4. Documentation
- Keep documentation updated
- Document all changes
- Provide troubleshooting guides
- Include examples

### 5. Testing
- Test all changes locally
- Use staging environments
- Implement automated testing
- Regular health checks

---

## 📞 Support Resources

### Repository Links
- **Main Repository:** https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly
- **Master Branch:** https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly/tree/master
- **gh-pages Branch:** https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly/tree/gh-pages
- **Actions:** https://github.com/jamstockanalytics-oss/JamstockAnalyticsWebOnly/actions

### Live Site
- **Main Site:** https://jamstockanalytics-oss.github.io/JamstockAnalyticsWebOnly/
- **Config Page:** https://jamstockanalytics-oss.github.io/JamstockAnalyticsWebOnly/web-config.html
- **Preview Page:** https://jamstockanalytics-oss.github.io/JamstockAnalyticsWebOnly/web-preview.html

### Documentation
- **API Documentation:** [Link to API docs]
- **Deployment Guide:** [Link to deployment guide]
- **Contributing Guidelines:** [Link to contributing guide]
- **Troubleshooting Guide:** This document

---

## 🎉 Success Metrics

### Repository Health
- ✅ No GitHub errors
- ✅ All workflows passing
- ✅ Branches synchronized
- ✅ Documentation updated

### Deployment Status
- ✅ HTML deployment working
- ✅ Docker builds successful
- ✅ GitHub Pages live
- ✅ All features functional

### Monitoring
- ✅ Health checks passing
- ✅ Alerts configured
- ✅ Regular maintenance
- ✅ Performance optimized

---

**Last Updated:** December 2024  
**Status:** ✅ Active Maintenance  
**Next Review:** Monthly  
**Support:** Complete documentation provided
