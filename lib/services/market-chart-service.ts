import { supabase } from '../supabase/client';
import { ChartData } from '../../components/charts/ChartDesigns';

export interface MarketDataPoint {
  date: string;
  price: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface StockPerformanceData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  data: MarketDataPoint[];
}

export interface MarketSummaryData {
  totalStocks: number;
  gainers: number;
  losers: number;
  unchanged: number;
  totalVolume: number;
  marketCap: number;
  topGainers: StockPerformanceData[];
  topLosers: StockPerformanceData[];
  mostActive: StockPerformanceData[];
}

export interface ChartTimeRange {
  id: string;
  name: string;
  days: number;
  label: string;
}

export const CHART_TIME_RANGES: ChartTimeRange[] = [
  { id: '1d', name: '1 Day', days: 1, label: '1D' },
  { id: '5d', name: '5 Days', days: 5, label: '5D' },
  { id: '1m', name: '1 Month', days: 30, label: '1M' },
  { id: '3m', name: '3 Months', days: 90, label: '3M' },
  { id: '6m', name: '6 Months', days: 180, label: '6M' },
  { id: '1y', name: '1 Year', days: 365, label: '1Y' },
  { id: 'all', name: 'All Time', days: 0, label: 'ALL' },
];

export class MarketChartService {
  /**
   * Get market data for a specific symbol and time range
   */
  static async getStockData(
    symbol: string,
    timeRange: string = '1m'
  ): Promise<{ data: StockPerformanceData | null; error: string | null }> {
    try {
      const range = CHART_TIME_RANGES.find(r => r.id === timeRange);
      if (!range) {
        return { data: null, error: 'Invalid time range' };
      }

      // Get stock data from database
      const { data: stockData, error: stockError } = await supabase
        .from('stocks')
        .select('*')
        .eq('symbol', symbol)
        .single();

      if (stockError) {
        return { data: null, error: stockError.message };
      }

      // Get historical data
      let query = supabase
        .from('stock_prices')
        .select('*')
        .eq('symbol', symbol)
        .order('date', { ascending: true });

      if (range.days > 0) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - range.days);
        query = query.gte('date', startDate.toISOString());
      }

      const { data: priceData, error: priceError } = await query;

      if (priceError) {
        return { data: null, error: priceError.message };
      }

