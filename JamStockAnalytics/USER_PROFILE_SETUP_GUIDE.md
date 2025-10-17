# User Profile Edge Function Setup Guide

This guide walks you through setting up the `upsert-user-profile-wrapper` Edge Function for managing user profiles in your JamStockAnalytics app.

## Overview

The Edge Function provides a secure way to upsert (insert or update) user profile data through a REST API endpoint. It handles authentication, validation, and database operations.

## Prerequisites

- Supabase project set up
- Supabase CLI installed
- Database schema deployed
- Environment variables configured

## Setup Steps

### 1. Database Setup

First, run the database function setup:

```bash
# Execute the SQL function
node scripts/execute-sql.js scripts/upsert-user-profile-function.sql
```

Or manually run the SQL in your Supabase SQL editor:

```sql
-- Copy the contents of scripts/upsert-user-profile-function.sql
-- and run it in your Supabase SQL editor
```

### 2. Edge Function Deployment

Deploy the Edge Function to Supabase:

```bash
# Navigate to your project directory
cd JamStockAnalytics

# Deploy the function
supabase functions deploy upsert-user-profile-wrapper

# Verify deployment
supabase functions list
```

### 3. Environment Variables

Ensure your environment variables are set:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Test the Integration

Run the integration test:

```bash
# Test the complete setup
node scripts/test-user-profile-integration.js
```

## Usage Examples

### Basic Usage with Service

```typescript
import { userProfileService } from './lib/services/user-profile-service';

// Update user profile
const result = await userProfileService.upsertUserProfile({
  bio: 'My updated bio',
  profile_image_url: 'https://example.com/avatar.png',
  investment_experience: 'intermediate',
  risk_tolerance: 'moderate',
  preferred_sectors: ['tech', 'finance'],
  investment_goals: ['long_term'],
  portfolio_size_range: '50k-100k'
});

if (result.success) {
  console.log('Profile updated:', result.data);
} else {
  console.error('Error:', result.error);
}
```

### Direct Edge Function Call

```typescript
// Get session token
const { data: { session } } = await supabase.auth.getSession();

// Call Edge Function directly
const resp = await fetch('https://your-project.supabase.co/functions/v1/upsert-user-profile-wrapper', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`,
  },
  body: JSON.stringify({
    bio: 'My updated bio',
    profile_image_url: 'https://example.com/avatar.png',
    investment_experience: 'intermediate',
    risk_tolerance: 'moderate',
    preferred_sectors: ['tech', 'finance'],
    investment_goals: ['long_term'],
    portfolio_size_range: '50k-100k'
  }),
});

const result = await resp.json();
console.log(result);
```

### React Native Component Usage

```typescript
import { ProfileForm } from './examples/user-profile-usage';

// Use the ProfileForm component
<ProfileForm 
  onProfileUpdated={(result) => {
    console.log('Profile updated:', result);
  }}
/>
```

## API Reference

### Endpoint

```
POST https://your-project.supabase.co/functions/v1/upsert-user-profile-wrapper
```

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body

```typescript
{
  bio?: string;                    // User bio (max 500 chars)
  profile_image_url?: string;      // Profile image URL
  investment_experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  risk_tolerance?: 'conservative' | 'moderate' | 'aggressive';
  preferred_sectors?: string[];    // Array of sector names
  investment_goals?: string[];     // Array of goal types
  portfolio_size_range?: string;   // Portfolio size range
}
```

### Response

```typescript
{
  success: boolean;
  data?: {
    profile_id: string;
    user_id: string;
    bio: string | null;
    profile_image_url: string | null;
    investment_experience: string;
    risk_tolerance: string;
    preferred_sectors: string[];
    investment_goals: string[];
    portfolio_size_range: string | null;
    created_at: string;
    updated_at: string;
    action_performed: 'inserted' | 'updated';
  };
  error?: string;
  message?: string;
  details?: string;
}
```

## Validation Rules

### Investment Experience
- Must be one of: `beginner`, `intermediate`, `advanced`, `expert`

### Risk Tolerance
- Must be one of: `conservative`, `moderate`, `aggressive`

### Bio
- Maximum 500 characters
- Optional field

### Profile Image URL
- Must be a valid URL format
- Optional field

### Preferred Sectors
- Array of strings
- Maximum 10 sectors
- Must be from predefined list

### Investment Goals
- Array of strings
- Maximum 5 goals
- Must be from predefined list

### Portfolio Size Range
- Must be from predefined list
- Optional field

## Error Handling

The Edge Function returns structured error responses:

```typescript
// Authentication error
{
  success: false,
  error: 'Invalid or expired token'
}

// Validation error
{
  success: false,
  error: 'Invalid investment_experience value. Must be: beginner, intermediate, advanced, or expert'
}

// Database error
{
  success: false,
  error: 'Database operation failed',
  details: 'Specific database error message'
}
```

## Security Features

1. **JWT Authentication**: All requests must include a valid JWT token
2. **User Isolation**: Users can only update their own profiles
3. **Input Validation**: All input data is validated before processing
4. **SQL Injection Protection**: Uses parameterized queries
5. **Rate Limiting**: Inherits Supabase's rate limiting

## Monitoring and Logging

The Edge Function logs:
- Authentication attempts
- Validation errors
- Database operations
- Performance metrics

Monitor your function in the Supabase dashboard:
1. Go to Functions → upsert-user-profile-wrapper
2. View logs and metrics
3. Monitor error rates and response times

## Troubleshooting

### Common Issues

1. **Function not found (404)**
   - Ensure the function is deployed: `supabase functions deploy upsert-user-profile-wrapper`

2. **Database function not found**
   - Run the SQL setup script: `scripts/upsert-user-profile-function.sql`

3. **Authentication errors (401)**
   - Check JWT token validity
   - Ensure user is logged in

4. **Validation errors (400)**
   - Check input data format
   - Verify enum values

5. **Database errors (500)**
   - Check database schema
   - Verify RLS policies

### Debug Mode

Enable debug logging in your Edge Function:

```typescript
// Add to your Edge Function
console.log('Request body:', requestBody);
console.log('User ID:', user.id);
console.log('Profile data:', profileData);
```

## Performance Optimization

1. **Caching**: Consider implementing response caching for frequently accessed profiles
2. **Batch Operations**: For multiple updates, consider batch processing
3. **Indexing**: Ensure proper database indexes on user_id
4. **Connection Pooling**: Supabase handles this automatically

## Future Enhancements

Planned features:
- Profile image upload handling
- Bulk profile operations
- Profile analytics
- Advanced validation rules
- Profile templates
- Export functionality

## Support

For issues or questions:
1. Check the integration test: `node scripts/test-user-profile-integration.js`
2. Review logs in Supabase dashboard
3. Verify environment variables
4. Check database schema and RLS policies

## Files Created

- `supabase/functions/upsert-user-profile-wrapper/index.ts` - Edge Function
- `scripts/upsert-user-profile-function.sql` - Database function
- `lib/types/user-profile.ts` - TypeScript types
- `lib/services/user-profile-service.ts` - Service layer
- `examples/user-profile-usage.tsx` - Usage examples
- `scripts/test-user-profile-integration.js` - Integration test
- `USER_PROFILE_SETUP_GUIDE.md` - This guide
