import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button, ActivityIndicator, ProgressBar, Chip } from "react-native-paper";
import { 
  getStockPrice, 
  getHistoricalData, 
  getJSEMarketStatus,
  type JSEStockData 
} from "../../lib/services/jse-data-service";
import { SimpleLogo } from "../../components/SimpleLogo";

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  
  const [stockData, setStockData] = useState<JSEStockData | null>(null);
  const [historicalData, setHistoricalData] = useState<{ date: string; price: number; volume: number }[]>([]);
  const [marketStatus, setMarketStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (symbol) {
      loadStockData();
    }
  }, [symbol]);

  const loadStockData = async () => {
    try {
      setLoading(true);
      const [stock, historical, status] = await Promise.all([
        getStockPrice(symbol!),
        getHistoricalData(symbol!, '1M'),
        getJSEMarketStatus()
      ]);
      
      setStockData(stock);
      setHistoricalData(historical);
      setMarketStatus(status);
    } catch (error) {
      console.error('Failed to load stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return '#4CAF50';
    if (change < 0) return '#F44336';
    return '#666';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  const formatCurrency = (value: number) => {
    return `J$${value.toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={{ marginTop: 16 }}>Loading stock data...</Text>
      </View>
    );
  }

  if (!stockData) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge">Stock not found.</Text>
        <Button mode="outlined" onPress={() => router.back()} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <SimpleLogo size="medium" showText={false} />
        <Text variant="headlineMedium">{stockData.symbol}</Text>
        <Text variant="bodyMedium">{stockData.name}</Text>
      </View>

      {/* Current Price */}
      <Card style={styles.priceCard}>
        <Card.Content>
          <View style={styles.priceHeader}>
            <View style={styles.priceInfo}>
              <Text variant="headlineLarge" style={styles.currentPrice}>
                {formatCurrency(stockData.last_price)}
              </Text>
              <Text variant="bodyLarge" style={[styles.priceChange, { color: getChangeColor(stockData.change) }]}>
                {getChangeIcon(stockData.change)} {formatCurrency(Math.abs(stockData.change))} ({stockData.change_percent.toFixed(2)}%)
              </Text>
            </View>
            <Chip 
              mode="flat" 
              style={{ backgroundColor: marketStatus?.is_open ? '#4CAF50' : '#F44336' }}
              textStyle={{ color: 'white' }}
            >
              {marketStatus?.is_open ? 'LIVE' : 'CLOSED'}
            </Chip>
          </View>
          <Text variant="bodySmall" style={styles.lastUpdated}>
            Last updated: {new Date(stockData.last_updated).toLocaleString()}
          </Text>
        </Card.Content>
      </Card>

      {/* Trading Data */}
      <Card style={styles.tradingCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Trading Data</Text>
          <View style={styles.tradingGrid}>
            <View style={styles.tradingItem}>
              <Text variant="bodySmall" style={styles.tradingLabel}>Open</Text>
              <Text variant="titleMedium">{formatCurrency(stockData.open)}</Text>
            </View>
            <View style={styles.tradingItem}>
              <Text variant="bodySmall" style={styles.tradingLabel}>High</Text>
              <Text variant="titleMedium" style={{ color: '#4CAF50' }}>
                {formatCurrency(stockData.high)}
              </Text>
            </View>
            <View style={styles.tradingItem}>
              <Text variant="bodySmall" style={styles.tradingLabel}>Low</Text>
              <Text variant="titleMedium" style={{ color: '#F44336' }}>
                {formatCurrency(stockData.low)}
              </Text>
            </View>
            <View style={styles.tradingItem}>
              <Text variant="bodySmall" style={styles.tradingLabel}>Previous Close</Text>
              <Text variant="titleMedium">{formatCurrency(stockData.previous_close)}</Text>
            </View>
            <View style={styles.tradingItem}>
              <Text variant="bodySmall" style={styles.tradingLabel}>Volume</Text>
              <Text variant="titleMedium">{formatVolume(stockData.volume)}</Text>
            </View>
            <View style={styles.tradingItem}>
              <Text variant="bodySmall" style={styles.tradingLabel}>Day Range</Text>
              <Text variant="titleMedium">
                {formatCurrency(stockData.low)} - {formatCurrency(stockData.high)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Company Information */}
      <Card style={styles.companyCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Company Information</Text>
          <View style={styles.companyInfo}>
            <View style={styles.companyItem}>
              <Text variant="bodySmall" style={styles.companyLabel}>Market Cap</Text>
              <Text variant="bodyMedium">
                {stockData.market_cap ? `J$${(stockData.market_cap / 1000000000).toFixed(1)}B` : 'N/A'}
              </Text>
            </View>
            <View style={styles.companyItem}>
              <Text variant="bodySmall" style={styles.companyLabel}>P/E Ratio</Text>
              <Text variant="bodyMedium">{stockData.pe_ratio || 'N/A'}</Text>
            </View>
            <View style={styles.companyItem}>
              <Text variant="bodySmall" style={styles.companyLabel}>Dividend Yield</Text>
              <Text variant="bodyMedium">
                {stockData.dividend_yield ? `${stockData.dividend_yield.toFixed(2)}%` : 'N/A'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Historical Performance */}
      <Card style={styles.historicalCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>30-Day Performance</Text>
          {historicalData.length > 0 && (
            <View style={styles.historicalChart}>
              <View style={styles.chartContainer}>
                {historicalData.slice(-7).map((point, index) => {
                  const maxPrice = Math.max(...historicalData.map(d => d.price));
                  const minPrice = Math.min(...historicalData.map(d => d.price));
                  const height = ((point.price - minPrice) / (maxPrice - minPrice)) * 100;
                  
                  return (
                    <View key={index} style={styles.chartBar}>
                      <View 
                        style={[
                          styles.chartBarFill, 
                          { height: `${height}%` }
                        ]} 
                      />
                      <Text variant="bodySmall" style={styles.chartLabel}>
                        {formatCurrency(point.price)}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.chartLegend}>
                <Text variant="bodySmall" style={styles.legendText}>
                  Last 7 trading days
                </Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Price Movement Analysis */}
      <Card style={styles.analysisCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Price Analysis</Text>
          <View style={styles.analysisContent}>
            <View style={styles.analysisItem}>
              <Text variant="bodyMedium">Price Movement</Text>
              <View style={styles.analysisBar}>
                <ProgressBar 
                  progress={Math.abs(stockData.change_percent) / 10} 
                  style={styles.progressBar}
                  color={getChangeColor(stockData.change)}
                />
                <Text variant="bodySmall" style={styles.analysisText}>
                  {Math.abs(stockData.change_percent).toFixed(2)}% change
                </Text>
              </View>
            </View>
            
            <View style={styles.analysisItem}>
              <Text variant="bodyMedium">Volume Activity</Text>
              <View style={styles.analysisBar}>
                <ProgressBar 
                  progress={stockData.volume / 200000} 
                  style={styles.progressBar}
                  color="#2196F3"
                />
                <Text variant="bodySmall" style={styles.analysisText}>
                  {formatVolume(stockData.volume)} shares traded
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={() => router.push(`/(tabs)/analysis?symbol=${symbol}`)}
          style={styles.actionButton}
          icon="analytics"
        >
          Analyze Stock
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.push(`/(tabs)/chat?query=${symbol} analysis`)}
          style={styles.actionButton}
          icon="chat"
        >
          Ask AI About Stock
        </Button>
      </View>
    </ScrollView>
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
  priceCard: {
    margin: 16,
    backgroundColor: '#E3F2FD',
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceInfo: {
    flex: 1,
  },
  currentPrice: {
    fontWeight: 'bold',
    color: '#1976D2',
  },
  priceChange: {
    marginTop: 4,
    fontWeight: '600',
  },
  lastUpdated: {
    color: '#666',
  },
  tradingCard: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 12,
    color: '#1976D2',
  },
  tradingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tradingItem: {
    width: '48%',
    marginBottom: 12,
  },
  tradingLabel: {
    color: '#666',
    marginBottom: 4,
  },
  companyCard: {
    margin: 16,
    marginTop: 8,
  },
  companyInfo: {
    gap: 8,
  },
  companyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyLabel: {
    color: '#666',
  },
  historicalCard: {
    margin: 16,
    marginTop: 8,
  },
  historicalChart: {
    marginTop: 8,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 8,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  chartBarFill: {
    width: 20,
    backgroundColor: '#2196F3',
    borderRadius: 2,
    marginBottom: 4,
  },
  chartLabel: {
    color: '#666',
    textAlign: 'center',
  },
  chartLegend: {
    alignItems: 'center',
  },
  legendText: {
    color: '#666',
  },
  analysisCard: {
    margin: 16,
    marginTop: 8,
  },
  analysisContent: {
    gap: 16,
  },
  analysisItem: {
    gap: 8,
  },
  analysisBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
  },
  analysisText: {
    color: '#666',
    minWidth: 80,
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
