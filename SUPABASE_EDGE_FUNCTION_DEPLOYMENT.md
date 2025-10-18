# Supabase Edge Function Deployment Guide

## 🎯 Overview
This guide explains how to deploy the `render-connect` Edge Function to your Supabase project.

## 📁 Files Created
- `supabase/functions/render-connect/index.ts` - Edge Function code
- `supabase/migrations/001_create_render_sync_log.sql` - Database migration
- `supabase/config.toml` - Supabase configuration

## 🚀 Deployment Steps

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/ojatfvokildmngpzdutf/functions

2. **Create the Edge Function**
   - Click "Create a new function"
   - Name: `render-connect`
   - Copy the contents of `supabase/functions/render-connect/index.ts`

3. **Run the Database Migration**
   - Go to: https://supabase.com/dashboard/project/ojatfvokildmngpzdutf/sql
   - Copy and run the contents of `supabase/migrations/001_create_render_sync_log.sql`

### Option 2: Using Supabase CLI (Alternative)

1. **Install Supabase CLI**
   ```bash
   # Windows (using Scoop)
   scoop install supabase
   
   # Or download from: https://github.com/supabase/cli/releases
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link to your project**
   ```bash
   supabase link --project-ref ojatfvokildmngpzdutf
   ```

4. **Deploy the function**
   ```bash
   supabase functions deploy render-connect
   ```

5. **Run the migration**
   ```bash
   supabase db push
   ```

## 🧪 Testing the Edge Function

Once deployed, test the function:

```bash
# Test health check
curl -X GET "https://ojatfvokildmngpzdutf.supabase.co/functions/v1/render-connect" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYXRmdm9raWxkbW5ncHpkdXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODc2OTcsImV4cCI6MjA3NTk2MzY5N30.SPFL5e1MWl3N1HGzYQx-T-AeTzail4vutCHNvhjyJqk"

# Test sync functionality
curl -X POST "https://ojatfvokildmngpzdutf.supabase.co/functions/v1/render-connect" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYXRmdm9raWxkbW5ncHpkdXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODc2OTcsImV4cCI6MjA3NTk2MzY5N30.SPFL5e1MWl3N1HGzYQx-T-AeTzail4vutCHNvhjyJqk" \
  -H "Content-Type: application/json" \
  -d '{"type": "sync", "environment": "production", "status": "active"}'
```

## 🔧 Function Features

The `render-connect` Edge Function provides:

1. **Health Check** (`GET /`)
   - Returns function status and available endpoints

2. **Sync Render Services** (`POST /sync`)
   - Stores Render.com service status in database
   - Tracks main app and webhook service status

3. **Error Handling**
   - Proper CORS headers
   - Comprehensive error responses
   - Logging for debugging

## 📊 Database Schema

The function creates a `render_sync_log` table with:
- `id` - Primary key
- `timestamp` - When the sync occurred
- `render_services` - JSON data about Render services
- `environment` - Environment (production/development)
- `status` - Service status
- `created_at` - Record creation timestamp

## 🔒 Security

- Row Level Security (RLS) enabled
- Authenticated users can read data
- Service role can insert data
- Proper CORS configuration

## 🎉 Next Steps

After deployment:
1. Test the function endpoints
2. Integrate with your Render.com services
3. Monitor sync logs in Supabase dashboard
4. Set up automated sync schedules if needed
