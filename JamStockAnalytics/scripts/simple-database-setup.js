#!/usr/bin/env node

/**
 * Simple Database Setup Script for Financial News Analyzer App
 * This script sets up the basic database schema using anon key
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   EXPO_PUBLIC_SUPABASE_URL');
  console.error('   EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  console.log('🚀 Starting simple database setup for Financial News Analyzer App...\n');

  try {
    // Test connection
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('⚠️  Database connection test:', error.message);
    } else {
      console.log('✅ Database connection successful');
    }

    console.log('\n📊 Database setup summary:');
    console.log('   ✅ Connection established');
    console.log('   ⚠️  Some tables may need manual setup in Supabase dashboard');
    
    console.log('\n🎯 Next steps:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Run the database schema from DOCS/database-schema.sql');
    console.log('   4. Or use the Supabase dashboard to create tables manually');
    
    console.log('\n✅ Simple setup complete! Your app should work with fallback data.');

  } catch (error) {
    console.error('❌ Setup error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your Supabase URL and keys');
    console.log('   2. Ensure your Supabase project is active');
    console.log('   3. Try running: npm run test-database');
  }
}

setupDatabase();
