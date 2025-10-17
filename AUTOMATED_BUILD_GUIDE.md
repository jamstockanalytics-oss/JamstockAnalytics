# Automated Build System Guide

This guide explains how to use the automated build system for JamStockAnalytics, which eliminates the need for user input during the build process.

## 🚀 Quick Start

### 1. Automated Setup
```bash
# Run the automated setup script
npm run setup:auto
```

### 2. Build All Platforms
```bash
# Build for all platforms without user input
npm run build:auto
```

### 3. CI/CD Pipeline
```bash
# Run the complete CI/CD pipeline
npm run build:ci
```

## 🔧 Alternative Authentication Methods

The system supports multiple authentication methods that don't require user input:

### 1. Service Account Authentication
```bash
# Set environment variables
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export EXPO_PUBLIC_SUPABASE_URL="your-supabase-url"

# Authenticate using service account
npm run auth:service-account
```

### 2. API Key Authentication
```bash
# Set environment variables
export API_KEY="your-api-key"
export EXPO_PUBLIC_SUPABASE_URL="your-supabase-url"
export EXPO_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Authenticate using API key
npm run auth:api-key
```

### 3. JWT Token Authentication
```typescript
import { MultiAuth, AuthMethods } from './lib/auth/multi-auth';

const auth = new MultiAuth(AuthMethods.JWT_TOKEN(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  process.env.JWT_SECRET
));

await auth.authenticate();
```

### 4. OAuth2 Client Credentials
```typescript
import { MultiAuth, AuthMethods } from './lib/auth/multi-auth';

const auth = new MultiAuth(AuthMethods.OAUTH2_CLIENT(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  process.env.OAUTH2_CLIENT_ID,
  process.env.OAUTH2_CLIENT_SECRET
));

await auth.authenticate();
```

## 📦 Build Profiles

The system supports multiple build profiles:

### Development Profile
```bash
# Build for development
eas build --platform all --profile development --non-interactive
```

### Preview Profile
```bash
# Build for preview
eas build --platform all --profile preview --non-interactive
```

### Production Profile
```bash
# Build for production
eas build --platform all --profile production --non-interactive
```

### Automated Profile (Default)
```bash
# Build with automated profile
eas build --platform all --profile automated --non-interactive
```

## 🤖 CI/CD Pipeline

### GitHub Actions Workflow

The automated build system includes a comprehensive GitHub Actions workflow:

```yaml
# .github/workflows/automated-build.yml
name: Automated Build and Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:
    inputs:
      build_profile:
        description: 'Build profile to use'
        required: true
        default: 'automated'
        type: choice
        options:
        - development
        - preview
        - production
        - automated
```

### Required Secrets

Set the following secrets in your GitHub repository:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `DEEPSEEK_API_KEY`: Your DeepSeek API key
- `EXPO_TOKEN`: Your Expo token for builds

### Manual Workflow Dispatch

You can manually trigger builds with specific parameters:

1. Go to Actions tab in GitHub
2. Select "Automated Build and Deploy"
3. Click "Run workflow"
4. Choose build profile and platforms
5. Click "Run workflow"

## 🛠️ Build Commands

### Platform-Specific Builds
```bash
# Android only
npm run build:android:auto

# iOS only
npm run build:ios:auto

# Web only
npm run build:web:auto
```

### Testing Commands
```bash
# Run all tests
npm run test:integration:auto

# Test database connection
npm run test-database

# Test chat integration
npm run test-chat-integration
```

### Deployment Commands
```bash
# Deploy web version
npm run deploy:auto

# Full CI/CD pipeline
npm run build:ci
```

## 🔐 Environment Configuration

### Automatic Environment Setup

The system automatically configures environment variables:

```bash
# Run automated environment setup
node scripts/auto-setup-env.js
```

This creates:
- `.env` file with default values
- Updated `env.example` with all options
- Alternative authentication configurations

### Environment Variables

#### Required Variables
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Optional Variables
```bash
EXPO_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Alternative Authentication Variables
```bash
# Service Account
SUPABASE_SERVICE_ACCOUNT_EMAIL=service@yourcompany.com
SUPABASE_SERVICE_ACCOUNT_PASSWORD=service_password

# API Key
API_KEY=your_api_key

# JWT Token
JWT_SECRET=your_jwt_secret
JWT_ISSUER=your_jwt_issuer
JWT_AUDIENCE=your_jwt_audience

# OAuth2 Client
OAUTH2_CLIENT_ID=your_oauth2_client_id
OAUTH2_CLIENT_SECRET=your_oauth2_client_secret
OAUTH2_TOKEN_URL=your_oauth2_token_url
```

## 📊 Build Automation Script

### Using the Build Automation Script

```bash
# Run full CI/CD pipeline
node scripts/build-automation.js ci

# Build specific platform
node scripts/build-automation.js build android automated

# Run tests only
node scripts/build-automation.js test

# Setup environment and database
node scripts/build-automation.js setup

# Deploy application
node scripts/build-automation.js deploy

# Create build artifacts
node scripts/build-automation.js artifacts
```

### Build Automation Features

- **Environment Validation**: Checks all required environment variables
- **Automated Setup**: Configures environment without user input
- **Database Setup**: Automatically sets up and seeds database
- **Test Suite**: Runs comprehensive test suite
- **Multi-Platform Builds**: Builds for Android, iOS, and Web
- **Deployment**: Automatically deploys to Expo
- **Artifact Creation**: Creates build artifacts and metadata

## 🚨 Troubleshooting

### Common Issues

#### 1. Missing Environment Variables
```bash
# Check environment variables
node scripts/build-automation.js setup
```

#### 2. Database Connection Issues
```bash
# Test database connection
npm run test-database
```

#### 3. Build Failures
```bash
# Check build logs
eas build:list

# Retry build
npm run build:auto
```

#### 4. Authentication Issues
```bash
# Test authentication
npm run auth:service-account
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set debug environment variable
export DEBUG=true

# Run with debug output
node scripts/build-automation.js ci
```

## 📈 Monitoring and Logs

### Build Status

Check build status:
```bash
# List recent builds
eas build:list

# Get build details
eas build:view [BUILD_ID]
```

### Logs

View build logs:
```bash
# View build logs
eas build:logs [BUILD_ID]
```

## 🔄 Continuous Integration

### Automated Triggers

The system automatically triggers builds on:
- Push to `main` branch
- Push to `develop` branch
- Pull requests to `main` branch
- Manual workflow dispatch

### Build Matrix

The CI/CD pipeline builds for:
- **Android**: APK and AAB formats
- **iOS**: IPA format
- **Web**: Static export

### Quality Gates

The pipeline includes quality gates:
- Environment validation
- Database setup verification
- Test suite execution
- Build success verification
- Deployment confirmation

## 📚 Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)

## 🆘 Support

For issues with the automated build system:

1. Check the troubleshooting section above
2. Review build logs in GitHub Actions
3. Verify environment variables are set correctly
4. Ensure all required secrets are configured in GitHub

## 🎯 Best Practices

1. **Always use the automated setup**: `npm run setup:auto`
2. **Test locally before pushing**: `npm run build:ci`
3. **Monitor build status**: Check GitHub Actions tab
4. **Keep secrets secure**: Never commit secrets to repository
5. **Use appropriate build profiles**: development, preview, production, automated
6. **Regular maintenance**: Update dependencies and test regularly

---

This automated build system eliminates the need for user input during the build process while providing comprehensive CI/CD capabilities for the JamStockAnalytics application.
