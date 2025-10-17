const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   EXPO_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupUserBlocking() {
  console.log('🚀 Setting up user blocking functionality...');

  try {
    // Enable necessary extensions
    console.log('📦 Enabling database extensions...');
    await supabase.rpc('exec_sql', {
      sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
    });

    // Create user_blocks table
    console.log('🔒 Creating user_blocks table...');
    const createUserBlocksTable = `
      CREATE TABLE IF NOT EXISTS public.user_blocks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        blocker_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        blocked_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        reason VARCHAR(100) CHECK (reason IN ('harassment', 'spam', 'inappropriate_content', 'misinformation', 'other')),
        reason_details TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        unblocked_at TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(blocker_id, blocked_id)
      );
    `;
    await supabase.rpc('exec_sql', { sql: createUserBlocksTable });

    // Create article_comments table
    console.log('💬 Creating article_comments table...');
    const createArticleCommentsTable = `
      CREATE TABLE IF NOT EXISTS public.article_comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        parent_comment_id UUID REFERENCES public.article_comments(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP WITH TIME ZONE,
        deletion_reason VARCHAR(100),
        like_count INTEGER DEFAULT 0,
        reply_count INTEGER DEFAULT 0,
        is_edited BOOLEAN DEFAULT FALSE,
        edited_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await supabase.rpc('exec_sql', { sql: createArticleCommentsTable });

    // Create comment_interactions table
    console.log('👍 Creating comment_interactions table...');
    const createCommentInteractionsTable = `
      CREATE TABLE IF NOT EXISTS public.comment_interactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        comment_id UUID REFERENCES public.article_comments(id) ON DELETE CASCADE,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'report', 'flag')),
        reason VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(comment_id, user_id, interaction_type)
      );
    `;
    await supabase.rpc('exec_sql', { sql: createCommentInteractionsTable });

    // Create indexes
    console.log('📊 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks(blocker_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks(blocked_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_blocks_active ON public.user_blocks(is_active);',
      'CREATE INDEX IF NOT EXISTS idx_user_blocks_expires ON public.user_blocks(expires_at);',
      'CREATE INDEX IF NOT EXISTS idx_user_blocks_created ON public.user_blocks(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_article_comments_article ON public.article_comments(article_id);',
      'CREATE INDEX IF NOT EXISTS idx_article_comments_user ON public.article_comments(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_article_comments_parent ON public.article_comments(parent_comment_id);',
      'CREATE INDEX IF NOT EXISTS idx_article_comments_created ON public.article_comments(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_article_comments_deleted ON public.article_comments(is_deleted);',
      'CREATE INDEX IF NOT EXISTS idx_article_comments_likes ON public.article_comments(like_count);',
      'CREATE INDEX IF NOT EXISTS idx_comment_interactions_comment ON public.comment_interactions(comment_id);',
      'CREATE INDEX IF NOT EXISTS idx_comment_interactions_user ON public.comment_interactions(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_comment_interactions_type ON public.comment_interactions(interaction_type);'
    ];

    for (const indexSql of indexes) {
      await supabase.rpc('exec_sql', { sql: indexSql });
    }

    // Enable RLS
    console.log('🔐 Enabling Row Level Security...');
    const enableRls = [
      'ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.comment_interactions ENABLE ROW LEVEL SECURITY;'
    ];

    for (const rlsSql of enableRls) {
      await supabase.rpc('exec_sql', { sql: rlsSql });
    }

    // Create RLS policies
    console.log('🛡️ Creating RLS policies...');
    const policies = [
      // User blocks policies
      `CREATE POLICY "Users can view blocks they created or received" ON public.user_blocks
        FOR SELECT USING (
          auth.uid() = blocker_id OR 
          auth.uid() = blocked_id
        );`,
      `CREATE POLICY "Users can create blocks" ON public.user_blocks
        FOR INSERT WITH CHECK (auth.uid() = blocker_id);`,
      `CREATE POLICY "Users can update their own blocks" ON public.user_blocks
        FOR UPDATE USING (auth.uid() = blocker_id);`,
      `CREATE POLICY "Users can delete their own blocks" ON public.user_blocks
        FOR DELETE USING (auth.uid() = blocker_id);`,

      // Article comments policies
      `CREATE POLICY "Users can view non-deleted comments" ON public.article_comments
        FOR SELECT USING (is_deleted = false);`,
      `CREATE POLICY "Users can create comments" ON public.article_comments
        FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update their own comments" ON public.article_comments
        FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can delete their own comments" ON public.article_comments
        FOR DELETE USING (auth.uid() = user_id);`,

      // Comment interactions policies
      `CREATE POLICY "Users can view comment interactions" ON public.comment_interactions
        FOR SELECT USING (true);`,
      `CREATE POLICY "Users can create comment interactions" ON public.comment_interactions
        FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update their own comment interactions" ON public.comment_interactions
        FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can delete their own comment interactions" ON public.comment_interactions
        FOR DELETE USING (auth.uid() = user_id);`
    ];

    for (const policySql of policies) {
      await supabase.rpc('exec_sql', { sql: policySql });
    }

    // Create functions
    console.log('⚙️ Creating database functions...');
    const functions = [
      // Function to check if user is blocked
      `CREATE OR REPLACE FUNCTION is_user_blocked(blocker_uuid UUID, blocked_uuid UUID)
        RETURNS BOOLEAN AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM public.user_blocks 
            WHERE blocker_id = blocker_uuid 
              AND blocked_id = blocked_uuid 
              AND is_active = true 
              AND (expires_at IS NULL OR expires_at > NOW())
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;`,

      // Function to get blocked users for a user
      `CREATE OR REPLACE FUNCTION get_blocked_users(user_uuid UUID)
        RETURNS TABLE (
          blocked_user_id UUID,
          blocked_user_name VARCHAR(255),
          blocked_user_email VARCHAR(255),
          reason VARCHAR(100),
          blocked_at TIMESTAMP WITH TIME ZONE,
          expires_at TIMESTAMP WITH TIME ZONE
        ) AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            u.id,
            u.full_name,
            u.email,
            ub.reason,
            ub.blocked_at,
            ub.expires_at
          FROM public.user_blocks ub
          JOIN public.users u ON ub.blocked_id = u.id
          WHERE ub.blocker_id = user_uuid 
            AND ub.is_active = true
          ORDER BY ub.blocked_at DESC;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;`,

      // Function to unblock a user
      `CREATE OR REPLACE FUNCTION unblock_user(blocker_uuid UUID, blocked_uuid UUID)
        RETURNS BOOLEAN AS $$
        BEGIN
          UPDATE public.user_blocks 
          SET 
            is_active = false,
            unblocked_at = NOW(),
            updated_at = NOW()
          WHERE blocker_id = blocker_uuid 
            AND blocked_id = blocked_uuid 
            AND is_active = true;
          
          RETURN FOUND;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;`,

      // Function to filter comments based on blocks
      `CREATE OR REPLACE FUNCTION filter_comments_for_user(user_uuid UUID)
        RETURNS TABLE (
          comment_id UUID,
          article_id UUID,
          user_id UUID,
          content TEXT,
          created_at TIMESTAMP WITH TIME ZONE,
          like_count INTEGER,
          reply_count INTEGER
        ) AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            ac.id,
            ac.article_id,
            ac.user_id,
            ac.content,
            ac.created_at,
            ac.like_count,
            ac.reply_count
          FROM public.article_comments ac
          WHERE ac.is_deleted = false
            AND NOT is_user_blocked(user_uuid, ac.user_id)
          ORDER BY ac.created_at DESC;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;`
    ];

    for (const functionSql of functions) {
      await supabase.rpc('exec_sql', { sql: functionSql });
    }

    console.log('✅ User blocking functionality setup completed successfully!');
    console.log('');
    console.log('📋 What was created:');
    console.log('   • user_blocks table - for managing user blocks');
    console.log('   • article_comments table - for article discussions');
    console.log('   • comment_interactions table - for likes/reports');
    console.log('   • Database indexes for performance');
    console.log('   • Row Level Security policies');
    console.log('   • Database functions for block management');
    console.log('');
    console.log('🎯 Features available:');
    console.log('   • Block/unblock users with reasons');
    console.log('   • Temporary and permanent blocks');
    console.log('   • Comment system with moderation');
    console.log('   • Automatic filtering of blocked users\' content');
    console.log('   • Secure access control with RLS');

  } catch (error) {
    console.error('❌ Error setting up user blocking:', error);
    process.exit(1);
  }
}

// Run the setup
setupUserBlocking();
