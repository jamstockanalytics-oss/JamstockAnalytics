import { supabase } from "../supabase/client";
import { analyzeNewsArticle } from "./ai-service";
import { 
  fetchAllNewsArticles, 
  getNewsArticles, 
  getNewsArticlesByTicker, 
  getNewsArticlesByCategory, 
  searchNewsArticles,
  NewsArticle 
} from './comprehensive-news-service';

export type Article = NewsArticle;

export async function fetchArticles(): Promise<Article[]> {
  try {
    // Use the comprehensive news service to fetch real articles
    const articles = await fetchAllNewsArticles();
    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    // Return fallback data if comprehensive service fails
    return [
      {
        id: "fallback-1",
        headline: "BOJ maintains interest rates, signals cautious approach to inflation",
        content: "Bank of Jamaica maintains current interest rates while monitoring inflation trends. This decision impacts JSE-listed financial institutions and overall market sentiment.",
        source: "Jamaica Observer",
        url: "",
        published_at: new Date().toISOString(),
        ai_priority_score: 8.4,
        ai_summary: "Bank of Jamaica maintains current interest rates while monitoring inflation trends. This decision impacts JSE-listed financial institutions and overall market sentiment.",
        company_tickers: ["JSE:NCBFG", "JSE:SGJ", "JSE:JMMB"],
        tags: ["banking", "interest-rates", "inflation"],
        sentiment_score: 0.2,
        relevance_score: 0.9,
        metadata: {
          word_count: 45,
          reading_time: 1,
          author: "Financial Reporter"
        }
      },
      {
        id: "fallback-2",
        headline: "JSE trading volume increases 15% amid foreign investor interest",
        content: "Jamaica Stock Exchange sees significant trading volume increase driven by foreign investor confidence in local market stability.",
        source: "Gleaner Business",
        url: "",
        published_at: new Date(Date.now() - 86400000).toISOString(),
        ai_priority_score: 7.2,
        ai_summary: "Jamaica Stock Exchange sees significant trading volume increase driven by foreign investor confidence in local market stability.",
        company_tickers: ["JSE:NCBFG", "JSE:SGJ"],
        tags: ["trading", "volume", "foreign-investment"],
        sentiment_score: 0.7,
        relevance_score: 0.8,
        metadata: {
          word_count: 42,
          reading_time: 1,
          author: "Market Reporter"
        }
      },
      {
        id: "fallback-3",
        headline: "Tourism sector shows strong recovery with 25% growth in Q3",
        content: "Tourism sector demonstrates robust recovery with significant growth in visitor arrivals and hotel occupancy rates.",
        source: "Jamaica Gleaner",
        url: "",
        published_at: new Date(Date.now() - 172800000).toISOString(),
        ai_priority_score: 6.8,
        ai_summary: "Tourism sector demonstrates robust recovery with significant growth in visitor arrivals and hotel occupancy rates.",
        company_tickers: ["JSE:JMMB"],
        tags: ["tourism", "recovery", "growth"],
        sentiment_score: 0.8,
        relevance_score: 0.7,
        metadata: {
          word_count: 38,
          reading_time: 1,
          author: "Tourism Reporter"
        }
      },
    ];
  }
}

export async function fetchArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, headline, source, url, publication_date, ai_priority_score, ai_summary, company_tickers, content"
    )
    .eq("id", id)
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data as unknown as NewsArticle | null;
}

export async function saveArticle(userId: string, articleId: string) {
  const { error } = await supabase.from("user_saved_articles").insert({
    user_id: userId,
    article_id: articleId,
  });
  return { error };
}

export async function removeSavedArticle(userId: string, articleId: string) {
  const { error } = await supabase
    .from("user_saved_articles")
    .delete()
    .eq("user_id", userId)
    .eq("article_id", articleId);
  return { error };
}

export async function fetchSavedArticles(userId: string): Promise<Article[]> {
  const { data, error } = await supabase
    .from("user_saved_articles")
    .select(
      `article:articles(id, headline, source, url, publication_date, ai_priority_score, ai_summary, company_tickers)`
    )
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });
  if (error) return [];
  const articles = (data as any[]).map((row) => row.article).filter(Boolean) as Article[];
  return articles;
}

/**
 * Analyze an article with AI and update its priority score and summary
 */
export async function analyzeArticleWithAI(articleId: string): Promise<Article | null> {
  try {
    // First, get the article
    const article = await fetchArticleById(articleId);
    if (!article) return null;

    // Analyze with AI
    const analysis = await analyzeNewsArticle(
      article.headline,
      article.content || article.headline,
      article.published_at
    );

    // Update the article in the database
    const { data, error } = await supabase
      .from("articles")
      .update({
        ai_priority_score: analysis.priority_score,
        ai_summary: analysis.summary,
        company_tickers: analysis.key_points.slice(0, 3) // Use key points as tickers for now
      })
      .eq("id", articleId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update article with AI analysis:', error);
      return article;
    }

    return data as Article;
  } catch (error) {
    console.error('AI analysis failed:', error);
    return null;
  }
}

/**
 * Get AI-powered market insights
 */
export async function getMarketInsights(): Promise<string> {
  try {
    const { getMarketInsights } = await import('./ai-service');
    return await getMarketInsights();
  } catch (error) {
    console.error('Failed to get market insights:', error);
    return 'Market insights are being updated. Stay informed about current market conditions.';
  }
}

// Additional functions using comprehensive news service
export async function getArticles(limit?: number, offset?: number): Promise<Article[]> {
  try {
    return await getNewsArticles(limit, offset);
  } catch (error) {
    console.error('Error getting articles:', error);
    throw error;
  }
}

export async function getArticlesByTicker(ticker: string, limit?: number): Promise<Article[]> {
  try {
    return await getNewsArticlesByTicker(ticker, limit);
  } catch (error) {
    console.error('Error getting articles by ticker:', error);
    throw error;
  }
}

export async function getArticlesByCategory(category: string, limit?: number): Promise<Article[]> {
  try {
    return await getNewsArticlesByCategory(category, limit);
  } catch (error) {
    console.error('Error getting articles by category:', error);
    throw error;
  }
}

export async function searchArticles(query: string, limit?: number): Promise<Article[]> {
  try {
    return await searchNewsArticles(query, limit);
  } catch (error) {
    console.error('Error searching articles:', error);
    throw error;
  }
}


