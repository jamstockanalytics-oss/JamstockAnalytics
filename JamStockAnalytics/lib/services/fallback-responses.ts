/**
 * Fallback Response Service
 * Provides intelligent fallback responses when AI API quota is exceeded
 */

export interface FallbackResponse {
  content: string;
  suggestions: string[];
  type: 'quota_exceeded' | 'service_unavailable' | 'general_error';
  metadata: {
    is_fallback: true;
    fallback_type: string;
    timestamp: string;
  };
}

export interface AIErrorResponse {
  error: string;
  type: 'quota_exceeded' | 'service_unavailable' | 'general_error' | 'rate_limited';
  retry_after?: number;
  fallback_used: boolean;
}

/**
 * Jamaica Stock Exchange specific fallback responses
 */
export class FallbackResponseService {
  private static readonly JSE_COMPANIES = [
    'NCB Financial Group', 'Sagicor Group Jamaica', 'Jamaica Money Market Brokers',
    'Guardian Holdings', 'Carreras Limited', 'Seprod Limited', 'GraceKennedy Limited',
    'Desnoes & Geddes Limited', 'Jamaica Broilers Group', 'Supreme Ventures Limited'
  ];

  private static readonly INVESTMENT_TIPS = [
    'Diversify your portfolio across different sectors in the JSE',
    'Consider dollar-cost averaging for long-term investments',
    'Research company fundamentals before investing',
    'Monitor quarterly earnings reports for JSE-listed companies',
    'Consider both growth and value stocks for balanced exposure',
    'Pay attention to economic indicators affecting Jamaican markets',
    'Review your portfolio regularly and rebalance as needed'
  ];

  private static readonly MARKET_INSIGHTS = [
    'The Jamaica Stock Exchange (JSE) is the primary stock exchange in Jamaica',
    'JSE operates both the Main Market and Junior Market',
    'The Bank of Jamaica (BOJ) monetary policy affects JSE performance',
    'Tourism, agriculture, and financial services are key JSE sectors',
    'JSE companies are required to report quarterly financial results',
    'Foreign investment plays a significant role in JSE liquidity'
  ];

  /**
   * Generate fallback response based on user input and error type
   */
  static generateFallbackResponse(
    userMessage: string,
    errorType: 'quota_exceeded' | 'service_unavailable' | 'general_error' = 'quota_exceeded'
  ): FallbackResponse {
    const message = userMessage.toLowerCase();
    const timestamp = new Date().toISOString();

    // Analyze user intent and provide relevant fallback
    if (this.isCompanyQuery(message)) {
      return this.getCompanyFallbackResponse(errorType, timestamp);
    } else if (this.isInvestmentAdviceQuery(message)) {
      return this.getInvestmentFallbackResponse(errorType, timestamp);
    } else if (this.isMarketAnalysisQuery(message)) {
      return this.getMarketFallbackResponse(errorType, timestamp);
    } else if (this.isGeneralFinanceQuery(message)) {
      return this.getGeneralFinanceFallbackResponse(errorType, timestamp);
    } else {
      return this.getGeneralFallbackResponse(errorType, timestamp);
    }
  }

