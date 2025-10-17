import { supabase } from '../supabase/client';

export interface SocialShareEvent {
  id: string;
  user_id: string;
  content_type: 'article' | 'ai_message' | 'chart' | 'analysis';
  content_id: string;
  platform: string;
  shared_at: string;
  success: boolean;
  error_message?: string;
  content_title: string;
  content_url?: string;
  hashtags_used?: string[];
  reach_estimate?: number;
  engagement_estimate?: number;
}

export interface SocialAnalytics {
  totalShares: number;
  platformBreakdown: Record<string, number>;
  contentTypeBreakdown: Record<string, number>;
  topSharedContent: Array<{
    title: string;
    shareCount: number;
    platforms: string[];
  }>;
  sharingTrends: Array<{
    date: string;
    shares: number;
    platforms: Record<string, number>;
  }>;
  userEngagement: {
    mostActiveUsers: Array<{
      userId: string;
      shareCount: number;
      platforms: string[];
    }>;
    averageSharesPerUser: number;
  };
}

export class SocialAnalyticsService {
  /**
   * Track a social share event
   */
  static async trackShare(event: Omit<SocialShareEvent, 'id' | 'shared_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('social_share_events')
        .insert({
          user_id: event.user_id,
          content_type: event.content_type,
          content_id: event.content_id,
          platform: event.platform,
          success: event.success,
          error_message: event.error_message,
          content_title: event.content_title,
          content_url: event.content_url,
          hashtags_used: event.hashtags_used,
          reach_estimate: event.reach_estimate,
          engagement_estimate: event.engagement_estimate,
        });

      if (error) {
        console.error('Error tracking social share:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error tracking social share:', error);
      return { success: false, error: 'Failed to track social share' };
    }
  }

  /**
   * Get comprehensive social analytics
   */
  static async getAnalytics(
    userId?: string,
    dateRange?: { start: string; end: string }
  ): Promise<{ data: SocialAnalytics | null; error: string | null }> {
    try {
      let query = supabase
        .from('social_share_events')
        .select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (dateRange) {
        query = query
          .gte('shared_at', dateRange.start)
          .lte('shared_at', dateRange.end);
      }

      const { data: events, error } = await query;

      if (error) {
        console.error('Error fetching social analytics:', error);
        return { data: null, error: error.message };
      }

      if (!events || events.length === 0) {
        return {
          data: {
            totalShares: 0,
            platformBreakdown: {},
            contentTypeBreakdown: {},
            topSharedContent: [],
            sharingTrends: [],
            userEngagement: {
              mostActiveUsers: [],
              averageSharesPerUser: 0,
            },
          },
          error: null,
        };
      }

      // Calculate analytics
      const analytics: SocialAnalytics = {
        totalShares: events.length,
        platformBreakdown: this.calculatePlatformBreakdown(events),
        contentTypeBreakdown: this.calculateContentTypeBreakdown(events),
        topSharedContent: this.calculateTopSharedContent(events),
        sharingTrends: this.calculateSharingTrends(events),
        userEngagement: this.calculateUserEngagement(events),
      };

      return { data: analytics, error: null };
    } catch (error) {
      console.error('Unexpected error getting social analytics:', error);
      return { data: null, error: 'Failed to get social analytics' };
    }
  }

  /**
   * Get sharing statistics for a specific content item
   */
  static async getContentShareStats(contentId: string): Promise<{
    data: {
      totalShares: number;
      platforms: Record<string, number>;
      recentShares: SocialShareEvent[];
      engagement: {
        reach: number;
        estimatedEngagement: number;
      };
    } | null;
    error: string | null;
  }> {
    try {
      const { data: events, error } = await supabase
        .from('social_share_events')
        .select('*')
        .eq('content_id', contentId)
        .order('shared_at', { ascending: false });

      if (error) {
        console.error('Error fetching content share stats:', error);
        return { data: null, error: error.message };
      }

      if (!events || events.length === 0) {
        return {
          data: {
            totalShares: 0,
            platforms: {},
            recentShares: [],
            engagement: { reach: 0, estimatedEngagement: 0 },
          },
          error: null,
        };
      }

      const platforms = this.calculatePlatformBreakdown(events);
      const totalReach = events.reduce((sum, event) => sum + (event.reach_estimate || 0), 0);
      const totalEngagement = events.reduce((sum, event) => sum + (event.engagement_estimate || 0), 0);

      return {
        data: {
          totalShares: events.length,
          platforms,
          recentShares: events.slice(0, 10),
          engagement: {
            reach: totalReach,
            estimatedEngagement: totalEngagement,
          },
        },
        error: null,
      };
    } catch (error) {
      console.error('Unexpected error getting content share stats:', error);
      return { data: null, error: 'Failed to get content share stats' };
    }
  }

