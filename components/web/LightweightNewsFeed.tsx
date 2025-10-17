import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { LightweightCard } from './LightweightCard';
import { LightweightButton } from './LightweightButton';
import { fetchArticles, type Article } from '../../lib/services/news-service';
import { WebTheme } from '../../constants/WebTheme';

interface LightweightNewsFeedProps {
  maxItems?: number;
  enableLazyLoading?: boolean;
  showPriorityIndicator?: boolean;
  onArticlePress?: (article: Article) => void;
}

export function LightweightNewsFeed({
  maxItems = 20,
  enableLazyLoading = true,
  showPriorityIndicator = true,
  onArticlePress
}: LightweightNewsFeedProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      const fetchedArticles = await fetchArticles();
      
      // Limit articles for lightweight mode
      const limitedArticles = fetchedArticles.slice(0, maxItems);
      
      if (isRefresh) {
        setArticles(limitedArticles);
      } else {
        setArticles(limitedArticles);
      }
      
      setHasMore(fetchedArticles.length > maxItems);
    } catch (err) {
      console.error('Failed to load articles:', err);
      setError('Failed to load news articles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [maxItems]);

  const loadMore = useCallback(async () => {
    if (!enableLazyLoading || loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const fetchedArticles = await fetchArticles();
      const startIndex = articles.length;
      const moreArticles = fetchedArticles.slice(startIndex, startIndex + 10);
      
      if (moreArticles.length > 0) {
        setArticles(prev => [...prev, ...moreArticles]);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more articles:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [articles.length, enableLazyLoading, hasMore, loadingMore]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleRefresh = useCallback(() => {
    loadArticles(true);
  }, [loadArticles]);

  const handleArticlePress = useCallback((article: Article) => {
    if (onArticlePress) {
      onArticlePress(article);
    }
  }, [onArticlePress]);

  const renderArticle = useCallback(({ item }: { item: Article }) => (
    <LightweightCard
      title={item.headline}
      subtitle={`${item.source} • ${new Date(item.publication_date).toLocaleDateString()}`}
      content={item.ai_summary || 'No summary available'}
      onPress={() => handleArticlePress(item)}
      variant="outlined"
      size="md"
    >
      {showPriorityIndicator && item.ai_priority_score && (
        <View style={styles.priorityContainer}>
          <View style={[
            styles.priorityIndicator, 
            { backgroundColor: getPriorityColor(item.ai_priority_score) }
          ]}>
            <Text style={styles.priorityText}>
              Priority: {item.ai_priority_score.toFixed(1)}
            </Text>
          </View>
        </View>
      )}
      
      {item.company_tickers && item.company_tickers.length > 0 && (
        <View style={styles.tickersContainer}>
          <Text style={styles.tickersLabel}>Related: </Text>
          <Text style={styles.tickersText}>
            {item.company_tickers.slice(0, 3).join(', ')}
            {item.company_tickers.length > 3 && '...'}
          </Text>
        </View>
      )}
    </LightweightCard>
  ), [handleArticlePress, showPriorityIndicator]);

  const getPriorityColor = (score: number) => {
    if (score >= 8) return WebTheme.colors.error; // High priority - red
    if (score >= 6) return WebTheme.colors.tertiary; // Medium priority - orange
    return WebTheme.colors.primary; // Low priority - blue
  };

  const renderFooter = useCallback(() => {
    if (!enableLazyLoading || !loadingMore) return null;
    
    return (
      <View style={styles.footer}>
        <Text style={styles.footerText}>Loading more articles...</Text>
      </View>
    );
  }, [enableLazyLoading, loadingMore]);

  const renderEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading articles...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <LightweightButton
            title="Retry"
            onPress={() => loadArticles()}
            variant="outline"
            size="md"
          />
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No articles available</Text>
      </View>
    );
  }, [loading, error, loadArticles]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    webContainer: {
      flex: 1,
      height: '100%',
    },
    priorityContainer: {
      marginTop: 8,
    },
    priorityIndicator: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    priorityText: {
      color: WebTheme.colors.onPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    tickersContainer: {
      flexDirection: 'row',
      marginTop: 8,
      flexWrap: 'wrap',
    },
    tickersLabel: {
      fontSize: 12,
      color: WebTheme.colors.onSurfaceVariant,
      fontWeight: '500',
    },
    tickersText: {
      fontSize: 12,
      color: WebTheme.colors.primary,
      fontWeight: '500',
    },
    footer: {
      padding: 16,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      color: WebTheme.colors.onSurfaceVariant,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: WebTheme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: 16,
    },
    errorText: {
      fontSize: 16,
      color: WebTheme.colors.error,
      textAlign: 'center',
      marginBottom: 16,
    },
  });

  const containerStyle = Platform.OS === 'web' ? styles.webContainer : styles.container;

  return (
    <View style={containerStyle}>
      <FlashList
        data={articles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        estimatedItemSize={200}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[WebTheme.colors.primary]}
            tintColor={WebTheme.colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}