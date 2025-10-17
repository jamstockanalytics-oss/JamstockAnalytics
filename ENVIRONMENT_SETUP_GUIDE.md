# Environment Setup Guide

## 🚀 Quick Setup

### Step 1: Create `.env` File

Since `.env` files are protected, you need to create it manually:

1. **Copy the template:**
   ```powershell
   # In PowerShell (Windows)
   Copy-Item env.example .env
   
   # Or in Command Prompt
   copy env.example .env
   ```

2. **Or create manually:**
   Create a new file named `.env` in the `JamStockAnalytics` folder with this content:

   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   # Optional: Database URL for direct connections
   SUPABASE_DB_URL=postgresql://postgres:password@db.your-project-id.supabase.co:5432/postgres
   
   # Server Configuration
   PORT=8000
   NODE_ENV=production
   
   # Rate Limiting (optional overrides)
   RATE_LIMIT=100
   WINDOW_MS=60000
   MAX_MESSAGES=100
   CLEANUP_DAYS=30
   ```

### Step 2: Get Your Supabase Credentials

#### Option A: From Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard:**
   - Visit [supabase.com](https://supabase.com)
   - Sign in to your account
   - Select your project (or create a new one)

2. **Get API Keys:**
   - Go to **Settings** → **API**
   - Copy these values:
     - **Project URL**: `https://your-project-id.supabase.co`
     - **service_role key**: `eyJ...` (starts with `eyJ`)

3. **Update your `.env` file:**
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

#### Option B: From Existing Configuration

If you already have Supabase configured elsewhere in your project, look for these files:
- `lib/config/supabase.ts`
- `lib/supabase/client.ts`
- Any existing `.env` files

### Step 3: Verify Setup

1. **Check your `.env` file:**
   ```powershell
   Get-Content .env
   ```

2. **Test the server:**
   ```powershell
   # Start the server
   deno task dev
   
   # In another terminal, test the health endpoint
   curl http://localhost:8000/health
   ```

## 🔧 Configuration Details

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `RATE_LIMIT` | Requests per minute | `100` |
| `WINDOW_MS` | Rate limit window (ms) | `60000` |
| `MAX_MESSAGES` | Max messages per request | `100` |
| `CLEANUP_DAYS` | Days to keep old messages | `30` |
| `SUPABASE_DB_URL` | Direct database connection | Not required |

## 🛠️ Troubleshooting

### Common Issues

1. **"Missing environment variables" error:**
   - Ensure `.env` file exists in the correct location
   - Check that variable names match exactly
   - Verify no extra spaces or quotes

2. **"Database connection failed" error:**
   - Verify `SUPABASE_URL` is correct
   - Check `SUPABASE_SERVICE_ROLE_KEY` is valid
   - Ensure your Supabase project is active

3. **"Rate limit exceeded" error:**
   - Increase `RATE_LIMIT` value
   - Adjust `WINDOW_MS` for different time windows

### Verification Commands

```powershell
# Check if .env file exists
Test-Path .env

# View .env contents
Get-Content .env

# Test server health
curl http://localhost:8000/health

# Run tests
node test-server.js
```

## 🔒 Security Notes

- **Never commit `.env` files** to version control
- **Keep service role keys secret** - they have admin access
- **Use different keys** for development and production
- **Rotate keys regularly** for security

## 📞 Need Help?

1. **Check Supabase Status:** [status.supabase.com](https://status.supabase.com)
2. **View Server Logs:** `Get-Content server.log -Wait`
3. **Run Tests:** `node test-server.js`
4. **Health Check:** `curl http://localhost:8000/health`

---

**Once configured, your server will be ready to run with `deno task dev`!** 🎉