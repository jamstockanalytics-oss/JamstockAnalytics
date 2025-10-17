import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Chip, Button, IconButton, Badge } from 'react-native-paper';
import { mlAgentService } from '../../lib/services/ml-agent-service';

interface CuratedArticle {
  id: string;
  article_id: string;
  curation_score: number;
  curation_reason: string;
  target_audience: string[];
  optimal_timing: string;
  expected_engagement: number;
  confidence_level: number;
  created_at: string;
}

interface CuratedArticleFeedProps {
  limit?: number;
  showAgentStatus?: boolean;
  onArticlePress?: (articleId: string) => void;
}

export function CuratedArticleFeed({ 
  limit = 10, 
  showAgentStatus = true,
  onArticlePress 
}: CuratedArticleFeedProps) {
  const [curatedArticles, setCuratedArticles] = useState<CuratedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [agentStatus, setAgentStatus] = useState<any>(null);

  useEffect(() => {
    loadCuratedArticles();
    if (showAgentStatus) {
      loadAgentStatus();
    }
  }, [limit]);

  const loadCuratedArticles = async () => {
    try {
      setLoading(true);
      const articles = await mlAgentService.getCuratedArticles(limit);
      setCuratedArticles(articles as any);
    } catch (error) {
      console.error('Error loading curated articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentStatus = async () => {
    try {
      const status = await mlAgentService.getAgentStatus();
      setAgentStatus(status);
    } catch (error) {
      console.error('Error loading agent status:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadCuratedArticles(),
      showAgentStatus ? loadAgentStatus() : Promise.resolve()
    ]);
    setRefreshing(false);
  };


  const getScoreLabel = (score: number): string => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    return 'Fair';
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderAgentStatus = () => {
    if (!showAgentStatus || !agentStatus) return null;

    return (
      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <IconButton icon="robot" size={24} />
            <Title style={styles.statusTitle}>ML Agent Status</Title>
            <Badge 
              style={[
                styles.statusBadge, 
                { backgroundColor: agentStatus.is_active ? '#4CAF50' : '#F44336' }
              ]}
            >
              {agentStatus.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </View>
          
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Patterns</Text>
              <Text style={styles.statusValue}>{agentStatus.learning_patterns_count}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Profiles</Text>
              <Text style={styles.statusValue}>{agentStatus.user_profiles_count}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Version</Text>
              <Text style={styles.statusValue}>{agentStatus.model_version}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Training</Text>
              <Text style={styles.statusValue}>
                {agentStatus.is_training ? 'Running' : 'Idle'}
              </Text>
            </View>
          </View>

          {agentStatus.last_training_time && (
            <Text style={styles.lastTraining}>
              Last training: {formatTimestamp(agentStatus.last_training_time)}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderCuratedArticle = (article: CuratedArticle) => (
    <Card key={article.id} style={styles.articleCard}>
      <Card.Content>
        <View style={styles.articleHeader}>
          <View style={styles.scoreContainer}>
            <Badge 
              style={styles.scoreBadge}
            >
              {`${(article.curation_score * 100).toFixed(0)}%`}
            </Badge>
            <Text style={styles.scoreLabel}>{getScoreLabel(article.curation_score)}</Text>
          </View>
          
          <View style={styles.confidenceContainer}>
            <IconButton icon="brain" size={16} />
            <Text style={styles.confidenceText}>
              {(article.confidence_level * 100).toFixed(0)}% confidence
            </Text>
          </View>
        </View>

        <Paragraph style={styles.curationReason}>
          {article.curation_reason}
        </Paragraph>

        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <IconButton icon="trending-up" size={16} />
            <Text style={styles.metricText}>
              Expected engagement: {(article.expected_engagement * 100).toFixed(0)}%
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <IconButton icon="clock" size={16} />
            <Text style={styles.metricText}>
              Optimal timing: {article.optimal_timing.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.audienceContainer}>
          <Text style={styles.audienceLabel}>Target Audience:</Text>
          <View style={styles.audienceChips}>
            {article.target_audience.map((audience, index) => (
              <Chip 
                key={index} 
                mode="outlined" 
                compact
                style={styles.audienceChip}
              >
                {audience.replace('_', ' ')}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.articleFooter}>
          <Text style={styles.timestamp}>
            Curated: {formatTimestamp(article.created_at)}
          </Text>
          
          {onArticlePress && (
            <Button 
              mode="contained" 
              compact
              onPress={() => onArticlePress(article.article_id)}
              style={styles.viewButton}
            >
              View Article
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading curated articles...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {renderAgentStatus()}
      
      <View style={styles.headerContainer}>
        <Title style={styles.headerTitle}>AI-Curated Articles</Title>
        <Text style={styles.headerSubtitle}>
          Articles selected by our independent ML agent based on learning patterns
        </Text>
      </View>

      {curatedArticles.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <View style={styles.emptyContainer}>
              <IconButton icon="robot-happy" size={48} />
              <Title style={styles.emptyTitle}>No Articles Yet</Title>
              <Paragraph style={styles.emptyText}>
                The ML agent is learning from platform data. Articles will appear here as it curates content.
              </Paragraph>
              <Button 
                mode="outlined" 
                onPress={onRefresh}
                style={styles.refreshButton}
              >
                Refresh
              </Button>
            </View>
          </Card.Content>
        </Card>
      ) : (
        <View style={styles.articlesContainer}>
          {curatedArticles.map(renderCuratedArticle)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusCard: {
    margin: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    borderRadius: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  lastTraining: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  articlesContainer: {
    paddingHorizontal: 16,
  },
  articleCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBadge: {
    borderRadius: 12,
    marginRight: 8,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
  },
  curationReason: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  metricsContainer: {
    marginBottom: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricText: {
    fontSize: 12,
    color: '#666',
  },
  audienceContainer: {
    marginBottom: 12,
  },
  audienceLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  audienceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  audienceChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  viewButton: {
    borderRadius: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyCard: {
    margin: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  refreshButton: {
    borderRadius: 16,
  },
});
