-- =============================================
-- SECURITY MONITORING DASHBOARD
-- =============================================
-- This script creates comprehensive security monitoring views and functions
-- for the JamStockAnalytics application

-- =============================================
-- 1. SECURITY OVERVIEW DASHBOARD
-- =============================================

-- Create comprehensive security overview
CREATE OR REPLACE VIEW public.security_overview AS
SELECT 
    'user_activity' as metric_type,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT CASE WHEN u.last_active > NOW() - INTERVAL '24 hours' THEN u.id END) as active_users_24h,
    COUNT(DISTINCT CASE WHEN u.last_active > NOW() - INTERVAL '7 days' THEN u.id END) as active_users_7d,
    COUNT(DISTINCT CASE WHEN u.subscription_tier = 'enterprise' THEN u.id END) as enterprise_users
FROM public.users u
WHERE u.is_active = true
UNION ALL
SELECT 
    'security_events' as metric_type,
    COUNT(*) as total_events,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as events_24h,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as events_7d,
    COUNT(CASE WHEN event_type = 'security_alert' THEN 1 END) as security_alerts
FROM public.audit_logs
UNION ALL
SELECT 
    'failed_attempts' as metric_type,
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as attempts_24h,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as attempts_7d,
    COUNT(CASE WHEN details->>'severity' = 'high' THEN 1 END) as high_severity
FROM public.audit_logs
WHERE event_type = 'login_failed';

-- =============================================
-- 2. USER SECURITY STATUS
-- =============================================

-- Create user security status view
CREATE OR REPLACE VIEW public.user_security_status AS
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.subscription_tier,
    u.last_active,
    u.created_at,
    CASE 
        WHEN u.last_active > NOW() - INTERVAL '24 hours' THEN 'active'
        WHEN u.last_active > NOW() - INTERVAL '7 days' THEN 'recent'
        WHEN u.last_active > NOW() - INTERVAL '30 days' THEN 'inactive'
        ELSE 'dormant'
    END as activity_status,
    COUNT(DISTINCT cs.id) as chat_sessions,
    COUNT(DISTINCT as.id) as analysis_sessions,
    COUNT(DISTINCT usa.id) as saved_articles,
    COUNT(DISTINCT CASE WHEN al.event_type = 'login_failed' THEN al.id END) as failed_logins,
    MAX(CASE WHEN al.event_type = 'login_succeeded' THEN al.created_at END) as last_successful_login,
    MAX(CASE WHEN al.event_type = 'login_failed' THEN al.created_at END) as last_failed_login
FROM public.users u
LEFT JOIN public.chat_sessions cs ON u.id = cs.user_id
LEFT JOIN public.analysis_sessions as ON u.id = as.user_id
LEFT JOIN public.user_saved_articles usa ON u.id = usa.user_id
LEFT JOIN public.audit_logs al ON u.id = al.user_id
WHERE u.is_active = true
GROUP BY u.id, u.full_name, u.email, u.subscription_tier, u.last_active, u.created_at;

-- =============================================
-- 3. SECURITY EVENTS TIMELINE
-- =============================================

-- Create security events timeline view
CREATE OR REPLACE VIEW public.security_events_timeline AS
SELECT 
    al.id,
    al.event_type,
    al.user_id,
    u.full_name,
    al.details,
    al.created_at,
    CASE 
        WHEN al.event_type = 'login_failed' THEN 'high'
        WHEN al.event_type = 'security_alert' THEN 'high'
        WHEN al.event_type = 'password_changed' THEN 'medium'
        WHEN al.event_type = 'email_changed' THEN 'medium'
        WHEN al.event_type = 'login_succeeded' THEN 'low'
        ELSE 'low'
    END as severity,
    CASE 
        WHEN al.event_type = 'login_failed' THEN 'Failed login attempt'
        WHEN al.event_type = 'security_alert' THEN 'Security alert triggered'
        WHEN al.event_type = 'password_changed' THEN 'Password changed'
        WHEN al.event_type = 'email_changed' THEN 'Email address changed'
        WHEN al.event_type = 'login_succeeded' THEN 'Successful login'
        ELSE 'Other security event'
    END as description
FROM public.audit_logs al
LEFT JOIN public.users u ON al.user_id = u.id
WHERE al.created_at > NOW() - INTERVAL '30 days'
ORDER BY al.created_at DESC;

-- =============================================
-- 4. SECURITY METRICS BY TIME PERIOD
-- =============================================

