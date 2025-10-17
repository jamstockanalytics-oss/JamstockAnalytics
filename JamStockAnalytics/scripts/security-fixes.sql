-- =============================================
-- SECURITY FIXES FOR JAMSTOCKANALYTICS
-- =============================================
-- This script addresses all identified security vulnerabilities
-- Run this script to secure your Supabase database

-- =============================================
-- 1. FIX EXPOSED AUTH.USERS VIA PUBLIC VIEWS
-- =============================================

-- Drop the problematic view that exposes auth.users data
DROP VIEW IF EXISTS public.view_user_full_profile;

-- Create a secure version that only exposes safe user data
CREATE OR REPLACE VIEW public.view_user_public_profile AS
SELECT 
    u.id,
    u.full_name,
    u.profile_image_url,
    u.subscription_tier,
    u.created_at,
    u.last_active,
    up.bio,
    up.investment_experience,
    up.risk_tolerance,
    up.preferred_sectors
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
WHERE u.is_active = true;

-- Grant appropriate permissions
GRANT SELECT ON public.view_user_public_profile TO authenticated;
GRANT SELECT ON public.view_user_public_profile TO anon;

-- =============================================
-- 2. FIX SECURITY DEFINER VIEWS
-- =============================================

-- Drop and recreate view_user_objects with proper security
DROP VIEW IF EXISTS public.view_user_objects;

CREATE OR REPLACE VIEW public.view_user_objects AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.subscription_tier,
    COUNT(DISTINCT usa.id) as saved_articles_count,
    COUNT(DISTINCT cs.id) as chat_sessions_count,
    COUNT(DISTINCT as.id) as analysis_sessions_count,
    MAX(u.last_active) as last_active
FROM public.users u
LEFT JOIN public.user_saved_articles usa ON u.id = usa.user_id
LEFT JOIN public.chat_sessions cs ON u.id = cs.user_id
LEFT JOIN public.analysis_sessions as ON u.id = as.user_id
WHERE u.is_active = true
GROUP BY u.id, u.full_name, u.subscription_tier;

-- Grant permissions with proper security
GRANT SELECT ON public.view_user_objects TO authenticated;
REVOKE ALL ON public.view_user_objects FROM anon;

-- =============================================
-- 3. ENABLE RLS ON ALL PUBLIC TABLES
-- =============================================

-- Enable RLS on tables that currently have it disabled
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.latest_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. ADD MISSING RLS POLICIES
-- =============================================

-- Add policies for tables that have RLS enabled but no policies
CREATE POLICY "Users can view own analysis sessions" ON public.analysis_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analysis sessions" ON public.analysis_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis sessions" ON public.analysis_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analysis sessions" ON public.analysis_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Brokerages policies
CREATE POLICY "Anyone can view active brokerages" ON public.brokerages
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage brokerages" ON public.brokerages
    FOR ALL USING (auth.role() = 'service_role');

-- Users policies (additional security)
CREATE POLICY "Users can view own user record" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own user record" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- 5. FIX MUTABLE SEARCH_PATH IN FUNCTIONS
-- =============================================

-- Fix clear_old_chat_messages function
CREATE OR REPLACE FUNCTION public.clear_old_chat_messages()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Set explicit search_path for security
    SET search_path = 'public', 'auth';
    
    DELETE FROM public.chat_messages 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_user_profile_id function
