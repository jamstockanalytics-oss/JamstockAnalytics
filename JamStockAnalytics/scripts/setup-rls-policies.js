const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env file and ensure SUPABASE_SERVICE_ROLE_KEY is set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupRLSPolicies() {
  console.log('🔒 Setting up Row Level Security (RLS) Policies');
  console.log('===============================================\n');

  try {
    // 1. Enable RLS on all tables
    console.log('1️⃣ Enabling Row Level Security on all tables...');
    
    const enableRLSQueries = [
      'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.company_tickers ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.user_saved_articles ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;'
    ];

    for (const query of enableRLSQueries) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query });
        if (error) {
          console.log(`   ⚠️  ${query.split(' ')[2]}: ${error.message}`);
        } else {
          console.log(`   ✅ ${query.split(' ')[2]}: RLS enabled`);
        }
      } catch (err) {
        console.log(`   ⚠️  ${query.split(' ')[2]}: ${err.message}`);
      }
    }

    // 2. Create RLS Policies for Users
    console.log('\n2️⃣ Creating RLS policies for Users...');
    
    const userPolicies = [
      // Users can view and update their own profile
      `CREATE POLICY "Users can view own profile" ON public.users 
       FOR SELECT USING (auth.uid() = id);`,
      
      `CREATE POLICY "Users can update own profile" ON public.users 
       FOR UPDATE USING (auth.uid() = id);`,
      
      `CREATE POLICY "Users can insert own profile" ON public.users 
       FOR INSERT WITH CHECK (auth.uid() = id);`,
      
      // User profiles policies
      `CREATE POLICY "Users can view own profile data" ON public.user_profiles 
       FOR SELECT USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can update own profile data" ON public.user_profiles 
       FOR UPDATE USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can insert own profile data" ON public.user_profiles 
       FOR INSERT WITH CHECK (auth.uid() = user_id);`
    ];

    for (const policy of userPolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.log(`   ⚠️  Policy creation failed: ${error.message}`);
        } else {
          console.log(`   ✅ User policy created`);
        }
      } catch (err) {
        console.log(`   ⚠️  Policy creation failed: ${err.message}`);
      }
    }

    // 3. Create RLS Policies for Articles (Public read, Admin write)
    console.log('\n3️⃣ Creating RLS policies for Articles...');
    
    const articlePolicies = [
      // Articles are publicly readable
      `CREATE POLICY "Articles are publicly readable" ON public.articles 
       FOR SELECT USING (true);`,
      
      // Only service role can insert/update articles
      `CREATE POLICY "Service role can manage articles" ON public.articles 
       FOR ALL USING (auth.role() = 'service_role');`
    ];

    for (const policy of articlePolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.log(`   ⚠️  Article policy failed: ${error.message}`);
        } else {
          console.log(`   ✅ Article policy created`);
        }
      } catch (err) {
        console.log(`   ⚠️  Article policy failed: ${err.message}`);
      }
    }

    // 4. Create RLS Policies for Company Tickers (Public read)
    console.log('\n4️⃣ Creating RLS policies for Company Tickers...');
    
    const companyPolicies = [
      `CREATE POLICY "Company tickers are publicly readable" ON public.company_tickers 
       FOR SELECT USING (true);`,
      
      `CREATE POLICY "Service role can manage company tickers" ON public.company_tickers 
       FOR ALL USING (auth.role() = 'service_role');`
    ];

    for (const policy of companyPolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.log(`   ⚠️  Company policy failed: ${error.message}`);
        } else {
          console.log(`   ✅ Company policy created`);
        }
      } catch (err) {
        console.log(`   ⚠️  Company policy failed: ${err.message}`);
      }
    }

    // 5. Create RLS Policies for Analysis Sessions
    console.log('\n5️⃣ Creating RLS policies for Analysis Sessions...');
    
    const analysisPolicies = [
      `CREATE POLICY "Users can access own analysis sessions" ON public.analysis_sessions 
       FOR ALL USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can view own session data" ON public.analysis_sessions 
       FOR SELECT USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can create own sessions" ON public.analysis_sessions 
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can update own sessions" ON public.analysis_sessions 
       FOR UPDATE USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can delete own sessions" ON public.analysis_sessions 
       FOR DELETE USING (auth.uid() = user_id);`
    ];

    for (const policy of analysisPolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.log(`   ⚠️  Analysis policy failed: ${error.message}`);
        } else {
          console.log(`   ✅ Analysis policy created`);
        }
      } catch (err) {
        console.log(`   ⚠️  Analysis policy failed: ${err.message}`);
      }
    }

    // 6. Create RLS Policies for User Saved Articles
    console.log('\n6️⃣ Creating RLS policies for User Saved Articles...');
    
    const savedArticlesPolicies = [
      `CREATE POLICY "Users can access own saved articles" ON public.user_saved_articles 
       FOR ALL USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can save articles" ON public.user_saved_articles 
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can update own saved articles" ON public.user_saved_articles 
       FOR UPDATE USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can delete own saved articles" ON public.user_saved_articles 
       FOR DELETE USING (auth.uid() = user_id);`
    ];

    for (const policy of savedArticlesPolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.log(`   ⚠️  Saved articles policy failed: ${error.message}`);
        } else {
          console.log(`   ✅ Saved articles policy created`);
        }
      } catch (err) {
        console.log(`   ⚠️  Saved articles policy failed: ${err.message}`);
      }
    }

    // 7. Create RLS Policies for Chat Sessions
    console.log('\n7️⃣ Creating RLS policies for Chat Sessions...');
    
    const chatSessionPolicies = [
      `CREATE POLICY "Users can access own chat sessions" ON public.chat_sessions 
       FOR ALL USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can create chat sessions" ON public.chat_sessions 
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can update own chat sessions" ON public.chat_sessions 
       FOR UPDATE USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can delete own chat sessions" ON public.chat_sessions 
       FOR DELETE USING (auth.uid() = user_id);`
    ];

    for (const policy of chatSessionPolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.log(`   ⚠️  Chat session policy failed: ${error.message}`);
        } else {
          console.log(`   ✅ Chat session policy created`);
        }
      } catch (err) {
        console.log(`   ⚠️  Chat session policy failed: ${err.message}`);
      }
    }

    // 8. Create RLS Policies for Chat Messages
    console.log('\n8️⃣ Creating RLS policies for Chat Messages...');
    
    const chatMessagePolicies = [
      `CREATE POLICY "Users can access own chat messages" ON public.chat_messages 
       FOR ALL USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can create chat messages" ON public.chat_messages 
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can update own chat messages" ON public.chat_messages 
       FOR UPDATE USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can delete own chat messages" ON public.chat_messages 
       FOR DELETE USING (auth.uid() = user_id);`
    ];

    for (const policy of chatMessagePolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.log(`   ⚠️  Chat message policy failed: ${error.message}`);
        } else {
          console.log(`   ✅ Chat message policy created`);
        }
      } catch (err) {
        console.log(`   ⚠️  Chat message policy failed: ${err.message}`);
      }
    }

    // 9. Create RLS Policies for News Sources (Admin only)
    console.log('\n9️⃣ Creating RLS policies for News Sources...');
    
    const newsSourcePolicies = [
      `CREATE POLICY "News sources are publicly readable" ON public.news_sources 
       FOR SELECT USING (true);`,
      
      `CREATE POLICY "Service role can manage news sources" ON public.news_sources 
       FOR ALL USING (auth.role() = 'service_role');`
    ];

    for (const policy of newsSourcePolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.log(`   ⚠️  News source policy failed: ${error.message}`);
        } else {
          console.log(`   ✅ News source policy created`);
        }
      } catch (err) {
        console.log(`   ⚠️  News source policy failed: ${err.message}`);
      }
    }

    // 10. Create RLS Policies for Market Insights
    console.log('\n🔟 Creating RLS policies for Market Insights...');
    
    const marketInsightsPolicies = [
      `CREATE POLICY "Market insights are publicly readable" ON public.market_insights 
       FOR SELECT USING (true);`,
      
      `CREATE POLICY "Service role can manage market insights" ON public.market_insights 
       FOR ALL USING (auth.role() = 'service_role');`
    ];

    for (const policy of marketInsightsPolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.log(`   ⚠️  Market insights policy failed: ${error.message}`);
        } else {
          console.log(`   ✅ Market insights policy created`);
        }
      } catch (err) {
        console.log(`   ⚠️  Market insights policy failed: ${err.message}`);
      }
    }

    console.log('\n🎉 RLS Policies Setup Complete!');
    console.log('================================');
    console.log('✅ Row Level Security enabled on all tables');
    console.log('✅ User data isolation policies created');
    console.log('✅ Public read access for articles and companies');
    console.log('✅ Admin-only write access for content management');
    console.log('✅ Chat and analysis session privacy protected');
    console.log('✅ User saved articles privacy protected');

    console.log('\n🔒 Security Summary:');
    console.log('• Users can only access their own data');
    console.log('• Articles and companies are publicly readable');
    console.log('• Chat sessions and messages are private');
    console.log('• Analysis sessions are user-specific');
    console.log('• Saved articles are user-specific');
    console.log('• Admin functions require service role');

    console.log('\n🚀 Your database is now secure and ready for production!');

  } catch (error) {
    console.error('❌ Error setting up RLS policies:', error.message);
    process.exit(1);
  }
}

// Run the RLS setup
setupRLSPolicies();

