import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View, Share, StyleSheet } from "react-native";
import { ActivityIndicator, Button, Text, Card, Chip, Divider } from "react-native-paper";
import { useEffect, useState } from "react";
import { fetchArticleById, saveArticle, analyzeArticleWithAI, type Article } from "../../lib/services/news-service";
import { useAuth } from "../../contexts/AuthContext";
import { PriorityIndicator } from "../../components/news/PriorityIndicator";

export default function ArticleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = id ? await fetchArticleById(id) : null;
      setArticle(data);
      setLoading(false);
    })();
  }, [id]);

  const handleAnalyzeWithAI = async () => {
    if (!article || analyzing) return;
    
    setAnalyzing(true);
    try {
      const analyzedArticle = await analyzeArticleWithAI(article.id);
      if (analyzedArticle) {
        setArticle(analyzedArticle);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={{ marginTop: 16 }}>Loading article...</Text>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge">Article not found.</Text>
        <Button mode="outlined" onPress={() => router.back()} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headline}>
          {article.headline}
        </Text>
        <View style={styles.metaInfo}>
          <Text variant="labelMedium" style={styles.source}>
            {article.source}
          </Text>
          <Text variant="labelSmall" style={styles.date}>
            {new Date(article.publication_date).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* AI Priority Score */}
      {article.ai_priority_score && (
        <Card style={styles.priorityCard}>
          <Card.Content>
            <View style={styles.priorityHeader}>
              <Text variant="titleMedium">AI Priority Score</Text>
              <PriorityIndicator priority={article.ai_priority_score} />
            </View>
            <Text variant="bodySmall" style={styles.priorityDescription}>
              Higher scores indicate more significant market impact
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* AI Summary */}
      {article.ai_summary ? (
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              AI Analysis Summary
            </Text>
            <Text variant="bodyMedium" style={styles.summaryText}>
              {article.ai_summary}
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              AI Analysis
            </Text>
            <Text variant="bodyMedium" style={styles.summaryText}>
              No AI analysis available yet. Click "Analyze with AI" to get insights.
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Company Tickers */}
      {article.company_tickers && article.company_tickers.length > 0 && (
        <Card style={styles.tickersCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.tickersTitle}>
              Related Companies
            </Text>
            <View style={styles.tickersContainer}>
              {article.company_tickers.map((ticker, index) => (
                <Chip key={index} mode="outlined" style={styles.tickerChip}>
                  {ticker}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      <Divider style={styles.divider} />

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button 
          mode="contained" 
          onPress={handleAnalyzeWithAI}
          loading={analyzing}
          disabled={analyzing}
          style={styles.actionButton}
          icon="robot"
        >
          {analyzing ? "Analyzing..." : "Analyze with AI"}
        </Button>

        <Button 
          mode="outlined" 
          onPress={() => router.push({ pathname: "/(tabs)/chat", params: { q: article.headline } })}
          style={styles.actionButton}
          icon="chat"
        >
          Discuss in Chat
        </Button>

        {article.url && (
          <Button 
            mode="outlined" 
            onPress={() => typeof window !== "undefined" ? window.open(article.url, "_blank") : null}
            style={styles.actionButton}
            icon="open-in-new"
          >
            Open Source
          </Button>
        )}

        <Button 
          mode="outlined" 
          onPress={() => Share.share({ message: `${article.headline} - ${article.url ?? ""}` })}
          style={styles.actionButton}
          icon="share"
        >
          Share
        </Button>

        {session?.user?.id && (
          <Button
            mode="outlined"
            loading={saving}
            disabled={saving}
            onPress={async () => {
              setSaving(true);
              await saveArticle(session.user.id, article.id);
              setSaving(false);
            }}
            style={styles.actionButton}
            icon="bookmark"
          >
            {saving ? "Saving..." : "Save Article"}
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  headline: {
    marginBottom: 8,
    lineHeight: 28,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    fontWeight: '600',
    color: '#666',
  },
  date: {
    color: '#999',
  },
  priorityCard: {
    backgroundColor: '#F8F9FA',
  },
  priorityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityDescription: {
    color: '#666',
    fontStyle: 'italic',
  },
  summaryCard: {
    backgroundColor: '#F0F8FF',
  },
  summaryTitle: {
    marginBottom: 8,
    color: '#1976D2',
  },
  summaryText: {
    lineHeight: 22,
  },
  tickersCard: {
    backgroundColor: '#F5F5F5',
  },
  tickersTitle: {
    marginBottom: 8,
  },
  tickersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tickerChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 8,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});


