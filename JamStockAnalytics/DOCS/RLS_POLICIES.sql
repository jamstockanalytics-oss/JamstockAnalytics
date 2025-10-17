-- Row Level Security (RLS) Policies for JamStockAnalytics
-- Run this SQL in your Supabase Dashboard > SQL Editor

-- =============================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_tickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. USER PROFILE POLICIES
-- =============================================

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.users 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users 
FOR INSERT WITH CHECK (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Users can view own profile data" ON public.user_profiles 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile data" ON public.user_profiles 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile data" ON public.user_profiles 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 3. ARTICLES POLICIES (Public Read, Admin Write)
-- =============================================

-- Articles are publicly readable
CREATE POLICY "Articles are publicly readable" ON public.articles 
FOR SELECT USING (true);

-- Only service role can insert/update articles
CREATE POLICY "Service role can manage articles" ON public.articles 
FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 4. COMPANY TICKERS POLICIES (Public Read)
-- =============================================

-- Company tickers are publicly readable
CREATE POLICY "Company tickers are publicly readable" ON public.company_tickers 
FOR SELECT USING (true);

-- Only service role can manage company tickers
CREATE POLICY "Service role can manage company tickers" ON public.company_tickers 
FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 5. ANALYSIS SESSIONS POLICIES (User-Specific)
-- =============================================

-- Users can access their own analysis sessions
CREATE POLICY "Users can access own analysis sessions" ON public.analysis_sessions 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own session data" ON public.analysis_sessions 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON public.analysis_sessions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.analysis_sessions 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.analysis_sessions 
FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 6. USER SAVED ARTICLES POLICIES (User-Specific)
-- =============================================

-- Users can access their own saved articles
CREATE POLICY "Users can access own saved articles" ON public.user_saved_articles 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can save articles" ON public.user_saved_articles 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved articles" ON public.user_saved_articles 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved articles" ON public.user_saved_articles 
FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 7. CHAT SESSIONS POLICIES (User-Specific)
-- =============================================

-- Users can access their own chat sessions
CREATE POLICY "Users can access own chat sessions" ON public.chat_sessions 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat sessions" ON public.chat_sessions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions" ON public.chat_sessions 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions" ON public.chat_sessions 
FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 8. CHAT MESSAGES POLICIES (User-Specific)
-- =============================================

-- Users can access their own chat messages
CREATE POLICY "Users can access own chat messages" ON public.chat_messages 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat messages" ON public.chat_messages 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat messages" ON public.chat_messages 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages" ON public.chat_messages 
FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 9. NEWS SOURCES POLICIES (Public Read, Admin Write)
-- =============================================

-- News sources are publicly readable
CREATE POLICY "News sources are publicly readable" ON public.news_sources 
FOR SELECT USING (true);

-- Only service role can manage news sources
CREATE POLICY "Service role can manage news sources" ON public.news_sources 
FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 10. MARKET INSIGHTS POLICIES (Public Read, Admin Write)
-- =============================================

-- Market insights are publicly readable
CREATE POLICY "Market insights are publicly readable" ON public.market_insights 
FOR SELECT USING (true);

-- Only service role can manage market insights
CREATE POLICY "Service role can manage market insights" ON public.market_insights 
FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 11. ADDITIONAL SECURITY POLICIES
-- =============================================

-- Allow anonymous users to read public data (articles, companies, news sources)
CREATE POLICY "Anonymous users can read public data" ON public.articles 
FOR SELECT USING (true);

CREATE POLICY "Anonymous users can read company data" ON public.company_tickers 
FOR SELECT USING (true);

CREATE POLICY "Anonymous users can read news sources" ON public.news_sources 
FOR SELECT USING (true);

-- =============================================
-- 12. VERIFICATION QUERIES
-- =============================================

-- Check RLS status on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'users', 'user_profiles', 'articles', 'company_tickers', 
  'analysis_sessions', 'user_saved_articles', 'chat_sessions', 
  'chat_messages', 'news_sources', 'market_insights'
);

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- SECURITY SUMMARY
-- =============================================

/*
🔒 ROW LEVEL SECURITY POLICIES SUMMARY:

✅ USER DATA ISOLATION:
   • Users can only access their own profile data
   • Users can only access their own analysis sessions
   • Users can only access their own saved articles
   • Users can only access their own chat sessions and messages

✅ PUBLIC DATA ACCESS:
   • Articles are publicly readable (news feed)
   • Company tickers are publicly readable (company data)
   • News sources are publicly readable (source information)
   • Market insights are publicly readable (market data)

✅ ADMIN-ONLY WRITE ACCESS:
   • Only service role can manage articles
   • Only service role can manage company tickers
   • Only service role can manage news sources
   • Only service role can manage market insights

✅ CHAT PRIVACY:
   • Chat sessions are private to each user
   • Chat messages are private to each user
   • No cross-user data leakage

✅ ANALYSIS PRIVACY:
   • Analysis sessions are private to each user
   • Saved articles are private to each user
   • No cross-user analysis data leakage

🚀 YOUR DATABASE IS NOW SECURE AND PRODUCTION-READY!
*/
