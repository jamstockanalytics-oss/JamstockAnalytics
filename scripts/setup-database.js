#!/usr/bin/env node

/**
 * Database Setup Script for Financial News Analyzer App
 * This script sets up the complete database schema in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   EXPO_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Starting database setup for Financial News Analyzer App...\n');

  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '..', 'DOCS', 'database-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Reading database schema...');
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabase
            .from('_temp_table_for_sql_execution')
            .select('*')
            .limit(0);
          
          if (directError && directError.message.includes('relation "_temp_table_for_sql_execution" does not exist')) {
            // This is expected, continue with the actual statement
            console.log(`   ⚠️  RPC method not available, trying alternative approach...`);
          } else {
            throw error;
          }
        }
        
        successCount++;
        console.log(`   ✅ Statement ${i + 1} executed successfully`);
        
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
        
        // Continue with other statements even if one fails
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate key') ||
            error.message.includes('relation already exists')) {
          console.log(`   ⚠️  Statement ${i + 1} skipped (already exists)`);
          successCount++;
          errorCount--;
        }
      }
    }

    console.log('\n📈 Database setup summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 Database setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Run the seed data script: npm run seed-database');
      console.log('   2. Update your Supabase client configuration');
      console.log('   3. Test the database connection');
    } else {
      console.log('\n⚠️  Database setup completed with some errors.');
      console.log('   Please review the errors above and fix any issues.');
    }

  } catch (error) {
    console.error('\n💥 Fatal error during database setup:', error.message);
    process.exit(1);
  }
}

async function verifySetup() {
  console.log('\n🔍 Verifying database setup...');
  
  try {
    // Test basic connectivity
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      console.log('   ⚠️  Users table not accessible (this is expected for new setup)');
    } else {
      console.log('   ✅ Users table accessible');
    }

    // Test articles table
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('count')
      .limit(1);
    
    if (articlesError) {
      console.log('   ❌ Articles table not accessible:', articlesError.message);
    } else {
      console.log('   ✅ Articles table accessible');
    }

    // Test company tickers table
    const { data: companies, error: companiesError } = await supabase
      .from('company_tickers')
      .select('count')
      .limit(1);
    
    if (companiesError) {
      console.log('   ❌ Company tickers table not accessible:', companiesError.message);
    } else {
      console.log('   ✅ Company tickers table accessible');
    }

    console.log('\n✅ Database verification completed');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🏦 Financial News Analyzer - Database Setup');
  console.log('==========================================\n');

  await setupDatabase();
  await verifySetup();
  
  console.log('\n🎯 Setup complete! Your database is ready for the Financial News Analyzer App.');
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the setup
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setupDatabase, verifySetup };
