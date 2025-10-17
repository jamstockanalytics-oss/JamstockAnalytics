# 🔧 Environment Variables Setup Guide

## 📋 Overview

This guide helps you set up environment variables for your JamStockAnalytics project, including CI/CD configuration and local development.

## 🔐 Required Environment Variables

### Core Supabase Configuration
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_HOST` - Supabase host
- `SUPABASE_PASSWORD` - Supabase password

### Location Configuration
- `LOCATION` - Your deployment location

### AI Configuration
- `DEEPSEEK_API_KEY` - DeepSeek API key for AI features
- `EXPO_PUBLIC_DEEPSEEK_API_KEY` - Public DeepSeek API key

### Additional Configuration
- `EXPO_TOKEN` - Expo token for builds
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - JWT secret for authentication
- `ENCRYPTION_KEY` - Encryption key for data security

## 🚀 Setup Methods

### Method 1: GitHub Secrets (CI/CD)

#### Using GitHub CLI:
```bash
# Install GitHub CLI
winget install GitHub.cli

# Authenticate
gh auth login

# Set secrets
gh secret set SUPABASE_URL --body "https://your-project-ref.supabase.co"
gh secret set SUPABASE_ANON_KEY --body "your-supabase-anon-key"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "your-supabase-service-role-key"
gh secret set SUPABASE_HOST --body "your-supabase-host"
gh secret set SUPABASE_PASSWORD --body "your-password"
gh secret set LOCATION --body "your-location"
gh secret set DEEPSEEK_API_KEY --body "your-deepseek-api-key"
gh secret set EXPO_TOKEN --body "your-expo-token"
```

#### Using GitHub Web Interface:
1. Go to your repository on GitHub
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add each secret with its value

### Method 2: Local Development

#### Create .env file:
```bash
# Copy the template
cp environment-config.env .env

# Edit with your values
notepad .env
```

#### Environment file content:
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_HOST=your-supabase-host
SUPABASE_PASSWORD=your-password
LOCATION=your-location
DEEPSEEK_API_KEY=your-deepseek-api-key
EXPO_PUBLIC_DEEPSEEK_API_KEY=your-deepseek-api-key
EXPO_TOKEN=your-expo-token
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
NODE_ENV=development
ENVIRONMENT=development
```

### Method 3: Supabase Secrets

#### Using Supabase CLI:
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Set secrets from environment file
supabase secrets set --env-file secrets.env
```

## 🔍 Verification

### Check GitHub Secrets:
```bash
gh secret list
```

### Check Supabase Secrets:
```bash
supabase secrets list
```

### Check Local Environment:
```bash
# PowerShell
Get-Content .env

# Bash
cat .env
```

## 🛠️ Automated Setup Scripts

### PowerShell Script:
```powershell
# Run the GitHub secrets setup
.\scripts\setup-github-secrets.ps1

# Run the Supabase secrets setup
.\scripts\setup-supabase-secrets.ps1
```

### Bash Script:
```bash
# Run the GitHub secrets setup
./scripts/setup-github-secrets.sh

# Run the Supabase secrets setup
./scripts/setup-supabase-secrets.sh
```

## 🔒 Security Best Practices

1. **Never commit secrets to version control**
2. **Use different secrets for different environments**
3. **Rotate secrets regularly**
4. **Use environment-specific configuration files**
5. **Monitor secret usage and access**

## 📊 Environment-Specific Configuration

### Development:
```env
NODE_ENV=development
ENVIRONMENT=development
SUPABASE_URL=https://your-dev-project.supabase.co
```

### Production:
```env
NODE_ENV=production
ENVIRONMENT=production
SUPABASE_URL=https://your-prod-project.supabase.co
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Secret not found"**
   - Verify the secret is set in GitHub/Supabase
   - Check the secret name spelling

2. **"Authentication failed"**
   - Re-authenticate with GitHub CLI or Supabase CLI
   - Check your credentials

3. **"Permission denied"**
   - Ensure you have the correct permissions
   - Check your repository access

4. **"Environment variable not loaded"**
   - Verify your .env file is in the correct location
   - Check the file format and syntax

### Getting Help:

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Environment Variables Best Practices](https://12factor.net/config)

## 🎯 Next Steps

After setting up environment variables:

1. **Test your configuration** with a simple build
2. **Deploy your security fixes** using the CI/CD pipeline
3. **Monitor your application** for any configuration issues
4. **Set up monitoring** for secret usage and access

## 📋 Checklist

- [ ] GitHub secrets configured
- [ ] Supabase secrets configured
- [ ] Local .env file created
- [ ] Environment variables verified
- [ ] CI/CD pipeline tested
- [ ] Security fixes deployed
- [ ] Monitoring set up

---

**🔧 Your JamStockAnalytics project is now fully configured with secure environment variables!**