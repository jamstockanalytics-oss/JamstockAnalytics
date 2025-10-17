-- Financial News Analyzer App: Complete Database Schema for Supabase
-- This schema supports the full functionality of the JamStockAnalytics app

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- CORE USER MANAGEMENT
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{}',
  subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
  last_active TIMESTAMP WITH TIME ZONE,
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  timezone VARCHAR(50) DEFAULT 'America/Jamaica',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'
);

-- User profiles for additional information
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  investment_experience VARCHAR(50) DEFAULT 'beginner' CHECK (investment_experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
  risk_tolerance VARCHAR(20) DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  investment_goals TEXT[],
  portfolio_size_range VARCHAR(50),
  preferred_sectors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- NEWS AND CONTENT MANAGEMENT
-- =============================================

-- News sources configuration
CREATE TABLE public.news_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  base_url TEXT NOT NULL,
  rss_feed_url TEXT,
  api_endpoint TEXT,
  scraping_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  priority_score INTEGER DEFAULT 1 CHECK (priority_score BETWEEN 1 AND 10),
  last_scraped TIMESTAMP WITH TIME ZONE,
  scraping_frequency_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles from news sources
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  headline TEXT NOT NULL,
  source VARCHAR(255) NOT NULL,
  source_id UUID REFERENCES public.news_sources(id),
  url TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  publication_date TIMESTAMP WITH TIME ZONE NOT NULL,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_priority_score DECIMAL(3,2) DEFAULT 0.00 CHECK (ai_priority_score BETWEEN 0.00 AND 10.00),
  ai_summary TEXT,
  sentiment_score DECIMAL(3,2) CHECK (sentiment_score BETWEEN -1.00 AND 1.00),
  relevance_score DECIMAL(3,2) CHECK (relevance_score BETWEEN 0.00 AND 1.00),
  company_tickers TEXT[],
  tags TEXT[],
  is_processed BOOLEAN DEFAULT FALSE,
  processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  ai_analysis_data JSONB DEFAULT '{}',
  word_count INTEGER,
  reading_time_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company tickers and information
CREATE TABLE public.company_tickers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker VARCHAR(20) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  exchange VARCHAR(50) NOT NULL CHECK (exchange IN ('JSE', 'Junior', 'Other')),
  sector VARCHAR(100),
  industry VARCHAR(100),
  market_cap BIGINT,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Article-company relationships
CREATE TABLE public.article_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.company_tickers(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3,2) CHECK (relevance_score BETWEEN 0.00 AND 1.00),
  mention_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, company_id)
);

-- =============================================
-- USER INTERACTIONS AND ENGAGEMENT
-- =============================================

-- User saved articles
CREATE TABLE public.user_saved_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  tags TEXT[],
  is_archived BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, article_id)
);

-- User article interactions (views, likes, shares)
CREATE TABLE public.user_article_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('view', 'like', 'share', 'bookmark')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id, interaction_type)
);

-- =============================================
-- USER BLOCKING AND MODERATION
-- =============================================

-- User blocks table for blocking other users
CREATE TABLE public.user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reason VARCHAR(100), -- 'harassment', 'spam', 'inappropriate_content', 'other'
  reason_details TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unblocked_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL for permanent blocks
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Comments table for article discussions
CREATE TABLE public.article_comments (
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

-- Comment interactions (likes, reports)
CREATE TABLE public.comment_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES public.article_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'report', 'flag')),
  reason VARCHAR(100), -- For reports: 'spam', 'harassment', 'inappropriate', 'misinformation'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id, interaction_type)
);

-- =============================================
-- AI CHAT AND ANALYSIS
-- =============================================

-- Chat sessions
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_name VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_messages INTEGER DEFAULT 0,
  session_context JSONB DEFAULT '{}'
);

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'ai', 'system')),
  content TEXT NOT NULL,
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_analysis_context BOOLEAN DEFAULT FALSE,
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER
);

-- =============================================
-- ANALYSIS SESSIONS
-- =============================================

