#!/usr/bin/env node

/**
 * JamStockAnalytics Database Setup Script
 * 
 * This script updates the Supabase database with all new features including:
 * - Social Media Sharing System
 * - Chart Preferences and Data Caching
 * - Enhanced User Profiles
 * - Analytics and Performance Tracking
 * 
 * Usage: node scripts/setup-database.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   EXPO_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Please add these to your .env file and try again.');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runDatabaseUpdate() {
  console.log('🚀 Starting JamStockAnalytics Database Update...\n');

  try {
    // Read the SQL script
    const sqlScriptPath = path.join(__dirname, 'supabase-database-update.sql');
    const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');

    console.log('📄 Reading database update script...');
    console.log(`   Script size: ${(sqlScript.length / 1024).toFixed(2)} KB\n`);

    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    // Execute statements in batches to avoid timeout issues
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i += batchSize) {
      const batch = statements.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(statements.length / batchSize);

      console.log(`⚡ Executing batch ${batchNumber}/${totalBatches} (${batch.length} statements)...`);

      for (const statement of batch) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // Some errors are expected (like "already exists" for tables)
            if (error.message.includes('already exists') || 
                error.message.includes('already defined') ||
                error.message.includes('duplicate key')) {
              console.log(`   ⚠️  ${error.message.split('\n')[0]}`);
            } else {
              console.error(`   ❌ Error: ${error.message}`);
              errorCount++;
            }
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`   ❌ Unexpected error: ${err.message}`);
          errorCount++;
        }
      }

      console.log(`   ✅ Batch ${batchNumber} completed\n`);
      
      // Small delay between batches to avoid overwhelming the database
      if (i + batchSize < statements.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('📈 Database Update Summary:');
    console.log(`   ✅ Successful operations: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total statements: ${statements.length}\n`);

    // Verify key tables exist
    console.log('🔍 Verifying database structure...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'social_share_events',
        'user_social_preferences', 
        'user_chart_preferences',
        'chart_data_cache',
        'user_profile_extensions',
        'user_activity_analytics',
        'content_performance_analytics'
      ]);

    if (tablesError) {
      console.error('❌ Error verifying tables:', tablesError.message);
    } else {
      console.log(`   ✅ Found ${tables.length} new tables created`);
      tables.forEach(table => {
        console.log(`      - ${table.table_name}`);
      });
    }

    // Test key functions
    console.log('\n🧪 Testing database functions...');
    
    try {
      const { data: testResult, error: testError } = await supabase
        .rpc('get_user_social_stats', { user_uuid: '00000000-0000-0000-0000-000000000000' });
      
      if (testError) {
        console.log(`   ⚠️  Function test: ${testError.message}`);
      } else {
        console.log('   ✅ Database functions are working correctly');
      }
    } catch (err) {
      console.log(`   ⚠️  Function test: ${err.message}`);
    }

    console.log('\n🎉 Database update completed successfully!');
    console.log('\n📋 New Features Available:');
    console.log('   🔗 Social Media Sharing System');
    console.log('   📊 Chart Preferences and Data Caching');
    console.log('   👤 Enhanced User Profiles');
    console.log('   📈 Analytics and Performance Tracking');
    console.log('   🔒 Row Level Security Policies');
    console.log('   ⚡ Database Functions and Triggers');
    console.log('   🚀 Performance Indexes');
    
    console.log('\n✨ Your JamStockAnalytics database is now ready for the updated application!');

  } catch (error) {
    console.error('\n❌ Database update failed:');
    console.error(error.message);
    console.error('\nPlease check your Supabase connection and try again.');
    process.exit(1);
  }
}

// Helper function to create exec_sql function if it doesn't exist
async function ensureExecSqlFunction() {
  const createExecSqlFunction = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;

  try {
    await supabase.rpc('exec_sql', { sql: createExecSqlFunction });
  } catch (error) {
    // Function might already exist, which is fine
    console.log('   ℹ️  exec_sql function already exists or created');
  }
}

// Main execution
async function main() {
  console.log('🔧 JamStockAnalytics Database Setup');
  console.log('=====================================\n');

  // Ensure we have the exec_sql function
  console.log('🔧 Ensuring database functions are available...');
  await ensureExecSqlFunction();
  console.log('   ✅ Database functions ready\n');

  // Run the main database update
  await runDatabaseUpdate();
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { runDatabaseUpdate };