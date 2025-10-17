import { supabase } from '../supabase/client';
import { FallbackResponseService } from './fallback-responses';

// Enhanced AI Service Configuration
// Removed unused AI_CONFIG constant

/**
 * Generate fallback news analysis when AI API is unavailable
 */
function generateFallbackNewsAnalysis(
  headline: string,
  content: string,
  publication_date: string
): AIAnalysisResult {
  // Simple keyword-based analysis for fallback
  const text = (headline + ' ' + content).toLowerCase();
  
  // Determine priority score based on keywords
  let priorityScore = 5; // Default medium priority
  
  if (text.includes('bank of jamaica') || text.includes('boj') || text.includes('interest rate')) {
    priorityScore = 8;
  } else if (text.includes('jse') || text.includes('jamaica stock exchange') || text.includes('trading')) {
    priorityScore = 7;
  } else if (text.includes('earnings') || text.includes('quarterly') || text.includes('revenue')) {
    priorityScore = 6;
  }
  
  // Determine sentiment
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  const positiveWords = ['growth', 'increase', 'profit', 'success', 'positive', 'strong'];
  const negativeWords = ['decline', 'loss', 'decrease', 'negative', 'weak', 'concern'];
  
  if (positiveWords.some(word => text.includes(word))) {
    sentiment = 'positive';
  } else if (negativeWords.some(word => text.includes(word))) {
    sentiment = 'negative';
  }
  
  // Determine market impact
  let marketImpact: 'high' | 'medium' | 'low' = 'medium';
  if (priorityScore >= 7) {
    marketImpact = 'high';
  } else if (priorityScore <= 4) {
    marketImpact = 'low';
  }
  
  // Generate summary
  const summary = `This article discusses ${headline}. While AI analysis is temporarily unavailable, this appears to be relevant financial news that may impact Jamaican markets.`;
  
  // Generate key points
  const keyPoints = [
    'Article published on ' + new Date(publication_date).toLocaleDateString(),
    'Content appears to be financial or market-related',
    'May have implications for Jamaican investment landscape',
    'Recommend reviewing with financial advisor for investment decisions'
  ];
  
  // Generate recommendations
  const recommendations = [
    'Monitor market reaction to this news',
    'Consider consulting with a financial advisor',
    'Review related company performance if applicable'
  ];
  
  return {
    priority_score: priorityScore,
    summary,
    key_points: keyPoints,
    market_impact: marketImpact,
    sentiment,
    recommendations
  };
}

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
 * Enhanced AI Priority Engine
 * Analyzes articles and assigns priority scores based on multiple factors
 */
export async function calculateAIPriorityScore(
  headline: string,
  content: string,
  companyTickers: string[] = [],
  publicationDate: string
): Promise<number> {
  const prompt = `
You are an expert financial analyst specializing in Jamaican markets. Analyze this news article and calculate a priority score (1-10) based on:

1. Market Impact (30%): How significant is this news for JSE/Junior market?
2. Company Importance (25%): Market cap, sector influence, investor interest
3. Financial Metrics (20%): Mentions of earnings, revenue, profit, growth
4. Sentiment Analysis (15%): Positive/negative impact on market confidence
5. Uniqueness (10%): How novel or breaking is this news?

Article Details:
- Headline: ${headline}
- Content: ${content.substring(0, 1000)}...
- Company Tickers: ${companyTickers.join(', ')}
- Publication Date: ${publicationDate}

JSE Companies to prioritize:
- NCBFG (NCB Financial Group) - Banking leader
- SGJ (Sagicor Group Jamaica) - Insurance leader  
- GHL (Guardian Holdings) - Insurance
- JSE:GK, JSE:JBG, JSE:SEP, JSE:CAR - Major manufacturing
- DTL (Derrimon Trading) - Distribution
- LASF, LASM, LASD - Lasco Group companies
- MIL (Mayberry Investments) - Financial services

Respond with ONLY a number from 1-10 (no explanation needed):
`;

  try {
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
            content: 'You are a financial analyst. Respond with ONLY a number from 1-10 for priority scoring.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const scoreText = data.choices[0]?.message?.content?.trim();
    
    if (!scoreText) {
      throw new Error('No priority score received from AI');
    }

    const score = parseFloat(scoreText);
    return Math.min(Math.max(score || 5, 1), 10); // Ensure score is between 1-10

  } catch (error) {
    console.warn('AI Priority Engine Error:', error instanceof Error ? error.message : String(error));
    
    // Fallback priority calculation
    return calculateFallbackPriorityScore(headline, content, companyTickers);
  }
}