-- Analysis sessions for deep research
CREATE TABLE public.analysis_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_name VARCHAR(255),
  session_type VARCHAR(50) CHECK (session_type IN ('bullish_thesis', 'bearish_thesis', 'event_analysis', 'company_comparison', 'sector_analysis', 'market_research')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  notes TEXT,
  key_takeaways TEXT[],
  articles_analyzed UUID[],
  companies_analyzed UUID[],
  session_data JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT FALSE,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis session notes and findings
CREATE TABLE public.analysis_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.analysis_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  note_type VARCHAR(50) CHECK (note_type IN ('observation', 'insight', 'question', 'conclusion', 'action_item')),
  content TEXT NOT NULL,
  related_article_id UUID REFERENCES public.articles(id),
  related_company_id UUID REFERENCES public.company_tickers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MARKET DATA AND ANALYTICS
-- =============================================

-- Market data snapshots
CREATE TABLE public.market_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker VARCHAR(20) REFERENCES public.company_tickers(ticker),
  date DATE NOT NULL,
  open_price DECIMAL(10,2),
  high_price DECIMAL(10,2),
  low_price DECIMAL(10,2),
  close_price DECIMAL(10,2),
  volume BIGINT,
  market_cap BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ticker, date)
);

-- Market insights and analysis
CREATE TABLE public.market_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insight_type VARCHAR(50) CHECK (insight_type IN ('daily_summary', 'sector_analysis', 'market_trend', 'economic_indicator')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  ai_generated BOOLEAN DEFAULT TRUE,
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0.00 AND 1.00),
  related_tickers TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- NOTIFICATIONS AND ALERTS
-- =============================================

-- User notifications
CREATE TABLE public.user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) CHECK (notification_type IN ('high_priority_news', 'market_alert', 'analysis_complete', 'system_update')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Alert subscriptions
CREATE TABLE public.user_alert_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) CHECK (alert_type IN ('company_news', 'sector_updates', 'market_movements', 'ai_insights')),
  target_tickers TEXT[],
  target_sectors TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Articles indexes
CREATE INDEX idx_articles_priority ON public.articles(ai_priority_score DESC NULLS LAST);
CREATE INDEX idx_articles_date ON public.articles(publication_date DESC);
CREATE INDEX idx_articles_tickers ON public.articles USING GIN(company_tickers);
CREATE INDEX idx_articles_processed ON public.articles(is_processed);
CREATE INDEX idx_articles_source ON public.articles(source);
CREATE INDEX idx_articles_status ON public.articles(processing_status);

-- User-related indexes
CREATE INDEX idx_user_saved_articles_user ON public.user_saved_articles(user_id);
CREATE INDEX idx_user_saved_articles_article ON public.user_saved_articles(article_id);
CREATE INDEX idx_user_interactions_user ON public.user_article_interactions(user_id);
CREATE INDEX idx_user_interactions_article ON public.user_article_interactions(article_id);

-- Chat and analysis indexes
CREATE INDEX idx_chat_sessions_user ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_active ON public.chat_sessions(is_active);
CREATE INDEX idx_chat_messages_user ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX idx_analysis_sessions_user ON public.analysis_sessions(user_id);
CREATE INDEX idx_analysis_sessions_completed ON public.analysis_sessions(is_completed);
CREATE INDEX idx_analysis_notes_session ON public.analysis_notes(session_id);

-- Company and market data indexes
CREATE INDEX idx_company_tickers_ticker ON public.company_tickers(ticker);
CREATE INDEX idx_company_tickers_exchange ON public.company_tickers(exchange);
CREATE INDEX idx_company_tickers_active ON public.company_tickers(is_active);
CREATE INDEX idx_market_data_ticker_date ON public.market_data(ticker, date);
CREATE INDEX idx_article_companies_article ON public.article_companies(article_id);
CREATE INDEX idx_article_companies_company ON public.article_companies(company_id);

-- Notification indexes
CREATE INDEX idx_notifications_user ON public.user_notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.user_notifications(user_id, is_read);
CREATE INDEX idx_alert_subscriptions_user ON public.user_alert_subscriptions(user_id);

