// Database Types for Financial News Analyzer App
// Generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          created_at: string;
          updated_at: string;
          preferences: Record<string, any>;
          subscription_tier: 'free' | 'premium' | 'enterprise';
          last_active: string | null;
          profile_image_url: string | null;
          is_active: boolean;
          timezone: string;
          notification_preferences: Record<string, any>;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          created_at?: string;
          updated_at?: string;
          preferences?: Record<string, any>;
          subscription_tier?: 'free' | 'premium' | 'enterprise';
          last_active?: string | null;
          profile_image_url?: string | null;
          is_active?: boolean;
          timezone?: string;
          notification_preferences?: Record<string, any>;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          created_at?: string;
          updated_at?: string;
          preferences?: Record<string, any>;
          subscription_tier?: 'free' | 'premium' | 'enterprise';
          last_active?: string | null;
          profile_image_url?: string | null;
          is_active?: boolean;
          timezone?: string;
          notification_preferences?: Record<string, any>;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          bio: string | null;
          investment_experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
          risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
          investment_goals: string[] | null;
          portfolio_size_range: string | null;
          preferred_sectors: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio?: string | null;
          investment_experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
          risk_tolerance?: 'conservative' | 'moderate' | 'aggressive';
          investment_goals?: string[] | null;
          portfolio_size_range?: string | null;
          preferred_sectors?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string | null;
          investment_experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
          risk_tolerance?: 'conservative' | 'moderate' | 'aggressive';
          investment_goals?: string[] | null;
          portfolio_size_range?: string | null;
          preferred_sectors?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      news_sources: {
        Row: {
          id: string;
          name: string;
          base_url: string;
          rss_feed_url: string | null;
          api_endpoint: string | null;
          scraping_config: Record<string, any>;
          is_active: boolean;
          priority_score: number;
          last_scraped: string | null;
          scraping_frequency_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          base_url: string;
          rss_feed_url?: string | null;
          api_endpoint?: string | null;
          scraping_config?: Record<string, any>;
          is_active?: boolean;
          priority_score?: number;
          last_scraped?: string | null;
          scraping_frequency_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          base_url?: string;
          rss_feed_url?: string | null;
          api_endpoint?: string | null;
          scraping_config?: Record<string, any>;
          is_active?: boolean;
          priority_score?: number;
          last_scraped?: string | null;
          scraping_frequency_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      articles: {
        Row: {
          id: string;
          headline: string;
          source: string;
          source_id: string | null;
          url: string;
          content: string | null;
          excerpt: string | null;
          publication_date: string;
          scraped_at: string;
          ai_priority_score: number | null;
          ai_summary: string | null;
          sentiment_score: number | null;
          relevance_score: number | null;
          company_tickers: string[] | null;
          tags: string[] | null;
          is_processed: boolean;
          processing_status: 'pending' | 'processing' | 'completed' | 'failed';
          ai_analysis_data: Record<string, any>;
          word_count: number | null;
          reading_time_minutes: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          headline: string;
          source: string;
          source_id?: string | null;
          url: string;
          content?: string | null;
          excerpt?: string | null;
          publication_date: string;
          scraped_at?: string;
          ai_priority_score?: number | null;
          ai_summary?: string | null;
          sentiment_score?: number | null;
          relevance_score?: number | null;
          company_tickers?: string[] | null;
          tags?: string[] | null;
          is_processed?: boolean;
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
          ai_analysis_data?: Record<string, any>;
          word_count?: number | null;
          reading_time_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          headline?: string;
          source?: string;
          source_id?: string | null;
          url?: string;
          content?: string | null;
          excerpt?: string | null;
          publication_date?: string;
          scraped_at?: string;
          ai_priority_score?: number | null;
          ai_summary?: string | null;
          sentiment_score?: number | null;
          relevance_score?: number | null;
          company_tickers?: string[] | null;
          tags?: string[] | null;
          is_processed?: boolean;
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
          ai_analysis_data?: Record<string, any>;
          word_count?: number | null;
          reading_time_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      company_tickers: {
        Row: {
          id: string;
          ticker: string;
          company_name: string;
          exchange: 'JSE' | 'Junior' | 'Other';
          sector: string | null;
          industry: string | null;
          market_cap: number | null;
          is_active: boolean;
          description: string | null;
          website_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticker: string;
          company_name: string;
          exchange: 'JSE' | 'Junior' | 'Other';
          sector?: string | null;
          industry?: string | null;
          market_cap?: number | null;
          is_active?: boolean;
          description?: string | null;
          website_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticker?: string;
          company_name?: string;
          exchange?: 'JSE' | 'Junior' | 'Other';
          sector?: string | null;
          industry?: string | null;
          market_cap?: number | null;
          is_active?: boolean;
          description?: string | null;
          website_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      article_companies: {
        Row: {
          id: string;
          article_id: string;
          company_id: string;
          relevance_score: number | null;
          mention_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          company_id: string;
          relevance_score?: number | null;
          mention_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          company_id?: string;
          relevance_score?: number | null;
          mention_count?: number;
          created_at?: string;
        };
      };
      user_saved_articles: {
        Row: {
          id: string;
          user_id: string;
          article_id: string;
          saved_at: string;
          notes: string | null;
          tags: string[] | null;
          is_archived: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id: string;
          saved_at?: string;
          notes?: string | null;
          tags?: string[] | null;
          is_archived?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_id?: string;
          saved_at?: string;
          notes?: string | null;
          tags?: string[] | null;
          is_archived?: boolean;
        };
      };
      user_article_interactions: {
        Row: {
          id: string;
          user_id: string;
          article_id: string;
          interaction_type: 'view' | 'like' | 'share' | 'bookmark';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id: string;
          interaction_type: 'view' | 'like' | 'share' | 'bookmark';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_id?: string;
          interaction_type?: 'view' | 'like' | 'share' | 'bookmark';
          created_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_name: string | null;
          is_active: boolean;
          started_at: string;
          ended_at: string | null;
          total_messages: number;
          session_context: Record<string, any>;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_name?: string | null;
          is_active?: boolean;
          started_at?: string;
          ended_at?: string | null;
          total_messages?: number;
          session_context?: Record<string, any>;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_name?: string | null;
          is_active?: boolean;
          started_at?: string;
          ended_at?: string | null;
          total_messages?: number;
          session_context?: Record<string, any>;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          message_type: 'user' | 'ai' | 'system';
          content: string;
          context_data: Record<string, any>;
          created_at: string;
          is_analysis_context: boolean;
          tokens_used: number;
          response_time_ms: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          message_type: 'user' | 'ai' | 'system';
          content: string;
          context_data?: Record<string, any>;
          created_at?: string;
          is_analysis_context?: boolean;
          tokens_used?: number;
          response_time_ms?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          message_type?: 'user' | 'ai' | 'system';
          content?: string;
          context_data?: Record<string, any>;
          created_at?: string;
          is_analysis_context?: boolean;
          tokens_used?: number;
          response_time_ms?: number | null;
        };
      };
      analysis_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_name: string | null;
          session_type: 'bullish_thesis' | 'bearish_thesis' | 'event_analysis' | 'company_comparison' | 'sector_analysis' | 'market_research' | null;
          started_at: string;
          completed_at: string | null;
          duration_minutes: number | null;
          notes: string | null;
          key_takeaways: string[] | null;
          articles_analyzed: string[] | null;
          companies_analyzed: string[] | null;
          session_data: Record<string, any>;
          is_completed: boolean;
          completion_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_name?: string | null;
          session_type?: 'bullish_thesis' | 'bearish_thesis' | 'event_analysis' | 'company_comparison' | 'sector_analysis' | 'market_research' | null;
          started_at?: string;
          completed_at?: string | null;
          duration_minutes?: number | null;
          notes?: string | null;
          key_takeaways?: string[] | null;
          articles_analyzed?: string[] | null;
          companies_analyzed?: string[] | null;
          session_data?: Record<string, any>;
          is_completed?: boolean;
          completion_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_name?: string | null;
          session_type?: 'bullish_thesis' | 'bearish_thesis' | 'event_analysis' | 'company_comparison' | 'sector_analysis' | 'market_research' | null;
          started_at?: string;
          completed_at?: string | null;
          duration_minutes?: number | null;
          notes?: string | null;
          key_takeaways?: string[] | null;
          articles_analyzed?: string[] | null;
          companies_analyzed?: string[] | null;
          session_data?: Record<string, any>;
          is_completed?: boolean;
          completion_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      analysis_notes: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          note_type: 'observation' | 'insight' | 'question' | 'conclusion' | 'action_item' | null;
          content: string;
          related_article_id: string | null;
          related_company_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          note_type?: 'observation' | 'insight' | 'question' | 'conclusion' | 'action_item' | null;
          content: string;
          related_article_id?: string | null;
          related_company_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          note_type?: 'observation' | 'insight' | 'question' | 'conclusion' | 'action_item' | null;
          content?: string;
          related_article_id?: string | null;
          related_company_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      market_data: {
        Row: {
          id: string;
          ticker: string | null;
          date: string;
          open_price: number | null;
          high_price: number | null;
          low_price: number | null;
          close_price: number | null;
          volume: number | null;
          market_cap: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticker?: string | null;
          date: string;
          open_price?: number | null;
          high_price?: number | null;
          low_price?: number | null;
          close_price?: number | null;
          volume?: number | null;
          market_cap?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticker?: string | null;
          date?: string;
          open_price?: number | null;
          high_price?: number | null;
          low_price?: number | null;
          close_price?: number | null;
          volume?: number | null;
          market_cap?: number | null;
          created_at?: string;
        };
      };
      market_insights: {
        Row: {
          id: string;
          insight_type: 'daily_summary' | 'sector_analysis' | 'market_trend' | 'economic_indicator' | null;
          title: string;
          content: string;
          ai_generated: boolean;
          confidence_score: number | null;
          related_tickers: string[] | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          insight_type?: 'daily_summary' | 'sector_analysis' | 'market_trend' | 'economic_indicator' | null;
          title: string;
          content: string;
          ai_generated?: boolean;
          confidence_score?: number | null;
          related_tickers?: string[] | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          insight_type?: 'daily_summary' | 'sector_analysis' | 'market_trend' | 'economic_indicator' | null;
          title?: string;
          content?: string;
          ai_generated?: boolean;
          confidence_score?: number | null;
          related_tickers?: string[] | null;
          created_at?: string;
          expires_at?: string | null;
        };
      };
      user_notifications: {
        Row: {
          id: string;
          user_id: string;
          notification_type: 'high_priority_news' | 'market_alert' | 'analysis_complete' | 'system_update';
          title: string;
          message: string;
          is_read: boolean;
          action_url: string | null;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          notification_type: 'high_priority_news' | 'market_alert' | 'analysis_complete' | 'system_update';
          title: string;
          message: string;
          is_read?: boolean;
          action_url?: string | null;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          notification_type?: 'high_priority_news' | 'market_alert' | 'analysis_complete' | 'system_update';
          title?: string;
          message?: string;
          is_read?: boolean;
          action_url?: string | null;
          created_at?: string;
          read_at?: string | null;
        };
      };
      user_alert_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          alert_type: 'company_news' | 'sector_updates' | 'market_movements' | 'ai_insights';
          target_tickers: string[] | null;
          target_sectors: string[] | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          alert_type: 'company_news' | 'sector_updates' | 'market_movements' | 'ai_insights';
          target_tickers?: string[] | null;
          target_sectors?: string[] | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          alert_type?: 'company_news' | 'sector_updates' | 'market_movements' | 'ai_insights';
          target_tickers?: string[] | null;
          target_sectors?: string[] | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      articles_with_companies: {
        Row: {
          id: string;
          headline: string;
          source: string;
          source_id: string | null;
          url: string;
          content: string | null;
          excerpt: string | null;
          publication_date: string;
          scraped_at: string;
          ai_priority_score: number | null;
          ai_summary: string | null;
          sentiment_score: number | null;
          relevance_score: number | null;
          company_tickers: string[] | null;
          tags: string[] | null;
          is_processed: boolean;
          processing_status: 'pending' | 'processing' | 'completed' | 'failed';
          ai_analysis_data: Record<string, any>;
          word_count: number | null;
          reading_time_minutes: number | null;
          created_at: string;
          updated_at: string;
          company_names: string[] | null;
          company_sectors: string[] | null;
        };
      };
      user_analysis_summary: {
        Row: {
          user_id: string;
          full_name: string;
          total_sessions: number;
          completed_sessions: number;
          avg_session_duration: number | null;
          last_analysis_date: string | null;
        };
      };
      popular_articles: {
        Row: {
          id: string;
          headline: string;
          source: string;
          source_id: string | null;
          url: string;
          content: string | null;
          excerpt: string | null;
          publication_date: string;
          scraped_at: string;
          ai_priority_score: number | null;
          ai_summary: string | null;
          sentiment_score: number | null;
          relevance_score: number | null;
          company_tickers: string[] | null;
          tags: string[] | null;
          is_processed: boolean;
          processing_status: 'pending' | 'processing' | 'completed' | 'failed';
          ai_analysis_data: Record<string, any>;
          word_count: number | null;
          reading_time_minutes: number | null;
          created_at: string;
          updated_at: string;
          interaction_count: number;
          view_count: number;
          like_count: number;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Specific table types
export type User = Tables<'users'>;
export type UserProfile = Tables<'user_profiles'>;
export type Article = Tables<'articles'>;
export type CompanyTicker = Tables<'company_tickers'>;
export type ChatSession = Tables<'chat_sessions'>;
export type ChatMessage = Tables<'chat_messages'>;
export type AnalysisSession = Tables<'analysis_sessions'>;
export type AnalysisNote = Tables<'analysis_notes'>;
export type MarketData = Tables<'market_data'>;
export type UserNotification = Tables<'user_notifications'>;

// View types
export type ArticleWithCompanies = Database['public']['Views']['articles_with_companies']['Row'];
export type UserAnalysisSummary = Database['public']['Views']['user_analysis_summary']['Row'];
export type PopularArticle = Database['public']['Views']['popular_articles']['Row'];

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type ArticleInsert = Database['public']['Tables']['articles']['Insert'];
export type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert'];
export type AnalysisSessionInsert = Database['public']['Tables']['analysis_sessions']['Insert'];

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type ArticleUpdate = Database['public']['Tables']['articles']['Update'];
export type ChatMessageUpdate = Database['public']['Tables']['chat_messages']['Update'];
export type AnalysisSessionUpdate = Database['public']['Tables']['analysis_sessions']['Update'];

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// AI Analysis types
export interface AIAnalysisResult {
  priority_score: number;
  summary: string;
  key_points: string[];
  market_impact: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  recommendations: string[];
}

export interface AIChatResponse {
  message: string;
  suggestions: string[];
  related_topics: string[];
}

// Search and filter types
export interface ArticleFilters {
  dateFrom?: string;
  dateTo?: string;
  sources?: string[];
  tickers?: string[];
  minPriorityScore?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  tags?: string[];
}

export interface SearchOptions {
  query?: string;
  filters?: ArticleFilters;
  sortBy?: 'priority' | 'date' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Analysis session types
export interface AnalysisSessionData {
  template?: string;
  focus_areas?: string[];
  target_companies?: string[];
  target_articles?: string[];
  notes?: string;
  conclusions?: string[];
  action_items?: string[];
}

// User blocking types
export interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  reason: 'harassment' | 'spam' | 'inappropriate_content' | 'misinformation' | 'other';
  reason_details?: string;
  is_active: boolean;
  blocked_at: string;
  unblocked_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlockedUser {
  blocked_user_id: string;
  blocked_user_name: string;
  blocked_user_email: string;
  reason: string;
  blocked_at: string;
  expires_at?: string;
}

// Comment types
export interface Comment {
  comment_id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
  like_count: number;
  reply_count: number;
}

export interface CommentInteraction {
  id: string;
  comment_id: string;
  user_id: string;
  interaction_type: 'like' | 'report' | 'flag';
  reason?: string;
  created_at: string;
}

// Notification types
export interface NotificationData {
  type: 'high_priority_news' | 'market_alert' | 'analysis_complete' | 'system_update';
  title: string;
  message: string;
  actionUrl?: string;
  userId: string;
}

// Market data types
export interface MarketDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  marketCap?: number;
}

export interface CompanyPerformance {
  ticker: string;
  companyName: string;
  currentPrice: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
}
