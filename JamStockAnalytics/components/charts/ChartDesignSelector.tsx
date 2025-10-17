import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { CHART_DESIGNS, ChartDesign } from './ChartDesigns';

interface ChartDesignSelectorProps {
  selectedDesign: ChartDesign;
  onDesignChange: (design: ChartDesign) => void;
  showPreview?: boolean;
  compact?: boolean;
}

export const ChartDesignSelector: React.FC<ChartDesignSelectorProps> = ({
  selectedDesign,
  onDesignChange,
  showPreview = true,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const renderDesignCard = (design: ChartDesign) => {
    const isSelected = design.id === selectedDesign.id;
    
    return (
      <Card
        key={design.id}
        style={[
          styles.designCard,
          isSelected && styles.selectedCard,
          compact && styles.compactCard,
        ]}
        onPress={() => onDesignChange(design)}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.designHeader}>
            <Text variant="titleMedium" style={styles.designName}>
              {design.name}
            </Text>
            <Chip
              mode={isSelected ? 'flat' : 'outlined'}
              selected={isSelected}
              style={[
                styles.chip,
                isSelected && { backgroundColor: design.colors.primary },
              ]}
              textStyle={[
                styles.chipText,
                isSelected && { color: '#ffffff' },
              ]}
            >
              {design.theme}
            </Chip>
          </View>
          
          <Text variant="bodySmall" style={styles.designDescription}>
            {design.description}
          </Text>
          
          {showPreview && (
            <View style={styles.colorPreview}>
              <View style={styles.colorPalette}>
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: design.colors.primary },
                  ]}
                />
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: design.colors.secondary },
                  ]}
                />
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: design.colors.accent },
                  ]}
                />
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text variant="labelLarge" style={styles.sectionTitle}>
          Chart Design
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {CHART_DESIGNS.map(renderDesignCard)}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Chart Design
        </Text>
        <Button
          mode="text"
          onPress={() => setExpanded(!expanded)}
          icon={expanded ? 'chevron-up' : 'chevron-down'}
        >
          {expanded ? 'Show Less' : 'Show All'}
        </Button>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {CHART_DESIGNS.map(renderDesignCard)}
      </ScrollView>
      
      {expanded && (
        <View style={styles.expandedContent}>
          <Text variant="titleMedium" style={styles.selectedTitle}>
            Selected: {selectedDesign.name}
          </Text>
          <Text variant="bodyMedium" style={styles.selectedDescription}>
            {selectedDesign.description}
          </Text>
          
          <View style={styles.colorDetails}>
            <Text variant="labelMedium" style={styles.colorLabel}>
              Color Palette:
            </Text>
            <View style={styles.colorGrid}>
              <View style={styles.colorItem}>
                <View
                  style={[
                    styles.colorPreview,
                    { backgroundColor: selectedDesign.colors.primary },
                  ]}
                />
                <Text variant="bodySmall">Primary</Text>
              </View>
              <View style={styles.colorItem}>
                <View
                  style={[
                    styles.colorPreview,
                    { backgroundColor: selectedDesign.colors.secondary },
                  ]}
                />
                <Text variant="bodySmall">Secondary</Text>
              </View>
              <View style={styles.colorItem}>
                <View
                  style={[
                    styles.colorPreview,
                    { backgroundColor: selectedDesign.colors.accent },
                  ]}
                />
                <Text variant="bodySmall">Accent</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export const QuickDesignSelector: React.FC<{
  selectedDesign: ChartDesign;
  onDesignChange: (design: ChartDesign) => void;
}> = ({ selectedDesign, onDesignChange }) => {
  return (
    <View style={styles.quickSelector}>
      <Text variant="labelMedium" style={styles.quickLabel}>
        Design:
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickScroll}
      >
        {CHART_DESIGNS.map((design) => (
          <Chip
            key={design.id}
            mode={design.id === selectedDesign.id ? 'flat' : 'outlined'}
            selected={design.id === selectedDesign.id}
            onPress={() => onDesignChange(design)}
            style={[
              styles.quickChip,
              design.id === selectedDesign.id && {
                backgroundColor: design.colors.primary,
              },
            ]}
            textStyle={[
              styles.quickChipText,
              design.id === selectedDesign.id && { color: '#ffffff' },
            ]}
          >
            {design.name}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  compactContainer: {
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  scrollView: {
    marginVertical: 8,
  },
  horizontalScroll: {
    marginVertical: 4,
  },
  designCard: {
    marginRight: 12,
    minWidth: 200,
    maxWidth: 280,
  },
  compactCard: {
    minWidth: 160,
    maxWidth: 200,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  cardContent: {
    padding: 12,
  },
  designHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  designName: {
    fontWeight: '600',
    flex: 1,
  },
  chip: {
    marginLeft: 8,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '500',
  },
  designDescription: {
    color: '#7f8c8d',
    marginBottom: 8,
  },
  colorPreview: {
    marginTop: 8,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 4,
  },
  colorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  expandedContent: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  selectedTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedDescription: {
    color: '#7f8c8d',
    marginBottom: 12,
  },
  colorDetails: {
    marginTop: 8,
  },
  colorLabel: {
    fontWeight: '500',
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  colorItem: {
    alignItems: 'center',
    gap: 4,
  },
  quickSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  quickLabel: {
    marginRight: 8,
    fontWeight: '500',
  },
  quickScroll: {
    flex: 1,
  },
  quickChip: {
    marginRight: 8,
  },
  quickChipText: {
    fontSize: 12,
  },
});
