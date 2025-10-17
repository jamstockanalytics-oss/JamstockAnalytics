/**
 * Advanced Analytics Service for JamStockAnalytics
 * Provides market insights, trends, and predictive analytics
 */

import { supabase } from '../supabase/client';
import { analyzeNewsArticle } from './ai-service';

interface MarketTrend {
  id?: string;
  trend_type: 'bullish' | 'bearish' | 'neutral' | 'volatile';
  sector: string;
  confidence_score: number;
  timeframe: 'short' | 'medium' | 'long';
  description: string;
  supporting_factors: string[];
  risk_factors: string[];
  created_at: Date;
  expires_at: Date;
}

interface MarketInsight {
  id?: string;
  insight_type: 'sentiment' | 'volume' | 'price' | 'news' | 'economic';
  title: string;
  description: string;
  impact_score: number;
  confidence_level: number;
  data_points: Record<string, any>;
  recommendations: string[];
  created_at: Date;
}

// Removed unused PredictiveModel interface

interface Prediction {
  id?: string;
  model_id: string;
  target_date: Date;
  predicted_value: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  factors: Record<string, number>;
  created_at: Date;
}

interface AnalyticsDashboard {
  market_sentiment: {
    overall: number;
    bullish: number;
    bearish: number;
    neutral: number;
  };
  top_trends: MarketTrend[];
  key_insights: MarketInsight[];
  predictions: Prediction[];
  performance_metrics: {
    accuracy: number;
    total_predictions: number;
    successful_predictions: number;
  };
}

export class AnalyticsService {
  constructor() {
    // No need for AI service instance since we're using standalone function
  }

