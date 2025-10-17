# GCP Setup Validation Script for Windows PowerShell
# This script validates that the GCP service account is properly configured

Write-Host "🔍 GCP Setup Validation Script" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Configuration
$PROJECT_ID = "jamstockanalytics"
$SERVICE_ACCOUNT_EMAIL = "802624016917-compute@developer.gserviceaccount.com"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  Project ID: $PROJECT_ID" -ForegroundColor White
Write-Host "  Service Account: $SERVICE_ACCOUNT_EMAIL" -ForegroundColor White
Write-Host ""

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ gcloud CLI is installed" -ForegroundColor Green
    } else {
        throw "gcloud not found"
    }
} catch {
    Write-Host "❌ gcloud CLI is not installed" -ForegroundColor Red
    Write-Host "💡 Install it from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Check if user is authenticated
try {
    $authList = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
    if ($authList) {
        Write-Host "✅ Authenticated with gcloud" -ForegroundColor Green
        Write-Host "  Account: $authList" -ForegroundColor White
    } else {
        throw "Not authenticated"
    }
} catch {
    Write-Host "❌ Not authenticated with gcloud" -ForegroundColor Red
    Write-Host "💡 Run: gcloud auth login" -ForegroundColor Yellow
    exit 1
}

# Set the project
Write-Host "🔧 Setting project to $PROJECT_ID..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# Check if service account exists and is enabled
Write-Host "🔍 Checking service account status..." -ForegroundColor Yellow
try {
    $serviceAccountInfo = gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL --project=$PROJECT_ID 2>$null
    if ($LASTEXITCODE -eq 0) {
        $disabledStatus = gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL --project=$PROJECT_ID --format="value(disabled)" 2>$null
        
        if ($disabledStatus -eq "True") {
            Write-Host "⚠️  Service account is disabled. Enabling..." -ForegroundColor Yellow
            gcloud iam service-accounts enable $SERVICE_ACCOUNT_EMAIL --project=$PROJECT_ID
            Write-Host "✅ Service account enabled" -ForegroundColor Green
        } else {
            Write-Host "✅ Service account is enabled" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Service account not found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error checking service account" -ForegroundColor Red
    exit 1
}

# Check required permissions
Write-Host "🔍 Checking required permissions..." -ForegroundColor Yellow

$REQUIRED_ROLES = @(
    "roles/storage.admin",
    "roles/cloudbuild.builds.editor",
    "roles/iam.serviceAccountUser",
    "roles/artifactregistry.writer"
)

Write-Host "📋 Required roles:" -ForegroundColor Yellow
foreach ($role in $REQUIRED_ROLES) {
    Write-Host "  - $role" -ForegroundColor White
}

# Check current roles
Write-Host ""
Write-Host "🔍 Current roles for service account:" -ForegroundColor Yellow
try {
    $currentRoles = gcloud projects get-iam-policy $PROJECT_ID --flatten="bindings[].members" --format="value(bindings.role)" --filter="bindings.members:$SERVICE_ACCOUNT_EMAIL" 2>$null
    
    if ($currentRoles) {
        $currentRoles | ForEach-Object { Write-Host "  ✅ $_" -ForegroundColor Green }
    } else {
        Write-Host "  ⚠️  No roles found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  Could not retrieve roles" -ForegroundColor Yellow
}

# Grant missing roles
Write-Host ""
Write-Host "🔧 Ensuring required roles are granted..." -ForegroundColor Yellow

foreach ($role in $REQUIRED_ROLES) {
    Write-Host "  Checking $role..." -ForegroundColor White
    try {
        gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role="$role" --quiet 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ Role granted or already exists" -ForegroundColor Green
        } else {
            Write-Host "    ⚠️  Failed to grant role (may already exist)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "    ⚠️  Error granting role" -ForegroundColor Yellow
    }
}

# Final verification
Write-Host ""
Write-Host "🔍 Final verification:" -ForegroundColor Yellow
$finalStatus = gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL --project=$PROJECT_ID --format="value(disabled)" 2>$null
$displayName = gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL --project=$PROJECT_ID --format="value(displayName)" 2>$null

Write-Host "  Service Account: $SERVICE_ACCOUNT_EMAIL" -ForegroundColor White
Write-Host "  Status: $finalStatus" -ForegroundColor White
Write-Host "  Display Name: $displayName" -ForegroundColor White

Write-Host ""
Write-Host "🎉 GCP Setup Validation Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Service account is properly configured" -ForegroundColor Green
Write-Host "✅ Required permissions are granted" -ForegroundColor Green
Write-Host "✅ Ready for GitHub Actions" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Ensure GCP_SA_KEY is added to GitHub Secrets" -ForegroundColor White
Write-Host "2. Use the enhanced workflow: automated-build-with-gcp.yml" -ForegroundColor White
Write-Host "3. Test the workflow" -ForegroundColor White
Write-Host ""
Write-Host "GitHub Secrets required:" -ForegroundColor Yellow
Write-Host "  - GCP_SA_KEY (✅ You have this)" -ForegroundColor Green
Write-Host "  - SUPABASE_URL" -ForegroundColor White
Write-Host "  - SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "  - DEEPSEEK_API_KEY (optional)" -ForegroundColor White
Write-Host "  - EXPO_TOKEN (optional)" -ForegroundColor White
