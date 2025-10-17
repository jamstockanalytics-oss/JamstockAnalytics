import { deepSeekChatService } from './ai-service';
import { supabase } from '../supabase/client';
import { sendMessage as sendComprehensiveMessage } from './comprehensive-chat-service';

export type ChatMessage = {
  id: string;
  type: "user" | "ai";
  content: string;
  created_at: string;
  suggestions?: string[];
  related_topics?: string[];
  session_id?: string;
  tokens_used?: number;
  response_time_ms?: number;
};

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

/**
 * Enhanced chat service with database persistence
 */
export class ChatService {
  private currentSessionId: string | null = null;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Initialize chat session
   */
  async initializeSession(sessionName?: string): Promise<ChatSession> {
    try {
      const session = await deepSeekChatService.createChatSession(this.userId, sessionName);
      this.currentSessionId = session.id;
      return session;
    } catch (error) {
      console.error('Error initializing chat session:', error);
      throw error;
    }
  }

  /**
   * Get or create active session
   */
  async getActiveSession(): Promise<ChatSession | null> {
    try {
      if (this.currentSessionId) {
        // Check if current session is still active
        const { data } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('id', this.currentSessionId)
          .eq('is_active', true)
          .single();
        
        if (data) return data;
      }

      // Get or create new session
      const session = await deepSeekChatService.getActiveChatSession(this.userId);
      if (session) {
        this.currentSessionId = session.id;
        return session;
      }

      return await this.initializeSession();
    } catch (error) {
      console.error('Error getting active session:', error);
      return null;
    }
  }

  /**
   * Send message with full database integration
   */
  async sendMessage(input: string, context?: string): Promise<ChatMessage[]> {
    try {
      // Ensure we have an active session
      const session = await this.getActiveSession();
      if (!session) {
        throw new Error('Unable to create or access chat session');
      }

      // Get chat history
      const history = await this.getChatHistory(session.id);
      
      // Create user message
      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        type: "user",
        content: input,
        created_at: new Date().toISOString(),
        session_id: session.id
      };

      // Send to DeepSeek with database persistence
      const aiResponse = await deepSeekChatService.sendChatMessage(
        this.userId,
        input,
        session.id,
        context
      );

      // Create AI message
      const aiMessage: ChatMessage = {
        id: `a-${Date.now() + 1}`,
        type: "ai",
        content: aiResponse.message,
        created_at: new Date().toISOString(),
        suggestions: aiResponse.suggestions,
        related_topics: aiResponse.related_topics,
        session_id: session.id
      };

      return [...history, userMessage, aiMessage];
    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback response
      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        type: "user",
        content: input,
        created_at: new Date().toISOString(),
      };

      const aiMessage: ChatMessage = {
        id: `a-${Date.now() + 1}`,
        type: "ai",
        content: "I'm currently processing your request. Please try again in a moment, or feel free to ask about Jamaican market trends, investment strategies, or financial planning.",
        created_at: new Date().toISOString(),
        suggestions: [
          'Ask about market trends',
          'Get investment advice',
          'Learn about risk management'
        ],
        related_topics: [
          'Jamaican Stock Exchange',
          'Investment Strategies',
          'Financial Planning'
        ],
      };

      return [userMessage, aiMessage];
    }
  }

  /**
   * Get chat history for current session
   */
  async getChatHistory(sessionId?: string): Promise<ChatMessage[]> {
    try {
      const targetSessionId = sessionId || this.currentSessionId;
      if (!targetSessionId) return [];

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', targetSessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(msg => ({
        id: msg.id,
        type: msg.message_type as "user" | "ai",
        content: msg.content,
        created_at: msg.created_at,
        session_id: msg.session_id,
        tokens_used: msg.tokens_used,
        response_time_ms: msg.response_time_ms
      }));
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  /**
   * Get user's chat sessions
   */
  async getUserSessions(): Promise<ChatSession[]> {
    try {
      return await deepSeekChatService.getUserChatSessions(this.userId);
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  /**
   * End current session
   */
  async endSession(): Promise<void> {
    try {
      if (this.currentSessionId) {
        await deepSeekChatService.endChatSession(this.currentSessionId);
        this.currentSessionId = null;
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  /**
   * Switch to a different session
   */
  async switchSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', this.userId)
        .single();

      if (error) throw error;
      
      this.currentSessionId = sessionId;
      return data;
    } catch (error) {
      console.error('Error switching session:', error);
      return null;
    }
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function sendMessage(history: ChatMessage[], input: string): Promise<ChatMessage[]> {
  try {
    // Use the comprehensive chat service for enhanced functionality
    const response = await sendComprehensiveMessage(
      'anonymous', // This should be passed as a parameter
      input,
      undefined, // sessionId
      undefined  // context
    );
    
    // Convert comprehensive response to legacy format
    const legacyResponse: ChatMessage[] = [
      ...history,
      {
        id: response.message.id,
        type: 'user',
        content: input,
        created_at: response.message.created_at,
        session_id: response.message.session_id || 'unknown'
      },
      {
        id: response.aiResponse.id,
        type: 'ai',
        content: response.aiResponse.content,
        created_at: response.aiResponse.created_at,
        session_id: response.aiResponse.session_id || 'unknown',
        suggestions: response.aiResponse.context_data?.sources || [],
        related_topics: [],
        ...(response.aiResponse.context_data?.tokens_used !== undefined && { tokens_used: response.aiResponse.context_data.tokens_used }),
        ...(response.aiResponse.metadata?.processing_time_ms !== undefined && { response_time_ms: response.aiResponse.metadata.processing_time_ms })
      }
    ];
    
    return legacyResponse;
  } catch (error) {
    console.error('Error sending message:', error);
    // Fallback to original service
    const chatService = new ChatService('anonymous');
    return chatService.sendMessage(input);
  }
}

// Keep the mock function for development/testing
export async function sendMessageMock(history: ChatMessage[], input: string): Promise<ChatMessage[]> {
  const user: ChatMessage = {
    id: `u-${Date.now()}`,
    type: "user",
    content: input,
    created_at: new Date().toISOString(),
  };
  const ai: ChatMessage = {
    id: `a-${Date.now() + 1}`,
    type: "ai",
    content: "This is a placeholder AI response. The AI service is being configured.",
    created_at: new Date().toISOString(),
  };
  return [...history, user, ai];
}