-- Create security metrics by time period
CREATE OR REPLACE VIEW public.security_metrics_by_period AS
SELECT 
    DATE_TRUNC('hour', created_at) as time_period,
    COUNT(*) as total_events,
    COUNT(CASE WHEN event_type = 'login_failed' THEN 1 END) as failed_logins,
    COUNT(CASE WHEN event_type = 'login_succeeded' THEN 1 END) as successful_logins,
    COUNT(CASE WHEN event_type = 'password_changed' THEN 1 END) as password_changes,
    COUNT(CASE WHEN event_type = 'email_changed' THEN 1 END) as email_changes,
    COUNT(CASE WHEN event_type = 'security_alert' THEN 1 END) as security_alerts,
    ROUND(
        COUNT(CASE WHEN event_type = 'login_failed' THEN 1 END)::numeric / 
        NULLIF(COUNT(CASE WHEN event_type IN ('login_failed', 'login_succeeded') THEN 1 END), 0) * 100, 
        2
    ) as failure_rate_percent
FROM public.audit_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY time_period DESC;

-- =============================================
-- 5. SUSPICIOUS ACTIVITY DETECTION
-- =============================================

-- Create suspicious activity detection view
CREATE OR REPLACE VIEW public.suspicious_activity AS
SELECT 
    'excessive_failed_logins' as activity_type,
    al.user_id,
    u.full_name,
    u.email,
    COUNT(*) as event_count,
    MIN(al.created_at) as first_occurrence,
    MAX(al.created_at) as last_occurrence,
    'User has ' || COUNT(*) || ' failed login attempts in the last hour' as description,
    'high' as severity
FROM public.audit_logs al
JOIN public.users u ON al.user_id = u.id
WHERE al.event_type = 'login_failed'
    AND al.created_at > NOW() - INTERVAL '1 hour'
GROUP BY al.user_id, u.full_name, u.email
HAVING COUNT(*) > 5
UNION ALL
SELECT 
    'unusual_login_times' as activity_type,
    al.user_id,
    u.full_name,
    u.email,
    COUNT(*) as event_count,
    MIN(al.created_at) as first_occurrence,
    MAX(al.created_at) as last_occurrence,
    'User logged in ' || COUNT(*) || ' times during unusual hours (outside 6 AM - 10 PM)' as description,
    'medium' as severity
FROM public.audit_logs al
JOIN public.users u ON al.user_id = u.id
WHERE al.event_type = 'login_succeeded'
    AND EXTRACT(HOUR FROM al.created_at) NOT BETWEEN 6 AND 22
    AND al.created_at > NOW() - INTERVAL '24 hours'
GROUP BY al.user_id, u.full_name, u.email
HAVING COUNT(*) > 3
UNION ALL
SELECT 
    'rapid_password_changes' as activity_type,
    al.user_id,
    u.full_name,
    u.email,
    COUNT(*) as event_count,
    MIN(al.created_at) as first_occurrence,
    MAX(al.created_at) as last_occurrence,
    'User changed password ' || COUNT(*) || ' times in the last hour' as description,
    'high' as severity
FROM public.audit_logs al
JOIN public.users u ON al.user_id = u.id
WHERE al.event_type = 'password_changed'
    AND al.created_at > NOW() - INTERVAL '1 hour'
GROUP BY al.user_id, u.full_name, u.email
HAVING COUNT(*) > 2;

-- =============================================
-- 6. SECURITY DASHBOARD FUNCTIONS
-- =============================================

