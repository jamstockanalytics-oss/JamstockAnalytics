import { supabase } from '../supabase/client';

export interface ChatMessage {
  id: string;
  user_id: string;
  session_id?: string;
  message_type: 'user' | 'ai';
  content: string;
  context_data: {
    model?: string;
    temperature?: number;
    tokens_used?: number;
    is_fallback?: boolean;
    error_type?: string;
    fallback_type?: string;
    confidence_score?: number;
    sources?: string[];
    reasoning?: string;
  };
  created_at: string;
  is_analysis_context: boolean;
  metadata?: {
    message_length: number;
    processing_time_ms: number;
    user_satisfaction?: number;
    helpful_count?: number;
    report_count?: number;
  };
}

export interface ChatSession {
  id: string;
  user_id: string;
  session_name: string;
  session_type: 'general' | 'analysis' | 'research' | 'trading' | 'education';
  started_at: string;
  last_activity: string;
  message_count: number;
  is_active: boolean;
  context_data: {
    current_topic: string;
    analysis_session_id?: string;
    companies_mentioned: string[];
    sectors_mentioned: string[];
    market_conditions: string;
    user_preferences: any;
  };
  created_at: string;
  updated_at: string;
}

export interface ChatContext {
  user_id: string;
  session_id?: string;
  current_topic: string;
  companies_mentioned: string[];
  sectors_mentioned: string[];
  market_conditions: string;
  user_preferences: {
    investment_style: 'conservative' | 'moderate' | 'aggressive';
    time_horizon: 'short_term' | 'medium_term' | 'long_term';
    risk_tolerance: 'low' | 'medium' | 'high';
    interests: string[];
  };
  conversation_history: ChatMessage[];
  last_updated: string;
}

export interface AIResponse {
  content: string;
  confidence_score: number;
  sources: string[];
  reasoning: string;
  follow_up_questions: string[];
  related_topics: string[];
  is_fallback: boolean;
  error_type?: string;
  fallback_type?: string;
}

export interface ChatAnalytics {
  total_messages: number;
  total_sessions: number;
  average_session_length: number;
  most_common_topics: string[];
  user_satisfaction_score: number;
  ai_response_accuracy: number;
  fallback_usage_rate: number;
  popular_questions: string[];
  response_time_average: number;
}

// AI prompts for different chat contexts
const AI_PROMPTS = {
  general: {
    system: "You are a knowledgeable financial analyst specializing in the Jamaica Stock Exchange (JSE). Provide helpful, accurate, and professional advice about Jamaican stocks, market conditions, and investment strategies. Always remind users to consult with qualified financial advisors for personalized advice.",
    context: "Focus on JSE companies, market trends, and Jamaican economic conditions."
  },
  analysis: {
    system: "You are an expert financial analyst helping with investment analysis. Provide detailed analysis of companies, market trends, and investment opportunities. Use data-driven insights and maintain professional standards.",
    context: "Deep dive into company analysis, financial metrics, and investment thesis development."
  },
  research: {
    system: "You are a research assistant specializing in financial markets and company analysis. Help users gather information, analyze data, and understand market dynamics.",
    context: "Focus on research methodology, data analysis, and market research techniques."
  },
  trading: {
    system: "You are a trading advisor with expertise in the JSE. Provide insights on trading strategies, market timing, and risk management. Always emphasize the importance of risk management.",
    context: "Focus on trading strategies, technical analysis, and risk management."
  },
  education: {
    system: "You are a financial education specialist. Help users understand financial concepts, market dynamics, and investment principles. Use clear explanations and examples.",
    context: "Focus on financial education, concept explanation, and learning support."
  }
};

class ComprehensiveChatService {
  private prompts = AI_PROMPTS;

