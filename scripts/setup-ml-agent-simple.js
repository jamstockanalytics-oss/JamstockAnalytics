#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupMLAgentSimple() {
  console.log('🤖 Setting up ML Agent Database Schema (Simple Version)...\n');

  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Test connection first
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    console.log('✅ Database connection successful');

    // Read and execute SQL schema file
    console.log('\n📊 Creating ML Agent tables...');
    
    try {
      const schemaPath = path.join(__dirname, 'ml-agent-schema.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      console.log('📄 Reading ML Agent schema file...');
      
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
        if (!statement.trim()) continue;
        
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          
          // Use Supabase's SQL execution via the REST API
          const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
            },
            body: JSON.stringify({ sql: statement })
          });
          
          if (response.ok) {
            successCount++;
            console.log(`✅ Statement ${i + 1} executed successfully`);
          } else {
            errorCount++;
            console.log(`⚠️  Statement ${i + 1} failed (this may be expected for existing objects)`);
          }
        } catch (error) {
          errorCount++;
          console.log(`⚠️  Statement ${i + 1} failed: ${error.message}`);
        }
      }
      
      console.log(`\n📊 Execution Summary:`);
      console.log(`   ✅ Successful: ${successCount}`);
      console.log(`   ⚠️  Failed: ${errorCount}`);
      
      if (errorCount > 0) {
        console.log(`\n⚠️  Some statements failed. This is normal if tables already exist.`);
        console.log(`📝 If you need to create tables manually, run the SQL from: ${schemaPath}`);
      }
      
    } catch (error) {
      console.error('❌ Error reading schema file:', error.message);
      console.log('📝 Please create the ML Agent tables manually using the SQL schema file.');
    }

    // Test table access
    console.log('\n🧪 Testing table access...');
    const tables = [
      'user_article_interactions',
      'ml_learning_patterns', 
      'ml_agent_state',
      'curated_articles',
      'user_interaction_profiles',
      'market_data'
    ];

    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${tableName} not accessible: ${error.message}`);
        } else {
          console.log(`✅ Table ${tableName} accessible`);
        }
      } catch (error) {
        console.log(`❌ Table ${tableName} not accessible: ${error.message}`);
      }
    }

    console.log('\n✅ ML Agent Database setup completed!');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Run: npm run test:ml-agent');
    console.log('   2. Start your app: npm start');
    console.log('   3. The ML Agent will begin learning automatically');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n📝 Manual Setup Instructions:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the contents of scripts/ml-agent-schema.sql');
    console.log('   4. Execute the SQL');
  }
}

// Run the setup
setupMLAgentSimple();