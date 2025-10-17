/**
 * Analytics Dashboard Component
 * Displays market insights, trends, and predictive analytics
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, ProgressBar, Chip, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { analyticsService } from '../../lib/services/analytics-service';

interface AnalyticsDashboardProps {
  onRefresh?: () => void;
}


interface MarketTrend {
  id?: string;
  trend_type: 'bullish' | 'bearish' | 'neutral' | 'volatile';
  sector: string;
  confidence_score: number;
  timeframe: 'short' | 'medium' | 'long';
  description: string;
  supporting_factors: string[];
  risk_factors: string[];
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
}


export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onRefresh }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await analyticsService.generateMarketAnalysis();
      setAnalyticsData(data);
      
      // Save analytics data
      await analyticsService.saveAnalyticsData(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      console.error('Error loading analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
    onRefresh?.();
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return theme.colors.primary;
    if (sentiment < -0.1) return theme.colors.error;
    return theme.colors.outline;
  };

  const getTrendColor = (trendType: string) => {
    switch (trendType) {
      case 'bullish': return theme.colors.primary;
      case 'bearish': return theme.colors.error;
      case 'volatile': return theme.colors.tertiary;
      default: return theme.colors.outline;
    }
  };


  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          Generating market analysis...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
        <Button mode="contained" onPress={loadAnalyticsData} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  if (!analyticsData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.errorText, { color: theme.colors.onSurface }]}>
          No analytics data available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Market Sentiment Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Market Sentiment
          </Text>
          
          <View style={styles.sentimentContainer}>
            <View style={styles.sentimentItem}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                Overall: {analyticsData.market_sentiment.overall.toFixed(2)}
              </Text>
              <ProgressBar
                progress={Math.abs(analyticsData.market_sentiment.overall)}
                color={getSentimentColor(analyticsData.market_sentiment.overall)}
                style={styles.progressBar}
              />
            </View>
            
            <View style={styles.sentimentBreakdown}>
              <View style={styles.sentimentItem}>
                <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                  Bullish: {analyticsData.market_sentiment.bullish}%
                </Text>
              </View>
              <View style={styles.sentimentItem}>
                <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                  Bearish: {analyticsData.market_sentiment.bearish}%
                </Text>
              </View>
              <View style={styles.sentimentItem}>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  Neutral: {analyticsData.market_sentiment.neutral}%
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Top Trends Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Top Market Trends
          </Text>
          
          {analyticsData.top_trends.map((trend: MarketTrend, index: number) => (
            <View key={index} style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <Chip
                  mode="outlined"
                  textStyle={{ color: getTrendColor(trend.trend_type) }}
                  style={{ borderColor: getTrendColor(trend.trend_type) }}
                >
                  {trend.trend_type.toUpperCase()}
                </Chip>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {trend.sector}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  {Math.round(trend.confidence_score * 100)}% confidence
                </Text>
              </View>
              
              <Text variant="bodyMedium" style={[styles.trendDescription, { color: theme.colors.onSurface }]}>
                {trend.description}
              </Text>
              
              <View style={styles.trendFactors}>
                <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  Supporting Factors:
                </Text>
                {trend.supporting_factors.map((factor, factorIndex) => (
                  <Text key={factorIndex} variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                    • {factor}
                  </Text>
                ))}
              </View>
              
              {index < analyticsData.top_trends.length - 1 && <Divider style={styles.divider} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Key Insights Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Key Market Insights
          </Text>
          
          {analyticsData.key_insights.map((insight: MarketInsight, index: number) => (
            <View key={index} style={styles.insightItem}>
              <View style={styles.insightHeader}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  {insight.title}
                </Text>
                <Chip
                  mode="outlined"
                  compact
                  style={styles.insightChip}
                >
                  {Math.round(insight.impact_score * 10)}/10
                </Chip>
              </View>
              
              <Text variant="bodyMedium" style={[styles.insightDescription, { color: theme.colors.onSurface }]}>
                {insight.description}
              </Text>
              
              <View style={styles.insightRecommendations}>
                <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  Recommendations:
                </Text>
                {insight.recommendations.map((recommendation, recIndex) => (
                  <Text key={recIndex} variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                    • {recommendation}
                  </Text>
                ))}
              </View>
              
              {index < analyticsData.key_insights.length - 1 && <Divider style={styles.divider} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Performance Metrics Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Prediction Performance
          </Text>
          
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                {analyticsData.performance_metrics.accuracy}%
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                Accuracy
              </Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                {analyticsData.performance_metrics.total_predictions}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                Total Predictions
              </Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                {analyticsData.performance_metrics.successful_predictions}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                Successful
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  sentimentContainer: {
    marginTop: 8,
  },
  sentimentItem: {
    marginBottom: 12,
  },
  sentimentBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  trendItem: {
    marginBottom: 16,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trendDescription: {
    marginBottom: 12,
    lineHeight: 20,
  },
  trendFactors: {
    marginTop: 8,
  },
  insightItem: {
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  insightChip: {
    height: 24,
  },
  insightDescription: {
    marginBottom: 12,
    lineHeight: 20,
  },
  insightRecommendations: {
    marginTop: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  divider: {
    marginVertical: 12,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default AnalyticsDashboard;
