import { useState, useEffect, useCallback } from 'react';
import { 
  subscribeToUpdates, 
  getRealtimeStats, 
  getRealtimeStatus,
  forceRefresh,
  getCurrentMarketData,
  getCurrentNewsData
} from '../services/realtime-refresh-service';
import { JSETradingSession } from '../services/jse-data-service';
import { NewsArticle } from '../services/comprehensive-news-service';

export interface RealtimeUpdate {
  type: 'market_data' | 'news_update' | 'price_change' | 'market_status';
  timestamp: string;
  data: any;
  message: string;
}

export interface RealtimeStats {
  last_market_update: string;
  last_news_update: string;
  total_updates: number;
  successful_updates: number;
  failed_updates: number;
  average_response_time: number;
  is_connected: boolean;
}

export interface RealtimeStatus {
  is_running: boolean;
  is_connected: boolean;
  last_update: string;
  next_update: string;
}

/**
 * Hook for real-time updates
 */
export function useRealtimeUpdates() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [nextUpdate, setNextUpdate] = useState<string>('');
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [marketData, setMarketData] = useState<JSETradingSession | null>(null);
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update status
  const updateStatus = useCallback(async () => {
    try {
      const status = getRealtimeStatus();
      setIsConnected(status.is_connected);
      setLastUpdate(status.last_update);
      setNextUpdate(status.next_update);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }, []);

  // Update stats
  const updateStats = useCallback(async () => {
    try {
      const currentStats = getRealtimeStats();
      setStats(currentStats);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }, []);

  // Handle real-time updates
  const handleUpdate = useCallback((update: RealtimeUpdate) => {
    console.log('RealtimeUpdate received:', update);
    
    switch (update.type) {
      case 'market_data':
        if (update.data) {
          setMarketData(update.data);
        }
        break;
      case 'news_update':
        if (update.data) {
          setNewsData(update.data);
        }
        break;
      case 'price_change':
        // Handle price change updates
        console.log('Price change detected:', update.data);
        break;
      case 'market_status':
        // Handle market status changes
        console.log('Market status changed:', update.data);
        break;
    }
    
    setLastUpdate(update.timestamp);
  }, []);

  // Force refresh
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await forceRefresh();
      console.log('Data refresh forced successfully');
    } catch (error) {
      console.error('Error forcing refresh:', error);
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get current market data
  const getMarketData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getCurrentMarketData();
      if (data) {
        setMarketData(data);
      }
    } catch (error) {
      console.error('Error getting market data:', error);
      setError('Failed to get market data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get current news data
  const getNewsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getCurrentNewsData();
      if (data) {
        setNewsData(data);
      }
    } catch (error) {
      console.error('Error getting news data:', error);
      setError('Failed to get news data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to updates
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(handleUpdate);
    
    // Initial data fetch
    getMarketData();
    getNewsData();
    
    // Update status and stats
    updateStatus();
    updateStats();
    
    // Set up periodic status updates
    const statusInterval = setInterval(() => {
      updateStatus();
      updateStats();
    }, 5000); // Update every 5 seconds
    
    return () => {
      unsubscribe();
      clearInterval(statusInterval);
    };
  }, [handleUpdate, getMarketData, getNewsData, updateStatus, updateStats]);

  return {
    // State
    isConnected,
    lastUpdate,
    nextUpdate,
    stats,
    marketData,
    newsData,
    isLoading,
    error,
    
    // Actions
    refreshData,
    getMarketData,
    getNewsData,
    updateStatus,
    updateStats
  };
}

/**
 * Hook for market data only
 */
export function useMarketData() {
  const [marketData, setMarketData] = useState<JSETradingSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMarketData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getCurrentMarketData();
      if (data) {
        setMarketData(data);
      }
    } catch (error) {
      console.error('Error getting market data:', error);
      setError('Failed to get market data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getMarketData();
  }, [getMarketData]);

  return {
    marketData,
    isLoading,
    error,
    refresh: getMarketData
  };
}

/**
 * Hook for news data only
 */
export function useNewsData() {
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNewsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getCurrentNewsData();
      if (data) {
        setNewsData(data);
      }
    } catch (error) {
      console.error('Error getting news data:', error);
      setError('Failed to get news data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getNewsData();
  }, [getNewsData]);

  return {
    newsData,
    isLoading,
    error,
    refresh: getNewsData
  };
}

/**
 * Hook for real-time stats
 */
export function useRealtimeStats() {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [status, setStatus] = useState<RealtimeStatus | null>(null);

  const updateStats = useCallback(async () => {
    try {
      const currentStats = getRealtimeStats();
      const currentStatus = getRealtimeStatus();
      setStats(currentStats);
      setStatus(currentStatus);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }, []);

  useEffect(() => {
    updateStats();
    
    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000);
    
    return () => clearInterval(interval);
  }, [updateStats]);

  return {
    stats,
    status,
    refresh: updateStats
  };
}