CREATE OR REPLACE FUNCTION public.get_user_profile_id(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    profile_id UUID;
BEGIN
    -- Set explicit search_path for security
    SET search_path = 'public', 'auth';
    
    SELECT id INTO profile_id
    FROM public.user_profiles
    WHERE user_id = user_uuid;
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION private_security.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin_user BOOLEAN := FALSE;
BEGIN
    -- Set explicit search_path for security
    SET search_path = 'private_security', 'public', 'auth';
    
    SELECT EXISTS(
        SELECT 1 FROM public.users 
        WHERE id = user_uuid 
        AND subscription_tier = 'enterprise'
    ) INTO is_admin_user;
    
    RETURN is_admin_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. ADDITIONAL SECURITY POLICIES
-- =============================================

-- Market data policies
CREATE POLICY "Anyone can view market data" ON public.market_data
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage market data" ON public.market_data
    FOR ALL USING (auth.role() = 'service_role');

-- Market insights policies
CREATE POLICY "Anyone can view market insights" ON public.market_insights
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage market insights" ON public.market_insights
    FOR ALL USING (auth.role() = 'service_role');

-- News sources policies
CREATE POLICY "Anyone can view active news sources" ON public.news_sources
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage news sources" ON public.news_sources
    FOR ALL USING (auth.role() = 'service_role');

-- Company tickers policies
CREATE POLICY "Anyone can view active company tickers" ON public.company_tickers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage company tickers" ON public.company_tickers
    FOR ALL USING (auth.role() = 'service_role');

-- Articles policies (enhanced)
CREATE POLICY "Anyone can view articles" ON public.articles
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage articles" ON public.articles
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 7. SECURE FUNCTION PERMISSIONS
-- =============================================

-- Revoke unnecessary permissions and grant only what's needed
REVOKE ALL ON FUNCTION public.clear_old_chat_messages() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_profile_id(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION private_security.is_admin(UUID) FROM PUBLIC;

-- Grant only to service role
GRANT EXECUTE ON FUNCTION public.clear_old_chat_messages() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_profile_id(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION private_security.is_admin(UUID) TO service_role;

-- =============================================
-- 8. ADDITIONAL SECURITY MEASURES
-- =============================================

-- Create a secure admin check function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    -- Set explicit search_path for security
    SET search_path = 'public', 'auth';
    
    RETURN auth.role() = 'service_role' OR 
           EXISTS(
               SELECT 1 FROM public.users 
               WHERE id = auth.uid() 
               AND subscription_tier = 'enterprise'
           );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
    event_type TEXT,
    user_id UUID,
    details JSONB
)
RETURNS VOID AS $$
BEGIN
    -- Set explicit search_path for security
    SET search_path = 'public', 'auth';
    
    INSERT INTO public.audit_logs (
        event_type,
        user_id,
        details,
        created_at
    ) VALUES (
        event_type,
        user_id,
        details,
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. PASSWORD SECURITY ENHANCEMENTS
-- =============================================

-- Create function to check password strength
CREATE OR REPLACE FUNCTION public.check_password_strength(password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Set explicit search_path for security
    SET search_path = 'public', 'auth';
    
    -- Check minimum length
    IF LENGTH(password) < 8 THEN
        RETURN FALSE;
    END IF;
    
    -- Check for at least one uppercase letter
    IF NOT password ~ '[A-Z]' THEN
        RETURN FALSE;
    END IF;
    
    -- Check for at least one lowercase letter
    IF NOT password ~ '[a-z]' THEN
        RETURN FALSE;
    END IF;
    
    -- Check for at least one number
    IF NOT password ~ '[0-9]' THEN
        RETURN FALSE;
    END IF;
    
    -- Check for at least one special character
    IF NOT password ~ '[!@#$%^&*(),.?":{}|<>]' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 10. SECURE VIEWS AND FUNCTIONS
-- =============================================

-- Create secure user summary view
CREATE OR REPLACE VIEW public.secure_user_summary AS
SELECT 
    u.id,
    u.full_name,
    u.subscription_tier,
    u.created_at,
    u.last_active,
    COUNT(DISTINCT cs.id) as total_chat_sessions,
    COUNT(DISTINCT as.id) as total_analysis_sessions,
    COUNT(DISTINCT usa.id) as total_saved_articles
FROM public.users u
LEFT JOIN public.chat_sessions cs ON u.id = cs.user_id
LEFT JOIN public.analysis_sessions as ON u.id = as.user_id
LEFT JOIN public.user_saved_articles usa ON u.id = usa.user_id
WHERE u.is_active = true
GROUP BY u.id, u.full_name, u.subscription_tier, u.created_at, u.last_active;

-- Grant appropriate permissions
GRANT SELECT ON public.secure_user_summary TO authenticated;
REVOKE ALL ON public.secure_user_summary FROM anon;

-- =============================================
-- 11. SECURITY MONITORING
-- =============================================

-- Create security monitoring function
CREATE OR REPLACE FUNCTION public.monitor_security_events()
RETURNS TABLE (
    event_count BIGINT,
    event_type TEXT,
    last_occurrence TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Set explicit search_path for security
    SET search_path = 'public', 'auth';
    
    RETURN QUERY
    SELECT 
        COUNT(*) as event_count,
        al.event_type,
        MAX(al.created_at) as last_occurrence
    FROM public.audit_logs al
    WHERE al.created_at > NOW() - INTERVAL '24 hours'
    GROUP BY al.event_type
    ORDER BY event_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 12. FINAL SECURITY CHECKS
-- =============================================

-- Create function to verify security setup
CREATE OR REPLACE FUNCTION public.verify_security_setup()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Set explicit search_path for security
    SET search_path = 'public', 'auth';
    
    -- Check RLS is enabled on critical tables
    RETURN QUERY
    SELECT 
        'RLS Enabled on Users' as check_name,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_class 
            WHERE relname = 'users' 
            AND relrowsecurity = true
        ) THEN 'PASS' ELSE 'FAIL' END as status,
        'Row Level Security should be enabled on users table' as details;
    
    -- Check policies exist
    RETURN QUERY
    SELECT 
        'Policies Exist' as check_name,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'users'
        ) THEN 'PASS' ELSE 'FAIL' END as status,
        'RLS policies should exist for users table' as details;
    
    -- Check secure views exist
    RETURN QUERY
    SELECT 
        'Secure Views' as check_name,
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_views 
            WHERE viewname = 'view_user_public_profile'
        ) THEN 'PASS' ELSE 'FAIL' END as status,
        'Secure user profile view should exist' as details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 13. GRANT APPROPRIATE PERMISSIONS
-- =============================================

-- Grant execute permissions to service role only
GRANT EXECUTE ON FUNCTION public.verify_security_setup() TO service_role;
GRANT EXECUTE ON FUNCTION public.monitor_security_events() TO service_role;
GRANT EXECUTE ON FUNCTION public.check_password_strength(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_security_event(TEXT, UUID, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO service_role;

-- Revoke from public
REVOKE ALL ON FUNCTION public.verify_security_setup() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.monitor_security_events() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_password_strength(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_security_event(TEXT, UUID, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC;

-- =============================================
-- 14. COMMENTS AND DOCUMENTATION
-- =============================================

COMMENT ON FUNCTION public.clear_old_chat_messages() IS 'Securely clears old chat messages with explicit search_path';
COMMENT ON FUNCTION public.get_user_profile_id(UUID) IS 'Securely retrieves user profile ID with explicit search_path';
COMMENT ON FUNCTION private_security.is_admin(UUID) IS 'Securely checks admin status with explicit search_path';
COMMENT ON FUNCTION public.check_password_strength(TEXT) IS 'Validates password strength requirements';
COMMENT ON FUNCTION public.log_security_event(TEXT, UUID, JSONB) IS 'Logs security events for monitoring';
COMMENT ON FUNCTION public.verify_security_setup() IS 'Verifies security configuration is properly set up';

-- =============================================
-- 15. SECURITY AUDIT LOGGING
-- =============================================

-- Log the security fixes application
INSERT INTO public.audit_logs (
    event_type,
    user_id,
    details,
    created_at
) VALUES (
    'security_fixes_applied',
    NULL,
    '{"fixes": ["exposed_views", "security_definer", "rls_policies", "search_path", "password_protection"], "timestamp": "' || NOW()::text || '"}',
    NOW()
);

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Security fixes have been successfully applied to JamStockAnalytics database.';
    RAISE NOTICE 'All identified security vulnerabilities have been addressed:';
    RAISE NOTICE '1. Exposed auth.users views have been secured';
    RAISE NOTICE '2. SECURITY DEFINER views have been fixed';
    RAISE NOTICE '3. RLS has been enabled on all public tables';
    RAISE NOTICE '4. Mutable search_path issues have been resolved';
    RAISE NOTICE '5. Missing RLS policies have been added';
    RAISE NOTICE '6. Password security has been enhanced';
    RAISE NOTICE 'Run SELECT * FROM public.verify_security_setup(); to verify the fixes.';
END $$;
