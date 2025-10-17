# Social Media Sharing System - JamStockAnalytics

## Overview

The JamStockAnalytics application now includes a comprehensive social media sharing system that allows users to share articles, AI messages, charts, and market analysis across multiple social media platforms. The system is designed to be privacy-focused, with no access to user social media credentials - only sending shareable content to their chosen platforms.

## Features

### 🚀 Core Functionality
- **Multi-Platform Support**: Twitter, Facebook, LinkedIn, WhatsApp, Telegram, Email, and Copy Link
- **Content Types**: Articles, AI messages, market charts, and analysis reports
- **Privacy-First**: No access to user social media accounts or credentials
- **Customizable**: User preferences for platforms, hashtags, and branding
- **Analytics**: Track sharing patterns and engagement metrics

### 📱 Supported Platforms
- **Twitter**: Tweet with hashtags and mentions
- **Facebook**: Share posts with descriptions
- **LinkedIn**: Professional sharing for business content
- **WhatsApp**: Direct message sharing
- **Telegram**: Channel and group sharing
- **Email**: Email sharing with formatted content
- **Copy Link**: Copy to clipboard for manual sharing

## Technical Architecture

### Core Services

#### 1. SocialSharingService (`lib/services/social-sharing-service.ts`)
```typescript
// Main service for handling all social sharing operations
export class SocialSharingService {
  static async shareToPlatform(platform: SocialPlatform, content: ShareableContent)
  static async shareNative(content: ShareableContent)
  static createArticleContent(article: ArticleData): ShareableContent
  static createAIMessageContent(message: AIMessageData): ShareableContent
  static createChartContent(chart: ChartData): ShareableContent
  static createAnalysisContent(analysis: AnalysisData): ShareableContent
}
```

#### 2. SocialAnalyticsService (`lib/services/social-analytics-service.ts`)
```typescript
// Analytics and tracking for social sharing
export class SocialAnalyticsService {
  static async trackShare(event: SocialShareEvent)
  static async getAnalytics(userId?: string, dateRange?: DateRange)
  static async getContentShareStats(contentId: string)
  static async getUserSharingPatterns(userId: string)
}
```

### UI Components

#### 1. SocialShareButton (`components/social/SocialShareButton.tsx`)
```typescript
// Main sharing button component
<SocialShareButton
  content={shareableContent}
  variant="button" | "chip" | "icon"
  size="small" | "medium" | "large"
  onShare={(platform) => handleShare(platform)}
/>
```

#### 2. ArticleShareButton (`components/social/ArticleShareButton.tsx`)
```typescript
// Specialized sharing for articles
<ArticleShareButton
  article={articleData}
  variant="button" | "card" | "inline"
  onShare={(platform) => handleShare(platform)}
/>
```

#### 3. AIMessageShareButton (`components/social/ArticleShareButton.tsx`)
```typescript
// Specialized sharing for AI messages
<AIMessageShareButton
  message={aiMessageData}
  variant="button" | "card" | "inline"
  onShare={(platform) => handleShare(platform)}
/>
```

#### 4. ChartShareButton (`components/social/ArticleShareButton.tsx`)
```typescript
// Specialized sharing for charts
<ChartShareButton
  chart={chartData}
  variant="button" | "card" | "inline"
  onShare={(platform) => handleShare(platform)}
/>
```

## Implementation Guide

### 1. Basic Sharing Implementation

```typescript
import { SocialShareButton } from '../../components/social';
import { SocialSharingService } from '../../lib/services/social-sharing-service';

// Create shareable content
const shareableContent = SocialSharingService.createArticleContent({
  headline: "JSE Market Update",
  summary: "Latest market analysis from JamStockAnalytics",
  url: "https://jamstockanalytics.com/article/123",
  source: "JamStockAnalytics",
  publishedAt: new Date().toISOString(),
});

// Add sharing button to your component
<SocialShareButton
  content={shareableContent}
  variant="button"
  onShare={(platform) => console.log(`Shared to ${platform}`)}
/>
```

### 2. Article Sharing

