-- =====================================================
-- PART 3: Row Level Security (Run this third)
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.social_share_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_social_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_chart_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_performance_analytics ENABLE ROW LEVEL SECURITY;

-- Social Share Events Policies
CREATE POLICY "Users can view own social share events" ON public.social_share_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social share events" ON public.social_share_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social share events" ON public.social_share_events
  FOR UPDATE USING (auth.uid() = user_id);

-- User Social Preferences Policies
CREATE POLICY "Users can view own social preferences" ON public.user_social_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social preferences" ON public.user_social_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social preferences" ON public.user_social_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- User Chart Preferences Policies
CREATE POLICY "Users can view own chart preferences" ON public.user_chart_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chart preferences" ON public.user_chart_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chart preferences" ON public.user_chart_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Chart Data Cache Policies (Public read, authenticated write)
CREATE POLICY "Anyone can view chart data cache" ON public.chart_data_cache
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert chart data cache" ON public.chart_data_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update chart data cache" ON public.chart_data_cache
  FOR UPDATE USING (auth.role() = 'authenticated');

-- User Profile Extensions Policies
CREATE POLICY "Users can view own profile extensions" ON public.user_profile_extensions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile extensions" ON public.user_profile_extensions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile extensions" ON public.user_profile_extensions
  FOR UPDATE USING (auth.uid() = user_id);

-- User Activity Analytics Policies
CREATE POLICY "Users can view own activity analytics" ON public.user_activity_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity analytics" ON public.user_activity_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Content Performance Analytics Policies (Public read, authenticated write)
CREATE POLICY "Anyone can view content performance analytics" ON public.content_performance_analytics
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert content performance analytics" ON public.content_performance_analytics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update content performance analytics" ON public.content_performance_analytics
  FOR UPDATE USING (auth.role() = 'authenticated');
