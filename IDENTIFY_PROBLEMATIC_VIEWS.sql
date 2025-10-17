-- =============================================
-- IDENTIFY PROBLEMATIC VIEWS
-- =============================================
-- This script identifies all views that might bypass RLS or expose sensitive data

-- =============================================
-- 1. CHECK ALL VIEWS FOR SECURITY ISSUES
-- =============================================

-- Check all views in public schema
SELECT 
    'All Views in Public Schema' as test_name,
    viewname,
    CASE 
        WHEN definition ILIKE '%SECURITY DEFINER%' 
        THEN '❌ SECURITY DEFINER VIEW - BYPASSES RLS!'
        WHEN definition ILIKE '%auth.users%' 
        THEN '❌ EXPOSES AUTH.USERS!'
        WHEN definition ILIKE '%auth%'
        THEN '⚠️ REFERENCES AUTH - CHECK SECURITY'
        WHEN definition ILIKE '%user%'
        THEN '⚠️ REFERENCES USER - CHECK SECURITY'
        ELSE '✅ SAFE'
    END as status
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- =============================================
-- 2. CHECK VIEWS FOR USER DATA EXPOSURE
-- =============================================

-- Check for views that might expose user data
SELECT 
    'Views with User Data References' as test_name,
    viewname,
    definition,
    CASE 
        WHEN definition ILIKE '%users%' 
        THEN '⚠️ REFERENCES USERS TABLE'
        WHEN definition ILIKE '%user_profiles%' 
        THEN '⚠️ REFERENCES USER_PROFILES TABLE'
        WHEN definition ILIKE '%user_saved_articles%' 
        THEN '⚠️ REFERENCES USER_SAVED_ARTICLES TABLE'
        WHEN definition ILIKE '%user_article_interactions%' 
        THEN '⚠️ REFERENCES USER_ARTICLE_INTERACTIONS TABLE'
        WHEN definition ILIKE '%chat_sessions%' 
        THEN '⚠️ REFERENCES CHAT_SESSIONS TABLE'
        WHEN definition ILIKE '%chat_messages%' 
        THEN '⚠️ REFERENCES CHAT_MESSAGES TABLE'
        WHEN definition ILIKE '%analysis_sessions%' 
        THEN '⚠️ REFERENCES ANALYSIS_SESSIONS TABLE'
        WHEN definition ILIKE '%analysis_notes%' 
        THEN '⚠️ REFERENCES ANALYSIS_NOTES TABLE'
        ELSE '✅ SAFE'
    END as status
FROM pg_views 
WHERE schemaname = 'public'
    AND (
        definition ILIKE '%users%' 
        OR definition ILIKE '%user_profiles%'
        OR definition ILIKE '%user_saved_articles%'
        OR definition ILIKE '%user_article_interactions%'
        OR definition ILIKE '%chat_sessions%'
        OR definition ILIKE '%chat_messages%'
        OR definition ILIKE '%analysis_sessions%'
        OR definition ILIKE '%analysis_notes%'
    )
ORDER BY viewname;

-- =============================================
-- 3. CHECK VIEWS FOR AUTH REFERENCES
-- =============================================

-- Check for views that reference auth schema
SELECT 
    'Views with Auth References' as test_name,
    viewname,
    definition,
    CASE 
        WHEN definition ILIKE '%auth.users%' 
        THEN '❌ EXPOSES AUTH.USERS!'
        WHEN definition ILIKE '%auth%'
        THEN '⚠️ REFERENCES AUTH SCHEMA'
        ELSE '✅ SAFE'
    END as status
FROM pg_views 
WHERE schemaname = 'public'
    AND definition ILIKE '%auth%'
ORDER BY viewname;

-- =============================================
-- 4. CHECK VIEWS FOR POTENTIAL RLS BYPASS
-- =============================================

-- Check for views that might bypass RLS
SELECT 
    'Views with Potential RLS Bypass' as test_name,
    viewname,
    definition,
    CASE 
        WHEN definition ILIKE '%SECURITY DEFINER%' 
        THEN '❌ SECURITY DEFINER VIEW - BYPASSES RLS!'
        WHEN definition ILIKE '%auth.uid()%' 
        THEN '⚠️ USES AUTH.UID() - CHECK SECURITY'
        WHEN definition ILIKE '%auth%'
        THEN '⚠️ REFERENCES AUTH - CHECK SECURITY'
        ELSE '✅ SAFE'
    END as status
