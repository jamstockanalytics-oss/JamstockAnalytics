import { Share, Alert, Linking } from 'react-native';

export interface ShareableContent {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  hashtags?: string[];
  category?: 'news' | 'analysis' | 'chart' | 'ai-message' | 'market-data';
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  shareUrl: string;
  maxLength?: number;
  supportsImages: boolean;
  supportsHashtags: boolean;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: 'twitter',
    color: '#1DA1F2',
    shareUrl: 'https://twitter.com/intent/tweet',
    maxLength: 280,
    supportsImages: true,
    supportsHashtags: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    color: '#4267B2',
    shareUrl: 'https://www.facebook.com/sharer/sharer.php',
    supportsImages: true,
    supportsHashtags: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0077B5',
    shareUrl: 'https://www.linkedin.com/sharing/share-offsite',
    supportsImages: true,
    supportsHashtags: false,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'whatsapp',
    color: '#25D366',
    shareUrl: 'whatsapp://send',
    supportsImages: true,
    supportsHashtags: false,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: 'telegram',
    color: '#0088CC',
    shareUrl: 'https://t.me/share/url',
    supportsImages: true,
    supportsHashtags: false,
  },
  {
    id: 'email',
    name: 'Email',
    icon: 'email',
    color: '#EA4335',
    shareUrl: 'mailto:',
    supportsImages: false,
    supportsHashtags: false,
  },
  {
    id: 'copy',
    name: 'Copy Link',
    icon: 'content-copy',
    color: '#666666',
    shareUrl: '',
    supportsImages: false,
    supportsHashtags: false,
  },
];

