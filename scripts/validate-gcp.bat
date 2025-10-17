@echo off
echo 🔍 GCP Setup Validation
echo ========================

echo Checking gcloud installation...
gcloud version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ gcloud CLI not found
    echo 💡 Install from: https://cloud.google.com/sdk/docs/install
    exit /b 1
)
echo ✅ gcloud CLI is installed

echo Checking authentication...
gcloud auth list --filter=status:ACTIVE --format="value(account)" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not authenticated
    echo 💡 Run: gcloud auth login
    exit /b 1
)
echo ✅ Authenticated with gcloud

echo Setting project to jamstockanalytics...
gcloud config set project jamstockanalytics

echo Checking service account status...
gcloud iam service-accounts describe 802624016917-compute@developer.gserviceaccount.com --project=jamstockanalytics --format="value(disabled)" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Service account not found
    exit /b 1
)

echo ✅ Service account exists
echo ✅ GCP setup validation complete
echo.
echo Next steps:
echo 1. Ensure GCP_SA_KEY is added to GitHub Secrets
echo 2. Test the GitHub Actions workflow
echo 3. Use automated-build-with-gcp.yml workflow