/**
 * Fallback priority score calculation when AI is unavailable
 */
function calculateFallbackPriorityScore(
  headline: string, 
  content: string, 
  companyTickers: string[]
): number {
  const text = (headline + ' ' + content).toLowerCase();
  let score = 5; // Base score

  // High priority indicators
  if (text.includes('bank of jamaica') || text.includes('boj')) score += 3;
  if (text.includes('interest rate') || text.includes('monetary policy')) score += 2;
  if (text.includes('earnings') || text.includes('quarterly results')) score += 2;
  if (text.includes('merger') || text.includes('acquisition')) score += 2;
  
  // Company importance
  const importantCompanies = ['ncbfg', 'sgj', 'ghl', 'dtl'];
  const hasImportantCompany = companyTickers.some(ticker => 
    importantCompanies.some(company => ticker.toLowerCase().includes(company))
  );
  if (hasImportantCompany) score += 1;

  // Market indicators
  if (text.includes('jse') || text.includes('jamaica stock exchange')) score += 1;
  if (text.includes('trading') || text.includes('market')) score += 1;

  return Math.min(Math.max(score, 1), 10);
}

/**
 * AI Summarization Engine
 * Generates concise summaries for article cards
 */
export async function generateArticleSummary(
  headline: string,
  content: string,
  maxLength: number = 150
): Promise<string> {
  const prompt = `
Summarize this financial news article for Jamaican investors in ${maxLength} characters or less:

Headline: ${headline}
Content: ${content.substring(0, 2000)}...

Focus on:
- Key financial impact
- Market relevance
- Investment implications
- Company significance

Make it concise, informative, and investor-focused.
`;

  try {
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
            content: `You are a financial journalist. Create concise summaries under ${maxLength} characters.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content?.trim();
    
    if (!summary) {
      throw new Error('No summary received from AI');
    }

    // Truncate if too long
    return summary.length > maxLength ? summary.substring(0, maxLength - 3) + '...' : summary;

  } catch (error) {
    console.warn('AI Summarization Error:', error instanceof Error ? error.message : String(error));
    
    // Fallback summary
    return generateFallbackSummary(headline, content, maxLength);
  }
}

/**
 * Fallback summary generation
 */
function generateFallbackSummary(headline: string, content: string, _maxLength: number): string {
  const text = (headline + ' ' + content).toLowerCase();
  
  if (text.includes('earnings') || text.includes('revenue')) {
    return 'Financial performance update with potential market impact.';
  } else if (text.includes('boj') || text.includes('bank of jamaica')) {
    return 'Central bank announcement affecting monetary policy and interest rates.';
  } else if (text.includes('merger') || text.includes('acquisition')) {
    return 'Corporate action that may impact stock valuation and market dynamics.';
  } else {
    return 'Important financial news relevant to Jamaican market participants.';
  }
}

/**
 * Enhanced Chat AI with Jamaica-focused financial expertise
 */
export async function generateChatResponse(
  userMessage: string,
  context: string = '',
  conversationHistory: any[] = []
): Promise<AIChatResponse> {
  const jamaicaContext = `
You are a Jamaica-focused financial analyst AI assistant for JamStockAnalytics. You specialize in:

JAMAICAN MARKET EXPERTISE:
- Jamaica Stock Exchange (JSE) and Junior Market
- Major JSE companies: NCBFG, SGJ, GHL, GK, JBG, SEP, CAR, DTL, LASF, MIL
- Bank of Jamaica (BOJ) monetary policy
- Jamaican economic indicators and trends
- Caribbean financial markets

RESPONSE GUIDELINES:
1. Always provide Jamaica-specific insights when relevant
2. Reference actual JSE companies and market conditions
3. Suggest consulting with licensed financial advisors
4. Include appropriate risk warnings
5. Be helpful but never provide specific investment advice
6. Focus on education and market understanding

Current Context: ${context}
`;

  const prompt = `
${jamaicaContext}

User Question: ${userMessage}

Provide a helpful, educational response with:
1. Direct answer to the question
2. Relevant Jamaican market context
3. 3 actionable suggestions
4. Related topics for further learning

Format your response as helpful financial education, not investment advice.
`;

  try {
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
            content: jamaicaContext
          },
          ...conversationHistory.slice(-6), // Last 6 messages for context
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices[0]?.message?.content;
    
    if (!message) {
      throw new Error('No response received from AI');
    }

    // Generate suggestions based on the response
    const suggestions = generateChatSuggestions(userMessage, message);
    const relatedTopics = generateRelatedTopics(userMessage);

    return {
      message,
      suggestions,
      related_topics: relatedTopics
    };

  } catch (error) {
    console.warn('Enhanced Chat AI Error:', error instanceof Error ? error.message : String(error));
    
    // Use fallback response service
    const fallbackResponse = FallbackResponseService.generateFallbackResponse(userMessage, 'general_error');
    
    return {
      message: fallbackResponse.content,
      suggestions: fallbackResponse.suggestions,
      related_topics: []
    };
  }
}

/**
 * Generate contextual chat suggestions
 */
function generateChatSuggestions(userMessage: string, _aiResponse: string): string[] {
  const suggestions: string[] = [];
  const message = userMessage.toLowerCase();

  if (message.includes('ncbfg') || message.includes('ncb')) {
    suggestions.push('Tell me about NCB Financial Group\'s recent performance');
    suggestions.push('How does NCB compare to other JSE banks?');
    suggestions.push('What are NCB\'s growth prospects?');
  } else if (message.includes('market') || message.includes('jse')) {
    suggestions.push('Show me today\'s JSE market summary');
    suggestions.push('What are the top performing JSE stocks?');
    suggestions.push('Explain JSE market trends');
  } else if (message.includes('investment') || message.includes('invest')) {
    suggestions.push('What are the risks of JSE investing?');
    suggestions.push('How do I start investing in Jamaican stocks?');
    suggestions.push('What should I know about JSE regulations?');
  } else if (message.includes('earnings') || message.includes('financial')) {
    suggestions.push('Show me recent JSE earnings reports');
    suggestions.push('Which companies reported strong earnings?');
    suggestions.push('How do I analyze JSE company financials?');
  } else {
    suggestions.push('Tell me about JSE market opportunities');
    suggestions.push('What are the major JSE sectors?');
    suggestions.push('How does the Jamaican economy affect JSE?');
  }

  return suggestions.slice(0, 3);
}

/**
 * Generate related topics for learning
 */
function generateRelatedTopics(userMessage: string): string[] {
  const topics: string[] = [];
  const message = userMessage.toLowerCase();

  if (message.includes('bank') || message.includes('financial')) {
    topics.push('Banking Sector Analysis', 'Financial Services', 'Central Bank Policy');
  } else if (message.includes('stock') || message.includes('share')) {
    topics.push('Stock Market Basics', 'Investment Strategies', 'Risk Management');
  } else if (message.includes('economy') || message.includes('economic')) {
    topics.push('Jamaican Economy', 'Economic Indicators', 'Monetary Policy');
  } else {
    topics.push('JSE Market Overview', 'Investment Education', 'Market Analysis');
  }

  return topics.slice(0, 3);
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
    // Use the new AI priority engine
    const priorityScore = await calculateAIPriorityScore(headline, content, [], publication_date);
    
    // Use the new AI summarization engine
    const summary = await generateArticleSummary(headline, content, 200);
    
    // Get additional analysis from AI
    const prompt = `
You are a financial analyst AI specializing in Jamaican and Caribbean markets. 
Analyze this news article and provide additional insights:

Headline: ${headline}
Content: ${content}
Date: ${publication_date}
Priority Score: ${priorityScore} (already calculated)
Summary: ${summary} (already generated)

Please provide:
1. Key points (3-5 bullet points)
2. Market impact assessment (high/medium/low)
3. Sentiment analysis (positive/negative/neutral)
4. Investment recommendations (2-3 actionable insights)

Respond in JSON format:
{
  "key_points": ["string"],
  "market_impact": "high|medium|low",
  "sentiment": "positive|negative|neutral",
  "recommendations": ["string"]
}
`;

    try {
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
          max_tokens: 800,
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

      // Parse JSON response and combine with our AI-generated data
      const analysis = JSON.parse(aiResponse);
      return {
        priority_score: priorityScore,
        summary: summary,
        key_points: analysis.key_points || ['Market analysis in progress'],
        market_impact: analysis.market_impact || 'medium',
        sentiment: analysis.sentiment || 'neutral',
        recommendations: analysis.recommendations || ['Monitor market developments']
      } as AIAnalysisResult;

    } catch (apiError) {
      console.warn('AI API Error in news analysis:', apiError instanceof Error ? apiError.message : String(apiError));
      
      // Return enhanced analysis with our AI-generated priority and summary
      return {
        priority_score: priorityScore,
        summary: summary,
        key_points: ['AI analysis in progress', 'Content relevance being assessed'],
        market_impact: 'medium' as const,
        sentiment: 'neutral' as const,
        recommendations: ['Monitor market developments', 'Consider professional advice']
      };
    }

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
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private rateLimitDelay = 1000; // 1 second between requests
  // Removed unused retry properties

  constructor(config?: Partial<DeepSeekConfig>) {
    this.config = {
      model: 'deepseek-chat',
      temperature: 0.7,
      max_tokens: 2000, // Increased for better responses
      top_p: 0.9,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      ...config
    };
  }


  /**
   * Process the API call queue with rate limiting
   */
  private async _processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const apiCall = this.requestQueue.shift();
      if (apiCall) {
        try {
          await apiCall();
        } catch (error) {
          console.error('Queued API call failed:', error);
        }
      }

      if (this.requestQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
      }
    }

    this.isProcessingQueue = false;
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
   * Send a chat message with database persistence using enhanced AI
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

      const { error: userError } = await supabase
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

      // Enhanced system prompt with JSE-specific knowledge (for reference)
      const _systemPrompt = `You are a specialized financial analyst AI for the Jamaica Stock Exchange (JSE) and Caribbean markets. Your expertise includes:

**JSE Market Knowledge:**
- Major JSE companies: NCB Financial Group, Sagicor Group, Guardian Holdings, GraceKennedy, etc.
- JSE sectors: Banking, Insurance, Manufacturing, Distribution, Tourism, etc.
- Market dynamics and trading patterns specific to Jamaica
- Regulatory environment and BOJ policies

**Caribbean Economic Context:**
- Regional economic factors affecting Jamaica
- Tourism industry impacts
- Remittance flows and their market effects
- Regional trade relationships

**Investment Guidance:**
- Provide educational analysis, not personalized advice
- Always recommend consulting licensed financial advisors
- Explain risks and market volatility
- Focus on long-term investment principles

**Response Guidelines:**
- Be conversational but professional
- Use specific JSE company names and tickers when relevant
- Explain complex financial concepts clearly
- Provide context for market movements
- Include relevant risk warnings

Context: ${context || 'General JSE market discussion'}`;

      // Use enhanced chat AI with Jamaica-focused expertise
      let aiResponse: AIChatResponse;
      let tokensUsed = 0;
      let isFallback = false;

      try {
        // Use the new enhanced chat AI
        aiResponse = await generateChatResponse(message, context, conversationHistory);
        tokensUsed = 100; // Estimate for tracking

      } catch (apiError) {
        console.warn('Enhanced Chat AI Error:', apiError instanceof Error ? apiError.message : String(apiError));
        // Generate intelligent fallback response
        const fallbackResponse = FallbackResponseService.generateFallbackResponse(message, 'general_error');
        aiResponse = {
          message: fallbackResponse.content,
          suggestions: fallbackResponse.suggestions,
          related_topics: []
        };
        isFallback = true;
        tokensUsed = 0; // No tokens used for fallback
      }

      const responseTime = Date.now() - startTime;

      // Save AI response
      const aiMessageData: Omit<ChatMessageDB, 'id' | 'created_at'> = {
        user_id: userId,
        session_id: currentSessionId,
        message_type: 'ai',
        content: aiResponse.message,
        context_data: { 
          model: this.config.model,
          temperature: this.config.temperature,
          tokens_used: tokensUsed,
          is_fallback: isFallback,
          suggestions: aiResponse.suggestions,
          related_topics: aiResponse.related_topics
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
      const { data: currentSession } = await supabase
        .from('chat_sessions')
        .select('total_messages, session_context')
        .eq('id', currentSessionId)
        .single();

      await supabase
        .from('chat_sessions')
        .update({ 
          total_messages: (currentSession?.total_messages || 0) + 2,
          session_context: { 
            last_activity: new Date().toISOString(),
            total_tokens: (currentSession?.session_context?.total_tokens || 0) + tokensUsed
          }
        })
        .eq('id', currentSessionId);

      // Return the enhanced AI response with suggestions and related topics
      return aiResponse;

    } catch (error) {
      console.error('AI chat error:', error);
      
      // Use intelligent fallback response for general errors
      const fallbackResponse = FallbackResponseService.generateFallbackResponse(message, 'general_error');
      
      return {
        message: fallbackResponse.content,
        suggestions: fallbackResponse.suggestions,
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
