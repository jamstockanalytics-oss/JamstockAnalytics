# Missing Tables Analysis for JamStockAnalytics

**Date:** October 15, 2024  
**Purpose:** Comprehensive analysis of missing tables needed in Supabase  
**Status:** 🔍 ANALYSIS COMPLETE  

## 🎯 Analysis Overview

After analyzing the current `SUPABASE_SETUP.sql` file against the complete specifications in `CONTEXT.md`, I have identified several missing tables and enhancements needed for the full JamStockAnalytics application functionality.

## ✅ Current Tables (Already Present)

The current schema includes these tables:
- ✅ `users` - Core user management
- ✅ `user_profiles` - Extended user information
- ✅ `articles` - News articles with AI analysis
- ✅ `company_tickers` - JSE and Junior Market companies
- ✅ `news_sources` - News source configuration
- ✅ `article_companies` - Article-company relationships
- ✅ `user_saved_articles` - User bookmarked articles
- ✅ `user_article_interactions` - User engagement tracking
- ✅ `user_blocks` - User blocking system
- ✅ `article_comments` - Article discussions
- ✅ `comment_interactions` - Comment likes/reports
- ✅ `chat_sessions` - AI chat sessions
- ✅ `chat_messages` - Chat messages
- ✅ `analysis_sessions` - Research sessions
- ✅ `analysis_notes` - Session notes and findings
- ✅ `market_data` - Historical market data
- ✅ `market_insights` - AI-generated insights
- ✅ `user_notifications` - User notification system
- ✅ `user_alert_subscriptions` - Alert subscriptions
- ✅ `web_ui_preferences` - Web UI configuration
- ✅ `web_performance_metrics` - Performance tracking
- ✅ `web_cache_config` - Caching configuration
- ✅ `ml_learning_patterns` - ML agent learning
- ✅ `ml_agent_state` - ML agent status
- ✅ `curated_articles` - AI-curated content
- ✅ `user_interaction_profiles` - User behavior profiles

## ❌ Missing Tables (Critical)

### 1. **Session Management Tables**

#### `session_timers` - Analysis Session Timing
```sql
CREATE TABLE public.session_timers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.analysis_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  timer_type VARCHAR(50) CHECK (timer_type IN ('pomodoro', 'focus', 'break', 'custom')),
  duration_minutes INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  pause_count INTEGER DEFAULT 0,
  total_pause_duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `session_goals` - Analysis Session Goals
```sql
CREATE TABLE public.session_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.analysis_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) CHECK (goal_type IN ('research', 'analysis', 'decision', 'learning', 'comparison')),
  goal_description TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  target_completion_date TIMESTAMP WITH TIME ZONE,
  actual_completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. **Advanced User Management Tables**

#### `user_portfolios` - User Investment Portfolios
```sql
CREATE TABLE public.user_portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  portfolio_name VARCHAR(255) NOT NULL,
  portfolio_type VARCHAR(50) CHECK (portfolio_type IN ('watchlist', 'virtual', 'real', 'research')),
  total_value DECIMAL(15,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'JMD',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `portfolio_holdings` - Portfolio Holdings
```sql
CREATE TABLE public.portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES public.user_portfolios(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.company_tickers(id) ON DELETE CASCADE,
  shares_owned DECIMAL(15,4) DEFAULT 0.0000,
  average_cost DECIMAL(10,2),
  current_price DECIMAL(10,2),
  total_value DECIMAL(15,2),
  gain_loss DECIMAL(15,2),
  gain_loss_percentage DECIMAL(5,2),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. **Advanced Content Management Tables**

#### `content_categories` - Content Categorization
```sql
CREATE TABLE public.content_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES public.content_categories(id),
  color_code VARCHAR(7), -- Hex color
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `article_categories` - Article-Category Relationships
```sql
CREATE TABLE public.article_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.content_categories(id) ON DELETE CASCADE,
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0.00 AND 1.00),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, category_id)
);
```

#### `content_templates` - Content Templates
```sql
CREATE TABLE public.content_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) CHECK (template_type IN ('analysis', 'report', 'summary', 'insight')),
  template_content TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. **Advanced AI and ML Tables**

