export interface JSEStockData {
  symbol: string;
  name: string;
  last_price: number;
  change: number;
  change_percent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previous_close: number;
  market_cap?: number;
  pe_ratio?: number;
  dividend_yield?: number;
  last_updated: string;
}

export interface JSEMarketStatus {
  is_open: boolean;
  market_hours: {
    open: string;
    close: string;
    timezone: string;
  };
  next_open?: string;
  next_close?: string;
  trading_day: string;
}

export interface JSEMarketSummary {
  total_volume: number;
  total_value: number;
  advancing_stocks: number;
  declining_stocks: number;
  unchanged_stocks: number;
  market_index: number;
  market_change: number;
  market_change_percent: number;
}

export interface JSETradingSession {
  date: string;
  status: 'open' | 'closed' | 'pre-market' | 'after-hours';
  last_update: string;
  stocks: JSEStockData[];
  market_summary: JSEMarketSummary;
}

/**
 * JSE Market Hours Configuration
 * JSE typically operates Monday-Friday, 9:30 AM - 4:00 PM Jamaica Time (UTC-5)
 */
export const JSE_MARKET_HOURS = {
  timezone: 'America/Jamaica',
  trading_days: [1, 2, 3, 4, 5], // Monday to Friday
  open_time: '09:30',
  close_time: '16:00',
  pre_market_start: '08:00',
  after_hours_end: '18:00'
};

/**
 * Check if JSE market is currently open
 */
export function isJSEMarketOpen(): boolean {
  const now = new Date();
  const jamaicaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Jamaica" }));
  
  const dayOfWeek = jamaicaTime.getDay();
  const hour = jamaicaTime.getHours();
  const minute = jamaicaTime.getMinutes();
  const currentTime = hour * 100 + minute;
  
  // Check if it's a trading day (Monday-Friday)
  if (!JSE_MARKET_HOURS.trading_days.includes(dayOfWeek)) {
    return false;
  }
  
  // Check if it's within trading hours
  const openTime = parseInt(JSE_MARKET_HOURS.open_time.replace(':', ''));
  const closeTime = parseInt(JSE_MARKET_HOURS.close_time.replace(':', ''));
  
  return currentTime >= openTime && currentTime <= closeTime;
}

/**
 * Get market status information
 */
export function getJSEMarketStatus(): JSEMarketStatus {
  const now = new Date();
  const jamaicaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Jamaica" }));
  
  const dayOfWeek = jamaicaTime.getDay();
  const isOpen = isJSEMarketOpen();
  
  // Calculate next trading day
  const nextTradingDay = new Date(jamaicaTime);
  if (dayOfWeek === 5) { // Friday
    nextTradingDay.setDate(nextTradingDay.getDate() + 3); // Monday
  } else if (dayOfWeek === 6) { // Saturday
    nextTradingDay.setDate(nextTradingDay.getDate() + 2); // Monday
  } else if (dayOfWeek === 0) { // Sunday
    nextTradingDay.setDate(nextTradingDay.getDate() + 1); // Monday
  } else {
    nextTradingDay.setDate(nextTradingDay.getDate() + 1); // Next day
  }
  
  const nextOpen = new Date(nextTradingDay);
  nextOpen.setHours(9, 30, 0, 0);
  
  const nextClose = new Date(nextTradingDay);
  nextClose.setHours(16, 0, 0, 0);
  
  return {
    is_open: isOpen,
    market_hours: {
      open: JSE_MARKET_HOURS.open_time,
      close: JSE_MARKET_HOURS.close_time,
      timezone: JSE_MARKET_HOURS.timezone
    },
    next_open: isOpen ? undefined : nextOpen.toISOString(),
    next_close: isOpen ? nextClose.toISOString() : undefined,
    trading_day: jamaicaTime.toISOString().split('T')[0] || jamaicaTime.toLocaleDateString('en-CA')
  };
}

/**
 * Scrape JSE data from jamstockex.com
 * Note: This is a mock implementation. In production, you would need to:
 * 1. Use a proper web scraping service or API
 * 2. Handle rate limiting and anti-bot measures
 * 3. Implement proper error handling and retries
 */
