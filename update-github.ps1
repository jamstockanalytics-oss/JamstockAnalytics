# GitHub Update Script for JamStockAnalytics
# This script helps apply all automated build system updates to GitHub

Write-Host "🚀 JamStockAnalytics GitHub Update Script" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Check if Git is installed
Write-Host "🔍 Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://git-scm.com/download/win" -ForegroundColor Cyan
    Write-Host "2. Or install via winget: winget install Git.Git" -ForegroundColor Cyan
    Write-Host "3. Or install via chocolatey: choco install git" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installing Git, restart your terminal and run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if we're in a Git repository
Write-Host ""
Write-Host "🔍 Checking Git repository status..." -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain
    Write-Host "✅ Git repository detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Not a Git repository or Git not initialized" -ForegroundColor Red
    Write-Host ""
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

# Check current branch
Write-Host ""
Write-Host "🔍 Checking current branch..." -ForegroundColor Yellow
try {
    $currentBranch = git branch --show-current
    if ($currentBranch -eq "") {
        Write-Host "⚠️ No branch selected, creating main branch..." -ForegroundColor Yellow
        git checkout -b main
        $currentBranch = "main"
    }
    Write-Host "✅ Current branch: $currentBranch" -ForegroundColor Green
} catch {
    Write-Host "❌ Error checking branch" -ForegroundColor Red
    exit 1
}

# Check for remote repository
Write-Host ""
Write-Host "🔍 Checking for remote repository..." -ForegroundColor Yellow
try {
    $remoteUrl = git remote get-url origin
    Write-Host "✅ Remote repository found: $remoteUrl" -ForegroundColor Green
} catch {
    Write-Host "⚠️ No remote repository configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To add a remote repository, run:" -ForegroundColor Cyan
    Write-Host "git remote add origin https://github.com/yourusername/yourrepository.git" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or if you haven't created a GitHub repository yet:" -ForegroundColor Yellow
    Write-Host "1. Go to https://github.com/new" -ForegroundColor Cyan
    Write-Host "2. Create a new repository named 'JamStockAnalytics'" -ForegroundColor Cyan
    Write-Host "3. Copy the repository URL" -ForegroundColor Cyan
    Write-Host "4. Run: git remote add origin <repository-url>" -ForegroundColor Cyan
}

# Show current changes
Write-Host ""
Write-Host "📋 Current changes to be committed:" -ForegroundColor Yellow
try {
    $changes = git status --porcelain
    if ($changes) {
        Write-Host "The following files will be added/updated:" -ForegroundColor Cyan
        $changes | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    } else {
        Write-Host "No changes detected" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error checking changes" -ForegroundColor Red
}

# Add all changes
Write-Host ""
Write-Host "📦 Adding all changes to Git..." -ForegroundColor Yellow
try {
    git add .
    Write-Host "✅ All changes added to Git" -ForegroundColor Green
} catch {
    Write-Host "❌ Error adding changes" -ForegroundColor Red
    exit 1
}

# Create commit
Write-Host ""
Write-Host "💾 Creating commit..." -ForegroundColor Yellow
$commitMessage = @"
feat: implement automated build system with non-interactive authentication

- Add automated build scripts and CI/CD pipeline
- Implement multi-authentication system (service account, API key, JWT, OAuth2)
- Create GitHub Actions workflow for automated builds
- Add comprehensive documentation and troubleshooting guides
- Update EAS build configuration for non-interactive builds
- Add automated environment setup and validation
- Support for Android, iOS, and Web platform builds
- Include quality gates and automated testing
"@

try {
    git commit -m $commitMessage
    Write-Host "✅ Commit created successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating commit" -ForegroundColor Red
    exit 1
}

# Push to GitHub
Write-Host ""
Write-Host "🚀 Pushing changes to GitHub..." -ForegroundColor Yellow
try {
    git push origin $currentBranch
    Write-Host "✅ Changes pushed to GitHub successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error pushing to GitHub" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible solutions:" -ForegroundColor Yellow
    Write-Host "1. Check your GitHub credentials" -ForegroundColor Cyan
    Write-Host "2. Use personal access token for authentication" -ForegroundColor Cyan
    Write-Host "3. Verify repository permissions" -ForegroundColor Cyan
    Write-Host "4. Check internet connection" -ForegroundColor Cyan
}

# Show next steps
Write-Host ""
Write-Host "🎉 GitHub update completed!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure GitHub secrets in your repository:" -ForegroundColor Cyan
Write-Host "   - Go to Settings → Secrets and variables → Actions" -ForegroundColor White
Write-Host "   - Add: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "   - Add: DEEPSEEK_API_KEY, EXPO_TOKEN" -ForegroundColor White
Write-Host ""
Write-Host "2. Test the automated build system:" -ForegroundColor Cyan
Write-Host "   - Go to Actions tab in GitHub" -ForegroundColor White
Write-Host "   - Click 'Automated Build and Deploy'" -ForegroundColor White
Write-Host "   - Click 'Run workflow'" -ForegroundColor White
Write-Host ""
Write-Host "3. Monitor build progress:" -ForegroundColor Cyan
Write-Host "   - Watch the workflow run in real-time" -ForegroundColor White
Write-Host "   - Check logs for any issues" -ForegroundColor White
Write-Host "   - Verify all steps complete successfully" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "- AUTOMATED_BUILD_GUIDE.md - Complete build system guide" -ForegroundColor Cyan
Write-Host "- GITHUB_UPDATE_GUIDE.md - This update guide" -ForegroundColor Cyan
Write-Host "- .github/workflows/automated-build.yml - CI/CD pipeline" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Your automated build system is now ready!" -ForegroundColor Green
