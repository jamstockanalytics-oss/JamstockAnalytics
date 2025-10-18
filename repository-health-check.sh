#!/bin/bash
# repository-health-check.sh
# Repository health check script as mentioned in CONTEXT.md

echo "🏥 Repository Health Check"
echo "=========================="

# Check repository status
echo "📊 Repository status:"
git status --porcelain

# Check for uncommitted changes
echo "📝 Uncommitted changes:"
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Uncommitted changes detected"
    git status --short
else
    echo "✅ No uncommitted changes"
fi

# Check branch status
echo "🌿 Branch status:"
git branch -v

# Check remote status
echo "🌐 Remote status:"
git remote -v

# Check for merge conflicts
echo "🔀 Merge conflicts:"
if git diff --name-only --diff-filter=U | grep -q .; then
    echo "❌ Merge conflicts detected"
    git diff --name-only --diff-filter=U
else
    echo "✅ No merge conflicts"
fi

# Check for large files
echo "📦 Large files check:"
find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.git/*" | head -10

# Check for sensitive files
echo "🔒 Sensitive files check:"
find . -name "*.env" -o -name "*.key" -o -name "*.pem" -o -name "*.p12" | head -10

# Check package.json integrity
echo "📋 Package.json check:"
if [ -f package.json ]; then
    echo "✅ package.json exists"
    npm audit --audit-level=moderate
else
    echo "❌ package.json not found"
fi

# Check for common issues
echo "🔍 Common issues check:"
if [ -f .gitignore ]; then
    echo "✅ .gitignore exists"
else
    echo "⚠️  .gitignore not found"
fi

if [ -f README.md ]; then
    echo "✅ README.md exists"
else
    echo "⚠️  README.md not found"
fi

echo "🎯 Repository health check complete"
