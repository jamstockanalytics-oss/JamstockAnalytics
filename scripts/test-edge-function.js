// Simple test script for Supabase Edge Function
const SUPABASE_URL = 'https://ojatfvokildmngpzdutf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYXRmdm9raWxkbW5ncHpkdXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODc2OTcsImV4cCI6MjA3NTk2MzY5N30.SPFL5e1MWl3N1HGzYQx-T-AeTzail4vutCHNvhjyJqk';

async function testEdgeFunction() {
  console.log('🔄 Testing Supabase Edge Function...');
  console.log('📡 Function URL: https://ojatfvokildmngpzdutf.supabase.co/functions/v1/render-connect');
  
  try {
    // Test 1: Basic connection
    console.log('\n1️⃣ Testing basic connection...');
    const response = await fetch(`${SUPABASE_URL}/functions/v1/render-connect`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connection successful!');
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      // Test 2: Sync data
      console.log('\n2️⃣ Testing sync functionality...');
      const syncResponse = await fetch(`${SUPABASE_URL}/functions/v1/render-connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'sync',
          environment: 'production',
          status: 'active'
        })
      });

      console.log('Sync response status:', syncResponse.status);
      
      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        console.log('✅ Sync successful!');
        console.log('Sync response:', JSON.stringify(syncData, null, 2));
      } else {
        const errorText = await syncResponse.text();
        console.log('❌ Sync failed:', syncResponse.status, syncResponse.statusText);
        console.log('Error details:', errorText);
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ Connection failed:', response.status, response.statusText);
      console.log('Error details:', errorText);
      
      if (response.status === 404) {
        console.log('\n💡 The Edge Function does not exist yet.');
        console.log('📋 Next steps:');
        console.log('1. Deploy the Edge Function using the Supabase dashboard');
        console.log('2. Or follow the deployment guide in SUPABASE_EDGE_FUNCTION_DEPLOYMENT.md');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testEdgeFunction().catch(console.error);
