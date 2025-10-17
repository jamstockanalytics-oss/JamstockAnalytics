import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, IconButton, ProgressBar, Chip, Badge } from 'react-native-paper';
import { mlAgentService } from '../../lib/services/ml-agent-service';

interface MLAgentDashboardProps {
  onForceTraining?: () => void;
  onViewPatterns?: () => void;
  onViewCuratedArticles?: () => void;
}

export function MLAgentDashboard({
  onForceTraining,
  onViewPatterns,
  onViewCuratedArticles
}: MLAgentDashboardProps) {
  const [agentStatus, setAgentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trainingInProgress, setTrainingInProgress] = useState(false);

  useEffect(() => {
    loadAgentStatus();
  }, []);

  const loadAgentStatus = async () => {
    try {
      setLoading(true);
      const status = await mlAgentService.getAgentStatus();
      setAgentStatus(status);
    } catch (error) {
      console.error('Error loading agent status:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAgentStatus();
    setRefreshing(false);
  };

  const handleForceTraining = async () => {
    if (trainingInProgress) return;
    
    setTrainingInProgress(true);
    try {
      await mlAgentService.forceTraining();
      await loadAgentStatus();
      onForceTraining?.();
    } catch (error) {
      console.error('Error forcing training:', error);
    } finally {
      setTrainingInProgress(false);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusColor = (status: boolean): string => {
    return status ? '#4CAF50' : '#F44336';
  };

  const getStatusText = (status: boolean): string => {
    return status ? 'Active' : 'Inactive';
  };

  const renderStatusCard = () => {
    if (!agentStatus) return null;

    return (
      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <IconButton icon="robot" size={32} />
            <View style={styles.statusInfo}>
              <Title style={styles.statusTitle}>ML Agent Status</Title>
              <Badge 
                style={[
                  styles.statusBadge, 
                  { backgroundColor: getStatusColor(agentStatus.is_active) }
                ]}
              >
                {getStatusText(agentStatus.is_active)}
              </Badge>
            </View>
          </View>

          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Model Version</Text>
              <Text style={styles.statusValue}>{agentStatus.model_version}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Training Status</Text>
              <Text style={[
                styles.statusValue,
                { color: agentStatus.is_training ? '#FF9800' : '#4CAF50' }
              ]}>
                {agentStatus.is_training ? 'Running' : 'Idle'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Learning Patterns</Text>
              <Text style={styles.statusValue}>{agentStatus.learning_patterns_count}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>User Profiles</Text>
              <Text style={styles.statusValue}>{agentStatus.user_profiles_count}</Text>
            </View>
          </View>

          <View style={styles.trainingInfo}>
            <Text style={styles.trainingLabel}>Last Training</Text>
            <Text style={styles.trainingValue}>
              {formatTimestamp(agentStatus.last_training_time)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderMetricsCard = () => {
    if (!agentStatus) return null;

    return (
      <Card style={styles.metricsCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Learning Metrics</Title>
          
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Confidence Threshold</Text>
              <Text style={styles.metricValue}>
                {(agentStatus.confidence_threshold * 100).toFixed(0)}%
              </Text>
            </View>
            <ProgressBar 
              progress={agentStatus.confidence_threshold} 
              color="#2196F3"
              style={styles.progressBar}
            />
          </View>

          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Pattern Coverage</Text>
              <Text style={styles.metricValue}>
                {agentStatus.learning_patterns_count > 0 ? 'Good' : 'Learning'}
              </Text>
            </View>
            <ProgressBar 
              progress={Math.min(agentStatus.learning_patterns_count / 10, 1)} 
              color="#4CAF50"
              style={styles.progressBar}
            />
          </View>

          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>User Profile Coverage</Text>
              <Text style={styles.metricValue}>
                {agentStatus.user_profiles_count > 0 ? 'Active' : 'Building'}
              </Text>
            </View>
            <ProgressBar 
              progress={Math.min(agentStatus.user_profiles_count / 5, 1)} 
              color="#FF9800"
              style={styles.progressBar}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderActionsCard = () => (
    <Card style={styles.actionsCard}>
      <Card.Content>
        <Title style={styles.cardTitle}>Agent Actions</Title>
        
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={handleForceTraining}
            disabled={trainingInProgress}
            loading={trainingInProgress}
            style={styles.actionButton}
            icon="brain"
          >
            {trainingInProgress ? 'Training...' : 'Force Training'}
          </Button>

          <Button
            mode="outlined"
            onPress={onViewPatterns || (() => {})}
            style={styles.actionButton}
            icon="chart-line"
          >
            View Patterns
          </Button>

          <Button
            mode="outlined"
            onPress={onViewCuratedArticles || (() => {})}
            style={styles.actionButton}
            icon="newspaper"
          >
            View Curated Articles
          </Button>
        </View>

        <View style={styles.actionInfo}>
          <Chip 
            icon="information" 
            mode="outlined"
            style={styles.infoChip}
          >
            Agent operates independently
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  const renderLearningInsights = () => (
    <Card style={styles.insightsCard}>
      <Card.Content>
        <Title style={styles.cardTitle}>Learning Insights</Title>
        
        <View style={styles.insightItem}>
          <IconButton icon="lightbulb" size={20} />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Pattern Recognition</Text>
            <Text style={styles.insightText}>
              The agent learns from user interactions, article performance, and market data to identify patterns.
            </Text>
          </View>
        </View>

        <View style={styles.insightItem}>
          <IconButton icon="chart-timeline" size={20} />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Continuous Learning</Text>
            <Text style={styles.insightText}>
              Training occurs automatically every 6 hours when sufficient data is available.
            </Text>
          </View>
        </View>

        <View style={styles.insightItem}>
          <IconButton icon="target" size={20} />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Article Curation</Text>
            <Text style={styles.insightText}>
              Articles are automatically curated based on learned patterns and predicted engagement.
            </Text>
          </View>
        </View>

        <View style={styles.insightItem}>
          <IconButton icon="account-group" size={20} />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>User Personalization</Text>
            <Text style={styles.insightText}>
              The agent builds user profiles to provide personalized content recommendations.
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <IconButton icon="robot" size={48} />
        <Text style={styles.loadingText}>Loading ML Agent Dashboard...</Text>
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
      <View style={styles.headerContainer}>
        <Title style={styles.headerTitle}>ML Agent Dashboard</Title>
        <Paragraph style={styles.headerSubtitle}>
          Monitor and manage the independent machine learning agent
        </Paragraph>
      </View>

      {renderStatusCard()}
      {renderMetricsCard()}
      {renderActionsCard()}
      {renderLearningInsights()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
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
  statusCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fff',
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
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
    marginBottom: 16,
  },
  statusItem: {
    width: '48%',
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
  trainingInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  trainingLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  trainingValue: {
    fontSize: 14,
    color: '#333',
  },
  metricsCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fff',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  metricItem: {
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#333',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fff',
    elevation: 2,
  },
  actionButtons: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
  actionInfo: {
    alignItems: 'center',
  },
  infoChip: {
    borderRadius: 16,
  },
  insightsCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fff',
    elevation: 2,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  insightContent: {
    flex: 1,
    marginLeft: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
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
    marginTop: 16,
  },
});
