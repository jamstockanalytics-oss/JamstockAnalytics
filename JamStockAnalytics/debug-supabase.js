#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Debug Supabase Connection...\n');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', JSON.stringify(supabaseUrl));
console.log('URL type:', typeof supabaseUrl);
console.log('URL length:', supabaseUrl?.length);
console.log('Starts with https:', supabaseUrl?.startsWith('https://'));
console.log('Regex test:', /^https?:\/\/.+/.test(supabaseUrl));

console.log('\nAnon Key:', supabaseAnonKey ? 'Present' : 'Missing');
console.log('Anon Key length:', supabaseAnonKey?.length);

try {
  console.log('\n🔧 Creating Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client created successfully!');
  
  // Test a simple query
  console.log('\n🔍 Testing database query...');
  supabase.from('users').select('count').limit(1).then(({ data, error }) => {
    if (error) {
      console.log('⚠️  Query error (expected if tables don\'t exist):', error.message);
    } else {
      console.log('✅ Database query successful!');
    }
  }).catch(err => {
    console.log('❌ Query failed:', err.message);
  });
  
} catch (error) {
  console.log('❌ Error creating client:', error.message);
  console.log('Error details:', error);
}
