-- =============================================
-- SIMPLIFIED PRO MODE RELEASE TO PUBLIC USE
-- Database Updates for Existing Supabase Schema
-- =============================================
-- Run this script in Supabase Dashboard > SQL Editor
-- This script makes AI features publicly accessible with existing schema

-- =============================================
-- 1. UPDATE USER SUBSCRIPTION TIERS
-- =============================================

-- Update subscription tier constraint to include 'public'
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_subscription_tier_check 
CHECK (subscription_tier IN ('public', 'premium', 'enterprise', 'free'));

-- Update all users to public tier (free access to AI features)
UPDATE public.users 
SET subscription_tier = 'public' 
WHERE subscription_tier IN ('free', 'premium');

-- =============================================
-- 2. UPDATE ROW LEVEL SECURITY POLICIES
-- =============================================

-- Make articles publicly readable (if not already)
DROP POLICY IF EXISTS "Articles are publicly readable" ON public.articles;
CREATE POLICY "Articles are publicly readable" ON public.articles 
FOR SELECT USING (true);

-- Make company tickers publicly readable
DROP POLICY IF EXISTS "Company tickers are publicly readable" ON public.company_tickers;
CREATE POLICY "Company tickers are publicly readable" ON public.company_tickers 
FOR SELECT USING (true);

-- Make news sources publicly readable
DROP POLICY IF EXISTS "News sources are publicly readable" ON public.news_sources;
CREATE POLICY "News sources are publicly readable" ON public.news_sources 
FOR SELECT USING (true);

-- =============================================
-- 3. CREATE PUBLIC ACCESS CONFIGURATION
-- =============================================

-- Create public access configuration table
CREATE TABLE IF NOT EXISTS public.public_access_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_name VARCHAR(100) UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  access_level VARCHAR(20) DEFAULT 'public' CHECK (access_level IN ('public', 'authenticated', 'premium')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable all AI features for public access
INSERT INTO public.public_access_config (feature_name, is_enabled, access_level, description) VALUES
  ('ai_market_analysis', true, 'public', 'AI-powered market sentiment analysis and risk assessment'),
  ('ai_chat', true, 'public', 'AI chat interface for financial queries'),
  ('ai_insights', true, 'public', 'AI-generated market insights and recommendations'),
  ('red_flag_analysis', true, 'public', 'AI-identified investment risks and concerns'),
  ('portfolio_analysis', true, 'public', 'AI portfolio analysis and optimization'),
  ('news_prioritization', true, 'public', 'AI-powered news prioritization and curation'),
  ('market_prediction', true, 'public', 'AI market trend predictions and forecasts'),
  ('company_analysis', true, 'public', 'AI company financial analysis and ratings')
ON CONFLICT (feature_name) DO UPDATE SET
  is_enabled = true,
  access_level = 'public',
  updated_at = NOW();

-- =============================================
-- 4. CREATE PUBLIC USER FOR GUEST ACCESS
-- =============================================

-- Create a public user for guest access
INSERT INTO public.users (
  id,
  email,
  full_name,
  subscription_tier,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'public@jamstockanalytics.com',
  'Public User',
  'public',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  subscription_tier = 'public',
  updated_at = NOW();

-- =============================================
-- 5. CREATE PUBLIC ACCESS FUNCTIONS
-- =============================================

-- Function to check if feature is publicly accessible
CREATE OR REPLACE FUNCTION public.is_feature_public(feature_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.public_access_config 
    WHERE feature_name = $1 
    AND is_enabled = true 
    AND access_level = 'public'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get public user ID
CREATE OR REPLACE FUNCTION public.get_public_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN '00000000-0000-0000-0000-000000000000';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. GRANT PUBLIC ACCESS PERMISSIONS
-- =============================================

-- Grant public access to necessary tables
GRANT SELECT ON public.articles TO anon;
GRANT SELECT ON public.company_tickers TO anon;
GRANT SELECT ON public.news_sources TO anon;
GRANT SELECT ON public.public_access_config TO anon;

-- Grant public access to functions
GRANT EXECUTE ON FUNCTION public.is_feature_public(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_user_id() TO anon;

-- =============================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Create indexes for better public access performance
CREATE INDEX IF NOT EXISTS idx_articles_public_priority ON public.articles(ai_priority_score DESC, publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_public_access_config ON public.public_access_config(feature_name, is_enabled);

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ PRO MODE AI HAS BEEN SUCCESSFULLY RELEASED TO PUBLIC USE!';
  RAISE NOTICE '📊 All AI features are now publicly accessible';
  RAISE NOTICE '🔓 Guest users can now access AI Analysis, Market Insights, and Chat';
  RAISE NOTICE '⚡ Performance optimizations have been applied';
  RAISE NOTICE '🛡️ Security policies updated for public access';
  RAISE NOTICE '📈 Database indexes created for optimal performance';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '1. Test guest access in your application';
  RAISE NOTICE '2. Verify AI features work without authentication';
  RAISE NOTICE '3. Monitor performance and user engagement';
END $$;
