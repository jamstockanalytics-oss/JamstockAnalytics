# Supabase Database Update - Step by Step Guide

## 🚨 **IMPORTANT: Run these scripts in order, one at a time!**

The permission error you encountered is likely because the script was too large. We've broken it into 5 smaller, safer parts.

---

## **Step 1: Create Tables**
**File:** `scripts/supabase-safe-update.sql`

1. Copy the **entire contents** of `supabase-safe-update.sql`
2. Paste into Supabase SQL Editor
3. Click **Run**
4. Wait for completion

**Expected Result:** 7 new tables created

---

## **Step 2: Create Indexes**
**File:** `scripts/supabase-part2-indexes.sql`

1. Copy the **entire contents** of `supabase-part2-indexes.sql`
2. Paste into Supabase SQL Editor
3. Click **Run**
4. Wait for completion

**Expected Result:** Performance indexes created

---

## **Step 3: Row Level Security**
**File:** `scripts/supabase-part3-rls.sql`

1. Copy the **entire contents** of `supabase-part3-rls.sql`
2. Paste into Supabase SQL Editor
3. Click **Run**
4. Wait for completion

**Expected Result:** Security policies applied

---

## **Step 4: Database Functions**
**File:** `scripts/supabase-part4-functions.sql`

1. Copy the **entire contents** of `supabase-part4-functions.sql`
2. Paste into Supabase SQL Editor
3. Click **Run**
4. Wait for completion

**Expected Result:** 3 functions created

---

## **Step 5: Final Setup**
**File:** `scripts/supabase-part5-final.sql`

1. Copy the **entire contents** of `supabase-part5-final.sql`
2. Paste into Supabase SQL Editor
3. Click **Run**
4. Wait for completion

**Expected Result:** Views created, sample data inserted

---

## **Verification**

After running all 5 steps, you should see:
- ✅ **Tables Created: 7**
- ✅ **Functions Created: 3**
- ✅ **Views Created: 2**

## **Troubleshooting**

### If you get permission errors:
1. Make sure you're using the **Service Role Key** (not the anon key)
2. Check that your Supabase project has the correct permissions
3. Try running each script individually

### If a step fails:
1. Check the error message
2. Some errors like "already exists" are normal
3. Continue with the next step

### If you need to start over:
```sql
-- Only run this if you need to completely reset
DROP TABLE IF EXISTS public.social_share_events CASCADE;
DROP TABLE IF EXISTS public.user_social_preferences CASCADE;
DROP TABLE IF EXISTS public.user_chart_preferences CASCADE;
DROP TABLE IF EXISTS public.chart_data_cache CASCADE;
DROP TABLE IF EXISTS public.user_profile_extensions CASCADE;
DROP TABLE IF EXISTS public.user_activity_analytics CASCADE;
DROP TABLE IF EXISTS public.content_performance_analytics CASCADE;
```

---

## **Success! 🎉**

Once all 5 steps are complete, your database will have:
- 🔗 Social Media Sharing System
- 📊 Chart Preferences & Caching
- 👤 Enhanced User Profiles
- 📈 Analytics & Performance Tracking
- 🔒 Row Level Security
- ⚡ Database Functions & Triggers
- 🚀 Performance Indexes

Your JamStockAnalytics application is now ready with all the new features!
