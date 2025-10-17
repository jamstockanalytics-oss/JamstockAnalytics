import { useState, useEffect, useCallback } from 'react';
import { 
  fetchRealJSEData, 
  getJSEMarketStatus, 
  getMarketSummary
} from '../services/real-jse-data-service';
import {
  type JSEStockData,
  type JSEMarketSummary,
  type JSEMarketStatus,
  type JSETradingSession
} from '../services/jse-data-service';
import { 
  initializeMarketUpdates, 
  stopMarketUpdates
} from '../services/enhanced-market-update-service';
import { 
  startSmartUpdates, 
  stopSmartUpdates
} from '../services/smart-update-service';

export interface UseMarketDataReturn {
  // Data
  marketData: JSEStockData[];
  marketSummary: JSEMarketSummary | null;
  marketStatus: JSEMarketStatus | null;
  tradingSession: JSETradingSession | null;
  
  // Loading states
  loading: boolean;
  refreshing: boolean;
  
  // Actions
  refresh: () => Promise<void>;
  getStockPrice: (symbol: string) => JSEStockData | null;
  
  // Market status
  isMarketOpen: boolean;
  lastUpdate: string | null;
}

export function useMarketData(): UseMarketDataReturn {
  const [marketData, setMarketData] = useState<JSEStockData[]>([]);
  const [marketSummary, setMarketSummary] = useState<JSEMarketSummary | null>(null);
  const [marketStatus, setMarketStatus] = useState<JSEMarketStatus | null>(null);
  const [tradingSession, setTradingSession] = useState<JSETradingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // Load initial market data
  const loadMarketData = useCallback(async () => {
    try {
      setLoading(true);
      const [session, summary, status] = await Promise.all([
        fetchRealJSEData(),
        getMarketSummary(),
        getJSEMarketStatus()
      ]);
      
      setMarketData(session.stocks);
      setMarketSummary(summary);
      setMarketStatus(status);
      setTradingSession(session);
      setLastUpdate(new Date().toISOString());
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh market data
  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadMarketData();
    } catch (error) {
      console.error('Failed to refresh market data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadMarketData]);



  // Get stock price by symbol
  const getStockPrice = useCallback((symbol: string): JSEStockData | null => {
    return marketData.find(stock => stock.symbol === symbol) || null;
  }, [marketData]);

  // Set up automatic updates
  useEffect(() => {
    // Load initial data
    loadMarketData();

    // Set up automatic updates
    const handleMarketOpen = () => {
      setMarketStatus((prev: JSEMarketStatus | null) => prev ? { ...prev, is_open: true } : null);
    };

    const handleMarketClose = () => {
      setMarketStatus((prev: JSEMarketStatus | null) => prev ? { ...prev, is_open: false } : null);
    };

    const handleDataUpdate = (data: JSETradingSession) => {
      setMarketData(data.stocks);
      setTradingSession(data);
      setLastUpdate(new Date().toISOString());
    };

    // Initialize both traditional and smart updates
    initializeMarketUpdates(
      handleMarketOpen,
      handleMarketClose,
      handleDataUpdate
    );

    // Start smart updates for better performance
    startSmartUpdates({
      marketOpenInterval: 30000,    // 30 seconds when market is open
      marketClosedInterval: 300000, // 5 minutes when market is closed
      adaptiveFrequency: true
    });

    // Cleanup on unmount
    return () => {
      stopMarketUpdates();
      stopSmartUpdates();
    };
  }, [loadMarketData]);

  // Auto-refresh when market is open
  useEffect(() => {
    if (!marketStatus?.is_open) return;

    const interval = setInterval(() => {
      refresh();
    }, 120000); // Refresh every 2 minutes when market is open

    return () => clearInterval(interval);
  }, [marketStatus?.is_open, refresh]);

  return {
    marketData,
    marketSummary,
    marketStatus,
    tradingSession,
    loading,
    refreshing,
    refresh,
    getStockPrice,
    isMarketOpen: marketStatus?.is_open || false,
    lastUpdate
  };
}

export function useStockData(symbol: string) {
  const [stockData, setStockData] = useState<JSEStockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStockData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const session = await fetchRealJSEData();
        const stock = session.stocks.find((s: JSEStockData) => s.symbol === symbol);
        
        if (stock) {
          setStockData(stock);
        } else {
          setError(`Stock ${symbol} not found`);
        }
      } catch (err) {
        setError('Failed to load stock data');
        console.error('Error loading stock data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      loadStockData();
    }
  }, [symbol]);

  return { stockData, loading, error };
}

export function useMarketStatus() {
  const [status, setStatus] = useState<JSEMarketStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const marketStatus = getJSEMarketStatus();
        setStatus(marketStatus);
      } catch (error) {
        console.error('Failed to load market status:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();

    // Update status every minute
    const interval = setInterval(loadStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return { status, loading };
}

export function useMarketSummary() {
  const [summary, setSummary] = useState<JSEMarketSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const marketSummary = await getMarketSummary();
        setSummary(marketSummary);
      } catch (error) {
        console.error('Failed to load market summary:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();

    // Update summary every 5 minutes
    const interval = setInterval(loadSummary, 300000);
    return () => clearInterval(interval);
  }, []);

  return { summary, loading };
}
