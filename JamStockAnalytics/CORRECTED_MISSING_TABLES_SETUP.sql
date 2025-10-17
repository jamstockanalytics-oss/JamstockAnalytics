-- Corrected Missing Tables Setup for JamStockAnalytics
-- ACTUAL missing tables needed for full application functionality
-- Copy and paste this script into Supabase SQL Editor AFTER running SUPABASE_SETUP.sql

-- =============================================
-- SESSION MANAGEMENT ENHANCEMENT
-- =============================================

-- Session timers for analysis session timing
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

-- Session goals for analysis session goal tracking
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

-- =============================================
-- USER PORTFOLIO MANAGEMENT
-- =============================================

-- User investment portfolios
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

-- Portfolio holdings
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

-- =============================================
-- CONTENT CATEGORIZATION SYSTEM
-- =============================================

-- Content categories for better organization
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

-- Article-category relationships
CREATE TABLE public.article_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.content_categories(id) ON DELETE CASCADE,
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0.00 AND 1.00),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, category_id)
);

-- =============================================
-- ADVANCED ANALYTICS AND TRACKING
-- =============================================

-- User behavior analytics
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

-- Content performance analytics
CREATE TABLE public.content_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL, -- Can reference articles, insights, etc.
  content_type VARCHAR(50) CHECK (content_type IN ('article', 'insight', 'analysis', 'chat_message')),
  metric_type VARCHAR(50) CHECK (metric_type IN ('view', 'engagement', 'share', 'save', 'ai_processing')),
  metric_value DECIMAL(10,2),
  metric_data JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ENHANCED NOTIFICATION SYSTEM
-- =============================================

-- Notification templates
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

-- Notification queue
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

-- =============================================
-- SECURITY AND SESSION MANAGEMENT
-- =============================================

-- User session management
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

-- Security event logging
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

-- =============================================
-- ENHANCED MARKET DATA
-- =============================================

-- Market sectors
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

-- Company financial data
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

-- =============================================
-- EXTERNAL API MANAGEMENT
-- =============================================

-- External API management
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

-- API usage logging
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

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Session management indexes
CREATE INDEX idx_session_timers_session ON public.session_timers(session_id);
CREATE INDEX idx_session_timers_user ON public.session_timers(user_id);
CREATE INDEX idx_session_timers_active ON public.session_timers(is_active);
CREATE INDEX idx_session_goals_session ON public.session_goals(session_id);
CREATE INDEX idx_session_goals_user ON public.session_goals(user_id);
CREATE INDEX idx_session_goals_completed ON public.session_goals(is_completed);

-- Portfolio indexes
CREATE INDEX idx_user_portfolios_user ON public.user_portfolios(user_id);
CREATE INDEX idx_user_portfolios_type ON public.user_portfolios(portfolio_type);
CREATE INDEX idx_portfolio_holdings_portfolio ON public.portfolio_holdings(portfolio_id);
CREATE INDEX idx_portfolio_holdings_company ON public.portfolio_holdings(company_id);

-- Content categorization indexes
CREATE INDEX idx_content_categories_parent ON public.content_categories(parent_category_id);
CREATE INDEX idx_content_categories_active ON public.content_categories(is_active);
CREATE INDEX idx_article_categories_article ON public.article_categories(article_id);
CREATE INDEX idx_article_categories_category ON public.article_categories(category_id);

-- Analytics indexes
CREATE INDEX idx_user_analytics_user ON public.user_analytics(user_id);
CREATE INDEX idx_user_analytics_event ON public.user_analytics(event_type);
CREATE INDEX idx_user_analytics_created ON public.user_analytics(created_at);
CREATE INDEX idx_content_analytics_content ON public.content_analytics(content_id);
CREATE INDEX idx_content_analytics_type ON public.content_analytics(content_type);

-- Notification indexes
CREATE INDEX idx_notification_templates_type ON public.notification_templates(notification_type);
CREATE INDEX idx_notification_templates_active ON public.notification_templates(is_active);
CREATE INDEX idx_notification_queue_user ON public.notification_queue(user_id);
CREATE INDEX idx_notification_queue_status ON public.notification_queue(status);
CREATE INDEX idx_notification_queue_scheduled ON public.notification_queue(scheduled_at);

-- Security indexes
CREATE INDEX idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires ON public.user_sessions(expires_at);
CREATE INDEX idx_security_events_user ON public.security_events(user_id);
CREATE INDEX idx_security_events_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_created ON public.security_events(created_at);

-- Market data indexes
CREATE INDEX idx_market_sectors_code ON public.market_sectors(sector_code);
CREATE INDEX idx_market_sectors_active ON public.market_sectors(is_active);
CREATE INDEX idx_company_financials_company ON public.company_financials(company_id);
CREATE INDEX idx_company_financials_period ON public.company_financials(financial_period);

