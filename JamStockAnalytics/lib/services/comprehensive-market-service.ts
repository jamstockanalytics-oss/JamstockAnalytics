import { supabase } from '../supabase/client';
import { JSE_MAIN_INDEX_COMPANIES } from '../data/jse-companies-database';

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
  market_cap: number;
  pe_ratio: number;
  dividend_yield: number;
  last_updated: string;
  sector?: string;
  industry?: string;
  currency: string;
  exchange: string;
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
  last_updated: string;
}

export interface JSEMarketStatus {
  is_open: boolean;
  trading_day: string;
  next_open: string;
  next_close: string;
  timezone: string;
  last_updated: string;
}

export interface JSETradingSession {
  date: string;
  status: 'open' | 'closed';
  last_update: string;
  stocks: JSEStockData[];
  market_summary: JSEMarketSummary;
  market_status: JSEMarketStatus;
}

export interface JSECompany {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  market_cap: number;
  employees: number;
  founded_year: number;
  headquarters: string;
  website: string;
  description: string;
  ceo: string;
  is_active: boolean;
}

export interface JSEHistoricalData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjusted_close: number;
}

// Use the comprehensive JSE companies database
const JSE_COMPANIES_DATA: JSECompany[] = JSE_MAIN_INDEX_COMPANIES;

// JSE market hours (Jamaica time)
const JSE_MARKET_HOURS = {
  timezone: 'America/Jamaica',
  open: '09:30',
  close: '14:30',
  trading_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
};

class ComprehensiveMarketService {
  private companies: JSECompany[] = JSE_COMPANIES_DATA;
  private marketHours = JSE_MARKET_HOURS;

  /**
   * Get current market status
   */
  getMarketStatus(): JSEMarketStatus {
    const now = new Date();
    const jamaicaTime = new Date(now.toLocaleString("en-US", { timeZone: this.marketHours.timezone }));
    
    const dayOfWeek = jamaicaTime.getDay();
    const isTradingDay = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
    
    const currentTime = jamaicaTime.toTimeString().slice(0, 5);
    const isTradingHours = currentTime >= this.marketHours.open && currentTime <= this.marketHours.close;
    
    const isOpen = isTradingDay && isTradingHours;
    
    // Calculate next open/close times
    const nextOpen = this.getNextOpenTime(jamaicaTime);
    const nextClose = this.getNextCloseTime(jamaicaTime);
    
    return {
      is_open: isOpen,
      trading_day: jamaicaTime.toISOString().split('T')[0] || jamaicaTime.toLocaleDateString('en-CA'),
      next_open: nextOpen,
      next_close: nextClose,
      timezone: this.marketHours.timezone,
      last_updated: now.toISOString()
    };
  }

  /**
   * Get next market open time
   */
  private getNextOpenTime(currentTime: Date): string {
    const nextOpen = new Date(currentTime);
    
    // If it's a weekend or after hours, set to next Monday 9:30 AM
    if (currentTime.getDay() === 0 || currentTime.getDay() === 6 || 
        currentTime.toTimeString().slice(0, 5) > this.marketHours.close) {
      const daysUntilMonday = (8 - currentTime.getDay()) % 7;
      nextOpen.setDate(currentTime.getDate() + daysUntilMonday);
      nextOpen.setHours(9, 30, 0, 0);
    } else {
      // If it's a trading day but before market open, set to today 9:30 AM
      if (currentTime.toTimeString().slice(0, 5) < this.marketHours.open) {
        nextOpen.setHours(9, 30, 0, 0);
      } else {
        // If it's during trading hours, set to next day 9:30 AM
        nextOpen.setDate(currentTime.getDate() + 1);
        nextOpen.setHours(9, 30, 0, 0);
      }
    }
    
    return nextOpen.toISOString();
  }