-- Create function to get security dashboard data
CREATE OR REPLACE FUNCTION public.get_security_dashboard_data()
RETURNS TABLE (
    metric_name TEXT,
    metric_value BIGINT,
    metric_trend TEXT,
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Set explicit search_path for security
    SET search_path = 'public', 'auth';
    
    -- Total users
    RETURN QUERY
    SELECT 
        'total_users' as metric_name,
        COUNT(*)::bigint as metric_value,
        'stable' as metric_trend,
        NOW() as last_updated
    FROM public.users
    WHERE is_active = true;
    
    -- Active users in last 24 hours
    RETURN QUERY
    SELECT 
        'active_users_24h' as metric_name,
        COUNT(*)::bigint as metric_value,
        'stable' as metric_trend,
        NOW() as last_updated
    FROM public.users
    WHERE is_active = true 
        AND last_active > NOW() - INTERVAL '24 hours';
    
    -- Failed login attempts in last 24 hours
    RETURN QUERY
    SELECT 
        'failed_logins_24h' as metric_name,
        COUNT(*)::bigint as metric_value,
        CASE 
            WHEN COUNT(*) > 50 THEN 'increasing'
            WHEN COUNT(*) > 20 THEN 'stable'
            ELSE 'decreasing'
        END as metric_trend,
        NOW() as last_updated
    FROM public.audit_logs
    WHERE event_type = 'login_failed'
        AND created_at > NOW() - INTERVAL '24 hours';
    
    -- Security alerts in last 24 hours
    RETURN QUERY
    SELECT 
        'security_alerts_24h' as metric_name,
        COUNT(*)::bigint as metric_value,
        CASE 
            WHEN COUNT(*) > 10 THEN 'increasing'
            WHEN COUNT(*) > 5 THEN 'stable'
            ELSE 'decreasing'
        END as metric_trend,
        NOW() as last_updated
    FROM public.audit_logs
    WHERE event_type = 'security_alert'
        AND created_at > NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user security summary
CREATE OR REPLACE FUNCTION public.get_user_security_summary(user_uuid UUID)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    email TEXT,
    subscription_tier TEXT,
    last_active TIMESTAMP WITH TIME ZONE,
    total_sessions BIGINT,
    failed_logins BIGINT,
    security_score INTEGER,
    risk_level TEXT
) AS $$
BEGIN
    -- Set explicit search_path for security
    SET search_path = 'public', 'auth';
    
    RETURN QUERY
    SELECT 
        u.id,
        u.full_name,
        u.email,
        u.subscription_tier,
        u.last_active,
        COUNT(DISTINCT cs.id) + COUNT(DISTINCT as.id) as total_sessions,
        COUNT(CASE WHEN al.event_type = 'login_failed' THEN 1 END) as failed_logins,
        CASE 
            WHEN COUNT(CASE WHEN al.event_type = 'login_failed' THEN 1 END) > 10 THEN 20
            WHEN COUNT(CASE WHEN al.event_type = 'login_failed' THEN 1 END) > 5 THEN 40
            WHEN COUNT(CASE WHEN al.event_type = 'login_failed' THEN 1 END) > 2 THEN 60
            WHEN u.last_active > NOW() - INTERVAL '7 days' THEN 80
            ELSE 90
        END as security_score,
        CASE 
            WHEN COUNT(CASE WHEN al.event_type = 'login_failed' THEN 1 END) > 10 THEN 'high'
            WHEN COUNT(CASE WHEN al.event_type = 'login_failed' THEN 1 END) > 5 THEN 'medium'
            ELSE 'low'
        END as risk_level
    FROM public.users u
    LEFT JOIN public.chat_sessions cs ON u.id = cs.user_id
    LEFT JOIN public.analysis_sessions as ON u.id = as.user_id
    LEFT JOIN public.audit_logs al ON u.id = al.user_id
    WHERE u.id = user_uuid
    GROUP BY u.id, u.full_name, u.email, u.subscription_tier, u.last_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. SECURITY ALERT FUNCTIONS
-- =============================================