  /**
   * Generate comprehensive market analysis
   */
  async generateMarketAnalysis(): Promise<AnalyticsDashboard> {
    try {
      // Get recent articles and market data
      const [articles, marketData, userInteractions] = await Promise.all([
        this.getRecentArticles(),
        this.getMarketData(),
        this.getUserInteractions()
      ]);

      // Analyze market sentiment
      const marketSentiment = await this.analyzeMarketSentiment(articles);

      // Identify trends
      const topTrends = await this.identifyMarketTrends(articles, marketData);

      // Generate insights
      const keyInsights = await this.generateMarketInsights(articles, marketData, userInteractions);

      // Get predictions
      const predictions = await this.getActivePredictions();

      // Calculate performance metrics
      const performanceMetrics = await this.calculatePerformanceMetrics();

      return {
        market_sentiment: marketSentiment,
        top_trends: topTrends,
        key_insights: keyInsights,
        predictions: predictions,
        performance_metrics: performanceMetrics,
      };

    } catch (error) {
      console.error('Error generating market analysis:', error);
      throw new Error(`Market analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze market sentiment from articles
   */
  private async analyzeMarketSentiment(articles: any[]): Promise<any> {
    try {
      // Group articles by sentiment
      const sentimentCounts = {
        positive: 0,
        negative: 0,
        neutral: 0,
      };

      let totalSentiment = 0;

      articles.forEach(article => {
        if (article.sentiment_score > 0.1) {
          sentimentCounts.positive++;
          totalSentiment += article.sentiment_score;
        } else if (article.sentiment_score < -0.1) {
          sentimentCounts.negative++;
          totalSentiment += article.sentiment_score;
        } else {
          sentimentCounts.neutral++;
        }
      });

      const totalArticles = articles.length;
      const overallSentiment = totalArticles > 0 ? totalSentiment / totalArticles : 0;

      return {
        overall: Math.round(overallSentiment * 100) / 100,
        bullish: Math.round((sentimentCounts.positive / totalArticles) * 100),
        bearish: Math.round((sentimentCounts.negative / totalArticles) * 100),
        neutral: Math.round((sentimentCounts.neutral / totalArticles) * 100),
      };

    } catch (error) {
      console.error('Error analyzing market sentiment:', error);
      return {
        overall: 0,
        bullish: 33,
        bearish: 33,
        neutral: 34,
      };
    }
  }

  /**
   * Identify market trends
   */
  private async identifyMarketTrends(articles: any[], _marketData: any[]): Promise<MarketTrend[]> {
    try {
      const trends: MarketTrend[] = [];

      // Analyze sector performance
      const sectorAnalysis = this.analyzeSectorPerformance(articles);

      // Generate AI-powered trend analysis
      for (const [sector, data] of Object.entries(sectorAnalysis)) {
        try {
          const trendAnalysis = await analyzeNewsArticle(
            `Sector Analysis: ${sector}`,
            `Recent news and data for ${sector} sector: ${JSON.stringify(data)}`,
            new Date().toISOString()
          );

          const trend: MarketTrend = {
            trend_type: this.determineTrendType(trendAnalysis.sentiment, trendAnalysis.priority_score),
            sector: sector,
            confidence_score: trendAnalysis.priority_score / 10,
            timeframe: this.determineTimeframe(trendAnalysis.priority_score),
            description: trendAnalysis.summary,
            supporting_factors: trendAnalysis.key_points.slice(0, 3),
            risk_factors: trendAnalysis.recommendations.filter((r: string) => r.includes('risk') || r.includes('caution')),
            created_at: new Date(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          };

          trends.push(trend);
        } catch (error) {
          console.error(`Error analyzing trend for ${sector}:`, error);
        }
      }

      // Sort by confidence score and return top 5
      return trends
        .sort((a, b) => b.confidence_score - a.confidence_score)
        .slice(0, 5);

    } catch (error) {
      console.error('Error identifying market trends:', error);
      return [];
    }
  }

  /**
   * Generate market insights
   */
  private async generateMarketInsights(articles: any[], marketData: any[], userInteractions: any[]): Promise<MarketInsight[]> {
    try {
      const insights: MarketInsight[] = [];

      // News sentiment insight
      const newsInsight = await this.generateNewsSentimentInsight(articles);
      if (newsInsight) insights.push(newsInsight);

      // Volume analysis insight
      const volumeInsight = await this.generateVolumeInsight(marketData);
      if (volumeInsight) insights.push(volumeInsight);

      // User behavior insight
      const userInsight = await this.generateUserBehaviorInsight(userInteractions);
      if (userInsight) insights.push(userInsight);

      // Economic indicators insight
      const economicInsight = await this.generateEconomicInsight(articles);
      if (economicInsight) insights.push(economicInsight);

      return insights.sort((a, b) => b.impact_score - a.impact_score);

    } catch (error) {
      console.error('Error generating market insights:', error);
      return [];
    }
  }

  /**
   * Generate news sentiment insight
   */
  private async generateNewsSentimentInsight(articles: any[]): Promise<MarketInsight | null> {
    try {
      const recentArticles = articles.filter(a => 
        new Date(a.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );

      if (recentArticles.length === 0) return null;

      const avgSentiment = recentArticles.reduce((sum, a) => sum + (a.sentiment_score || 0), 0) / recentArticles.length;
      const highPriorityCount = recentArticles.filter(a => a.ai_priority_score > 7).length;

      return {
        insight_type: 'news',
        title: 'News Sentiment Analysis',
        description: `Recent news sentiment shows ${avgSentiment > 0.1 ? 'positive' : avgSentiment < -0.1 ? 'negative' : 'neutral'} market outlook with ${highPriorityCount} high-priority articles.`,
        impact_score: Math.abs(avgSentiment) * 10,
        confidence_level: Math.min(0.9, recentArticles.length / 20),
        data_points: {
          total_articles: recentArticles.length,
          average_sentiment: avgSentiment,
          high_priority_articles: highPriorityCount,
        },
        recommendations: [
          avgSentiment > 0.1 ? 'Consider bullish positions' : avgSentiment < -0.1 ? 'Consider defensive positions' : 'Maintain balanced portfolio',
          'Monitor high-priority news for market-moving events',
          'Review sector-specific sentiment for targeted investments',
        ],
        created_at: new Date(),
      };

    } catch (error) {
      console.error('Error generating news sentiment insight:', error);
      return null;
    }
  }

  /**
   * Generate volume insight
   */
  private async generateVolumeInsight(marketData: any[]): Promise<MarketInsight | null> {
    try {
      if (marketData.length === 0) return null;

      const avgVolume = marketData.reduce((sum, d) => sum + (d.volume || 0), 0) / marketData.length;
      const volumeTrend = this.calculateVolumeTrend(marketData);

      return {
        insight_type: 'volume',
        title: 'Trading Volume Analysis',
        description: `Average trading volume is ${avgVolume.toLocaleString()} with a ${volumeTrend > 0 ? 'positive' : 'negative'} trend.`,
        impact_score: Math.abs(volumeTrend) * 5,
        confidence_level: 0.8,
        data_points: {
          average_volume: avgVolume,
          volume_trend: volumeTrend,
          data_points: marketData.length,
        },
        recommendations: [
          volumeTrend > 0 ? 'Increased volume suggests growing interest' : 'Decreased volume may indicate reduced interest',
          'Monitor volume spikes for potential breakouts',
          'Compare volume to price movements for confirmation',
        ],
        created_at: new Date(),
      };

    } catch (error) {
      console.error('Error generating volume insight:', error);
      return null;
    }
  }

  /**
   * Generate user behavior insight
   */
  private async generateUserBehaviorInsight(userInteractions: any[]): Promise<MarketInsight | null> {
    try {
      if (userInteractions.length === 0) return null;

      const popularArticles = this.getPopularArticles(userInteractions);
      const userEngagement = this.calculateUserEngagement(userInteractions);

      return {
        insight_type: 'sentiment',
        title: 'User Engagement Analysis',
        description: `Users are most engaged with ${popularArticles.length > 0 ? popularArticles[0].title : 'various articles'} with ${userEngagement}% engagement rate.`,
        impact_score: userEngagement / 10,
        confidence_level: 0.7,
        data_points: {
          total_interactions: userInteractions.length,
          engagement_rate: userEngagement,
          popular_articles: popularArticles.slice(0, 3),
        },
        recommendations: [
          'Focus on high-engagement content types',
          'Analyze popular articles for market sentiment',
          'Use engagement data to improve content curation',
        ],
        created_at: new Date(),
      };

    } catch (error) {
      console.error('Error generating user behavior insight:', error);
      return null;
    }
  }

  /**
   * Generate economic insight
   */
  private async generateEconomicInsight(articles: any[]): Promise<MarketInsight | null> {
    try {
      const economicArticles = articles.filter(a => 
        a.tags?.includes('economy') || 
        a.tags?.includes('boj') || 
        a.tags?.includes('inflation') ||
        a.tags?.includes('interest-rates')
      );

      if (economicArticles.length === 0) return null;

      const economicSentiment = economicArticles.reduce((sum, a) => sum + (a.sentiment_score || 0), 0) / economicArticles.length;

      return {
        insight_type: 'economic',
        title: 'Economic Indicators Analysis',
        description: `Economic news sentiment is ${economicSentiment > 0.1 ? 'positive' : economicSentiment < -0.1 ? 'negative' : 'neutral'} with ${economicArticles.length} relevant articles.`,
        impact_score: Math.abs(economicSentiment) * 8,
        confidence_level: 0.8,
        data_points: {
          economic_articles: economicArticles.length,
          economic_sentiment: economicSentiment,
          key_topics: this.extractKeyTopics(economicArticles),
        },
        recommendations: [
          'Monitor central bank announcements closely',
          'Watch for inflation and interest rate changes',
          'Consider economic indicators in investment decisions',
        ],
        created_at: new Date(),
      };

    } catch (error) {
      console.error('Error generating economic insight:', error);
      return null;
    }
  }

  /**
   * Get recent articles
   */
  private async getRecentArticles(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent articles:', error);
      return [];
    }
  }

  /**
   * Get market data
   */
  private async getMarketData(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('market_data')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching market data:', error);
      return [];
    }
  }

  /**
   * Get user interactions
   */
  private async getUserInteractions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_article_interactions')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user interactions:', error);
      return [];
    }
  }

  /**
   * Analyze sector performance
   */
  private analyzeSectorPerformance(articles: any[]): Record<string, any> {
    const sectors: Record<string, any> = {};

    articles.forEach(article => {
      if (article.company_tickers && article.company_tickers.length > 0) {
        article.company_tickers.forEach((ticker: string) => {
          const sector = this.getSectorFromTicker(ticker);
          if (!sectors[sector]) {
            sectors[sector] = {
              articles: [],
              totalSentiment: 0,
              totalPriority: 0,
            };
          }
          sectors[sector].articles.push(article);
          sectors[sector].totalSentiment += article.sentiment_score || 0;
          sectors[sector].totalPriority += article.ai_priority_score || 0;
        });
      }
    });

    // Calculate averages
    Object.keys(sectors).forEach(sector => {
      const data = sectors[sector];
      data.avgSentiment = data.articles.length > 0 ? data.totalSentiment / data.articles.length : 0;
      data.avgPriority = data.articles.length > 0 ? data.totalPriority / data.articles.length : 0;
      data.articleCount = data.articles.length;
    });

    return sectors;
  }

  /**
   * Get sector from ticker
   */
  private getSectorFromTicker(ticker: string): string {
    const sectorMap: Record<string, string> = {
      'NCBFG': 'Banking',
      'SGJ': 'Insurance',
      'GHL': 'Insurance',
      'GK': 'Manufacturing',
      'JBG': 'Agriculture',
      'SEP': 'Manufacturing',
      'CAR': 'Manufacturing',
      'JP': 'Agriculture',
      'DTL': 'Distribution',
      'LASF': 'Financial Services',
      'LASM': 'Manufacturing',
      'LASD': 'Distribution',
      'MIL': 'Financial Services',
    };

    return sectorMap[ticker] || 'Other';
  }

  /**
   * Determine trend type
   */
  private determineTrendType(sentiment: string, priorityScore: number): 'bullish' | 'bearish' | 'neutral' | 'volatile' {
    if (priorityScore > 8) return 'volatile';
    if (sentiment === 'positive') return 'bullish';
    if (sentiment === 'negative') return 'bearish';
    return 'neutral';
  }

  /**
   * Determine timeframe
   */
  private determineTimeframe(priorityScore: number): 'short' | 'medium' | 'long' {
    if (priorityScore > 8) return 'short';
    if (priorityScore > 6) return 'medium';
    return 'long';
  }

  /**
   * Calculate volume trend
   */
  private calculateVolumeTrend(marketData: any[]): number {
    if (marketData.length < 2) return 0;

    const recent = marketData.slice(0, Math.floor(marketData.length / 2));
    const older = marketData.slice(Math.floor(marketData.length / 2));

    const recentAvg = recent.reduce((sum, d) => sum + (d.volume || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + (d.volume || 0), 0) / older.length;

    return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
  }

  /**
   * Get popular articles
   */
  private getPopularArticles(userInteractions: any[]): any[] {
    const articleCounts: Record<string, number> = {};

    userInteractions.forEach(interaction => {
      const articleId = interaction.article_id;
      articleCounts[articleId] = (articleCounts[articleId] || 0) + 1;
    });

    return Object.entries(articleCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([articleId, count]) => ({ id: articleId, interaction_count: count }));
  }

  /**
   * Calculate user engagement
   */
  private calculateUserEngagement(userInteractions: any[]): number {
    // Simple engagement calculation based on interaction frequency
    const uniqueUsers = new Set(userInteractions.map(i => i.user_id)).size;
    const totalInteractions = userInteractions.length;
    
    return uniqueUsers > 0 ? Math.round((totalInteractions / uniqueUsers) * 100) / 100 : 0;
  }

  /**
   * Extract key topics
   */
  private extractKeyTopics(articles: any[]): string[] {
    const topicCounts: Record<string, number> = {};

    articles.forEach(article => {
      if (article.tags) {
        article.tags.forEach((tag: string) => {
          topicCounts[tag] = (topicCounts[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  /**
   * Get active predictions
   */
  private async getActivePredictions(): Promise<Prediction[]> {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .gte('target_date', new Date().toISOString())
        .order('target_date', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching predictions:', error);
      return [];
    }
  }

  /**
   * Calculate performance metrics
   */
  private async calculatePerformanceMetrics(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .lt('target_date', new Date().toISOString());

      if (error) throw error;

      const totalPredictions = data?.length || 0;
      const successfulPredictions = data?.filter(p => 
        p.actual_value && 
        p.actual_value >= p.confidence_interval.lower && 
        p.actual_value <= p.confidence_interval.upper
      ).length || 0;

      return {
        accuracy: totalPredictions > 0 ? Math.round((successfulPredictions / totalPredictions) * 100) : 0,
        total_predictions: totalPredictions,
        successful_predictions: successfulPredictions,
      };

    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      return {
        accuracy: 0,
        total_predictions: 0,
        successful_predictions: 0,
      };
    }
  }

  /**
   * Save analytics data to database
   */
  async saveAnalyticsData(dashboard: AnalyticsDashboard): Promise<void> {
    try {
      // Save trends
      if (dashboard.top_trends.length > 0) {
        const { error: trendsError } = await supabase
          .from('market_trends')
          .insert(dashboard.top_trends.map(trend => ({
            trend_type: trend.trend_type,
            sector: trend.sector,
            confidence_score: trend.confidence_score,
            timeframe: trend.timeframe,
            description: trend.description,
            supporting_factors: trend.supporting_factors,
            risk_factors: trend.risk_factors,
            expires_at: trend.expires_at.toISOString(),
          })));

        if (trendsError) {
          console.error('Error saving trends:', trendsError);
        }
      }

      // Save insights
      if (dashboard.key_insights.length > 0) {
        const { error: insightsError } = await supabase
          .from('market_insights')
          .insert(dashboard.key_insights.map(insight => ({
            insight_type: insight.insight_type,
            title: insight.title,
            description: insight.description,
            impact_score: insight.impact_score,
            confidence_level: insight.confidence_level,
            data_points: insight.data_points,
            recommendations: insight.recommendations,
          })));

        if (insightsError) {
          console.error('Error saving insights:', insightsError);
        }
      }

      } catch (error) {
      console.error('Error saving analytics data:', error);
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
