import { useCallback, useEffect, useState } from "react";
import { fetchArticles, type Article } from "../services/news-service";

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchArticles();
    setArticles(data);
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const data = await fetchArticles();
    setArticles(data);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { articles, loading, refreshing, refresh };
}


