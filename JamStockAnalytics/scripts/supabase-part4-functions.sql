-- =====================================================
-- PART 4: Database Functions (Run this fourth)
-- =====================================================

-- Function to get user's social sharing statistics
CREATE OR REPLACE FUNCTION get_user_social_stats(user_uuid UUID)
RETURNS TABLE (
  total_shares BIGINT,
  platform_breakdown JSONB,
  content_type_breakdown JSONB,
  recent_shares JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_shares,
    COALESCE(jsonb_object_agg(platform, platform_count) FILTER (WHERE platform IS NOT NULL), '{}'::jsonb) as platform_breakdown,
    COALESCE(jsonb_object_agg(content_type, content_type_count) FILTER (WHERE content_type IS NOT NULL), '{}'::jsonb) as content_type_breakdown,
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'platform', platform,
        'content_title', content_title,
        'shared_at', shared_at
      ) ORDER BY shared_at DESC
    ) FILTER (WHERE platform IS NOT NULL), '[]'::jsonb) as recent_shares
  FROM (
    SELECT 
      platform,
      content_type,
      content_title,
      shared_at,
      COUNT(*) OVER (PARTITION BY platform) as platform_count,
      COUNT(*) OVER (PARTITION BY content_type) as content_type_count
    FROM public.social_share_events 
    WHERE user_id = user_uuid
  ) stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update content performance analytics
CREATE OR REPLACE FUNCTION update_content_performance(
  content_type_param VARCHAR(50),
  content_id_param VARCHAR(255),
  activity_type_param VARCHAR(50)
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.content_performance_analytics (
    content_type, 
    content_id, 
    view_count, 
    share_count, 
    export_count,
    engagement_score
  )
  VALUES (
    content_type_param,
    content_id_param,
    CASE WHEN activity_type_param = 'view' THEN 1 ELSE 0 END,
    CASE WHEN activity_type_param = 'share' THEN 1 ELSE 0 END,
    CASE WHEN activity_type_param = 'export' THEN 1 ELSE 0 END,
    0.0
  )
  ON CONFLICT (content_type, content_id)
  DO UPDATE SET
    view_count = CASE 
      WHEN activity_type_param = 'view' THEN content_performance_analytics.view_count + 1
      ELSE content_performance_analytics.view_count
    END,
    share_count = CASE 
      WHEN activity_type_param = 'share' THEN content_performance_analytics.share_count + 1
      ELSE content_performance_analytics.share_count
    END,
    export_count = CASE 
      WHEN activity_type_param = 'export' THEN content_performance_analytics.export_count + 1
      ELSE content_performance_analytics.export_count
    END,
    engagement_score = (
      (content_performance_analytics.view_count + 
       CASE WHEN activity_type_param = 'view' THEN 1 ELSE 0 END) * 0.1 +
      (content_performance_analytics.share_count + 
       CASE WHEN activity_type_param = 'share' THEN 1 ELSE 0 END) * 0.5 +
      (content_performance_analytics.export_count + 
       CASE WHEN activity_type_param = 'export' THEN 1 ELSE 0 END) * 0.3
    ),
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired chart data cache
CREATE OR REPLACE FUNCTION cleanup_expired_chart_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.chart_data_cache 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
