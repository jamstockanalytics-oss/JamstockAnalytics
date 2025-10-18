#!/bin/bash
# workflow-status-check.sh
# GitHub Actions workflow status check script

echo "🔄 Workflow Status Check"
echo "========================"

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Please install gh CLI first."
    exit 1
fi

# Check authentication
echo "🔐 GitHub authentication:"
if gh auth status &> /dev/null; then
    echo "✅ Authenticated with GitHub"
else
    echo "❌ Not authenticated with GitHub"
    echo "Please run: gh auth login"
    exit 1
fi

# Check recent workflow runs
echo "📊 Recent workflow runs:"
gh run list --limit 10

# Check webhook deployment workflow
echo "🔗 Webhook deployment workflow:"
gh run list --workflow=webhook-deploy.yml --limit 5

# Check webhook monitoring workflow
echo "📈 Webhook monitoring workflow:"
gh run list --workflow=webhook-monitor.yml --limit 5

# Check for failed runs
echo "❌ Failed workflow runs:"
gh run list --status=failure --limit 5

# Check for in-progress runs
echo "⏳ In-progress workflow runs:"
gh run list --status=in_progress --limit 5

# Check workflow status summary
echo "📋 Workflow status summary:"
echo "Total runs: $(gh run list --limit 100 | wc -l)"
echo "Successful runs: $(gh run list --status=success --limit 100 | wc -l)"
echo "Failed runs: $(gh run list --status=failure --limit 100 | wc -l)"
echo "In-progress runs: $(gh run list --status=in_progress --limit 100 | wc -l)"

echo "🎯 Workflow status check complete"
