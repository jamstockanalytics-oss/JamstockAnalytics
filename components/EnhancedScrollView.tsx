import React, { ReactNode, useState, useCallback } from 'react';
import { View, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';

interface EnhancedScrollViewProps {
  children: ReactNode;
  onRefresh?: () => Promise<void>;
  onLoadMore?: () => Promise<void>;
  refreshing?: boolean;
  loading?: boolean;
  hasMore?: boolean;
  style?: any;
  contentContainerStyle?: any;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
}

export function EnhancedScrollView({
  children,
  onRefresh,
  onLoadMore,
  refreshing = false,
  loading = false,
  hasMore = true,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = false,
}: EnhancedScrollViewProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = useCallback(async () => {
    if (onLoadMore && hasMore && !isLoadingMore && !loading) {
      setIsLoadingMore(true);
      try {
        await onLoadMore();
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [onLoadMore, hasMore, isLoadingMore, loading]);

  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    
    if (isCloseToBottom && hasMore && !isLoadingMore) {
      handleLoadMore();
    }
  }, [handleLoadMore, hasMore, isLoadingMore]);

  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        ) : undefined
      }
      onScroll={handleScroll}
      scrollEventThrottle={400}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
    >
      {children}
      
      {isLoadingMore && (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text variant="bodySmall" style={styles.loadingText}>
            Loading more...
          </Text>
        </View>
      )}
      
      {!hasMore && (
        <View style={styles.endMessage}>
          <Text variant="bodySmall" style={styles.endText}>
            You've reached the end
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    color: '#666',
  },
  endMessage: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  endText: {
    color: '#999',
    fontStyle: 'italic',
  },
});
