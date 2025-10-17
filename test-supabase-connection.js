#!/usr/bin/env node

/**
 * Test Supabase Database Connection
 * Run this script to verify your Supabase setup is working
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Check if environment variables are set
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase Database Connection...\n');

// Check environment variables
if (!supabaseUrl) {
  console.error('❌ EXPO_PUBLIC_SUPABASE_URL is not set');
  console.log('   Please add it to your .env file');
  process.exit(1);
}

if (!supabaseAnonKey) {
  console.error('❌ EXPO_PUBLIC_SUPABASE_ANON_KEY is not set');
  console.log('   Please add it to your .env file');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
  console.log('   Please add it to your .env file');
  process.exit(1);
}

console.log('✅ Environment variables found');

// Test with anon key
async function testAnonConnection() {
  console.log('\n🔑 Testing anon key connection...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase
      .from('articles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('   ⚠️  Anon key test failed:', error.message);
      console.log('   This is normal if tables don\'t exist yet');
    } else {
      console.log('   ✅ Anon key connection successful');
    }
  } catch (error) {
    console.log('   ❌ Anon key test failed:', error.message);
  }
}

// Test with service role key
async function testServiceConnection() {
  console.log('\n🔑 Testing service role key connection...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('articles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('   ⚠️  Service role test failed:', error.message);
      console.log('   This is normal if tables don\'t exist yet');
    } else {
      console.log('   ✅ Service role key connection successful');
    }
  } catch (error) {
    console.log('   ❌ Service role test failed:', error.message);
  }
}

// Test database setup
async function testDatabaseSetup() {
  console.log('\n🗄️  Testing database setup...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if key tables exist
    const tables = ['users', 'articles', 'company_tickers', 'news_sources'];
    let existingTables = 0;
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (!error) {
          existingTables++;
          console.log(`   ✅ Table '${table}' exists`);
        } else {
          console.log(`   ❌ Table '${table}' not found`);
        }
      } catch (error) {
        console.log(`   ❌ Table '${table}' error: ${error.message}`);
      }
    }
    
    if (existingTables === tables.length) {
      console.log('\n🎉 All database tables are set up correctly!');
      console.log('   You can now run: npm run seed-database');
    } else if (existingTables > 0) {
      console.log('\n⚠️  Some tables exist, but setup may be incomplete');
      console.log('   Run: npm run setup-database');
    } else {
      console.log('\n❌ No database tables found');
      console.log('   Run: npm run setup-database');
    }
    
  } catch (error) {
    console.log('   ❌ Database setup test failed:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('📋 Running connection tests...\n');
  
  await testAnonConnection();
  await testServiceConnection();
  await testDatabaseSetup();
  
  console.log('\n📊 Test Summary:');
  console.log('   • Check the results above');
  console.log('   • If all tests pass, your database is ready');
  console.log('   • If tests fail, check your Supabase credentials');
  console.log('   • Run the setup scripts if needed');
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. If tables don\'t exist: npm run setup-database');
  console.log('   2. If setup is complete: npm run seed-database');
  console.log('   3. Start your app: npm start');
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);
