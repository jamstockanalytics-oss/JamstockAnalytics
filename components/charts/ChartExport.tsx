import React, { useState } from 'react';
import { View, StyleSheet, Alert, Share } from 'react-native';
import { Text, Button, Card, Menu, ActivityIndicator } from 'react-native-paper';
import { ChartData, ChartDesign } from './ChartDesigns';
import { MarketChartService } from '../../lib/services/market-chart-service';

interface ChartExportProps {
  chartData: ChartData;
  chartDesign: ChartDesign;
  chartTitle?: string;
  onExport?: (format: string) => void;
}

export const ChartExport: React.FC<ChartExportProps> = ({
  chartData,
  chartDesign,
  chartTitle = 'Market Chart',
  onExport,
}) => {
  const [exporting, setExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const exportFormats = [
    { id: 'csv', name: 'CSV', icon: 'file-delimited', description: 'Spreadsheet format' },
    { id: 'json', name: 'JSON', icon: 'code-json', description: 'Data format' },
    { id: 'png', name: 'PNG', icon: 'image', description: 'Image format' },
    { id: 'pdf', name: 'PDF', icon: 'file-pdf-box', description: 'Document format' },
  ];

  const handleExport = async (format: string) => {
    try {
      setExporting(true);
      setShowMenu(false);

      switch (format) {
        case 'csv':
          await exportToCSV();
          break;
        case 'json':
          await exportToJSON();
          break;
        case 'png':
          await exportToPNG();
          break;
        case 'pdf':
          await exportToPDF();
          break;
        default:
          Alert.alert('Error', 'Unsupported export format');
      }

      if (onExport) {
        onExport(format);
      }
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export chart data');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const csvContent = MarketChartService.exportToCSV(chartData, `${chartTitle}.csv`);
      
      // In a real app, you would save the file to device storage
      // For now, we'll show the content in an alert
      Alert.alert(
        'CSV Export',
        'CSV data has been prepared. In a real app, this would be saved to your device.',
        [
          { text: 'OK' },
          { 
            text: 'Share', 
            onPress: () => shareData(csvContent, 'text/csv', 'chart_data.csv')
          }
        ]
      );
    } catch (error) {
      throw new Error('Failed to export CSV');
    }
  };

  const exportToJSON = async () => {
    try {
      const jsonData = {
        title: chartTitle,
        design: chartDesign.name,
        data: chartData,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      const jsonContent = JSON.stringify(jsonData, null, 2);
      
      Alert.alert(
        'JSON Export',
        'JSON data has been prepared. In a real app, this would be saved to your device.',
        [
          { text: 'OK' },
          { 
            text: 'Share', 
            onPress: () => shareData(jsonContent, 'application/json', 'chart_data.json')
          }
        ]
      );
    } catch (error) {
      throw new Error('Failed to export JSON');
    }
  };

  const exportToPNG = async () => {
    try {
      // In a real app, you would capture the chart as an image
      // For now, we'll simulate the process
      Alert.alert(
        'PNG Export',
        'Chart image has been prepared. In a real app, this would be saved to your device.',
        [
          { text: 'OK' },
          { 
            text: 'Share', 
            onPress: () => shareData('Chart image data', 'image/png', 'chart.png')
          }
        ]
      );
    } catch (error) {
      throw new Error('Failed to export PNG');
    }
  };

  const exportToPDF = async () => {
    try {
      // In a real app, you would generate a PDF document
      // For now, we'll simulate the process
      Alert.alert(
        'PDF Export',
        'PDF document has been prepared. In a real app, this would be saved to your device.',
        [
          { text: 'OK' },
          { 
            text: 'Share', 
            onPress: () => shareData('PDF document data', 'application/pdf', 'chart.pdf')
          }
        ]
      );
    } catch (error) {
      throw new Error('Failed to export PDF');
    }
  };

  const shareData = async (content: string, mimeType: string, _filename: string) => {
    try {
      await Share.share({
        message: `Chart Data Export\n\n${content}`,
        title: chartTitle,
        url: `data:${mimeType};base64,${btoa(content)}`,
      });
    } catch (error) {
      Alert.alert('Share Error', 'Failed to share chart data');
    }
  };

  const shareChart = async () => {
    try {
      const shareContent = `Check out this ${chartTitle} chart from JamStockAnalytics!\n\n` +
        `Design: ${chartDesign.name}\n` +
        `Data Points: ${chartData.labels.length}\n` +
        `Generated: ${new Date().toLocaleString()}`;

      await Share.share({
        message: shareContent,
        title: chartTitle,
      });
    } catch (error) {
      Alert.alert('Share Error', 'Failed to share chart');
    }
  };

  if (exporting) {
    return (
      <Card style={styles.exportCard}>
        <Card.Content style={styles.exportContent}>
          <ActivityIndicator size="small" color={chartDesign.colors.primary} />
          <Text variant="bodyMedium">
            Exporting chart...
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.exportCard}>
      <Card.Content style={styles.exportContent}>
        <Text variant="titleMedium" style={styles.exportTitle}>
          Export & Share
        </Text>
        
        <View style={styles.exportButtons}>
          <Button
            mode="outlined"
            onPress={shareChart}
            icon="share"
            style={styles.shareButton}
            compact
          >
            Share Chart
          </Button>
          
          <Menu
            visible={showMenu}
            onDismiss={() => setShowMenu(false)}
            anchor={
              <Button
                mode="contained"
                onPress={() => setShowMenu(true)}
                icon="download"
                style={styles.exportButton}
                compact
              >
                Export Data
              </Button>
            }
          >
            {exportFormats.map((format) => (
              <Menu.Item
                key={format.id}
                onPress={() => handleExport(format.id)}
                title={format.name}
                leadingIcon={format.icon}
                titleStyle={styles.menuItemTitle}
              />
            ))}
          </Menu>
        </View>
        
        <Text variant="bodySmall" style={styles.exportDescription}>
          Export chart data in various formats or share with others
        </Text>
      </Card.Content>
    </Card>
  );
};

export const QuickExportButtons: React.FC<{
  chartData: ChartData;
  chartDesign: ChartDesign;
  onExport?: (format: string) => void;
}> = ({ chartData, chartDesign: _chartDesign, onExport }) => {
  const [exporting, setExporting] = useState(false);

  const quickExport = async (format: string) => {
    try {
      setExporting(true);
      
      switch (format) {
        case 'csv':
          const csvContent = MarketChartService.exportToCSV(chartData);
          await Share.share({
            message: csvContent,
            title: 'Chart Data (CSV)',
          });
          break;
        case 'share':
          await Share.share({
            message: `Check out this market chart from JamStockAnalytics!`,
            title: 'Market Chart',
          });
          break;
      }
      
      if (onExport) {
        onExport(format);
      }
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export chart');
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={styles.quickExportContainer}>
      <Button
        mode="outlined"
        onPress={() => quickExport('csv')}
        icon="file-delimited"
        loading={exporting}
        disabled={exporting}
        compact
        style={styles.quickButton}
      >
        CSV
      </Button>
      
      <Button
        mode="outlined"
        onPress={() => quickExport('share')}
        icon="share"
        loading={exporting}
        disabled={exporting}
        compact
        style={styles.quickButton}
      >
        Share
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  exportCard: {
    marginVertical: 8,
    borderRadius: 8,
  },
  exportContent: {
    padding: 16,
  },
  exportTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  shareButton: {
    flex: 1,
  },
  exportButton: {
    flex: 1,
  },
  exportDescription: {
    color: '#666',
    textAlign: 'center',
  },
  menuItemTitle: {
    fontSize: 14,
  },
  quickExportContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  quickButton: {
    flex: 1,
  },
});