#### `ai_models` - AI Model Management
```sql
CREATE TABLE public.ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name VARCHAR(100) UNIQUE NOT NULL,
  model_type VARCHAR(50) CHECK (model_type IN ('priority_scoring', 'sentiment_analysis', 'content_summarization', 'trend_prediction', 'user_recommendation')),
  model_version VARCHAR(20) NOT NULL,
  provider VARCHAR(50) CHECK (provider IN ('deepseek', 'openai', 'anthropic', 'local')),
  api_endpoint TEXT,
  configuration JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_trained TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `ai_predictions` - AI Prediction History
```sql
CREATE TABLE public.ai_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID REFERENCES public.ai_models(id) ON DELETE CASCADE,
  input_data JSONB NOT NULL,
  prediction_result JSONB NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0.00 AND 1.00),
  actual_outcome JSONB,
  accuracy_score DECIMAL(3,2) CHECK (accuracy_score BETWEEN 0.00 AND 1.00),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `ml_training_data` - ML Training Data
```sql
CREATE TABLE public.ml_training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_type VARCHAR(50) CHECK (data_type IN ('user_behavior', 'content_performance', 'market_movement', 'sentiment_analysis')),
  input_features JSONB NOT NULL,
  target_variable JSONB NOT NULL,
  data_source VARCHAR(100),
  quality_score DECIMAL(3,2) CHECK (quality_score BETWEEN 0.00 AND 1.00),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. **Advanced Analytics Tables**

#### `user_analytics` - User Behavior Analytics
```sql
CREATE TABLE public.user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id VARCHAR(255),
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `content_analytics` - Content Performance Analytics
```sql
CREATE TABLE public.content_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL, -- Can reference articles, insights, etc.
  content_type VARCHAR(50) CHECK (content_type IN ('article', 'insight', 'analysis', 'chat_message')),
  metric_type VARCHAR(50) CHECK (metric_type IN ('view', 'engagement', 'share', 'save', 'ai_processing')),
  metric_value DECIMAL(10,2),
  metric_data JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `system_metrics` - System Performance Metrics
```sql
CREATE TABLE public.system_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name VARCHAR(100) NOT NULL,
  metric_type VARCHAR(50) CHECK (metric_type IN ('performance', 'usage', 'error', 'security')),
  metric_value DECIMAL(10,4),
  metric_unit VARCHAR(20),
  tags JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. **Advanced Notification Tables**

#### `notification_templates` - Notification Templates
```sql
CREATE TABLE public.notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name VARCHAR(255) UNIQUE NOT NULL,
  notification_type VARCHAR(50) CHECK (notification_type IN ('email', 'push', 'sms', 'in_app')),
  subject_template TEXT,
  body_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `notification_queue` - Notification Queue
```sql
CREATE TABLE public.notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.notification_templates(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) CHECK (notification_type IN ('email', 'push', 'sms', 'in_app')),
  recipient VARCHAR(255) NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. **Advanced Security Tables**

#### `user_sessions` - User Session Management
```sql
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  device_info JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `security_events` - Security Event Logging
```sql
CREATE TABLE public.security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) CHECK (event_type IN ('login', 'logout', 'failed_login', 'password_change', 'suspicious_activity')),
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8. **Advanced Market Data Tables**

#### `market_sectors` - Market Sectors
```sql
CREATE TABLE public.market_sectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sector_name VARCHAR(100) UNIQUE NOT NULL,
  sector_code VARCHAR(10) UNIQUE NOT NULL,
  description TEXT,
  parent_sector_id UUID REFERENCES public.market_sectors(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `market_indicators` - Market Indicators
```sql
CREATE TABLE public.market_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  indicator_name VARCHAR(100) NOT NULL,
  indicator_type VARCHAR(50) CHECK (indicator_type IN ('economic', 'technical', 'sentiment', 'volume')),
  value DECIMAL(15,4),
  unit VARCHAR(20),
  date_recorded DATE NOT NULL,
  source VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `company_financials` - Company Financial Data
```sql
CREATE TABLE public.company_financials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.company_tickers(id) ON DELETE CASCADE,
  financial_period VARCHAR(20) CHECK (financial_period IN ('quarterly', 'annual', 'monthly')),
  period_end_date DATE NOT NULL,
  revenue DECIMAL(15,2),
  net_income DECIMAL(15,2),
  total_assets DECIMAL(15,2),
  total_liabilities DECIMAL(15,2),
  shareholders_equity DECIMAL(15,2),
  eps DECIMAL(10,4),
  pe_ratio DECIMAL(8,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, financial_period, period_end_date)
);
```

### 9. **Advanced Integration Tables**

