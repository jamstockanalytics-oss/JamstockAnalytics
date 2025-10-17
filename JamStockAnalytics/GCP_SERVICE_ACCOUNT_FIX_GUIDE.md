# GCP Service Account Fix Guide

## Problem Description

**Error:** `Provided service account ("projects/jamstockanalytics/serviceAccounts/802624016917-compute@developer.gserviceaccount.com") is disabled: invalid argument`

**Root Cause:** The Google Cloud Platform service account used by GitHub Actions is disabled or has insufficient permissions.

## Solution Steps

### Step 1: Verify Service Account Status

#### A. Check Service Account in Google Cloud Console

1. **Navigate to Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select project: `jamstockanalytics`

2. **Access IAM & Admin:**
   - Go to `IAM & Admin` → `Service Accounts`
   - Search for: `802624016917-compute@developer.gserviceaccount.com`

3. **Check Status:**
   - Verify the service account exists
   - Check if it's enabled (should show "Enabled" status)
   - Note the service account email and ID

#### B. Enable Service Account (if disabled)

1. **In Service Accounts page:**
   - Click on the service account
   - Click "Edit" (pencil icon)
   - Ensure "Disabled" checkbox is unchecked
   - Click "Save"

2. **Alternative - Re-enable via gcloud CLI:**
   ```bash
   gcloud iam service-accounts enable 802624016917-compute@developer.gserviceaccount.com --project=jamstockanalytics
   ```

### Step 2: Verify Required Permissions

#### A. Check IAM Roles

The service account needs these roles for GitHub Actions:

**Required Roles:**
- `Storage Admin` - For artifact storage
- `Cloud Build Editor` - For build operations
- `Service Account User` - For authentication
- `Artifact Registry Writer` - For container registry

#### B. Grant Required Permissions

1. **Via Google Cloud Console:**
   - Go to `IAM & Admin` → `IAM`
   - Find the service account
   - Click "Edit" (pencil icon)
   - Add required roles if missing

2. **Via gcloud CLI:**
   ```bash
   # Grant Storage Admin role
   gcloud projects add-iam-policy-binding jamstockanalytics \
     --member="serviceAccount:802624016917-compute@developer.gserviceaccount.com" \
     --role="roles/storage.admin"

   # Grant Cloud Build Editor role
   gcloud projects add-iam-policy-binding jamstockanalytics \
     --member="serviceAccount:802624016917-compute@developer.gserviceaccount.com" \
     --role="roles/cloudbuild.builds.editor"

   # Grant Service Account User role
   gcloud projects add-iam-policy-binding jamstockanalytics \
     --member="serviceAccount:802624016917-compute@developer.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"

   # Grant Artifact Registry Writer role
   gcloud projects add-iam-policy-binding jamstockanalytics \
     --member="serviceAccount:802624016917-compute@developer.gserviceaccount.com" \
     --role="roles/artifactregistry.writer"
   ```

### Step 3: Update GitHub Actions Workflow

#### A. Add GCP Authentication Step

Add this step to your workflow before any GCP operations:

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}
    # OR use workload identity federation:
    # workload_identity_provider: 'projects/123456789/locations/global/workloadIdentityPools/github/providers/github-provider'
    # service_account: 'your-service-account@your-project.iam.gserviceaccount.com'
```

#### B. Set up Google Cloud SDK

```yaml
- name: Set up Cloud SDK
  uses: google-github-actions/setup-gcloud@v2
  with:
    version: 'latest'
```

#### C. Configure gcloud

```yaml
- name: Configure gcloud
  run: |
    gcloud config set project jamstockanalytics
    gcloud config set account 802624016917-compute@developer.gserviceaccount.com
```

### Step 4: Update GitHub Secrets

#### A. Create Service Account Key

1. **In Google Cloud Console:**
   - Go to `IAM & Admin` → `Service Accounts`
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Download the key file

2. **Add to GitHub Secrets:**
   - Go to your GitHub repository
   - Navigate to `Settings` → `Secrets and variables` → `Actions`
   - Click "New repository secret"
   - Name: `GCP_SA_KEY`
   - Value: Paste the entire JSON key file content

#### B. Alternative: Use Workload Identity Federation

If you prefer not to use service account keys:

1. **Enable Workload Identity:**
   ```bash
   gcloud services enable iamcredentials.googleapis.com
   ```

2. **Create Workload Identity Pool:**
   ```bash
   gcloud iam workload-identity-pools create github \
     --project=jamstockanalytics \
     --location=global \
     --display-name="GitHub Actions Pool"
   ```

3. **Create Provider:**
   ```bash
   gcloud iam workload-identity-pools providers create-oidc github \
     --project=jamstockanalytics \
     --location=global \
     --workload-identity-pool=github \
     --display-name="GitHub Provider" \
     --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
     --issuer-uri="https://token.actions.githubusercontent.com"
   ```

### Step 5: Enhanced Workflow Configuration

#### A. Complete GCP Authentication Setup

```yaml
name: Enhanced Build with GCP Authentication

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

jobs:
  setup-gcp:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
    - uses: actions/checkout@v4
    
    - name: Authenticate to Google Cloud
      uses: google-github-actions/auth@v2
      with:
        credentials_json: ${{ secrets.GCP_SA_KEY }}
        # OR use workload identity:
        # workload_identity_provider: 'projects/jamstockanalytics/locations/global/workloadIdentityPools/github/providers/github-provider'
        # service_account: '802624016917-compute@developer.gserviceaccount.com'
    
    - name: Set up Cloud SDK
      uses: google-github-actions/setup-gcloud@v2
      with:
        version: 'latest'
    
    - name: Configure gcloud
      run: |
        gcloud config set project jamstockanalytics
        gcloud config set account 802624016917-compute@developer.gserviceaccount.com
        gcloud auth list
        gcloud config list
    
    - name: Test GCP Authentication
      run: |
        echo "Testing GCP authentication..."
        gcloud auth list
        gcloud config get-value project
        gcloud iam service-accounts list --filter="email:802624016917-compute@developer.gserviceaccount.com"
