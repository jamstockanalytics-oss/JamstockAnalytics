-- =============================================
-- SIMPLIFIED DATA POPULATION SCRIPT
-- =============================================
-- This script populates the database step by step
-- Execute each section separately if needed

-- =============================================
-- STEP 1: INSERT COMPANY TICKERS
-- =============================================

-- Insert JSE Main Market Companies
INSERT INTO public.company_tickers (ticker, company_name, exchange, sector, market_cap, is_active) VALUES
('NCBFG', 'NCB Financial Group Limited', 'JSE', 'Financial Services', 45000000000, true),
('SGJ', 'Scotia Group Jamaica Limited', 'JSE', 'Financial Services', 32000000000, true),
('JMMB', 'JMMB Group Limited', 'JSE', 'Financial Services', 28000000000, true),
('BGL', 'Barita Investments Limited', 'JSE', 'Financial Services', 15000000000, true),
('SGL', 'Sagicor Group Jamaica Limited', 'JSE', 'Financial Services', 38000000000, true),
('JPS', 'Jamaica Public Service Company Limited', 'JSE', 'Utilities', 25000000000, true),
('WCO', 'Wisynco Group Limited', 'JSE', 'Manufacturing', 18000000000, true),
('KREMI', 'Kremi Limited', 'JSE', 'Manufacturing', 8000000000, true),
('PJAM', 'PanJam Investment Limited', 'JSE', 'Investment', 12000000000, true),
('JSE', 'Jamaica Stock Exchange Limited', 'Junior', 'Financial Services', 5000000000, true),
('CAC', 'CAC 2000 Limited', 'Junior', 'Technology', 2000000000, true),
('DCOVE', 'Dolphin Cove Limited', 'Junior', 'Tourism', 3000000000, true),
('KEX', 'Knutsford Express Services Limited', 'Junior', 'Transportation', 1500000000, true),
('PULSE', 'Pulse Investments Limited', 'Junior', 'Entertainment', 1000000000, true);

-- =============================================
-- STEP 2: INSERT NEWS SOURCES
-- =============================================

INSERT INTO public.news_sources (name, base_url, rss_feed_url, is_active, priority_score) VALUES
('Jamaica Observer', 'https://www.jamaicaobserver.com', 'https://www.jamaicaobserver.com/rss.xml', true, 10),
('Jamaica Gleaner', 'https://jamaica-gleaner.com', 'https://jamaica-gleaner.com/rss.xml', true, 10),
('RJR News', 'https://rjrnewsonline.com', 'https://rjrnewsonline.com/feed', true, 9),
('Loop Jamaica', 'https://www.loopjamaica.com', 'https://www.loopjamaica.com/rss.xml', true, 8),
('Jamaica Information Service', 'https://jis.gov.jm', 'https://jis.gov.jm/feed', true, 7),
('Jamaica Stock Exchange', 'https://www.jamstockex.com', 'https://www.jamstockex.com/news/rss', true, 10),
('Bank of Jamaica', 'https://boj.org.jm', 'https://boj.org.jm/news/rss', true, 9);

-- =============================================
-- STEP 3: INSERT SAMPLE ARTICLES
-- =============================================

INSERT INTO public.articles (headline, source, url, content, publication_date, ai_priority_score, ai_summary, sentiment_score, relevance_score, company_tickers, tags, is_processed) VALUES
('NCB Financial Group Reports Record Q3 Earnings', 'Jamaica Observer', 'https://jamaicaobserver.com/ncb-q3-earnings', 
 'NCB Financial Group Limited announced record third quarter earnings of $2.5 billion, representing a 15% increase year-over-year. The bank attributed the strong performance to increased digital banking adoption and improved loan portfolio quality.',
 NOW() - INTERVAL '2 hours', 9.2, 'NCB reports exceptional Q3 performance with 15% earnings growth driven by digital transformation and improved loan quality.', 0.8, 0.95, 
 ARRAY['NCBFG'], ARRAY['earnings', 'banking', 'technology', 'growth'], true),

('Scotia Group Jamaica Announces Dividend Increase', 'Jamaica Gleaner', 'https://jamaica-gleaner.com/scotia-dividend',
 'Scotia Group Jamaica Limited declared an increased quarterly dividend of $0.45 per share, up from $0.40 in the previous quarter. The bank cited strong capital position and positive outlook for the Jamaican economy.',
 NOW() - INTERVAL '4 hours', 8.5, 'Scotia Group increases dividend to $0.45 per share, reflecting strong capital position and economic optimism.', 0.7, 0.9,
 ARRAY['SGJ'], ARRAY['dividend', 'banking', 'capital', 'economy'], true),

