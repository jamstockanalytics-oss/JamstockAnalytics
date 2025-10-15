import { ChatMessage } from './chat-service';
import { supabase } from '../supabase/client';

// AI Service Configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || '';

// Enhanced AI Service with Database Integration
export interface DeepSeekConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatSession {
  id: string;
  user_id: string;
  session_name?: string;
  is_active: boolean;
  started_at: string;
  ended_at?: string;
  total_messages: number;
  session_context: Record<string, any>;
}

export interface ChatMessageDB {
  id: string;
  user_id: string;
  session_id: string;
  message_type: 'user' | 'ai' | 'system';
  content: string;
  context_data: Record<string, any>;
  created_at: string;
  is_analysis_context: boolean;
  tokens_used: number;
  response_time_ms?: number;
}

export interface AIAnalysisResult {
  priority_score: number;
  summary: string;
  key_points: string[];
  market_impact: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  recommendations: string[];
}

export interface AIChatResponse {
  message: string;
  suggestions: string[];
  related_topics: string[];
}

/**
 * Analyze a news article using AI
 */
export async function analyzeNewsArticle(
  headline: string,
  content: string,
  publication_date: string
): Promise<AIAnalysisResult> {
  try {
    const prompt = `
You are a financial analyst AI specializing in Jamaican and Caribbean markets. 
Analyze this news article and provide a structured analysis:

Headline: ${headline}
Content: ${content}
Date: ${publication_date}

Please provide:
1. Priority score (1-10, where 10 is highest priority for investors)
2. A concise summary (2-3 sentences)
3. Key points (3-5 bullet points)
4. Market impact assessment (high/medium/low)
5. Sentiment analysis (positive/negative/neutral)
6. Investment recommendations (2-3 actionable insights)

Respond in JSON format:
{
  "priority_score": number,
  "summary": "string",
  "key_points": ["string"],
  "market_impact": "high|medium|low",
  "sentiment": "positive|negative|neutral",
  "recommendations": ["string"]
}
`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst AI specializing in Caribbean and Jamaican markets. Provide accurate, data-driven analysis in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No AI response received');
    }

    // Parse JSON response
    const analysis = JSON.parse(aiResponse);
    return analysis as AIAnalysisResult;

  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Fallback analysis for development
    return {
      priority_score: Math.floor(Math.random() * 5) + 6, // 6-10
      summary: `AI analysis of: ${headline}`,
      key_points: [
        'Market impact assessment pending',
        'Sentiment analysis in progress',
        'Recommendations being generated'
      ],
      market_impact: 'medium' as const,
      sentiment: 'neutral' as const,
      recommendations: [
        'Monitor market developments',
        'Consider portfolio diversification',
        'Stay informed on related news'
      ]
    };
  }
}

/**
 * Enhanced chat service with database persistence
 */
export class DeepSeekChatService {
  private config: DeepSeekConfig;

  constructor(config?: Partial<DeepSeekConfig>) {
    this.config = {
      model: 'deepseek-chat',
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 0.9,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      ...config
    };
  }

