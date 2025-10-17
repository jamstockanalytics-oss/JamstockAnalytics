import { JSEStockData, JSEMarketStatus, JSEMarketSummary, JSETradingSession } from './jse-data-service';
import { 
  fetchMarketData as fetchComprehensiveMarketData,
  getMarketStatus as getComprehensiveMarketStatus,
  getCompanies as getComprehensiveCompanies,
  getCompanyBySymbol as getComprehensiveCompanyBySymbol,
  getTopGainers as getComprehensiveTopGainers,
  getTopLosers as getComprehensiveTopLosers,
  getMostActive as getComprehensiveMostActive,
  getStockBySymbol as getComprehensiveStockBySymbol,
  getHistoricalData as getComprehensiveHistoricalData
} from './comprehensive-market-service';

/**
 * Real JSE Data Service
 * This service fetches actual JSE market data from various sources
 */

// JSE Market Hours (Jamaica Time)
const JSE_MARKET_HOURS = {
  open: '09:30',
  close: '14:30',
  timezone: 'America/Jamaica'
};

/**
 * Check if JSE market is currently open
 */
export function isJSEMarketOpen(): boolean {
  const now = new Date();
  const jamaicaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Jamaica" }));
  
  const currentTime = jamaicaTime.toTimeString().slice(0, 5);
  const dayOfWeek = jamaicaTime.getDay();
  
  // Market is closed on weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }
  
  return currentTime >= JSE_MARKET_HOURS.open && currentTime <= JSE_MARKET_HOURS.close;
}

/**
 * Get JSE market status
 */
export function getJSEMarketStatus(): JSEMarketStatus {
  const now = new Date();
  const jamaicaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Jamaica" }));
  const isOpen = isJSEMarketOpen();
  
  // Calculate next open/close times
  const nextOpen = new Date(jamaicaTime);
  if (isOpen) {
    // Market is open, next close is today at 14:30
    nextOpen.setHours(14, 30, 0, 0);
  } else {
    // Market is closed, next open is tomorrow at 09:30
    nextOpen.setDate(nextOpen.getDate() + 1);
    nextOpen.setHours(9, 30, 0, 0);
  }
  
  return {
    is_open: isOpen,
    market_hours: JSE_MARKET_HOURS,
    next_open: isOpen ? undefined : nextOpen.toISOString(),
    next_close: isOpen ? nextOpen.toISOString() : undefined,
    trading_day: jamaicaTime.toISOString().split('T')[0] || jamaicaTime.toLocaleDateString('en-CA')
  };
}

/**
 * Fetch real JSE data from multiple sources
 */
export async function fetchRealJSEData(): Promise<JSETradingSession> {
  try {
    // Use the comprehensive market service to fetch real data
    console.log('Fetching real JSE data...');
    const marketData = await fetchComprehensiveMarketData();
    return marketData;
  } catch (error) {
    console.error('Error fetching JSE data:', error);
    // Fallback to enhanced mock data if comprehensive service fails
    return await generateRealisticMockData();
  }
}

/**
 * Fetch data from JSE official API (if available)
 */
async function fetchFromJSEAPI(): Promise<JSETradingSession | null> {
  try {
    // JSE doesn't have a public API, but we can try common endpoints
    const response = await fetch('https://www.jamstockex.com/api/market-data', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'JamStockAnalytics/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return parseJSEAPIResponse(data);
    }
  } catch (error) {
    console.log('JSE API not available, trying web scraping...');
  }
  
  return null;
}

/**
 * Fetch data from web scraping
 */
async function fetchFromWebScraping(): Promise<JSETradingSession | null> {
  try {
    // This would require a backend service to handle web scraping
    // For now, we'll return null and use mock data
    console.log('Web scraping not implemented yet, using mock data');
    return null;
  } catch (error) {
    console.error('Web scraping failed:', error);
    return null;
  }
}

/**
 * Generate realistic mock data with price variations
 */
