# Google Authentication Setup Guide

## 1. Google Cloud Console Setup

### Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Identity API

### Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - For development: `https://ojatfvokildmngpzdutf.supabase.co/auth/v1/callback`
   - For production: `https://your-project-ref.supabase.co/auth/v1/callback`
5. Save the Client ID and Client Secret

## 2. Supabase Configuration

### Enable Google Provider
1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Enable "Google" provider
4. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console

### Configure Site URL
1. In Supabase dashboard, go to "Authentication" > "URL Configuration"
2. Set **Site URL** to your app's URL:
   - Development: `http://localhost:8086` (or your dev port)
   - Production: `https://your-domain.com`
3. Add **Redirect URLs**:
   - `http://localhost:8086/**` (for development)
   - `https://your-domain.com/**` (for production)

## 3. Environment Variables (Optional)

If you want to use environment variables instead of hardcoded values, update your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://ojatfvokildmngpzdutf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Testing Google Authentication

1. Start your development server: `npx expo start --web --port 8086`
2. Open the app in your browser
3. Click "Continue with Google" on the login or signup screen
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you'll be redirected back to your app

## 5. Troubleshooting

### Common Issues:
- **"Invalid redirect URI"**: Make sure the redirect URI in Google Cloud Console matches your Supabase callback URL
- **"Access blocked"**: Check that your Google Cloud project has the correct APIs enabled
- **"Client ID not found"**: Verify the Client ID is correctly entered in Supabase

### Debug Steps:
1. Check browser console for errors
2. Verify Supabase configuration in the dashboard
3. Test with a different Google account
4. Check that all URLs are correctly configured

## 6. Production Deployment

For production deployment:
1. Update Google Cloud Console with production redirect URIs
2. Update Supabase Site URL and Redirect URLs
3. Ensure your domain is verified in Google Cloud Console
4. Test the complete authentication flow

## 7. Security Considerations

- Keep your Google OAuth credentials secure
- Use environment variables for production
- Regularly rotate your OAuth credentials
- Monitor authentication logs in Supabase
- Implement proper error handling in your app

