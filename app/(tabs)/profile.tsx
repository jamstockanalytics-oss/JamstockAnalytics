import { View } from "react-native";
import { Text, Button } from "react-native-paper";
import { supabase } from "../../lib/supabase/client";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { fetchSavedArticles, removeSavedArticle, type Article } from "../../lib/services/news-service";
import { useRouter } from "expo-router";
import { SimpleLogo } from "../../components/SimpleLogo";

export default function ProfileScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      const articles = await fetchSavedArticles(session.user.id);
      setSaved(articles);
      setLoading(false);
    })();
  }, [session?.user?.id]);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <SimpleLogo size="medium" showText={true} />
      </View>
      <Text variant="headlineMedium">Profile</Text>
      <Text variant="bodyMedium">User settings placeholder</Text>
      <Button mode="outlined" onPress={() => supabase.auth.signOut()}>Sign Out</Button>
      <Text variant="titleMedium" style={{ marginTop: 12 }}>Saved Articles</Text>
      <FlashList
        data={saved}
        keyExtractor={(a) => a.id}
        estimatedItemSize={100}
        ListEmptyComponent={!loading ? <Text variant="labelSmall">No saved articles.</Text> : null}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, gap: 6 }}>
            <Text variant="bodyLarge" onPress={() => router.push(`/article/${item.id}`)}>{item.headline}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button mode="text" onPress={() => router.push(`/article/${item.id}`)}>Open</Button>
              <Button
                mode="text"
                onPress={async () => {
                  if (!session?.user?.id) return;
                  await removeSavedArticle(session.user.id, item.id);
                  const articles = await fetchSavedArticles(session.user.id);
                  setSaved(articles);
                }}
              >Remove</Button>
            </View>
          </View>
        )}
      />
    </View>
  );
}