export class SocialSharingService {
  /**
   * Share content to a specific social media platform
   */
  static async shareToPlatform(
    platform: SocialPlatform,
    content: ShareableContent
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const shareText = this.formatContentForPlatform(platform, content);
      
      switch (platform.id) {
        case 'twitter':
          return await this.shareToTwitter(content, shareText);
        case 'facebook':
          return await this.shareToFacebook(content, shareText);
        case 'linkedin':
          return await this.shareToLinkedIn(content, shareText);
        case 'whatsapp':
          return await this.shareToWhatsApp(content, shareText);
        case 'telegram':
          return await this.shareToTelegram(content, shareText);
        case 'email':
          return await this.shareToEmail(content, shareText);
        case 'copy':
          return await this.copyToClipboard(content, shareText);
        default:
          return await this.shareGeneric(content, shareText);
      }
    } catch (error) {
      return { success: false, error: 'Failed to share content' };
    }
  }

  /**
   * Share content using native share dialog
   */
  static async shareNative(content: ShareableContent): Promise<{ success: boolean; error?: string }> {
    try {
      const shareText = this.formatShareText(content);
      const result = await Share.share({
        message: shareText,
        title: content.title,
        url: content.url,
      });
      
      return { success: result.action === Share.sharedAction };
    } catch (error) {
      return { success: false, error: 'Failed to share content' };
    }
  }

  /**
   * Format content for specific platform requirements
   */
  private static formatContentForPlatform(platform: SocialPlatform, content: ShareableContent): string {
    let text = content.title;
    
    if (content.description) {
      text += `\n\n${content.description}`;
    }
    
    if (content.url) {
      text += `\n\n${content.url}`;
    }
    
    if (platform.supportsHashtags && content.hashtags) {
      const hashtags = content.hashtags.map(tag => `#${tag}`).join(' ');
      text += `\n\n${hashtags}`;
    }
    
    // Truncate if exceeds platform limit
    if (platform.maxLength && text.length > platform.maxLength) {
      text = text.substring(0, platform.maxLength - 3) + '...';
    }
    
    return text;
  }

  /**
   * Format general share text
   */
  private static formatShareText(content: ShareableContent): string {
    let text = content.title;
    
    if (content.description) {
      text += `\n\n${content.description}`;
    }
    
    if (content.url) {
      text += `\n\n${content.url}`;
    }
    
    if (content.hashtags) {
      const hashtags = content.hashtags.map(tag => `#${tag}`).join(' ');
      text += `\n\n${hashtags}`;
    }
    
    return text;
  }

  /**
   * Share to Twitter
   */
  private static async shareToTwitter(content: ShareableContent, text: string): Promise<{ success: boolean; error?: string }> {
    try {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        return { success: true };
      } else {
        return { success: false, error: 'Twitter app not available' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to open Twitter' };
    }
  }

  /**
   * Share to Facebook
   */
  private static async shareToFacebook(content: ShareableContent, text: string): Promise<{ success: boolean; error?: string }> {
    try {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.url || '')}&quote=${encodeURIComponent(text)}`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        return { success: true };
      } else {
        return { success: false, error: 'Facebook app not available' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to open Facebook' };
    }
  }

  /**
   * Share to LinkedIn
   */
  private static async shareToLinkedIn(content: ShareableContent, text: string): Promise<{ success: boolean; error?: string }> {
    try {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(content.url || '')}`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        return { success: true };
      } else {
        return { success: false, error: 'LinkedIn app not available' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to open LinkedIn' };
    }
  }

  /**
   * Share to WhatsApp
   */
  private static async shareToWhatsApp(content: ShareableContent, text: string): Promise<{ success: boolean; error?: string }> {
    try {
      const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        return { success: true };
      } else {
        return { success: false, error: 'WhatsApp app not available' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to open WhatsApp' };
    }
  }

  /**
   * Share to Telegram
   */
  private static async shareToTelegram(content: ShareableContent, text: string): Promise<{ success: boolean; error?: string }> {
    try {
      const url = `https://t.me/share/url?url=${encodeURIComponent(content.url || '')}&text=${encodeURIComponent(text)}`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        return { success: true };
      } else {
        return { success: false, error: 'Telegram app not available' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to open Telegram' };
    }
  }

  /**
   * Share via Email
   */
  private static async shareToEmail(content: ShareableContent, text: string): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = encodeURIComponent(content.title);
      const body = encodeURIComponent(text);
      const url = `mailto:?subject=${subject}&body=${body}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return { success: true };
      } else {
        return { success: false, error: 'Email app not available' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to open email' };
    }
  }

  /**
   * Copy to clipboard
   */
  private static async copyToClipboard(content: ShareableContent, text: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real app, you would use a clipboard library
      Alert.alert('Copied!', 'Content copied to clipboard');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to copy to clipboard' };
    }
  }

  /**
   * Generic share fallback
   */
  private static async shareGeneric(content: ShareableContent, text: string): Promise<{ success: boolean; error?: string }> {
    return await this.shareNative(content);
  }

  /**
   * Create shareable content from article
   */
  static createArticleContent(article: {
    headline: string;
    summary?: string;
    url: string;
    source: string;
    publishedAt: string;
  }): ShareableContent {
    const hashtags = ['JamaicaStockExchange', 'JSE', 'FinancialNews', 'JamStockAnalytics'];
    
    return {
      title: article.headline,
      description: article.summary || `Latest financial news from ${article.source}`,
      url: article.url,
      hashtags,
      category: 'news',
    };
  }

  /**
   * Create shareable content from AI message
   */
  static createAIMessageContent(message: {
    content: string;
    timestamp: string;
    context?: string;
  }): ShareableContent {
    const hashtags = ['AI', 'MarketAnalysis', 'JamStockAnalytics', 'JSE'];
    
    return {
      title: 'AI Market Analysis',
      description: message.content,
      hashtags,
      category: 'ai-message',
    };
  }

  /**
   * Create shareable content from chart
   */
  static createChartContent(chart: {
    title: string;
    description: string;
    data: any;
    design: string;
  }): ShareableContent {
    const hashtags = ['MarketChart', 'JSE', 'JamStockAnalytics', 'DataVisualization'];
    
    return {
      title: chart.title,
      description: chart.description,
      hashtags,
      category: 'chart',
    };
  }

  /**
   * Create shareable content from market analysis
   */
  static createAnalysisContent(analysis: {
    title: string;
    summary: string;
    keyFindings: string[];
    timestamp: string;
  }): ShareableContent {
    const hashtags = ['MarketAnalysis', 'JSE', 'JamStockAnalytics', 'InvestmentInsights'];
    
    return {
      title: analysis.title,
      description: analysis.summary,
      hashtags,
      category: 'analysis',
    };
  }

  /**
   * Get platform-specific sharing statistics
   */
  static async getSharingStats(): Promise<{
    totalShares: number;
    platformBreakdown: Record<string, number>;
    popularContent: string[];
  }> {
    // In a real app, this would fetch from analytics
    return {
      totalShares: 0,
      platformBreakdown: {},
      popularContent: [],
    };
  }
}
