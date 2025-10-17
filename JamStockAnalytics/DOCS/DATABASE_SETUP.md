# Database Setup Guide for Financial News Analyzer App

This guide will help you set up the complete database schema for your Financial News Analyzer App using Supabase.

## 📋 Prerequisites

Before setting up the database, ensure you have:

1. **Supabase Project**: Create a new project at [supabase.com](https://supabase.com)
2. **Environment Variables**: Set up your environment variables
3. **Node.js**: Version 16 or higher
4. **Required Dependencies**: Install the necessary packages

## 🔧 Environment Setup

### 1. Create Environment File

Create a `.env` file in your project root with the following variables:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Service Configuration
EXPO_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 2. Install Required Dependencies

```bash
npm install @supabase/supabase-js dotenv
```

## 🗄️ Database Schema Overview

The database schema includes the following main components:

### Core Tables
- **users**: User profiles and authentication
- **user_profiles**: Extended user information
- **articles**: News articles with AI analysis
- **company_tickers**: JSE and Junior Market companies
- **news_sources**: Configuration for news aggregation

### User Interaction Tables
- **user_saved_articles**: User's saved articles
- **user_article_interactions**: Views, likes, shares
- **chat_sessions**: AI chat conversations
- **chat_messages**: Individual chat messages

### Analysis Tables
- **analysis_sessions**: Deep research sessions
- **analysis_notes**: Session notes and findings
- **market_data**: Historical market data
- **market_insights**: AI-generated market analysis

### Notification Tables
- **user_notifications**: User notification system
- **user_alert_subscriptions**: Alert preferences

## 🚀 Database Setup

### Option 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
# Set up the complete database schema
npm run setup-database

# Populate with sample data
npm run seed-database

# Or do both in one command
npm run reset-database
```

### Option 2: Manual Setup

If you prefer to set up the database manually:

1. **Copy the SQL Schema**:
   - Open `DOCS/database-schema.sql`
   - Copy the entire SQL content
   - Paste it into your Supabase SQL Editor
   - Execute the script

2. **Verify Tables**:
   - Check that all tables are created
   - Verify indexes are in place
   - Confirm RLS policies are active

## 📊 Database Features

### AI-Powered Analysis
- **Priority Scoring**: Articles are automatically scored (0-10) based on AI analysis
- **Sentiment Analysis**: AI determines article sentiment (-1 to 1)
- **Relevance Scoring**: Articles are scored for Jamaican market relevance
- **Smart Summaries**: AI-generated article summaries

### User Management
- **Row Level Security**: Users can only access their own data
- **Profile Management**: Extended user profiles with investment preferences
- **Activity Tracking**: User engagement and interaction tracking

### Content Management
- **News Aggregation**: Support for multiple news sources
- **Company Relationships**: Articles linked to relevant companies
- **Tagging System**: Flexible tagging for articles and user content

### Analysis Tools
- **Session Management**: Track analysis sessions with timers
- **Note Taking**: Structured note-taking during analysis
- **Progress Tracking**: Monitor analysis completion and insights

## 🔍 Database Views

The schema includes several useful views:

### `articles_with_companies`
Combines articles with company information for easy querying.

### `user_analysis_summary`
Provides user analysis statistics and progress.

### `popular_articles`
Shows articles ranked by user interactions.

## 📈 Performance Optimizations

### Indexes
- **Priority Index**: Fast sorting by AI priority score
- **Date Index**: Efficient date-based queries
- **Full-Text Search**: GIN indexes for content search
- **Array Indexes**: Efficient querying of ticker arrays

### Query Optimization
- **Materialized Views**: Pre-computed aggregations
- **Connection Pooling**: Efficient database connections
- **Query Caching**: Reduced database load

## 🔒 Security Features

### Row Level Security (RLS)
- **User Isolation**: Users can only access their own data
- **Public Content**: Articles and market data are publicly readable
- **Admin Access**: Service role key for administrative operations

### Data Validation
- **Type Constraints**: Strict data type validation
- **Check Constraints**: Business rule enforcement
- **Foreign Key Constraints**: Referential integrity

## 🧪 Testing the Setup

### 1. Verify Database Connection

```typescript
import { supabase } from './lib/supabase/client';

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('Database connection failed:', error);
  } else {
    console.log('Database connection successful');
  }
};
```

### 2. Test Sample Queries

```typescript
// Get articles sorted by priority
const getTopArticles = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('ai_priority_score', { ascending: false })
    .limit(10);
  
  return data;
};

// Get user's saved articles
const getUserSavedArticles = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_saved_articles')
    .select(`
      article:articles(*)
    `)
    .eq('user_id', userId);
  
  return data;
};
```

## 🛠️ Maintenance

### Regular Tasks
1. **Monitor Performance**: Check query performance and optimize as needed
2. **Update Indexes**: Add indexes for new query patterns
3. **Clean Old Data**: Archive old articles and sessions
4. **Backup Strategy**: Regular database backups

### Scaling Considerations
- **Read Replicas**: For high-traffic scenarios
- **Connection Pooling**: Optimize database connections
- **Caching Layer**: Implement Redis for frequently accessed data

## 🚨 Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Verify environment variables
   - Check Supabase project status
   - Ensure service role key has proper permissions

2. **RLS Policy Issues**:
   - Check user authentication
   - Verify policy definitions
   - Test with service role key

3. **Performance Issues**:
   - Check index usage
   - Optimize query patterns
   - Monitor database metrics

### Debug Commands

```bash
# Check database connection
npm run setup-database

# Verify data seeding
npm run seed-database

# Reset everything
npm run reset-database
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🤝 Support

If you encounter issues with the database setup:

1. Check the troubleshooting section above
2. Review the Supabase logs
3. Verify your environment variables
4. Test with the provided sample queries

---

**Next Steps**: After setting up the database, you can start building your app features using the provided TypeScript types and sample queries.