-- Full-text search indexes
CREATE INDEX idx_articles_search ON public.articles USING GIN(to_tsvector('english', headline || ' ' || COALESCE(content, '')));
CREATE INDEX idx_company_search ON public.company_tickers USING GIN(to_tsvector('english', company_name || ' ' || COALESCE(description, '')));

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all user-related tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_article_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alert_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can access own profile data" ON public.user_profiles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own saved articles" ON public.user_saved_articles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own interactions" ON public.user_article_interactions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own chat sessions" ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own chat messages" ON public.chat_messages FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own analysis sessions" ON public.analysis_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own analysis notes" ON public.analysis_notes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own notifications" ON public.user_notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own alert subscriptions" ON public.user_alert_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Public read access for articles and market data
CREATE POLICY "Anyone can read articles" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Anyone can read company tickers" ON public.company_tickers FOR SELECT USING (true);
CREATE POLICY "Anyone can read market data" ON public.market_data FOR SELECT USING (true);
CREATE POLICY "Anyone can read market insights" ON public.market_insights FOR SELECT USING (true);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_tickers_updated_at BEFORE UPDATE ON public.company_tickers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analysis_sessions_updated_at BEFORE UPDATE ON public.analysis_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analysis_notes_updated_at BEFORE UPDATE ON public.analysis_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate reading time
CREATE OR REPLACE FUNCTION calculate_reading_time(content TEXT)
RETURNS INTEGER AS $$
BEGIN
    IF content IS NULL THEN
        RETURN 1;
    END IF;
    RETURN GREATEST(1, CEIL(LENGTH(content) / 200.0)); -- Assuming 200 words per minute
END;
$$ LANGUAGE plpgsql;

-- Function to update user's last_active timestamp
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users 
    SET last_active = NOW() 
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply last_active triggers
CREATE TRIGGER update_last_active_on_chat_message 
    AFTER INSERT ON public.chat_messages 
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active();

CREATE TRIGGER update_last_active_on_analysis_session 
    AFTER INSERT ON public.analysis_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active();

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for articles with company information
CREATE VIEW public.articles_with_companies AS
SELECT 
    a.*,
    array_agg(ct.company_name) as company_names,
    array_agg(ct.sector) as company_sectors
FROM public.articles a
LEFT JOIN public.article_companies ac ON a.id = ac.article_id
LEFT JOIN public.company_tickers ct ON ac.company_id = ct.id
GROUP BY a.id;

-- View for user's analysis session summary
CREATE VIEW public.user_analysis_summary AS
SELECT 
    u.id as user_id,
    u.full_name,
    COUNT(as.id) as total_sessions,
    COUNT(CASE WHEN as.is_completed THEN 1 END) as completed_sessions,
    AVG(as.duration_minutes) as avg_session_duration,
    MAX(as.completed_at) as last_analysis_date
FROM public.users u
LEFT JOIN public.analysis_sessions as ON u.id = as.user_id
GROUP BY u.id, u.full_name;

-- View for popular articles (by interactions)
CREATE VIEW public.popular_articles AS
SELECT 
    a.*,
    COUNT(uai.id) as interaction_count,
    COUNT(CASE WHEN uai.interaction_type = 'view' THEN 1 END) as view_count,
    COUNT(CASE WHEN uai.interaction_type = 'like' THEN 1 END) as like_count
FROM public.articles a
LEFT JOIN public.user_article_interactions uai ON a.id = uai.article_id
GROUP BY a.id
ORDER BY interaction_count DESC;

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default news sources
INSERT INTO public.news_sources (name, base_url, rss_feed_url, priority_score, is_active) VALUES
('Jamaica Observer', 'https://www.jamaicaobserver.com', 'https://www.jamaicaobserver.com/rss', 8, true),
('Jamaica Gleaner', 'https://jamaica-gleaner.com', 'https://jamaica-gleaner.com/rss', 8, true),
('RJR News', 'https://rjrnewsonline.com', 'https://rjrnewsonline.com/rss', 7, true),
('Loop Jamaica', 'https://www.loopjamaica.com', 'https://www.loopjamaica.com/rss', 6, true),
('Jamaica Information Service', 'https://jis.gov.jm', 'https://jis.gov.jm/rss', 7, true);

-- Insert major JSE companies
INSERT INTO public.company_tickers (ticker, company_name, exchange, sector, industry, is_active) VALUES
('NCBFG', 'NCB Financial Group Limited', 'JSE', 'Financial Services', 'Banking', true),
('SGJ', 'Sagicor Group Jamaica Limited', 'JSE', 'Financial Services', 'Insurance', true),
('JMMB', 'JMMB Group Limited', 'JSE', 'Financial Services', 'Investment Banking', true),
('GHL', 'Guardian Holdings Limited', 'JSE', 'Financial Services', 'Insurance', true),
('SJ', 'Seprod Limited', 'JSE', 'Consumer Goods', 'Food & Beverage', true),
('PJAM', 'Pan Jamaica Investment Trust Limited', 'JSE', 'Investment', 'Holding Company', true),
('CAC', 'CAC 2000 Limited', 'JSE', 'Technology', 'IT Services', true),
('KLE', 'KLE Group Limited', 'JSE', 'Industrial', 'Manufacturing', true),
('PULS', 'Pulse Investments Limited', 'JSE', 'Media', 'Entertainment', true),
('MIL', 'Mayberry Investments Limited', 'JSE', 'Financial Services', 'Investment Banking', true);