  /**
   * Check if user is asking about a specific company
   */
  private static isCompanyQuery(message: string): boolean {
    const companyKeywords = [
      'ncbfg', 'sagicor', 'jmmb', 'guardian', 'carreras', 'seprod', 'gracekennedy',
      'd&g', 'jamaica broilers', 'supreme ventures', 'company', 'stock', 'shares'
    ];
    return companyKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if user is asking for investment advice
   */
  private static isInvestmentAdviceQuery(message: string): boolean {
    const investmentKeywords = [
      'invest', 'investment', 'buy', 'sell', 'portfolio', 'advice', 'recommend',
      'should i', 'best investment', 'where to invest', 'trading'
    ];
    return investmentKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if user is asking for market analysis
   */
  private static isMarketAnalysisQuery(message: string): boolean {
    const marketKeywords = [
      'market', 'analysis', 'trend', 'performance', 'outlook', 'forecast',
      'bull', 'bear', 'sentiment', 'economic', 'jse', 'jamaica stock exchange'
    ];
    return marketKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if user is asking general finance questions
   */
  private static isGeneralFinanceQuery(message: string): boolean {
    const financeKeywords = [
      'finance', 'financial', 'money', 'wealth', 'savings', 'budget',
      'income', 'expenses', 'financial planning', 'retirement'
    ];
    return financeKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Get company-specific fallback response
   */
  private static getCompanyFallbackResponse(
    errorType: string,
    timestamp: string
  ): FallbackResponse {
    const randomCompany = this.JSE_COMPANIES[Math.floor(Math.random() * this.JSE_COMPANIES.length)];
    
    return {
      content: `I'm currently experiencing high demand, but I can still help with JSE company information. ${randomCompany} is one of the major companies on the Jamaica Stock Exchange. For detailed analysis, I recommend checking the company's latest quarterly reports on the JSE website or consulting with a licensed financial advisor.`,
      suggestions: [
        'Check JSE website for company financial reports',
        'Review quarterly earnings announcements',
        'Consult with a licensed financial advisor',
        'Look up company news on financial websites',
        'Analyze historical stock performance'
      ],
      type: errorType as any,
      metadata: {
        is_fallback: true,
        fallback_type: 'company_query',
        timestamp
      }
    };
  }

  /**
   * Get investment advice fallback response
   */
  private static getInvestmentFallbackResponse(
    errorType: string,
    timestamp: string
  ): FallbackResponse {
    const randomTip = this.INVESTMENT_TIPS[Math.floor(Math.random() * this.INVESTMENT_TIPS.length)];
    
    return {
      content: `While I'm processing other requests, here's some general investment guidance: ${randomTip}. Remember, all investments carry risk, and past performance doesn't guarantee future results. For personalized advice, consult with a licensed financial advisor who can assess your specific financial situation.`,
      suggestions: [
        'Consult with a licensed financial advisor',
        'Research investment fundamentals',
        'Consider your risk tolerance',
        'Diversify your portfolio',
        'Review investment fees and costs',
        'Stay informed about market developments'
      ],
      type: errorType as any,
      metadata: {
        is_fallback: true,
        fallback_type: 'investment_advice',
        timestamp
      }
    };
  }

  /**
   * Get market analysis fallback response
   */
  private static getMarketFallbackResponse(
    errorType: string,
    timestamp: string
  ): FallbackResponse {
    const randomInsight = this.MARKET_INSIGHTS[Math.floor(Math.random() * this.MARKET_INSIGHTS.length)];
    
    return {
      content: `I'm temporarily at capacity, but here's a key market insight: ${randomInsight}. For current market analysis, I recommend checking the JSE website for real-time data, reading recent financial news, and consulting with market professionals. The JSE publishes daily market summaries and company announcements.`,
      suggestions: [
        'Check JSE website for market data',
        'Read recent financial news',
        'Monitor company announcements',
        'Review economic indicators',
        'Consult with market professionals',
        'Analyze sector performance trends'
      ],
      type: errorType as any,
      metadata: {
        is_fallback: true,
        fallback_type: 'market_analysis',
        timestamp
      }
    };
  }

  /**
   * Get general finance fallback response
   */
  private static getGeneralFinanceFallbackResponse(
    errorType: string,
    timestamp: string
  ): FallbackResponse {
    return {
      content: `I'm experiencing high demand right now, but I can share some general financial wisdom: Always live within your means, build an emergency fund, and start investing early for long-term wealth building. For specific financial planning advice, consider consulting with a certified financial planner who can provide personalized guidance based on your unique situation.`,
      suggestions: [
        'Create a budget and stick to it',
        'Build an emergency fund (3-6 months expenses)',
        'Start investing early for compound growth',
        'Consult with a financial planner',
        'Educate yourself about personal finance',
        'Review and optimize your insurance coverage'
      ],
      type: errorType as any,
      metadata: {
        is_fallback: true,
        fallback_type: 'general_finance',
        timestamp
      }
    };
  }

  /**
   * Get general fallback response
   */
  private static getGeneralFallbackResponse(
    errorType: string,
    timestamp: string
  ): FallbackResponse {
    return {
      content: `I'm currently experiencing high demand and temporarily unable to provide a full AI response. I'm JamStock Analytics, your Jamaica Stock Exchange intelligence assistant. I can help with JSE company analysis, market insights, and investment guidance. Please try again in a few moments, or feel free to explore our news feed and market data while you wait.`,
      suggestions: [
        'Try asking again in a few moments',
        'Browse the latest JSE news',
        'Check current market data',
        'Review company profiles',
        'Explore investment resources',
        'Contact support if the issue persists'
      ],
      type: errorType as any,
      metadata: {
        is_fallback: true,
        fallback_type: 'general',
        timestamp
      }
    };
  }

  /**
   * Get error message for different error types
   */
  static getErrorMessage(errorType: string): string {
    switch (errorType) {
      case 'quota_exceeded':
        return 'AI service quota exceeded. Using intelligent fallback response.';
      case 'service_unavailable':
        return 'AI service temporarily unavailable. Using fallback response.';
      case 'rate_limited':
        return 'Too many requests. Please wait a moment and try again.';
      default:
        return 'AI service error. Using fallback response.';
    }
  }

  /**
   * Check if response is a fallback
   */
  static isFallbackResponse(response: any): boolean {
    return response?.metadata?.is_fallback === true;
  }

  /**
   * Get retry suggestion based on error type
   */
  static getRetrySuggestion(errorType: string): string {
    switch (errorType) {
      case 'quota_exceeded':
        return 'AI service quota exceeded. Please try again later or upgrade your plan.';
      case 'service_unavailable':
        return 'AI service temporarily unavailable. Please try again in a few minutes.';
      case 'rate_limited':
        return 'Too many requests. Please wait 1-2 minutes before trying again.';
      default:
        return 'Please try again in a few moments.';
    }
  }
}