```

#### B. Add Error Handling

```yaml
- name: Verify Service Account Status
  run: |
    echo "Checking service account status..."
    gcloud iam service-accounts describe 802624016917-compute@developer.gserviceaccount.com \
      --project=jamstockanalytics \
      --format="value(disabled)"
    
    if [[ "$(gcloud iam service-accounts describe 802624016917-compute@developer.gserviceaccount.com --project=jamstockanalytics --format="value(disabled)")" == "True" ]]; then
      echo "❌ Service account is disabled"
      exit 1
    else
      echo "✅ Service account is enabled"
    fi
```

### Step 6: Troubleshooting

#### A. Common Issues and Solutions

1. **Service Account Disabled:**
   ```bash
   # Enable the service account
   gcloud iam service-accounts enable 802624016917-compute@developer.gserviceaccount.com --project=jamstockanalytics
   ```

2. **Insufficient Permissions:**
   ```bash
   # Check current roles
   gcloud projects get-iam-policy jamstockanalytics \
     --flatten="bindings[].members" \
     --format="table(bindings.role)" \
     --filter="bindings.members:802624016917-compute@developer.gserviceaccount.com"
   ```

3. **Authentication Issues:**
   ```bash
   # Test authentication
   gcloud auth list
   gcloud config get-value project
   gcloud iam service-accounts list
   ```

#### B. Debug Commands

```yaml
- name: Debug GCP Configuration
  run: |
    echo "=== GCP Configuration Debug ==="
    echo "Project: $(gcloud config get-value project)"
    echo "Account: $(gcloud config get-value account)"
    echo "Service Account Status:"
    gcloud iam service-accounts describe 802624016917-compute@developer.gserviceaccount.com \
      --project=jamstockanalytics \
      --format="table(displayName,email,disabled)"
    echo "Available Service Accounts:"
    gcloud iam service-accounts list --format="table(displayName,email,disabled)"
```

### Step 7: Alternative Solutions

#### A. Create New Service Account

If the current service account cannot be fixed:

1. **Create New Service Account:**
   ```bash
   gcloud iam service-accounts create github-actions-sa \
     --display-name="GitHub Actions Service Account" \
     --description="Service account for GitHub Actions CI/CD" \
     --project=jamstockanalytics
   ```

2. **Grant Required Roles:**
   ```bash
   gcloud projects add-iam-policy-binding jamstockanalytics \
     --member="serviceAccount:github-actions-sa@jamstockanalytics.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   
   gcloud projects add-iam-policy-binding jamstockanalytics \
     --member="serviceAccount:github-actions-sa@jamstockanalytics.iam.gserviceaccount.com" \
     --role="roles/cloudbuild.builds.editor"
   ```

3. **Create and Download Key:**
   ```bash
   gcloud iam service-accounts keys create github-actions-key.json \
     --iam-account=github-actions-sa@jamstockanalytics.iam.gserviceaccount.com
   ```

#### B. Use Workload Identity Federation

For better security (recommended):

1. **Enable APIs:**
   ```bash
   gcloud services enable iamcredentials.googleapis.com
   gcloud services enable sts.googleapis.com
   ```

2. **Create Workload Identity Pool:**
   ```bash
   gcloud iam workload-identity-pools create github \
     --project=jamstockanalytics \
     --location=global \
     --display-name="GitHub Actions Pool"
   ```

3. **Create Provider:**
   ```bash
   gcloud iam workload-identity-pools providers create-oidc github \
     --project=jamstockanalytics \
     --location=global \
     --workload-identity-pool=github \
     --display-name="GitHub Provider" \
     --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
     --issuer-uri="https://token.actions.githubusercontent.com"
   ```

4. **Allow GitHub Actions to impersonate service account:**
   ```bash
   gcloud iam service-accounts add-iam-policy-binding \
     --role="roles/iam.workloadIdentityUser" \
     --member="principalSet://iam.googleapis.com/projects/jamstockanalytics/locations/global/workloadIdentityPools/github/attribute.repository/your-org/your-repo" \
     802624016917-compute@developer.gserviceaccount.com
   ```

## Verification Steps

### 1. Test Service Account Status
```bash
gcloud iam service-accounts describe 802624016917-compute@developer.gserviceaccount.com \
  --project=jamstockanalytics \
  --format="value(disabled)"
```

### 2. Test Authentication
```bash
gcloud auth list
gcloud config get-value project
```

### 3. Test Permissions
```bash
gcloud projects get-iam-policy jamstockanalytics \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:802624016917-compute@developer.gserviceaccount.com"
```

## Prevention

### 1. Regular Monitoring
- Set up alerts for service account status changes
- Monitor IAM policy changes
- Regular permission audits

### 2. Best Practices
- Use Workload Identity Federation instead of service account keys
- Implement least privilege principle
- Regular rotation of credentials
- Monitor service account usage

## Conclusion

The "service account disabled" error can be resolved by:

1. ✅ **Enabling the service account** in Google Cloud Console
2. ✅ **Verifying required permissions** are granted
3. ✅ **Updating GitHub Actions workflow** with proper authentication
4. ✅ **Adding error handling** for better debugging
5. ✅ **Implementing monitoring** to prevent future issues

Follow the steps above to resolve the issue and prevent it from happening again.
