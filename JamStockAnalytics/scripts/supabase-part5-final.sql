-- =====================================================
-- PART 5: Final Setup (Run this last)
-- =====================================================

-- Insert default chart designs data
INSERT INTO public.chart_data_cache (content_type, content_id, chart_type, chart_design, data, expires_at)
VALUES 
  ('system', 'default_designs', 'line', 'professional', 
   '{"colors": {"primary": "#1976D2", "secondary": "#42A5F5", "background": "#FFFFFF", "text": "#333333", "grid": "#E0E0E0"}}'::jsonb,
   NOW() + INTERVAL '1 year'),
  ('system', 'default_designs', 'line', 'minimalist',
   '{"colors": {"primary": "#2E2E2E", "secondary": "#666666", "background": "#FFFFFF", "text": "#000000", "grid": "#F0F0F0"}}'::jsonb,
   NOW() + INTERVAL '1 year'),
  ('system', 'default_designs', 'line', 'vibrant',
   '{"colors": {"primary": "#FF6B6B", "secondary": "#4ECDC4", "background": "#FFFFFF", "text": "#2C3E50", "grid": "#E8F4F8"}}'::jsonb,
   NOW() + INTERVAL '1 year')
ON CONFLICT (content_type, content_id, chart_type, chart_design) DO NOTHING;

-- Create view for social sharing analytics
CREATE OR REPLACE VIEW public.social_sharing_analytics AS
SELECT 
  u.id as user_id,
  u.email,
  COUNT(sse.id) as total_shares,
  COUNT(CASE WHEN sse.platform = 'twitter' THEN 1 END) as twitter_shares,
  COUNT(CASE WHEN sse.platform = 'facebook' THEN 1 END) as facebook_shares,
  COUNT(CASE WHEN sse.platform = 'linkedin' THEN 1 END) as linkedin_shares,
  COUNT(CASE WHEN sse.platform = 'whatsapp' THEN 1 END) as whatsapp_shares,
  COUNT(CASE WHEN sse.content_type = 'article' THEN 1 END) as article_shares,
  COUNT(CASE WHEN sse.content_type = 'ai_message' THEN 1 END) as ai_message_shares,
  COUNT(CASE WHEN sse.content_type = 'chart' THEN 1 END) as chart_shares,
  AVG(sse.reach_estimate) as avg_reach,
  AVG(sse.engagement_estimate) as avg_engagement,
  MAX(sse.shared_at) as last_share_date
FROM public.users u
LEFT JOIN public.social_share_events sse ON u.id = sse.user_id
GROUP BY u.id, u.email;

-- Create view for content performance analytics
CREATE OR REPLACE VIEW public.content_performance_view AS
SELECT 
  content_type,
  content_id,
  view_count,
  share_count,
  export_count,
  engagement_score,
  (view_count + share_count + export_count) as total_interactions,
  CASE 
    WHEN engagement_score > 8.0 THEN 'High'
    WHEN engagement_score > 5.0 THEN 'Medium'
    ELSE 'Low'
  END as performance_tier,
  last_updated,
  created_at
FROM public.content_performance_analytics
ORDER BY engagement_score DESC;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_share_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_social_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_chart_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profile_extensions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_activity_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.content_performance_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chart_data_cache TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_social_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_content_performance(VARCHAR, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_chart_cache() TO authenticated;

-- Grant view permissions
GRANT SELECT ON public.social_sharing_analytics TO authenticated;
GRANT SELECT ON public.content_performance_view TO authenticated;

-- Verification queries
SELECT 
  'Tables Created' as status,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'social_share_events',
  'user_social_preferences', 
  'user_chart_preferences',
  'chart_data_cache',
  'user_profile_extensions',
  'user_activity_analytics',
  'content_performance_analytics'
);

SELECT 
  'Functions Created' as status,
  COUNT(*) as count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_user_social_stats',
  'update_content_performance',
  'cleanup_expired_chart_cache'
);

SELECT 
  'Views Created' as status,
  COUNT(*) as count
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN (
  'social_sharing_analytics',
  'content_performance_view'
);
