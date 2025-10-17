-- =============================================
-- SUPABASE SECURITY CONFIGURATION
-- =============================================
-- This script configures Supabase security settings
-- including password protection and authentication security

-- =============================================
-- 1. PASSWORD SECURITY SETTINGS
-- =============================================

-- Enable password strength requirements
UPDATE auth.config 
SET 
    password_min_length = 8,
    password_require_uppercase = true,
    password_require_lowercase = true,
    password_require_numbers = true,
    password_require_symbols = true,
    password_prohibited_common = true,
    password_prohibited_user_attributes = true
WHERE id = 'password';

-- Enable HaveIBeenPwned integration for leaked password protection
UPDATE auth.config 
SET 
    password_check_haveibeenpwned = true,
    password_check_haveibeenpwned_api_key = 'your_haveibeenpwned_api_key_here'
WHERE id = 'password';

-- =============================================
-- 2. AUTHENTICATION SECURITY SETTINGS
-- =============================================

-- Configure session security
UPDATE auth.config 
SET 
    session_timeout = 3600, -- 1 hour
    session_refresh_threshold = 300, -- 5 minutes
    session_secure_cookie = true,
    session_same_site = 'strict'
WHERE id = 'session';

-- Configure rate limiting
UPDATE auth.config 
SET 
    rate_limit_requests_per_minute = 60,
    rate_limit_requests_per_hour = 1000,
    rate_limit_requests_per_day = 10000
WHERE id = 'rate_limit';

-- =============================================
-- 3. EMAIL SECURITY SETTINGS
-- =============================================

-- Configure email security
UPDATE auth.config 
SET 
    email_secure_change_email = true,
    email_confirm_signup = true,
    email_confirm_password_change = true,
    email_secure_password_reset = true
WHERE id = 'email';

-- =============================================
-- 4. JWT SECURITY SETTINGS
-- =============================================

-- Configure JWT security
UPDATE auth.config 
SET 
    jwt_expiry = 3600, -- 1 hour
    jwt_refresh_expiry = 2592000, -- 30 days
    jwt_secure_cookie = true,
    jwt_same_site = 'strict'
WHERE id = 'jwt';

-- =============================================
-- 5. CORS SECURITY SETTINGS
-- =============================================

-- Configure CORS security
UPDATE auth.config 
SET 
    cors_origins = '["https://yourdomain.com", "https://www.yourdomain.com"]',
    cors_methods = '["GET", "POST", "PUT", "DELETE", "OPTIONS"]',
    cors_headers = '["Content-Type", "Authorization", "X-Requested-With"]',
    cors_credentials = true
WHERE id = 'cors';

-- =============================================
-- 6. SECURITY HEADERS
-- =============================================

-- Configure security headers
UPDATE auth.config 
SET 
    security_headers = '{
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": "default-src '\''self'\''; script-src '\''self'\'' '\''unsafe-inline'\''; style-src '\''self'\'' '\''unsafe-inline'\''; img-src '\''self'\'' data: https:; font-src '\''self'\''; connect-src '\''self'\'' https://api.supabase.co;"
    }'
WHERE id = 'security_headers';

-- =============================================
-- 7. AUDIT LOGGING CONFIGURATION
-- =============================================

-- Enable comprehensive audit logging
UPDATE auth.config 
SET 
    audit_log_enabled = true,
    audit_log_retention_days = 365,
    audit_log_include_failed_attempts = true,
    audit_log_include_successful_attempts = true,
    audit_log_include_password_changes = true,
    audit_log_include_email_changes = true
WHERE id = 'audit_log';

-- =============================================
-- 8. BRUTE FORCE PROTECTION
-- =============================================

-- Configure brute force protection
UPDATE auth.config 
SET 
    brute_force_protection_enabled = true,
    brute_force_max_attempts = 5,
    brute_force_lockout_duration = 900, -- 15 minutes
    brute_force_reset_attempts_after = 3600 -- 1 hour
WHERE id = 'brute_force';

-- =============================================
-- 9. ACCOUNT LOCKOUT SETTINGS
-- =============================================

-- Configure account lockout
UPDATE auth.config 
SET 
    account_lockout_enabled = true,
    account_lockout_max_attempts = 10,
    account_lockout_duration = 1800, -- 30 minutes
    account_lockout_reset_attempts_after = 7200 -- 2 hours
WHERE id = 'account_lockout';