  /**
   * Create a new chat session
   */
  async createChatSession(userId: string, sessionName?: string): Promise<ChatSession> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          session_name: sessionName,
          is_active: true,
          total_messages: 0,
          session_context: {}
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  /**
   * Get active chat session for user
   */
  async getActiveChatSession(userId: string): Promise<ChatSession | null> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting active chat session:', error);
      return null;
    }
  }

  /**
   * Get chat history for a session
   */
  async getChatHistory(sessionId: string, limit: number = 50): Promise<ChatMessageDB[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  /**
   * Send a chat message with database persistence
   */
  async sendChatMessage(
    userId: string,
    message: string,
    sessionId?: string,
    context?: string
  ): Promise<AIChatResponse> {
    const startTime = Date.now();
    let currentSessionId = sessionId;

    try {
      // Get or create session
      if (!currentSessionId) {
        const activeSession = await this.getActiveChatSession(userId);
        if (activeSession) {
          currentSessionId = activeSession.id;
        } else {
          const newSession = await this.createChatSession(userId);
          currentSessionId = newSession.id;
        }
      }

      // Get recent chat history for context
      const chatHistory = await this.getChatHistory(currentSessionId, 10);
      const recentMessages = chatHistory.slice(-6); // Last 6 messages for context

      // Save user message
      const userMessage: Omit<ChatMessageDB, 'id' | 'created_at'> = {
        user_id: userId,
        session_id: currentSessionId,
        message_type: 'user',
        content: message,
        context_data: { context },
        is_analysis_context: false,
        tokens_used: 0
      };

      const { data: savedUserMessage, error: userError } = await supabase
        .from('chat_messages')
        .insert(userMessage)
        .select()
        .single();

      if (userError) throw userError;

      // Prepare conversation history for AI
      const conversationHistory = recentMessages.map(msg => ({
        role: msg.message_type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Add current user message
      conversationHistory.push({
        role: 'user',
        content: message
      });

      // Enhanced system prompt
      const systemPrompt = `You are a financial advisor AI specializing in Jamaican and Caribbean markets. 
      You have access to real-time market data and news analysis. 
      Provide helpful, accurate financial advice and market insights. 
      Be conversational but professional. If asked about specific investments, 
      always recommend consulting with a licensed financial advisor.
      
      Context: ${context || 'General financial discussion'}`;

      // Call DeepSeek API
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.max_tokens,
          top_p: this.config.top_p,
          frequency_penalty: this.config.frequency_penalty,
          presence_penalty: this.config.presence_penalty,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0]?.message?.content;
      const tokensUsed = data.usage?.total_tokens || 0;
      const responseTime = Date.now() - startTime;
      
      if (!aiMessage) {
        throw new Error('No AI response received');
      }

      // Save AI response
      const aiMessageData: Omit<ChatMessageDB, 'id' | 'created_at'> = {
        user_id: userId,
        session_id: currentSessionId,
        message_type: 'ai',
        content: aiMessage,
        context_data: { 
          model: this.config.model,
          temperature: this.config.temperature,
          tokens_used: tokensUsed
        },
        is_analysis_context: false,
        tokens_used: tokensUsed,
        response_time_ms: responseTime
      };

      const { error: aiError } = await supabase
        .from('chat_messages')
        .insert(aiMessageData);

      if (aiError) throw aiError;

      // Update session message count
      await supabase
        .from('chat_sessions')
        .update({ 
          total_messages: supabase.raw('total_messages + 2'),
          session_context: { 
            last_activity: new Date().toISOString(),
            total_tokens: supabase.raw('COALESCE(session_context->>\'total_tokens\', \'0\')::int + ' + tokensUsed)
          }
        })
        .eq('id', currentSessionId);

      return {
        message: aiMessage,
        suggestions: [
          'Tell me more about market trends',
          'What should I know about Jamaican stocks?',
          'How do I start investing?',
          'Analyze recent news for me'
        ],
        related_topics: [
          'Jamaican Stock Exchange',
          'Caribbean Markets',
          'Investment Strategies',
          'Market Analysis'
        ]
      };

    } catch (error) {
      console.error('AI chat error:', error);
      
      // Fallback response
      return {
        message: "I'm currently processing your request. As a financial AI assistant, I can help you understand market trends, analyze news, and provide general investment guidance. What would you like to know about Jamaican or Caribbean markets?",
        suggestions: [
          'Explain market analysis',
          'Investment basics',
          'Risk management',
          'Market trends'
        ],
        related_topics: [
          'Financial Planning',
          'Market Research',
          'Investment Education',
          'Jamaican Markets'
        ]
      };
    }
  }

  /**
   * End a chat session
   */
  async endChatSession(sessionId: string): Promise<void> {
    try {
      await supabase
        .from('chat_sessions')
        .update({ 
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error ending chat session:', error);
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
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user chat sessions:', error);
      return [];
    }
  }
}

// Create default instance
export const deepSeekChatService = new DeepSeekChatService();

/**
 * Legacy function for backward compatibility
 */
export async function sendChatMessage(
  message: string,
  context?: string
): Promise<AIChatResponse> {
  // This is a simplified version for backward compatibility
  // In a real app, you'd need to pass userId and handle sessions properly
  return deepSeekChatService.sendChatMessage('anonymous', message, undefined, context);
}

/**
 * Generate AI-powered news summary
 */
export async function generateNewsSummary(content: string): Promise<string> {
  try {
    const prompt = `Summarize this financial news article in 2-3 sentences, focusing on key market implications for Jamaican investors:

${content}`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Summary generation in progress...';

  } catch (error) {
    console.error('AI summary error:', error);
    return 'AI summary will be available shortly. This article contains important market information.';
  }
}

/**
 * Get AI-powered market insights
 */
export async function getMarketInsights(): Promise<string> {
  try {
    const prompt = `Provide a brief market insight for Jamaican investors today. Focus on:
    - Current market conditions
    - Key sectors to watch
    - General investment advice
    Keep it concise and actionable.`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Market insights are being updated...';

  } catch (error) {
    console.error('AI insights error:', error);
    return 'Market insights are being updated. Stay informed about current market conditions and consider your investment goals.';
  }
}