```typescript
import { ArticleShareButton } from '../../components/social';

<ArticleShareButton
  article={{
    id: "article-123",
    headline: "NCB Financial Group Reports Strong Q3 Results",
    summary: "NCB Financial Group has reported strong third quarter results...",
    url: "https://jamstockanalytics.com/article/ncb-q3-results",
    source: "Jamaica Observer",
    publishedAt: "2024-01-15T10:00:00Z",
    aiPriorityScore: 8.5,
    companyTickers: ["NCBFG"]
  }}
  variant="card"
  onShare={(platform) => trackShare(platform)}
/>
```

### 3. AI Message Sharing

```typescript
import { AIMessageShareButton } from '../../components/social';

<AIMessageShareButton
  message={{
    content: "Based on current market trends, NCB Financial Group shows strong potential for growth...",
    timestamp: "2024-01-15T10:30:00Z",
    context: "AI Market Analysis"
  }}
  variant="inline"
  onShare={(platform) => trackShare(platform)}
/>
```

### 4. Chart Sharing

```typescript
import { ChartShareButton } from '../../components/social';

<ChartShareButton
  chart={{
    title: "JSE Market Performance",
    description: "Daily market performance over the last 30 days",
    data: chartData,
    design: "professional"
  }}
  variant="card"
  onShare={(platform) => trackShare(platform)}
/>
```

## User Preferences

### Social Media Settings
Users can customize their sharing preferences in the Profile section:

```typescript
// Social media preferences
const socialPreferences = {
  enabledPlatforms: ['twitter', 'facebook', 'whatsapp'],
  defaultPlatform: 'twitter',
  includeHashtags: true,
  includeAppBranding: true,
  shareAnalytics: false,
  autoShare: false
};
```

### Platform Configuration
```typescript
// Available platforms
const SOCIAL_PLATFORMS = [
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
  // ... other platforms
];
```

## Analytics and Tracking

### Share Event Tracking
```typescript
import { SocialAnalyticsService } from '../../lib/services/social-analytics-service';

// Track a share event
await SocialAnalyticsService.trackShare({
  user_id: userId,
  content_type: 'article',
  content_id: articleId,
  platform: 'twitter',
  success: true,
  content_title: article.headline,
  content_url: article.url,
  hashtags_used: ['JSE', 'JamStockAnalytics'],
  reach_estimate: 1000,
  engagement_estimate: 50
});
```

### Analytics Dashboard
```typescript
// Get comprehensive analytics
const analytics = await SocialAnalyticsService.getAnalytics(userId, {
  start: '2024-01-01',
  end: '2024-01-31'
});

console.log(analytics.data);
// {
//   totalShares: 150,
//   platformBreakdown: { twitter: 60, facebook: 40, linkedin: 30, whatsapp: 20 },
//   contentTypeBreakdown: { article: 80, ai_message: 40, chart: 30 },
//   topSharedContent: [...],
//   sharingTrends: [...],
//   userEngagement: {...}
// }
```

## Database Schema

### Social Share Events Table
```sql
CREATE TABLE social_share_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('article', 'ai_message', 'chart', 'analysis')),
  content_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  error_message TEXT,
  content_title TEXT NOT NULL,
  content_url TEXT,
  hashtags_used TEXT[],
  reach_estimate INTEGER,
  engagement_estimate INTEGER
);
```

### User Social Preferences Table
```sql
CREATE TABLE user_social_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  enabled_platforms TEXT[] DEFAULT '{}',
  default_platform VARCHAR(50) DEFAULT 'twitter',
  include_hashtags BOOLEAN DEFAULT TRUE,
  include_app_branding BOOLEAN DEFAULT TRUE,
  share_analytics BOOLEAN DEFAULT FALSE,
  auto_share BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Integration Examples

### 1. Market Screen Integration
```typescript
{% raw %}
// In app/(tabs)/market.tsx
import { ArticleShareButton } from "../../components/social";

