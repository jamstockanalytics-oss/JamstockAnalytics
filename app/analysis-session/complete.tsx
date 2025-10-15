import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Card, Chip, Divider, ProgressBar } from "react-native-paper";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { SimpleLogo } from "../../components/SimpleLogo";

export default function SessionCompleteScreen() {
  const router = useRouter();
  const { sessionId, duration, articlesAnalyzed, template } = useLocalSearchParams<{
    sessionId?: string;
    duration?: string;
    articlesAnalyzed?: string;
    template?: string;
  }>();

  const [sessionData, setSessionData] = useState({
    duration: duration || "25 minutes",
    articlesAnalyzed: parseInt(articlesAnalyzed || "3"),
    template: template || "bullish_thesis",
    keyTakeaways: [
      "Strong financial performance indicators",
      "Positive market sentiment",
      "Growth potential identified",
      "Risk factors assessed"
    ],
    recommendations: [
      "Consider long-term position",
      "Monitor quarterly earnings",
      "Watch for market volatility"
    ]
  });

  const getTemplateName = (templateId: string) => {
    const templates: Record<string, string> = {
      'bullish_thesis': 'Bullish Thesis',
      'bearish_thesis': 'Bearish Thesis',
      'event_analysis': 'Event Impact Analysis',
      'company_comparison': 'Company Comparison',
      'sector_analysis': 'Sector Analysis',
      'market_research': 'Market Research'
    };
    return templates[templateId] || 'Analysis';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <SimpleLogo size="medium" showText={false} />
        <Text variant="headlineMedium" style={styles.title}>
          🎉 Session Complete!
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Great work on your {getTemplateName(sessionData.template)} analysis
        </Text>
      </View>

      {/* Session Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.summaryTitle}>
            Session Summary
          </Text>
          
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statValue}>
                {sessionData.duration}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Duration
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statValue}>
                {sessionData.articlesAnalyzed}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Articles Analyzed
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statValue}>
                {sessionData.template.replace('_', ' ').toUpperCase()}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Analysis Type
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Key Takeaways */}
      <Card style={styles.takeawaysCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.takeawaysTitle}>
            Key Takeaways
          </Text>
          <View style={styles.takeawaysList}>
            {sessionData.keyTakeaways.map((takeaway, index) => (
              <View key={index} style={styles.takeawayItem}>
                <Text variant="bodyMedium" style={styles.takeawayText}>
                  • {takeaway}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Recommendations */}
      <Card style={styles.recommendationsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.recommendationsTitle}>
            AI Recommendations
          </Text>
          <View style={styles.recommendationsList}>
            {sessionData.recommendations.map((recommendation, index) => (
              <Chip key={index} style={styles.recommendationChip}>
                {recommendation}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={() => router.push('/(tabs)/analysis')}
          style={styles.actionButton}
          icon="plus"
        >
          Start New Session
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => router.push('/(tabs)')}
          style={styles.actionButton}
          icon="home"
        >
          Take a Break
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => router.push('/(tabs)/chat')}
          style={styles.actionButton}
          icon="chat"
        >
          Discuss Results in Chat
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  title: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    color: '#2E7D32',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  summaryCard: {
    margin: 16,
    backgroundColor: '#E8F5E8',
  },
  summaryTitle: {
    marginBottom: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  takeawaysCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#F0F8FF',
  },
  takeawaysTitle: {
    marginBottom: 16,
    color: '#1976D2',
    fontWeight: '600',
  },
  takeawaysList: {
    gap: 8,
  },
  takeawayItem: {
    marginBottom: 4,
  },
  takeawayText: {
    lineHeight: 20,
  },
  recommendationsCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#FFF3E0',
  },
  recommendationsTitle: {
    marginBottom: 16,
    color: '#F57C00',
    fontWeight: '600',
  },
  recommendationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recommendationChip: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});


