# 🔐 JWT Token Verification Commands for Supabase

## 📋 Your Supabase Configuration

- **Supabase URL**: `https://ojatfvokildmngpzdutf.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYXRmdm9raWxkbW5ncHpkdXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODc2OTcsImV4cCI6MjA3NTk2MzY5N30.SPFL5e1MWl3N1HGzYQx-T-AeTzail4vutCHNvhjyJqk`

---

## 🚀 **Direct cURL Command**

Replace `YOUR_JWT_TOKEN` with your actual JWT token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" "https://ojatfvokildmngpzdutf.supabase.co/auth/v1/user" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYXRmdm9raWxkbW5ncHpkdXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODc2OTcsImV4cCI6MjA3NTk2MzY5N30.SPFL5e1MWl3N1HGzYQx-T-AeTzail4vutCHNvhjyJqk"
```

---

## 🔧 **PowerShell Equivalent**

```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYXRmdm9raWxkbW5ncHpkdXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODc2OTcsImV4cCI6MjA3NTk2MzY5N30.SPFL5e1MWl3N1HGzYQx-T-AeTzail4vutCHNvhjyJqk"
}

$response = Invoke-RestMethod -Uri "https://ojatfvokildmngpzdutf.supabase.co/auth/v1/user" -Headers $headers
$response
```

---

## 🧪 **Test Scripts Available**

### **1. Simple PowerShell Test**
```powershell
PowerShell -ExecutionPolicy Bypass -File simple-jwt-test.ps1
```

### **2. cURL Test Script**
```powershell
PowerShell -ExecutionPolicy Bypass -File curl-jwt-test.ps1
```

---

## 📊 **Expected Response**

If the JWT token is valid, you should get a response like:

```json
{
  "id": "user-uuid-here",
  "email": "user@example.com",
  "created_at": "2024-01-01T00:00:00Z",
  "last_sign_in_at": "2024-01-01T00:00:00Z",
  "email_confirmed_at": "2024-01-01T00:00:00Z",
  "phone": null,
  "confirmed_at": "2024-01-01T00:00:00Z",
  "recovery_sent_at": null,
  "email_change_sent_at": null,
  "new_email": null,
  "new_phone": null,
  "phone_confirmed_at": null,
  "phone_change_sent_at": null,
  "confirmed_at": "2024-01-01T00:00:00Z",
  "email_change_confirm_status": 0,
  "phone_change_confirm_status": 0,
  "banned_until": null,
  "reauthentication_sent_at": null,
  "reauthentication_token_expiry": null
}
```

---

## ❌ **Error Responses**

### **Invalid Token**
```json
{
  "msg": "Invalid JWT",
  "code": 400,
  "hint": "Double check the JWT which is passed in.",
  "details": null
}
```

### **Expired Token**
```json
{
  "msg": "JWT expired",
  "code": 400,
  "hint": "Request a new token.",
  "details": null
}
```

---

## 🔐 **Getting a JWT Token**

### **Method 1: Sign Up New User**
```bash
curl -X POST "https://ojatfvokildmngpzdutf.supabase.co/auth/v1/signup" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYXRmdm9raWxkbW5ncHpkdXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODc2OTcsImV4cCI6MjA3NTk2MzY5N30.SPFL5e1MWl3N1HGzYQx-T-AeTzail4vutCHNvhjyJqk" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### **Method 2: Sign In Existing User**
```bash
curl -X POST "https://ojatfvokildmngpzdutf.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYXRmdm9raWxkbW5ncHpkdXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODc2OTcsImV4cCI6MjA3NTk2MzY5N30.SPFL5e1MWl3N1HGzYQx-T-AeTzail4vutCHNvhjyJqk" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🎯 **Quick Test Commands**

### **Windows Command Prompt**
```cmd
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" "https://ojatfvokildmngpzdutf.supabase.co/auth/v1/user" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYXRmdm9raWxkbW5ncHpkdXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODc2OTcsImV4cCI6MjA3NTk2MzY5N30.SPFL5e1MWl3N1HGzYQx-T-AeTzail4vutCHNvhjyJqk"
```

### **PowerShell**
```powershell
Invoke-RestMethod -Uri "https://ojatfvokildmngpzdutf.supabase.co/auth/v1/user" -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"; "apikey"="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYXRmdm9raWxkbW5ncHpkdXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODc2OTcsImV4cCI6MjA3NTk2MzY5N30.SPFL5e1MWl3N1HGzYQx-T-AeTzail4vutCHNvhjyJqk"}
```

---

## 📝 **Notes**

- Replace `YOUR_JWT_TOKEN` with your actual JWT token
- The JWT token is typically obtained after user authentication
- Tokens have expiration times, so you may need to refresh them
- The `apikey` header is your Supabase anon key
- The endpoint `/auth/v1/user` returns the user information for the authenticated user
