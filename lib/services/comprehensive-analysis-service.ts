import { supabase } from '../supabase/client';

export interface AnalysisSession {
  id: string;
  user_id: string;
  session_name: string;
  session_type: 'bullish_thesis' | 'bearish_thesis' | 'event_analysis' | 'company_comparison' | 'sector_analysis' | 'market_outlook';
  started_at: string;
  completed_at?: string;
  duration_minutes?: number;
  notes: string;
  key_takeaways: string[];
  articles_analyzed: string[];
  session_data: {
    companies_analyzed: string[];
    sectors_analyzed: string[];
    market_conditions: string;
    risk_factors: string[];
    opportunities: string[];
    recommendations: string[];
    confidence_level: number;
    market_sentiment: 'bullish' | 'bearish' | 'neutral';
    time_horizon: 'short_term' | 'medium_term' | 'long_term';
  };
  is_completed: boolean;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface AnalysisTemplate {
  id: string;
  name: string;
  description: string;
  session_type: string;
  template_data: {
    sections: string[];
    questions: string[];
    prompts: string[];
    structure: string[];
  };
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface AnalysisInsight {
  id: string;
  session_id: string;
  insight_type: 'trend' | 'pattern' | 'correlation' | 'anomaly' | 'prediction';
  title: string;
  description: string;
  confidence_score: number;
  supporting_evidence: string[];
  implications: string[];
  action_items: string[];
  created_at: string;
}

export interface MarketSentiment {
  overall_sentiment: 'bullish' | 'bearish' | 'neutral';
  sentiment_score: number;
  bullish_percentage: number;
  bearish_percentage: number;
  neutral_percentage: number;
  key_factors: string[];
  market_indicators: {
    volume_trend: 'increasing' | 'decreasing' | 'stable';
    volatility_level: 'low' | 'medium' | 'high';
    sector_rotation: string[];
    economic_indicators: string[];
  };
  last_updated: string;
}

export interface RiskAssessment {
  id: string;
  company_symbol: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  risk_factors: {
    financial_risk: number;
    market_risk: number;
    operational_risk: number;
    regulatory_risk: number;
    liquidity_risk: number;
  };
  risk_indicators: string[];
  mitigation_strategies: string[];
  confidence_level: number;
  last_updated: string;
}

export interface InvestmentRecommendation {
  id: string;
  company_symbol: string;
  recommendation_type: 'buy' | 'sell' | 'hold' | 'strong_buy' | 'strong_sell';
  target_price: number;
  current_price: number;
  price_change_percent: number;
  confidence_score: number;
  reasoning: string[];
  risk_factors: string[];
  time_horizon: 'short_term' | 'medium_term' | 'long_term';
  analyst: string;
  created_at: string;
  expires_at: string;
}

// Analysis templates for different session types
const ANALYSIS_TEMPLATES: AnalysisTemplate[] = [
  {
    id: 'bullish-thesis-template',
    name: 'Bullish Thesis Analysis',
    description: 'Comprehensive analysis for bullish investment thesis',
    session_type: 'bullish_thesis',
    template_data: {
      sections: [
        'Company Overview',
        'Financial Performance',
        'Market Position',
        'Growth Drivers',
        'Competitive Advantages',
        'Risk Assessment',
        'Valuation Analysis',
        'Investment Thesis'
      ],
      questions: [
        'What are the key growth drivers for this company?',
        'What competitive advantages does the company have?',
        'How is the company positioned in its market?',
        'What are the main risks to the investment thesis?',
        'What is the fair value of the company?'
      ],
      prompts: [
        'Analyze the company\'s financial performance over the last 3 years',
        'Identify key growth drivers and market opportunities',
        'Assess competitive positioning and moats',
        'Evaluate management quality and track record',
        'Determine fair value and target price'
      ],
      structure: [
        'Executive Summary',
        'Company Analysis',
        'Market Analysis',
        'Financial Analysis',
        'Risk Assessment',
        'Valuation',
        'Recommendation'
      ]
    },
    is_active: true,
    created_by: 'system',
    created_at: new Date().toISOString()
  },
  {
    id: 'bearish-thesis-template',
    name: 'Bearish Thesis Analysis',
    description: 'Comprehensive analysis for bearish investment thesis',
    session_type: 'bearish_thesis',
    template_data: {
      sections: [
        'Company Overview',
        'Financial Performance',
        'Market Position',
        'Decline Drivers',
        'Competitive Threats',
        'Risk Assessment',
        'Valuation Analysis',
        'Investment Thesis'
      ],
      questions: [
        'What are the key decline drivers for this company?',
        'What competitive threats does the company face?',
        'How is the company losing market position?',
        'What are the main risks to the company?',
        'What is the fair value of the company?'
      ],
      prompts: [
        'Analyze the company\'s financial performance trends',
        'Identify key decline drivers and market threats',
        'Assess competitive positioning and vulnerabilities',
        'Evaluate management quality and track record',
        'Determine fair value and target price'
      ],
      structure: [
        'Executive Summary',
        'Company Analysis',
        'Market Analysis',
        'Financial Analysis',
        'Risk Assessment',
        'Valuation',
        'Recommendation'
      ]
    },
    is_active: true,
    created_by: 'system',
    created_at: new Date().toISOString()
  },
  {
    id: 'event-analysis-template',
    name: 'Event Analysis',
    description: 'Analysis of specific market events and their impact',
    session_type: 'event_analysis',
    template_data: {
      sections: [
        'Event Overview',
        'Market Impact',
        'Sector Analysis',
        'Company Impact',
        'Risk Assessment',
        'Opportunities',
        'Recommendations'
      ],
      questions: [
        'What is the nature and scope of the event?',
        'How will this event impact the market?',
        'Which sectors will be most affected?',
        'What are the key risks and opportunities?',
        'What actions should investors take?'
      ],
      prompts: [
        'Analyze the event\'s potential market impact',
        'Identify affected sectors and companies',
        'Assess short-term and long-term implications',
        'Evaluate risk factors and opportunities',
        'Develop actionable recommendations'
      ],
      structure: [
        'Event Summary',
        'Market Impact Analysis',
        'Sector Analysis',
        'Company Analysis',
        'Risk Assessment',
        'Opportunity Analysis',
        'Recommendations'
      ]
    },
    is_active: true,
    created_by: 'system',
    created_at: new Date().toISOString()
  },
  {
    id: 'company-comparison-template',
    name: 'Company Comparison Analysis',
    description: 'Comparative analysis of multiple companies',
    session_type: 'company_comparison',
    template_data: {
      sections: [
        'Company Overviews',
        'Financial Comparison',
        'Market Position',
        'Competitive Analysis',
        'Risk Assessment',
        'Valuation Comparison',
        'Recommendations'
      ],
      questions: [
        'How do the companies compare financially?',
        'What are their relative market positions?',
        'Which company has better competitive advantages?',
        'What are the key risks for each company?',
        'Which company offers the best investment opportunity?'
      ],
      prompts: [
        'Compare financial performance across companies',
        'Analyze competitive positioning',
        'Assess relative strengths and weaknesses',
        'Evaluate risk profiles',
        'Determine best investment opportunity'
      ],
      structure: [
        'Executive Summary',
        'Company Overviews',
        'Financial Comparison',
        'Market Analysis',
        'Competitive Analysis',
        'Risk Assessment',
        'Valuation Comparison',
        'Recommendations'
      ]
    },
    is_active: true,
    created_by: 'system',
    created_at: new Date().toISOString()
  }
];

class ComprehensiveAnalysisService {
  private templates: AnalysisTemplate[] = ANALYSIS_TEMPLATES;

  /**
   * Create new analysis session
   */
  async createAnalysisSession(session: Omit<AnalysisSession, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('analysis_sessions')
        .insert({
          ...session,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating analysis session:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating analysis session:', error);
      throw error;
    }
  }

  /**
   * Get analysis session by ID
   */
  async getAnalysisSession(sessionId: string): Promise<AnalysisSession | null> {
    try {
      const { data, error } = await supabase
        .from('analysis_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Error fetching analysis session:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching analysis session:', error);
      throw error;
    }
  }

  /**
   * Get user's analysis sessions
   */
  async getUserAnalysisSessions(userId: string, limit: number = 20): Promise<AnalysisSession[]> {
    try {
      const { data, error } = await supabase
        .from('analysis_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user analysis sessions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user analysis sessions:', error);
      throw error;
    }
  }

  /**
   * Update analysis session
   */
  async updateAnalysisSession(sessionId: string, updates: Partial<AnalysisSession>): Promise<void> {
    try {
      const { error } = await supabase
        .from('analysis_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating analysis session:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating analysis session:', error);
      throw error;
    }
  }

  /**
   * Complete analysis session
   */
  async completeAnalysisSession(sessionId: string, completionData: {
    notes: string;
    key_takeaways: string[];
    session_data: any;
  }): Promise<void> {
    try {
      const session = await this.getAnalysisSession(sessionId);
      if (!session) {
        throw new Error('Analysis session not found');
      }

      const startedAt = new Date(session.started_at);
      const completedAt = new Date();
      const durationMinutes = Math.round((completedAt.getTime() - startedAt.getTime()) / (1000 * 60));

      await this.updateAnalysisSession(sessionId, {
        completed_at: completedAt.toISOString(),
        duration_minutes: durationMinutes,
        notes: completionData.notes,
        key_takeaways: completionData.key_takeaways,
        session_data: completionData.session_data,
        is_completed: true
      });
    } catch (error) {
      console.error('Error completing analysis session:', error);
      throw error;
    }
  }

  /**
   * Get analysis templates
   */
  getAnalysisTemplates(): AnalysisTemplate[] {
    return this.templates.filter(template => template.is_active);
  }

  /**
   * Get analysis template by type
   */
  getAnalysisTemplateByType(sessionType: string): AnalysisTemplate | null {
    return this.templates.find(template => 
      template.session_type === sessionType && template.is_active
    ) || null;
  }

  /**
   * Create analysis insight
   */
  async createAnalysisInsight(insight: Omit<AnalysisInsight, 'id' | 'created_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('analysis_insights')
        .insert({
          ...insight,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating analysis insight:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating analysis insight:', error);
      throw error;
    }
  }

  /**
   * Get analysis insights for session
   */
  async getAnalysisInsights(sessionId: string): Promise<AnalysisInsight[]> {
    try {
      const { data, error } = await supabase
        .from('analysis_insights')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching analysis insights:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching analysis insights:', error);
      throw error;
    }
  }

  /**
   * Get market sentiment analysis
   */
  async getMarketSentiment(): Promise<MarketSentiment> {
    try {
      // In production, this would analyze real market data
      // For now, we'll generate realistic sentiment data
      const sentimentScore = Math.random() * 2 - 1; // -1 to 1
      const bullishPercentage = Math.max(0, Math.min(100, 50 + sentimentScore * 30));
      const bearishPercentage = Math.max(0, Math.min(100, 50 - sentimentScore * 30));
      const neutralPercentage = 100 - bullishPercentage - bearishPercentage;

      return {
        overall_sentiment: sentimentScore > 0.2 ? 'bullish' : sentimentScore < -0.2 ? 'bearish' : 'neutral',
        sentiment_score: Math.round(sentimentScore * 100) / 100,
        bullish_percentage: Math.round(bullishPercentage),
        bearish_percentage: Math.round(bearishPercentage),
        neutral_percentage: Math.round(neutralPercentage),
        key_factors: [
          'Economic indicators showing positive trends',
          'Strong corporate earnings reports',
          'Favorable government policies',
          'Increased foreign investment'
        ],
        market_indicators: {
          volume_trend: 'increasing',
          volatility_level: 'medium',
          sector_rotation: ['Technology', 'Financial Services', 'Healthcare'],
          economic_indicators: ['GDP Growth', 'Inflation Rate', 'Unemployment Rate']
        },
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting market sentiment:', error);
      throw error;
    }
  }

  /**
   * Get risk assessment for company
   */
  async getRiskAssessment(companySymbol: string): Promise<RiskAssessment> {
    try {
      // In production, this would analyze real company data
      // For now, we'll generate realistic risk assessment
      const riskScore = Math.random() * 100;
      const riskLevel = riskScore > 75 ? 'high' : riskScore > 50 ? 'medium' : riskScore > 25 ? 'low' : 'critical';

      return {
        id: `risk-${companySymbol}-${Date.now()}`,
        company_symbol: companySymbol,
        risk_level: riskLevel as 'low' | 'medium' | 'high' | 'critical',
        risk_score: Math.round(riskScore),
        risk_factors: {
          financial_risk: Math.round(Math.random() * 100),
          market_risk: Math.round(Math.random() * 100),
          operational_risk: Math.round(Math.random() * 100),
          regulatory_risk: Math.round(Math.random() * 100),
          liquidity_risk: Math.round(Math.random() * 100)
        },
        risk_indicators: [
          'High debt-to-equity ratio',
          'Declining revenue growth',
          'Regulatory compliance issues',
          'Market volatility exposure'
        ],
        mitigation_strategies: [
          'Diversify revenue streams',
          'Strengthen balance sheet',
          'Improve operational efficiency',
          'Enhance risk management'
        ],
        confidence_level: Math.round(Math.random() * 100),
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting risk assessment:', error);
      throw error;
    }
  }

  /**
   * Get investment recommendations
   */
  async getInvestmentRecommendations(limit: number = 10): Promise<InvestmentRecommendation[]> {
    try {
      const { data, error } = await supabase
        .from('investment_recommendations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching investment recommendations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching investment recommendations:', error);
      throw error;
    }
  }

  /**
   * Create investment recommendation
   */
  async createInvestmentRecommendation(recommendation: Omit<InvestmentRecommendation, 'id' | 'created_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('investment_recommendations')
        .insert({
          ...recommendation,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating investment recommendation:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating investment recommendation:', error);
      throw error;
    }
  }

  /**
   * Get analysis statistics
   */
  async getAnalysisStatistics(userId?: string): Promise<{
    total_sessions: number;
    completed_sessions: number;
    average_duration: number;
    most_common_type: string;
    total_insights: number;
    average_confidence: number;
  }> {
    try {
      let query = supabase.from('analysis_sessions').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: sessions, error: sessionsError } = await query;

      if (sessionsError) {
        console.error('Error fetching analysis sessions:', sessionsError);
        throw sessionsError;
      }

      const totalSessions = sessions?.length || 0;
      const completedSessions = sessions?.filter(s => s.is_completed).length || 0;
      const averageDuration = sessions?.filter(s => s.duration_minutes)
        .reduce((sum, s) => sum + s.duration_minutes, 0) / completedSessions || 0;

      // Get most common session type
      const sessionTypes = sessions?.map(s => s.session_type) || [];
      const mostCommonType = sessionTypes.reduce((a, b, _, arr) => 
        arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
      ) || 'bullish_thesis';

      // Get insights count
      const { data: insights, error: insightsError } = await supabase
        .from('analysis_insights')
        .select('confidence_score');

      if (insightsError) {
        console.error('Error fetching analysis insights:', insightsError);
        throw insightsError;
      }

      const totalInsights = insights?.length || 0;
      const averageConfidence = insights?.reduce((sum, i) => sum + i.confidence_score, 0) / totalInsights || 0;

      return {
        total_sessions: totalSessions,
        completed_sessions: completedSessions,
        average_duration: Math.round(averageDuration),
        most_common_type: mostCommonType,
        total_insights: totalInsights,
        average_confidence: Math.round(averageConfidence * 100) / 100
      };
    } catch (error) {
      console.error('Error getting analysis statistics:', error);
      throw error;
    }
  }

  /**
   * Search analysis sessions
   */
  async searchAnalysisSessions(query: string, userId?: string): Promise<AnalysisSession[]> {
    try {
      let searchQuery = supabase
        .from('analysis_sessions')
        .select('*')
        .or(`session_name.ilike.%${query}%,notes.ilike.%${query}%`);

      if (userId) {
        searchQuery = searchQuery.eq('user_id', userId);
      }

      const { data, error } = await searchQuery
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching analysis sessions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching analysis sessions:', error);
      throw error;
    }
  }
}

// Create singleton instance
const comprehensiveAnalysisService = new ComprehensiveAnalysisService();

export default comprehensiveAnalysisService;

// Export convenience functions
export async function createAnalysisSession(session: Omit<AnalysisSession, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  return await comprehensiveAnalysisService.createAnalysisSession(session);
}

export async function getAnalysisSession(sessionId: string): Promise<AnalysisSession | null> {
  return await comprehensiveAnalysisService.getAnalysisSession(sessionId);
}

export async function getUserAnalysisSessions(userId: string, limit?: number): Promise<AnalysisSession[]> {
  return await comprehensiveAnalysisService.getUserAnalysisSessions(userId, limit);
}

export async function updateAnalysisSession(sessionId: string, updates: Partial<AnalysisSession>): Promise<void> {
  return await comprehensiveAnalysisService.updateAnalysisSession(sessionId, updates);
}

export async function completeAnalysisSession(sessionId: string, completionData: {
  notes: string;
  key_takeaways: string[];
  session_data: any;
}): Promise<void> {
  return await comprehensiveAnalysisService.completeAnalysisSession(sessionId, completionData);
}

export function getAnalysisTemplates(): AnalysisTemplate[] {
  return comprehensiveAnalysisService.getAnalysisTemplates();
}

export function getAnalysisTemplateByType(sessionType: string): AnalysisTemplate | null {
  return comprehensiveAnalysisService.getAnalysisTemplateByType(sessionType);
}

export async function createAnalysisInsight(insight: Omit<AnalysisInsight, 'id' | 'created_at'>): Promise<string> {
  return await comprehensiveAnalysisService.createAnalysisInsight(insight);
}

export async function getAnalysisInsights(sessionId: string): Promise<AnalysisInsight[]> {
  return await comprehensiveAnalysisService.getAnalysisInsights(sessionId);
}

export async function getMarketSentiment(): Promise<MarketSentiment> {
  return await comprehensiveAnalysisService.getMarketSentiment();
}

export async function getRiskAssessment(companySymbol: string): Promise<RiskAssessment> {
  return await comprehensiveAnalysisService.getRiskAssessment(companySymbol);
}

export async function getInvestmentRecommendations(limit?: number): Promise<InvestmentRecommendation[]> {
  return await comprehensiveAnalysisService.getInvestmentRecommendations(limit);
}

export async function createInvestmentRecommendation(recommendation: Omit<InvestmentRecommendation, 'id' | 'created_at'>): Promise<string> {
  return await comprehensiveAnalysisService.createInvestmentRecommendation(recommendation);
}

export async function getAnalysisStatistics(userId?: string): Promise<{
  total_sessions: number;
  completed_sessions: number;
  average_duration: number;
  most_common_type: string;
  total_insights: number;
  average_confidence: number;
}> {
  return await comprehensiveAnalysisService.getAnalysisStatistics(userId);
}

export async function searchAnalysisSessions(query: string, userId?: string): Promise<AnalysisSession[]> {
  return await comprehensiveAnalysisService.searchAnalysisSessions(query, userId);
}
