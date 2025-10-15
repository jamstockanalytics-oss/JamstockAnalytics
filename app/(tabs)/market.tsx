import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Text, Card, Chip, ActivityIndicator, Button, ProgressBar } from "react-native-paper";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useMarketData } from "../../lib/hooks/useMarketData";
import { getTopGainers, getTopLosers, getMostActive } from "../../lib/services/jse-data-service";
import { SimpleLogo } from "../../components/SimpleLogo";

export default function MarketScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'gainers' | 'losers' | 'active'>('all');
  
  const {
    marketData,
    marketSummary,
    marketStatus,
    loading,
    refreshing,
    refresh,
    isMarketOpen,
    lastUpdate
  } = useMarketData();

  const onRefresh = () => {
    refresh();
  };

  const getFilteredData = async () => {
    switch (activeTab) {
      case 'gainers':
        return await getTopGainers();
      case 'losers':
        return await getTopLosers();
      case 'active':
        return await getMostActive();
      default:
        return marketData;
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
        <SimpleLogo size="medium" showText={false} />
        <Text variant="headlineMedium">JSE Market</Text>
        <Text variant="bodyMedium">Real-time trading data</Text>
      </View>

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
        estimatedItemSize={80}
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
                  <Text variant="titleLarge" style={styles.priceText}>
                    {formatCurrency(item.last_price)}
                  </Text>
                  <Text variant="bodySmall" style={[styles.changeText, { color: getChangeColor(item.change) }]}>
                    {getChangeIcon(item.change)} {formatCurrency(Math.abs(item.change))} ({item.change_percent.toFixed(2)}%)
                  </Text>
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
            </Card.Content>
          </Card>
        )}
      />

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
});
