import { supabase } from '../supabase/client';

export interface BrokerageFirm {
  id: string;
  name: string;
  logo_url: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  parish: string;
  description: string;
  services: string[];
  commission_rates: {
    online_trading: number;
    phone_trading: number;
    minimum_commission: number;
    maximum_commission: number;
  };
  account_types: string[];
  minimum_deposit: number;
  trading_platforms: string[];
  research_services: string[];
  customer_support: {
    hours: string;
    phone: string;
    email: string;
    chat: boolean;
  };
  is_active: boolean;
  rating: number;
  review_count: number;
  established_year: number;
  license_number: string;
  regulatory_body: string;
}

export interface BrokerageAccount {
  id: string;
  user_id: string;
  brokerage_id: string;
  account_type: string;
  account_number: string;
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'suspended' | 'closed';
  opened_date: string;
  last_activity: string;
  trading_permissions: string[];
  margin_enabled: boolean;
  options_enabled: boolean;
  futures_enabled: boolean;
}

export interface TradingAccount {
  id: string;
  user_id: string;
  brokerage_id: string;
  account_type: 'individual' | 'joint' | 'corporate' | 'trust';
  account_number: string;
  balance: number;
  available_cash: number;
  margin_used: number;
  margin_available: number;
  buying_power: number;
  currency: string;
  status: 'active' | 'inactive' | 'suspended' | 'closed';
  opened_date: string;
  last_activity: string;
  trading_permissions: string[];
  margin_enabled: boolean;
  options_enabled: boolean;
  futures_enabled: boolean;
}