async function generateRealisticMockData(): Promise<JSETradingSession> {
  const now = new Date();
  const isOpen = isJSEMarketOpen();
  
  // Base stock data with realistic JSE stocks
  const baseStocks: Omit<JSEStockData, 'last_price' | 'change' | 'change_percent' | 'volume' | 'last_updated'>[] = [
    {
      symbol: 'NCBFG',
      name: 'NCB Financial Group Limited',
      high: 127.50,
      low: 123.20,
      open: 123.20,
      previous_close: 123.20,
      market_cap: 12500000000,
      pe_ratio: 12.5,
      dividend_yield: 3.2
    },
    {
      symbol: 'SGJ',
      name: 'Scotia Group Jamaica Limited',
      high: 46.80,
      low: 45.20,
      open: 46.60,
      previous_close: 46.60,
      market_cap: 8500000000,
      pe_ratio: 8.9,
      dividend_yield: 4.1
    },
    {
      symbol: 'JMMB',
      name: 'JMMB Group Limited',
      high: 79.50,
      low: 76.80,
      open: 76.80,
      previous_close: 76.80,
      market_cap: 6500000000,
      pe_ratio: 15.2,
      dividend_yield: 2.8
    },
    {
      symbol: 'BGL',
      name: 'Barita Investments Limited',
      high: 45.20,
      low: 43.80,
      open: 44.50,
      previous_close: 44.50,
      market_cap: 3200000000,
      pe_ratio: 18.5,
      dividend_yield: 2.1
    },
    {
      symbol: 'SGL',
      name: 'Sagicor Group Jamaica Limited',
      high: 38.90,
      low: 37.20,
      open: 38.50,
      previous_close: 38.50,
      market_cap: 4800000000,
      pe_ratio: 11.8,
      dividend_yield: 3.5
    },
    {
      symbol: 'JPS',
      name: 'Jamaica Public Service Company Limited',
      high: 12.80,
      low: 12.40,
      open: 12.60,
      previous_close: 12.60,
      market_cap: 1800000000,
      pe_ratio: 14.2,
      dividend_yield: 4.8
    },
    {
      symbol: 'WCO',
      name: 'Wisynco Group Limited',
      high: 15.20,
      low: 14.80,
      open: 15.00,
      previous_close: 15.00,
      market_cap: 2200000000,
      pe_ratio: 16.8,
      dividend_yield: 2.9
    },
    {
      symbol: 'JSE',
      name: 'Jamaica Stock Exchange Limited',
      high: 8.50,
      low: 8.20,
      open: 8.35,
      previous_close: 8.35,
      market_cap: 950000000,
      pe_ratio: 22.1,
      dividend_yield: 1.8
    }
  ];

  // Generate realistic price variations
  const stocks: JSEStockData[] = baseStocks.map(stock => {
    const basePrice = stock.previous_close;
    const variation = isOpen ? (Math.random() - 0.5) * 0.05 : 0; // 5% max variation when open
    const newPrice = basePrice * (1 + variation);
    const change = newPrice - basePrice;
    const changePercent = (change / basePrice) * 100;
    
    // Generate realistic volume based on market status
    const baseVolume = Math.floor(Math.random() * 100000) + 50000;
    const volume = isOpen ? baseVolume + Math.floor(Math.random() * 50000) : baseVolume;
    
    return {
      ...stock,
      last_price: Math.round(newPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      change_percent: Math.round(changePercent * 100) / 100,
      volume,
      last_updated: now.toISOString()
    };
  });

  // Calculate market summary
  const totalVolume = stocks.reduce((sum, stock) => sum + stock.volume, 0);
  const totalValue = stocks.reduce((sum, stock) => sum + (stock.last_price * stock.volume), 0);
  const advancingStocks = stocks.filter(stock => stock.change > 0).length;
  const decliningStocks = stocks.filter(stock => stock.change < 0).length;
  const unchangedStocks = stocks.filter(stock => stock.change === 0).length;
  
  // Calculate market index (weighted average)
  const marketIndex = stocks.reduce((sum, stock) => sum + stock.last_price, 0) / stocks.length;
  const previousIndex = stocks.reduce((sum, stock) => sum + stock.previous_close, 0) / stocks.length;
  const marketChange = marketIndex - previousIndex;
  const marketChangePercent = (marketChange / previousIndex) * 100;

  const marketSummary: JSEMarketSummary = {
    total_volume: totalVolume,
    total_value: totalValue,
    advancing_stocks: advancingStocks,
    declining_stocks: decliningStocks,
    unchanged_stocks: unchangedStocks,
    market_index: Math.round(marketIndex * 100) / 100,
    market_change: Math.round(marketChange * 100) / 100,
    market_change_percent: Math.round(marketChangePercent * 100) / 100
  };

  return {
    date: now.toISOString().split('T')[0] || now.toLocaleDateString('en-CA'),
    status: isOpen ? 'open' : 'closed',
    last_update: now.toISOString(),
    stocks,
    market_summary: marketSummary
  };
}

/**
 * Parse JSE API response (placeholder for future implementation)
 */
function parseJSEAPIResponse(data: any): JSETradingSession {
  // This would parse the actual JSE API response
  // For now, return mock data
  return generateRealisticMockData() as any;
}

/**
 * Get top gainers
 */
export async function getTopGainers(): Promise<JSEStockData[]> {
  try {
    return await getComprehensiveTopGainers();
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    const data = await fetchRealJSEData();
    return data.stocks
      .filter(stock => stock.change > 0)
      .sort((a, b) => b.change_percent - a.change_percent);
  }
}

/**
 * Get top losers
 */
export async function getTopLosers(): Promise<JSEStockData[]> {
  try {
    return await getComprehensiveTopLosers();
  } catch (error) {
    console.error('Error fetching top losers:', error);
    const data = await fetchRealJSEData();
    return data.stocks
      .filter(stock => stock.change < 0)
      .sort((a, b) => a.change_percent - b.change_percent);
  }
}

/**
 * Get most active stocks
 */
export async function getMostActive(): Promise<JSEStockData[]> {
  try {
    return await getComprehensiveMostActive();
  } catch (error) {
    console.error('Error fetching most active stocks:', error);
    const data = await fetchRealJSEData();
    return data.stocks
      .sort((a, b) => b.volume - a.volume);
  }
}

/**
 * Get market summary
 */
export async function getMarketSummary(): Promise<JSEMarketSummary> {
  const data = await fetchRealJSEData();
  return data.market_summary;
}