('JMMB Group Expands Digital Banking Services', 'RJR News', 'https://rjrnewsonline.com/jmmb-digital',
 'JMMB Group Limited launched new digital banking features including AI-powered investment advice and automated portfolio rebalancing. The expansion is part of the company''s $500 million technology investment program.',
 NOW() - INTERVAL '6 hours', 8.0, 'JMMB launches advanced digital banking with AI investment advice and automated portfolio management.', 0.6, 0.85,
 ARRAY['JMMB'], ARRAY['technology', 'digital', 'AI', 'investment'], true),

('Bank of Jamaica Maintains Policy Rate at 7.0%', 'Bank of Jamaica', 'https://boj.org.jm/policy-rate',
 'The Bank of Jamaica Monetary Policy Committee decided to maintain the policy interest rate at 7.0% for the third consecutive meeting. Governor Richard Byles cited stable inflation expectations and adequate foreign exchange reserves.',
 NOW() - INTERVAL '8 hours', 9.5, 'BOJ maintains 7.0% policy rate, citing stable inflation and strong foreign exchange reserves.', 0.5, 0.95,
 ARRAY[]::text[], ARRAY['monetary policy', 'interest rates', 'inflation', 'economy'], true),

('Wisynco Group Reports Strong Q3 Performance', 'Loop Jamaica', 'https://loopjamaica.com/wisynco-q3',
 'Wisynco Group Limited reported third quarter revenue of $8.2 billion, up 12% from the same period last year. The company attributed growth to increased demand for beverages and successful expansion into new markets.',
 NOW() - INTERVAL '10 hours', 7.5, 'Wisynco reports 12% revenue growth to $8.2B driven by beverage demand and Caribbean expansion.', 0.7, 0.8,
 ARRAY['WCO'], ARRAY['manufacturing', 'beverages', 'growth', 'Caribbean'], true),

('Jamaica Stock Exchange Launches ESG Reporting Framework', 'Jamaica Stock Exchange', 'https://jamstockex.com/esg-framework',
 'The Jamaica Stock Exchange introduced a comprehensive ESG (Environmental, Social, Governance) reporting framework for listed companies. The initiative aims to improve transparency and attract socially responsible investors.',
 NOW() - INTERVAL '12 hours', 6.8, 'JSE launches ESG reporting framework to enhance transparency and attract responsible investors.', 0.6, 0.75,
 ARRAY['JSE'], ARRAY['ESG', 'sustainability', 'transparency', 'governance'], true),

('Sagicor Group Announces Regional Expansion Plans', 'Jamaica Information Service', 'https://jis.gov.jm/sagicor-expansion',
 'Sagicor Group Jamaica Limited unveiled plans to expand operations across the Caribbean region, with initial focus on Trinidad and Barbados. The expansion is expected to create 200 new jobs and increase regional market share.',
 NOW() - INTERVAL '1 day', 7.2, 'Sagicor announces Caribbean expansion to Trinidad and Barbados, creating 200 jobs.', 0.7, 0.8,
 ARRAY['SGL'], ARRAY['expansion', 'Caribbean', 'employment', 'growth'], true),

('Jamaican Economy Shows Resilience Amid Global Challenges', 'Jamaica Observer', 'https://jamaicaobserver.com/economy-resilience',
 'Recent economic indicators show Jamaica''s economy demonstrating remarkable resilience despite global economic headwinds. GDP growth projections remain positive, with tourism and financial services leading the recovery.',
 NOW() - INTERVAL '1 day', 8.0, 'Jamaican economy shows resilience with positive GDP growth driven by tourism and financial services.', 0.6, 0.9,
 ARRAY[]::text[], ARRAY['economy', 'GDP', 'tourism', 'financial services'], true),

('Caribbean Investment Climate Improves', 'RJR News', 'https://rjrnewsonline.com/caribbean-investment',
 'Regional investment climate shows significant improvement with increased foreign direct investment flows and enhanced regulatory frameworks across Caribbean markets.',
 NOW() - INTERVAL '2 days', 6.5, 'Caribbean investment climate improves with increased FDI and better regulatory frameworks.', 0.6, 0.7,
 ARRAY[]::text[], ARRAY['investment', 'FDI', 'regulatory', 'Caribbean'], true);