-- Insert Junior Market companies
INSERT INTO public.company_tickers (ticker, company_name, exchange, sector, industry, is_active) VALUES
('KEX', 'Knutsford Express Services Limited', 'Junior', 'Transportation', 'Passenger Transport', true),
('ISP', 'ISP Finance Limited', 'Junior', 'Financial Services', 'Microfinance', true),
('DCOVE', 'Derrimon Trading Company Limited', 'Junior', 'Consumer Goods', 'Retail', true),
('PURITY', 'Purity Bakery Limited', 'Junior', 'Consumer Goods', 'Food Manufacturing', true),
('ELITE', 'Elite Diagnostics Limited', 'Junior', 'Healthcare', 'Medical Services', true);

-- =============================================
-- STORAGE BUCKETS AND FILE MANAGEMENT
-- =============================================

-- Storage buckets configuration
CREATE TABLE public.storage_buckets (
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

-- Storage usage tracking
CREATE TABLE public.storage_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bucket_id VARCHAR(255) REFERENCES public.storage_buckets(id) ON DELETE CASCADE,
  file_count INTEGER DEFAULT 0,
  total_size_bytes BIGINT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_breakdown JSONB DEFAULT '{}'
);

-- Storage file metadata
CREATE TABLE public.storage_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bucket_id VARCHAR(255) REFERENCES public.storage_buckets(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bucket_id, file_path)
);

-- =============================================
-- USER BLOCKING AND COMMENTS INDEXES
-- =============================================

-- User blocks indexes
CREATE INDEX idx_user_blocks_blocker ON public.user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON public.user_blocks(blocked_id);
CREATE INDEX idx_user_blocks_active ON public.user_blocks(is_active);
CREATE INDEX idx_user_blocks_expires ON public.user_blocks(expires_at);
CREATE INDEX idx_user_blocks_created ON public.user_blocks(created_at);

-- =============================================
-- WEB UI CONFIGURATION AND OPTIMIZATION
-- =============================================

