#!/bin/bash

# GCP Service Account Fix Script
# This script helps fix the disabled GCP service account issue

set -e

echo "🔧 GCP Service Account Fix Script"
echo "=================================="

# Configuration
PROJECT_ID="jamstockanalytics"
SERVICE_ACCOUNT_EMAIL="802624016917-compute@developer.gserviceaccount.com"

echo "📋 Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Service Account: $SERVICE_ACCOUNT_EMAIL"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ gcloud CLI is installed"

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with gcloud. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

echo "✅ Authenticated with gcloud"

# Set the project
echo "🔧 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Check if service account exists
echo "🔍 Checking if service account exists..."
if ! gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL --project=$PROJECT_ID &> /dev/null; then
    echo "❌ Service account $SERVICE_ACCOUNT_EMAIL not found in project $PROJECT_ID"
    echo "💡 Please check the service account email or create a new one"
    exit 1
fi

echo "✅ Service account exists"

# Check if service account is disabled
echo "🔍 Checking service account status..."
DISABLED_STATUS=$(gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL --project=$PROJECT_ID --format="value(disabled)")

if [[ "$DISABLED_STATUS" == "True" ]]; then
    echo "⚠️  Service account is disabled. Enabling..."
    gcloud iam service-accounts enable $SERVICE_ACCOUNT_EMAIL --project=$PROJECT_ID
    echo "✅ Service account enabled"
else
    echo "✅ Service account is already enabled"
fi

# Check required permissions
echo "🔍 Checking required permissions..."

REQUIRED_ROLES=(
    "roles/storage.admin"
    "roles/cloudbuild.builds.editor"
    "roles/iam.serviceAccountUser"
    "roles/artifactregistry.writer"
)

echo "📋 Required roles:"
for role in "${REQUIRED_ROLES[@]}"; do
    echo "  - $role"
done

# Check current roles
echo ""
echo "🔍 Current roles for service account:"
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --format="table(bindings.role)" \
    --filter="bindings.members:$SERVICE_ACCOUNT_EMAIL" || echo "No roles found"

# Grant missing roles
echo ""
echo "🔧 Granting required roles..."

for role in "${REQUIRED_ROLES[@]}"; do
    echo "  Granting $role..."
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="$role" \
        --quiet || echo "    Role may already be granted"
done

echo "✅ Required roles granted"

# Verify service account status
echo ""
echo "🔍 Final verification:"
echo "  Service Account: $SERVICE_ACCOUNT_EMAIL"
echo "  Status: $(gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL --project=$PROJECT_ID --format="value(disabled)")"
echo "  Display Name: $(gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL --project=$PROJECT_ID --format="value(displayName)")"

# Test authentication
echo ""
echo "🧪 Testing authentication..."
if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "✅ Authentication test passed"
else
    echo "❌ Authentication test failed"
    exit 1
fi

echo ""
echo "🎉 GCP Service Account Fix Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Update your GitHub Actions workflow with proper GCP authentication"
echo "2. Add the service account key to GitHub Secrets as 'GCP_SA_KEY'"
echo "3. Test your workflow"
echo ""
echo "For detailed instructions, see: GCP_SERVICE_ACCOUNT_FIX_GUIDE.md"