-- =============================================
-- STEP 4: INSERT MARKET PRICES
-- =============================================

INSERT INTO public.market_prices (ticker, price, change_amount, change_percentage, volume, market_cap, last_updated) VALUES
('NCBFG', 85.50, 2.30, 2.76, 1500000, 45000000000, NOW()),
('SGJ', 42.75, -0.85, -1.95, 800000, 32000000000, NOW()),
('JMMB', 38.20, 1.15, 3.10, 1200000, 28000000000, NOW()),
('BGL', 25.80, 0.45, 1.78, 600000, 15000000000, NOW()),
('SGL', 55.25, -1.20, -2.13, 900000, 38000000000, NOW()),
('JPS', 12.40, 0.30, 2.48, 500000, 25000000000, NOW()),
('WCO', 18.75, 0.85, 4.75, 700000, 18000000000, NOW()),
('KREMI', 8.90, -0.15, -1.66, 300000, 8000000000, NOW()),
('PJAM', 15.60, 0.40, 2.63, 400000, 12000000000, NOW()),
('JSE', 2.45, 0.05, 2.08, 200000, 5000000000, NOW());

-- =============================================
-- STEP 5: INSERT MARKET INSIGHTS
-- =============================================

INSERT INTO public.market_insights (insight_type, title, content, confidence_score, market_sentiment, created_at) VALUES
('market_analysis', 'JSE Market Shows Strong Performance', 
 'The Jamaica Stock Exchange continues to demonstrate resilience with the JSE Index up 8.5% year-to-date. Financial services sector leading gains with NCB and Scotia showing strong performance.',
 0.85, 'positive', NOW() - INTERVAL '1 hour'),

('sector_analysis', 'Financial Services Sector Outlook', 
 'Banking sector remains robust with improving loan quality and digital transformation driving efficiency gains. Interest rate environment supportive for net interest margins.',
 0.80, 'positive', NOW() - INTERVAL '2 hours'),

('economic_indicator', 'Jamaican Economy Resilience', 
 'Economic indicators point to continued recovery with tourism arrivals up 15% and unemployment declining to 6.2%. Inflation remains within target range.',
 0.75, 'neutral', NOW() - INTERVAL '3 hours'),

('investment_opportunity', 'Technology Sector Growth', 
 'Technology adoption across JSE-listed companies presents investment opportunities. Digital transformation initiatives driving operational efficiency and customer engagement.',
 0.70, 'positive', NOW() - INTERVAL '4 hours');

-- =============================================
-- STEP 6: INSERT SYSTEM METRICS
-- =============================================

INSERT INTO public.system_performance_metrics (metric_name, metric_value, metric_unit, recorded_at) VALUES
('database_connections', 45, 'connections', NOW()),
('api_response_time', 120, 'milliseconds', NOW()),
('active_users', 1250, 'users', NOW()),
('articles_processed', 150, 'articles', NOW()),
('ai_analysis_accuracy', 0.87, 'percentage', NOW());

-- =============================================
-- STEP 7: INSERT HEALTH CHECKS
-- =============================================

INSERT INTO public.database_health_checks (check_type, status, details, checked_at) VALUES
('table_integrity', 'healthy', 'All tables accessible and properly indexed', NOW()),
('rls_policies', 'healthy', 'All RLS policies active and functioning', NOW()),
('foreign_keys', 'healthy', 'All foreign key constraints properly enforced', NOW()),
('indexes', 'healthy', 'All performance indexes in place and optimized', NOW()),
('functions', 'healthy', 'All database functions operational', NOW());

-- =============================================
-- STEP 8: VERIFY DATA POPULATION
-- =============================================

-- Check if data was inserted successfully
SELECT 'Company Tickers' as table_name, COUNT(*) as record_count FROM public.company_tickers
UNION ALL
SELECT 'News Sources', COUNT(*) FROM public.news_sources
UNION ALL
SELECT 'Articles', COUNT(*) FROM public.articles
UNION ALL
SELECT 'Market Prices', COUNT(*) FROM public.market_prices
UNION ALL
SELECT 'Market Insights', COUNT(*) FROM public.market_insights
UNION ALL
SELECT 'System Metrics', COUNT(*) FROM public.system_performance_metrics
UNION ALL
SELECT 'Health Checks', COUNT(*) FROM public.database_health_checks;
