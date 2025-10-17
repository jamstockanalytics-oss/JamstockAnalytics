# Quick Environment Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Run the automated setup script
```bash
npm run setup:env
```

This will:
- Create your `.env` file from the template
- Guide you through entering your API keys
- Test your connections
- Validate your configuration

### Step 2: Get your API keys

#### Supabase (Required)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing
3. Go to Settings → API
4. Copy:
   - Project URL
   - Anon (public) key  
   - Service role key

#### DeepSeek AI (Required)
1. Go to [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### Step 3: Test your setup
```bash
npm run test:environment
```

### Step 4: Start developing
```bash
npm start
```

## 🔧 Manual Setup

If you prefer to set up manually:

### 1. Copy the environment template
```bash
cp env.example .env
```

### 2. Edit your `.env` file
Replace the placeholder values with your actual API keys:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# DeepSeek AI Configuration  
EXPO_PUBLIC_DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
```

### 3. Generate security secrets
```bash
# Generate JWT secret
openssl rand -hex 16

# Generate session secret  
openssl rand -hex 16
```

Add them to your `.env` file:
```env
JWT_SECRET=your_generated_jwt_secret_here
SESSION_SECRET=your_generated_session_secret_here
```

## ✅ Verification

Run the test script to verify everything is working:

```bash
npm run test:environment
```

Expected output:
```
🧪 JamStockAnalytics Environment Tests
=====================================

✅ Environment File - .env file exists
✅ Environment Template - env.example file exists
✅ Required Variable: EXPO_PUBLIC_SUPABASE_URL - Properly configured
✅ Required Variable: EXPO_PUBLIC_SUPABASE_ANON_KEY - Properly configured
✅ Required Variable: SUPABASE_SERVICE_ROLE_KEY - Properly configured
✅ Required Variable: EXPO_PUBLIC_DEEPSEEK_API_KEY - Properly configured
✅ Supabase URL Format - URL format looks correct
✅ DeepSeek API Key Format - API key format looks correct
✅ Supabase Connection - Connection successful
✅ DeepSeek API Connection - API connection successful

📊 Summary:
============
✅ Passed: 9
❌ Failed: 0
⚠️  Warnings: 0

📊 Success Rate: 100.0%
🎉 All tests passed! Your environment is properly configured.
```

## 🚨 Troubleshooting

### Common Issues

**❌ Supabase Connection Failed**
- Check your Supabase URL and keys
- Ensure your project is active
- Verify RLS policies are set up

**❌ DeepSeek API Errors**
- Verify your API key is correct
- Check your API quota
- Ensure you have sufficient credits

**❌ Environment Variables Not Loading**
- Ensure `.env` file is in the root directory
- Check for typos in variable names
- Restart your development server

### Debug Commands

```bash
# Check environment variables
node -e "console.log(process.env)"

# Test Supabase connection
npm run test-database

# Test AI service
npm run test-chat-integration

# Test full integration
npm run test-full-integration
```

## 📚 Next Steps

After setting up your environment:

1. **Set up the database**: `npm run setup-database`
2. **Seed the database**: `npm run seed-database`
3. **Test the full integration**: `npm run test-full-integration`
4. **Start the development server**: `npm start`
5. **Begin development and testing**

## 🔗 Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [DeepSeek Platform](https://platform.deepseek.com/)
- [Full Environment Setup Guide](ENVIRONMENT_SETUP_GUIDE.md)
- [Project Documentation](CONTEXT.md)

## 💡 Tips

- Keep your API keys secure and never commit them to version control
- Use different keys for development, staging, and production
- Monitor your API usage to prevent quota exhaustion
- Set up proper CORS policies for production
- Implement rate limiting for production use