-- =============================================
-- 10. MULTI-FACTOR AUTHENTICATION
-- =============================================

-- Configure MFA settings
UPDATE auth.config 
SET 
    mfa_enabled = true,
    mfa_required_for_admin = true,
    mfa_required_for_enterprise = true,
    mfa_backup_codes_count = 10,
    mfa_backup_codes_length = 8
WHERE id = 'mfa';

-- =============================================
-- 11. API SECURITY SETTINGS
-- =============================================

-- Configure API security
UPDATE auth.config 
SET 
    api_rate_limit_enabled = true,
    api_rate_limit_requests_per_minute = 100,
    api_rate_limit_requests_per_hour = 1000,
    api_rate_limit_requests_per_day = 10000,
    api_require_https = true,
    api_require_authentication = true
WHERE id = 'api_security';

-- =============================================
-- 12. DATABASE SECURITY SETTINGS
-- =============================================

-- Configure database security
UPDATE auth.config 
SET 
    db_connection_limit = 100,
    db_query_timeout = 30000, -- 30 seconds
    db_transaction_timeout = 60000, -- 1 minute
    db_require_ssl = true,
    db_audit_log_enabled = true
WHERE id = 'database_security';

-- =============================================
-- 13. SECURITY MONITORING
-- =============================================

-- Create security monitoring view
CREATE OR REPLACE VIEW public.security_monitoring AS
SELECT 
    'failed_login_attempts' as event_type,
    COUNT(*) as event_count,
    MAX(created_at) as last_occurrence
FROM auth.audit_log_entries 
WHERE event_type = 'login_failed'
    AND created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'successful_logins' as event_type,
    COUNT(*) as event_count,
    MAX(created_at) as last_occurrence
FROM auth.audit_log_entries 
WHERE event_type = 'login_succeeded'
    AND created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'password_changes' as event_type,
    COUNT(*) as event_count,
    MAX(created_at) as last_occurrence
FROM auth.audit_log_entries 
WHERE event_type = 'password_changed'
    AND created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'email_changes' as event_type,
    COUNT(*) as event_count,
    MAX(created_at) as last_occurrence
FROM auth.audit_log_entries 
WHERE event_type = 'email_changed'
    AND created_at > NOW() - INTERVAL '24 hours';

-- Grant permissions for security monitoring
GRANT SELECT ON public.security_monitoring TO service_role;
REVOKE ALL ON public.security_monitoring FROM PUBLIC;

-- =============================================
-- 14. SECURITY ALERTS
-- =============================================

-- Create function to check for security anomalies
CREATE OR REPLACE FUNCTION public.check_security_anomalies()
RETURNS TABLE (
    anomaly_type TEXT,
    severity TEXT,
    count BIGINT,
    details TEXT
) AS $$
BEGIN
    -- Set explicit search_path for security
    SET search_path = 'public', 'auth';
    
    -- Check for excessive failed login attempts
    RETURN QUERY
    SELECT 
        'excessive_failed_logins' as anomaly_type,
        'high' as severity,
        COUNT(*) as count,
        'Multiple failed login attempts detected' as details
    FROM auth.audit_log_entries 
    WHERE event_type = 'login_failed'
        AND created_at > NOW() - INTERVAL '1 hour'
    HAVING COUNT(*) > 10;
    
    -- Check for unusual login patterns
    RETURN QUERY
    SELECT 
        'unusual_login_patterns' as anomaly_type,
        'medium' as severity,
        COUNT(*) as count,
        'Unusual login time patterns detected' as details
    FROM auth.audit_log_entries 
    WHERE event_type = 'login_succeeded'
        AND EXTRACT(HOUR FROM created_at) NOT BETWEEN 6 AND 22
        AND created_at > NOW() - INTERVAL '24 hours'
    HAVING COUNT(*) > 5;
    
    -- Check for rapid password changes
    RETURN QUERY
    SELECT 
        'rapid_password_changes' as anomaly_type,
        'high' as severity,
        COUNT(*) as count,
        'Multiple password changes in short time' as details
    FROM auth.audit_log_entries 
    WHERE event_type = 'password_changed'
        AND created_at > NOW() - INTERVAL '1 hour'
    HAVING COUNT(*) > 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.check_security_anomalies() TO service_role;
REVOKE ALL ON FUNCTION public.check_security_anomalies() FROM PUBLIC;

