import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Card, Chip, Searchbar, ActivityIndicator, Divider, RadioButton } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { getJSECompanies, searchCompanies, type JSECompany } from "../../lib/services/jse-service";
import { SimpleLogo } from "../../components/SimpleLogo";

export default function AnalysisScreen() {
  const router = useRouter();
  const [companies, setCompanies] = useState<JSECompany[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<JSECompany[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<JSECompany[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('bullish_thesis');

  const sectors = [
    'Financial Services',
    'Insurance', 
    'Utilities',
    'Consumer Goods',
    'Transportation',
    'Materials',
    'Agriculture'
  ];

  const analysisTemplates = [
    {
      id: 'bullish_thesis',
      name: 'Bullish Thesis',
      description: 'Analyze positive factors and growth potential',
      icon: 'trending-up'
    },
    {
      id: 'bearish_thesis',
      name: 'Bearish Thesis',
      description: 'Identify risks and negative factors',
      icon: 'trending-down'
    },
    {
      id: 'event_analysis',
      name: 'Event Impact Analysis',
      description: 'Analyze specific events and their market impact',
      icon: 'calendar-alert'
    },
    {
      id: 'company_comparison',
      name: 'Company Comparison',
      description: 'Compare multiple companies side by side',
      icon: 'compare'
    },
    {
      id: 'sector_analysis',
      name: 'Sector Analysis',
      description: 'Analyze entire sector trends and opportunities',
      icon: 'chart-line'
    },
    {
      id: 'market_research',
      name: 'Market Research',
      description: 'General market research and trends',
      icon: 'magnify'
    }
  ];

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [searchQuery, selectedSector, companies]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getJSECompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = async () => {
    let filtered = companies;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = await searchCompanies(searchQuery);
    }

    // Filter by sector
    if (selectedSector) {
      filtered = filtered.filter(company => company.sector === selectedSector);
    }

    setFilteredCompanies(filtered);
  };

  const toggleCompanySelection = (company: JSECompany) => {
    setSelectedCompanies(prev => {
      const isSelected = prev.some(c => c.id === company.id);
      if (isSelected) {
        return prev.filter(c => c.id !== company.id);
      } else {
        return [...prev, company];
      }
    });
  };

  const startAnalysis = () => {
    if (selectedCompanies.length === 0) {
      return;
    }
    
    const sessionId = String(Date.now());
    // Pass selected companies and template as parameters
    const companyIds = selectedCompanies.map(c => c.id).join(',');
    router.push(`/analysis-session/${sessionId}?companies=${companyIds}&template=${selectedTemplate}`);
  };

  const clearSelection = () => {
    setSelectedCompanies([]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={{ marginTop: 16 }}>Loading JSE companies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SimpleLogo size="medium" showText={false} />
        <Text variant="headlineMedium">Analysis Mode</Text>
        <Text variant="bodyMedium">Select companies and analysis template</Text>
      </View>

      {/* Analysis Template Selection */}
      <Card style={styles.templateCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.templateTitle}>
            Choose Analysis Template
          </Text>
          <View style={styles.templateGrid}>
            {analysisTemplates.map((template) => (
              <Card
                key={template.id}
                style={[
                  styles.templateOption,
                  selectedTemplate === template.id && styles.selectedTemplate
                ]}
                onPress={() => setSelectedTemplate(template.id)}
              >
                <Card.Content style={styles.templateContent}>
                  <View style={styles.templateHeader}>
                    <Text variant="titleSmall" style={styles.templateName}>
                      {template.name}
                    </Text>
                    <RadioButton
                      value={template.id}
                      status={selectedTemplate === template.id ? 'checked' : 'unchecked'}
                      onPress={() => setSelectedTemplate(template.id)}
                    />
                  </View>
                  <Text variant="bodySmall" style={styles.templateDescription}>
                    {template.description}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Search and Filters */}
      <Card style={styles.searchCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search companies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchbar}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectorChips}>
            <Chip
              mode={selectedSector === null ? "flat" : "outlined"}
              onPress={() => setSelectedSector(null)}
              style={styles.sectorChip}
            >
              All Sectors
            </Chip>
            {sectors.map(sector => (
              <Chip
                key={sector}
                mode={selectedSector === sector ? "flat" : "outlined"}
                onPress={() => setSelectedSector(sector)}
                style={styles.sectorChip}
              >
                {sector}
              </Chip>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Selected Companies */}
      {selectedCompanies.length > 0 && (
        <Card style={styles.selectedCard}>
          <Card.Content>
            <View style={styles.selectedHeader}>
              <Text variant="titleMedium">Selected Companies ({selectedCompanies.length})</Text>
              <Button mode="text" onPress={clearSelection}>Clear All</Button>
            </View>
            <View style={styles.selectedChips}>
              {selectedCompanies.map(company => (
                <Chip
                  key={company.id}
                  mode="flat"
                  onClose={() => toggleCompanySelection(company)}
                  style={styles.selectedChip}
                >
                  {company.symbol}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Company List */}
      <FlashList
        data={filteredCompanies}
        keyExtractor={(item) => item.id}
        estimatedItemSize={100}
        renderItem={({ item }) => (
          <Card 
            style={[
              styles.companyCard,
              selectedCompanies.some(c => c.id === item.id) && styles.selectedCompanyCard
            ]}
          >
            <Card.Content>
              <View style={styles.companyHeader}>
                <View style={styles.companyInfo}>
                  <Text variant="titleMedium">{item.name}</Text>
                  <Text variant="labelLarge" style={styles.symbol}>{item.symbol}</Text>
                  <Text variant="bodySmall" style={styles.sector}>{item.sector}</Text>
                </View>
                <Button
                  mode={selectedCompanies.some(c => c.id === item.id) ? "contained" : "outlined"}
                  onPress={() => toggleCompanySelection(item)}
                  compact
                >
                  {selectedCompanies.some(c => c.id === item.id) ? "Selected" : "Select"}
                </Button>
              </View>
              <Text variant="bodySmall" style={styles.description}>
                {item.description}
              </Text>
            </Card.Content>
          </Card>
        )}
      />

      {/* Analysis Button */}
      {selectedCompanies.length > 0 && (
        <View style={styles.analysisContainer}>
          <Divider style={styles.divider} />
          <Button
            mode="contained"
            onPress={startAnalysis}
            style={styles.analysisButton}
            icon="robot"
            disabled={selectedCompanies.length === 0}
          >
            Analyze {selectedCompanies.length} Companies with AI
          </Button>
        </View>
      )}
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
  header: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchCard: {
    margin: 16,
    marginBottom: 8,
  },
  searchbar: {
    marginBottom: 12,
  },
  sectorChips: {
    marginTop: 8,
  },
  sectorChip: {
    marginRight: 8,
  },
  selectedCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#E8F5E8',
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  companyCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  selectedCompanyCard: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
  description: {
    color: '#666',
    lineHeight: 18,
  },
  analysisContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  divider: {
    marginBottom: 16,
  },
  analysisButton: {
    paddingVertical: 8,
  },
  templateCard: {
    margin: 16,
    marginBottom: 8,
  },
  templateTitle: {
    marginBottom: 16,
    color: '#1976D2',
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templateOption: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 8,
  },
  selectedTemplate: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
    borderWidth: 2,
  },
  templateContent: {
    padding: 12,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    flex: 1,
    fontWeight: '600',
  },
  templateDescription: {
    color: '#666',
    lineHeight: 16,
  },
});


