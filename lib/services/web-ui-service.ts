import { supabase } from '../supabase/client';

export interface WebUIPreferences {
  id?: string;
  user_id?: string;
  theme: 'light' | 'dark' | 'auto';
  layout_mode: 'standard' | 'lightweight' | 'minimal';
  data_saver: boolean;
  auto_refresh: boolean;
  refresh_interval: number;
  max_articles_per_page: number;
  enable_images: boolean;
  enable_animations: boolean;
  compact_mode: boolean;
  font_size: 'small' | 'medium' | 'large';
  color_scheme: 'default' | 'high_contrast' | 'colorblind_friendly';
  performance_mode: 'standard' | 'optimized' | 'ultra_light';
  created_at?: string;
  updated_at?: string;
}

export interface WebPerformanceMetrics {
  id?: string;
  user_id?: string;
  session_id: string;
  page_load_time_ms: number;
  total_data_transferred_bytes: number;
  network_type?: string;
  device_type?: string;
  browser_info?: Record<string, any>;
  performance_score: number;
  optimization_level?: string;
  created_at?: string;
}

export interface WebCacheConfig {
  id?: string;
  cache_key: string;
  cache_type: 'articles' | 'market_data' | 'user_data' | 'static_content';
  content_hash?: string;
  expires_at?: string;
  is_compressed: boolean;
  compression_type: string;
  size_bytes?: number;
  hit_count: number;
  last_accessed?: string;
  created_at?: string;
  updated_at?: string;
}

class WebUIService {
  /**
   * Get user's web UI preferences
   */
  async getUIPreferences(): Promise<WebUIPreferences | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('web_ui_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error getting UI preferences:', error);
      return null;
    }
  }

  /**
   * Update or create user's web UI preferences
   */
  async updateUIPreferences(preferences: Partial<WebUIPreferences>): Promise<WebUIPreferences> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('web_ui_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating UI preferences:', error);
      throw error;
    }
  }

  /**
   * Get default lightweight preferences
   */
  getDefaultLightweightPreferences(): WebUIPreferences {
    return {
      theme: 'light',
      layout_mode: 'lightweight',
      data_saver: true,
      auto_refresh: false,
      refresh_interval: 300, // 5 minutes
      max_articles_per_page: 10,
      enable_images: false,
      enable_animations: false,
      compact_mode: true,
      font_size: 'medium',
      color_scheme: 'default',
      performance_mode: 'optimized',
    };
  }

  /**
   * Record performance metrics
   */
  async recordPerformanceMetrics(metrics: Partial<WebPerformanceMetrics>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return; // Don't record metrics for anonymous users
      }

      const { error } = await supabase
        .from('web_performance_metrics')
        .insert({
          user_id: user.id,
          session_id: metrics.session_id || this.generateSessionId(),
          page_load_time_ms: metrics.page_load_time_ms || 0,
          total_data_transferred_bytes: metrics.total_data_transferred_bytes || 0,
          network_type: this.detectNetworkType(),
          device_type: this.detectDeviceType(),
          browser_info: this.getBrowserInfo(),
          performance_score: metrics.performance_score || 0,
          optimization_level: metrics.optimization_level || 'standard',
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error recording performance metrics:', error);
      // Don't throw - performance metrics shouldn't break the app
    }
  }

  /**
   * Get cached content
   */
  async getCachedContent(cacheKey: string, cacheType: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('web_cache_config')
        .select('*')
        .eq('cache_key', cacheKey)
        .eq('cache_type', cacheType)
        .single();

      if (error || !data) {
        return null;
      }

      // Check if cache has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        // Delete expired cache
        await this.deleteCachedContent(cacheKey);
        return null;
      }

      // Update hit count
      await supabase
        .from('web_cache_config')
        .update({
          hit_count: data.hit_count + 1,
          last_accessed: new Date().toISOString(),
        })
        .eq('cache_key', cacheKey);

      return data;
    } catch (error) {
      console.error('Error getting cached content:', error);
      return null;
    }
  }

  /**
   * Set cached content
   */
  async setCachedContent(
    cacheKey: string,
    cacheType: string,
    contentHash: string,
    sizeBytes: number,
    expiresAt?: Date
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('web_cache_config')
        .upsert({
          cache_key: cacheKey,
          cache_type: cacheType,
          content_hash: contentHash,
          expires_at: expiresAt?.toISOString(),
          is_compressed: true,
          compression_type: 'gzip',
          size_bytes: sizeBytes,
          hit_count: 0,
          last_accessed: new Date().toISOString(),
        }, { onConflict: 'cache_key' });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error setting cached content:', error);
    }
  }

  /**
   * Delete cached content
   */
  async deleteCachedContent(cacheKey: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('web_cache_config')
        .delete()
        .eq('cache_key', cacheKey);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting cached content:', error);
    }
  }

  /**
   * Calculate performance score based on metrics
   */
  calculatePerformanceScore(
    loadTime: number,
    dataTransferred: number,
    networkType?: string
  ): number {
    let score = 100;

    // Deduct points for slow load times
    if (loadTime > 3000) score -= 30; // > 3 seconds
    else if (loadTime > 2000) score -= 20; // > 2 seconds
    else if (loadTime > 1000) score -= 10; // > 1 second

    // Deduct points for high data usage
    if (dataTransferred > 1000000) score -= 25; // > 1MB
    else if (dataTransferred > 500000) score -= 15; // > 500KB
    else if (dataTransferred > 100000) score -= 5; // > 100KB

    // Adjust for network type
    if (networkType === 'slow-2g' || networkType === '2g') {
      score -= 10;
    } else if (networkType === '3g') {
      score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Detect network type
   */
  private detectNetworkType(): string {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection?.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  /**
   * Detect device type
   */
  private detectDeviceType(): string {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;
      if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        return 'mobile';
      } else if (/Tablet|iPad/.test(userAgent)) {
        return 'tablet';
      }
      return 'desktop';
    }
    return 'unknown';
  }

  /**
   * Get browser information
   */
  private getBrowserInfo(): Record<string, any> {
    if (typeof window !== 'undefined') {
      return {
        userAgent: window.navigator.userAgent,
        language: window.navigator.language,
        platform: window.navigator.platform,
        cookieEnabled: window.navigator.cookieEnabled,
        onLine: window.navigator.onLine,
      };
    }
    return {};
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Optimize content for lightweight mode
   */
  optimizeContentForLightweight(content: any): any {
    if (!content) return content;

    // Remove large images and media
    if (typeof content === 'object') {
      const optimized = { ...content };
      
      // Remove image URLs
      delete optimized.image_url;
      delete optimized.thumbnail_url;
      delete optimized.media_url;
      
      // Truncate long text content
      if (optimized.content && optimized.content.length > 500) {
        optimized.content = optimized.content.substring(0, 500) + '...';
      }
      
      // Limit array sizes
      if (Array.isArray(optimized.tags) && optimized.tags.length > 5) {
        optimized.tags = optimized.tags.slice(0, 5);
      }
      
      return optimized;
    }

    return content;
  }
}

export const webUIService = new WebUIService();
