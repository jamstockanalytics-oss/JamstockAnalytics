# Complete Render Setup for JamStockAnalytics

## 🚀 **Your Render Deployment Checklist**

### **Step 1: Deploy to Render**

1. **Go to**: https://render.com
2. **Sign up/Login** with GitHub
3. **Click "New +" → "Web Service"**
4. **Connect repository**: `jamstockanalytics-oss/JamstockAnalyticsWebOnly`
5. **Configure**:
   - **Name**: `jamstockanalytics-app`
   - **Environment**: `Node`
   - **Plan**: `Free`
   - **Build Command**: `cd JamStockAnalytics && npm install && npm run build:web:optimized`
   - **Start Command**: `cd JamStockAnalytics && npx serve web-build -p $PORT`

### **Step 2: Set Up Supabase Database**

#### **2.1 Create Supabase Project**
1. **Go to**: https://supabase.com
2. **Create new project**
3. **Get your credentials**:
   - Project URL: `https://your-project-id.supabase.co`
   - Anon Key: `eyJ...` (starts with eyJ)
   - Service Role Key: `eyJ...` (starts with eyJ)

#### **2.2 Set Up Database Schema**
Run these commands in your Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create articles table
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  source_url TEXT,
  source_name TEXT,
  publication_date TIMESTAMP WITH TIME ZONE,
  ai_priority_score INTEGER DEFAULT 5,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table
CREATE TABLE chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
```

### **Step 3: Set Up DeepSeek AI**

1. **Go to**: https://platform.deepseek.com
2. **Sign up/Login**
3. **Get your API key**
4. **Copy the key** (starts with `sk-`)

### **Step 4: Configure Render Environment Variables**

In your Render dashboard, add these environment variables:

```
NODE_ENV = production
EXPO_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY = your_anon_key_here
EXPO_PUBLIC_DEEPSEEK_API_KEY = your_deepseek_api_key_here
```

### **Step 5: Deploy and Test**

1. **Click "Create Web Service"**
2. **Wait for build** (5-10 minutes)
3. **Get your app URL** (e.g., `https://jamstockanalytics-app.onrender.com`)
4. **Test your application**:
   - User registration/login
   - AI chat functionality
   - News analysis features

## 🔧 **Environment Variables Reference**

### **Required Variables:**
```bash
NODE_ENV=production
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_DEEPSEEK_API_KEY=sk-...
```

### **Optional Variables:**
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # For admin operations
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_TEMPERATURE=0.7
```

## 🎯 **After Deployment**

### **Test Your Application:**
1. **Visit your Render URL**
2. **Test user registration**
3. **Test AI chat**
4. **Test news analysis**
5. **Check database connections**

### **Monitor Your App:**
1. **Render dashboard** for logs
2. **Supabase dashboard** for database
3. **DeepSeek dashboard** for API usage

## 🚀 **Complete CI/CD Pipeline**

Your complete pipeline now includes:
1. **Code changes** → GitHub
2. **Docker build** → Docker Hub
3. **Webhook trigger** → Render webhook
4. **Main app deployment** → Render
5. **Automatic updates** → Live application

## 📊 **Production Checklist**

- [ ] Render app deployed
- [ ] Supabase database configured
- [ ] DeepSeek AI integrated
- [ ] Environment variables set
- [ ] Application tested
- [ ] CI/CD pipeline working
- [ ] Monitoring set up

## 🎉 **You're Ready!**

Your JamStockAnalytics application will be live on Render with:
- ✅ AI-powered financial news analysis
- ✅ DeepSeek chat integration
- ✅ Supabase database
- ✅ Complete CI/CD pipeline
- ✅ Production-ready deployment

**Follow the steps above and your app will be live!**
