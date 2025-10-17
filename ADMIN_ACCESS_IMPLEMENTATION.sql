-- =====================================================
-- ADMIN ACCESS IMPLEMENTATION - BOTH OPTIONS
-- =====================================================
-- This script implements both Option A (JWT claims) and Option B (DB function)
-- for secure admin access while maintaining RLS protection

-- =====================================================
-- OPTION A: JWT CLAIMS ADMIN POLICIES
-- =====================================================

-- Create admin policies for all user tables using JWT claims
-- This allows users with role='admin' in JWT to bypass owner checks

-- Users table admin policies
CREATE POLICY "users_admin_select" ON public.users 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "users_admin_modify" ON public.users 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- User profiles admin policies
CREATE POLICY "user_profiles_admin_select" ON public.user_profiles 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "user_profiles_admin_modify" ON public.user_profiles 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- User saved articles admin policies
CREATE POLICY "user_saved_articles_admin_select" ON public.user_saved_articles 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "user_saved_articles_admin_modify" ON public.user_saved_articles 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- User article interactions admin policies
CREATE POLICY "user_article_interactions_admin_select" ON public.user_article_interactions 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "user_article_interactions_admin_modify" ON public.user_article_interactions 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Chat sessions admin policies
CREATE POLICY "chat_sessions_admin_select" ON public.chat_sessions 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "chat_sessions_admin_modify" ON public.chat_sessions 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Chat messages admin policies
CREATE POLICY "chat_messages_admin_select" ON public.chat_messages 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "chat_messages_admin_modify" ON public.chat_messages 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Analysis sessions admin policies
CREATE POLICY "analysis_sessions_admin_select" ON public.analysis_sessions 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "analysis_sessions_admin_modify" ON public.analysis_sessions 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Analysis notes admin policies
CREATE POLICY "analysis_notes_admin_select" ON public.analysis_notes 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "analysis_notes_admin_modify" ON public.analysis_notes 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- User notifications admin policies
CREATE POLICY "user_notifications_admin_select" ON public.user_notifications 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "user_notifications_admin_modify" ON public.user_notifications 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- User alert subscriptions admin policies
CREATE POLICY "user_alert_subscriptions_admin_select" ON public.user_alert_subscriptions 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "user_alert_subscriptions_admin_modify" ON public.user_alert_subscriptions 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Storage files admin policies
CREATE POLICY "storage_files_admin_select" ON public.storage_files 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "storage_files_admin_modify" ON public.storage_files 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Subscriptions admin policies
CREATE POLICY "subscriptions_admin_select" ON public.subscriptions 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "subscriptions_admin_modify" ON public.subscriptions 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Alerts admin policies
CREATE POLICY "alerts_admin_select" ON public.alerts 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "alerts_admin_modify" ON public.alerts 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Trades admin policies
CREATE POLICY "trades_admin_select" ON public.trades 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "trades_admin_modify" ON public.trades 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Brokerages admin policies
CREATE POLICY "brokerages_admin_select" ON public.brokerages 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "brokerages_admin_modify" ON public.brokerages 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- User organizations admin policies
CREATE POLICY "user_organizations_admin_select" ON public.user_organizations 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "user_organizations_admin_modify" ON public.user_organizations 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Organizations admin policies
CREATE POLICY "organizations_admin_select" ON public.organizations 
    FOR SELECT TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "organizations_admin_modify" ON public.organizations 
    FOR ALL TO authenticated 
    USING ((auth.jwt() ->> 'role') = 'admin') 
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- OPTION B: DATABASE FUNCTION ADMIN CHECK
-- =====================================================

-- Create private schema for security functions
CREATE SCHEMA IF NOT EXISTS private_security;

-- Create admin check function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION private_security.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Check for admin role in JWT
    IF (auth.jwt() ->> 'role') = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Check for admin flag in JWT
    IF (auth.jwt() ->> 'admin')::boolean = TRUE THEN
        RETURN TRUE;
    END IF;
    
    -- Check for super_admin role in JWT
    IF (auth.jwt() ->> 'role') = 'super_admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is in admin users table (optional)
    -- This allows for database-stored admin users
    IF EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    ) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- Create admin users table (optional - for database-stored admins)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users table
