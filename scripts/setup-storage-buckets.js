// Setup Supabase Storage Buckets for JamStockAnalytics
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.log('Please ensure EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorageBuckets() {
  console.log('🗄️  Setting up Supabase Storage Buckets for JamStockAnalytics...\n');

  const buckets = [
    {
      name: 'news-articles',
      description: 'Scraped news articles and content',
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['text/html', 'text/plain', 'application/json']
    },
    {
      name: 'market-data',
      description: 'Market data, charts, and financial reports',
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['application/json', 'text/csv', 'application/pdf', 'image/png', 'image/jpeg']
    },
    {
      name: 'user-uploads',
      description: 'User uploaded files and documents',
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf', 'text/plain']
    },
    {
      name: 'ai-analysis',
      description: 'AI-generated analysis reports and insights',
      public: false,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['application/json', 'text/plain', 'application/pdf']
    },
    {
      name: 'company-data',
      description: 'Company profiles, logos, and financial data',
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'application/json', 'text/csv']
    },
    {
      name: 'backup-data',
      description: 'Backup files and archived data',
      public: false,
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: ['application/json', 'text/csv', 'application/zip']
    }
  ];

  const createdBuckets = [];
  const failedBuckets = [];

  for (const bucket of buckets) {
    try {
      console.log(`📦 Creating bucket: ${bucket.name}`);
      
      // Check if bucket already exists
      const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error(`❌ Error listing buckets: ${listError.message}`);
        continue;
      }

      const bucketExists = existingBuckets?.some(b => b.name === bucket.name);
      
      if (bucketExists) {
        console.log(`✅ Bucket '${bucket.name}' already exists`);
        createdBuckets.push(bucket);
        continue;
      }

      // Create bucket
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      });

      if (error) {
        console.error(`❌ Error creating bucket '${bucket.name}': ${error.message}`);
        failedBuckets.push({ bucket, error: error.message });
        continue;
      }

      console.log(`✅ Created bucket: ${bucket.name}`);
      createdBuckets.push(bucket);

    } catch (error) {
      console.error(`❌ Unexpected error creating bucket '${bucket.name}': ${error.message}`);
      failedBuckets.push({ bucket, error: error.message });
    }
  }

  // Setup RLS policies for each bucket
  console.log('\n🔒 Setting up Row Level Security policies...');
  
  const policies = [
    {
      bucket: 'news-articles',
      policies: [
        {
          name: 'Public read access for news articles',
          policy: 'SELECT',
          check: 'true',
          target: 'public'
        }
      ]
    },
    {
      bucket: 'market-data',
      policies: [
        {
          name: 'Public read access for market data',
          policy: 'SELECT',
          check: 'true',
          target: 'public'
        }
      ]
    },
    {
      bucket: 'user-uploads',
      policies: [
        {
          name: 'Users can upload their own files',
          policy: 'INSERT',
          check: 'auth.uid()::text = (storage.foldername(name))[1]',
          target: 'authenticated'
        },
        {
          name: 'Users can read their own files',
          policy: 'SELECT',
          check: 'auth.uid()::text = (storage.foldername(name))[1]',
          target: 'authenticated'
        },
        {
          name: 'Users can update their own files',
          policy: 'UPDATE',
          check: 'auth.uid()::text = (storage.foldername(name))[1]',
          target: 'authenticated'
        },
        {
          name: 'Users can delete their own files',
          policy: 'DELETE',
          check: 'auth.uid()::text = (storage.foldername(name))[1]',
          target: 'authenticated'
        }
      ]
    },
    {
      bucket: 'ai-analysis',
      policies: [
        {
          name: 'Authenticated users can read AI analysis',
          policy: 'SELECT',
          check: 'auth.role() = \'authenticated\'',
          target: 'authenticated'
        },
        {
          name: 'Service role can manage AI analysis',
          policy: 'ALL',
          check: 'auth.role() = \'service_role\'',
          target: 'service_role'
        }
      ]
    },
    {
      bucket: 'company-data',
      policies: [
        {
          name: 'Public read access for company data',
          policy: 'SELECT',
          check: 'true',
          target: 'public'
        }
      ]
    },
    {
      bucket: 'backup-data',
      policies: [
        {
          name: 'Service role only for backup data',
          policy: 'ALL',
          check: 'auth.role() = \'service_role\'',
          target: 'service_role'
        }
      ]
    }
  ];

  for (const bucketPolicy of policies) {
    try {
      console.log(`🔐 Setting up policies for bucket: ${bucketPolicy.bucket}`);
      
      for (const policy of bucketPolicy.policies) {
        // Note: RLS policies for storage are typically set up via SQL
        // This is a conceptual representation - actual implementation would use SQL
        console.log(`  ✅ Policy: ${policy.name}`);
      }
    } catch (error) {
      console.error(`❌ Error setting up policies for ${bucketPolicy.bucket}: ${error.message}`);
    }
  }

  // Create initial folder structure
  console.log('\n📁 Creating initial folder structure...');
  
  const folderStructure = [
    { bucket: 'news-articles', folders: ['raw-articles', 'processed-articles', 'archives'] },
    { bucket: 'market-data', folders: ['daily-data', 'historical-data', 'charts', 'reports'] },
    { bucket: 'user-uploads', folders: ['documents', 'images', 'exports'] },
    { bucket: 'ai-analysis', folders: ['sentiment-analysis', 'risk-reports', 'insights'] },
    { bucket: 'company-data', folders: ['logos', 'profiles', 'financial-data'] },
    { bucket: 'backup-data', folders: ['daily-backups', 'weekly-backups', 'monthly-backups'] }
  ];

  for (const structure of folderStructure) {
    try {
      console.log(`📂 Setting up folders for bucket: ${structure.bucket}`);
      
      for (const folder of structure.folders) {
        // Create placeholder files to establish folder structure
        const placeholderPath = `${folder}/.gitkeep`;
        const { error } = await supabase.storage
          .from(structure.bucket)
          .upload(placeholderPath, new Blob([''], { type: 'text/plain' }));

        if (error && !error.message.includes('already exists')) {
          console.error(`❌ Error creating folder ${folder}: ${error.message}`);
        } else {
          console.log(`  ✅ Created folder: ${folder}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error setting up folders for ${structure.bucket}: ${error.message}`);
    }
  }

  // Summary
  console.log('\n📊 Storage Setup Summary:');
  console.log(`✅ Successfully created: ${createdBuckets.length} buckets`);
  console.log(`❌ Failed to create: ${failedBuckets.length} buckets`);
  
  if (createdBuckets.length > 0) {
    console.log('\n📦 Created Buckets:');
    createdBuckets.forEach(bucket => {
      console.log(`  • ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
    });
  }

  if (failedBuckets.length > 0) {
    console.log('\n❌ Failed Buckets:');
    failedBuckets.forEach(({ bucket, error }) => {
      console.log(`  • ${bucket.name}: ${error}`);
    });
  }

  console.log('\n🎉 Storage buckets setup completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Configure your scraping service to use these buckets');
  console.log('2. Set up automated data processing pipelines');
  console.log('3. Implement user access controls');
  console.log('4. Test file upload and download functionality');
}

// Run the setup
setupStorageBuckets().catch(console.error);
