# 🔧 GITHUB UI STEPS REQUIRED

**Action**: Set default branch to `gh-pages`  
**Location**: GitHub Repository Settings  
**Status**: ⚠️ **MANUAL STEP REQUIRED**

---

## 📋 **STEP-BY-STEP INSTRUCTIONS**

### **Step 1: Go to Repository Settings**
1. Navigate to: `https://github.com/jamstockanalytics-oss/JamstockAnalytics`
2. Click on **"Settings"** tab (top right of repository page)
3. Scroll down to **"General"** section

### **Step 2: Change Default Branch**
1. Find **"Default branch"** section
2. Click the **pencil/edit icon** next to the current default branch
3. Select **"gh-pages"** from the dropdown
4. Click **"Update"**
5. Confirm the change when prompted

### **Step 3: Remove Branch Protection (if exists)**
1. In Settings, go to **"Branches"** (left sidebar)
2. Look for any branch protection rules on `main`
3. If found, click **"Delete"** to remove protection
4. This is required before we can delete the `main` branch

---

## ✅ **AFTER COMPLETING UI STEPS**

Once you've completed the GitHub UI steps above, I'll proceed with:

1. **Delete the `main` branch** (both local and remote)
2. **Verify the changes** are working correctly
3. **Test repository cloning** with new default branch

---

## 🚨 **IMPORTANT NOTES**

### **What Happens When You Change Default Branch:**
- ✅ New clones will default to `gh-pages`
- ✅ GitHub UI will show `gh-pages` as the main branch
- ✅ All existing content in `gh-pages` is preserved
- ✅ Web app continues to work at the same URL

### **Safety Measures Already in Place:**
- ✅ Backup branch created: `backup/main-before-delete`
- ✅ Backup tag created: `backup-main-20250117`
- ✅ Workflows updated to use `gh-pages`
- ✅ All content preserved in `gh-pages`

---

**🎯 NEXT**: Complete the GitHub UI steps above, then I'll finish the branch restructure automatically.