  /**
   * Get user's sharing preferences and patterns
   */
  static async getUserSharingPatterns(userId: string): Promise<{
    data: {
      preferredPlatforms: string[];
      preferredContentTypes: string[];
      sharingFrequency: number;
      bestPerformingContent: Array<{
        title: string;
        shareCount: number;
        platforms: string[];
      }>;
      sharingTrends: Array<{
        date: string;
        shares: number;
      }>;
    } | null;
    error: string | null;
  }> {
    try {
      const { data: events, error } = await supabase
        .from('social_share_events')
        .select('*')
        .eq('user_id', userId)
        .order('shared_at', { ascending: false });

      if (error) {
        console.error('Error fetching user sharing patterns:', error);
        return { data: null, error: error.message };
      }

      if (!events || events.length === 0) {
        return {
          data: {
            preferredPlatforms: [],
            preferredContentTypes: [],
            sharingFrequency: 0,
            bestPerformingContent: [],
            sharingTrends: [],
          },
          error: null,
        };
      }

      const platformCounts = this.calculatePlatformBreakdown(events);
      const contentTypeCounts = this.calculateContentTypeBreakdown(events);

      const preferredPlatforms = Object.entries(platformCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([platform]) => platform);

      const preferredContentTypes = Object.entries(contentTypeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([type]) => type);

      const sharingFrequency = events.length / 30; // Average per day over last 30 days

      const bestPerformingContent = this.calculateTopSharedContent(events).slice(0, 5);

      const sharingTrends = this.calculateSharingTrends(events);

      return {
        data: {
          preferredPlatforms,
          preferredContentTypes,
          sharingFrequency,
          bestPerformingContent,
          sharingTrends,
        },
        error: null,
      };
    } catch (error) {
      console.error('Unexpected error getting user sharing patterns:', error);
      return { data: null, error: 'Failed to get user sharing patterns' };
    }
  }

  /**
   * Calculate platform breakdown from events
   */
  private static calculatePlatformBreakdown(events: SocialShareEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.platform] = (acc[event.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Calculate content type breakdown from events
   */
  private static calculateContentTypeBreakdown(events: SocialShareEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.content_type] = (acc[event.content_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Calculate top shared content
   */
  private static calculateTopSharedContent(events: SocialShareEvent[]): Array<{
    title: string;
    shareCount: number;
    platforms: string[];
  }> {
    const contentMap = new Map<string, {
      title: string;
      shareCount: number;
      platforms: Set<string>;
    }>();

    events.forEach(event => {
      const key = event.content_id;
      if (!contentMap.has(key)) {
        contentMap.set(key, {
          title: event.content_title,
          shareCount: 0,
          platforms: new Set(),
        });
      }

      const content = contentMap.get(key)!;
      content.shareCount++;
      content.platforms.add(event.platform);
    });

    return Array.from(contentMap.values())
      .map(content => ({
        title: content.title,
        shareCount: content.shareCount,
        platforms: Array.from(content.platforms),
      }))
      .sort((a, b) => b.shareCount - a.shareCount)
      .slice(0, 10);
  }

  /**
   * Calculate sharing trends over time
   */
  private static calculateSharingTrends(events: SocialShareEvent[]): Array<{
    date: string;
    shares: number;
    platforms: Record<string, number>;
  }> {
    const trends = new Map<string, {
      shares: number;
      platforms: Record<string, number>;
    }>();

    events.forEach(event => {
      const date = event.shared_at.split('T')[0];
      if (!trends.has(date)) {
        trends.set(date, { shares: 0, platforms: {} });
      }

      const trend = trends.get(date)!;
      trend.shares++;
      trend.platforms[event.platform] = (trend.platforms[event.platform] || 0) + 1;
    });

    return Array.from(trends.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calculate user engagement metrics
   */
  private static calculateUserEngagement(events: SocialShareEvent[]): {
    mostActiveUsers: Array<{
      userId: string;
      shareCount: number;
      platforms: string[];
    }>;
    averageSharesPerUser: number;
  } {
    const userMap = new Map<string, {
      shareCount: number;
      platforms: Set<string>;
    }>();

    events.forEach(event => {
      if (!userMap.has(event.user_id)) {
        userMap.set(event.user_id, {
          shareCount: 0,
          platforms: new Set(),
        });
      }

      const user = userMap.get(event.user_id)!;
      user.shareCount++;
      user.platforms.add(event.platform);
    });

    const mostActiveUsers = Array.from(userMap.entries())
      .map(([userId, data]) => ({
        userId,
        shareCount: data.shareCount,
        platforms: Array.from(data.platforms),
      }))
      .sort((a, b) => b.shareCount - a.shareCount)
      .slice(0, 10);

    const totalUsers = userMap.size;
    const totalShares = events.length;
    const averageSharesPerUser = totalUsers > 0 ? totalShares / totalUsers : 0;

    return {
      mostActiveUsers,
      averageSharesPerUser,
    };
  }
}