-- Create function to check for security alerts
CREATE OR REPLACE FUNCTION public.check_security_alerts()
RETURNS TABLE (
    alert_type TEXT,
    alert_count BIGINT,
    severity TEXT,
    description TEXT,
    first_occurrence TIMESTAMP WITH TIME ZONE,
    last_occurrence TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Set explicit search_path for security
    SET search_path = 'public', 'auth';
    
    -- Check for excessive failed logins
    RETURN QUERY
    SELECT 
        'excessive_failed_logins' as alert_type,
        COUNT(*) as alert_count,
        'high' as severity,
        'Multiple users with excessive failed login attempts' as description,
        MIN(al.created_at) as first_occurrence,
        MAX(al.created_at) as last_occurrence
    FROM public.audit_logs al
    WHERE al.event_type = 'login_failed'
        AND al.created_at > NOW() - INTERVAL '1 hour'
    GROUP BY al.user_id
    HAVING COUNT(*) > 5;
    
    -- Check for unusual login patterns
    RETURN QUERY
    SELECT 
        'unusual_login_patterns' as alert_type,
        COUNT(*) as alert_count,
        'medium' as severity,
        'Unusual login time patterns detected' as description,
        MIN(al.created_at) as first_occurrence,
        MAX(al.created_at) as last_occurrence
    FROM public.audit_logs al
    WHERE al.event_type = 'login_succeeded'
        AND EXTRACT(HOUR FROM al.created_at) NOT BETWEEN 6 AND 22
        AND al.created_at > NOW() - INTERVAL '24 hours'
    GROUP BY al.user_id
    HAVING COUNT(*) > 3;
    
    -- Check for rapid password changes
    RETURN QUERY
    SELECT 
        'rapid_password_changes' as alert_type,
        COUNT(*) as alert_count,
        'high' as severity,
        'Multiple password changes in short time' as description,
        MIN(al.created_at) as first_occurrence,
        MAX(al.created_at) as last_occurrence
    FROM public.audit_logs al
    WHERE al.event_type = 'password_changed'
        AND al.created_at > NOW() - INTERVAL '1 hour'
    GROUP BY al.user_id
    HAVING COUNT(*) > 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. SECURITY REPORTING FUNCTIONS
-- =============================================

-- Create function to generate security report
CREATE OR REPLACE FUNCTION public.generate_security_report(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    report_section TEXT,
    metric_name TEXT,
    metric_value BIGINT,
    percentage_change NUMERIC
) AS $$
BEGIN
    -- Set explicit search_path for security
    SET search_path = 'public', 'auth';
    
    -- User activity metrics
    RETURN QUERY
    SELECT 
        'user_activity' as report_section,
        'total_users' as metric_name,
        COUNT(*)::bigint as metric_value,
        0.0 as percentage_change
    FROM public.users
    WHERE created_at BETWEEN start_date AND end_date;
    
    -- Security events metrics
    RETURN QUERY
    SELECT 
        'security_events' as report_section,
        'total_events' as metric_name,
        COUNT(*)::bigint as metric_value,
        0.0 as percentage_change
    FROM public.audit_logs
    WHERE created_at BETWEEN start_date AND end_date;
    
    -- Failed login attempts
    RETURN QUERY
    SELECT 
        'security_events' as report_section,
        'failed_logins' as metric_name,
        COUNT(*)::bigint as metric_value,
        0.0 as percentage_change
    FROM public.audit_logs
    WHERE event_type = 'login_failed'
        AND created_at BETWEEN start_date AND end_date;
    
    -- Successful logins
    RETURN QUERY
    SELECT 
        'security_events' as report_section,
        'successful_logins' as metric_name,
        COUNT(*)::bigint as metric_value,
        0.0 as percentage_change
    FROM public.audit_logs
    WHERE event_type = 'login_succeeded'
        AND created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. GRANT PERMISSIONS
-- =============================================

-- Grant permissions for security monitoring views
GRANT SELECT ON public.security_overview TO service_role;
GRANT SELECT ON public.user_security_status TO service_role;
GRANT SELECT ON public.security_events_timeline TO service_role;
GRANT SELECT ON public.security_metrics_by_period TO service_role;
GRANT SELECT ON public.suspicious_activity TO service_role;

-- Grant permissions for security monitoring functions
GRANT EXECUTE ON FUNCTION public.get_security_dashboard_data() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_security_summary(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_security_alerts() TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_security_report(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO service_role;

-- Revoke from public
REVOKE ALL ON public.security_overview FROM PUBLIC;
REVOKE ALL ON public.user_security_status FROM PUBLIC;
REVOKE ALL ON public.security_events_timeline FROM PUBLIC;
REVOKE ALL ON public.security_metrics_by_period FROM PUBLIC;
REVOKE ALL ON public.suspicious_activity FROM PUBLIC;

REVOKE ALL ON FUNCTION public.get_security_dashboard_data() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_security_summary(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_security_alerts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.generate_security_report(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) FROM PUBLIC;

-- =============================================
-- 10. SECURITY MONITORING COMMENTS
-- =============================================

COMMENT ON VIEW public.security_overview IS 'Comprehensive security overview dashboard';
COMMENT ON VIEW public.user_security_status IS 'Individual user security status and activity';
COMMENT ON VIEW public.security_events_timeline IS 'Chronological security events timeline';
COMMENT ON VIEW public.security_metrics_by_period IS 'Security metrics aggregated by time period';
COMMENT ON VIEW public.suspicious_activity IS 'Detected suspicious user activity patterns';

COMMENT ON FUNCTION public.get_security_dashboard_data() IS 'Retrieves security dashboard metrics';
COMMENT ON FUNCTION public.get_user_security_summary(UUID) IS 'Gets individual user security summary and risk assessment';
COMMENT ON FUNCTION public.check_security_alerts() IS 'Checks for active security alerts';
COMMENT ON FUNCTION public.generate_security_report(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) IS 'Generates comprehensive security report for date range';

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Security monitoring dashboard has been successfully created.';
    RAISE NOTICE 'Available views:';
    RAISE NOTICE '1. security_overview - Overall security metrics';
    RAISE NOTICE '2. user_security_status - Individual user security status';
    RAISE NOTICE '3. security_events_timeline - Chronological security events';
    RAISE NOTICE '4. security_metrics_by_period - Time-based security metrics';
    RAISE NOTICE '5. suspicious_activity - Detected suspicious patterns';
    RAISE NOTICE 'Available functions:';
    RAISE NOTICE '1. get_security_dashboard_data() - Dashboard metrics';
    RAISE NOTICE '2. get_user_security_summary(user_id) - User security summary';
    RAISE NOTICE '3. check_security_alerts() - Active security alerts';
    RAISE NOTICE '4. generate_security_report(start_date, end_date) - Security report';
    RAISE NOTICE 'Run SELECT * FROM public.get_security_dashboard_data(); to view dashboard data.';
END $$;
