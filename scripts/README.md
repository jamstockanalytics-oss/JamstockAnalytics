# JamStockAnalytics Database Update Scripts

This directory contains scripts to update your Supabase database with all the new features for the JamStockAnalytics application.

## 🚀 Quick Start

### Option 1: Windows Batch File (Recommended for Windows)
```bash
# Double-click or run from command prompt
scripts/update-database.bat
```

### Option 2: PowerShell Script (Cross-platform)
```powershell
# Run in PowerShell
scripts/update-database.ps1
```

### Option 3: Node.js Script (All platforms)
```bash
# Run directly with Node.js
node scripts/setup-database.js
```

## 📋 Prerequisites

### 1. Environment Variables
Create a `.env` file in your project root with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Required Software
- **Node.js** (version 14 or higher)
- **Supabase Account** with admin access
- **Internet Connection** for database updates

### 3. Supabase Permissions
Your service role key must have the following permissions:
- Create tables
- Create functions
- Create triggers
- Create policies
- Create indexes
- Execute SQL

## 🔧 Manual Database Update

If you prefer to run the SQL script manually in Supabase:

### 1. Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**

### 2. Copy and Paste SQL
1. Open `scripts/supabase-database-update.sql`
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **Run** to execute

### 3. Verify Installation
Check that the following tables were created:
- `social_share_events`
- `user_social_preferences`
- `user_chart_preferences`
- `chart_data_cache`
- `user_profile_extensions`
- `user_activity_analytics`
- `content_performance_analytics`

## 📊 What's Included

### 🆕 New Tables

#### Social Media Sharing
- **`social_share_events`** - Tracks all social media sharing events
- **`user_social_preferences`** - User preferences for social sharing

#### Chart System
- **`user_chart_preferences`** - User chart display preferences
- **`chart_data_cache`** - Cached chart data for performance

#### Enhanced Profiles
- **`user_profile_extensions`** - Extended user profile data
- **`user_activity_analytics`** - User activity tracking
- **`content_performance_analytics`** - Content performance metrics

### 🔧 New Functions

#### Analytics Functions
- **`get_user_social_stats(user_uuid)`** - Get user's social sharing statistics
- **`update_content_performance(content_type, content_id, activity_type)`** - Update content metrics
- **`cleanup_expired_chart_cache()`** - Clean up expired chart data

### 🔒 Security Features

#### Row Level Security (RLS)
- All new tables have RLS enabled
- Users can only access their own data
- Public read access for content performance analytics
- Authenticated write access for all user data

#### Policies
- User-specific data access policies
- Content performance analytics are publicly readable
- Chart data cache is publicly readable but requires authentication to write

### 📈 Performance Optimizations

#### Indexes
- User ID indexes for fast user data queries
- Content type and ID indexes for content lookups
- Platform and date indexes for analytics
- Engagement score indexes for performance sorting

#### Caching
- Chart data caching system
- Automatic cache expiration
- Performance-optimized queries

## 🧪 Testing the Update

### 1. Verify Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'social_share_events',
  'user_social_preferences',
  'user_chart_preferences',
  'chart_data_cache',
  'user_profile_extensions',
  'user_activity_analytics',
  'content_performance_analytics'
);
```

### 2. Test Functions
```sql
-- Test social stats function (will return empty for new users)
SELECT * FROM get_user_social_stats('00000000-0000-0000-0000-000000000000');

-- Test content performance update
SELECT update_content_performance('article', 'test-123', 'view');

-- Test cache cleanup
SELECT cleanup_expired_chart_cache();
```

### 3. Check Views
```sql
-- Check analytics views
SELECT * FROM social_sharing_analytics LIMIT 5;
SELECT * FROM content_performance_view LIMIT 5;
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Permission Denied
**Error**: `permission denied for table/function`
**Solution**: Ensure your service role key has admin privileges

#### 2. Function Already Exists
**Error**: `function already exists`
**Solution**: This is normal - the script handles existing functions gracefully

#### 3. Table Already Exists
**Error**: `relation already exists`
**Solution**: This is normal - the script uses `CREATE TABLE IF NOT EXISTS`

#### 4. Connection Timeout
**Error**: `connection timeout`
**Solution**: The script runs in batches to avoid timeouts. If it still fails, run the SQL manually in smaller chunks.

### Debug Commands

#### Check Database Connection
```bash
# Test Supabase connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('users').select('count').then(console.log).catch(console.error);
"
```

#### Verify Environment Variables
```bash
# Check if environment variables are loaded
node -e "console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'); console.log('Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');"
```

## 📚 Additional Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions Guide](https://supabase.com/docs/guides/database/functions)

### Support
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [JamStockAnalytics Issues](https://github.com/your-repo/issues)

## 🔄 Rollback (If Needed)

If you need to rollback the database changes:

```sql
-- Drop new tables (WARNING: This will delete all data)
DROP TABLE IF EXISTS public.social_share_events CASCADE;
DROP TABLE IF EXISTS public.user_social_preferences CASCADE;
DROP TABLE IF EXISTS public.user_chart_preferences CASCADE;
DROP TABLE IF EXISTS public.chart_data_cache CASCADE;
DROP TABLE IF EXISTS public.user_profile_extensions CASCADE;
DROP TABLE IF EXISTS public.user_activity_analytics CASCADE;
DROP TABLE IF EXISTS public.content_performance_analytics CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_user_social_stats(UUID);
DROP FUNCTION IF EXISTS update_content_performance(VARCHAR, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS cleanup_expired_chart_cache();

-- Drop views
DROP VIEW IF EXISTS public.social_sharing_analytics;
DROP VIEW IF EXISTS public.content_performance_view;
```

## ✅ Success Checklist

After running the update, verify:

- [ ] All new tables are created
- [ ] RLS policies are active
- [ ] Functions are working
- [ ] Indexes are created
- [ ] Views are accessible
- [ ] No error messages in logs
- [ ] Application can connect to database
- [ ] Social sharing features work
- [ ] Chart preferences are saved
- [ ] Analytics data is tracked

---

**🎉 Congratulations!** Your JamStockAnalytics database is now updated with all the latest features including social media sharing, chart preferences, enhanced user profiles, and comprehensive analytics tracking.
