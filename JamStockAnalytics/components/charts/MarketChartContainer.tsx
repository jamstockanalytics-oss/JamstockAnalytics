import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { MarketChart, CHART_DESIGNS, ChartDesign, ChartData } from './ChartDesigns';
import { QuickDesignSelector } from './ChartDesignSelector';
import { ChartExport } from './ChartExport';
import { ChartShareButton } from '../social/ArticleShareButton';

interface MarketChartContainerProps {
  data: ChartData;
  title?: string;
  subtitle?: string;
  showDesignSelector?: boolean;
  showTypeSelector?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  defaultDesign?: string;
  onDesignChange?: (design: ChartDesign) => void;
  onTypeChange?: (type: string) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const CHART_TYPES = [
  { id: 'line', name: 'Line', icon: 'chart-line' },
  { id: 'bar', name: 'Bar', icon: 'chart-bar' },
  { id: 'area', name: 'Area', icon: 'chart-areaspline' },
  { id: 'pie', name: 'Pie', icon: 'chart-pie' },
];

export const MarketChartContainer: React.FC<MarketChartContainerProps> = ({
  data,
  title = 'Market Chart',
  subtitle,
  showDesignSelector = true,
  showTypeSelector = true,
  showLegend = true,
  showGrid = true,
  showLabels = true,
  defaultDesign = 'professional',
  onDesignChange,
  onTypeChange,
  loading = false,
  error = null,
  onRetry,
}) => {
  const getInitialDesign = (): ChartDesign => {
    const found = CHART_DESIGNS.find(d => d.id === defaultDesign);
    return found || CHART_DESIGNS[0]!;
  };

  const [selectedDesign, setSelectedDesign] = useState<ChartDesign>(getInitialDesign());
  const [selectedType, setSelectedType] = useState<string>('line');
  const [showControls, setShowControls] = useState(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    if (onDesignChange) {
      onDesignChange(selectedDesign);
    }
  }, [selectedDesign, onDesignChange]);

  const handleDesignChange = (design: ChartDesign) => {
    setSelectedDesign(design);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    if (onTypeChange) {
      onTypeChange(type);
    }
  };

  const renderChart = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={selectedDesign.colors.primary} />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading chart data...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text variant="bodyMedium" style={styles.errorText}>
            {error}
          </Text>
          {onRetry && (
            <Button mode="outlined" onPress={onRetry} style={styles.retryButton}>
              Retry
            </Button>
          )}
        </View>
      );
    }

    if (!data || data.datasets.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text variant="bodyMedium" style={styles.emptyText}>
            No data available for chart
          </Text>
        </View>
      );
    }

    return (
      <MarketChart
        data={data}
        design={selectedDesign}
        type={selectedType as 'line' | 'bar' | 'pie' | 'area'}
        showLegend={showLegend}
        showGrid={showGrid}
        showLabels={showLabels}
      />
    );
  };

  const renderTypeSelector = () => {
    if (!showTypeSelector) return null;

    return (
      <View style={styles.typeSelector}>
        <Text variant="labelMedium" style={styles.selectorLabel}>
          Chart Type:
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.typeScroll}
        >
          {CHART_TYPES.map((type) => (
            <Chip
              key={type.id}
              mode={type.id === selectedType ? 'flat' : 'outlined'}
              selected={type.id === selectedType}
              onPress={() => handleTypeChange(type.id)}
              style={[
                styles.typeChip,
                type.id === selectedType && {
                  backgroundColor: selectedDesign.colors.primary,
                },
              ]}
              textStyle={[
                styles.typeChipText,
                type.id === selectedType && { color: '#ffffff' },
              ]}
            >
              {type.name}
            </Chip>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <Card style={[styles.container, { backgroundColor: selectedDesign.colors.background }]}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleLarge" style={[styles.title, { color: selectedDesign.colors.text }]}>
              {title}
            </Text>
            {subtitle && (
              <Text variant="bodyMedium" style={[styles.subtitle, { color: selectedDesign.colors.secondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
          
          <View style={styles.headerButtons}>
            <Button
              mode="text"
              onPress={() => setShowExport(!showExport)}
              icon="download"
              style={styles.exportButton}
            >
              Export
            </Button>
            <Button
              mode="text"
              onPress={() => setShowControls(!showControls)}
              icon={showControls ? 'chevron-up' : 'chevron-down'}
              style={styles.controlsButton}
            >
              {showControls ? 'Hide' : 'Customize'}
            </Button>
          </View>
        </View>

        {showControls && (
          <View style={styles.controlsContainer}>
            {showDesignSelector && (
              <QuickDesignSelector
                selectedDesign={selectedDesign}
                onDesignChange={handleDesignChange}
              />
            )}
            
            {renderTypeSelector()}
            
            <View style={styles.optionsContainer}>
              <Chip
                mode={showLegend ? 'flat' : 'outlined'}
                selected={showLegend}
                onPress={() => {/* Handle legend toggle */}}
                style={styles.optionChip}
              >
                Legend
              </Chip>
              <Chip
                mode={showGrid ? 'flat' : 'outlined'}
                selected={showGrid}
                onPress={() => {/* Handle grid toggle */}}
                style={styles.optionChip}
              >
                Grid
              </Chip>
              <Chip
                mode={showLabels ? 'flat' : 'outlined'}
                selected={showLabels}
                onPress={() => {/* Handle labels toggle */}}
                style={styles.optionChip}
              >
                Labels
              </Chip>
            </View>
          </View>
        )}

        <View style={styles.chartContainer}>
          {renderChart()}
        </View>

        {showExport && (
          <View style={styles.exportContainer}>
            <ChartExport
              chartData={data}
              chartDesign={selectedDesign}
              chartTitle={title}
            />
          </View>
        )}

        {/* Social Sharing */}
        <View style={styles.shareContainer}>
          <ChartShareButton
            chart={{
              title: title || 'Market Chart',
              description: subtitle || 'Market analysis chart',
              data: data,
              design: selectedDesign.name,
            }}
            variant="inline"
            onShare={(platform) => console.log(`Chart shared to ${platform}`)}
          />
        </View>

        {!loading && !error && data && (
          <View style={styles.footer}>
            <Text variant="bodySmall" style={[styles.footerText, { color: selectedDesign.colors.secondary }]}>
              Design: {selectedDesign.name} • Type: {selectedType}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportButton: {
    marginRight: 8,
  },
  controlsButton: {
    marginLeft: 8,
  },
  exportContainer: {
    marginTop: 16,
  },
  shareContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  controlsContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  typeSelector: {
    marginVertical: 8,
  },
  selectorLabel: {
    fontWeight: '500',
    marginBottom: 8,
  },
  typeScroll: {
    flexDirection: 'row',
  },
  typeChip: {
    marginRight: 8,
  },
  typeChipText: {
    fontSize: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionChip: {
    marginRight: 8,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 8,
    opacity: 0.7,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    opacity: 0.7,
    textAlign: 'center',
  },
  footer: {
    marginTop: 8,
    alignItems: 'center',
  },
  footerText: {
    opacity: 0.7,
  },
});