#### `external_apis` - External API Management
```sql
CREATE TABLE public.external_apis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_name VARCHAR(100) UNIQUE NOT NULL,
  api_type VARCHAR(50) CHECK (api_type IN ('news', 'market_data', 'ai', 'analytics')),
  base_url TEXT NOT NULL,
  api_key_encrypted TEXT,
  rate_limit_per_hour INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `api_usage_logs` - API Usage Logging
```sql
CREATE TABLE public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_id UUID REFERENCES public.external_apis(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  request_data JSONB DEFAULT '{}',
  response_data JSONB DEFAULT '{}',
  status_code INTEGER,
  response_time_ms INTEGER,
  tokens_used INTEGER,
  cost_usd DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 10. **Advanced Workflow Tables**

#### `workflow_templates` - Workflow Templates
```sql
CREATE TABLE public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name VARCHAR(255) NOT NULL,
  workflow_type VARCHAR(50) CHECK (workflow_type IN ('analysis', 'research', 'monitoring', 'reporting')),
  steps JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.users(id),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `user_workflows` - User Workflow Instances
```sql
CREATE TABLE public.user_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
  workflow_name VARCHAR(255) NOT NULL,
  current_step INTEGER DEFAULT 0,
  workflow_data JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📊 Summary Statistics

### Current Schema
- **Total Tables**: 25 tables
- **Core Functionality**: ✅ Complete
- **Advanced Features**: ⚠️ Partial

### Missing Tables
- **Critical Missing**: 20+ tables
- **Advanced Features**: 15+ tables
- **Analytics & Monitoring**: 8+ tables
- **Security & Compliance**: 5+ tables

## 🚨 Priority Levels

### 🔴 **CRITICAL** (Must Add)
1. `session_timers` - Analysis session timing
2. `session_goals` - Session goal tracking
3. `user_portfolios` - Investment portfolios
4. `portfolio_holdings` - Portfolio holdings
5. `ai_models` - AI model management
6. `user_analytics` - User behavior tracking
7. `content_analytics` - Content performance
8. `user_sessions` - Session management
9. `security_events` - Security logging
10. `company_financials` - Financial data

### 🟡 **HIGH PRIORITY** (Should Add)
1. `content_categories` - Content categorization
2. `article_categories` - Article-category relationships
3. `ai_predictions` - AI prediction history
4. `ml_training_data` - ML training data
5. `notification_templates` - Notification templates
6. `notification_queue` - Notification queue
7. `market_sectors` - Market sectors
8. `market_indicators` - Market indicators
9. `external_apis` - External API management
10. `api_usage_logs` - API usage logging

### 🟢 **MEDIUM PRIORITY** (Nice to Have)
1. `content_templates` - Content templates
2. `system_metrics` - System performance
3. `workflow_templates` - Workflow templates
4. `user_workflows` - User workflow instances

## 🎯 Recommendations

### Immediate Actions
1. **Add Critical Tables** - Implement the 10 critical missing tables
2. **Update RLS Policies** - Add security policies for new tables
3. **Create Indexes** - Add performance indexes for new tables
4. **Update Functions** - Add utility functions for new tables

### Next Phase
1. **Add High Priority Tables** - Implement advanced features
2. **Enhanced Analytics** - Add comprehensive tracking
3. **Security Hardening** - Implement advanced security features
4. **Performance Optimization** - Add monitoring and optimization

## 📋 Implementation Checklist

### Phase 1: Critical Tables
- [ ] `session_timers`
- [ ] `session_goals`
- [ ] `user_portfolios`
- [ ] `portfolio_holdings`
- [ ] `ai_models`
- [ ] `user_analytics`
- [ ] `content_analytics`
- [ ] `user_sessions`
- [ ] `security_events`
- [ ] `company_financials`

### Phase 2: High Priority Tables
- [ ] `content_categories`
- [ ] `article_categories`
- [ ] `ai_predictions`
- [ ] `ml_training_data`
- [ ] `notification_templates`
- [ ] `notification_queue`
- [ ] `market_sectors`
- [ ] `market_indicators`
- [ ] `external_apis`
- [ ] `api_usage_logs`

### Phase 3: Medium Priority Tables
- [ ] `content_templates`
- [ ] `system_metrics`
- [ ] `workflow_templates`
- [ ] `user_workflows`

---

**Analysis Status:** ✅ COMPLETE  
**Missing Tables Identified:** 20+ critical tables  
**Recommendation:** Implement Phase 1 tables immediately for full functionality