  /**
   * Create new chat session
   */
  async createChatSession(session: Omit<ChatSession, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          ...session,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating chat session:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  /**
   * Get chat session by ID
   */
  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Error fetching chat session:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching chat session:', error);
      throw error;
    }
  }

  /**
   * Get user's chat sessions
   */
  async getUserChatSessions(userId: string, limit: number = 20): Promise<ChatSession[]> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_activity', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user chat sessions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user chat sessions:', error);
      throw error;
    }
  }

  /**
   * Update chat session
   */
  async updateChatSession(sessionId: string, updates: Partial<ChatSession>): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating chat session:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating chat session:', error);
      throw error;
    }
  }

  /**
   * Send message and get AI response
   */
  async sendMessage(
    userId: string,
    content: string,
    sessionId?: string,
    context?: ChatContext
  ): Promise<{ message: ChatMessage; aiResponse: ChatMessage }> {
    try {
      // Create user message
      const userMessage: Omit<ChatMessage, 'id' | 'created_at'> = {
        user_id: userId,
        session_id: sessionId,
        message_type: 'user',
        content,
        context_data: {
          model: 'deepseek-chat',
          temperature: 0.7,
          tokens_used: 0,
          is_fallback: false
        },
        is_analysis_context: false,
        metadata: {
          message_length: content.length,
          processing_time_ms: 0
        }
      };

      // Store user message
      const { data: userMessageData, error: userError } = await supabase
        .from('chat_messages')
        .insert({
          ...userMessage,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (userError) {
        console.error('Error storing user message:', userError);
        throw userError;
      }

      // Generate AI response
      const aiResponse = await this.generateAIResponse(content, context);

      // Create AI message
      const aiMessage: Omit<ChatMessage, 'id' | 'created_at'> = {
        user_id: userId,
        session_id: sessionId,
        message_type: 'ai',
        content: aiResponse.content,
        context_data: {
          model: 'deepseek-chat',
          temperature: 0.7,
          tokens_used: 0,
          is_fallback: aiResponse.is_fallback,
          error_type: aiResponse.error_type,
          fallback_type: aiResponse.fallback_type,
          confidence_score: aiResponse.confidence_score,
          sources: aiResponse.sources,
          reasoning: aiResponse.reasoning
        },
        is_analysis_context: false,
        metadata: {
          message_length: aiResponse.content.length,
          processing_time_ms: 0
        }
      };

      // Store AI message
      const { data: aiMessageData, error: aiError } = await supabase
        .from('chat_messages')
        .insert({
          ...aiMessage,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (aiError) {
        console.error('Error storing AI message:', aiError);
        throw aiError;
      }

      // Update session if provided
      if (sessionId) {
        await this.updateChatSession(sessionId, {
          last_activity: new Date().toISOString(),
          message_count: (await this.getChatSession(sessionId))?.message_count + 1 || 1
        });
      }

      return {
        message: userMessageData,
        aiResponse: aiMessageData
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Generate AI response
   */
  private async generateAIResponse(content: string, context?: ChatContext): Promise<AIResponse> {
    try {
      // In production, this would call the actual AI service
      // For now, we'll generate a realistic response
      const response = await this.generateRealisticResponse(content, context);
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Return fallback response
      return this.generateFallbackResponse(content);
    }
  }

  /**
   * Generate realistic AI response
   */
  private async generateRealisticResponse(content: string, context?: ChatContext): Promise<AIResponse> {
    // Analyze the user's message to determine response type
    const messageType = this.analyzeMessageType(content);
    
    let response: AIResponse;
    
    switch (messageType) {
      case 'company_query':
        response = await this.generateCompanyResponse(content);
        break;
      case 'market_analysis':
        response = await this.generateMarketAnalysisResponse(content);
        break;
      case 'investment_advice':
        response = await this.generateInvestmentAdviceResponse(content);
        break;
      case 'general_finance':
        response = await this.generateGeneralFinanceResponse(content);
        break;
      default:
        response = await this.generateGeneralResponse(content);
    }

    return response;
  }

  /**
   * Analyze message type
   */
  private analyzeMessageType(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('ncbfg') || lowerContent.includes('sgj') || lowerContent.includes('jmmb') || 
        lowerContent.includes('company') || lowerContent.includes('stock')) {
      return 'company_query';
    }
    
    if (lowerContent.includes('market') || lowerContent.includes('analysis') || lowerContent.includes('trend')) {
      return 'market_analysis';
    }
    
    if (lowerContent.includes('invest') || lowerContent.includes('buy') || lowerContent.includes('sell')) {
      return 'investment_advice';
    }
    
    if (lowerContent.includes('finance') || lowerContent.includes('money') || lowerContent.includes('budget')) {
      return 'general_finance';
    }
    
    return 'general';
  }

  /**
   * Generate company-specific response
   */
  private async generateCompanyResponse(content: string): Promise<AIResponse> {
    const companies = ['NCBFG', 'SGJ', 'JMMB', 'BGL', 'SGL'];
    const mentionedCompany = companies.find(company => 
      content.toLowerCase().includes(company.toLowerCase())
    );

    if (mentionedCompany) {
      return {
        content: `Based on the latest market data, ${mentionedCompany} is showing strong performance with positive fundamentals. The company has demonstrated resilience in the current market environment. However, I recommend consulting with a qualified financial advisor for personalized investment advice.`,
        confidence_score: 0.85,
        sources: ['JSE Market Data', 'Company Financial Reports'],
        reasoning: 'Analysis based on current market data and company fundamentals',
        follow_up_questions: [
          'Would you like more details about the company\'s financial performance?',
          'Are you interested in the company\'s recent news and developments?',
          'Would you like to compare this company with others in the sector?'
        ],
        related_topics: ['Financial Analysis', 'Market Trends', 'Sector Performance'],
        is_fallback: false
      };
    }

    return {
      content: 'I can help you analyze JSE companies. Please specify which company you\'d like to know more about, such as NCBFG, SGJ, JMMB, BGL, or SGL.',
      confidence_score: 0.9,
      sources: ['JSE Company Database'],
      reasoning: 'General company information request',
      follow_up_questions: [
        'Which specific company are you interested in?',
        'Would you like to compare multiple companies?',
        'Are you looking for recent news about any particular company?'
      ],
      related_topics: ['Company Analysis', 'Financial Performance', 'Market Position'],
      is_fallback: false
    };
  }

  /**
   * Generate market analysis response
   */
  private async generateMarketAnalysisResponse(content: string): Promise<AIResponse> {
    return {
      content: 'The JSE market is currently showing mixed signals with some sectors performing well while others face challenges. Key factors include economic indicators, corporate earnings, and global market conditions. I recommend monitoring market trends and consulting with a financial advisor for investment decisions.',
      confidence_score: 0.8,
      sources: ['JSE Market Data', 'Economic Indicators', 'Sector Analysis'],
      reasoning: 'Based on current market data and economic indicators',
      follow_up_questions: [
        'Would you like more details about specific sectors?',
        'Are you interested in market trends and predictions?',
        'Would you like to understand the factors affecting market performance?'
      ],
      related_topics: ['Market Trends', 'Economic Analysis', 'Sector Performance'],
      is_fallback: false
    };
  }

  /**
   * Generate investment advice response
   */
  private async generateInvestmentAdviceResponse(content: string): Promise<AIResponse> {
    return {
      content: 'I can provide general information about investment strategies and market analysis. However, I must emphasize that this is not personalized investment advice. For specific investment decisions, please consult with a qualified financial advisor who can assess your individual circumstances, risk tolerance, and financial goals.',
      confidence_score: 0.9,
      sources: ['Investment Principles', 'Risk Management Guidelines'],
      reasoning: 'General investment education and risk disclosure',
      follow_up_questions: [
        'Would you like to learn about different investment strategies?',
        'Are you interested in understanding risk management?',
        'Would you like to explore various investment options?'
      ],
      related_topics: ['Investment Strategies', 'Risk Management', 'Financial Planning'],
      is_fallback: false
    };
  }

  /**
   * Generate general finance response
   */
  private async generateGeneralFinanceResponse(content: string): Promise<AIResponse> {
    return {
      content: 'I can help you understand various financial concepts and provide general information about personal finance, investing, and market dynamics. For specific financial advice, I recommend consulting with a qualified financial advisor who can provide personalized guidance based on your individual circumstances.',
      confidence_score: 0.9,
      sources: ['Financial Education Resources', 'Market Information'],
      reasoning: 'General financial education and guidance',
      follow_up_questions: [
        'What specific financial topic would you like to learn about?',
        'Are you interested in understanding investment principles?',
        'Would you like to explore financial planning strategies?'
      ],
      related_topics: ['Financial Education', 'Investment Principles', 'Financial Planning'],
      is_fallback: false
    };
  }

  /**
   * Generate general response
   */
  private async generateGeneralResponse(content: string): Promise<AIResponse> {
    return {
      content: 'I\'m here to help you with questions about the Jamaica Stock Exchange, market analysis, and financial topics. Feel free to ask about specific companies, market trends, or investment concepts. Remember to consult with a qualified financial advisor for personalized advice.',
      confidence_score: 0.9,
      sources: ['General Knowledge Base'],
      reasoning: 'General assistance and guidance',
      follow_up_questions: [
        'What would you like to know about the JSE?',
        'Are you interested in market analysis?',
        'Would you like to learn about specific companies?'
      ],
      related_topics: ['JSE Information', 'Market Analysis', 'Company Research'],
      is_fallback: false
    };
  }

  /**
   * Generate fallback response
   */
  private generateFallbackResponse(content: string): AIResponse {
    return {
      content: 'I apologize, but I\'m currently experiencing technical difficulties. I can provide general information about the Jamaica Stock Exchange and financial topics. For specific investment advice, please consult with a qualified financial advisor. You can also try rephrasing your question or asking about general market information.',
      confidence_score: 0.7,
      sources: ['Fallback Knowledge Base'],
      reasoning: 'Fallback response due to technical limitations',
      follow_up_questions: [
        'Would you like to try asking your question differently?',
        'Are you interested in general market information?',
        'Would you like to learn about JSE companies?'
      ],
      related_topics: ['General Information', 'Market Basics', 'Company Overview'],
      is_fallback: true,
      error_type: 'service_unavailable',
      fallback_type: 'general_response'
    };
  }

  /**
   * Get chat messages for session
   */
  async getChatMessages(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching chat messages:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  /**
   * Get chat analytics
   */
  async getChatAnalytics(userId?: string): Promise<ChatAnalytics> {
    try {
      let sessionsQuery = supabase.from('chat_sessions').select('*');
      let messagesQuery = supabase.from('chat_messages').select('*');

      if (userId) {
        sessionsQuery = sessionsQuery.eq('user_id', userId);
        messagesQuery = messagesQuery.eq('user_id', userId);
      }

      const { data: sessions, error: sessionsError } = await sessionsQuery;
      const { data: messages, error: messagesError } = await messagesQuery;

      if (sessionsError || messagesError) {
        console.error('Error fetching chat analytics:', sessionsError || messagesError);
        throw sessionsError || messagesError;
      }

      const totalSessions = sessions?.length || 0;
      const totalMessages = messages?.length || 0;
      const averageSessionLength = totalSessions > 0 ? totalMessages / totalSessions : 0;

      // Calculate other metrics
      const topics = messages?.map(m => m.content.split(' ').slice(0, 3).join(' ')) || [];
      const mostCommonTopics = topics.slice(0, 5);
      
      const userSatisfactionScore = 4.2; // Mock data
      const aiResponseAccuracy = 0.85; // Mock data
      const fallbackUsageRate = 0.15; // Mock data
      const popularQuestions = [
        'What is the current market performance?',
        'How is NCBFG performing?',
        'What are the top gainers today?',
        'What is the market sentiment?',
        'How can I start investing?'
      ];
      const responseTimeAverage = 2.5; // Mock data

      return {
        total_messages: totalMessages,
        total_sessions: totalSessions,
        average_session_length: Math.round(averageSessionLength),
        most_common_topics: mostCommonTopics,
        user_satisfaction_score: userSatisfactionScore,
        ai_response_accuracy: aiResponseAccuracy,
        fallback_usage_rate: fallbackUsageRate,
        popular_questions: popularQuestions,
        response_time_average: responseTimeAverage
      };
    } catch (error) {
      console.error('Error getting chat analytics:', error);
      throw error;
    }
  }

  /**
   * Search chat messages
   */
  async searchChatMessages(query: string, userId?: string): Promise<ChatMessage[]> {
    try {
      let searchQuery = supabase
        .from('chat_messages')
        .select('*')
        .ilike('content', `%${query}%`);

      if (userId) {
        searchQuery = searchQuery.eq('user_id', userId);
      }

      const { data, error } = await searchQuery
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching chat messages:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching chat messages:', error);
      throw error;
    }
  }
}

// Create singleton instance
const comprehensiveChatService = new ComprehensiveChatService();

export default comprehensiveChatService;

// Export convenience functions
export async function createChatSession(session: Omit<ChatSession, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  return await comprehensiveChatService.createChatSession(session);
}

export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
  return await comprehensiveChatService.getChatSession(sessionId);
}

export async function getUserChatSessions(userId: string, limit?: number): Promise<ChatSession[]> {
  return await comprehensiveChatService.getUserChatSessions(userId, limit);
}

export async function updateChatSession(sessionId: string, updates: Partial<ChatSession>): Promise<void> {
  return await comprehensiveChatService.updateChatSession(sessionId, updates);
}

export async function sendMessage(
  userId: string,
  content: string,
  sessionId?: string,
  context?: ChatContext
): Promise<{ message: ChatMessage; aiResponse: ChatMessage }> {
  return await comprehensiveChatService.sendMessage(userId, content, sessionId, context);
}

export async function getChatMessages(sessionId: string, limit?: number): Promise<ChatMessage[]> {
  return await comprehensiveChatService.getChatMessages(sessionId, limit);
}

export async function getChatAnalytics(userId?: string): Promise<ChatAnalytics> {
  return await comprehensiveChatService.getChatAnalytics(userId);
}

export async function searchChatMessages(query: string, userId?: string): Promise<ChatMessage[]> {
  return await comprehensiveChatService.searchChatMessages(query, userId);
}