-- Web UI preferences table
CREATE TABLE public.web_ui_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  layout_mode VARCHAR(20) DEFAULT 'lightweight' CHECK (layout_mode IN ('standard', 'lightweight', 'minimal')),
  data_saver BOOLEAN DEFAULT TRUE,
  auto_refresh BOOLEAN DEFAULT FALSE,
  refresh_interval INTEGER DEFAULT 300, -- seconds
  max_articles_per_page INTEGER DEFAULT 10,
  enable_images BOOLEAN DEFAULT FALSE,
  enable_animations BOOLEAN DEFAULT FALSE,
  compact_mode BOOLEAN DEFAULT TRUE,
  font_size VARCHAR(10) DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  color_scheme VARCHAR(20) DEFAULT 'default' CHECK (color_scheme IN ('default', 'high_contrast', 'colorblind_friendly')),
  performance_mode VARCHAR(20) DEFAULT 'optimized' CHECK (performance_mode IN ('standard', 'optimized', 'ultra_light')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Web performance metrics table
CREATE TABLE public.web_performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  page_load_time_ms INTEGER,
  total_data_transferred_bytes BIGINT,
  network_type VARCHAR(50),
  device_type VARCHAR(50),
  browser_info JSONB,
  performance_score INTEGER CHECK (performance_score BETWEEN 0 AND 100),
  optimization_level VARCHAR(20) DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Web cache configuration table
CREATE TABLE public.web_cache_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  cache_type VARCHAR(50) NOT NULL CHECK (cache_type IN ('articles', 'market_data', 'user_data', 'static_content')),
  content_hash VARCHAR(255),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_compressed BOOLEAN DEFAULT TRUE,
  compression_type VARCHAR(20) DEFAULT 'gzip',
  size_bytes BIGINT,
  hit_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Article comments indexes
CREATE INDEX idx_article_comments_article ON public.article_comments(article_id);
CREATE INDEX idx_article_comments_user ON public.article_comments(user_id);
CREATE INDEX idx_article_comments_parent ON public.article_comments(parent_comment_id);
CREATE INDEX idx_article_comments_created ON public.article_comments(created_at);
CREATE INDEX idx_article_comments_deleted ON public.article_comments(is_deleted);
CREATE INDEX idx_article_comments_likes ON public.article_comments(like_count);

-- Comment interactions indexes
CREATE INDEX idx_comment_interactions_comment ON public.comment_interactions(comment_id);
CREATE INDEX idx_comment_interactions_user ON public.comment_interactions(user_id);
CREATE INDEX idx_comment_interactions_type ON public.comment_interactions(interaction_type);

-- Web UI configuration indexes
CREATE INDEX idx_web_ui_preferences_user ON public.web_ui_preferences(user_id);
CREATE INDEX idx_web_ui_preferences_theme ON public.web_ui_preferences(theme);
CREATE INDEX idx_web_ui_preferences_performance ON public.web_ui_preferences(performance_mode);
CREATE INDEX idx_web_performance_metrics_user ON public.web_performance_metrics(user_id);
CREATE INDEX idx_web_performance_metrics_session ON public.web_performance_metrics(session_id);
CREATE INDEX idx_web_performance_metrics_created ON public.web_performance_metrics(created_at);
CREATE INDEX idx_web_cache_config_key ON public.web_cache_config(cache_key);
CREATE INDEX idx_web_cache_config_type ON public.web_cache_config(cache_type);
CREATE INDEX idx_web_cache_config_expires ON public.web_cache_config(expires_at);

-- =============================================
-- STORAGE INDEXES
-- =============================================

-- Storage buckets indexes
CREATE INDEX idx_storage_buckets_type ON public.storage_buckets(bucket_type);
CREATE INDEX idx_storage_buckets_active ON public.storage_buckets(is_active);

-- Storage usage indexes
CREATE INDEX idx_storage_usage_bucket ON public.storage_usage(bucket_id);
CREATE INDEX idx_storage_usage_updated ON public.storage_usage(last_updated);

-- Storage files indexes
CREATE INDEX idx_storage_files_bucket ON public.storage_files(bucket_id);
CREATE INDEX idx_storage_files_user ON public.storage_files(user_id);
CREATE INDEX idx_storage_files_public ON public.storage_files(is_public);
CREATE INDEX idx_storage_files_path ON public.storage_files(file_path);

-- =============================================
-- USER BLOCKING AND COMMENTS RLS POLICIES
-- =============================================

-- Enable RLS on user blocking and comments tables
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_interactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on web UI configuration tables
ALTER TABLE public.web_ui_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_cache_config ENABLE ROW LEVEL SECURITY;

-- User blocks policies
CREATE POLICY "Users can view blocks they created or received" ON public.user_blocks
  FOR SELECT USING (
    auth.uid() = blocker_id OR 
    auth.uid() = blocked_id
  );

CREATE POLICY "Users can create blocks" ON public.user_blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can update their own blocks" ON public.user_blocks
  FOR UPDATE USING (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their own blocks" ON public.user_blocks
  FOR DELETE USING (auth.uid() = blocker_id);

-- Article comments policies
CREATE POLICY "Users can view non-deleted comments" ON public.article_comments
  FOR SELECT USING (is_deleted = false);

CREATE POLICY "Users can create comments" ON public.article_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.article_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.article_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Comment interactions policies
CREATE POLICY "Users can view comment interactions" ON public.comment_interactions
  FOR SELECT USING (true);

CREATE POLICY "Users can create comment interactions" ON public.comment_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comment interactions" ON public.comment_interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment interactions" ON public.comment_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- Web UI preferences policies
CREATE POLICY "Users can view their own web UI preferences" ON public.web_ui_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own web UI preferences" ON public.web_ui_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own web UI preferences" ON public.web_ui_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own web UI preferences" ON public.web_ui_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Web performance metrics policies
CREATE POLICY "Users can view their own performance metrics" ON public.web_performance_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own performance metrics" ON public.web_performance_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Web cache config policies (public read for optimization, admin write)
CREATE POLICY "Anyone can view cache config for optimization" ON public.web_cache_config
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage cache config" ON public.web_cache_config
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- STORAGE RLS POLICIES
-- =============================================

-- Enable RLS on storage tables
ALTER TABLE public.storage_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_files ENABLE ROW LEVEL SECURITY;

-- Storage buckets policies
CREATE POLICY "Public read access for storage buckets" 
ON public.storage_buckets FOR SELECT USING (true);

CREATE POLICY "Service role can manage storage buckets" 
ON public.storage_buckets FOR ALL USING (auth.role() = 'service_role');

-- Storage usage policies
CREATE POLICY "Public read access for storage usage" 
ON public.storage_usage FOR SELECT USING (true);

CREATE POLICY "Service role can manage storage usage" 
ON public.storage_usage FOR ALL USING (auth.role() = 'service_role');

-- Storage files policies
CREATE POLICY "Users can access own files" 
ON public.storage_files FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public files are readable by everyone" 
ON public.storage_files FOR SELECT USING (is_public = true);

CREATE POLICY "Service role can manage all files" 
ON public.storage_files FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- STORAGE VIEWS
-- =============================================

-- Storage analytics view
CREATE VIEW public.storage_analytics AS
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

-- User storage summary view
CREATE VIEW public.user_storage_summary AS
SELECT 
  u.id as user_id,
  u.full_name,
  COUNT(sf.id) as total_files,
  SUM(sf.file_size) as total_size_bytes,
  ROUND(SUM(sf.file_size) / 1024.0 / 1024.0, 2) as total_size_mb,
  COUNT(CASE WHEN sf.is_public THEN 1 END) as public_files,
  COUNT(CASE WHEN sf.is_public = false THEN 1 END) as private_files
FROM public.users u
LEFT JOIN public.storage_files sf ON u.id = sf.user_id
GROUP BY u.id, u.full_name;

-- =============================================
-- USER BLOCKING FUNCTIONS
-- =============================================

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(blocker_uuid UUID, blocked_uuid UUID)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get blocked users for a user
CREATE OR REPLACE FUNCTION get_blocked_users(user_uuid UUID)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unblock a user
CREATE OR REPLACE FUNCTION unblock_user(blocker_uuid UUID, blocked_uuid UUID)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to filter comments based on blocks
CREATE OR REPLACE FUNCTION filter_comments_for_user(user_uuid UUID)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STORAGE TRIGGERS
-- =============================================

-- Trigger to update storage usage when files are added/removed
CREATE OR REPLACE FUNCTION update_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.storage_usage 
    SET 
      file_count = file_count + 1,
      total_size_bytes = total_size_bytes + NEW.file_size,
      last_updated = NOW()
    WHERE bucket_id = NEW.bucket_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.storage_usage 
    SET 
      file_count = file_count - 1,
      total_size_bytes = total_size_bytes - OLD.file_size,
      last_updated = NOW()
    WHERE bucket_id = OLD.bucket_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.storage_usage 
    SET 
      total_size_bytes = total_size_bytes - OLD.file_size + NEW.file_size,
      last_updated = NOW()
    WHERE bucket_id = NEW.bucket_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply storage usage triggers
CREATE TRIGGER update_storage_usage_on_file_insert
  AFTER INSERT ON public.storage_files
  FOR EACH ROW EXECUTE FUNCTION update_storage_usage();

CREATE TRIGGER update_storage_usage_on_file_delete
  AFTER DELETE ON public.storage_files
  FOR EACH ROW EXECUTE FUNCTION update_storage_usage();

CREATE TRIGGER update_storage_usage_on_file_update
  AFTER UPDATE ON public.storage_files
  FOR EACH ROW EXECUTE FUNCTION update_storage_usage();

-- =============================================
-- STORAGE INITIAL DATA
-- =============================================

-- Insert storage buckets
INSERT INTO public.storage_buckets (id, name, description, bucket_type, file_size_limit, allowed_mime_types, folder_structure, access_policy, metadata) VALUES
('news-articles', 'news-articles', 'Scraped news articles and content storage', 'public', 10485760, 
 ARRAY['text/html', 'text/plain', 'application/json'], 
 '{"raw-articles": "Raw scraped HTML content", "processed-articles": "AI-processed article content", "archives": "Archived articles by date"}',
 'public_read', 
 '{"purpose": "news_storage", "ai_processing": true, "retention_days": 365}'),

('market-data', 'market-data', 'Market data, charts, and financial reports', 'public', 52428800,
 ARRAY['application/json', 'text/csv', 'application/pdf', 'image/png', 'image/jpeg'],
 '{"daily-data": "Daily market data files", "historical-data": "Historical market data", "charts": "Generated chart images", "reports": "Financial reports and analysis"}',
 'public_read',
 '{"purpose": "market_data", "update_frequency": "daily", "retention_days": 1095}'),

('user-uploads', 'user-uploads', 'User uploaded files and documents', 'private', 10485760,
 ARRAY['image/png', 'image/jpeg', 'application/pdf', 'text/plain'],
 '{"documents": "User uploaded documents", "images": "User profile images", "exports": "User data exports"}',
 'user_specific',
 '{"purpose": "user_files", "user_isolation": true, "retention_days": 90}'),

('ai-analysis', 'ai-analysis', 'AI-generated analysis reports and insights', 'private', 5242880,
 ARRAY['application/json', 'text/plain', 'application/pdf'],
 '{"sentiment-analysis": "AI sentiment analysis results", "risk-reports": "AI risk assessment reports", "insights": "AI market insights and recommendations"}',
 'authenticated_only',
 '{"purpose": "ai_analysis", "ai_generated": true, "retention_days": 180}'),

('company-data', 'company-data', 'Company profiles, logos, and financial data', 'public', 10485760,
 ARRAY['image/png', 'image/jpeg', 'application/json', 'text/csv'],
 '{"logos": "Company logos and branding", "profiles": "Company profile data", "financial-data": "Company financial information"}',
 'public_read',
 '{"purpose": "company_data", "reference_data": true, "retention_days": 2555}');

-- Initialize storage usage records
INSERT INTO public.storage_usage (bucket_id, file_count, total_size_bytes, usage_breakdown) VALUES
('news-articles', 0, 0, '{"folders": ["raw-articles", "processed-articles", "archives"], "last_scan": "' || NOW()::text || '"}'),
('market-data', 0, 0, '{"folders": ["daily-data", "historical-data", "charts", "reports"], "last_scan": "' || NOW()::text || '"}'),
('user-uploads', 0, 0, '{"folders": ["documents", "images", "exports"], "last_scan": "' || NOW()::text || '"}'),
('ai-analysis', 0, 0, '{"folders": ["sentiment-analysis", "risk-reports", "insights"], "last_scan": "' || NOW()::text || '"}'),
('company-data', 0, 0, '{"folders": ["logos", "profiles", "financial-data"], "last_scan": "' || NOW()::text || '"}');

-- =============================================
-- COMMENTS AND DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.users IS 'Core user information extending Supabase auth.users';
COMMENT ON TABLE public.articles IS 'News articles with AI analysis and priority scoring';
COMMENT ON TABLE public.company_tickers IS 'JSE and Junior Market company information';
COMMENT ON TABLE public.analysis_sessions IS 'User analysis sessions for deep research';
COMMENT ON TABLE public.chat_sessions IS 'AI chat conversation sessions';
COMMENT ON TABLE public.market_data IS 'Historical market data for companies';
COMMENT ON TABLE public.user_notifications IS 'User notification system';
COMMENT ON TABLE public.storage_buckets IS 'Storage bucket configuration and metadata';
COMMENT ON TABLE public.storage_usage IS 'Storage usage tracking and analytics';
COMMENT ON TABLE public.storage_files IS 'File metadata and access control';

COMMENT ON COLUMN public.articles.ai_priority_score IS 'AI-calculated priority score (0-10) for article importance';
COMMENT ON COLUMN public.articles.sentiment_score IS 'AI sentiment analysis score (-1 to 1)';
COMMENT ON COLUMN public.articles.relevance_score IS 'AI relevance score (0-1) for Jamaican market';
COMMENT ON COLUMN public.analysis_sessions.session_type IS 'Type of analysis being performed';
COMMENT ON COLUMN public.chat_messages.tokens_used IS 'AI tokens consumed for cost tracking';
COMMENT ON COLUMN public.storage_buckets.bucket_type IS 'Storage bucket access type (public/private)';
COMMENT ON COLUMN public.storage_files.is_public IS 'Whether file is publicly accessible';
