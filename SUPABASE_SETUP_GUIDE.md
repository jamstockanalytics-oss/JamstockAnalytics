# Supabase Database Setup Guide

## 🚀 Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Get Your Supabase Credentials
1. Go to [supabase.com](https://supabase.com) and sign in
2. Open your project dashboard
3. Go to **Settings** → **API**
4. Copy your credentials:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJ...` (starts with eyJ)
   - **service_role key**: `eyJ...` (starts with eyJ)

### Step 2: Create Environment File
Create a `.env` file in your project root with:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI Service Configuration
EXPO_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### Step 3: Install Dependencies
```bash
npm install @supabase/supabase-js dotenv
```

### Step 4: Run Database Setup
```bash
# Set up the complete database schema
npm run setup-database

# Populate with sample data
npm run seed-database
```

## 🗄️ Method 2: Manual SQL Execution

### Step 1: Copy the SQL Schema
1. Open `DOCS/database-schema.sql`
2. Copy the entire SQL content

### Step 2: Execute in Supabase
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Paste the SQL schema
4. Click **Run** to execute

### Step 3: Verify Tables
Check that these tables were created:
- users
- user_profiles
- articles
- company_tickers
- news_sources
- analysis_sessions
- chat_sessions
- market_data

## 🔧 Method 3: Using Supabase CLI

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Initialize Supabase
```bash
supabase init
```

### Step 3: Link to Your Project
```bash
supabase link --project-ref your-project-id
```

### Step 4: Run Migration
```bash
supabase db push
```

## 📊 Method 4: Direct Database Connection

### Step 1: Install Dependencies
```bash
npm install @supabase/supabase-js dotenv
```

### Step 2: Create Setup Script
Create `setup-supabase.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    // Read the SQL schema
    const schemaSQL = fs.readFileSync('DOCS/database-schema.sql', 'utf8');
    
    // Split into statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      try {
        console.log(`Executing statement ${i + 1}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statements[i] });
        
        if (error) {
          console.log(`Statement ${i + 1} skipped: ${error.message}`);
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (error) {
        console.log(`Statement ${i + 1} error: ${error.message}`);
      }
    }

    console.log('Database setup completed!');
  } catch (error) {
    console.error('Setup failed:', error.message);
  }
}

setupDatabase();
```

### Step 3: Run Setup
```bash
node setup-supabase.js
```

## ✅ Verification Steps

### 1. Check Tables
Go to your Supabase dashboard → **Table Editor** and verify these tables exist:
- users
- articles
- company_tickers
- news_sources
- analysis_sessions
- chat_sessions

### 2. Test Connection
Create a test file `test-connection.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('Connection test failed:', error.message);
    } else {
      console.log('✅ Database connection successful!');
    }
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
  }
}

testConnection();
```

Run: `node test-connection.js`

### 3. Check Sample Data
After running `npm run seed-database`, verify:
- 5 news sources
- 15 company tickers
- 5 sample articles
- Market insights

## 🚨 Troubleshooting

### Common Issues:

1. **"Missing credentials" error**
   - Check your `.env` file exists
   - Verify all environment variables are set
   - Make sure there are no extra spaces

2. **"Permission denied" error**
   - Use the service_role key for setup
   - Check your Supabase project permissions

3. **"Table already exists" error**
   - This is normal for re-runs
   - The script will skip existing tables

4. **"Connection failed" error**
   - Verify your Supabase URL is correct
   - Check your internet connection
   - Ensure your Supabase project is active

### Getting Help:
- Check Supabase dashboard logs
- Verify your project is not paused
- Ensure you have the correct permissions

## 🎯 Next Steps

After successful setup:
1. **Test the connection** with the test script
2. **Run the seed script** to populate sample data
3. **Start your app** and verify everything works
4. **Check the Supabase dashboard** to see your data

Your database is now ready for the Financial News Analyzer App! 🎉
