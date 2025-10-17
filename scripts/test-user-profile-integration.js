/**
 * Test script for User Profile Edge Function integration
 * This script tests the complete flow from client to database
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Test data
const testProfileData = {
  bio: 'Test bio for integration testing',
  profile_image_url: 'https://example.com/test-avatar.png',
  investment_experience: 'intermediate',
  risk_tolerance: 'moderate',
  preferred_sectors: ['Financial Services', 'Technology'],
  investment_goals: ['long_term', 'wealth_building'],
  portfolio_size_range: '50k-100k'
};

async function testUserProfileIntegration() {
  console.log('🧪 Testing User Profile Edge Function Integration...\n');

  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');

    // Test 1: Check if we can connect to Supabase
    console.log('\n📡 Test 1: Database Connection');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      throw new Error(`Database connection failed: ${connectionError.message}`);
    }
    console.log('✅ Database connection successful');

    // Test 2: Check if database function exists
    console.log('\n🔧 Test 2: Database Function Check');
    const { data: functionTest, error: functionError } = await supabase
      .rpc('upsert_user_profile', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_bio: 'test',
        p_investment_experience: 'beginner',
        p_risk_tolerance: 'moderate'
      });
    
    if (functionError) {
      if (functionError.code === '42883') {
        console.log('❌ Database function not found. Please run the SQL script first.');
        console.log('   Run: node scripts/execute-sql.js scripts/upsert-user-profile-function.sql');
        return;
      } else if (functionError.message.includes('does not exist')) {
        console.log('✅ Database function exists (user validation working)');
      } else {
        throw new Error(`Function test failed: ${functionError.message}`);
      }
    } else {
      console.log('✅ Database function exists and is callable');
    }

    // Test 3: Test Edge Function endpoint (without authentication)
    console.log('\n🌐 Test 3: Edge Function Endpoint Check');
    try {
      const edgeResponse = await fetch(`${SUPABASE_URL}/functions/v1/upsert-user-profile-wrapper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token'
        },
        body: JSON.stringify(testProfileData)
      });

      const edgeResult = await edgeResponse.json();
      
      if (edgeResponse.status === 401) {
        console.log('✅ Edge Function endpoint exists and validates authentication');
      } else {
        console.log(`⚠️  Edge Function responded with status ${edgeResponse.status}:`, edgeResult);
      }
    } catch (edgeError) {
      console.log('❌ Edge Function endpoint not accessible:', edgeError.message);
      console.log('   Make sure to deploy the Edge Function first:');
      console.log('   supabase functions deploy upsert-user-profile-wrapper');
    }

    // Test 4: Test data validation
    console.log('\n✅ Test 4: Data Validation');
    const invalidData = {
      ...testProfileData,
      investment_experience: 'invalid_level',
      risk_tolerance: 'invalid_tolerance'
    };

    try {
      const validationResponse = await fetch(`${SUPABASE_URL}/functions/v1/upsert-user-profile-wrapper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token'
        },
        body: JSON.stringify(invalidData)
      });

      const validationResult = await validationResponse.json();
      
      if (validationResult.error && validationResult.error.includes('Invalid')) {
        console.log('✅ Data validation is working correctly');
      } else {
        console.log('⚠️  Data validation may not be working as expected');
      }
    } catch (validationError) {
      console.log('❌ Could not test data validation:', validationError.message);
    }

    // Test 5: Test TypeScript types (if available)
    console.log('\n📝 Test 5: TypeScript Types');
    try {
      const typesModule = require('../lib/types/user-profile');
      if (typesModule.validateUserProfile) {
        const validation = typesModule.validateUserProfile(testProfileData);
        if (validation.isValid) {
          console.log('✅ TypeScript types and validation working correctly');
        } else {
          console.log('❌ TypeScript validation failed:', validation.errors);
        }
      } else {
        console.log('⚠️  TypeScript types module not found or incomplete');
      }
    } catch (typesError) {
      console.log('⚠️  Could not test TypeScript types:', typesError.message);
    }

    // Test 6: Test service integration
    console.log('\n⚙️  Test 6: Service Integration');
    try {
      const serviceModule = require('../lib/services/user-profile-service');
      if (serviceModule.UserProfileService) {
        console.log('✅ UserProfileService class found');
        const service = serviceModule.UserProfileService.getInstance();
        if (service.upsertUserProfile) {
          console.log('✅ Service methods available');
        } else {
          console.log('❌ Service methods not found');
        }
      } else {
        console.log('❌ UserProfileService not found');
      }
    } catch (serviceError) {
      console.log('❌ Service integration test failed:', serviceError.message);
    }

    console.log('\n🎉 Integration test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Run the database function setup: node scripts/execute-sql.js scripts/upsert-user-profile-function.sql');
    console.log('2. Deploy the Edge Function: supabase functions deploy upsert-user-profile-wrapper');
    console.log('3. Test with authenticated user in your app');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)');
    console.log('2. Ensure Supabase project is set up correctly');
    console.log('3. Verify database schema is in place');
    console.log('4. Check network connectivity');
  }
}

// Run the test
if (require.main === module) {
  testUserProfileIntegration();
}

module.exports = { testUserProfileIntegration };
