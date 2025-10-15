# Financial News Analyzer App: Complete Database Schema

## 🎯 Overview

This document provides a comprehensive overview of the database schema for the Financial News Analyzer App, designed to support AI-powered financial news analysis for the Jamaican Stock Exchange (JSE) and Junior Market.

## 📊 Schema Statistics

- **Total Tables**: 15 core tables
- **Views**: 3 optimized views
- **Indexes**: 20+ performance indexes
- **RLS Policies**: 15+ security policies
- **Functions**: 3 utility functions
- **Triggers**: 6 automated triggers

## 🏗️ Architecture Highlights

### 1. AI-Powered Analysis
- **Priority Scoring**: Articles automatically scored 0-10 based on AI analysis
- **Sentiment Analysis**: AI determines article sentiment (-1 to 1)
- **Smart Summaries**: AI-generated article summaries
- **Relevance Scoring**: Articles scored for Jamaican market relevance

### 2. User-Centric Design
- **Row Level Security**: Users can only access their own data
- **Activity Tracking**: Comprehensive user engagement tracking
- **Personalization**: User preferences and investment profiles
- **Session Management**: Deep analysis session tracking

### 3. Content Management
- **Multi-Source News**: Support for multiple Jamaican news sources
- **Company Relationships**: Articles linked to relevant JSE companies
- **Tagging System**: Flexible content categorization
- **Search Optimization**: Full-text search capabilities

## 📁 File Structure

```
JamStockAnalytics/
├── DOCS/
│   ├── database-schema.sql          # Complete SQL schema
│   ├── database-schema-diagram.md  # Visual schema diagram
│   ├── DATABASE_SETUP.md           # Setup instructions
│   └── DATABASE_SUMMARY.md         # This file
├── lib/
│   └── types/
│       └── database.ts             # TypeScript types
└── scripts/
    ├── setup-database.js           # Database setup script
    └── seed-database.js            # Sample data seeding
```

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Create .env file with Supabase credentials
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Setup
```bash
# Install dependencies
npm install @supabase/supabase-js dotenv

# Set up database schema
npm run setup-database

# Populate with sample data
npm run seed-database
```

### 3. Verify Setup
```bash
# Test database connection
npm run setup-database

# Check seeded data
npm run seed-database
```

## 🗄️ Core Tables

### User Management
- **users**: Core user information extending Supabase auth
- **user_profiles**: Extended user profiles with investment preferences
- **user_notifications**: Notification system
- **user_alert_subscriptions**: Alert preferences

### Content Management
- **news_sources**: Configuration for news aggregation
- **articles**: News articles with AI analysis
- **company_tickers**: JSE and Junior Market companies
- **article_companies**: Many-to-many article-company relationships

### User Interactions
- **user_saved_articles**: User's saved articles
- **user_article_interactions**: Views, likes, shares, bookmarks
- **chat_sessions**: AI chat conversations
- **chat_messages**: Individual chat messages

### Analysis Tools
- **analysis_sessions**: Deep research sessions
- **analysis_notes**: Session notes and findings
- **market_data**: Historical market data
- **market_insights**: AI-generated market analysis

## 🔍 Key Features

### 1. AI Integration
```typescript
// AI analysis result structure
interface AIAnalysisResult {
  priority_score: number;        // 0-10 priority score
  summary: string;               // AI-generated summary
  key_points: string[];         // Key insights
  market_impact: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  recommendations: string[];   // AI recommendations
}
```

### 2. User Experience
```typescript
// User profile with investment preferences
interface UserProfile {
  investment_experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  investment_goals: string[];
  preferred_sectors: string[];
}
```

### 3. Content Discovery
```typescript
// Article with AI analysis
interface Article {
  headline: string;
  ai_priority_score: number;    // AI-calculated priority
  ai_summary: string;           // AI-generated summary
  sentiment_score: number;      // -1 to 1 sentiment
  relevance_score: number;      // 0-1 relevance to Jamaican market
  company_tickers: string[];    // Related companies
  tags: string[];               // Content tags
}
```

## 📈 Performance Optimizations

### 1. Indexes
- **Priority Index**: Fast sorting by AI priority score
- **Date Index**: Efficient date-based queries
- **Full-Text Search**: GIN indexes for content search
- **Array Indexes**: Efficient querying of ticker arrays

### 2. Views
- **articles_with_companies**: Combined article and company data
- **user_analysis_summary**: User analysis statistics
- **popular_articles**: Articles ranked by interactions

### 3. Query Optimization
- **Materialized Views**: Pre-computed aggregations
- **Connection Pooling**: Efficient database connections
- **Query Caching**: Reduced database load

## 🔒 Security Features

### 1. Row Level Security (RLS)
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);
```

### 2. Data Validation
```sql
-- Business rule enforcement
ALTER TABLE articles 
ADD CONSTRAINT check_priority_score 
CHECK (ai_priority_score BETWEEN 0.00 AND 10.00);
```

### 3. Access Control
- **Public Read**: Articles and market data publicly readable
- **User Isolation**: User data protected by RLS
- **Admin Access**: Service role for administrative operations

## 🧪 Testing and Validation

### 1. Sample Queries
```typescript
// Get top articles by AI priority
const getTopArticles = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('ai_priority_score', { ascending: false })
    .limit(10);
  return data;
};

// Get user's analysis sessions
const getUserSessions = async (userId: string) => {
  const { data, error } = await supabase
    .from('analysis_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });
  return data;
};
```

### 2. Data Verification
```bash
# Check database connection
npm run setup-database

# Verify seeded data
npm run seed-database

# Reset everything
npm run reset-database
```

## 📊 Sample Data

The database includes sample data for:

### News Sources (5 sources)
- Jamaica Observer
- Jamaica Gleaner
- RJR News
- Loop Jamaica
- Jamaica Information Service

### Companies (15 companies)
- **JSE Main Market**: NCBFG, SGJ, JMMB, GHL, SJ, PJAM, CAC, KLE, PULS, MIL
- **Junior Market**: KEX, ISP, DCOVE, PURITY, ELITE

### Articles (5 sample articles)
- BOJ interest rate decisions
- JSE trading volume updates
- Tourism sector recovery
- Company earnings reports
- Regional expansion news

## 🚀 Deployment Considerations

### 1. Production Setup
- **Environment Variables**: Secure credential management
- **Database Backups**: Regular backup strategy
- **Monitoring**: Database performance monitoring
- **Scaling**: Read replicas for high traffic

### 2. Maintenance
- **Index Optimization**: Regular index maintenance
- **Data Archiving**: Old data cleanup
- **Performance Tuning**: Query optimization
- **Security Updates**: Regular security patches

## 📚 Documentation

- **Setup Guide**: `DOCS/DATABASE_SETUP.md`
- **Schema Diagram**: `DOCS/database-schema-diagram.md`
- **TypeScript Types**: `lib/types/database.ts`
- **SQL Schema**: `DOCS/database-schema.sql`

## 🤝 Support

For database-related issues:

1. **Check Setup Guide**: Review `DATABASE_SETUP.md`
2. **Verify Environment**: Ensure all variables are set
3. **Test Connection**: Run setup scripts
4. **Review Logs**: Check Supabase dashboard logs

## 🎯 Next Steps

After database setup:

1. **Configure AI Services**: Set up DeepSeek API integration
2. **Implement News Aggregation**: Build news scraping services
3. **Develop User Interface**: Create React Native components
4. **Add Real-time Features**: Implement live updates
5. **Deploy to Production**: Set up production environment

---

**Database Schema Complete** ✅

Your Financial News Analyzer App now has a robust, scalable database foundation ready for development!