      // Transform data
      const transformedData: StockPerformanceData = {
        symbol: stockData.symbol,
        name: stockData.name,
        currentPrice: stockData.current_price || 0,
        change: stockData.change || 0,
        changePercent: stockData.change_percent || 0,
        volume: stockData.volume || 0,
        marketCap: stockData.market_cap || 0,
        data: priceData?.map(point => ({
          date: point.date,
          price: point.close_price,
          volume: point.volume,
          open: point.open_price,
          high: point.high_price,
          low: point.low_price,
          close: point.close_price,
        })) || [],
      };

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch stock data' };
    }
  }

  /**
   * Get market summary data
   */
  static async getMarketSummary(): Promise<{ data: MarketSummaryData | null; error: string | null }> {
    try {
      // Get all stocks
      const { data: stocks, error: stocksError } = await supabase
        .from('stocks')
        .select('*')
        .order('market_cap', { ascending: false });

      if (stocksError) {
        return { data: null, error: stocksError.message };
      }

      // Calculate summary
      const totalStocks = stocks.length;
      const gainers = stocks.filter(s => s.change > 0).length;
      const losers = stocks.filter(s => s.change < 0).length;
      const unchanged = stocks.filter(s => s.change === 0).length;
      const totalVolume = stocks.reduce((sum, s) => sum + (s.volume || 0), 0);
      const marketCap = stocks.reduce((sum, s) => sum + (s.market_cap || 0), 0);

      // Get top performers
      const topGainers = stocks
        .filter(s => s.change > 0)
        .sort((a, b) => b.change_percent - a.change_percent)
        .slice(0, 5)
        .map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          currentPrice: stock.current_price,
          change: stock.change,
          changePercent: stock.change_percent,
          volume: stock.volume,
          marketCap: stock.market_cap,
          data: [], // Will be populated separately if needed
        }));

      const topLosers = stocks
        .filter(s => s.change < 0)
        .sort((a, b) => a.change_percent - b.change_percent)
        .slice(0, 5)
        .map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          currentPrice: stock.current_price,
          change: stock.change,
          changePercent: stock.change_percent,
          volume: stock.volume,
          marketCap: stock.market_cap,
          data: [],
        }));

      const mostActive = stocks
        .sort((a, b) => (b.volume || 0) - (a.volume || 0))
        .slice(0, 5)
        .map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          currentPrice: stock.current_price,
          change: stock.change,
          changePercent: stock.change_percent,
          volume: stock.volume,
          marketCap: stock.market_cap,
          data: [],
        }));

      const summary: MarketSummaryData = {
        totalStocks,
        gainers,
        losers,
        unchanged,
        totalVolume,
        marketCap,
        topGainers,
        topLosers,
        mostActive,
      };

      return { data: summary, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch market summary' };
    }
  }

  /**
   * Convert stock data to chart format
   */
  static convertToChartData(
    stockData: StockPerformanceData,
    type: 'price' | 'volume' | 'performance' = 'price'
  ): ChartData {
    const labels = stockData.data.map(point => {
      const date = new Date(point.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    let data: number[];
    let color: (opacity: number) => string;

    switch (type) {
      case 'price':
        data = stockData.data.map(point => point.close);
        color = (opacity = 1) => `rgba(52, 152, 219, ${opacity})`;
        break;
      case 'volume':
        data = stockData.data.map(point => point.volume);
        color = (opacity = 1) => `rgba(46, 204, 113, ${opacity})`;
        break;
      case 'performance':
        const firstPrice = stockData.data[0]?.close || 0;
        data = stockData.data.map(point => 
          firstPrice > 0 ? ((point.close - firstPrice) / firstPrice) * 100 : 0
        );
        color = (opacity = 1) => `rgba(231, 76, 60, ${opacity})`;
        break;
      default:
        data = stockData.data.map(point => point.close);
        color = (opacity = 1) => `rgba(52, 152, 219, ${opacity})`;
    }

    return {
      labels,
      datasets: [{
        data,
        color,
        strokeWidth: 2,
      }],
    };
  }

  /**
   * Get sector performance data
   */
  static async getSectorPerformance(): Promise<{ data: ChartData | null; error: string | null }> {
    try {
      const { data: sectors, error } = await supabase
        .from('sectors')
        .select('name, performance')
        .order('performance', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      const chartData: ChartData = {
        labels: sectors.map(s => s.name),
        datasets: [{
          data: sectors.map(s => s.performance),
          color: (opacity = 1) => `rgba(155, 89, 182, ${opacity})`,
        }],
      };

      return { data: chartData, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch sector performance' };
    }
  }

  /**
   * Get market indices data
   */
  static async getMarketIndices(): Promise<{ data: ChartData | null; error: string | null }> {
    try {
      const { data: indices, error } = await supabase
        .from('market_indices')
        .select('name, value, change_percent')
        .order('value', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      const chartData: ChartData = {
        labels: indices.map(i => i.name),
        datasets: [{
          data: indices.map(i => i.value),
          color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
        }],
      };

      return { data: chartData, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch market indices' };
    }
  }

  /**
   * Get portfolio performance data
   */
  static async getPortfolioPerformance(
    userId: string,
    timeRange: string = '1m'
  ): Promise<{ data: ChartData | null; error: string | null }> {
    try {
      const range = CHART_TIME_RANGES.find(r => r.id === timeRange);
      if (!range) {
        return { data: null, error: 'Invalid time range' };
      }

      // Get user's portfolio
      const { data: portfolio, error: portfolioError } = await supabase
        .from('user_portfolios')
        .select('*')
        .eq('user_id', userId);

      if (portfolioError) {
        return { data: null, error: portfolioError.message };
      }

      // Calculate portfolio performance over time
      const performanceData = await this.calculatePortfolioPerformance(portfolio, range.days);

      const chartData: ChartData = {
        labels: performanceData.map(p => p.date),
        datasets: [{
          data: performanceData.map(p => p.value),
          color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
        }],
      };

      return { data: chartData, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to fetch portfolio performance' };
    }
  }

  /**
   * Calculate portfolio performance over time
   */
  private static async calculatePortfolioPerformance(
    portfolio: any[],
    days: number
  ): Promise<{ date: string; value: number }[]> {
    // This is a simplified calculation
    // In a real implementation, you would calculate the actual portfolio value over time
    const performanceData = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Simplified calculation - in reality, you'd calculate based on stock prices
      const value = 10000 + (Math.random() - 0.5) * 1000;
      
      performanceData.push({
        date: date.toISOString().split('T')[0] || date.toLocaleDateString('en-CA'),
        value,
      });
    }

    return performanceData;
  }

  /**
   * Export chart data to CSV
   */
  static exportToCSV(chartData: ChartData, filename: string = 'chart_data.csv'): string {
    const headers = ['Date', 'Value'];
    const rows = chartData.labels.map((label, index) => [
      label,
      chartData.datasets[0].data[index].toString(),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Get chart configuration for different chart types
   */
  static getChartConfig(chartType: string, design: any) {
    const baseConfig = {
      backgroundColor: design.colors.background,
      backgroundGradientFrom: design.colors.background,
      backgroundGradientTo: design.colors.background,
      decimalPlaces: 2,
      color: (opacity = 1) => design.colors.primary,
      labelColor: (opacity = 1) => design.colors.text,
      style: {
        borderRadius: 8,
      },
    };

    switch (chartType) {
      case 'line':
        return {
          ...baseConfig,
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: design.colors.primary,
          },
        };
      case 'bar':
        return {
          ...baseConfig,
          barPercentage: 0.7,
        };
      case 'pie':
        return {
          ...baseConfig,
          propsForLabels: {
            fontSize: 12,
            fontFamily: 'System',
          },
        };
      default:
        return baseConfig;
    }
  }
}
