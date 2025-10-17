# Database Schema Diagram - Financial News Analyzer App

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FINANCIAL NEWS ANALYZER DATABASE                      │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USERS       │    │  USER_PROFILES  │    │ NEWS_SOURCES    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │◄───┤ user_id (FK)    │    │ id (PK)         │
│ email           │    │ bio             │    │ name            │
│ full_name       │    │ investment_exp  │    │ base_url        │
│ preferences     │    │ risk_tolerance  │    │ rss_feed_url    │
│ subscription    │    │ investment_goals│    │ priority_score  │
│ last_active     │    │ preferred_sectors│   │ is_active       │
│ timezone        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                               │
         │                                               │
         ▼                                               ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ARTICLES      │    │COMPANY_TICKERS │    │ARTICLE_COMPANIES│
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │◄───┤ id (PK)         │◄───┤ article_id (FK) │
│ headline        │    │ ticker          │    │ company_id (FK) │
│ source          │    │ company_name    │    │ relevance_score │
│ source_id (FK)  │    │ exchange        │    │ mention_count   │
│ url             │    │ sector          │    │                 │
│ content         │    │ industry        │    │                 │
│ ai_priority     │    │ market_cap      │    │                 │
│ ai_summary      │    │ is_active       │    │                 │
│ sentiment_score │    │ description     │    │                 │
│ relevance_score │    │ website_url     │    │                 │
│ company_tickers │    │                 │    │                 │
│ tags            │    │                 │    │                 │
│ is_processed    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│USER_SAVED_ARTICLES│  │USER_ARTICLE_   │    │ CHAT_SESSIONS   │
├─────────────────┤    │INTERACTIONS     │    ├─────────────────┤
│ user_id (FK)    │    ├─────────────────┤    │ id (PK)         │
│ article_id (FK) │    │ user_id (FK)    │    │ user_id (FK)    │
│ saved_at        │    │ article_id (FK) │    │ session_name    │
│ notes           │    │ interaction_type│    │ is_active       │
│ tags            │    │ created_at      │    │ started_at      │
│ is_archived     │    │                 │    │ total_messages  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                                                      │
                                                      ▼
                                               ┌─────────────────┐
                                               │ CHAT_MESSAGES   │
                                               ├─────────────────┤
                                               │ id (PK)         │
                                               │ user_id (FK)    │
                                               │ session_id (FK) │
                                               │ message_type    │
                                               │ content         │
                                               │ context_data    │
                                               │ created_at      │
                                               │ tokens_used     │
                                               └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ANALYSIS_SESSIONS│    │ ANALYSIS_NOTES  │    │ MARKET_DATA     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │◄───┤ session_id (FK) │    │ id (PK)         │
│ user_id (FK)    │    │ user_id (FK)    │    │ ticker (FK)     │
│ session_name    │    │ note_type       │    │ date            │
│ session_type    │    │ content         │    │ open_price      │
│ started_at      │    │ related_article │    │ high_price      │
│ completed_at    │    │ related_company │    │ low_price       │
│ duration_minutes│    │ created_at      │    │ close_price     │
│ notes           │    │                 │    │ volume          │
│ key_takeaways   │    │                 │    │ market_cap      │
│ articles_analyzed│   │                 │    │                 │
│ companies_analyzed│   │                 │    │                 │
│ session_data    │    │                 │    │                 │
│ is_completed    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│MARKET_INSIGHTS  │    │USER_NOTIFICATIONS│   │USER_ALERT_     │
├─────────────────┤    ├─────────────────┤    │SUBSCRIPTIONS    │
│ id (PK)         │    │ id (PK)         │    ├─────────────────┤
│ insight_type    │    │ user_id (FK)    │    │ id (PK)         │
│ title           │    │ notification_type│   │ user_id (FK)    │
│ content         │    │ title           │    │ alert_type      │
│ ai_generated    │    │ message         │    │ target_tickers  │
│ confidence_score│    │ is_read         │    │ target_sectors  │
│ related_tickers │    │ action_url      │    │ is_active       │
│ created_at      │    │ created_at      │    │ created_at      │
│ expires_at      │    │ read_at         │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Key Relationships

