# 🔄 BRANCH RESTRUCTURE PLAN

**Project**: JamStockAnalytics  
**Goal**: Make `gh-pages` the default branch and remove `main`  
**Status**: ⚠️ **PLANNING PHASE - AWAITING CONFIRMATION**

---

## 📋 **PLANNED STEPS**

### **Step 1: Create Backup (RECOMMENDED)**
```bash
# Create backup branch before deletion
git checkout main
git checkout -b backup/main-before-delete
git push origin backup/main-before-delete

# Create backup tag
git tag backup-main-$(date +%Y%m%d)
git push origin backup-main-$(date +%Y%m%d)
```

### **Step 2: Check Branch Protection**
- Go to GitHub repository Settings → Branches
- Check if `main` branch has protection rules
- Remove protection if exists (required for deletion)

### **Step 3: Set Default Branch**
- Go to GitHub repository Settings → General
- Change default branch from `main` to `gh-pages`
- Confirm the change

### **Step 4: Remove Main Branch**
```bash
# Delete local main branch
git branch -d main

# Delete remote main branch
git push origin --delete main
```

### **Step 5: Verify Changes**
- Confirm `gh-pages` is now the default branch
- Verify all content is preserved in `gh-pages`
- Test repository cloning with new default

---

## ⚠️ **IMPORTANT CONSIDERATIONS**

### **Risks:**
- **GitHub Actions**: May need to update workflow files that reference `main`
- **Collaborators**: Will need to update their local repositories
- **Documentation**: Any links to `main` branch will break
- **CI/CD**: Workflows may need branch name updates

### **Benefits:**
- **Simplified Structure**: Single branch for web deployment
- **Direct Deployment**: No need to sync between branches
- **Cleaner Workflow**: All changes go directly to `gh-pages`

---

## 🔧 **REQUIRED UPDATES**

### **GitHub Actions Workflows:**
```yaml
# Update .github/workflows/ci.yml
on:
  push:
    branches: [gh-pages]  # Changed from [main]
  pull_request:
    branches: [gh-pages]  # Changed from [main]
```

### **Documentation Updates:**
- Update any references to `main` branch
- Update cloning instructions
- Update deployment documentation

---

## 🚨 **SAFETY MEASURES**

### **Before Proceeding:**
1. **Create Backup**: Tag or branch backup of `main`
2. **Check Dependencies**: Verify no external systems depend on `main`
3. **Update Workflows**: Modify GitHub Actions if needed
4. **Notify Team**: Inform collaborators of the change

### **Recovery Plan:**
```bash
# If you need to restore main branch
git checkout -b main backup/main-before-delete
git push origin main
```

---

## ✅ **CONFIRMATION REQUIRED**

**Are you sure you want to proceed with this branch restructure?**

**This will:**
- ✅ Make `gh-pages` the default branch
- ✅ Remove the `main` branch completely
- ✅ Require updating GitHub Actions workflows
- ✅ Affect anyone who has cloned the repository

**Type "CONFIRM" to proceed with the branch restructure.**

---

**⚠️ WARNING**: This is a significant change that cannot be easily undone. Please ensure you have backups and have considered all implications before proceeding.