FROM pg_views 
WHERE schemaname = 'public'
    AND (
        definition ILIKE '%SECURITY DEFINER%' 
        OR definition ILIKE '%auth.uid()%'
        OR definition ILIKE '%auth%'
    )
ORDER BY viewname;

-- =============================================
-- 5. CHECK VIEWS FOR POSTGREST EXPOSURE
-- =============================================

-- Check for views that might be exposed via PostgREST
SELECT 
    'Views Potentially Exposed via PostgREST' as test_name,
    viewname,
    CASE 
        WHEN viewname ILIKE '%user%' 
        THEN '⚠️ USER-RELATED VIEW - CHECK SECURITY'
        WHEN viewname ILIKE '%profile%' 
        THEN '⚠️ PROFILE-RELATED VIEW - CHECK SECURITY'
        WHEN viewname ILIKE '%analysis%' 
        THEN '⚠️ ANALYSIS-RELATED VIEW - CHECK SECURITY'
        WHEN viewname ILIKE '%chat%' 
        THEN '⚠️ CHAT-RELATED VIEW - CHECK SECURITY'
        WHEN viewname ILIKE '%storage%' 
        THEN '⚠️ STORAGE-RELATED VIEW - CHECK SECURITY'
        ELSE '✅ SAFE'
    END as status
FROM pg_views 
WHERE schemaname = 'public'
    AND (
        viewname ILIKE '%user%' 
        OR viewname ILIKE '%profile%'
        OR viewname ILIKE '%analysis%'
        OR viewname ILIKE '%chat%'
        OR viewname ILIKE '%storage%'
    )
ORDER BY viewname;

-- =============================================
-- 6. COMPREHENSIVE SECURITY ASSESSMENT
-- =============================================

-- Overall security assessment
SELECT 
    'Security Assessment Summary' as test_name,
    'Total Views' as category,
    COUNT(*) as count,
    'INFO' as status
FROM pg_views 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Security Assessment Summary' as test_name,
    'Views with Auth References' as category,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '⚠️ NEEDS REVIEW'
        ELSE '✅ NONE FOUND'
    END as status
FROM pg_views 
WHERE schemaname = 'public'
    AND definition ILIKE '%auth%'

UNION ALL

SELECT 
    'Security Assessment Summary' as test_name,
    'Views with User Data References' as category,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '⚠️ NEEDS REVIEW'
        ELSE '✅ NONE FOUND'
    END as status
FROM pg_views 
WHERE schemaname = 'public'
    AND (
        definition ILIKE '%users%' 
        OR definition ILIKE '%user_profiles%'
        OR definition ILIKE '%user_saved_articles%'
        OR definition ILIKE '%user_article_interactions%'
        OR definition ILIKE '%chat_sessions%'
        OR definition ILIKE '%chat_messages%'
        OR definition ILIKE '%analysis_sessions%'
        OR definition ILIKE '%analysis_notes%'
    )

UNION ALL

SELECT 
    'Security Assessment Summary' as test_name,
    'Views with SECURITY DEFINER' as category,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '❌ CRITICAL SECURITY RISK!'
        ELSE '✅ NONE FOUND'
    END as status
FROM pg_views 
WHERE schemaname = 'public'
    AND definition ILIKE '%SECURITY DEFINER%';

-- =============================================
-- 7. RECOMMENDATIONS
-- =============================================

SELECT 
    'Security Recommendations' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_views 
            WHERE schemaname = 'public' 
            AND definition ILIKE '%SECURITY DEFINER%'
        ) THEN 'CRITICAL: Remove SECURITY DEFINER views immediately'
        WHEN EXISTS (
            SELECT 1 FROM pg_views 
            WHERE schemaname = 'public' 
            AND definition ILIKE '%auth.users%'
        ) THEN 'CRITICAL: Remove views exposing auth.users'
        WHEN EXISTS (
            SELECT 1 FROM pg_views 
            WHERE schemaname = 'public' 
            AND definition ILIKE '%users%'
        ) THEN 'WARNING: Review views referencing users table'
        ELSE 'All views appear to be secure'
    END as recommendation;

SELECT 'View security audit completed!' as status;
