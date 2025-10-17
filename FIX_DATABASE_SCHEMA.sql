-- =============================================
-- FIX DATABASE SCHEMA - ADD MISSING TABLES AND COLUMNS
-- =============================================
-- This script fixes the missing company_tickers table and market_cap column

-- =============================================
-- STEP 1: CREATE COMPANY_TICKERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.company_tickers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticker VARCHAR(10) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    exchange VARCHAR(50) NOT NULL,
    sector VARCHAR(100),
    market_cap BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 2: CREATE ARTICLES TABLE IF NOT EXISTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    headline TEXT NOT NULL,
    source VARCHAR(255),
    url TEXT,
    content TEXT,
    publication_date TIMESTAMP WITH TIME ZONE,
    ai_priority_score DECIMAL(3,1),
    ai_summary TEXT,
    sentiment_score DECIMAL(3,2),
    relevance_score DECIMAL(3,2),
    company_tickers TEXT[],
    tags TEXT[],
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 3: CREATE NEWS_SOURCES TABLE IF NOT EXISTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.news_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    base_url TEXT NOT NULL,
    rss_feed_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    priority_score INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 4: CREATE MARKET_PRICES TABLE IF NOT EXISTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticker VARCHAR(10) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    volume BIGINT,
    change_amount DECIMAL(10,2),
    change_percentage DECIMAL(5,2),
    high_price DECIMAL(10,2),
    low_price DECIMAL(10,2),
    open_price DECIMAL(10,2),
    previous_close DECIMAL(10,2),
    market_cap BIGINT,
    price_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 5: CREATE MARKET_INSIGHTS TABLE IF NOT EXISTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.market_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insight_type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority_score DECIMAL(3,1),
    sentiment_score DECIMAL(3,2),
    affected_tickers TEXT[],
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 6: CREATE SYSTEM_PERFORMANCE TABLE IF NOT EXISTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.system_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2),
    metric_unit VARCHAR(20),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 7: CREATE DATABASE_HEALTH_CHECKS TABLE IF NOT EXISTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.database_health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    message TEXT,
    execution_time_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 8: ADD INDEXES FOR PERFORMANCE
-- =============================================

-- Company tickers indexes
CREATE INDEX IF NOT EXISTS idx_company_tickers_ticker ON public.company_tickers(ticker);
CREATE INDEX IF NOT EXISTS idx_company_tickers_exchange ON public.company_tickers(exchange);
CREATE INDEX IF NOT EXISTS idx_company_tickers_sector ON public.company_tickers(sector);
CREATE INDEX IF NOT EXISTS idx_company_tickers_active ON public.company_tickers(is_active);

-- Articles indexes
CREATE INDEX IF NOT EXISTS idx_articles_publication_date ON public.articles(publication_date);
CREATE INDEX IF NOT EXISTS idx_articles_priority_score ON public.articles(ai_priority_score);
CREATE INDEX IF NOT EXISTS idx_articles_processed ON public.articles(is_processed);
CREATE INDEX IF NOT EXISTS idx_articles_company_tickers ON public.articles USING GIN(company_tickers);

-- Market prices indexes
CREATE INDEX IF NOT EXISTS idx_market_prices_ticker ON public.market_prices(ticker);
CREATE INDEX IF NOT EXISTS idx_market_prices_date ON public.market_prices(price_date);

-- =============================================
-- STEP 9: ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.company_tickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_health_checks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 10: CREATE RLS POLICIES
-- =============================================

-- Company tickers - public read access
CREATE POLICY "Company tickers are publicly readable" ON public.company_tickers
    FOR SELECT USING (true);

-- Articles - public read access
CREATE POLICY "Articles are publicly readable" ON public.articles
    FOR SELECT USING (true);

-- News sources - public read access
CREATE POLICY "News sources are publicly readable" ON public.news_sources
    FOR SELECT USING (true);

-- Market prices - public read access
CREATE POLICY "Market prices are publicly readable" ON public.market_prices
    FOR SELECT USING (true);

-- Market insights - public read access
CREATE POLICY "Market insights are publicly readable" ON public.market_insights
    FOR SELECT USING (true);

-- System performance - public read access
CREATE POLICY "System performance is publicly readable" ON public.system_performance
    FOR SELECT USING (true);

-- Database health checks - public read access
CREATE POLICY "Database health checks are publicly readable" ON public.database_health_checks
    FOR SELECT USING (true);

-- =============================================
-- STEP 11: VERIFY TABLES EXIST
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Database schema fix completed successfully!';
    RAISE NOTICE 'Created/verified tables:';
    RAISE NOTICE '- company_tickers (with market_cap column)';
    RAISE NOTICE '- articles';
    RAISE NOTICE '- news_sources';
    RAISE NOTICE '- market_prices';
    RAISE NOTICE '- market_insights';
    RAISE NOTICE '- system_performance';
    RAISE NOTICE '- database_health_checks';
    RAISE NOTICE 'All tables have RLS enabled with public read access.';
END $$;
