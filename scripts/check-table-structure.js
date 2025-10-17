#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkTableStructure() {
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('🔍 Checking chat_sessions table structure...\n');

    // Check if table exists
    const { data: tableExists, error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'chat_sessions'
        );
      `
    });

    if (tableError) {
      console.error('❌ Error checking table existence:', tableError.message);
      return;
    }

    console.log('📋 Table exists:', tableExists);

    // Get table structure
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'chat_sessions' 
        AND table_schema = 'public' 
        ORDER BY ordinal_position;
      `
    });

    if (columnsError) {
      console.error('❌ Error getting columns:', columnsError.message);
      return;
    }

    console.log('\n📊 Table structure:');
    console.table(columns);

    // Check if is_active column exists
    const hasIsActive = columns.some(col => col.column_name === 'is_active');
    console.log(`\n🔍 is_active column exists: ${hasIsActive ? '✅ Yes' : '❌ No'}`);

    if (!hasIsActive) {
      console.log('\n🔧 Adding missing is_active column...');
      
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE public.chat_sessions 
          ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        `
      });

      if (alterError) {
        console.error('❌ Error adding column:', alterError.message);
      } else {
        console.log('✅ is_active column added successfully!');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkTableStructure();
