// Test Supabase Storage Integration
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testStorageIntegration() {
  console.log('🧪 Testing Supabase Storage Integration...\n');

  // Test 1: List all buckets
  console.log('1️⃣ Testing bucket listing...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error(`❌ Error listing buckets: ${error.message}`);
    } else {
      console.log(`✅ Found ${buckets.length} buckets:`);
      buckets.forEach(bucket => {
        console.log(`  • ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
      });
    }
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
  }

  // Test 2: Test file upload to news-articles bucket
  console.log('\n2️⃣ Testing file upload to news-articles bucket...');
  try {
    const testArticle = {
      id: 'test-article-001',
      headline: 'Test Article: JSE Market Update',
      content: 'This is a test article for storage integration.',
      source: 'Test Source',
      published_at: new Date().toISOString(),
      ai_priority_score: 8.5,
      company_tickers: ['NCBFG', 'SGJ']
    };

    const { data, error } = await supabase.storage
      .from('news-articles')
      .upload('processed-articles/test-article-001.json', JSON.stringify(testArticle, null, 2), {
        contentType: 'application/json',
        cacheControl: '3600'
      });

    if (error) {
      console.error(`❌ Error uploading test article: ${error.message}`);
    } else {
      console.log('✅ Test article uploaded successfully');
      console.log(`  Path: ${data.path}`);
    }
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
  }

  // Test 3: Test file download
  console.log('\n3️⃣ Testing file download...');
  try {
    const { data, error } = await supabase.storage
      .from('news-articles')
      .download('processed-articles/test-article-001.json');

    if (error) {
      console.error(`❌ Error downloading file: ${error.message}`);
    } else {
      console.log('✅ File downloaded successfully');
      const text = await data.text();
      const article = JSON.parse(text);
      console.log(`  Article ID: ${article.id}`);
      console.log(`  Headline: ${article.headline}`);
    }
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
  }

  // Test 4: Test public URL generation
  console.log('\n4️⃣ Testing public URL generation...');
  try {
    const { data } = supabase.storage
      .from('news-articles')
      .getPublicUrl('processed-articles/test-article-001.json');

    console.log('✅ Public URL generated:');
    console.log(`  URL: ${data.publicUrl}`);
  } catch (error) {
    console.error(`❌ Error generating public URL: ${error.message}`);
  }

  // Test 5: Test file listing
  console.log('\n5️⃣ Testing file listing...');
  try {
    const { data, error } = await supabase.storage
      .from('news-articles')
      .list('processed-articles');

    if (error) {
      console.error(`❌ Error listing files: ${error.message}`);
    } else {
      console.log(`✅ Found ${data.length} files in processed-articles folder:`);
      data.forEach(file => {
        console.log(`  • ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
      });
    }
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
  }

  // Test 6: Test market data storage
  console.log('\n6️⃣ Testing market data storage...');
  try {
    const marketData = {
      date: new Date().toISOString().split('T')[0],
      jse_index: 125.5,
      volume: 1500000,
      top_gainers: ['NCBFG', 'SGJ', 'GHL'],
      top_losers: ['SJ', 'JMMBGL']
    };

    const { data, error } = await supabase.storage
      .from('market-data')
      .upload(`daily-data/${marketData.date}.json`, JSON.stringify(marketData, null, 2), {
        contentType: 'application/json'
      });

    if (error) {
      console.error(`❌ Error uploading market data: ${error.message}`);
    } else {
      console.log('✅ Market data uploaded successfully');
    }
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
  }

  // Test 7: Test AI analysis storage
  console.log('\n7️⃣ Testing AI analysis storage...');
  try {
    const aiAnalysis = {
      analysis_id: 'sentiment-001',
      date: new Date().toISOString().split('T')[0],
      overall_sentiment: 0.65,
      bullish_percentage: 45,
      bearish_percentage: 35,
      neutral_percentage: 20,
      red_flags: [
        { company: 'NCBFG', risk: 'High', reason: 'Declining earnings' }
      ]
    };

    const { data, error } = await supabase.storage
      .from('ai-analysis')
      .upload(`sentiment-analysis/${aiAnalysis.date}.json`, JSON.stringify(aiAnalysis, null, 2), {
        contentType: 'application/json'
      });

    if (error) {
      console.error(`❌ Error uploading AI analysis: ${error.message}`);
    } else {
      console.log('✅ AI analysis uploaded successfully');
    }
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
  }

  // Test 8: Test user uploads (simulated)
  console.log('\n8️⃣ Testing user uploads simulation...');
  try {
    const userDocument = {
      user_id: 'test-user-001',
      document_type: 'financial_report',
      content: 'This is a test user document.',
      uploaded_at: new Date().toISOString()
    };

    const { data, error } = await supabase.storage
      .from('user-uploads')
      .upload(`documents/test-user-001/test-document.json`, JSON.stringify(userDocument, null, 2), {
        contentType: 'application/json'
      });

    if (error) {
      console.error(`❌ Error uploading user document: ${error.message}`);
    } else {
      console.log('✅ User document uploaded successfully');
    }
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
  }

  // Test 9: Test company data storage
  console.log('\n9️⃣ Testing company data storage...');
  try {
    const companyData = {
      ticker: 'NCBFG',
      name: 'NCB Financial Group Limited',
      sector: 'Financial Services',
      market_cap: 125000000000,
      last_price: 125.50,
      logo_url: 'https://example.com/ncbfg-logo.png'
    };

    const { data, error } = await supabase.storage
      .from('company-data')
      .upload(`profiles/NCBFG.json`, JSON.stringify(companyData, null, 2), {
        contentType: 'application/json'
      });

    if (error) {
      console.error(`❌ Error uploading company data: ${error.message}`);
    } else {
      console.log('✅ Company data uploaded successfully');
    }
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
  }

  // Test 10: Cleanup test files
  console.log('\n🔧 Cleaning up test files...');
  try {
    const filesToDelete = [
      'processed-articles/test-article-001.json',
      'daily-data/2024-01-01.json',
      'sentiment-analysis/2024-01-01.json',
      'documents/test-user-001/test-document.json',
      'profiles/NCBFG.json'
    ];

    for (const filePath of filesToDelete) {
      const bucketName = filePath.includes('processed-articles') ? 'news-articles' :
                        filePath.includes('daily-data') ? 'market-data' :
                        filePath.includes('sentiment-analysis') ? 'ai-analysis' :
                        filePath.includes('documents') ? 'user-uploads' :
                        'company-data';

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.log(`⚠️  Could not delete ${filePath}: ${error.message}`);
      } else {
        console.log(`✅ Deleted ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error during cleanup: ${error.message}`);
  }

  console.log('\n🎉 Storage integration test completed!');
  console.log('\n📋 Storage buckets are ready for:');
  console.log('• News article storage and retrieval');
  console.log('• Market data management');
  console.log('• AI analysis results');
  console.log('• User file uploads');
  console.log('• Company data storage');
  console.log('\n🚀 Your scraping service can now use these buckets!');
}

// Run the test
testStorageIntegration().catch(console.error);
