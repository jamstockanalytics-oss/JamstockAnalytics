require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Supabase Connection...\n');

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', url);
console.log('Key present:', !!key);

try {
  const client = createClient(url, key);
  console.log('✅ Supabase client created successfully!');
  
  // Test a simple query
  client.from('users').select('count').limit(1).then(({data, error}) => {
    if (error) {
      console.log('⚠️ Query error (expected if tables don\'t exist):', error.message);
    } else {
      console.log('✅ Database query successful!');
    }
  }).catch(err => {
    console.log('❌ Query failed:', err.message);
  });
  
} catch (e) {
  console.log('❌ Error creating client:', e.message);
}
