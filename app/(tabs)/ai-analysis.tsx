import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Card, Chip, ProgressBar, Divider, Surface } from "react-native-paper";
import { Link } from "expo-router";
import { useState, useEffect } from "react";
import { ProModeGate } from "../../components/ProModeGate";

export default function AIAnalysisScreen() {
  const [marketSentiment, setMarketSentiment] = useState({
    overall: 0.65,
    bullish: 0.45,
    bearish: 0.35,
    neutral: 0.20
  });

  const [redFlags, setRedFlags] = useState([
    {
      id: 1,
      company: "NCB Financial Group",
      ticker: "NCBFG",
      risk: "High",
      reason: "Declining quarterly earnings",
      impact: "Negative",
      confidence: 0.85
    },
    {
      id: 2,
      company: "Sagicor Group Jamaica",
      ticker: "SJ",
      risk: "Medium",
      reason: "Regulatory concerns",
      impact: "Moderate",
      confidence: 0.72
    },
    {
      id: 3,
      company: "Guardian Holdings",
      ticker: "GHL",
      risk: "Low",
      reason: "Management changes",
      impact: "Minimal",
      confidence: 0.58
    }
  ]);

  const getSentimentColor = (value: number) => {
    if (value > 0.6) return "#4CAF50"; // Green
    if (value > 0.4) return "#FF9800"; // Orange
    return "#F44336"; // Red
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High": return "#F44336";
      case "Medium": return "#FF9800";
      case "Low": return "#4CAF50";
      default: return "#666666";
    }
  };

  return (
    <ProModeGate feature="AI Market Analysis">
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            AI Market Analysis
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Real-time market sentiment and risk assessment
          </Text>
        </View>

      {/* Market Sentiment Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            📊 Market Sentiment Analysis
          </Text>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            AI-powered sentiment analysis of Jamaica Stock Exchange
          </Text>
          
          <View style={styles.sentimentContainer}>
            <View style={styles.sentimentItem}>
              <Text variant="bodyMedium">Overall Sentiment</Text>
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={marketSentiment.overall} 
                  color={getSentimentColor(marketSentiment.overall)}
                  style={styles.progressBar}
                />
                <Text variant="bodySmall" style={styles.progressText}>
                  {Math.round(marketSentiment.overall * 100)}% Positive
                </Text>
              </View>
            </View>

            <View style={styles.sentimentBreakdown}>
              <View style={styles.sentimentRow}>
                <Text variant="bodySmall">Bullish</Text>
                <Chip 
                  mode="outlined" 
                  style={[styles.chip, { backgroundColor: '#E8F5E8' }]}
                >
                  {Math.round(marketSentiment.bullish * 100)}%
                </Chip>
              </View>
              <View style={styles.sentimentRow}>
                <Text variant="bodySmall">Bearish</Text>
                <Chip 
                  mode="outlined" 
                  style={[styles.chip, { backgroundColor: '#FFEBEE' }]}
                >
                  {Math.round(marketSentiment.bearish * 100)}%
                </Chip>
              </View>
              <View style={styles.sentimentRow}>
                <Text variant="bodySmall">Neutral</Text>
                <Chip 
                  mode="outlined" 
                  style={[styles.chip, { backgroundColor: '#F5F5F5' }]}
                >
                  {Math.round(marketSentiment.neutral * 100)}%
                </Chip>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Red Flag Investments Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            🚨 Red Flag Investments
          </Text>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            AI-identified investment risks and concerns
          </Text>
          
          <View style={styles.redFlagsContainer}>
            {redFlags.map((flag) => (
              <Surface key={flag.id} style={styles.redFlagCard} elevation={2}>
                <View style={styles.redFlagHeader}>
                  <View>
                    <Text variant="titleMedium">{flag.company}</Text>
                    <Text variant="bodySmall" style={styles.ticker}>
                      {flag.ticker}
                    </Text>
                  </View>
                  <Chip 
                    mode="outlined"
                    style={[styles.riskChip, { backgroundColor: getRiskColor(flag.risk) + '20' }]}
                    textStyle={{ color: getRiskColor(flag.risk) }}
                  >
                    {flag.risk} Risk
                  </Chip>
                </View>
                
                <Text variant="bodyMedium" style={styles.redFlagReason}>
                  {flag.reason}
                </Text>
                
                <View style={styles.redFlagFooter}>
                  <Text variant="bodySmall" style={styles.impactText}>
                    Impact: {flag.impact}
                  </Text>
                  <Text variant="bodySmall" style={styles.confidenceText}>
                    Confidence: {Math.round(flag.confidence * 100)}%
                  </Text>
                </View>
              </Surface>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* AI Insights Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            🤖 AI Market Insights
          </Text>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            Key insights from AI analysis of market data
          </Text>
          
          <View style={styles.insightsContainer}>
            <Surface style={styles.insightCard} elevation={1}>
              <Text variant="titleSmall" style={styles.insightTitle}>
                Market Trend
              </Text>
              <Text variant="bodyMedium">
                JSE showing mixed signals with financial sector under pressure
              </Text>
            </Surface>
            
            <Surface style={styles.insightCard} elevation={1}>
              <Text variant="titleSmall" style={styles.insightTitle}>
                Sector Performance
              </Text>
              <Text variant="bodyMedium">
                Banking sector leading gains, insurance sector showing volatility
              </Text>
            </Surface>
            
            <Surface style={styles.insightCard} elevation={1}>
              <Text variant="titleSmall" style={styles.insightTitle}>
                Risk Assessment
              </Text>
              <Text variant="bodyMedium">
                Moderate risk environment with focus on regulatory changes
              </Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Link href="/analysis-session/new" asChild>
          <Button mode="contained" style={styles.actionButton}>
            Start Deep Analysis
          </Button>
        </Link>
        
        <Button mode="outlined" style={styles.actionButton}>
          Export Report
        </Button>
      </View>
    </ScrollView>
    </ProModeGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#667eea',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  sectionCard: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#333333',
  },
  sectionDescription: {
    color: '#666666',
    marginBottom: 16,
  },
  sentimentContainer: {
    gap: 16,
  },
  sentimentItem: {
    gap: 8,
  },
  progressContainer: {
    gap: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'right',
    color: '#666666',
  },
  sentimentBreakdown: {
    gap: 8,
  },
  sentimentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    height: 28,
  },
  redFlagsContainer: {
    gap: 12,
  },
  redFlagCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  redFlagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticker: {
    color: '#666666',
  },
  riskChip: {
    height: 32,
  },
  redFlagReason: {
    marginBottom: 12,
    color: '#333333',
  },
  redFlagFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactText: {
    color: '#666666',
  },
  confidenceText: {
    color: '#666666',
  },
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  insightTitle: {
    marginBottom: 8,
    color: '#333333',
    fontWeight: '600',
  },
  actionContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
  },
});
