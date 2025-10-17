import { View, RefreshControl, StyleSheet } from "react-native";
import { Text, ActivityIndicator, FAB, Appbar, IconButton } from "react-native-paper";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useNews } from "../../lib/hooks/useNews";
import { ArticleCard } from "../../components/news/ArticleCard";
import { useAuth } from "../../contexts/AuthContext";
import { FullScrollContainer } from "../../components/FullScrollContainer";
import { SideNavigation } from "../../components/SideNavigation";
import { useState } from "react";

export default function MainNewsScreen() {
  const { articles, loading, refreshing, refresh } = useNews();
  const { user } = useAuth();
  const router = useRouter();
  const [sideNavOpen, setSideNavOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <IconButton
          icon="menu"
          size={24}
          onPress={() => setSideNavOpen(true)}
        />
        <Appbar.Content title="JamStockAnalytics" />
        <IconButton
          icon="account"
          size={24}
          onPress={() => router.push('/(tabs)/profile')}
        />
      </Appbar.Header>
      
      <FullScrollContainer
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.greeting}>
            {getGreeting()}, {user?.user_metadata?.full_name || 'User'}!
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Latest Jamaica Stock Exchange News
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            AI-Powered Financial Intelligence
          </Text>
          <Text variant="bodySmall" style={styles.tagline}>
            Advanced AI analysis, market insights, and personalized recommendations
          </Text>
        </View>
      
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Loading latest financial news...
            </Text>
          </View>
        ) : (
          <FlashList
            data={articles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ArticleCard
                headline={item.headline}
                source={item.source}
                date={item.published_at}
                summary={item.ai_summary ?? undefined}
                priority={item.ai_priority_score}
                tickers={item.company_tickers}
                onPress={() => router.push(`/article/${item.id}`)}
              />
            )}
          />
        )}
      </FullScrollContainer>
      
      <FAB
        icon="chat"
        style={styles.fab}
        onPress={() => router.push('/(tabs)/chat')}
        label="AI Chat"
      />
      
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
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 16,
    gap: 8,
    alignItems: 'center',
  },
  greeting: {
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    color: '#2563eb',
    fontWeight: '600',
  },
  description: {
    textAlign: 'center',
    color: '#666666',
  },
  tagline: {
    textAlign: 'center',
    color: '#888888',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    color: '#666666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563eb',
  },
  sideNavText: {
    color: '#666',
    textAlign: 'center',
  },
});


