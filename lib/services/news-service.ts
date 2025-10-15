import { supabase } from "../supabase/client";
import { analyzeNewsArticle, generateNewsSummary } from "./ai-service";

export type Article = {
  id: string;
  headline: string;
  source: string;
  url?: string | null;
  publication_date: string;
  ai_priority_score: number | null;
  ai_summary: string | null;
  company_tickers: string[] | null;
  content?: string | null;
};

export async function fetchArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, headline, source, url, publication_date, ai_priority_score, ai_summary, company_tickers, content"
    )
    .order("ai_priority_score", { ascending: false, nullsFirst: false })
    .order("publication_date", { ascending: false });

  if (error) {
    // Return sample data with AI analysis
    return [
      {
        id: "fallback-1",
        headline: "BOJ maintains interest rates, signals cautious approach to inflation",
        source: "Jamaica Observer",
        url: null,
        publication_date: new Date().toISOString(),
        ai_priority_score: 8.4,
        ai_summary: "Bank of Jamaica maintains current interest rates while monitoring inflation trends. This decision impacts JSE-listed financial institutions and overall market sentiment.",
        company_tickers: ["JSE:NCBFG", "JSE:SGJ", "JSE:JMMB"],
      },
      {
        id: "fallback-2",
        headline: "JSE trading volume increases 15% amid foreign investor interest",
        source: "Gleaner Business",
        url: null,
        publication_date: new Date(Date.now() - 86400000).toISOString(),
        ai_priority_score: 7.2,
        ai_summary: "Jamaica Stock Exchange sees significant trading volume increase driven by foreign investor confidence in local market stability.",
        company_tickers: ["JSE:NCBFG", "JSE:SGJ"],
      },
      {
        id: "fallback-3",
        headline: "Tourism sector shows strong recovery with 25% growth in Q3",
        source: "Jamaica Gleaner",
        url: null,
        publication_date: new Date(Date.now() - 172800000).toISOString(),
        ai_priority_score: 6.8,
        ai_summary: "Tourism sector demonstrates robust recovery with significant growth in visitor arrivals and hotel occupancy rates.",
        company_tickers: ["JSE:JMMB"],
      },
    ];
  }

  // Process articles with AI analysis if needed
  const articles = (data as Article[]) ?? [];
  
  // For articles without AI analysis, generate it
  for (const article of articles) {
    if (!article.ai_summary && article.headline) {
      try {
        const summary = await generateNewsSummary(article.headline);
        // Update the article in the database
        await supabase
          .from("articles")
          .update({ ai_summary: summary })
          .eq("id", article.id);
        
        article.ai_summary = summary;
      } catch (error) {
        console.error('AI summary generation failed:', error);
      }
    }
  }

  return articles;
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
  return (data as Article) ?? null;
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
      article.publication_date
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