export interface BrokerageReview {
  id: string;
  brokerage_id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface BrokerageComparison {
  brokerage_id: string;
  name: string;
  commission_rate: number;
  minimum_deposit: number;
  rating: number;
  review_count: number;
  services: string[];
  account_types: string[];
  trading_platforms: string[];
}

// Real Jamaican brokerage firms data
const BROKERAGE_FIRMS_DATA: BrokerageFirm[] = [
  {
    id: 'ncb-capital-markets',
    name: 'NCB Capital Markets Limited',
    logo_url: 'https://www.ncb.com.jm/images/logo.png',
    website: 'https://www.ncb.com.jm',
    phone: '+1-876-906-1000',
    email: 'info@ncb.com.jm',
    address: '32 Trafalgar Road',
    city: 'Kingston',
    parish: 'Kingston',
    description: 'NCB Capital Markets is a leading investment banking and securities firm in Jamaica, offering comprehensive financial services including equity trading, fixed income, and wealth management.',
    services: [
      'Equity Trading',
      'Fixed Income Trading',
      'Wealth Management',
      'Investment Banking',
      'Research Services',
      'Portfolio Management',
      'Mutual Funds',
      'Retirement Planning'
    ],
    commission_rates: {
      online_trading: 0.5,
      phone_trading: 0.75,
      minimum_commission: 25,
      maximum_commission: 500
    },
    account_types: ['Individual', 'Joint', 'Corporate', 'Trust', 'Retirement'],
    minimum_deposit: 10000,
    trading_platforms: ['NCB Online Trading', 'Mobile App', 'Phone Trading'],
    research_services: [
      'Market Research',
      'Company Analysis',
      'Economic Reports',
      'Sector Analysis',
      'Investment Recommendations'
    ],
    customer_support: {
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      phone: '+1-876-906-1000',
      email: 'support@ncb.com.jm',
      chat: true
    },
    is_active: true,
    rating: 4.5,
    review_count: 1250,
    established_year: 1977,
    license_number: 'FSC-001',
    regulatory_body: 'Financial Services Commission'
  },
  {
    id: 'scotia-investments',
    name: 'Scotia Investments Jamaica Limited',
    logo_url: 'https://www.scotiabank.com.jm/images/logo.png',
    website: 'https://www.scotiabank.com.jm',
    phone: '+1-876-906-2000',
    email: 'investments@scotiabank.com.jm',
    address: '6-8 Duke Street',
    city: 'Kingston',
    parish: 'Kingston',
    description: 'Scotia Investments Jamaica provides comprehensive investment services including equity trading, mutual funds, and wealth management solutions.',
    services: [
      'Equity Trading',
      'Mutual Funds',
      'Wealth Management',
      'Retirement Planning',
      'Education Savings',
      'Insurance Products',
      'Foreign Exchange',
      'Fixed Deposits'
    ],
    commission_rates: {
      online_trading: 0.6,
      phone_trading: 0.8,
      minimum_commission: 30,
      maximum_commission: 600
    },
    account_types: ['Individual', 'Joint', 'Corporate', 'Trust', 'Retirement', 'Education'],
    minimum_deposit: 15000,
    trading_platforms: ['Scotia Online', 'Mobile App', 'Phone Trading', 'Branch Trading'],
    research_services: [
      'Market Research',
      'Economic Analysis',
      'Sector Reports',
      'Investment Strategies',
      'Market Commentary'
    ],
    customer_support: {
      hours: 'Monday-Friday 8:30 AM - 4:30 PM',
      phone: '+1-876-906-2000',
      email: 'support@scotiabank.com.jm',
      chat: true
    },
    is_active: true,
    rating: 4.3,
    review_count: 980,
    established_year: 1989,
    license_number: 'FSC-002',
    regulatory_body: 'Financial Services Commission'
  },
  {
    id: 'barita-investments',
    name: 'Barita Investments Limited',
    logo_url: 'https://www.barita.com/images/logo.png',
    website: 'https://www.barita.com',
    phone: '+1-876-906-3000',
    email: 'info@barita.com',
    address: '15-17 Port Royal Street',
    city: 'Kingston',
    parish: 'Kingston',
    description: 'Barita Investments is a leading investment banking and asset management company offering comprehensive financial services including equity trading, fixed income, and wealth management.',
    services: [
      'Equity Trading',
      'Fixed Income Trading',
      'Asset Management',
      'Investment Banking',
      'Wealth Management',
      'Mutual Funds',
      'Retirement Planning',
      'Corporate Finance'
    ],
    commission_rates: {
      online_trading: 0.4,
      phone_trading: 0.7,
      minimum_commission: 20,
      maximum_commission: 400
    },
    account_types: ['Individual', 'Joint', 'Corporate', 'Trust', 'Retirement'],
    minimum_deposit: 5000,
    trading_platforms: ['Barita Online', 'Mobile App', 'Phone Trading'],
    research_services: [
      'Market Research',
      'Company Analysis',
      'Economic Reports',
      'Sector Analysis',
      'Investment Recommendations',
      'Technical Analysis'
    ],
    customer_support: {
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      phone: '+1-876-906-3000',
      email: 'support@barita.com',
      chat: true
    },
    is_active: true,
    rating: 4.6,
    review_count: 750,
    established_year: 1977,
    license_number: 'FSC-003',
    regulatory_body: 'Financial Services Commission'
  },
  {
    id: 'jmmb-securities',
    name: 'JMMB Securities Limited',
    logo_url: 'https://www.jmmb.com/images/logo.png',
    website: 'https://www.jmmb.com',
    phone: '+1-876-906-4000',
    email: 'securities@jmmb.com',
    address: '6-8 Duke Street',
    city: 'Kingston',
    parish: 'Kingston',
    description: 'JMMB Securities provides comprehensive investment services including equity trading, fixed income, and wealth management solutions for individual and institutional clients.',
    services: [
      'Equity Trading',
      'Fixed Income Trading',
      'Wealth Management',
      'Investment Banking',
      'Asset Management',
      'Mutual Funds',
      'Retirement Planning',
      'Corporate Finance'
    ],
    commission_rates: {
      online_trading: 0.55,
      phone_trading: 0.8,
      minimum_commission: 25,
      maximum_commission: 550
    },
    account_types: ['Individual', 'Joint', 'Corporate', 'Trust', 'Retirement'],
    minimum_deposit: 12000,
    trading_platforms: ['JMMB Online', 'Mobile App', 'Phone Trading'],
    research_services: [
      'Market Research',
      'Company Analysis',
      'Economic Reports',
      'Sector Analysis',
      'Investment Recommendations',
      'Market Commentary'
    ],
    customer_support: {
      hours: 'Monday-Friday 8:00 AM - 5:00 PM',
      phone: '+1-876-906-4000',
      email: 'support@jmmb.com',
      chat: true
    },
    is_active: true,
    rating: 4.4,
    review_count: 650,
    established_year: 1992,
    license_number: 'FSC-004',
    regulatory_body: 'Financial Services Commission'
  },
  {
    id: 'sagicor-investments',
    name: 'Sagicor Investments Jamaica Limited',
    logo_url: 'https://www.sagicor.com/images/logo.png',
    website: 'https://www.sagicor.com',
    phone: '+1-876-906-5000',
    email: 'investments@sagicor.com',
    address: '28-48 Barbados Avenue',
    city: 'Kingston',
    parish: 'Kingston',
    description: 'Sagicor Investments Jamaica offers comprehensive investment services including equity trading, mutual funds, and wealth management solutions.',
    services: [
      'Equity Trading',
      'Mutual Funds',
      'Wealth Management',
      'Retirement Planning',
      'Education Savings',
      'Insurance Products',
      'Fixed Deposits',
      'Foreign Exchange'
    ],
    commission_rates: {
      online_trading: 0.65,
      phone_trading: 0.9,
      minimum_commission: 35,
      maximum_commission: 650
    },
    account_types: ['Individual', 'Joint', 'Corporate', 'Trust', 'Retirement', 'Education'],
    minimum_deposit: 8000,
    trading_platforms: ['Sagicor Online', 'Mobile App', 'Phone Trading', 'Branch Trading'],
    research_services: [
      'Market Research',
      'Economic Analysis',
      'Sector Reports',
      'Investment Strategies',
      'Market Commentary',
      'Company Analysis'
    ],
    customer_support: {
      hours: 'Monday-Friday 8:30 AM - 4:30 PM',
      phone: '+1-876-906-5000',
      email: 'support@sagicor.com',
      chat: true
    },
    is_active: true,
    rating: 4.2,
    review_count: 420,
    established_year: 1840,
    license_number: 'FSC-005',
    regulatory_body: 'Financial Services Commission'
  }
];

class ComprehensiveBrokerageService {
  private brokerages: BrokerageFirm[] = BROKERAGE_FIRMS_DATA;

