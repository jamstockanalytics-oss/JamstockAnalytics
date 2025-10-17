/**
 * Performance Optimized List Component
 * Uses virtualization and lazy loading for better performance
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { useTheme } from 'react-native-paper';


interface PerformanceOptimizedListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  onEndReached?: () => void;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
  refreshing?: boolean;
  emptyMessage?: string;
  estimatedItemSize?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  removeClippedSubviews?: boolean;
  initialNumToRender?: number;
  getItemLayout?: (data: any, index: number) => { length: number; offset: number; index: number };
}

export function PerformanceOptimizedList<T>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  onRefresh,
  loading = false,
  refreshing = false,
  emptyMessage = 'No items found',
  maxToRenderPerBatch = 10,
  windowSize = 10,
  removeClippedSubviews = true,
  initialNumToRender = 10,
  getItemLayout,
}: PerformanceOptimizedListProps<T>) {
  const theme = useTheme();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Memoize the render item function to prevent unnecessary re-renders
  const memoizedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      return renderItem({ item, index });
    },
    [renderItem]
  );

  // Memoize the key extractor function
  const memoizedKeyExtractor = useCallback(
    (item: T, index: number) => keyExtractor(item, index),
    [keyExtractor]
  );

  // Handle end reached with debouncing
  const handleEndReached = useCallback(() => {
    if (onEndReached && !isLoadingMore && !loading) {
      setIsLoadingMore(true);
      onEndReached();
      
      // Reset loading state after a delay
      setTimeout(() => {
        setIsLoadingMore(false);
      }, 1000);
    }
  }, [onEndReached, isLoadingMore, loading]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
    }
  }, [onRefresh]);

  // Memoize the refresh control
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        colors={[theme.colors.primary]}
        tintColor={theme.colors.primary}
        progressBackgroundColor={theme.colors.surface}
      />
    ),
    [refreshing, handleRefresh, theme.colors]
  );

  // Memoize the footer component
  const ListFooterComponent = useMemo(() => {
    if (!loading && !isLoadingMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator
          size="small"
          color={theme.colors.primary}
        />
        <Text style={[styles.footerText, { color: theme.colors.onSurface }]}>
          {isLoadingMore ? 'Loading more...' : 'Loading...'}
        </Text>
      </View>
    );
  }, [loading, isLoadingMore, theme.colors]);

  // Memoize the empty component
  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
        {emptyMessage}
      </Text>
    </View>
  ), [emptyMessage, theme.colors]);

  // Performance optimization props
  const performanceProps = useMemo(() => ({
    maxToRenderPerBatch,
    windowSize,
    removeClippedSubviews,
    initialNumToRender,
    getItemLayout,
    updateCellsBatchingPeriod: 50,
    disableVirtualization: false,
  }), [maxToRenderPerBatch, windowSize, removeClippedSubviews, initialNumToRender, getItemLayout]);

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={memoizedKeyExtractor}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={refreshControl}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      {...performanceProps}
      style={styles.list}
      contentContainerStyle={styles.contentContainer}
    />
  );
}

// Skeleton loading component for better perceived performance
export const SkeletonItem: React.FC<{ height?: number }> = ({ height = 100 }) => {
  const theme = useTheme();
  const [opacity, setOpacity] = useState(0.3);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(prev => prev === 0.3 ? 0.7 : 0.3);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card style={[styles.skeletonCard, { height, opacity }]}>
      <Card.Content>
        <View style={[styles.skeletonLine, { backgroundColor: theme.colors.outline }]} />
        <View style={[styles.skeletonLine, { backgroundColor: theme.colors.outline, width: '70%' }]} />
        <View style={[styles.skeletonLine, { backgroundColor: theme.colors.outline, width: '50%' }]} />
      </Card.Content>
    </Card>
  );
};

// Loading skeleton list
export const SkeletonList: React.FC<{ count?: number; itemHeight?: number }> = ({ 
  count = 5, 
  itemHeight = 100 
}) => {
  const skeletonData = Array.from({ length: count }, (_, index) => ({ id: index }));

  return (
    <FlatList
      data={skeletonData}
      renderItem={() => <SkeletonItem height={itemHeight} />}
      keyExtractor={(item) => item.id.toString()}
      scrollEnabled={false}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    marginLeft: 10,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  skeletonCard: {
    margin: 8,
    marginHorizontal: 16,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
});

export default PerformanceOptimizedList;