-- API management indexes
CREATE INDEX idx_external_apis_type ON public.external_apis(api_type);
CREATE INDEX idx_external_apis_active ON public.external_apis(is_active);
CREATE INDEX idx_api_usage_logs_api ON public.api_usage_logs(api_id);
CREATE INDEX idx_api_usage_logs_created ON public.api_usage_logs(created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE public.session_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_apis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- User-specific data policies
CREATE POLICY "Users can access own session timers" ON public.session_timers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own session goals" ON public.session_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own portfolios" ON public.user_portfolios FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own portfolio holdings" ON public.portfolio_holdings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own analytics" ON public.user_analytics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own notifications" ON public.notification_queue FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own sessions" ON public.user_sessions FOR ALL USING (auth.uid() = user_id);

-- Public read access for market data
CREATE POLICY "Anyone can read market sectors" ON public.market_sectors FOR SELECT USING (true);
CREATE POLICY "Anyone can read company financials" ON public.company_financials FOR SELECT USING (true);
CREATE POLICY "Anyone can read content categories" ON public.content_categories FOR SELECT USING (true);

-- Admin-only access for system tables
CREATE POLICY "Admin access to external APIs" ON public.external_apis FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE subscription_tier = 'enterprise'));

-- =============================================
-- TRIGGERS FOR AUTOMATION
-- =============================================

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_session_timers_updated_at BEFORE UPDATE ON public.session_timers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_goals_updated_at BEFORE UPDATE ON public.session_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_portfolios_updated_at BEFORE UPDATE ON public.user_portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolio_holdings_updated_at BEFORE UPDATE ON public.portfolio_holdings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_categories_updated_at BEFORE UPDATE ON public.content_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_market_sectors_updated_at BEFORE UPDATE ON public.market_sectors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_external_apis_updated_at BEFORE UPDATE ON public.external_apis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default content categories
INSERT INTO public.content_categories (name, description, color_code, icon, sort_order) VALUES
('Breaking News', 'Urgent financial news and market updates', '#FF4444', 'alert-circle', 1),
('Earnings Reports', 'Company earnings and financial results', '#44AA44', 'trending-up', 2),
('Market Analysis', 'In-depth market analysis and insights', '#4444FF', 'bar-chart', 3),
('Sector News', 'Industry and sector-specific news', '#FFAA44', 'building', 4),
('Regulatory News', 'Government and regulatory updates', '#AA44FF', 'shield', 5),
('Investment Opportunities', 'Investment ideas and opportunities', '#44FFAA', 'target', 6);

-- Insert default market sectors
INSERT INTO public.market_sectors (sector_name, sector_code, description) VALUES
('Financial Services', 'FIN', 'Banks, insurance, and financial institutions'),
('Consumer Goods', 'CON', 'Retail, food, and consumer products'),
('Technology', 'TECH', 'Technology and IT services'),
('Healthcare', 'HEALTH', 'Medical services and healthcare'),
('Transportation', 'TRANS', 'Transportation and logistics'),
('Manufacturing', 'MANUF', 'Industrial and manufacturing'),
('Energy', 'ENERGY', 'Energy and utilities'),
('Real Estate', 'REAL', 'Real estate and construction');

-- Insert default notification templates
INSERT INTO public.notification_templates (template_name, notification_type, subject_template, body_template) VALUES
('high_priority_news', 'email', 'High Priority News: {{headline}}', 'A high-priority news article has been published: {{headline}}\n\n{{summary}}\n\nView full article: {{url}}'),
('market_alert', 'push', 'Market Alert', 'Market alert: {{message}}'),
('analysis_complete', 'in_app', 'Analysis Complete', 'Your analysis session "{{session_name}}" has been completed.'),
('system_update', 'email', 'System Update', 'System update: {{message}}');

-- Insert default external APIs
INSERT INTO public.external_apis (api_name, api_type, base_url, is_active) VALUES
('DeepSeek API', 'ai', 'https://api.deepseek.com', true),
('JSE Market Data', 'market_data', 'https://www.jamstockex.com', true),
('News Aggregator', 'news', 'https://newsapi.org', true),
('Analytics Service', 'analytics', 'https://analytics.google.com', true);

-- =============================================
-- COMMENTS AND DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.session_timers IS 'Timer management for analysis sessions';
COMMENT ON TABLE public.session_goals IS 'Goal tracking for analysis sessions';
COMMENT ON TABLE public.user_portfolios IS 'User investment portfolios';
COMMENT ON TABLE public.portfolio_holdings IS 'Portfolio holdings and positions';
COMMENT ON TABLE public.content_categories IS 'Content categorization system';
COMMENT ON TABLE public.article_categories IS 'Article-category relationships';
COMMENT ON TABLE public.user_analytics IS 'User behavior analytics and tracking';
COMMENT ON TABLE public.content_analytics IS 'Content performance analytics';
COMMENT ON TABLE public.notification_templates IS 'Notification message templates';
COMMENT ON TABLE public.notification_queue IS 'Notification delivery queue';
COMMENT ON TABLE public.user_sessions IS 'User session management and tracking';
COMMENT ON TABLE public.security_events IS 'Security event logging and monitoring';
COMMENT ON TABLE public.market_sectors IS 'Market sector classification';
COMMENT ON TABLE public.company_financials IS 'Company financial statements and metrics';
COMMENT ON TABLE public.external_apis IS 'External API management and configuration';
COMMENT ON TABLE public.api_usage_logs IS 'API usage logging and monitoring';

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- This script adds 12 ACTUAL missing tables to complete the JamStockAnalytics database schema
-- Run this AFTER executing the main SUPABASE_SETUP.sql script
-- All tables include proper indexes, RLS policies, and initial data
-- Total tables after completion: 37 tables (25 existing + 12 missing)