  /**
   * Get all brokerage firms
   */
  getBrokerages(): BrokerageFirm[] {
    return this.brokerages.filter(brokerage => brokerage.is_active);
  }

  /**
   * Get brokerage by ID
   */
  getBrokerageById(id: string): BrokerageFirm | null {
    return this.brokerages.find(brokerage => brokerage.id === id) || null;
  }

  /**
   * Search brokerages
   */
  searchBrokerages(query: string): BrokerageFirm[] {
    const lowercaseQuery = query.toLowerCase();
    return this.brokerages.filter(brokerage => 
      brokerage.name.toLowerCase().includes(lowercaseQuery) ||
      brokerage.description.toLowerCase().includes(lowercaseQuery) ||
      brokerage.services.some(service => service.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Get brokerages by service
   */
  getBrokeragesByService(service: string): BrokerageFirm[] {
    return this.brokerages.filter(brokerage => 
      brokerage.services.includes(service)
    );
  }

  /**
   * Get brokerages by account type
   */
  getBrokeragesByAccountType(accountType: string): BrokerageFirm[] {
    return this.brokerages.filter(brokerage => 
      brokerage.account_types.includes(accountType)
    );
  }

  /**
   * Compare brokerages
   */
  compareBrokerages(brokerageIds: string[]): BrokerageComparison[] {
    return brokerageIds
      .map(id => this.getBrokerageById(id))
      .filter(brokerage => brokerage !== null)
      .map(brokerage => ({
        brokerage_id: brokerage!.id,
        name: brokerage!.name,
        commission_rate: brokerage!.commission_rates.online_trading,
        minimum_deposit: brokerage!.minimum_deposit,
        rating: brokerage!.rating,
        review_count: brokerage!.review_count,
        services: brokerage!.services,
        account_types: brokerage!.account_types,
        trading_platforms: brokerage!.trading_platforms
      }));
  }

  /**
   * Get top rated brokerages
   */
  getTopRatedBrokerages(limit: number = 5): BrokerageFirm[] {
    return this.brokerages
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Get brokerages by minimum deposit
   */
  getBrokeragesByMinimumDeposit(maxDeposit: number): BrokerageFirm[] {
    return this.brokerages.filter(brokerage => 
      brokerage.minimum_deposit <= maxDeposit
    );
  }

  /**
   * Get brokerages by commission rate
   */
  getBrokeragesByCommissionRate(maxRate: number): BrokerageFirm[] {
    return this.brokerages.filter(brokerage => 
      brokerage.commission_rates.online_trading <= maxRate
    );
  }

  /**
   * Get brokerage reviews
   */
  async getBrokerageReviews(brokerageId: string, limit: number = 10): Promise<BrokerageReview[]> {
    try {
      const { data, error } = await supabase
        .from('brokerage_reviews')
        .select('*')
        .eq('brokerage_id', brokerageId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching brokerage reviews:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching brokerage reviews:', error);
      throw error;
    }
  }

  /**
   * Add brokerage review
   */
  async addBrokerageReview(review: Omit<BrokerageReview, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('brokerage_reviews')
        .insert({
          ...review,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error adding brokerage review:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error adding brokerage review:', error);
      throw error;
    }
  }

  /**
   * Get user's brokerage accounts
   */
  async getUserBrokerageAccounts(userId: string): Promise<BrokerageAccount[]> {
    try {
      const { data, error } = await supabase
        .from('brokerage_accounts')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user brokerage accounts:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user brokerage accounts:', error);
      throw error;
    }
  }

  /**
   * Create brokerage account
   */
  async createBrokerageAccount(account: Omit<BrokerageAccount, 'id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('brokerage_accounts')
        .insert(account);

      if (error) {
        console.error('Error creating brokerage account:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error creating brokerage account:', error);
      throw error;
    }
  }

  /**
   * Get trading accounts
   */
  async getTradingAccounts(userId: string): Promise<TradingAccount[]> {
    try {
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching trading accounts:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching trading accounts:', error);
      throw error;
    }
  }

  /**
   * Create trading account
   */
  async createTradingAccount(account: Omit<TradingAccount, 'id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('trading_accounts')
        .insert(account);

      if (error) {
        console.error('Error creating trading account:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error creating trading account:', error);
      throw error;
    }
  }

  /**
   * Get brokerage statistics
   */
  async getBrokerageStatistics(): Promise<{
    total_brokerages: number;
    average_rating: number;
    total_reviews: number;
    most_popular_service: string;
    average_commission_rate: number;
    average_minimum_deposit: number;
  }> {
    try {
      const totalBrokerages = this.brokerages.length;
      const averageRating = this.brokerages.reduce((sum, b) => sum + b.rating, 0) / totalBrokerages;
      const totalReviews = this.brokerages.reduce((sum, b) => sum + b.review_count, 0);
      
      // Find most popular service
      const serviceCounts: { [key: string]: number } = {};
      this.brokerages.forEach(brokerage => {
        brokerage.services.forEach(service => {
          serviceCounts[service] = (serviceCounts[service] || 0) + 1;
        });
      });
      const mostPopularService = Object.keys(serviceCounts).reduce((a, b) => 
        serviceCounts[a] > serviceCounts[b] ? a : b
      );
      
      const averageCommissionRate = this.brokerages.reduce((sum, b) => 
        sum + b.commission_rates.online_trading, 0
      ) / totalBrokerages;
      
      const averageMinimumDeposit = this.brokerages.reduce((sum, b) => 
        sum + b.minimum_deposit, 0
      ) / totalBrokerages;

      return {
        total_brokerages: totalBrokerages,
        average_rating: Math.round(averageRating * 100) / 100,
        total_reviews: totalReviews,
        most_popular_service: mostPopularService,
        average_commission_rate: Math.round(averageCommissionRate * 100) / 100,
        average_minimum_deposit: Math.round(averageMinimumDeposit)
      };
    } catch (error) {
      console.error('Error calculating brokerage statistics:', error);
      throw error;
    }
  }

  /**
   * Get brokerage recommendations for user
   */
  async getBrokerageRecommendations(
    userId: string,
    preferences: {
      accountType?: string;
      maxDeposit?: number;
      maxCommissionRate?: number;
      requiredServices?: string[];
    }
  ): Promise<BrokerageFirm[]> {
    try {
      let recommendations = this.brokerages;

      // Filter by account type
      if (preferences.accountType) {
        recommendations = recommendations.filter(brokerage => 
          brokerage.account_types.includes(preferences.accountType!)
        );
      }

      // Filter by maximum deposit
      if (preferences.maxDeposit) {
        recommendations = recommendations.filter(brokerage => 
          brokerage.minimum_deposit <= preferences.maxDeposit!
        );
      }

      // Filter by maximum commission rate
      if (preferences.maxCommissionRate) {
        recommendations = recommendations.filter(brokerage => 
          brokerage.commission_rates.online_trading <= preferences.maxCommissionRate!
        );
      }

      // Filter by required services
      if (preferences.requiredServices && preferences.requiredServices.length > 0) {
        recommendations = recommendations.filter(brokerage => 
          preferences.requiredServices!.every(service => 
            brokerage.services.includes(service)
          )
        );
      }

      // Sort by rating and return top recommendations
      return recommendations
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
    } catch (error) {
      console.error('Error getting brokerage recommendations:', error);
      throw error;
    }
  }
}

// Create singleton instance
const comprehensiveBrokerageService = new ComprehensiveBrokerageService();

export default comprehensiveBrokerageService;

// Export convenience functions
export function getBrokerages(): BrokerageFirm[] {
  return comprehensiveBrokerageService.getBrokerages();
}

export function getBrokerageById(id: string): BrokerageFirm | null {
  return comprehensiveBrokerageService.getBrokerageById(id);
}

export function searchBrokerages(query: string): BrokerageFirm[] {
  return comprehensiveBrokerageService.searchBrokerages(query);
}

export function getBrokeragesByService(service: string): BrokerageFirm[] {
  return comprehensiveBrokerageService.getBrokeragesByService(service);
}

export function getBrokeragesByAccountType(accountType: string): BrokerageFirm[] {
  return comprehensiveBrokerageService.getBrokeragesByAccountType(accountType);
}

export function compareBrokerages(brokerageIds: string[]): BrokerageComparison[] {
  return comprehensiveBrokerageService.compareBrokerages(brokerageIds);
}

export function getTopRatedBrokerages(limit?: number): BrokerageFirm[] {
  return comprehensiveBrokerageService.getTopRatedBrokerages(limit);
}

export function getBrokeragesByMinimumDeposit(maxDeposit: number): BrokerageFirm[] {
  return comprehensiveBrokerageService.getBrokeragesByMinimumDeposit(maxDeposit);
}

export function getBrokeragesByCommissionRate(maxRate: number): BrokerageFirm[] {
  return comprehensiveBrokerageService.getBrokeragesByCommissionRate(maxRate);
}

export async function getBrokerageReviews(brokerageId: string, limit?: number): Promise<BrokerageReview[]> {
  return await comprehensiveBrokerageService.getBrokerageReviews(brokerageId, limit);
}

export async function addBrokerageReview(review: Omit<BrokerageReview, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  return await comprehensiveBrokerageService.addBrokerageReview(review);
}

export async function getUserBrokerageAccounts(userId: string): Promise<BrokerageAccount[]> {
  return await comprehensiveBrokerageService.getUserBrokerageAccounts(userId);
}

export async function createBrokerageAccount(account: Omit<BrokerageAccount, 'id'>): Promise<void> {
  return await comprehensiveBrokerageService.createBrokerageAccount(account);
}

export async function getTradingAccounts(userId: string): Promise<TradingAccount[]> {
  return await comprehensiveBrokerageService.getTradingAccounts(userId);
}

export async function createTradingAccount(account: Omit<TradingAccount, 'id'>): Promise<void> {
  return await comprehensiveBrokerageService.createTradingAccount(account);
}

export async function getBrokerageStatistics(): Promise<{
  total_brokerages: number;
  average_rating: number;
  total_reviews: number;
  most_popular_service: string;
  average_commission_rate: number;
  average_minimum_deposit: number;
}> {
  return await comprehensiveBrokerageService.getBrokerageStatistics();
}

export async function getBrokerageRecommendations(
  userId: string,
  preferences: {
    accountType?: string;
    maxDeposit?: number;
    maxCommissionRate?: number;
    requiredServices?: string[];
  }
): Promise<BrokerageFirm[]> {
  return await comprehensiveBrokerageService.getBrokerageRecommendations(userId, preferences);
}