-- =============================================
-- 15. SECURITY CONFIGURATION VERIFICATION
-- =============================================

-- Create function to verify security configuration
CREATE OR REPLACE FUNCTION public.verify_security_config()
RETURNS TABLE (
    config_item TEXT,
    status TEXT,
    current_value TEXT,
    recommended_value TEXT
) AS $$
BEGIN
    -- Set explicit search_path for security
    SET search_path = 'public', 'auth';
    
    -- Check password requirements
    RETURN QUERY
    SELECT 
        'password_min_length' as config_item,
        CASE WHEN (SELECT password_min_length FROM auth.config WHERE id = 'password') >= 8 
             THEN 'PASS' ELSE 'FAIL' END as status,
        (SELECT password_min_length::text FROM auth.config WHERE id = 'password') as current_value,
        '8' as recommended_value;
    
    -- Check session timeout
    RETURN QUERY
    SELECT 
        'session_timeout' as config_item,
        CASE WHEN (SELECT session_timeout FROM auth.config WHERE id = 'session') <= 3600 
             THEN 'PASS' ELSE 'FAIL' END as status,
        (SELECT session_timeout::text FROM auth.config WHERE id = 'session') as current_value,
        '3600' as recommended_value;
    
    -- Check rate limiting
    RETURN QUERY
    SELECT 
        'rate_limit_enabled' as config_item,
        CASE WHEN (SELECT rate_limit_requests_per_minute FROM auth.config WHERE id = 'rate_limit') IS NOT NULL 
             THEN 'PASS' ELSE 'FAIL' END as status,
        CASE WHEN (SELECT rate_limit_requests_per_minute FROM auth.config WHERE id = 'rate_limit') IS NOT NULL 
             THEN 'ENABLED' ELSE 'DISABLED' END as current_value,
        'ENABLED' as recommended_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.verify_security_config() TO service_role;
REVOKE ALL ON FUNCTION public.verify_security_config() FROM PUBLIC;

-- =============================================
-- 16. SECURITY NOTIFICATIONS
-- =============================================

-- Create function to send security notifications
CREATE OR REPLACE FUNCTION public.send_security_notification(
    notification_type TEXT,
    user_id UUID,
    message TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Set explicit search_path for security
    SET search_path = 'public', 'auth';
    
    -- Insert security notification
    INSERT INTO public.user_notifications (
        user_id,
        notification_type,
        title,
        message,
        created_at
    ) VALUES (
        user_id,
        'security_alert',
        'Security Alert: ' || notification_type,
        message,
        NOW()
    );
    
    -- Log the notification
    INSERT INTO public.audit_logs (
        event_type,
        user_id,
        details,
        created_at
    ) VALUES (
        'security_notification_sent',
        user_id,
        json_build_object(
            'notification_type', notification_type,
            'message', message
        ),
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.send_security_notification(TEXT, UUID, TEXT) TO service_role;
REVOKE ALL ON FUNCTION public.send_security_notification(TEXT, UUID, TEXT) FROM PUBLIC;

-- =============================================
-- 17. SECURITY CONFIGURATION COMPLETION
-- =============================================

-- Log the security configuration application
INSERT INTO public.audit_logs (
    event_type,
    user_id,
    details,
    created_at
) VALUES (
    'security_configuration_applied',
    NULL,
    '{"configurations": ["password_security", "session_security", "rate_limiting", "audit_logging", "brute_force_protection", "mfa", "api_security"], "timestamp": "' || NOW()::text || '"}',
    NOW()
);

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Supabase security configuration has been successfully applied.';
    RAISE NOTICE 'Security features enabled:';
    RAISE NOTICE '1. Password strength requirements';
    RAISE NOTICE '2. HaveIBeenPwned integration';
    RAISE NOTICE '3. Session security';
    RAISE NOTICE '4. Rate limiting';
    RAISE NOTICE '5. Audit logging';
    RAISE NOTICE '6. Brute force protection';
    RAISE NOTICE '7. Multi-factor authentication';
    RAISE NOTICE '8. API security';
    RAISE NOTICE '9. Security monitoring';
    RAISE NOTICE '10. Anomaly detection';
    RAISE NOTICE 'Run SELECT * FROM public.verify_security_config(); to verify the configuration.';
    RAISE NOTICE 'Run SELECT * FROM public.check_security_anomalies(); to check for security issues.';
END $$;