### 1. User Management
- **users** ← **user_profiles** (1:1)
- **users** ← **user_saved_articles** (1:many)
- **users** ← **user_article_interactions** (1:many)
- **users** ← **chat_sessions** (1:many)
- **users** ← **analysis_sessions** (1:many)

### 2. Content Management
- **news_sources** ← **articles** (1:many)
- **articles** ← **article_companies** (many:many)
- **company_tickers** ← **article_companies** (many:many)
- **articles** ← **user_saved_articles** (many:many)
- **articles** ← **user_article_interactions** (many:many)

### 3. AI and Analysis
- **chat_sessions** ← **chat_messages** (1:many)
- **analysis_sessions** ← **analysis_notes** (1:many)
- **articles** ← **analysis_notes** (many:many)
- **company_tickers** ← **analysis_notes** (many:many)

### 4. Market Data
- **company_tickers** ← **market_data** (1:many)
- **market_insights** (standalone with related_tickers array)

## Database Views

### 1. articles_with_companies
```sql
-- Combines articles with company information
SELECT a.*, 
       array_agg(ct.company_name) as company_names,
       array_agg(ct.sector) as company_sectors
FROM articles a
LEFT JOIN article_companies ac ON a.id = ac.article_id
LEFT JOIN company_tickers ct ON ac.company_id = ct.id
GROUP BY a.id;
```

### 2. user_analysis_summary
```sql
-- User analysis statistics
SELECT u.id, u.full_name,
       COUNT(as.id) as total_sessions,
       COUNT(CASE WHEN as.is_completed THEN 1 END) as completed_sessions,
       AVG(as.duration_minutes) as avg_session_duration
FROM users u
LEFT JOIN analysis_sessions as ON u.id = as.user_id
GROUP BY u.id, u.full_name;
```

### 3. popular_articles
```sql
-- Articles ranked by user interactions
SELECT a.*,
       COUNT(uai.id) as interaction_count,
       COUNT(CASE WHEN uai.interaction_type = 'view' THEN 1 END) as view_count
FROM articles a
LEFT JOIN user_article_interactions uai ON a.id = uai.article_id
GROUP BY a.id
ORDER BY interaction_count DESC;
```

## Index Strategy

### Performance Indexes
- **Priority Index**: `articles(ai_priority_score DESC)`
- **Date Index**: `articles(publication_date DESC)`
- **Array Indexes**: `articles USING GIN(company_tickers)`
- **Full-Text Search**: `articles USING GIN(to_tsvector('english', headline))`
- **User Data**: `user_saved_articles(user_id)`, `chat_messages(user_id)`

### Security Indexes
- **RLS Policies**: All user-related tables have RLS enabled
- **Foreign Key Constraints**: Maintain referential integrity
- **Check Constraints**: Enforce business rules

## Data Flow

### 1. News Ingestion
```
News Sources → Articles → AI Analysis → Priority Scoring → User Feed
```

### 2. User Interaction
```
User → Save Article → User Saved Articles
User → View Article → User Article Interactions
User → Chat → Chat Sessions → Chat Messages
```

### 3. Analysis Workflow
```
User → Start Analysis → Analysis Session → Analysis Notes → Complete Session
```

### 4. AI Processing
```
Article → AI Analysis → Priority Score + Summary + Sentiment → Database Update
```

## Scalability Considerations

### 1. Read Optimization
- **Materialized Views**: Pre-computed aggregations
- **Read Replicas**: For high-traffic scenarios
- **Caching Layer**: Redis for frequently accessed data

### 2. Write Optimization
- **Batch Operations**: Bulk inserts for news ingestion
- **Async Processing**: AI analysis in background
- **Connection Pooling**: Efficient database connections

### 3. Storage Optimization
- **Data Archiving**: Old articles and sessions
- **Compression**: Large text content
- **Partitioning**: By date for market data

This schema provides a robust foundation for the Financial News Analyzer App with support for AI-powered analysis, user engagement tracking, and scalable data management.
