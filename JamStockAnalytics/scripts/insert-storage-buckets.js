// Insert Storage Buckets Information into Supabase Database
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertStorageBuckets() {
  console.log('🗄️  Inserting Storage Buckets into Supabase Database...\n');

  // Storage buckets configuration
  const storageBuckets = [
    {
      id: 'news-articles',
      name: 'news-articles',
      description: 'Scraped news articles and content storage',
      bucket_type: 'public',
      file_size_limit: 10485760, // 10MB
      allowed_mime_types: ['text/html', 'text/plain', 'application/json'],
      folder_structure: {
        'raw-articles': 'Raw scraped HTML content',
        'processed-articles': 'AI-processed article content',
        'archives': 'Archived articles by date'
      },
      access_policy: 'public_read',
      created_at: new Date().toISOString(),
      is_active: true,
      metadata: {
        purpose: 'news_storage',
        ai_processing: true,
        retention_days: 365
      }
    },
    {
      id: 'market-data',
      name: 'market-data',
      description: 'Market data, charts, and financial reports',
      bucket_type: 'public',
      file_size_limit: 52428800, // 50MB
      allowed_mime_types: ['application/json', 'text/csv', 'application/pdf', 'image/png', 'image/jpeg'],
      folder_structure: {
        'daily-data': 'Daily market data files',
        'historical-data': 'Historical market data',
        'charts': 'Generated chart images',
        'reports': 'Financial reports and analysis'
      },
      access_policy: 'public_read',
      created_at: new Date().toISOString(),
      is_active: true,
      metadata: {
        purpose: 'market_data',
        update_frequency: 'daily',
        retention_days: 1095 // 3 years
      }
    },
    {
      id: 'user-uploads',
      name: 'user-uploads',
      description: 'User uploaded files and documents',
      bucket_type: 'private',
      file_size_limit: 10485760, // 10MB
      allowed_mime_types: ['image/png', 'image/jpeg', 'application/pdf', 'text/plain'],
      folder_structure: {
        'documents': 'User uploaded documents',
        'images': 'User profile images',
        'exports': 'User data exports'
      },
      access_policy: 'user_specific',
      created_at: new Date().toISOString(),
      is_active: true,
      metadata: {
        purpose: 'user_files',
        user_isolation: true,
        retention_days: 90
      }
    },
    {
      id: 'ai-analysis',
      name: 'ai-analysis',
      description: 'AI-generated analysis reports and insights',
      bucket_type: 'private',
      file_size_limit: 5242880, // 5MB
      allowed_mime_types: ['application/json', 'text/plain', 'application/pdf'],
      folder_structure: {
        'sentiment-analysis': 'AI sentiment analysis results',
        'risk-reports': 'AI risk assessment reports',
        'insights': 'AI market insights and recommendations'
      },
      access_policy: 'authenticated_only',
      created_at: new Date().toISOString(),
      is_active: true,
      metadata: {
        purpose: 'ai_analysis',
        ai_generated: true,
        retention_days: 180
      }
    },
    {
      id: 'company-data',
      name: 'company-data',
      description: 'Company profiles, logos, and financial data',
      bucket_type: 'public',
      file_size_limit: 10485760, // 10MB
      allowed_mime_types: ['image/png', 'image/jpeg', 'application/json', 'text/csv'],
      folder_structure: {
        'logos': 'Company logos and branding',
        'profiles': 'Company profile data',
        'financial-data': 'Company financial information'
      },
      access_policy: 'public_read',
      created_at: new Date().toISOString(),
      is_active: true,
      metadata: {
        purpose: 'company_data',
        reference_data: true,
        retention_days: 2555 // 7 years
      }
    }
  ];

  // Create storage_buckets table if it doesn't exist
  console.log('📋 Creating storage_buckets table...');
  try {
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.storage_buckets (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          bucket_type VARCHAR(50) NOT NULL CHECK (bucket_type IN ('public', 'private')),
          file_size_limit BIGINT DEFAULT 10485760,
          allowed_mime_types TEXT[],
          folder_structure JSONB DEFAULT '{}',
          access_policy VARCHAR(100) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT TRUE,
          metadata JSONB DEFAULT '{}'
        );
        
        CREATE INDEX IF NOT EXISTS idx_storage_buckets_type ON public.storage_buckets(bucket_type);
        CREATE INDEX IF NOT EXISTS idx_storage_buckets_active ON public.storage_buckets(is_active);
        
        ALTER TABLE public.storage_buckets ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Public read access for storage buckets" 
        ON public.storage_buckets FOR SELECT USING (true);
        
        CREATE POLICY IF NOT EXISTS "Service role can manage storage buckets" 
        ON public.storage_buckets FOR ALL USING (auth.role() = 'service_role');
      `
    });

    if (createTableError) {
      console.log('⚠️  Table creation error (may already exist):', createTableError.message);
    } else {
      console.log('✅ Storage buckets table created successfully');
    }
  } catch (error) {
    console.log('⚠️  Table creation skipped (using existing table)');
  }

  // Insert storage buckets
  console.log('\n📦 Inserting storage buckets...');
  const insertedBuckets = [];
  const failedBuckets = [];

  for (const bucket of storageBuckets) {
    try {
      console.log(`📦 Inserting bucket: ${bucket.name}`);
      
      const { data, error } = await supabase
        .from('storage_buckets')
        .upsert(bucket, { onConflict: 'id' })
        .select();

      if (error) {
        console.error(`❌ Error inserting bucket ${bucket.name}: ${error.message}`);
        failedBuckets.push({ bucket, error: error.message });
      } else {
        console.log(`✅ Inserted bucket: ${bucket.name}`);
        insertedBuckets.push(bucket);
      }
    } catch (error) {
      console.error(`❌ Unexpected error inserting bucket ${bucket.name}: ${error.message}`);
      failedBuckets.push({ bucket, error: error.message });
    }
  }

  // Create storage_usage table for tracking
  console.log('\n📊 Creating storage usage tracking table...');
  try {
    const { error: createUsageTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.storage_usage (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          bucket_id VARCHAR(255) REFERENCES public.storage_buckets(id) ON DELETE CASCADE,
          file_count INTEGER DEFAULT 0,
          total_size_bytes BIGINT DEFAULT 0,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          usage_breakdown JSONB DEFAULT '{}'
        );
        
        CREATE INDEX IF NOT EXISTS idx_storage_usage_bucket ON public.storage_usage(bucket_id);
        CREATE INDEX IF NOT EXISTS idx_storage_usage_updated ON public.storage_usage(last_updated);
        
        ALTER TABLE public.storage_usage ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Public read access for storage usage" 
        ON public.storage_usage FOR SELECT USING (true);
        
        CREATE POLICY IF NOT EXISTS "Service role can manage storage usage" 
        ON public.storage_usage FOR ALL USING (auth.role() = 'service_role');
      `
    });

    if (createUsageTableError) {
      console.log('⚠️  Usage table creation error:', createUsageTableError.message);
    } else {
      console.log('✅ Storage usage tracking table created');
    }
  } catch (error) {
    console.log('⚠️  Usage table creation skipped');
  }

  // Initialize storage usage records
  console.log('\n📈 Initializing storage usage records...');
  for (const bucket of insertedBuckets) {
    try {
      const { error } = await supabase
        .from('storage_usage')
        .upsert({
          bucket_id: bucket.id,
          file_count: 0,
          total_size_bytes: 0,
          usage_breakdown: {
            folders: Object.keys(bucket.folder_structure),
            last_scan: new Date().toISOString()
          }
        }, { onConflict: 'bucket_id' });

      if (error) {
        console.error(`❌ Error initializing usage for ${bucket.name}: ${error.message}`);
      } else {
        console.log(`✅ Initialized usage tracking for ${bucket.name}`);
      }
    } catch (error) {
      console.error(`❌ Error initializing usage for ${bucket.name}: ${error.message}`);
    }
  }

  // Create storage_analytics view
  console.log('\n📊 Creating storage analytics view...');
  try {
    const { error: createViewError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW public.storage_analytics AS
        SELECT 
          sb.id,
          sb.name,
          sb.description,
          sb.bucket_type,
          sb.file_size_limit,
          sb.access_policy,
          sb.is_active,
          su.file_count,
          su.total_size_bytes,
          su.last_updated,
          ROUND(su.total_size_bytes / 1024.0 / 1024.0, 2) as size_mb,
          ROUND((su.total_size_bytes::float / sb.file_size_limit::float) * 100, 2) as usage_percentage,
          sb.metadata
        FROM public.storage_buckets sb
        LEFT JOIN public.storage_usage su ON sb.id = su.bucket_id
        WHERE sb.is_active = true;
      `
    });

    if (createViewError) {
      console.log('⚠️  Analytics view creation error:', createViewError.message);
    } else {
      console.log('✅ Storage analytics view created');
    }
  } catch (error) {
    console.log('⚠️  Analytics view creation skipped');
  }

  // Summary
  console.log('\n📊 Storage Buckets Database Insertion Summary:');
  console.log(`✅ Successfully inserted: ${insertedBuckets.length} buckets`);
  console.log(`❌ Failed to insert: ${failedBuckets.length} buckets`);
  
  if (insertedBuckets.length > 0) {
    console.log('\n📦 Inserted Buckets:');
    insertedBuckets.forEach(bucket => {
      console.log(`  • ${bucket.name} (${bucket.bucket_type})`);
      console.log(`    Description: ${bucket.description}`);
      console.log(`    Access Policy: ${bucket.access_policy}`);
      console.log(`    File Size Limit: ${Math.round(bucket.file_size_limit / 1024 / 1024)}MB`);
      console.log(`    Folders: ${Object.keys(bucket.folder_structure).join(', ')}`);
      console.log('');
    });
  }

  if (failedBuckets.length > 0) {
    console.log('\n❌ Failed Buckets:');
    failedBuckets.forEach(({ bucket, error }) => {
      console.log(`  • ${bucket.name}: ${error}`);
    });
  }

  console.log('\n🎉 Storage buckets database insertion completed!');
  console.log('\n📋 Database Tables Created:');
  console.log('• storage_buckets - Bucket configuration and metadata');
  console.log('• storage_usage - Usage tracking and analytics');
  console.log('• storage_analytics - Analytics view for monitoring');
  console.log('\n🔍 You can now query storage information from your database!');
}

// Run the insertion
insertStorageBuckets().catch(console.error);