// Add to stock cards
<ArticleShareButton
  article={{
    id: item.symbol,
    headline: `${item.symbol} Stock Update`,
    summary: `${item.symbol} is currently trading at ${formatCurrency(item.last_price)}...`,
    url: `https://jamstockanalytics.com/stock/${item.symbol}`,
    source: 'JamStockAnalytics',
    publishedAt: new Date().toISOString(),
    aiPriorityScore: Math.random() * 10,
    companyTickers: [item.symbol],
  }}
  variant="inline"
  onShare={(platform) => console.log(`Stock ${item.symbol} shared to ${platform}`)}
/>
{% endraw %}
```

### 2. Chat Screen Integration
```typescript
// In app/(tabs)/chat.tsx
import { AIMessageShareButton } from "../../components/social";

// Add to AI messages
<AIMessageShareButton
  message={{
    content: item.content,
    timestamp: item.created_at,
    context: 'AI Market Analysis',
  }}
  variant="inline"
  onShare={(platform) => console.log(`AI message shared to ${platform}`)}
/>
```

### 3. Chart Integration
```typescript
// In components/charts/MarketChartContainer.tsx
import { ChartShareButton } from '../social/ArticleShareButton';

// Add to chart container
<ChartShareButton
  chart={{
    title: title || 'Market Chart',
    description: subtitle || 'Market analysis chart',
    data: data,
    design: selectedDesign.name,
  }}
  variant="inline"
  onShare={(platform) => console.log(`Chart shared to ${platform}`)}
/>
```

## Best Practices

### 1. Content Optimization
- **Twitter**: Keep under 280 characters, use relevant hashtags
- **Facebook**: Include engaging descriptions and images
- **LinkedIn**: Focus on professional, business-oriented content
- **WhatsApp**: Use concise, direct messaging
- **Email**: Include full context and proper formatting

### 2. User Experience
- Provide clear sharing options without overwhelming the interface
- Show sharing success/failure feedback
- Respect user privacy and preferences
- Make sharing optional and non-intrusive

### 3. Analytics
- Track sharing patterns to improve content recommendations
- Monitor platform performance for optimization
- Respect user privacy in analytics collection
- Provide insights to help users understand their sharing behavior

## Security Considerations

### 1. Privacy Protection
- No access to user social media credentials
- No storage of sensitive social media data
- User controls all sharing permissions
- Transparent about what data is shared

### 2. Content Security
- Validate all shared content before sending
- Sanitize user input to prevent malicious content
- Respect platform-specific content policies
- Implement rate limiting to prevent abuse

### 3. Data Protection
- Encrypt sensitive data in transit
- Implement proper access controls
- Regular security audits
- Compliance with data protection regulations

## Troubleshooting

### Common Issues

1. **Platform Not Available**
   - Check if the platform app is installed
   - Provide fallback to web version
   - Show appropriate error messages

2. **Sharing Failures**
   - Implement retry mechanisms
   - Provide alternative sharing methods
   - Log errors for debugging

3. **Content Formatting**
   - Validate content length for each platform
   - Handle special characters properly
   - Test with various content types

### Debug Commands
```bash
# Test social sharing service
npm run test:social-sharing

# Check analytics
npm run test:social-analytics

# Verify platform availability
npm run test:platforms
```

## Future Enhancements

### Planned Features
- **Scheduled Sharing**: Share content at optimal times
- **Bulk Sharing**: Share multiple items at once
- **Custom Templates**: User-defined sharing templates
- **Advanced Analytics**: Detailed engagement metrics
- **Social Listening**: Monitor mentions and engagement

### Integration Opportunities
- **Social Media APIs**: Direct integration with platform APIs
- **Content Scheduling**: Advanced scheduling capabilities
- **Cross-Platform Analytics**: Unified analytics dashboard
- **Social CRM**: Customer relationship management integration

## Support and Maintenance

### Monitoring
- Track sharing success rates
- Monitor platform availability
- Analyze user engagement patterns
- Identify and fix issues quickly

### Updates
- Regular platform compatibility updates
- New platform additions
- Feature enhancements based on user feedback
- Security updates and patches

---

This comprehensive social sharing system provides JamStockAnalytics users with powerful, privacy-focused sharing capabilities across all major social media platforms while maintaining complete control over their social media accounts and data.