CREATE POLICY "admin_users_service_role" ON public.admin_users
    FOR ALL TO service_role USING (true);

CREATE POLICY "admin_users_admin_select" ON public.admin_users
    FOR SELECT TO authenticated
    USING (private_security.is_admin());

-- Create indexes for admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON public.admin_users(is_active);

-- =====================================================
-- OPTION B: ADMIN POLICIES USING DATABASE FUNCTION
-- =====================================================

-- Create admin policies using the database function
-- This provides more flexibility for complex admin checks

-- Users table admin policies (using function)
CREATE POLICY "users_admin_function_select" ON public.users 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "users_admin_function_modify" ON public.users 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- User profiles admin policies (using function)
CREATE POLICY "user_profiles_admin_function_select" ON public.user_profiles 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "user_profiles_admin_function_modify" ON public.user_profiles 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- User saved articles admin policies (using function)
CREATE POLICY "user_saved_articles_admin_function_select" ON public.user_saved_articles 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "user_saved_articles_admin_function_modify" ON public.user_saved_articles 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- User article interactions admin policies (using function)
CREATE POLICY "user_article_interactions_admin_function_select" ON public.user_article_interactions 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "user_article_interactions_admin_function_modify" ON public.user_article_interactions 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- Chat sessions admin policies (using function)
CREATE POLICY "chat_sessions_admin_function_select" ON public.chat_sessions 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "chat_sessions_admin_function_modify" ON public.chat_sessions 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- Chat messages admin policies (using function)
CREATE POLICY "chat_messages_admin_function_select" ON public.chat_messages 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "chat_messages_admin_function_modify" ON public.chat_messages 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- Analysis sessions admin policies (using function)
CREATE POLICY "analysis_sessions_admin_function_select" ON public.analysis_sessions 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "analysis_sessions_admin_function_modify" ON public.analysis_sessions 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- Analysis notes admin policies (using function)
CREATE POLICY "analysis_notes_admin_function_select" ON public.analysis_notes 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "analysis_notes_admin_function_modify" ON public.analysis_notes 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- User notifications admin policies (using function)
CREATE POLICY "user_notifications_admin_function_select" ON public.user_notifications 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "user_notifications_admin_function_modify" ON public.user_notifications 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- User alert subscriptions admin policies (using function)
CREATE POLICY "user_alert_subscriptions_admin_function_select" ON public.user_alert_subscriptions 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "user_alert_subscriptions_admin_function_modify" ON public.user_alert_subscriptions 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- Storage files admin policies (using function)
CREATE POLICY "storage_files_admin_function_select" ON public.storage_files 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "storage_files_admin_function_modify" ON public.storage_files 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- Subscriptions admin policies (using function)
CREATE POLICY "subscriptions_admin_function_select" ON public.subscriptions 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "subscriptions_admin_function_modify" ON public.subscriptions 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- Alerts admin policies (using function)
CREATE POLICY "alerts_admin_function_select" ON public.alerts 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "alerts_admin_function_modify" ON public.alerts 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- Trades admin policies (using function)
CREATE POLICY "trades_admin_function_select" ON public.trades 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "trades_admin_function_modify" ON public.trades 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- Brokerages admin policies (using function)
CREATE POLICY "brokerages_admin_function_select" ON public.brokerages 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "brokerages_admin_function_modify" ON public.brokerages 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- User organizations admin policies (using function)
CREATE POLICY "user_organizations_admin_function_select" ON public.user_organizations 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "user_organizations_admin_function_modify" ON public.user_organizations 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- Organizations admin policies (using function)
CREATE POLICY "organizations_admin_function_select" ON public.organizations 
    FOR SELECT TO authenticated 
    USING (private_security.is_admin());

