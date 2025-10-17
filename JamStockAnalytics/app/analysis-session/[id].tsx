import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Card, Chip, ProgressBar } from "react-native-paper";
import { FlashList } from "@shopify/flash-list";
import { getJSECompanies, type JSECompany } from "../../lib/services/jse-service";
import { analyzeCompany, compareCompanies } from "../../lib/services/company-analysis-service";
import { type CompanyAnalysis } from "../../lib/services/jse-service";
import { SimpleLogo } from "../../components/SimpleLogo";

export default function AnalysisSessionScreen() {
  const { companies } = useLocalSearchParams<{ id: string; companies?: string }>();
  const router = useRouter();
  
  const [selectedCompanies, setSelectedCompanies] = useState<JSECompany[]>([]);
  const [analyses, setAnalyses] = useState<CompanyAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState<string>("");
  const [comparison, setComparison] = useState<any>(null);

  useEffect(() => {
    loadSelectedCompanies();
  }, [companies]);

  useEffect(() => {
    if (selectedCompanies.length > 0) {
      performAnalysis();
    }
  }, [selectedCompanies]);

  const loadSelectedCompanies = async () => {
    if (!companies) return;
    
    try {
      setLoading(true);
      const companyIds = companies.split(',');
      const allCompanies = await getJSECompanies();
      const selected = allCompanies.filter(company => companyIds.includes(company.id));
      setSelectedCompanies(selected);
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const performAnalysis = async () => {
    try {
      setLoading(true);
      const analysisResults: CompanyAnalysis[] = [];
      
      for (let i = 0; i < selectedCompanies.length; i++) {
        const company = selectedCompanies[i];
        if (!company) continue;
        
        setCurrentAnalysis(`Analyzing ${company.name}...`);
        setAnalysisProgress((i / selectedCompanies.length) * 100);
        
        const analysis = await analyzeCompany({
          company,
          analysis_type: 'comprehensive',
          time_horizon: 'medium'
        });
        
        analysisResults.push(analysis);
      }
      
      setAnalyses(analysisResults);
      
      // Perform comparison if multiple companies
      if (selectedCompanies.length > 1) {
        setCurrentAnalysis("Comparing companies...");
        const comparisonResult = await compareCompanies(selectedCompanies);
        setComparison(comparisonResult);
      }
      
      setAnalysisProgress(100);
      setCurrentAnalysis("Analysis complete!");
      
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'STRONG_BUY': return '#4CAF50';
      case 'BUY': return '#8BC34A';
      case 'HOLD': return '#FF9800';
      case 'SELL': return '#F44336';
      case 'STRONG_SELL': return '#D32F2F';
      default: return '#666';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4CAF50';
    if (score >= 6) return '#FF9800';
    return '#F44336';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <SimpleLogo size="large" showText={true} />
        <Text variant="headlineMedium" style={styles.loadingTitle}>AI Analysis in Progress</Text>
        <ProgressBar 
          progress={analysisProgress / 100} 
          style={styles.progressBar}
        />
        <Text variant="bodyMedium" style={styles.progressText}>
          {currentAnalysis}
        </Text>
        <Text variant="bodySmall" style={styles.progressSubtext}>
          Analyzing {selectedCompanies.length} companies...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SimpleLogo size="medium" showText={false} />
        <Text variant="headlineMedium">AI Analysis Results</Text>
        <Text variant="bodyMedium">{selectedCompanies.length} companies analyzed</Text>
      </View>

      {/* Comparison Summary */}
      {comparison && (
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.summaryTitle}>Analysis Summary</Text>
            <Text variant="bodyMedium" style={styles.summaryText}>
              {comparison.summary}
            </Text>
            <View style={styles.winnerContainer}>
              <Text variant="titleMedium">Top Performer:</Text>
              <Chip mode="flat" style={styles.winnerChip}>
                {comparison.winner.symbol} - {comparison.winner.name}
              </Chip>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Individual Company Analyses */}
      <FlashList
        data={analyses}
        keyExtractor={(item) => item.company.id}
        renderItem={({ item }) => (
          <Card style={styles.analysisCard}>
            <Card.Content>
              {/* Company Header */}
              <View style={styles.companyHeader}>
                <View style={styles.companyInfo}>
                  <Text variant="titleLarge">{item.company.name}</Text>
                  <Text variant="labelLarge" style={styles.symbol}>{item.company.symbol}</Text>
                  <Text variant="bodySmall" style={styles.sector}>{item.company.sector}</Text>
                </View>
                <View style={styles.scoreContainer}>
                  <Text variant="headlineMedium" style={[styles.score, { color: getScoreColor(item.overall_score) }]}>
                    {item.overall_score}/10
                  </Text>
                  <Chip 
                    mode="flat" 
                    style={[styles.recommendationChip, { backgroundColor: getRecommendationColor(item.recommendation) }]}
                    textStyle={{ color: 'white' }}
                  >
                    {item.recommendation}
                  </Chip>
                </View>
              </View>

              {/* Red Flags */}
              {item.red_flags.length > 0 && (
                <View style={styles.section}>
                  <Text variant="titleMedium" style={styles.redFlagsTitle}>🚨 Red Flags</Text>
                  {item.red_flags.map((flag, index) => (
                    <View key={index} style={styles.redFlagItem}>
                      <Text variant="bodyMedium" style={styles.redFlagText}>• {flag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Strengths */}
              {item.strengths.length > 0 && (
                <View style={styles.section}>
                  <Text variant="titleMedium" style={styles.strengthsTitle}>💪 Strengths</Text>
                  {item.strengths.map((strength, index) => (
                    <View key={index} style={styles.strengthItem}>
                      <Text variant="bodyMedium" style={styles.strengthText}>• {strength}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Opportunities */}
              {item.opportunities.length > 0 && (
                <View style={styles.section}>
                  <Text variant="titleMedium" style={styles.opportunitiesTitle}>🚀 Opportunities</Text>
                  {item.opportunities.map((opportunity, index) => (
                    <View key={index} style={styles.opportunityItem}>
                      <Text variant="bodyMedium" style={styles.opportunityText}>• {opportunity}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Risks */}
              {item.risks.length > 0 && (
                <View style={styles.section}>
                  <Text variant="titleMedium" style={styles.risksTitle}>⚠️ Risks</Text>
                  {item.risks.map((risk, index) => (
                    <View key={index} style={styles.riskItem}>
                      <Text variant="bodyMedium" style={styles.riskText}>• {risk}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* AI Insights */}
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.insightsTitle}>🤖 AI Insights</Text>
                <Text variant="bodyMedium" style={styles.insightsText}>
                  {item.ai_insights}
                </Text>
              </View>

              {/* Confidence Level */}
              <View style={styles.confidenceContainer}>
                <Text variant="bodySmall" style={styles.confidenceLabel}>
                  Confidence Level: {item.confidence_level}/10
                </Text>
                <ProgressBar 
                  progress={item.confidence_level / 10} 
                  style={styles.confidenceBar}
                />
              </View>
            </Card.Content>
          </Card>
        )}
      />

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={() => router.push('/(tabs)/chat')}
          style={styles.actionButton}
          icon="chat"
        >
          Discuss Results in Chat
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.push('/(tabs)/analysis')}
          style={styles.actionButton}
          icon="refresh"
        >
          New Analysis
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loadingTitle: {
    marginTop: 16,
    marginBottom: 24,
  },
  progressBar: {
    width: '80%',
    marginBottom: 16,
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  progressSubtext: {
    textAlign: 'center',
    color: '#666',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  summaryCard: {
    margin: 16,
    backgroundColor: '#E8F5E8',
  },
  summaryTitle: {
    marginBottom: 8,
    color: '#2E7D32',
  },
  summaryText: {
    marginBottom: 12,
    lineHeight: 22,
  },
  winnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  winnerChip: {
    backgroundColor: '#4CAF50',
  },
  analysisCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  companyInfo: {
    flex: 1,
    marginRight: 12,
  },
  symbol: {
    color: '#666',
    fontWeight: '600',
  },
  sector: {
    color: '#999',
    textTransform: 'uppercase',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendationChip: {
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  redFlagsTitle: {
    color: '#D32F2F',
    marginBottom: 8,
  },
  redFlagItem: {
    marginBottom: 4,
  },
  redFlagText: {
    color: '#D32F2F',
  },
  strengthsTitle: {
    color: '#2E7D32',
    marginBottom: 8,
  },
  strengthItem: {
    marginBottom: 4,
  },
  strengthText: {
    color: '#2E7D32',
  },
  opportunitiesTitle: {
    color: '#1976D2',
    marginBottom: 8,
  },
  opportunityItem: {
    marginBottom: 4,
  },
  opportunityText: {
    color: '#1976D2',
  },
  risksTitle: {
    color: '#FF9800',
    marginBottom: 8,
  },
  riskItem: {
    marginBottom: 4,
  },
  riskText: {
    color: '#FF9800',
  },
  insightsTitle: {
    color: '#7B1FA2',
    marginBottom: 8,
  },
  insightsText: {
    lineHeight: 22,
    color: '#333',
  },
  confidenceContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  confidenceLabel: {
    marginBottom: 8,
    color: '#666',
  },
  confidenceBar: {
    height: 6,
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});


