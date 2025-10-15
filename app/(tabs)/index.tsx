import { View, RefreshControl } from "react-native";
import { Text, Button, ActivityIndicator, FAB, Appbar, Menu, Divider } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useNews } from "../../lib/hooks/useNews";
import { ArticleCard } from "../../components/news/ArticleCard";
import { SimpleLogo } from "../../components/SimpleLogo";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";

export default function MainNewsScreen() {
  const { articles, loading, refreshing, refresh } = useNews();
  const { user, signOut, isGuest } = useAuth();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setMenuVisible(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="JamStockAnalytics" />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action 
              icon="account-circle" 
              onPress={() => setMenuVisible(true)} 
            />
          }
        >
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              router.push('/(tabs)/profile');
            }} 
            title="Profile" 
            leadingIcon="account"
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              router.push('/(tabs)/analysis');
            }} 
            title="AI Analysis" 
            leadingIcon="analytics"
          />
          <Divider />
          <Menu.Item 
            onPress={handleSignOut} 
            title="Sign Out" 
            leadingIcon="logout"
          />
        </Menu>
      </Appbar.Header>
      
      <View style={{ padding: 16, gap: 8 }}>
        <Text variant="headlineMedium" style={{ textAlign: 'center' }}>
          {getGreeting()}, {user?.user_metadata?.full_name || 'Guest'}!
        </Text>
        <Text variant="titleMedium" style={{ textAlign: 'center', color: '#667eea' }}>
          Latest Jamaica Stock Exchange News
        </Text>
        <Text variant="bodyMedium" style={{ textAlign: 'center', color: '#666666' }}>
          {isGuest ? 'Basic Financial Intelligence' : 'AI-Powered Financial Intelligence'}
        </Text>
        {isGuest && (
          <Text variant="bodySmall" style={{ textAlign: 'center', color: '#888888', fontStyle: 'italic' }}>
            Sign up for personalized AI insights and advanced analysis
          </Text>
        )}
      </View>
      
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={{ marginTop: 16, color: '#666666' }}>
            Loading latest financial news...
          </Text>
        </View>
      ) : (
        <FlashList
          data={articles}
          estimatedItemSize={120}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          renderItem={({ item }) => (
            <ArticleCard
              headline={item.headline}
              source={item.source}
              date={item.publication_date}
              summary={item.ai_summary ?? undefined}
              priority={item.ai_priority_score}
              tickers={item.company_tickers}
              onPress={() => router.push(`/article/${item.id}`)}
            />
          )}
        />
      )}
      
      <FAB
        icon="chat"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={() => router.push('/(tabs)/chat')}
        label="AI Chat"
      />
    </View>
  );
}


