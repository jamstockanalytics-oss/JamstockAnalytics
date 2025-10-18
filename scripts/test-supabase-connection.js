const SupabaseRenderConnect = require('../lib/supabase/render-connect');

async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase Edge Function connection...');
  console.log('📡 Function URL: https://ojatfvokildmngpzdutf.supabase.co/functions/v1/render-connect');
  
  const connector = new SupabaseRenderConnect();
  
  // Test connection
  console.log('\n1️⃣ Testing basic connection...');
  const connectionResult = await connector.testConnection();
  
  if (connectionResult.success) {
    console.log('✅ Connection successful!');
    
    // Test sending data
    console.log('\n2️⃣ Testing data sync...');
    const syncResult = await connector.syncRenderStatus();
    
    if (syncResult.success) {
      console.log('✅ Data sync successful!');
    } else {
      console.log('❌ Data sync failed:', syncResult.error);
    }
  } else {
    console.log('❌ Connection failed:', connectionResult.error);
    console.log('\n💡 To fix this:');
    console.log('1. Get your Supabase anon key from: https://supabase.com/dashboard/project/ojatfvokildmngpzdutf/settings/api');
    console.log('2. Set the SUPABASE_ANON_KEY environment variable');
    console.log('3. Run this test again');
  }
}

// Run the test
testSupabaseConnection().catch(console.error);