export async function fetchJSEData(): Promise<JSETradingSession> {
  try {
    // Mock data - in production, this would scrape from jamstockex.com
    const mockStocks: JSEStockData[] = [
      {
        symbol: 'NCBFG',
        name: 'NCB Financial Group Limited',
        last_price: 125.50,
        change: 2.30,
        change_percent: 1.87,
        volume: 125000,
        high: 127.00,
        low: 123.20,
        open: 123.20,
        previous_close: 123.20,
        market_cap: 12500000000,
        pe_ratio: 12.5,
        dividend_yield: 3.2,
        last_updated: new Date().toISOString()
      },
      {
        symbol: 'SGJ',
        name: 'Scotia Group Jamaica Limited',
        last_price: 45.75,
        change: -0.85,
        change_percent: -1.82,
        volume: 85000,
        high: 46.60,
        low: 45.20,
        open: 46.60,
        previous_close: 46.60,
        market_cap: 8500000000,
        pe_ratio: 8.9,
        dividend_yield: 4.1,
        last_updated: new Date().toISOString()
      },
      {
        symbol: 'JMMB',
        name: 'JMMB Group Limited',
        last_price: 78.25,
        change: 1.45,
        change_percent: 1.89,
        volume: 95000,
        high: 79.00,
        low: 76.80,
        open: 76.80,
        previous_close: 76.80,
        market_cap: 6500000000,
        pe_ratio: 15.2,
        dividend_yield: 2.8,
        last_updated: new Date().toISOString()
      },
      {
        symbol: 'BGL',
        name: 'Barita Investments Limited',
        last_price: 92.10,
        change: 0.90,
        change_percent: 0.99,
        volume: 45000,
        high: 92.50,
        low: 91.20,
        open: 91.20,
        previous_close: 91.20,
        market_cap: 3200000000,
        pe_ratio: 11.8,
        dividend_yield: 3.5,
        last_updated: new Date().toISOString()
      },
      {
        symbol: 'SGL',
        name: 'Sagicor Group Jamaica Limited',
        last_price: 56.80,
        change: -1.20,
        change_percent: -2.07,
        volume: 75000,
        high: 58.00,
        low: 56.50,
        open: 58.00,
        previous_close: 58.00,
        market_cap: 4200000000,
        pe_ratio: 9.5,
        dividend_yield: 4.2,
        last_updated: new Date().toISOString()
      }
    ];

    const marketSummary: JSEMarketSummary = {
      total_volume: 425000,
      total_value: 125000000,
      advancing_stocks: 3,
      declining_stocks: 2,
      unchanged_stocks: 0,
      market_index: 1250.75,
      market_change: 12.50,
      market_change_percent: 1.01
    };

    const marketStatus = getJSEMarketStatus();
    
    return {
      date: new Date().toISOString().split('T')[0] || new Date().toLocaleDateString('en-CA'),
      status: marketStatus.is_open ? 'open' : 'closed',
      last_update: new Date().toISOString(),
      stocks: mockStocks,
      market_summary: marketSummary
    };

  } catch (error) {
    console.error('Error fetching JSE data:', error);
    throw new Error('Failed to fetch JSE trading data');
  }
}

/**
 * Get real-time stock price for a specific symbol
 */
export async function getStockPrice(symbol: string): Promise<JSEStockData | null> {
  try {
    const session = await fetchJSEData();
    const stock = session.stocks.find(s => s.symbol === symbol);
    return stock || null;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get market summary and indices
 */
export async function getMarketSummary(): Promise<JSEMarketSummary> {
  try {
    const session = await fetchJSEData();
    return session.market_summary;
  } catch (error) {
    console.error('Error fetching market summary:', error);
    throw new Error('Failed to fetch market summary');
  }
}

/**
 * Get top gainers for the day
 */
export async function getTopGainers(limit: number = 10): Promise<JSEStockData[]> {
  try {
    const session = await fetchJSEData();
    return session.stocks
      .filter(stock => stock.change > 0)
      .sort((a, b) => b.change_percent - a.change_percent)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    return [];
  }
}

/**
 * Get top losers for the day
 */
export async function getTopLosers(limit: number = 10): Promise<JSEStockData[]> {
  try {
    const session = await fetchJSEData();
    return session.stocks
      .filter(stock => stock.change < 0)
      .sort((a, b) => a.change_percent - b.change_percent)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top losers:', error);
    return [];
  }
}

/**
 * Get most active stocks by volume
 */
export async function getMostActive(limit: number = 10): Promise<JSEStockData[]> {
  try {
    const session = await fetchJSEData();
    return session.stocks
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching most active stocks:', error);
    return [];
  }
}

/**
 * Search stocks by symbol or name
 */
export async function searchStocks(query: string): Promise<JSEStockData[]> {
  try {
    const session = await fetchJSEData();
    const lowercaseQuery = query.toLowerCase();
    
    return session.stocks.filter(stock => 
      stock.symbol.toLowerCase().includes(lowercaseQuery) ||
      stock.name.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
}

/**
 * Get historical data for a stock (mock implementation)
 */
export async function getHistoricalData(
  symbol: string, 
  period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' = '1M'
): Promise<{ date: string; price: number; volume: number }[]> {
  try {
    // Mock historical data
    const days = period === '1D' ? 1 : 
                 period === '1W' ? 7 : 
                 period === '1M' ? 30 : 
                 period === '3M' ? 90 : 
                 period === '6M' ? 180 : 365;
    
    const historicalData = [];
    const basePrice = 100;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic price movement
      const randomChange = (Math.random() - 0.5) * 0.1; // ±5% daily change
      const price = basePrice * (1 + randomChange);
      
      historicalData.push({
        date: date.toISOString().split('T')[0] || date.toLocaleDateString('en-CA'),
        price: Math.round(price * 100) / 100,
        volume: Math.floor(Math.random() * 100000) + 10000
      });
    }
    
    return historicalData;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
  }
}

/**
 * Set up automatic data updates
 * This would typically be implemented with a background service or cron job
 */
export function setupAutomaticUpdates(
  onMarketOpen: () => void,
  onMarketClose: () => void,
  onDataUpdate: (data: JSETradingSession) => void
): () => void {
  // Check market status every minute
  const interval = setInterval(async () => {
    try {
      const marketStatus = getJSEMarketStatus();
      const session = await fetchJSEData();
      
      if (marketStatus.is_open) {
        onDataUpdate(session);
      }
    } catch (error) {
      console.error('Error in automatic update:', error);
    }
  }, 60000); // Check every minute
  
  // Clean up interval when needed
  return () => clearInterval(interval);
}