  /**
   * Get next market close time
   */
  private getNextCloseTime(currentTime: Date): string {
    const nextClose = new Date(currentTime);
    
    // If it's a weekend or after hours, set to next Monday 2:30 PM
    if (currentTime.getDay() === 0 || currentTime.getDay() === 6 || 
        currentTime.toTimeString().slice(0, 5) > this.marketHours.close) {
      const daysUntilMonday = (8 - currentTime.getDay()) % 7;
      nextClose.setDate(currentTime.getDate() + daysUntilMonday);
      nextClose.setHours(14, 30, 0, 0);
    } else {
      // If it's a trading day but before market close, set to today 2:30 PM
      if (currentTime.toTimeString().slice(0, 5) < this.marketHours.close) {
        nextClose.setHours(14, 30, 0, 0);
      } else {
        // If it's after trading hours, set to next day 2:30 PM
        nextClose.setDate(currentTime.getDate() + 1);
        nextClose.setHours(14, 30, 0, 0);
      }
    }
    
    return nextClose.toISOString();
  }

  /**
   * Fetch real-time market data
   */
  async fetchMarketData(): Promise<JSETradingSession> {
    try {
      const marketStatus = this.getMarketStatus();
      const stocks = await this.fetchStockData();
      const marketSummary = this.calculateMarketSummary(stocks);
      
      return {
        date: new Date().toISOString().split('T')[0] || new Date().toLocaleDateString('en-CA'),
        status: marketStatus.is_open ? 'open' : 'closed',
        last_update: new Date().toISOString(),
        stocks,
        market_summary: marketSummary,
        market_status: marketStatus
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  /**
   * Fetch stock data for all companies
   */
  private async fetchStockData(): Promise<JSEStockData[]> {
    try {
      // In production, this would fetch from a real market data API
      // For now, we'll generate realistic data based on market status
      const marketStatus = this.getMarketStatus();
      const stocks: JSEStockData[] = [];
      
      for (const company of this.companies) {
        const stockData = await this.generateStockData(company, marketStatus.is_open);
        stocks.push(stockData);
      }
      
      return stocks;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw error;
    }
  }

  /**
   * Generate realistic stock data for a company
   */
  private async generateStockData(company: JSECompany, isMarketOpen: boolean): Promise<JSEStockData> {
    // Base price based on market cap
    const basePrice = company.market_cap / 100000000; // Simplified calculation
    
    // Generate realistic price movement
    let lastPrice = basePrice;
    let change = 0;
    let changePercent = 0;
    
    if (isMarketOpen) {
      // Market is open - generate realistic intraday movement
      const volatility = 0.02; // 2% volatility
      const randomChange = (Math.random() - 0.5) * volatility;
      lastPrice = basePrice * (1 + randomChange);
      change = lastPrice - basePrice;
      changePercent = (change / basePrice) * 100;
    } else {
      // Market is closed - use previous close
      lastPrice = basePrice;
      change = 0;
      changePercent = 0;
    }
    
    // Generate volume based on company size and market status
    const baseVolume = Math.floor(company.market_cap / 1000000);
    const volume = isMarketOpen ? 
      baseVolume + Math.floor(Math.random() * baseVolume) : 
      baseVolume;
    
    // Generate high/low based on last price
    const high = lastPrice * (1 + Math.random() * 0.02);
    const low = lastPrice * (1 - Math.random() * 0.02);
    
    // Generate P/E ratio and dividend yield
    const peRatio = 8 + Math.random() * 20; // 8-28 range
    const dividendYield = 1 + Math.random() * 5; // 1-6% range
    
    return {
      symbol: company.symbol,
      name: company.name,
      last_price: Math.round(lastPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      change_percent: Math.round(changePercent * 100) / 100,
      volume: volume,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      open: Math.round(basePrice * 100) / 100,
      previous_close: Math.round(basePrice * 100) / 100,
      market_cap: company.market_cap,
      pe_ratio: Math.round(peRatio * 100) / 100,
      dividend_yield: Math.round(dividendYield * 100) / 100,
      last_updated: new Date().toISOString(),
      sector: company.sector,
      industry: company.industry,
      currency: 'JMD',
      exchange: 'JSE'
    };
  }

  /**
   * Calculate market summary
   */
  private calculateMarketSummary(stocks: JSEStockData[]): JSEMarketSummary {
    const totalVolume = stocks.reduce((sum, stock) => sum + stock.volume, 0);
    const totalValue = stocks.reduce((sum, stock) => sum + (stock.last_price * stock.volume), 0);
    
    const advancingStocks = stocks.filter(stock => stock.change > 0).length;
    const decliningStocks = stocks.filter(stock => stock.change < 0).length;
    const unchangedStocks = stocks.filter(stock => stock.change === 0).length;
    
    // Calculate market index (simplified)
    const marketIndex = stocks.reduce((sum, stock) => sum + stock.last_price, 0) / stocks.length;
    const marketChange = stocks.reduce((sum, stock) => sum + stock.change, 0);
    const marketChangePercent = (marketChange / marketIndex) * 100;
    
    return {
      total_volume: totalVolume,
      total_value: Math.round(totalValue),
      advancing_stocks: advancingStocks,
      declining_stocks: decliningStocks,
      unchanged_stocks: unchangedStocks,
      market_index: Math.round(marketIndex * 100) / 100,
      market_change: Math.round(marketChange * 100) / 100,
      market_change_percent: Math.round(marketChangePercent * 100) / 100,
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Get all JSE companies
   */
  getCompanies(): JSECompany[] {
    return this.companies;
  }

  /**
   * Get company by symbol
   */
  getCompanyBySymbol(symbol: string): JSECompany | null {
    return this.companies.find(company => company.symbol === symbol) || null;
  }

  /**
   * Get companies by sector
   */
  getCompaniesBySector(sector: string): JSECompany[] {
    return this.companies.filter(company => company.sector === sector);
  }

  /**
   * Get companies by industry
   */
  getCompaniesByIndustry(industry: string): JSECompany[] {
    return this.companies.filter(company => company.industry === industry);
  }

  /**
   * Search companies
   */
  searchCompanies(query: string): JSECompany[] {
    const lowercaseQuery = query.toLowerCase();
    return this.companies.filter(company => 
      company.name.toLowerCase().includes(lowercaseQuery) ||
      company.symbol.toLowerCase().includes(lowercaseQuery) ||
      company.sector.toLowerCase().includes(lowercaseQuery) ||
      company.industry.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get top gainers
   */
  async getTopGainers(limit: number = 5): Promise<JSEStockData[]> {
    try {
      const marketData = await this.fetchMarketData();
      return marketData.stocks
        .sort((a, b) => b.change_percent - a.change_percent)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      throw error;
    }
  }

  /**
   * Get top losers
   */
  async getTopLosers(limit: number = 5): Promise<JSEStockData[]> {
    try {
      const marketData = await this.fetchMarketData();
      return marketData.stocks
        .sort((a, b) => a.change_percent - b.change_percent)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top losers:', error);
      throw error;
    }
  }

  /**
   * Get most active stocks
   */
  async getMostActive(limit: number = 5): Promise<JSEStockData[]> {
    try {
      const marketData = await this.fetchMarketData();
      return marketData.stocks
        .sort((a, b) => b.volume - a.volume)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching most active stocks:', error);
      throw error;
    }
  }

  /**
   * Get stock by symbol
   */
  async getStockBySymbol(symbol: string): Promise<JSEStockData | null> {
    try {
      const marketData = await this.fetchMarketData();
      return marketData.stocks.find(stock => stock.symbol === symbol) || null;
    } catch (error) {
      console.error('Error fetching stock by symbol:', error);
      throw error;
    }
  }

  /**
   * Get historical data for a stock
   */
  async getHistoricalData(
    symbol: string, 
    period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' = '1M'
  ): Promise<JSEHistoricalData[]> {
    try {
      // In production, this would fetch from a real historical data API
      // For now, we'll generate realistic historical data
      const days = period === '1D' ? 1 : 
                   period === '1W' ? 7 : 
                   period === '1M' ? 30 : 
                   period === '3M' ? 90 : 
                   period === '6M' ? 180 : 365;
      
      const historicalData: JSEHistoricalData[] = [];
      const company = this.getCompanyBySymbol(symbol);
      
      if (!company) {
        throw new Error(`Company with symbol ${symbol} not found`);
      }
      
      const basePrice = company.market_cap / 100000000;
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Generate realistic price movement
        const randomChange = (Math.random() - 0.5) * 0.05; // ±2.5% daily change
        const close = basePrice * (1 + randomChange);
        const open = close * (1 + (Math.random() - 0.5) * 0.02);
        const high = Math.max(open, close) * (1 + Math.random() * 0.02);
        const low = Math.min(open, close) * (1 - Math.random() * 0.02);
        const volume = Math.floor(Math.random() * 100000) + 10000;
        
        historicalData.push({
          symbol,
          date: date.toISOString().split('T')[0] || date.toLocaleDateString('en-CA'),
          open: Math.round(open * 100) / 100,
          high: Math.round(high * 100) / 100,
          low: Math.round(low * 100) / 100,
          close: Math.round(close * 100) / 100,
          volume,
          adjusted_close: Math.round(close * 100) / 100
        });
      }
      
      return historicalData;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Store market data in database
   */
  async storeMarketData(marketData: JSETradingSession): Promise<void> {
    try {
      // Store market summary
      const { error: summaryError } = await supabase
        .from('market_summaries')
        .upsert({
          date: marketData.date,
          total_volume: marketData.market_summary.total_volume,
          total_value: marketData.market_summary.total_value,
          advancing_stocks: marketData.market_summary.advancing_stocks,
          declining_stocks: marketData.market_summary.declining_stocks,
          unchanged_stocks: marketData.market_summary.unchanged_stocks,
          market_index: marketData.market_summary.market_index,
          market_change: marketData.market_summary.market_change,
          market_change_percent: marketData.market_summary.market_change_percent,
          last_updated: marketData.market_summary.last_updated
        });

      if (summaryError) {
        console.error('Error storing market summary:', summaryError);
      }

      // Store stock data
      const { error: stocksError } = await supabase
        .from('stock_data')
        .upsert(marketData.stocks.map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          last_price: stock.last_price,
          change: stock.change,
          change_percent: stock.change_percent,
          volume: stock.volume,
          high: stock.high,
          low: stock.low,
          open: stock.open,
          previous_close: stock.previous_close,
          market_cap: stock.market_cap,
          pe_ratio: stock.pe_ratio,
          dividend_yield: stock.dividend_yield,
          last_updated: stock.last_updated,
          sector: stock.sector,
          industry: stock.industry,
          currency: stock.currency,
          exchange: stock.exchange
        })));

      if (stocksError) {
        console.error('Error storing stock data:', stocksError);
      }
    } catch (error) {
      console.error('Error storing market data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const comprehensiveMarketService = new ComprehensiveMarketService();

export default comprehensiveMarketService;

// Export convenience functions
export async function fetchMarketData(): Promise<JSETradingSession> {
  return await comprehensiveMarketService.fetchMarketData();
}

export function getMarketStatus(): JSEMarketStatus {
  return comprehensiveMarketService.getMarketStatus();
}

export function getCompanies(): JSECompany[] {
  return comprehensiveMarketService.getCompanies();
}

export function getCompanyBySymbol(symbol: string): JSECompany | null {
  return comprehensiveMarketService.getCompanyBySymbol(symbol);
}

export function getCompaniesBySector(sector: string): JSECompany[] {
  return comprehensiveMarketService.getCompaniesBySector(sector);
}

export function getCompaniesByIndustry(industry: string): JSECompany[] {
  return comprehensiveMarketService.getCompaniesByIndustry(industry);
}

export function searchCompanies(query: string): JSECompany[] {
  return comprehensiveMarketService.searchCompanies(query);
}

export async function getTopGainers(limit?: number): Promise<JSEStockData[]> {
  return await comprehensiveMarketService.getTopGainers(limit);
}

export async function getTopLosers(limit?: number): Promise<JSEStockData[]> {
  return await comprehensiveMarketService.getTopLosers(limit);
}

export async function getMostActive(limit?: number): Promise<JSEStockData[]> {
  return await comprehensiveMarketService.getMostActive(limit);
}

export async function getStockBySymbol(symbol: string): Promise<JSEStockData | null> {
  return await comprehensiveMarketService.getStockBySymbol(symbol);
}

export async function getHistoricalData(
  symbol: string, 
  period?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y'
): Promise<JSEHistoricalData[]> {
  return await comprehensiveMarketService.getHistoricalData(symbol, period);
}
