import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Text, Card, Chip, ActivityIndicator, Button, IconButton } from "react-native-paper";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useMarketData } from "../../lib/hooks/useMarketData";
import { useRealtimeUpdates } from "../../lib/hooks/useRealtimeUpdates";
import { SimpleLogo } from "../../components/SimpleLogo";
import { AnimatedPrice } from "../../components/market/AnimatedPrice";
import { FullScrollContainer } from "../../components/FullScrollContainer";
import { SideNavigation } from "../../components/SideNavigation";
import { MarketChartContainer } from "../../components/charts";
import { MarketChartService } from "../../lib/services/market-chart-service";
import { ArticleShareButton } from "../../components/social";

export default function MarketScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'gainers' | 'losers' | 'active'>('all');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);
  
  const {
    marketData,
    marketSummary,
    marketStatus,
    loading,
    refreshing,
    isMarketOpen,
    lastUpdate
  } = useMarketData();

  // Real-time updates
  const {
    isConnected,
    nextUpdate,
    refreshData: forceRefresh
  } = useRealtimeUpdates();

  const onRefresh = async () => {
    try {
      setError(null);
      await forceRefresh(); // Use real-time refresh
      setRetryCount(0);
      await loadChartData();
    } catch (err) {
      setError('Failed to refresh market data');
      setRetryCount(prev => prev + 1);
    }
  };

  const loadChartData = async () => {
    try {
      setChartLoading(true);
      const { data: summaryData, error } = await MarketChartService.getMarketSummary();
      if (error) {
        console.error('Failed to load chart data:', error);
        return;
      }
      
      if (summaryData) {
        // Create chart data from market summary
        const chartData = {
          labels: ['Gainers', 'Losers', 'Unchanged'],
          datasets: [{
            data: [summaryData.gainers, summaryData.losers, summaryData.unchanged],
            color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
          }],
        };
        setChartData(chartData);
      }
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, []);



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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={{ marginTop: 16 }}>Loading market data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="menu"
          size={24}
          onPress={() => setSideNavOpen(true)}
        />
        <SimpleLogo size="medium" showText={false} />
        <Text variant="headlineMedium">JSE Market</Text>
        <IconButton
          icon="refresh"
          size={24}
          onPress={onRefresh}
        />
      </View>
      
      <FullScrollContainer
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.marketInfo}>
          <Text variant="bodyMedium" style={styles.marketDescription}>Real-time trading data</Text>
          
          {/* Real-time Status Indicator */}
          <View style={styles.realtimeStatusContainer}>
            <View style={[styles.connectionIndicator, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
            <Text variant="bodySmall" style={styles.realtimeStatusText}>
              {isConnected ? 'Connected' : 'Disconnected'} • Next update in {nextUpdate}s
            </Text>
          </View>
          
          {lastUpdate && (
            <View style={styles.lastUpdateContainer}>
              <View style={[styles.liveIndicator, { backgroundColor: isMarketOpen ? '#4CAF50' : '#F44336' }]} />
              <Text variant="bodySmall" style={styles.lastUpdateText}>
                Last update: {new Date(lastUpdate).toLocaleTimeString()}
              </Text>
            </View>
          )}
        </View>

      {/* Error Display */}
      {error && (
        <Card style={[styles.errorCard, { backgroundColor: '#FFEBEE' }]}>
          <Card.Content>
            <View style={styles.errorContainer}>
              <Text variant="bodyMedium" style={styles.errorText}>
                {error}
              </Text>
              {retryCount > 0 && (
                <Text variant="bodySmall" style={styles.retryText}>
                  Retry attempt: {retryCount}
                </Text>
              )}
              <View style={styles.errorActions}>
                <Button
                  mode="outlined"
                  onPress={onRefresh}
                  style={styles.retryButton}
                  compact
                >
                  Retry
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Market Status */}
      {marketStatus && (
        <Card style={[styles.statusCard, { backgroundColor: isMarketOpen ? '#E8F5E8' : '#FFEBEE' }]}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <View style={styles.statusInfo}>
                <Text variant="titleMedium">
                  Market {isMarketOpen ? 'Open' : 'Closed'}
                </Text>
                <Text variant="bodySmall">
                  {marketStatus.market_hours.open} - {marketStatus.market_hours.close} (Jamaica Time)
                </Text>
                {!isMarketOpen && marketStatus.next_open && (
                  <Text variant="bodySmall">
                    Next open: {new Date(marketStatus.next_open).toLocaleString()}
                  </Text>
                )}
                {lastUpdate && (
                  <Text variant="bodySmall" style={{ color: '#666', marginTop: 4 }}>
                    Last update: {new Date(lastUpdate).toLocaleTimeString()}
                  </Text>
                )}
              </View>
              <Chip 
                mode="flat" 
                style={{ backgroundColor: isMarketOpen ? '#4CAF50' : '#F44336' }}
                textStyle={{ color: 'white' }}
              >
                {isMarketOpen ? 'LIVE' : 'CLOSED'}
              </Chip>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Market Summary */}
      {marketSummary && (
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.summaryTitle}>Market Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text variant="bodySmall" style={styles.summaryLabel}>Market Index</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {marketSummary.market_index.toFixed(2)}
                </Text>
                <Text variant="bodySmall" style={[styles.summaryChange, { color: getChangeColor(marketSummary.market_change) }]}>
                  {getChangeIcon(marketSummary.market_change)} {marketSummary.market_change.toFixed(2)} ({marketSummary.market_change_percent.toFixed(2)}%)
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text variant="bodySmall" style={styles.summaryLabel}>Total Volume</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {formatVolume(marketSummary.total_volume)}
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text variant="bodySmall" style={styles.summaryLabel}>Advancing</Text>
                <Text variant="titleMedium" style={[styles.summaryValue, { color: '#4CAF50' }]}>
                  {marketSummary.advancing_stocks}
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text variant="bodySmall" style={styles.summaryLabel}>Declining</Text>
                <Text variant="titleMedium" style={[styles.summaryValue, { color: '#F44336' }]}>
                  {marketSummary.declining_stocks}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Market Charts */}
      {chartData && (
        <MarketChartContainer
          data={chartData}
          title="Market Overview"
          subtitle="Stock performance distribution"
          showDesignSelector={true}
          showTypeSelector={true}
          defaultDesign="professional"
          loading={chartLoading}
        />
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            mode={activeTab === 'all' ? 'flat' : 'outlined'}
            onPress={() => setActiveTab('all')}
            style={styles.tabChip}
          >
            All Stocks
          </Chip>
          <Chip
            mode={activeTab === 'gainers' ? 'flat' : 'outlined'}
            onPress={() => setActiveTab('gainers')}
            style={styles.tabChip}
          >
            Top Gainers
          </Chip>
          <Chip
            mode={activeTab === 'losers' ? 'flat' : 'outlined'}
            onPress={() => setActiveTab('losers')}
            style={styles.tabChip}
          >
            Top Losers
          </Chip>
          <Chip
            mode={activeTab === 'active' ? 'flat' : 'outlined'}
            onPress={() => setActiveTab('active')}
            style={styles.tabChip}
          >
            Most Active
          </Chip>
        </ScrollView>
      </View>

      {/* Stock List */}
      <FlashList
        data={marketData}
        keyExtractor={(item) => item.symbol}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Card 
            style={styles.stockCard}
            onPress={() => router.push(`/stock/${item.symbol}`)}
          >
            <Card.Content>
              <View style={styles.stockHeader}>
                <View style={styles.stockInfo}>
                  <Text variant="titleMedium">{item.symbol}</Text>
                  <Text variant="bodySmall" style={styles.stockName}>
                    {item.name}
                  </Text>
                </View>
                <View style={styles.stockPrice}>
                  <AnimatedPrice
                    price={item.last_price}
                    change={item.change}
                    changePercent={item.change_percent}
                    size="medium"
                    showChange={true}
                    showPercent={true}
                  />
                </View>
              </View>
              
              <View style={styles.stockDetails}>
                <View style={styles.stockDetail}>
                  <Text variant="bodySmall" style={styles.detailLabel}>Volume</Text>
                  <Text variant="bodySmall">{formatVolume(item.volume)}</Text>
                </View>
                <View style={styles.stockDetail}>
                  <Text variant="bodySmall" style={styles.detailLabel}>High</Text>
                  <Text variant="bodySmall">{formatCurrency(item.high)}</Text>
                </View>
                <View style={styles.stockDetail}>
                  <Text variant="bodySmall" style={styles.detailLabel}>Low</Text>
                  <Text variant="bodySmall">{formatCurrency(item.low)}</Text>
                </View>
                <View style={styles.stockDetail}>
                  <Text variant="bodySmall" style={styles.detailLabel}>Open</Text>
                  <Text variant="bodySmall">{formatCurrency(item.open)}</Text>
                </View>
              </View>
              
              {/* Social Sharing */}
              <View style={styles.shareSection}>
                <ArticleShareButton
                  article={{
                    id: item.symbol,
                    headline: `${item.symbol} Stock Update`,
                    summary: `${item.symbol} is currently trading at ${formatCurrency(item.last_price)} with a ${item.change > 0 ? 'gain' : 'loss'} of ${formatCurrency(Math.abs(item.change))} (${item.change_percent.toFixed(2)}%)`,
                    url: `https://jamstockanalytics.com/stock/${item.symbol}`,
                    source: 'JamStockAnalytics',
                    publishedAt: new Date().toISOString(),
                    aiPriorityScore: Math.random() * 10,
                    companyTickers: [item.symbol],
                  }}
                  variant="inline"
                  onShare={(platform) => console.log(`Stock ${item.symbol} shared to ${platform}`)}
                />
              </View>
            </Card.Content>
          </Card>
        )}
      />

      </FullScrollContainer>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={() => router.push('/(tabs)/analysis')}
          style={styles.actionButton}
          icon="analytics"
        >
          Analyze Market
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.push('/(tabs)/chat')}
          style={styles.actionButton}
          icon="chat"
        >
          Market Chat
        </Button>
      </View>
      
      <SideNavigation
        isOpen={sideNavOpen}
        onClose={() => setSideNavOpen(false)}
      >
        <Text variant="bodyMedium" style={styles.sideNavText}>
          Navigate to different sections of the app
        </Text>
      </SideNavigation>
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
  statusCard: {
    margin: 16,
    marginBottom: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  summaryCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  summaryTitle: {
    marginBottom: 12,
    color: '#1976D2',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontWeight: 'bold',
  },
  summaryChange: {
    marginTop: 2,
  },
  tabContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tabChip: {
    marginRight: 8,
  },
  stockCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stockInfo: {
    flex: 1,
    marginRight: 12,
  },
  stockName: {
    color: '#666',
    marginTop: 2,
  },
  stockPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontWeight: 'bold',
  },
  changeText: {
    marginTop: 2,
    fontWeight: '600',
  },
  stockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    color: '#666',
    marginBottom: 2,
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
  realtimeStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    alignSelf: 'center',
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  realtimeStatusText: {
    color: '#666',
    fontSize: 12,
  },
  lastUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  lastUpdateText: {
    color: '#666',
  },
  errorCard: {
    margin: 16,
    marginBottom: 8,
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryText: {
    color: '#666',
    marginBottom: 12,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    borderColor: '#D32F2F',
  },
  smartRetryButton: {
    backgroundColor: '#2563eb',
  },
  sideNavText: {
    color: '#666',
    textAlign: 'center',
  },
  marketInfo: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  marketDescription: {
    color: '#666666',
    textAlign: 'center',
  },
  shareSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});