CREATE POLICY "organizations_admin_function_modify" ON public.organizations 
    FOR ALL TO authenticated 
    USING (private_security.is_admin()) 
    WITH CHECK (private_security.is_admin());

-- =====================================================
-- SECURE FUNCTION PERMISSIONS
-- =====================================================

-- Grant execute permission on admin function to authenticated users
GRANT EXECUTE ON FUNCTION private_security.is_admin() TO authenticated;

-- Revoke execute permission from anon (security measure)
REVOKE EXECUTE ON FUNCTION private_security.is_admin() FROM anon;

-- Grant service role full access to admin function
GRANT EXECUTE ON FUNCTION private_security.is_admin() TO service_role;

-- =====================================================
-- ADMIN MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to add admin user
CREATE OR REPLACE FUNCTION public.add_admin_user(
    target_user_id UUID,
    admin_role VARCHAR(50) DEFAULT 'admin',
    admin_permissions JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Only service role or existing admins can add admin users
    IF NOT private_security.is_admin() AND current_setting('role') != 'service_role' THEN
        RAISE EXCEPTION 'Access denied: admin privileges required';
    END IF;
    
    -- Insert admin user
    INSERT INTO public.admin_users (user_id, role, permissions, created_by)
    VALUES (target_user_id, admin_role, admin_permissions, auth.uid())
    ON CONFLICT (user_id) DO UPDATE SET
        role = EXCLUDED.role,
        permissions = EXCLUDED.permissions,
        is_active = true,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$;

-- Function to remove admin user
CREATE OR REPLACE FUNCTION public.remove_admin_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Only service role or existing admins can remove admin users
    IF NOT private_security.is_admin() AND current_setting('role') != 'service_role' THEN
        RAISE EXCEPTION 'Access denied: admin privileges required';
    END IF;
    
    -- Deactivate admin user
    UPDATE public.admin_users 
    SET is_active = false, updated_at = NOW()
    WHERE user_id = target_user_id;
    
    RETURN FOUND;
END;
$$;

-- Function to list admin users
CREATE OR REPLACE FUNCTION public.list_admin_users()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    admin_role VARCHAR(50),
    permissions JSONB,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Only service role or existing admins can list admin users
    IF NOT private_security.is_admin() AND current_setting('role') != 'service_role' THEN
        RAISE EXCEPTION 'Access denied: admin privileges required';
    END IF;
    
    RETURN QUERY
    SELECT 
        au.user_id,
        u.email,
        u.full_name,
        au.role as admin_role,
        au.permissions,
        au.is_active,
        au.created_at
    FROM public.admin_users au
    JOIN public.users u ON au.user_id = u.id
    WHERE au.is_active = true
    ORDER BY au.created_at DESC;
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS FOR ADMIN FUNCTIONS
-- =====================================================

-- Grant execute permissions on admin management functions
GRANT EXECUTE ON FUNCTION public.add_admin_user(UUID, VARCHAR, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.remove_admin_user(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.list_admin_users() TO service_role;

-- Grant to authenticated users with admin check
GRANT EXECUTE ON FUNCTION public.add_admin_user(UUID, VARCHAR, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_admin_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_admin_users() TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check admin policies exist
SELECT 
    'Admin Policy Check' as test_name,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND policyname LIKE '%admin%'
ORDER BY tablename, policyname;

-- Check admin function exists
SELECT 
    'Admin Function Check' as test_name,
    n.nspname as schema_name,
    p.proname as function_name,
    p.prosecdef as is_security_definer,
    p.proconfig as search_path_config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'private_security'
AND p.proname = 'is_admin';

-- Check admin users table
SELECT 
    'Admin Users Table Check' as test_name,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename = 'admin_users';

-- =====================================================
-- ADMIN ACCESS IMPLEMENTATION COMPLETE
-- =====================================================
-- Both Option A (JWT claims) and Option B (DB function) have been implemented
-- Choose which approach you prefer or use both for maximum flexibility
